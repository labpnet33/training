var e={id:`three-services-portal`,h:{en:`The three services and the admin portal`,hi:`Teen services aur admin portal`},body:{en:`
<h3>One portal, three jobs</h3>
<p>The cloud security service you will manage does three different jobs. In the vendor's own wording these services are called ZIA, ZPA and ZDX. In this course we use plain names so you understand the job first and the brand second.</p>
<table class="cmp"><tr><th>Job (our name)</th><th>Question it answers</th><th>Typical objects</th></tr>
<tr><td><b>Internet access</b> (secure web gateway and cloud firewall)</td><td>May this user go to this website or send this traffic?</td><td>Locations, forwarding, URL rules, SSL rules, DLP, sandbox, cloud firewall</td></tr>
<tr><td><b>Private access</b> (ZTNA)</td><td>May this user reach this company application?</td><td>Application segments, server groups, connector groups, connectors, access policy</td></tr>
<tr><td><b>Digital experience</b></td><td>Why does this user say the app is slow?</td><td>Probes, scores, five hops, alert thresholds</td></tr>
</table>
<p>A fourth area, <b>identity</b>, sits under all of them: users, groups and sign-in. Without a known user, a rule that says "Finance only" cannot match.</p>

<h3>Meet Sahyadri Logistics</h3>
<p>Every lab and ticket in this track uses the same company, so learn it once.</p>
<table class="cmp"><tr><th>Site</th><th>Forwarding</th><th>Main user</th><th>Servers</th></tr>
<tr><td>Pune HQ (pun)</td><td>IPsec tunnel</td><td>ravi, Finance</td><td>erp, hr</td></tr>
<tr><td>Chennai Branch (chn)</td><td>GRE tunnel</td><td>meena, Engineering</td><td>files, git</td></tr>
<tr><td>Jaipur Branch (jpr)</td><td>PAC file</td><td>kabir, Sales</td><td>none that matter</td></tr>
<tr><td>Remote</td><td>Client connector</td><td>vikram, Engineering</td><td>-</td></tr>
</table>
<p>Other users: anita (HR) and rohit (Contractors). Groups: Finance, Engineering, Sales, HR, Contractors. The portal itself is a cloud web console, called ZPORTAL in our network diagrams.</p>

<h3>The portal map</h3>
<p>The simulator's left navigation has thirteen pages. Learn the list now, because tickets always begin with "which page do I open first?"</p>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Portal pages grouped by job">
<rect x="10" y="10" width="200" height="230" rx="10" fill="#bae6fd"/><text x="110" y="32" text-anchor="middle" class="svg-ink" font-size="13">Internet access</text>
<text x="110" y="58" text-anchor="middle" class="svg-ink" font-size="12">Locations and edge devices</text><text x="110" y="82" text-anchor="middle" class="svg-ink" font-size="12">Forwarding</text><text x="110" y="106" text-anchor="middle" class="svg-ink" font-size="12">URL filtering</text><text x="110" y="130" text-anchor="middle" class="svg-ink" font-size="12">SSL inspection</text><text x="110" y="154" text-anchor="middle" class="svg-ink" font-size="12">DLP, sandbox, malware</text><text x="110" y="178" text-anchor="middle" class="svg-ink" font-size="12">Cloud firewall</text>
<rect x="225" y="10" width="190" height="110" rx="10" fill="#bbf7d0"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="13">Private and identity</text>
<text x="320" y="62" text-anchor="middle" class="svg-ink" font-size="12">Private access</text><text x="320" y="86" text-anchor="middle" class="svg-ink" font-size="12">Identity (SAML, SCIM)</text><text x="320" y="110" text-anchor="middle" class="svg-ink" font-size="12">Digital experience</text>
<rect x="225" y="130" width="190" height="110" rx="10" fill="#ddd6fe"/><text x="320" y="152" text-anchor="middle" class="svg-ink" font-size="13">Visibility</text>
<text x="320" y="180" text-anchor="middle" class="svg-ink" font-size="12">Overview</text><text x="320" y="204" text-anchor="middle" class="svg-ink" font-size="12">Log feeds</text><text x="320" y="228" text-anchor="middle" class="svg-ink" font-size="12">Alerts and audit</text>
<rect x="430" y="10" width="200" height="230" rx="10" fill="#fde68a"/><text x="530" y="32" text-anchor="middle" class="svg-ink" font-size="13">Proof</text>
<text x="530" y="90" text-anchor="middle" class="svg-ink" font-size="12">Policy tester</text><text x="530" y="120" text-anchor="middle" class="svg-muted" font-size="12">asks the real engine:</text><text x="530" y="140" text-anchor="middle" class="svg-muted" font-size="12">what would happen?</text>
</svg><p class="cap">Thirteen pages: six for internet access, three private or identity, three for visibility and one for proof.</p></div>

<h3>Saved is not active</h3>
<p>Editing a form does not change live traffic. The portal keeps a <b>candidate</b> copy of the settings; the <b>Activate changes</b> button copies the candidate to the running policy. Until you press it, tests still use the old policy. Forgetting to activate is one of the most common reasons a "fix did not work".</p>

<div class="note"><p><b>What does this change on the wire/policy?</b> Pressing Activate changes the policy that every new request is checked against, for all users at once. Already-open connections may carry on until they are re-evaluated. Every activation is written to the audit log with your name.</p></div>

<h3>Lab zs-start-1: tidy a location warning</h3>
<p>The Overview page lists the health of tunnels, connectors, identity and feeds. Warnings are <b>derived</b>: the portal computes them from settings, nobody types them in. In this lab the Alerts page shows that a location has authentication off. A <b>location</b> is the portal's record of a site: its forwarding method, public IP, and whether users must sign in.</p>
<pre class="out">Alerts and audit  &gt;  Alerts
Severity  Alert
<span class="hl">warning   Location Jaipur Branch: authentication is off (users are anonymous)</span>
info      All tunnels up, all connectors enrolled
Locations and edge devices
Location        Method   Auth required   Enabled
Pune HQ         ipsec    yes             yes
Chennai Branch  gre      yes             yes
Jaipur Branch   pac      <span class="hl">no</span>              yes</pre>
<p>Method: open <b>Locations and edge devices</b>, select the location, switch the authentication setting on, press Activate changes, then return to Alerts and confirm the warning is gone. Why does it matter? If authentication is off, the cloud does not know who the user is, so any rule written for a group such as Sales cannot match. Anonymous traffic falls through to whatever rule is below.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Editing a rule and not activating. (2) Fixing the alert text instead of the cause; alerts disappear only when the setting is right. (3) Turning authentication on and forgetting that sign-in must work (module zs-id).</p></div>
<div class="exam"><p><b>Exam trap.</b> "An alert says users are anonymous; the rule for Sales never matches." The cause is the location setting, not the rule.</p></div>

<div class="scn"><h4>The alert nobody read</h4><p>An engineer set up a new branch in a hurry and left authentication off to "test faster". Two weeks later an audit found the group-based social-media rule had never applied there, because every user at that branch was anonymous. The Overview page had shown a yellow warning since day one.</p><p><b>Lesson:</b> read the Overview and Alerts pages at the start of every shift.</p></div>

<div class="iv"><p class="q">"You open the portal on a Monday. What do you look at first?"</p><p>Strong answer: Overview and Alerts for tunnel, connector, identity and feed health; then the audit log for weekend changes; then the specific page for the complaint. Say that alerts are derived from settings, so you fix the setting, not the alert.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Three jobs: internet access, private access, digital experience; identity sits under all.</li>
<li>Sahyadri has Pune (IPsec), Chennai (GRE), Jaipur (PAC) and remote vikram (client connector).</li>
<li>Thirteen portal pages; the Policy tester is the proof tool.</li>
<li>Changes are candidate until you press Activate changes.</li>
<li>Alerts are calculated from settings; fix the cause, then re-check.</li>
</ul></div>
`,hi:`
<h3>Ek portal, teen kaam</h3>
<p>Jis cloud security service ko aap manage karoge woh teen alag kaam karti hai. Vendor ke apne words mein in services ko ZIA, ZPA aur ZDX kehte hain. Is course mein hum simple naam use karte hain taaki pehle aap kaam samjho, brand baad mein.</p>
<table class="cmp"><tr><th>Kaam (hamara naam)</th><th>Kaun sa sawal solve karta hai</th><th>Typical objects</th></tr>
<tr><td><b>Internet access</b> (secure web gateway aur cloud firewall)</td><td>Kya yeh user is website par ja sakta hai ya yeh traffic bhej sakta hai?</td><td>Locations, forwarding, URL rules, SSL rules, DLP, sandbox, cloud firewall</td></tr>
<tr><td><b>Private access</b> (ZTNA)</td><td>Kya yeh user is company application tak pahunch sakta hai?</td><td>Application segments, server groups, connector groups, connectors, access policy</td></tr>
<tr><td><b>Digital experience</b></td><td>Yeh user kyun kehta hai ki app slow hai?</td><td>Probes, scores, five hops, alert thresholds</td></tr>
</table>
<p>Chautha area, <b>identity</b>, in sabke neeche hai: users, groups aur sign-in. Jab user known nahi hota, "sirf Finance" wala rule match nahi kar sakta.</p>

<h3>Sahyadri Logistics se milo</h3>
<p>Is track ka har lab aur ticket wahi company use karta hai, isliye ek baar seekh lo.</p>
<table class="cmp"><tr><th>Site</th><th>Forwarding</th><th>Main user</th><th>Servers</th></tr>
<tr><td>Pune HQ (pun)</td><td>IPsec tunnel</td><td>ravi, Finance</td><td>erp, hr</td></tr>
<tr><td>Chennai Branch (chn)</td><td>GRE tunnel</td><td>meena, Engineering</td><td>files, git</td></tr>
<tr><td>Jaipur Branch (jpr)</td><td>PAC file</td><td>kabir, Sales</td><td>koi khaas nahi</td></tr>
<tr><td>Remote</td><td>Client connector</td><td>vikram, Engineering</td><td>-</td></tr>
</table>
<p>Baaki users: anita (HR) aur rohit (Contractors). Groups: Finance, Engineering, Sales, HR, Contractors. Portal khud ek cloud web console hai, jise hamare network diagrams mein ZPORTAL kehte hain.</p>

<h3>Portal ka map</h3>
<p>Simulator ke left navigation mein terah pages hain. List abhi yaad kar lo, kyunki tickets hamesha "pehle kaun sa page kholun?" se shuru hote hain.</p>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Portal pages kaam ke hisaab se groups mein">
<rect x="10" y="10" width="200" height="230" rx="10" fill="#bae6fd"/><text x="110" y="32" text-anchor="middle" class="svg-ink" font-size="13">Internet access</text>
<text x="110" y="58" text-anchor="middle" class="svg-ink" font-size="12">Locations and edge devices</text><text x="110" y="82" text-anchor="middle" class="svg-ink" font-size="12">Forwarding</text><text x="110" y="106" text-anchor="middle" class="svg-ink" font-size="12">URL filtering</text><text x="110" y="130" text-anchor="middle" class="svg-ink" font-size="12">SSL inspection</text><text x="110" y="154" text-anchor="middle" class="svg-ink" font-size="12">DLP, sandbox, malware</text><text x="110" y="178" text-anchor="middle" class="svg-ink" font-size="12">Cloud firewall</text>
<rect x="225" y="10" width="190" height="110" rx="10" fill="#bbf7d0"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="13">Private aur identity</text>
<text x="320" y="62" text-anchor="middle" class="svg-ink" font-size="12">Private access</text><text x="320" y="86" text-anchor="middle" class="svg-ink" font-size="12">Identity (SAML, SCIM)</text><text x="320" y="110" text-anchor="middle" class="svg-ink" font-size="12">Digital experience</text>
<rect x="225" y="130" width="190" height="110" rx="10" fill="#ddd6fe"/><text x="320" y="152" text-anchor="middle" class="svg-ink" font-size="13">Visibility</text>
<text x="320" y="180" text-anchor="middle" class="svg-ink" font-size="12">Overview</text><text x="320" y="204" text-anchor="middle" class="svg-ink" font-size="12">Log feeds</text><text x="320" y="228" text-anchor="middle" class="svg-ink" font-size="12">Alerts and audit</text>
<rect x="430" y="10" width="200" height="230" rx="10" fill="#fde68a"/><text x="530" y="32" text-anchor="middle" class="svg-ink" font-size="13">Proof</text>
<text x="530" y="90" text-anchor="middle" class="svg-ink" font-size="12">Policy tester</text><text x="530" y="120" text-anchor="middle" class="svg-muted" font-size="12">asli engine se poochta hai:</text><text x="530" y="140" text-anchor="middle" class="svg-muted" font-size="12">kya hoga?</text>
</svg><p class="cap">Terah pages: chhe internet access ke, teen private ya identity ke, teen visibility ke aur ek proof ka.</p></div>

<h3>Saved matlab active nahi</h3>
<p>Form edit karne se live traffic nahi badalta. Portal settings ki ek <b>candidate</b> copy rakhta hai; <b>Activate changes</b> button candidate ko running policy mein copy karta hai. Jab tak aap use dabate nahi, tests purani policy se hi chalte hain. Activate bhool jaana "fix kaam nahi kiya" ki sabse common wajahon mein se ek hai.</p>

<div class="note"><p><b>Wire/policy par kya badalta hai?</b> Activate dabane se woh policy badal jaati hai jisse har nayi request check hoti hai, sab users ke liye ek saath. Already-open connections tab tak chal sakte hain jab tak dobara evaluate na ho. Har activation audit log mein aapke naam ke saath likhi jaati hai.</p></div>

<h3>Lab zs-start-1: location warning tidy karo</h3>
<p>Overview page tunnels, connectors, identity aur feeds ki health list karta hai. Warnings <b>derived</b> hote hain: portal settings se calculate karta hai, koi type nahi karta. Is lab mein Alerts page dikhata hai ki ek location par authentication off hai. <b>Location</b> portal mein ek site ka record hai: uska forwarding method, public IP, aur users ko sign in karna zaroori hai ya nahi.</p>
<pre class="out">Alerts and audit  &gt;  Alerts
Severity  Alert
<span class="hl">warning   Location Jaipur Branch: authentication is off (users are anonymous)</span>
info      All tunnels up, all connectors enrolled
Locations and edge devices
Location        Method   Auth required   Enabled
Pune HQ         ipsec    yes             yes
Chennai Branch  gre      yes             yes
Jaipur Branch   pac      <span class="hl">no</span>              yes</pre>
<p>Method: <b>Locations and edge devices</b> kholo, location select karo, authentication setting on karo, Activate changes dabao, phir Alerts par wapas jaakar confirm karo ki warning chali gayi. Kyun matter karta hai? Authentication off ho to cloud ko user ka pata nahi hota, to Sales jaise group ka rule match nahi kar sakta. Anonymous traffic neeche wale kisi bhi rule par gir jaata hai.</p>

<div class="warn"><p><b>Common galtiyan.</b> (1) Rule edit karke activate na karna. (2) Cause ki jagah alert text theek karne ki koshish; alerts tabhi jaate hain jab setting sahi ho. (3) Authentication on karke bhool jaana ki sign-in kaam karna chahiye (module zs-id).</p></div>
<div class="exam"><p><b>Exam trap.</b> "Alert kehta hai users anonymous hain; Sales ka rule kabhi match nahi karta." Cause location setting hai, rule nahi.</p></div>

<div class="scn"><h4>Woh alert jo kisi ne nahi padha</h4><p>Ek engineer ne naya branch jaldi mein setup kiya aur "jaldi test karne ke liye" authentication off chhod diya. Do hafte baad audit mein pata chala ki group-based social-media rule wahan kabhi lagu hi nahi hua, kyunki us branch ka har user anonymous tha. Overview page pehle din se yellow warning dikha raha tha.</p><p><b>Seekh:</b> har shift ki shuruaat mein Overview aur Alerts pages padho.</p></div>

<div class="iv"><p class="q">"Somvaar ko portal kholte ho. Sabse pehle kya dekhoge?"</p><p>Strong answer: Overview aur Alerts tunnel, connector, identity aur feed health ke liye; phir weekend ke changes ke liye audit log; phir complaint wala specific page. Bolo ki alerts settings se derive hote hain, to aap setting fix karte ho, alert nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Teen kaam: internet access, private access, digital experience; identity sabke neeche.</li>
<li>Sahyadri mein Pune (IPsec), Chennai (GRE), Jaipur (PAC) aur remote vikram (client connector) hain.</li>
<li>Terah portal pages; Policy tester proof tool hai.</li>
<li>Changes tab tak candidate hain jab tak Activate changes na dabao.</li>
<li>Alerts settings se calculate hote hain; cause fix karo, phir dobara check karo.</li>
</ul></div>
`}};export{e as default};