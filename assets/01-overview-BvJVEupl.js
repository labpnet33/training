var e={id:`overview`,h:{en:`Wireless operations: what you will learn and the big picture`,hi:`Wireless operations: aap kya seekhoge aur big picture`},body:{en:`
<h3>What you will learn</h3>
<p>Building a wireless network is a project. <b>Running</b> it is a job that never ends: users complain, someone changes a policy on Friday evening, a new wing opens, a RADIUS server is rebuilt. This module teaches the operations side of the Catalyst 9800-style controller you built in the earlier modules. By the end you will be able to:</p>
<ul>
<li>Describe the layered path of a Wi-Fi session (client, AP, WLC, switched network, AAA) and test each layer in order.</li>
<li>Read the 9800 show commands, logs and client details that prove where a session stops.</li>
<li>Apply a repeatable triage method: symptom, scope, evidence, one change, proof, record.</li>
<li>Roll out a new AP or floor with the right switchport, tags and profiles, and prove it works.</li>
<li>Protect the network with change management, <code>write memory</code> backups and documentation.</li>
<li>Solve the three labs: <b>wl-ops-triage</b>, <b>wl-floor-expansion</b> and <b>wl-capstone-incident</b>.</li>
</ul>
<h3>Prerequisites</h3>
<p>You should already know the 9800 object model from the earlier modules: WLAN profile, policy profile, policy tag, site tag, RF tag, the wireless management interface, CAPWAP join through DHCP option 43, RF profiles and the 802.1X chain with RADIUS. We refer back to them but do not re-teach them. If a term feels new, revisit the first-WLAN and security modules.</p>
<h3>Analogy: a hospital emergency room</h3>
<p>An emergency room does not treat every patient the same way. A nurse <b>triages</b>: how many people are affected, how urgent is it, what is the first thing to check. Then tests are ordered from simple to complex, one treatment is given, and the result is recorded in the chart. Wireless operations works the same way. The ticket "Wi-Fi is down" is the patient walking in. Your job is to decide <i>where</i> it hurts before you start giving medicine.</p>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Operations loop">
<rect x="10" y="30" width="95" height="60" rx="8" fill="#bae6fd"/><text x="57" y="55" text-anchor="middle" class="svg-ink" font-size="13">Symptom</text><text x="57" y="74" text-anchor="middle" class="svg-muted" font-size="11">who, where</text>
<rect x="125" y="30" width="95" height="60" rx="8" fill="#ddd6fe"/><text x="172" y="55" text-anchor="middle" class="svg-ink" font-size="13">Scope</text><text x="172" y="74" text-anchor="middle" class="svg-muted" font-size="11">one or many</text>
<rect x="240" y="30" width="95" height="60" rx="8" fill="#bbf7d0"/><text x="287" y="55" text-anchor="middle" class="svg-ink" font-size="13">Evidence</text><text x="287" y="74" text-anchor="middle" class="svg-muted" font-size="11">show, logs</text>
<rect x="355" y="30" width="95" height="60" rx="8" fill="#fde68a"/><text x="402" y="55" text-anchor="middle" class="svg-ink" font-size="13">One change</text><text x="402" y="74" text-anchor="middle" class="svg-muted" font-size="11">smallest fix</text>
<rect x="470" y="30" width="75" height="60" rx="8" fill="#fed7aa"/><text x="507" y="55" text-anchor="middle" class="svg-ink" font-size="13">Proof</text><text x="507" y="74" text-anchor="middle" class="svg-muted" font-size="11">client test</text>
<rect x="560" y="30" width="72" height="60" rx="8" fill="#e2e8f0"/><text x="596" y="55" text-anchor="middle" class="svg-ink" font-size="13">Record</text><text x="596" y="74" text-anchor="middle" class="svg-muted" font-size="11">save, note</text>
<line x1="105" y1="60" x2="125" y2="60" stroke="#64748b"/><line x1="220" y1="60" x2="240" y2="60" stroke="#64748b"/><line x1="335" y1="60" x2="355" y2="60" stroke="#64748b"/><line x1="450" y1="60" x2="470" y2="60" stroke="#64748b"/><line x1="545" y1="60" x2="560" y2="60" stroke="#64748b"/>
<text x="320" y="140" text-anchor="middle" class="svg-ink" font-size="13">If proof fails, go back to evidence. Never stack guesses.</text>
</svg><p class="cap">The operations loop used in all three labs of this module.</p></div>
<h3>The lab network in one minute</h3>
<p>Every lab uses the same site: <b>R1</b> (router, DHCP, inter-VLAN) connects to <b>SW1</b>; <b>WLC1</b> hangs off SW1 trunk <code>GigabitEthernet1</code>; <b>RAD1</b> (10.10.60.20) sits behind R1. APs <b>AP1</b> and <b>AP2</b> live in VLAN 10 and clients are <b>LAPTOP1</b>, <b>LAPTOP2</b>, <b>PHONE1</b> and <b>GUEST1</b>. The VLANs are 10 AP-MGMT, 20 STAFF, 30 VOICE, 40 CORP, 50 GUEST and 99 WLC-MGMT. The tags and profiles are PT-CAMPUS, PP-STAFF, PP-CORP, PP-GUEST, PP-VOICE, ST-CAMPUS and RF-CAMPUS.</p>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Lab topology">
<rect x="10" y="60" width="70" height="40" rx="6" fill="#bae6fd"/><text x="45" y="85" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<rect x="130" y="60" width="70" height="40" rx="6" fill="#bbf7d0"/><text x="165" y="85" text-anchor="middle" class="svg-ink" font-size="13">SW1</text>
<rect x="250" y="10" width="80" height="40" rx="6" fill="#ddd6fe"/><text x="290" y="35" text-anchor="middle" class="svg-ink" font-size="13">WLC1</text>
<rect x="250" y="110" width="80" height="40" rx="6" fill="#fde68a"/><text x="290" y="135" text-anchor="middle" class="svg-ink" font-size="13">AP1 AP2 AP3</text>
<rect x="10" y="125" width="70" height="35" rx="6" fill="#fed7aa"/><text x="45" y="147" text-anchor="middle" class="svg-ink" font-size="13">RAD1</text>
<rect x="420" y="110" width="200" height="40" rx="6" fill="#e2e8f0"/><text x="520" y="135" text-anchor="middle" class="svg-ink" font-size="12">LAPTOP1 LAPTOP2 PHONE1 GUEST1</text>
<line x1="80" y1="80" x2="130" y2="80" stroke="#64748b"/><line x1="200" y1="70" x2="250" y2="35" stroke="#64748b"/><line x1="200" y1="90" x2="250" y2="130" stroke="#64748b"/><line x1="45" y1="100" x2="45" y2="125" stroke="#64748b"/><line x1="330" y1="130" x2="420" y2="130" stroke="#64748b" stroke-dasharray="4"/>
</svg><p class="cap">Dashed line = Wi-Fi. Solid = cable.</p></div>
<div class="note"><p><b>Honest scope.</b> The simulator models the 9800-style CLI, tags, profiles, AP join, DHCP, RADIUS and client association. It does <b>not</b> model Radioactive Trace, packet capture, Catalyst Center Assurance, HA SSO or software upgrades. Coming up: wl-diag (Troubleshooting like a CCIE), wl-mobility (Mobility and high availability) for HA SSO, and wl-auto (Catalyst Center, Spaces and automation). We teach those as concepts and label them <i>not simulated in the lab</i>.</p></div>
<div class="warn"><p><b>Common mistake.</b> Beginners jump to "restart the AP" or "rebuild the WLAN". That destroys evidence and often hides the real cause. In this module the rule is: look first, change the smallest thing.</p></div>
<div class="exam"><p><b>Exam trap.</b> Exam questions describe symptoms and ask for the <i>first</i> step. The first step is almost always to scope and gather evidence, not to change configuration.</p></div>
<div class="scn"><h4>The Friday change</h4><p>A network team merged two policy tags on Friday at 6 pm. On Monday forty users near one corner could not see the staff SSID. Nobody knew what had changed. The team that kept a change record found the edit in two minutes. The team without one spent half a day comparing running-configs by eye.</p><p><b>Lesson:</b> operations is as much about records and method as about commands.</p></div>
<div class="iv"><p class="q">"What is the first thing you do when a user says the Wi-Fi is not working?"</p><p>Ask who, where, when and on which SSID; check whether it is one client or many; then collect evidence from the client up through AP, controller and AAA before changing anything.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Operations = triage, evidence, one change, proof, record.</li>
<li>The path is client, AP, WLC, network, AAA; test it in order.</li>
<li>The three labs are triage, floor expansion and a three-defect capstone.</li>
<li>Radioactive Trace, captures and Assurance are concepts only here.</li>
<li>Keep a change record and save the configuration with <code>write memory</code>.</li>
</ul></div>
`,hi:`
<h3>Aap kya seekhoge</h3>
<p>Wireless network banana ek project hai. Use <b>chalana</b> ek kabhi na khatam hone wala kaam hai: users complain karte hain, koi Friday shaam ko policy badal deta hai, naya wing khulta hai, RADIUS server rebuild hota hai. Yeh module pichhle modules mein banaye Catalyst 9800-style controller ka operations side sikhata hai. Ant tak aap yeh kar paoge:</p>
<ul>
<li>Wi-Fi session ka layered path (client, AP, WLC, switched network, AAA) explain karna aur har layer ko order mein test karna.</li>
<li>9800 ke show commands, logs aur client details padhna jo prove karte hain ki session kahan ruka.</li>
<li>Repeatable triage method lagana: symptom, scope, evidence, ek change, proof, record.</li>
<li>Naya AP ya floor sahi switchport, tags aur profiles ke saath roll out karna aur prove karna ki chalta hai.</li>
<li>Change management, <code>write memory</code> backups aur documentation se network ko protect karna.</li>
<li>Teen labs solve karna: <b>wl-ops-triage</b>, <b>wl-floor-expansion</b> aur <b>wl-capstone-incident</b>.</li>
</ul>
<h3>Prerequisites</h3>
<p>Aapko pichhle modules se 9800 object model aana chahiye: WLAN profile, policy profile, policy tag, site tag, RF tag, wireless management interface, DHCP option 43 se CAPWAP join, RF profiles aur RADIUS ke saath 802.1X chain. Hum inhe refer karenge, dobara nahi padhayenge. Koi term naya lage to first-WLAN aur security modules dobara dekho.</p>
<h3>Analogy: hospital ka emergency room</h3>
<p>Emergency room har patient ko ek jaisa treat nahi karta. Nurse <b>triage</b> karti hai: kitne log affected hain, kitna urgent hai, pehle kya check karna hai. Phir tests simple se complex order hote hain, ek treatment diya jaata hai, aur result chart mein likha jaata hai. Wireless operations bhi aise hi chalta hai. "Wi-Fi down hai" ticket woh patient hai jo andar aaya. Dawai dene se pehle aapka kaam decide karna hai ki dard <i>kahan</i> hai.</p>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Operations loop">
<rect x="10" y="30" width="95" height="60" rx="8" fill="#bae6fd"/><text x="57" y="55" text-anchor="middle" class="svg-ink" font-size="13">Symptom</text><text x="57" y="74" text-anchor="middle" class="svg-muted" font-size="11">kaun, kahan</text>
<rect x="125" y="30" width="95" height="60" rx="8" fill="#ddd6fe"/><text x="172" y="55" text-anchor="middle" class="svg-ink" font-size="13">Scope</text><text x="172" y="74" text-anchor="middle" class="svg-muted" font-size="11">ek ya kai</text>
<rect x="240" y="30" width="95" height="60" rx="8" fill="#bbf7d0"/><text x="287" y="55" text-anchor="middle" class="svg-ink" font-size="13">Evidence</text><text x="287" y="74" text-anchor="middle" class="svg-muted" font-size="11">show, logs</text>
<rect x="355" y="30" width="95" height="60" rx="8" fill="#fde68a"/><text x="402" y="55" text-anchor="middle" class="svg-ink" font-size="13">Ek change</text><text x="402" y="74" text-anchor="middle" class="svg-muted" font-size="11">sabse chhota fix</text>
<rect x="470" y="30" width="75" height="60" rx="8" fill="#fed7aa"/><text x="507" y="55" text-anchor="middle" class="svg-ink" font-size="13">Proof</text><text x="507" y="74" text-anchor="middle" class="svg-muted" font-size="11">client test</text>
<rect x="560" y="30" width="72" height="60" rx="8" fill="#e2e8f0"/><text x="596" y="55" text-anchor="middle" class="svg-ink" font-size="13">Record</text><text x="596" y="74" text-anchor="middle" class="svg-muted" font-size="11">save, note</text>
<line x1="105" y1="60" x2="125" y2="60" stroke="#64748b"/><line x1="220" y1="60" x2="240" y2="60" stroke="#64748b"/><line x1="335" y1="60" x2="355" y2="60" stroke="#64748b"/><line x1="450" y1="60" x2="470" y2="60" stroke="#64748b"/><line x1="545" y1="60" x2="560" y2="60" stroke="#64748b"/>
<text x="320" y="140" text-anchor="middle" class="svg-ink" font-size="13">Proof fail ho to evidence par wapas jao. Guesses stack mat karo.</text>
</svg><p class="cap">Is module ke teeno labs mein use hone wala operations loop.</p></div>
<h3>Lab network ek minute mein</h3>
<p>Har lab mein same site hai: <b>R1</b> (router, DHCP, inter-VLAN) <b>SW1</b> se judta hai; <b>WLC1</b> SW1 ke trunk <code>GigabitEthernet1</code> par hai; <b>RAD1</b> (10.10.60.20) R1 ke peeche hai. <b>AP1</b> aur <b>AP2</b> VLAN 10 mein hain aur clients <b>LAPTOP1</b>, <b>LAPTOP2</b>, <b>PHONE1</b> aur <b>GUEST1</b> hain. VLANs: 10 AP-MGMT, 20 STAFF, 30 VOICE, 40 CORP, 50 GUEST aur 99 WLC-MGMT. Tags aur profiles: PT-CAMPUS, PP-STAFF, PP-CORP, PP-GUEST, PP-VOICE, ST-CAMPUS aur RF-CAMPUS.</p>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Lab topology">
<rect x="10" y="60" width="70" height="40" rx="6" fill="#bae6fd"/><text x="45" y="85" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<rect x="130" y="60" width="70" height="40" rx="6" fill="#bbf7d0"/><text x="165" y="85" text-anchor="middle" class="svg-ink" font-size="13">SW1</text>
<rect x="250" y="10" width="80" height="40" rx="6" fill="#ddd6fe"/><text x="290" y="35" text-anchor="middle" class="svg-ink" font-size="13">WLC1</text>
<rect x="250" y="110" width="80" height="40" rx="6" fill="#fde68a"/><text x="290" y="135" text-anchor="middle" class="svg-ink" font-size="13">AP1 AP2 AP3</text>
<rect x="10" y="125" width="70" height="35" rx="6" fill="#fed7aa"/><text x="45" y="147" text-anchor="middle" class="svg-ink" font-size="13">RAD1</text>
<rect x="420" y="110" width="200" height="40" rx="6" fill="#e2e8f0"/><text x="520" y="135" text-anchor="middle" class="svg-ink" font-size="12">LAPTOP1 LAPTOP2 PHONE1 GUEST1</text>
<line x1="80" y1="80" x2="130" y2="80" stroke="#64748b"/><line x1="200" y1="70" x2="250" y2="35" stroke="#64748b"/><line x1="200" y1="90" x2="250" y2="130" stroke="#64748b"/><line x1="45" y1="100" x2="45" y2="125" stroke="#64748b"/><line x1="330" y1="130" x2="420" y2="130" stroke="#64748b" stroke-dasharray="4"/>
</svg><p class="cap">Dashed line = Wi-Fi. Solid = cable.</p></div>
<div class="note"><p><b>Honest scope.</b> Simulator 9800-style CLI, tags, profiles, AP join, DHCP, RADIUS aur client association model karta hai. Woh Radioactive Trace, packet capture, Catalyst Center Assurance, HA SSO ya software upgrades ko model <b>nahi</b> karta. Aage aane wale: wl-diag (Troubleshooting like a CCIE), HA SSO ke liye wl-mobility (Mobility and high availability), aur wl-auto (Catalyst Center, Spaces and automation). Inhe hum concept ke roop mein padhate hain aur <i>not simulated in the lab</i> label lagate hain.</p></div>
<div class="warn"><p><b>Common mistake.</b> Beginners seedha "AP restart karo" ya "WLAN rebuild karo" par kood jaate hain. Isse evidence mit jaata hai aur asli cause chhup jaata hai. Is module ka rule: pehle dekho, sabse chhoti cheez badlo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Exam questions symptoms batate hain aur <i>pehla</i> step poochte hain. Pehla step aksar scope karna aur evidence jama karna hota hai, configuration badalna nahi.</p></div>
<div class="scn"><h4>Friday ka change</h4><p>Ek network team ne Friday shaam 6 baje do policy tags merge kar diye. Monday ko ek corner ke paas chalees users ko staff SSID nahi dikha. Kisi ko pata nahi tha kya badla tha. Jis team ke paas change record tha, usne do minute mein edit dhundh liya. Bina record wali team ne aadha din running-config aankhon se compare karne mein lagaya.</p><p><b>Seekh:</b> operations mein commands jitna hi record aur method ka role hai.</p></div>
<div class="iv"><p class="q">"Jab user kehta hai Wi-Fi nahi chal raha, tum sabse pehle kya karte ho?"</p><p>Poochho kaun, kahan, kab aur kaunsa SSID; check karo ek client hai ya kai; phir kuch badalne se pehle client se upar AP, controller aur AAA tak evidence collect karo.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Operations = triage, evidence, ek change, proof, record.</li>
<li>Path hai client, AP, WLC, network, AAA; ise order mein test karo.</li>
<li>Teen labs: triage, floor expansion aur teen-defect capstone.</li>
<li>Radioactive Trace, captures aur Assurance yahan sirf concept hain.</li>
<li>Change record rakho aur configuration <code>write memory</code> se save karo.</li>
</ul></div>
`}};export{e as default};