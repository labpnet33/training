var e={id:`change-method`,h:{en:`Maintenance windows, the change log and a troubleshooting method`,hi:`Maintenance windows, change log aur troubleshooting method`},body:{en:`
<h3>Firmware and maintenance windows: change safely</h3>
<p><b>Firmware</b> is the software that runs on a device. Vendors release new versions to fix bugs and security issues. In a cloud-managed estate the dashboard can schedule an upgrade for a network, and the device downloads and installs it, usually restarting once. During the restart the site's users briefly lose the service that device provides: a switch restart interrupts everything behind it.</p>
<p>That is why we use a <b>maintenance window</b>: an agreed, announced time (for a retail shop, after closing, say 23:30 to 01:00) when disruption is acceptable. A good routine has five steps: announce, schedule, do the change, verify, and write down the result. This simulator does not include firmware images, so this chapter teaches the habit; for exact upgrade behaviour of a real product check the vendor documentation.</p>
<p>The same rule applies to risky configuration, not only firmware: binding a template to a live branch, changing a trunk, or editing firewall rule order. Anything that can cut users off should have a window and a rollback idea ("what do I click to undo this?").</p>

<h3>The change log: who did what, when</h3>
<p>The dashboard records every configuration change in a <b>change log</b> (an audit trail): time, administrator, network, what changed, old and new value. You find it on the <b>Alerts and events</b> page along with derived events such as "device offline" or "uplink failover". Two reasons it matters:</p>
<ul>
<li><b>Troubleshooting.</b> Most outages begin with a change. If something broke at 10:40, the first question is "what changed at 10:30?".</li>
<li><b>Accountability.</b> It ties every change to a named admin, which is why shared logins are a bad idea.</li>
</ul>
<pre class="out">Alerts and events  (network: Bengaluru Branch)
Time    Type     Detail
10:42   alert    SW-BLR offline
10:41   event    <span class="hl">Imran changed SW-BLR uplink port 1 native VLAN 99 to 1</span>
10:15   event    Meera viewed organization settings
09:02   audit    Imran added tag "store" to AP-BLR</pre>
<p>Reading it: one minute before the switch went offline, Imran changed the native VLAN of its uplink. That is your lead, found in seconds.</p>

<h3>A method to troubleshoot a cloud-managed site</h3>
<p>When you cannot touch the site, follow a fixed order. Work from the outside in, because each step depends on the one before it.</p>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Troubleshooting order">
<rect x="10" y="40" width="140" height="80" rx="8" fill="#fde68a"/><text x="80" y="70" text-anchor="middle" class="svg-ink" font-size="13">1. Is the device</text><text x="80" y="88" text-anchor="middle" class="svg-ink" font-size="13">online?</text>
<rect x="170" y="40" width="140" height="80" rx="8" fill="#bae6fd"/><text x="240" y="70" text-anchor="middle" class="svg-ink" font-size="13">2. Does it have</text><text x="240" y="88" text-anchor="middle" class="svg-ink" font-size="13">an uplink?</text>
<rect x="330" y="40" width="140" height="80" rx="8" fill="#bbf7d0"/><text x="400" y="70" text-anchor="middle" class="svg-ink" font-size="13">3. Is the config</text><text x="400" y="88" text-anchor="middle" class="svg-ink" font-size="13">correct?</text>
<rect x="490" y="40" width="140" height="80" rx="8" fill="#ddd6fe"/><text x="560" y="70" text-anchor="middle" class="svg-ink" font-size="13">4. What changed?</text><text x="560" y="88" text-anchor="middle" class="svg-ink" font-size="13">(change log)</text>
<line x1="150" y1="80" x2="170" y2="80" stroke="#64748b" stroke-width="2"/><line x1="310" y1="80" x2="330" y2="80" stroke="#64748b" stroke-width="2"/><line x1="470" y1="80" x2="490" y2="80" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Online, then uplink, then configuration; use the change log to explain what you find.</p></div>
<ol>
<li><b>Is the device online?</b> If a device is offline in the dashboard, you cannot read or change it, so every later step is guesswork. Check the Overview and the device status. Also ask: are users affected (data plane) or only the dashboard view (management path)?</li>
<li><b>Does it have an uplink?</b> An appliance needs a working internet circuit; a switch or AP needs a working path to the appliance. Look at the Uplinks status (wan1, wan2), and for downstream devices check the link toward the appliance.</li>
<li><b>Is the configuration correct?</b> Only now read VLANs, DHCP, firewall rules, SSIDs, against the design. Check whether the page is template-controlled (chapter 4).</li>
<li><b>What changed?</b> Confirm with the change log. Fix the cause, not the symptom, and record what you did.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> Mumbai staff report "Wi-Fi is down". Step 1: AP-MUM shows offline. Step 2: MX-MUM is online with wan1 up, so the uplink exists. Step 3: the switch port of AP-MUM looks fine. Step 4: the change log shows a change on SW-MUM an hour ago. You review that change rather than rebooting the AP.</p></div>

<div class="note"><p><b>What does this change on the wire/policy?</b> The method itself changes nothing: looking is free. Each fix you then apply has its own wire effect, and you should state it before you click: "I am changing the native VLAN back to 99 so the switch management traffic reaches the MX again."</p></div>
<div class="warn"><p><b>Common mistakes.</b> Changing three things at once so you cannot tell which fixed it; skipping the change log; rebooting devices before looking; fixing in production without a rollback idea.</p></div>
<div class="exam"><p><b>Exam trap.</b> The expected order is device online, uplink, then configuration. A question that offers "rewrite the VLAN table" as step one is a distractor.</p></div>

<div class="scn"><h4>Friday upgrade at 6 p.m.</h4><p>An engineer scheduled a firmware upgrade for all branches at 18:00 on a Friday, the busiest shopping hour. Billing terminals dropped for ten minutes at each store. The change log made it obvious in minutes, but the damage was done. The team now publishes a monthly window after store closing and always runs a pilot on one branch first.</p><p><b>Lesson:</b> the technical change was right; the timing was the failure.</p></div>

<div class="iv"><p class="q">"A branch says the network is down. What do you do first from your desk?"</p><p>Strong answer: check whether devices are online in the dashboard, which tells me if I can see the site at all; then check the uplink status; then review configuration; and open the change log to see what changed recently. Also ask the site what users see, to separate a management problem from a user problem. Do one change at a time and write the result down.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Do risky changes in an announced maintenance window with a rollback idea.</li>
<li>The change log shows who changed what and when; start with what changed.</li>
<li>Method: device online, then uplink, then configuration, then confirm with the change log.</li>
<li>Separate users down from dashboard cannot see the device.</li>
<li>Change one thing at a time and record the result.</li>
</ul></div>
`,hi:`
<h3>Firmware aur maintenance windows: safely change karo</h3>
<p><b>Firmware</b> woh software hai jo device par chalta hai. Vendors bugs aur security issues fix karne ke liye nayi versions release karte hain. Cloud-managed estate mein dashboard network ke liye upgrade schedule kar sakta hai, aur device use download karke install karta hai, aam taur par ek baar restart hota hai. Restart ke dauraan site ke users ko woh service thodi der ke liye nahi milti jo woh device deta hai: switch restart ho to uske peeche sab kuch ruk jaata hai.</p>
<p>Isiliye hum <b>maintenance window</b> use karte hain: ek tay aur announce kiya hua time (retail shop ke liye, closing ke baad, jaise 23:30 se 01:00) jab disruption acceptable hai. Achhe routine ke paanch steps hote hain: announce, schedule, change karo, verify karo, aur result likho. Is simulator mein firmware images nahi hain, isliye yeh chapter aadat sikhata hai; real product ke exact upgrade behaviour ke liye vendor documentation dekho.</p>
<p>Yahi rule risky configuration par bhi lagta hai, sirf firmware par nahi: live branch par template bind karna, trunk badalna, ya firewall rule order edit karna. Jo bhi users ko kaat sakta hai usse window aur rollback idea ("ise undo karne ke liye kya click karun?") chahiye.</p>

<h3>Change log: kisne kya kiya, kab</h3>
<p>Dashboard har configuration change ko <b>change log</b> (audit trail) mein record karta hai: time, administrator, network, kya badla, purani aur nayi value. Yeh aapko <b>Alerts and events</b> page par milta hai, saath mein derived events jaise "device offline" ya "uplink failover". Do wajah se yeh zaroori hai:</p>
<ul>
<li><b>Troubleshooting.</b> Zyada tar outages kisi change se shuru hote hain. Agar 10:40 par kuch tuta, to pehla sawaal hai "10:30 par kya badla?".</li>
<li><b>Accountability.</b> Yeh har change ko ek naam wale admin se jodta hai, isliye shared logins buri idea hain.</li>
</ul>
<pre class="out">Alerts and events  (network: Bengaluru Branch)
Time    Type     Detail
10:42   alert    SW-BLR offline
10:41   event    <span class="hl">Imran changed SW-BLR uplink port 1 native VLAN 99 to 1</span>
10:15   event    Meera viewed organization settings
09:02   audit    Imran added tag "store" to AP-BLR</pre>
<p>Padhna: switch ke offline hone se ek minute pehle Imran ne uske uplink ka native VLAN badla. Yeh aapki lead hai, seconds mein mili.</p>

<h3>Cloud-managed site troubleshoot karne ka method</h3>
<p>Jab aap site ko chhu nahi sakte, to ek fixed order follow karo. Bahar se andar ki taraf kaam karo, kyunki har step pichle step par depend karta hai.</p>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Troubleshooting order">
<rect x="10" y="40" width="140" height="80" rx="8" fill="#fde68a"/><text x="80" y="70" text-anchor="middle" class="svg-ink" font-size="13">1. Device online</text><text x="80" y="88" text-anchor="middle" class="svg-ink" font-size="13">hai?</text>
<rect x="170" y="40" width="140" height="80" rx="8" fill="#bae6fd"/><text x="240" y="70" text-anchor="middle" class="svg-ink" font-size="13">2. Uplink hai?</text><text x="240" y="88" text-anchor="middle" class="svg-ink" font-size="13"> </text>
<rect x="330" y="40" width="140" height="80" rx="8" fill="#bbf7d0"/><text x="400" y="70" text-anchor="middle" class="svg-ink" font-size="13">3. Config sahi</text><text x="400" y="88" text-anchor="middle" class="svg-ink" font-size="13">hai?</text>
<rect x="490" y="40" width="140" height="80" rx="8" fill="#ddd6fe"/><text x="560" y="70" text-anchor="middle" class="svg-ink" font-size="13">4. Kya badla?</text><text x="560" y="88" text-anchor="middle" class="svg-ink" font-size="13">(change log)</text>
<line x1="150" y1="80" x2="170" y2="80" stroke="#64748b" stroke-width="2"/><line x1="310" y1="80" x2="330" y2="80" stroke="#64748b" stroke-width="2"/><line x1="470" y1="80" x2="490" y2="80" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Pehle online, phir uplink, phir configuration; jo mile use change log se explain karo.</p></div>
<ol>
<li><b>Device online hai?</b> Agar dashboard mein device offline hai, to aap use padh ya badal nahi sakte, isliye aage ka har step andaza hai. Overview aur device status check karo. Yeh bhi poochho: users affected hain (data plane) ya sirf dashboard view (management path)?</li>
<li><b>Uplink hai?</b> Appliance ko working internet circuit chahiye; switch ya AP ko appliance tak working path chahiye. Uplinks status (wan1, wan2) dekho, aur downstream devices ke liye appliance ki taraf ka link check karo.</li>
<li><b>Configuration sahi hai?</b> Ab jaake VLANs, DHCP, firewall rules, SSIDs ko design se milao. Check karo ki page template-controlled hai ya nahi (chapter 4).</li>
<li><b>Kya badla?</b> Change log se confirm karo. Symptom nahi, cause fix karo, aur jo kiya woh record karo.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> Mumbai staff bolta hai "Wi-Fi down hai". Step 1: AP-MUM offline dikha raha hai. Step 2: MX-MUM online hai aur wan1 up hai, to uplink hai. Step 3: AP-MUM ka switch port theek lagta hai. Step 4: change log mein ek ghante pehle SW-MUM par change dikhta hai. Aap AP reboot karne ke bajaye us change ko review karte ho.</p></div>

<div class="note"><p><b>Wire/policy par kya badalta hai?</b> Method khud kuch nahi badalta: dekhna free hai. Uske baad jo bhi fix lagate ho uska apna wire effect hota hai, aur click se pehle use bolna chahiye: "Main native VLAN wapas 99 kar raha hoon taaki switch ka management traffic MX tak phir pahunche."</p></div>
<div class="warn"><p><b>Common galtiyan.</b> Teen cheezein ek saath badalna taaki pata na chale kisne fix kiya; change log skip karna; dekhne se pehle devices reboot karna; bina rollback idea ke production mein fix karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Expected order hai device online, uplink, phir configuration. Agar kisi sawaal mein "VLAN table rewrite karo" pehle step ke roop mein hai, to woh distractor hai.</p></div>

<div class="scn"><h4>Friday shaam 6 baje ka upgrade</h4><p>Ek engineer ne Friday 18:00 par saari branches ke liye firmware upgrade schedule kar diya, jo shopping ka sabse busy ghanta hai. Har store par billing terminals dus minute ke liye gir gaye. Change log ne minutes mein saaf kar diya, lekin nuksaan ho chuka tha. Ab team store closing ke baad monthly window publish karti hai aur hamesha pehle ek branch par pilot chalati hai.</p><p><b>Seekh:</b> technical change sahi tha; timing galat thi.</p></div>

<div class="iv"><p class="q">"Branch bolta hai network down hai. Apni desk se sabse pehle kya karoge?"</p><p>Strong answer: dashboard mein check karunga ki devices online hain ya nahi, jisse pata chalta hai ki main site ko dekh bhi sakta hoon; phir uplink status; phir configuration review; aur change log kholunga dekhne ke liye ki recently kya badla. Site se bhi poochunga ki users ko kya dikh raha hai, taaki management problem aur user problem alag ho. Ek time par ek hi change karunga aur result likhunga.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Risky changes announce kiye hue maintenance window mein rollback idea ke saath karo.</li>
<li>Change log batata hai kisne kya kab badla; "kya badla" se shuru karo.</li>
<li>Method: device online, phir uplink, phir configuration, phir change log se confirm.</li>
<li>Users down aur dashboard device nahi dekh pa raha ko alag rakho.</li>
<li>Ek time par ek change karo aur result record karo.</li>
</ul></div>
`}};export{e as default};