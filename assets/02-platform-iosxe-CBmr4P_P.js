var e={id:`platform-iosxe`,h:{en:`The Catalyst 9800 platform and the IOS XE CLI`,hi:`Catalyst 9800 platform aur IOS XE CLI`},body:{en:`
<p>Before building anything you need to know what you are logging in to and how to move around it. This chapter covers the 9800 family, its management options, and the CLI habits you will use in every lab.</p>

<h3>Form factors</h3>
<p>The 9800 comes in several shapes, but they all run the same IOS XE wireless software and the same configuration model. Once you learn one, you know them all.</p>
<table class="cmp"><tr><th>Type</th><th>What it is</th><th>Typical use</th></tr>
<tr><td>9800-80, 9800-40, 9800-L</td><td>Hardware appliances of different capacity</td><td>Large campus, mid-size site, small site</td></tr>
<tr><td>9800-CL</td><td>Virtual machine (private cloud or public cloud)</td><td>Data center, branch cloud, labs</td></tr>
<tr><td>Embedded Wireless Controller</td><td>Controller software inside a Catalyst 9100 AP or switch</td><td>Very small sites (concept, not simulated in the lab)</td></tr></table>
<p>Scale numbers differ by model and release, so check the datasheet before sizing. For the exam, remember the principle: the form factor changes capacity and interface names (for example TenGigabitEthernet ports on appliances, GigabitEthernet1 on the virtual one), not the profile-and-tag logic.</p>

<h3>How you manage it</h3>
<ul>
<li><b>CLI</b> over SSH or console. This is what the labs use.</li>
<li><b>Web UI</b> (HTTPS), with a day-0 wizard and a monitoring dashboard. The simulator has a 9800-style web UI on WLC1 too; the lab chapters show its menu paths, but the lessons stay CLI-first.</li>
<li><b>NETCONF and RESTCONF</b> with YANG models for automation, and streaming telemetry. Concept only here.</li>
<li><b>Cisco Catalyst Center</b> (formerly Cisco Catalyst Center) for fabric, assurance and automation. Not simulated in the lab. Coming up: module wl-auto (Catalyst Center, Spaces and automation).</li>
</ul>
<p>Everything the GUI does ends up as the same configuration objects you see in the CLI, so learning the CLI makes the GUI easy.</p>

<h3>IOS XE in one page</h3>
<p>IOS XE has modes. The prompt tells you where you are, and a surprising number of beginner mistakes are simply "right command, wrong mode".</p>
<table class="cmp"><tr><th>Mode</th><th>Prompt</th><th>Enter with</th></tr>
<tr><td>User</td><td><code>WLC1&gt;</code></td><td>login</td></tr>
<tr><td>Privileged</td><td><code>WLC1#</code></td><td><code>enable</code></td></tr>
<tr><td>Global config</td><td><code>WLC1(config)#</code></td><td><code>configure terminal</code></td></tr>
<tr><td>WLAN</td><td><code>WLC1(config-wlan)#</code></td><td><code>wlan NK-STAFF 1 NK-STAFF</code></td></tr>
<tr><td>Policy profile</td><td><code>WLC1(config-wireless-policy)#</code></td><td><code>wireless profile policy PP-STAFF</code></td></tr>
<tr><td>Policy tag</td><td><code>WLC1(config-policy-tag)#</code></td><td><code>wireless tag policy PT-CAMPUS</code></td></tr></table>
<p><code>exit</code> goes back one level, <code>end</code> returns to privileged mode, and <code>no</code> in front of a command removes or reverses it. Configuration is held in the <b>running-config</b> in memory; <code>write memory</code> copies it to the <b>startup-config</b> so it survives a reload. Forgetting to save is a classic cause of "it worked yesterday".</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="CLI modes">
<rect x="10" y="50" width="110" height="46" rx="8" fill="#e2e8f0"/><text x="65" y="78" text-anchor="middle" class="svg-ink" font-size="13">WLC1&gt;</text>
<rect x="150" y="50" width="110" height="46" rx="8" fill="#bae6fd"/><text x="205" y="78" text-anchor="middle" class="svg-ink" font-size="13">WLC1#</text>
<rect x="290" y="50" width="130" height="46" rx="8" fill="#bbf7d0"/><text x="355" y="78" text-anchor="middle" class="svg-ink" font-size="13">(config)#</text>
<rect x="450" y="10" width="170" height="40" rx="8" fill="#ddd6fe"/><text x="535" y="35" text-anchor="middle" class="svg-ink" font-size="12">(config-wlan)#</text>
<rect x="450" y="100" width="170" height="40" rx="8" fill="#fde68a"/><text x="535" y="125" text-anchor="middle" class="svg-ink" font-size="12">(config-policy-tag)#</text>
<line x1="120" y1="73" x2="150" y2="73" stroke="#64748b"/><line x1="260" y1="73" x2="290" y2="73" stroke="#64748b"/><line x1="420" y1="65" x2="450" y2="32" stroke="#64748b"/><line x1="420" y1="82" x2="450" y2="118" stroke="#64748b"/>
<text x="135" y="45" text-anchor="middle" class="svg-muted" font-size="11">enable</text><text x="275" y="45" text-anchor="middle" class="svg-muted" font-size="11">conf t</text>
</svg><p class="cap">Moving deeper: enable, configure terminal, then a sub-mode per object. exit steps back one level.</p></div>

<h3>Four reading habits</h3>
<ol>
<li><b>Question mark</b> after any word lists valid next words.</li>
<li><b>Abbreviations and Tab</b>: <code>sh ap sum</code> works if it is unambiguous.</li>
<li><b>Output filters</b>: <code>show running-config | section wlan</code> prints only the WLAN blocks; <code>include</code>, <code>begin</code> and <code>exclude</code> work too.</li>
<li><b>Summary before detail</b>: use a <code>summary</code> view first, then <code>detailed</code> for one object.</li>
</ol>

<h3>Which show commands you will use</h3>
<pre class="out">WLC1# show version
CONFIG Catalyst 9800-style wireless controller learning model (educational, not Cisco software)
Hostname: WLC1

WLC1# show running-config | section wireless
<span class="hl">wireless management interface Vlan99</span>
wireless profile policy PP-STAFF
 vlan 20
 no shutdown</pre>
<p>Notice that profiles appear as their own blocks in the running-config. That is the tag model showing through: objects are separate, and links between them are written as references by name.</p>

<h3>Old and new controllers</h3>
<p>Older AireOS controllers used commands like <code>config wlan ...</code> and kept one monolithic WLAN configuration with AP groups. The 9800 replaced this with the profile-and-tag model. In the exam and in interviews you may be asked to compare them. The old style appears only in the CCNA and ENCOR modules; do not type AireOS commands on a 9800.</p>

<div class="eg"><p><b>Worked example.</b> You type <code>vlan 20</code> and the prompt changes to <code>(config-vlan)#</code>. You add <code>name STAFF</code> then <code>exit</code>. Later you want to see it: <code>show vlan brief | include STAFF</code> prints just that line, which is faster than reading all VLANs.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Typing a <code>show</code> command at <code>(config)#</code> and getting an error; use <code>do show ...</code> or leave config mode first. (2) Editing without saving: always <code>write memory</code> after a change you want to keep. (3) Logging in to a hardware controller and applying virtual-machine interface names, or the other way round.</p></div>
<div class="exam"><p><b>Exam trap.</b> Forms differ (appliance, virtual, embedded) but the software model is common. If a question asks what changes between a 9800-40 and a 9800-CL in terms of profiles and tags, the answer is nothing.</p></div>

<div class="scn"><h4>The unsaved fix</h4><p>An engineer repaired a policy profile during an outage, tested successfully and went home. A power cut reloaded the controller overnight and the SSID vanished the next morning. The fix existed only in running-config. The team added <code>write memory</code> to the change checklist and compared <code>show running-config</code> with <code>show startup-config</code> after each change.</p><p><b>Lesson:</b> a working network is not a saved network.</p></div>

<div class="iv"><p class="q">"What operating system does the Catalyst 9800 run and why does it matter?"</p><p>Strong answer: IOS XE, a modular Linux-based OS shared with Catalyst 9000 switches. It matters because the CLI is familiar, programmability (NETCONF, RESTCONF, YANG) is built in, and the same configuration model applies across appliance, virtual and embedded forms.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>9800 comes as appliances, a virtual 9800-CL and embedded options, all with one software model.</li>
<li>CLI, web UI and model-driven APIs all show the same configuration objects.</li>
<li>The prompt shows the mode; most early errors are wrong-mode errors.</li>
<li>running-config is memory, startup-config is saved; use write memory.</li>
<li>Use summary views first and filters such as section and include.</li>
</ul></div>
`,hi:`
<p>Kuch bhi banane se pehle aapko pata hona chahiye ki aap kis cheez mein login kar rahe ho aur usmein ghoomna kaise hai. Yeh chapter 9800 family, uske management options aur woh CLI aadatein cover karta hai jo har lab mein use hongi.</p>

<h3>Form factors</h3>
<p>9800 kai shapes mein aata hai, lekin sab same IOS XE wireless software aur same configuration model chalate hain. Ek seekh liya to sab aa gaye.</p>
<table class="cmp"><tr><th>Type</th><th>Kya hai</th><th>Typical use</th></tr>
<tr><td>9800-80, 9800-40, 9800-L</td><td>Alag capacity ke hardware appliances</td><td>Bada campus, mid-size site, chhota site</td></tr>
<tr><td>9800-CL</td><td>Virtual machine (private cloud ya public cloud)</td><td>Data center, branch cloud, labs</td></tr>
<tr><td>Embedded Wireless Controller</td><td>Catalyst 9100 AP ya switch ke andar controller software</td><td>Bahut chhote sites (concept, lab mein simulated nahi)</td></tr></table>
<p>Scale numbers model aur release ke hisaab se alag hote hain, isliye sizing se pehle datasheet dekho. Exam ke liye principle yaad rakho: form factor capacity aur interface names badalta hai (jaise appliances par TenGigabitEthernet ports, virtual par GigabitEthernet1), profile-and-tag logic nahi.</p>

<h3>Ise manage kaise karte hain</h3>
<ul>
<li><b>CLI</b> SSH ya console par. Labs yahi use karte hain.</li>
<li><b>Web UI</b> (HTTPS), day-0 wizard aur monitoring dashboard ke saath. Simulator mein WLC1 par 9800-style web UI bhi hai; lab chapters uske menu paths dikhate hain, lekin lessons CLI-first rehte hain.</li>
<li><b>NETCONF aur RESTCONF</b> YANG models ke saath automation ke liye, aur streaming telemetry. Yahan sirf concept.</li>
<li><b>Cisco Catalyst Center</b> (pehle Cisco Catalyst Center) fabric, assurance aur automation ke liye. Lab mein simulated nahi. Aage aane wala module: wl-auto (Catalyst Center, Spaces and automation).</li>
</ul>
<p>GUI jo bhi karta hai woh wahi configuration objects ban jaate hain jo CLI mein dikhte hain, isliye CLI seekhne se GUI aasan ho jaata hai.</p>

<h3>IOS XE ek page mein</h3>
<p>IOS XE mein modes hote hain. Prompt batata hai aap kahan ho, aur beginner ki bahut saari galtiyan bas "sahi command, galat mode" hoti hain.</p>
<table class="cmp"><tr><th>Mode</th><th>Prompt</th><th>Kaise enter karein</th></tr>
<tr><td>User</td><td><code>WLC1&gt;</code></td><td>login</td></tr>
<tr><td>Privileged</td><td><code>WLC1#</code></td><td><code>enable</code></td></tr>
<tr><td>Global config</td><td><code>WLC1(config)#</code></td><td><code>configure terminal</code></td></tr>
<tr><td>WLAN</td><td><code>WLC1(config-wlan)#</code></td><td><code>wlan NK-STAFF 1 NK-STAFF</code></td></tr>
<tr><td>Policy profile</td><td><code>WLC1(config-wireless-policy)#</code></td><td><code>wireless profile policy PP-STAFF</code></td></tr>
<tr><td>Policy tag</td><td><code>WLC1(config-policy-tag)#</code></td><td><code>wireless tag policy PT-CAMPUS</code></td></tr></table>
<p><code>exit</code> ek level peeche le jaata hai, <code>end</code> privileged mode mein wapas, aur command ke aage <code>no</code> usse hata ya ulat deta hai. Configuration memory ke <b>running-config</b> mein rehti hai; <code>write memory</code> use <b>startup-config</b> mein copy karta hai taaki reload ke baad bachi rahe. Save karna bhoolna "kal chal raha tha" ka classic karan hai.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="CLI modes">
<rect x="10" y="50" width="110" height="46" rx="8" fill="#e2e8f0"/><text x="65" y="78" text-anchor="middle" class="svg-ink" font-size="13">WLC1&gt;</text>
<rect x="150" y="50" width="110" height="46" rx="8" fill="#bae6fd"/><text x="205" y="78" text-anchor="middle" class="svg-ink" font-size="13">WLC1#</text>
<rect x="290" y="50" width="130" height="46" rx="8" fill="#bbf7d0"/><text x="355" y="78" text-anchor="middle" class="svg-ink" font-size="13">(config)#</text>
<rect x="450" y="10" width="170" height="40" rx="8" fill="#ddd6fe"/><text x="535" y="35" text-anchor="middle" class="svg-ink" font-size="12">(config-wlan)#</text>
<rect x="450" y="100" width="170" height="40" rx="8" fill="#fde68a"/><text x="535" y="125" text-anchor="middle" class="svg-ink" font-size="12">(config-policy-tag)#</text>
<line x1="120" y1="73" x2="150" y2="73" stroke="#64748b"/><line x1="260" y1="73" x2="290" y2="73" stroke="#64748b"/><line x1="420" y1="65" x2="450" y2="32" stroke="#64748b"/><line x1="420" y1="82" x2="450" y2="118" stroke="#64748b"/>
<text x="135" y="45" text-anchor="middle" class="svg-muted" font-size="11">enable</text><text x="275" y="45" text-anchor="middle" class="svg-muted" font-size="11">conf t</text>
</svg><p class="cap">Gehre jaana: enable, configure terminal, phir har object ka sub-mode. exit ek level peeche.</p></div>

<h3>Padhne ki chaar aadatein</h3>
<ol>
<li><b>Question mark</b> kisi bhi word ke baad valid next words dikhata hai.</li>
<li><b>Abbreviations aur Tab</b>: <code>sh ap sum</code> chalta hai agar unambiguous ho.</li>
<li><b>Output filters</b>: <code>show running-config | section wlan</code> sirf WLAN blocks dikhata hai; <code>include</code>, <code>begin</code> aur <code>exclude</code> bhi chalte hain.</li>
<li><b>Pehle summary, phir detail</b>: pehle <code>summary</code> view, phir ek object ke liye <code>detailed</code>.</li>
</ol>

<h3>Kaunse show commands use honge</h3>
<pre class="out">WLC1# show version
CONFIG Catalyst 9800-style wireless controller learning model (educational, not Cisco software)
Hostname: WLC1

WLC1# show running-config | section wireless
<span class="hl">wireless management interface Vlan99</span>
wireless profile policy PP-STAFF
 vlan 20
 no shutdown</pre>
<p>Dhyan do ki profiles running-config mein apne alag blocks ki tarah dikhte hain. Yahi tag model hai: objects alag hain, aur unke beech links naam se references ki tarah likhe jaate hain.</p>

<h3>Purane aur naye controllers</h3>
<p>Purane AireOS controllers <code>config wlan ...</code> jaise commands use karte the aur ek monolithic WLAN configuration AP groups ke saath rakhte the. 9800 ne ise profile-and-tag model se replace kiya. Exam aur interview mein compare karne ko pooch sakte hain. Purana style sirf CCNA aur ENCOR modules mein aata hai; 9800 par AireOS commands type mat karo.</p>

<div class="eg"><p><b>Worked example.</b> Aap <code>vlan 20</code> type karte ho aur prompt <code>(config-vlan)#</code> ho jaata hai. <code>name STAFF</code> add karte ho phir <code>exit</code>. Baad mein dekhna ho: <code>show vlan brief | include STAFF</code> sirf wahi line dikhata hai, jo saare VLANs padhne se tez hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) <code>(config)#</code> par <code>show</code> command type karke error pana; <code>do show ...</code> use karo ya pehle config mode se bahar aao. (2) Bina save kiye edit karna: jo change rakhna ho uske baad hamesha <code>write memory</code>. (3) Hardware controller mein login karke virtual machine ke interface names lagana, ya ulta.</p></div>
<div class="exam"><p><b>Exam trap.</b> Forms alag hain (appliance, virtual, embedded) lekin software model common hai. Agar sawal poochhe ki 9800-40 aur 9800-CL ke beech profiles aur tags ke terms mein kya badalta hai, jawab hai kuch nahi.</p></div>

<div class="scn"><h4>Unsaved fix</h4><p>Ek engineer ne outage ke dauran policy profile repair kiya, test successful raha aur woh ghar chala gaya. Raat ko power cut se controller reload hua aur agli subah SSID gayab tha. Fix sirf running-config mein tha. Team ne change checklist mein <code>write memory</code> joda aur har change ke baad <code>show running-config</code> ko <code>show startup-config</code> se compare kiya.</p><p><b>Seekh:</b> chalta hua network saved network nahi hota.</p></div>

<div class="iv"><p class="q">"Catalyst 9800 kaunsa operating system chalata hai aur isse kya farak padta hai?"</p><p>Strong answer: IOS XE, ek modular Linux-based OS jo Catalyst 9000 switches ke saath shared hai. Farak yeh ki CLI jaana-pehchana hai, programmability (NETCONF, RESTCONF, YANG) built-in hai, aur same configuration model appliance, virtual aur embedded forms par lagu hota hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>9800 appliances, virtual 9800-CL aur embedded options mein aata hai, sab ek software model ke saath.</li>
<li>CLI, web UI aur model-driven APIs sab wahi configuration objects dikhate hain.</li>
<li>Prompt mode dikhata hai; shuruaati errors zyadatar wrong-mode errors hote hain.</li>
<li>running-config memory hai, startup-config saved hai; write memory use karo.</li>
<li>Pehle summary views aur section, include jaise filters use karo.</li>
</ul></div>
`}};export{e as default};