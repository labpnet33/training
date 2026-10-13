var e={id:`fault-catalogue`,h:{en:`Troubleshooting workflow and the common-fault catalogue`,hi:`Troubleshooting workflow aur common-fault catalogue`},body:{en:`
<p>A doctor who has seen a thousand patients recognises patterns. You can borrow that experience: this chapter is a catalogue of the faults that the whole CCNP Wireless track produces, arranged by symptom, with the evidence to look for and the smallest fix. Use it as the "differential diagnosis" after the triage steps of chapter 4.</p>
<h3>The workflow as a decision tree</h3>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Symptom tree">
<rect x="240" y="8" width="160" height="32" rx="6" fill="#bae6fd"/><text x="320" y="29" text-anchor="middle" class="svg-ink" font-size="13">Where does it stop?</text>
<rect x="8" y="80" width="140" height="48" rx="6" fill="#ddd6fe"/><text x="78" y="102" text-anchor="middle" class="svg-ink" font-size="12">AP not registered</text><text x="78" y="118" text-anchor="middle" class="svg-muted" font-size="11">port, DHCP, 43, trunk</text>
<rect x="165" y="80" width="140" height="48" rx="6" fill="#bbf7d0"/><text x="235" y="102" text-anchor="middle" class="svg-ink" font-size="12">SSID not seen</text><text x="235" y="118" text-anchor="middle" class="svg-muted" font-size="11">tag, profile, radio</text>
<rect x="322" y="80" width="140" height="48" rx="6" fill="#fde68a"/><text x="392" y="102" text-anchor="middle" class="svg-ink" font-size="12">Seen, cannot join</text><text x="392" y="118" text-anchor="middle" class="svg-muted" font-size="11">key, RADIUS, AKM</text>
<rect x="479" y="80" width="150" height="48" rx="6" fill="#fed7aa"/><text x="554" y="102" text-anchor="middle" class="svg-ink" font-size="12">Joined, no IP or access</text><text x="554" y="118" text-anchor="middle" class="svg-muted" font-size="11">VLAN, DHCP, ACL</text>
<line x1="320" y1="40" x2="78" y2="80" stroke="#64748b"/><line x1="320" y1="40" x2="235" y2="80" stroke="#64748b"/><line x1="320" y1="40" x2="392" y2="80" stroke="#64748b"/><line x1="320" y1="40" x2="554" y2="80" stroke="#64748b"/>
<text x="320" y="170" text-anchor="middle" class="svg-ink" font-size="13">Pick the branch, run its show commands, make one change, prove it.</text>
</svg><p class="cap">Four branches cover most wireless tickets.</p></div>
<h3>Branch A: AP not registered</h3>
<table class="cmp"><tr><th>Evidence</th><th>Cause</th><th>Fix</th></tr>
<tr><td>AP absent, switch port in default VLAN</td><td>Access VLAN not set</td><td><code>switchport access vlan 10</code> on SW1</td></tr>
<tr><td>AP has IP, stays Discovery</td><td>Option 43 missing or wrong in AP-POOL</td><td>R1 <code>option 43 hex f104.0a0a.630a</code></td></tr>
<tr><td>All APs lost after switch clean-up; WLC1 cannot ping 10.10.99.1</td><td>VLAN 99 removed from trunk to WLC1</td><td><code>switchport trunk allowed vlan add 99</code> on Gi0/1</td></tr>
<tr><td>Log: AP_LOST with reason</td><td>Path loss or reload</td><td>Read the reason text first</td></tr>
</table>
<h3>Branch B: SSID not seen</h3>
<table class="cmp"><tr><th>Evidence</th><th>Cause</th><th>Fix</th></tr>
<tr><td>Tag Source Default</td><td>AP has no policy tag</td><td><code>ap name AP2 policy-tag PT-CAMPUS</code></td></tr>
<tr><td>Tag detail lacks the WLAN</td><td>Map missing</td><td><code>wlan NK-VOICE policy PP-VOICE</code></td></tr>
<tr><td>Policy profile DISABLED</td><td>Never enabled</td><td><code>no shutdown</code></td></tr>
<tr><td>CC column does not match controller list</td><td>AP profile country wrong (radios off)</td><td><code>country IN</code> in the AP profile; keep the regulatory list as is</td></tr>
<tr><td>5 GHz summary Disabled for both APs</td><td>RF profile shut down</td><td><code>no shutdown</code> in the RF profile</td></tr>
<tr><td>Both APs same 2.4 GHz channel, slow</td><td>Co-channel overlap</td><td>Channels 1 and 6 on neighbours</td></tr>
</table>
<h3>Branch C: seen but cannot join</h3>
<table class="cmp"><tr><th>Evidence</th><th>Cause</th><th>Fix</th></tr>
<tr><td>PSK client rejected</td><td>Wrong or rotated passphrase</td><td>Confirm key; rotate only with WLAN shut</td></tr>
<tr><td>SERVER_TIMEOUT, timeouts rising</td><td>Shared secret, address or port mismatch</td><td><code>radius server RAD1</code> then <code>key 0 NkRadius1</code></td></tr>
<tr><td>AUTH_REJECT</td><td>User or policy rejected on server</td><td>Check account on RAD1</td></tr>
<tr><td>NO_SERVER</td><td>No server in the method list or group</td><td>Check list, group and server name</td></tr>
</table>
<h3>Branch D: joined but no IP or no access</h3>
<table class="cmp"><tr><th>Evidence</th><th>Cause</th><th>Fix</th></tr>
<tr><td>Policy VLAN NOT IN VLAN DATABASE</td><td>VLAN not created on WLC</td><td><code>vlan 20</code> then <code>name STAFF</code></td></tr>
<tr><td>Different subnet after roaming to AP2</td><td>AP2 uses a different policy tag or profile</td><td>Same policy tag on both APs</td></tr>
<tr><td>Guest reaches servers</td><td>ACL missing on R1</td><td>GUEST-IN denies server and staff ranges</td></tr>
<tr><td>Client has IP, cannot ping gateway</td><td>Trunk or routing issue</td><td>show interfaces trunk, show ip interface brief</td></tr>
</table>
<h3>Reading logs for causes</h3>
<p>Search the log for the client MAC or the AP name, then read upward for the first abnormal line. Pair the mnemonic with the layer: <code>CAPWAP</code> messages point to the AP layer, <code>DOT1X</code> to AAA, and a client association failure that mentions the policy profile or VLAN points to the WLC layer. If the log is silent, the failure is probably before the controller saw the client, so it is an RF or client-layer problem.</p>
<div class="eg"><p><b>Worked example.</b> 5 GHz-only handset finds no network; 2.4 GHz laptops are fine. The AP summary shows 5 GHz radios Disabled and the RF profile summary shows CAMPUS-5 shut. The WLAN and policy are fine, so the single fix is <code>ap dot11 5ghz rf-profile CAMPUS-5</code> followed by <code>no shutdown</code>. We did not touch the WLAN: that follows from the evidence.</p></div>
<div class="warn"><p><b>Common mistakes.</b> (1) Pattern-matching a symptom to a favourite cause and skipping evidence. (2) Fixing the regulatory country list when the AP profile is wrong; the business country list is policy, the AP profile is the usual drift. (3) Ignoring the combination of symptoms: "timeouts and disabled profile" can both be present.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Radios off after a site tag rollout" is a country mismatch until proven otherwise. "AP lost after switch clean-up" is the trunk allowed list.</p></div>
<div class="scn"><h4>One catalogue, four tickets</h4><p>On one busy morning four tickets arrived: no SSID near AP2, handsets without 5 GHz, laptops with no IP, and a corporate login failure. Using the catalogue, the engineer assigned each ticket to a branch in a minute: tag, RF profile, VLAN database, RADIUS secret. Each took one command. The team's runbook now holds this table verbatim.</p><p><b>Lesson:</b> a runbook built from past incidents turns hours into minutes.</p></div>
<div class="iv"><p class="q">"Give me the top five wireless faults you have seen and how you found each."</p><p>Missing or default policy tag (show ap tag summary), disabled policy profile (policy detail), missing VLAN in database (policy detail and log), RADIUS secret mismatch (show aaa servers timeouts and log), AP country mismatch (show ap summary CC column). Mention the single-change fix for each.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Four branches: AP not registered, SSID not seen, cannot join, no IP or access.</li>
<li>Each fault has one piece of evidence and one smallest fix.</li>
<li>Timeout versus reject separates AAA reachability from user denial.</li>
<li>Correct the AP profile country, not the regulatory list.</li>
<li>Write your own runbook from every incident.</li>
</ul></div>
`,hi:`
<p>Jis doctor ne hazaar patients dekhe hon woh patterns pehchanta hai. Aap uska experience udhaar le sakte ho: yeh chapter un faults ka catalogue hai jo poora CCNP Wireless track banata hai, symptom ke hisaab se arrange, evidence ke saath jo dhundhna hai aur sabse chhote fix ke saath. Chapter 4 ke triage steps ke baad ise "differential diagnosis" ki tarah use karo.</p>
<h3>Workflow decision tree ki tarah</h3>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Symptom tree">
<rect x="240" y="8" width="160" height="32" rx="6" fill="#bae6fd"/><text x="320" y="29" text-anchor="middle" class="svg-ink" font-size="13">Kahan ruka?</text>
<rect x="8" y="80" width="140" height="48" rx="6" fill="#ddd6fe"/><text x="78" y="102" text-anchor="middle" class="svg-ink" font-size="12">AP registered nahi</text><text x="78" y="118" text-anchor="middle" class="svg-muted" font-size="11">port, DHCP, 43, trunk</text>
<rect x="165" y="80" width="140" height="48" rx="6" fill="#bbf7d0"/><text x="235" y="102" text-anchor="middle" class="svg-ink" font-size="12">SSID nahi dikhta</text><text x="235" y="118" text-anchor="middle" class="svg-muted" font-size="11">tag, profile, radio</text>
<rect x="322" y="80" width="140" height="48" rx="6" fill="#fde68a"/><text x="392" y="102" text-anchor="middle" class="svg-ink" font-size="12">Dikhta, join nahi</text><text x="392" y="118" text-anchor="middle" class="svg-muted" font-size="11">key, RADIUS, AKM</text>
<rect x="479" y="80" width="150" height="48" rx="6" fill="#fed7aa"/><text x="554" y="102" text-anchor="middle" class="svg-ink" font-size="12">Join, IP ya access nahi</text><text x="554" y="118" text-anchor="middle" class="svg-muted" font-size="11">VLAN, DHCP, ACL</text>
<line x1="320" y1="40" x2="78" y2="80" stroke="#64748b"/><line x1="320" y1="40" x2="235" y2="80" stroke="#64748b"/><line x1="320" y1="40" x2="392" y2="80" stroke="#64748b"/><line x1="320" y1="40" x2="554" y2="80" stroke="#64748b"/>
<text x="320" y="170" text-anchor="middle" class="svg-ink" font-size="13">Branch chuno, uske show commands chalao, ek change karo, prove karo.</text>
</svg><p class="cap">Chaar branches zyadatar wireless tickets cover karti hain.</p></div>
<h3>Branch A: AP registered nahi</h3>
<table class="cmp"><tr><th>Evidence</th><th>Cause</th><th>Fix</th></tr>
<tr><td>AP absent, switch port default VLAN mein</td><td>Access VLAN set nahi</td><td>SW1 par <code>switchport access vlan 10</code></td></tr>
<tr><td>AP ke paas IP hai, Discovery mein rehta hai</td><td>AP-POOL mein option 43 missing ya galat</td><td>R1 <code>option 43 hex f104.0a0a.630a</code></td></tr>
<tr><td>Switch clean-up ke baad saare APs gaye; WLC1 10.10.99.1 ping nahi kar sakta</td><td>WLC1 ke trunk se VLAN 99 hata</td><td>Gi0/1 par <code>switchport trunk allowed vlan add 99</code></td></tr>
<tr><td>Log: reason ke saath AP_LOST</td><td>Path loss ya reload</td><td>Pehle reason text padho</td></tr>
</table>
<h3>Branch B: SSID nahi dikhta</h3>
<table class="cmp"><tr><th>Evidence</th><th>Cause</th><th>Fix</th></tr>
<tr><td>Tag Source Default</td><td>AP ke paas policy tag nahi</td><td><code>ap name AP2 policy-tag PT-CAMPUS</code></td></tr>
<tr><td>Tag detail mein WLAN nahi</td><td>Map missing</td><td><code>wlan NK-VOICE policy PP-VOICE</code></td></tr>
<tr><td>Policy profile DISABLED</td><td>Kabhi enable nahi hua</td><td><code>no shutdown</code></td></tr>
<tr><td>CC column controller list se match nahi karta</td><td>AP profile country galat (radios off)</td><td>AP profile mein <code>country IN</code>; regulatory list jaisi hai rakho</td></tr>
<tr><td>5 GHz summary dono APs ke liye Disabled</td><td>RF profile shut down</td><td>RF profile mein <code>no shutdown</code></td></tr>
<tr><td>Dono APs same 2.4 GHz channel par, slow</td><td>Co-channel overlap</td><td>Padosi APs par channels 1 aur 6</td></tr>
</table>
<h3>Branch C: dikhta hai lekin join nahi</h3>
<table class="cmp"><tr><th>Evidence</th><th>Cause</th><th>Fix</th></tr>
<tr><td>PSK client rejected</td><td>Galat ya rotated passphrase</td><td>Key confirm karo; rotate sirf WLAN shut karke</td></tr>
<tr><td>SERVER_TIMEOUT, timeouts badh rahe</td><td>Shared secret, address ya port mismatch</td><td><code>radius server RAD1</code> phir <code>key 0 NkRadius1</code></td></tr>
<tr><td>AUTH_REJECT</td><td>Server par user ya policy rejected</td><td>RAD1 par account check karo</td></tr>
<tr><td>NO_SERVER</td><td>Method list ya group mein server nahi</td><td>List, group aur server name check karo</td></tr>
</table>
<h3>Branch D: join hua lekin IP ya access nahi</h3>
<table class="cmp"><tr><th>Evidence</th><th>Cause</th><th>Fix</th></tr>
<tr><td>Policy VLAN NOT IN VLAN DATABASE</td><td>WLC par VLAN create nahi hua</td><td><code>vlan 20</code> phir <code>name STAFF</code></td></tr>
<tr><td>AP2 par roam karne ke baad alag subnet</td><td>AP2 alag policy tag ya profile use karta hai</td><td>Dono APs par same policy tag</td></tr>
<tr><td>Guest servers tak pahunchta hai</td><td>R1 par ACL missing</td><td>GUEST-IN server aur staff ranges deny kare</td></tr>
<tr><td>Client ke paas IP hai, gateway ping nahi hota</td><td>Trunk ya routing issue</td><td>show interfaces trunk, show ip interface brief</td></tr>
</table>
<h3>Causes ke liye logs padhna</h3>
<p>Log mein client MAC ya AP name search karo, phir upar ki taraf padho pehli abnormal line tak. Mnemonic ko layer se jodo: <code>CAPWAP</code> messages AP layer ki taraf, <code>DOT1X</code> AAA ki taraf, aur client association failure jo policy profile ya VLAN ka zikr kare WLC layer ki taraf point karta hai. Agar log chup hai to failure shayad controller ke client dekhne se pehle hai, yani RF ya client-layer problem.</p>
<div class="eg"><p><b>Worked example.</b> 5 GHz-only handset ko network nahi milta; 2.4 GHz laptops theek hain. AP summary 5 GHz radios Disabled dikhata hai aur RF profile summary mein CAMPUS-5 shut hai. WLAN aur policy theek hain, isliye single fix hai <code>ap dot11 5ghz rf-profile CAMPUS-5</code> phir <code>no shutdown</code>. WLAN ko nahi chhua: yeh evidence se nikalta hai.</p></div>
<div class="warn"><p><b>Common mistakes.</b> (1) Symptom ko favourite cause se match karke evidence chhod dena. (2) AP profile galat ho tab regulatory country list fix karna; business country list policy hai, AP profile aam drift hai. (3) Symptoms ke combination ko ignore karna: "timeouts aur disabled profile" dono ek saath ho sakte hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Site tag rollout ke baad radios off" jab tak prove na ho country mismatch hai. "Switch clean-up ke baad AP lost" trunk allowed list hai.</p></div>
<div class="scn"><h4>Ek catalogue, chaar tickets</h4><p>Ek busy subah chaar tickets aaye: AP2 ke paas SSID nahi, handsets ko 5 GHz nahi, laptops ko IP nahi, aur corporate login failure. Catalogue se engineer ne har ticket ek minute mein branch ko assign kiya: tag, RF profile, VLAN database, RADIUS secret. Har ek mein ek command lagi. Team ke runbook mein ab yeh table hubahu hai.</p><p><b>Seekh:</b> past incidents se bana runbook ghanton ko minutes mein badal deta hai.</p></div>
<div class="iv"><p class="q">"Tumne dekhe top paanch wireless faults batao aur har ek kaise dhundha."</p><p>Missing ya default policy tag (show ap tag summary), disabled policy profile (policy detail), database mein VLAN missing (policy detail aur log), RADIUS secret mismatch (show aaa servers timeouts aur log), AP country mismatch (show ap summary CC column). Har ek ka single-change fix mention karo.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Chaar branches: AP registered nahi, SSID nahi dikhta, join nahi, IP ya access nahi.</li>
<li>Har fault ka ek evidence aur ek sabse chhota fix hai.</li>
<li>Timeout versus reject AAA reachability ko user denial se alag karta hai.</li>
<li>AP profile country sahi karo, regulatory list nahi.</li>
<li>Har incident se apna runbook likho.</li>
</ul></div>
`}};export{e as default};