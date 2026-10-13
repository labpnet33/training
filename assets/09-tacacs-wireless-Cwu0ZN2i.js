var e={id:`tacacs-wireless`,h:{en:`TACACS+ and wireless controllers: other kinds of NAD (concept)`,hi:`TACACS+ aur wireless controllers: NAD ke doosre types (concept)`},body:{en:`
<div class="note"><p><b>Not simulated in the lab.</b> The lab has one wired access switch and RADIUS only. TACACS+ device administration, Aruba wireless controllers, Instant APs and AirGroup are real features described here honestly, but you cannot configure them in the lab. The ClearPass ideas you learned (NAD, secret, source IP, service classification, role, enforcement) all carry over unchanged.</p></div>

<p>A building has two kinds of doors. One is the front door for <b>people who want to use the network</b>. The other is a locked equipment room for <b>engineers who want to administer the network devices</b>. ClearPass guards both, using two different protocols: <b>RADIUS</b> for network access and <b>TACACS+</b> for device administration.</p>

<h3>TACACS+ in one page</h3>
<p><b>TACACS+</b> (Terminal Access Controller Access-Control System Plus) is a protocol over <b>TCP port 49</b>. When an engineer logs in to a switch by SSH, the switch can ask ClearPass: is this engineer allowed in, which privilege level do they get, and may they type this command? TACACS+ separates the three As: <b>authentication</b> (who), <b>authorization</b> (what they may do, down to individual commands) and <b>accounting</b> (a record of commands typed). The whole packet body is encrypted with the shared secret, while RADIUS only hides the password attribute.</p>
<table class="cmp"><tr><th>Item</th><th>RADIUS</th><th>TACACS+</th></tr>
<tr><td>Typical use</td><td>Network access (802.1X, MAC auth, VPN, Wi-Fi)</td><td>Device administration (CLI login)</td></tr>
<tr><td>Transport</td><td>UDP 1812 and 1813</td><td>TCP 49</td></tr>
<tr><td>AAA separation</td><td>Authentication and authorization combined</td><td>Separate</td></tr>
<tr><td>Encryption</td><td>Password attribute only</td><td>Whole body</td></tr>
<tr><td>Per-command control</td><td>No</td><td>Yes</td></tr></table>

<h3>How ClearPass handles TACACS+</h3>
<p>In the real GUI you create a <b>service of type TACACS+ Enforcement</b>, with its own classification rules, an authentication source (often Active Directory), a role mapping and an enforcement policy. The enforcement profile is a <b>TACACS+ profile</b>: a privilege level and optionally command sets that permit or deny commands. The network device entry (chapter 2) holds a <b>TACACS+ shared secret</b>, separate from the RADIUS secret. The same early checks apply: unknown device or wrong secret means the request fails before any policy.</p>
<p>On the switch you point login authentication at the TACACS+ server group and keep a <b>local fallback account</b>. Check the exact commands for your AOS-CX release, because the syntax differs between platforms; the idea is: define the server and key, create a group, and make login authentication try the group first and local second.</p>

<div class="warn"><p><b>Lockout danger.</b> If you move device login to TACACS+ without a working local fallback, a mistyped secret or an unreachable server locks every administrator out of the switches. Always keep a tested local emergency account and test with a second session open.</p></div>

<h3>Wireless controllers as NADs</h3>
<p>For Wi-Fi the NAD is not the access point alone. In an Aruba design it is usually a <b>controller</b> (a Mobility Controller or Gateway) or an <b>Instant AP cluster</b> managed by a virtual controller. The client authenticates over the air, and the controller or AP acts as the authenticator, sending RADIUS to ClearPass. Compare it with the wired model you built:</p>
<table class="cmp"><tr><th>Concept</th><th>Wired lab (ACCESS)</th><th>Wireless</th></tr>
<tr><td>NAD</td><td>Access switch</td><td>Controller or Instant AP cluster</td></tr>
<tr><td>NAS-Port-Type</td><td>15 (Ethernet)</td><td>19 (Wireless IEEE 802.11)</td></tr>
<tr><td>ClearPass service template</td><td>wired-802.1x</td><td>wireless-802.1x</td></tr>
<tr><td>Role returned</td><td>Aruba-User-Role = switch role</td><td>Aruba-User-Role = controller user role</td></tr>
<tr><td>Where roles are defined</td><td>port-access role on the switch</td><td>user roles on the controller</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Wired and wireless NAD paths">
<rect x="20" y="20" width="130" height="44" rx="8" fill="#bae6fd"/><text x="85" y="47" text-anchor="middle" class="svg-ink" font-size="13">LAPTOP1 wired</text>
<rect x="20" y="150" width="130" height="44" rx="8" fill="#ddd6fe"/><text x="85" y="177" text-anchor="middle" class="svg-ink" font-size="13">Phone on Wi-Fi</text>
<rect x="240" y="20" width="150" height="44" rx="8" fill="#bae6fd"/><text x="315" y="40" text-anchor="middle" class="svg-ink" font-size="13">Access switch</text><text x="315" y="56" text-anchor="middle" class="svg-muted" font-size="12">NAS-Port-Type 15</text>
<rect x="240" y="150" width="150" height="44" rx="8" fill="#ddd6fe"/><text x="315" y="170" text-anchor="middle" class="svg-ink" font-size="13">Controller / IAP</text><text x="315" y="186" text-anchor="middle" class="svg-muted" font-size="12">NAS-Port-Type 19</text>
<rect x="490" y="80" width="130" height="64" rx="8" fill="#bbf7d0"/><text x="555" y="108" text-anchor="middle" class="svg-ink" font-size="14">ClearPass</text><text x="555" y="126" text-anchor="middle" class="svg-muted" font-size="12">two services</text>
<line x1="150" y1="42" x2="240" y2="42" stroke="#64748b" stroke-width="2"/><line x1="150" y1="172" x2="240" y2="172" stroke="#64748b" stroke-width="2"/>
<line x1="390" y1="42" x2="490" y2="100" stroke="#64748b" stroke-width="2"/><line x1="390" y1="172" x2="490" y2="126" stroke="#64748b" stroke-width="2"/>
<text x="320" y="218" text-anchor="middle" class="svg-muted" font-size="12">The NAS-Port-Type attribute is what steers a request into the right service</text>
</svg><p class="cap">Wired and wireless NADs both feed ClearPass; classification rules on NAS-Port-Type separate the services.</p></div>

<h3>What changes for wireless onboarding</h3>
<ul>
<li><b>Register every NAD.</b> The controller or the Instant AP cluster address must be a network device with the right secret. With Instant APs, check which address sources the RADIUS requests (the virtual controller address or each AP address, depending on configuration) and register accordingly; test in a lab, because this is a classic source-IP surprise.</li>
<li><b>Roles live on the controller.</b> The returned Aruba-User-Role must match a user role defined on the controller, with the same exact spelling and case, just like the wired switch role.</li>
<li><b>CoA works the same way.</b> Port 3799, the same secret on both ends.</li>
<li><b>Service classification.</b> A wired service must not match wireless requests and the other way round. This is precisely the cp-service-miss mistake from the earlier module: a service cloned from the wireless one still looked for NAS-Port-Type 19.</li>
<li><b>AirGroup.</b> A feature in which ClearPass lets users share Bonjour-style services (printers, Apple TV) across VLANs by policy. Concept only here.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> A school has wired classrooms and Wi-Fi. A teacher request from the controller arrives with NAS-Port-Type 19 and matches the Wireless 802.1X service. The role mapping gives TEACHER, and the enforcement profile returns Aruba-User-Role TEACHER. The controller has a user role named TEACHER with firewall rules. The same teacher plugging into a classroom wall port matches the Wired 802.1X service, so one identity gets consistent roles on two kinds of NAD.</p></div>

<div class="exam"><p><b>Exam trap.</b> TACACS+ uses TCP 49 and a secret separate from RADIUS. RADIUS is for network access, TACACS+ for device administration. Also, Wi-Fi uses NAS-Port-Type 19 and wired Ethernet uses 15.</p></div>

<div class="scn"><h4>Wi-Fi works, wired is dead after a clone</h4><p>An engineer built a new Wired 802.1X service by cloning the Wireless 802.1X one to save time and left the classification rule on NAS-Port-Type 19. Wi-Fi logins still worked because the old wireless service sat above it, but wired logins matched no service and failed with error 9002 in the Access Tracker. The fix was to change the clone's rule to NAS-Port-Type 15 and keep Service-Type 1, 2 or 8.</p><p><b>Lesson:</b> when you clone services, review the classification rule first.</p></div>

<div class="iv"><p class="q">"What is the difference between RADIUS and TACACS+, and when would you use each with ClearPass?"</p><p>Strong answer: RADIUS (UDP) combines authentication and authorization and is used for user network access such as 802.1X, MAC authentication, VPN and Wi-Fi. TACACS+ (TCP 49) separates the three As, encrypts the whole body and supports per-command authorization, so it is used for administrator logins to network devices. ClearPass offers both, with a TACACS+ service type and a TACACS+ profile. I would add the local fallback account to avoid lockout.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>RADIUS is for network access; TACACS+ (TCP 49) is for device administration with command-level control.</li>
<li>A NAD can also be a wireless controller or Instant AP cluster; the same trust rules (IP, secret) apply.</li>
<li>NAS-Port-Type 15 is wired and 19 is wireless; services must be classified accordingly.</li>
<li>Roles are defined on the NAD and referenced by name; exact spelling matters on controllers too.</li>
<li>Keep a local fallback account when you move device login to TACACS+. Not simulated in the lab.</li>
</ul></div>
`,hi:`
<div class="note"><p><b>Lab mein simulate nahi hota.</b> Lab mein ek wired access switch aur sirf RADIUS hai. TACACS+ device administration, Aruba wireless controllers, Instant APs aur AirGroup real features hain jinhe yahan imaandaari se describe kiya gaya hai, par aap unhe lab mein configure nahi kar sakte. Jo ClearPass ideas aapne seekhe (NAD, secret, source IP, service classification, role, enforcement) woh sab bina badle aage chalte hain.</p></div>

<p>Ek building mein do tarah ke darwaze hote hain. Ek front door hai <b>un logon ke liye jo network use karna chahte hain</b>. Doosra locked equipment room hai <b>un engineers ke liye jo network devices administer karna chahte hain</b>. ClearPass dono ki raksha karta hai, do alag protocols se: network access ke liye <b>RADIUS</b> aur device administration ke liye <b>TACACS+</b>.</p>

<h3>TACACS+ ek page mein</h3>
<p><b>TACACS+</b> (Terminal Access Controller Access-Control System Plus) <b>TCP port 49</b> par chalne wala protocol hai. Jab engineer SSH se switch mein login karta hai, switch ClearPass se pooch sakta hai: kya yeh engineer andar aa sakta hai, use kaunsa privilege level milega, aur kya woh yeh command type kar sakta hai? TACACS+ teen A alag karta hai: <b>authentication</b> (kaun), <b>authorization</b> (kya kar sakta hai, individual commands tak) aur <b>accounting</b> (type kiye gaye commands ka record). Packet ki poori body shared secret se encrypt hoti hai, jabki RADIUS sirf password attribute chhupata hai.</p>
<table class="cmp"><tr><th>Item</th><th>RADIUS</th><th>TACACS+</th></tr>
<tr><td>Typical use</td><td>Network access (802.1X, MAC auth, VPN, Wi-Fi)</td><td>Device administration (CLI login)</td></tr>
<tr><td>Transport</td><td>UDP 1812 aur 1813</td><td>TCP 49</td></tr>
<tr><td>AAA separation</td><td>Authentication aur authorization combined</td><td>Alag</td></tr>
<tr><td>Encryption</td><td>Sirf password attribute</td><td>Poori body</td></tr>
<tr><td>Per-command control</td><td>Nahi</td><td>Haan</td></tr></table>

<h3>ClearPass TACACS+ kaise handle karta hai</h3>
<p>Real GUI mein aap <b>TACACS+ Enforcement type ki service</b> banate ho, jisme apne classification rules, authentication source (aksar Active Directory), role mapping aur enforcement policy hote hain. Enforcement profile <b>TACACS+ profile</b> hota hai: privilege level aur optionally command sets jo commands permit ya deny karte hain. Network device entry (chapter 2) mein <b>TACACS+ shared secret</b> hota hai, RADIUS secret se alag. Wahi shuruaati checks lagte hain: unknown device ya wrong secret ka matlab request kisi bhi policy se pehle fail ho jaati hai.</p>
<p>Switch par aap login authentication ko TACACS+ server group par point karte ho aur ek <b>local fallback account</b> rakhte ho. Apni AOS-CX release ke exact commands check karo, kyunki syntax platforms ke beech badalta hai; idea yeh hai: server aur key define karo, group banao, aur login authentication ko pehle group aur phir local try karne do.</p>

<div class="warn"><p><b>Lockout ka khatra.</b> Agar aap device login ko working local fallback ke bina TACACS+ par move karte ho, to galat type kiya secret ya unreachable server har administrator ko switches se bahar kar deta hai. Hamesha tested local emergency account rakho aur doosra session khula rakhkar test karo.</p></div>

<h3>Wireless controllers NAD ke roop mein</h3>
<p>Wi-Fi ke liye NAD akela access point nahi hota. Aruba design mein yeh aam taur par <b>controller</b> (Mobility Controller ya Gateway) ya virtual controller se manage hone wala <b>Instant AP cluster</b> hota hai. Client air par authenticate karta hai, aur controller ya AP authenticator ki tarah ClearPass ko RADIUS bhejta hai. Isse us wired model se compare karo jo aapne banaya:</p>
<table class="cmp"><tr><th>Concept</th><th>Wired lab (ACCESS)</th><th>Wireless</th></tr>
<tr><td>NAD</td><td>Access switch</td><td>Controller ya Instant AP cluster</td></tr>
<tr><td>NAS-Port-Type</td><td>15 (Ethernet)</td><td>19 (Wireless IEEE 802.11)</td></tr>
<tr><td>ClearPass service template</td><td>wired-802.1x</td><td>wireless-802.1x</td></tr>
<tr><td>Role returned</td><td>Aruba-User-Role = switch role</td><td>Aruba-User-Role = controller user role</td></tr>
<tr><td>Roles kahan define hote hain</td><td>switch par port-access role</td><td>controller par user roles</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Wired aur wireless NAD paths">
<rect x="20" y="20" width="130" height="44" rx="8" fill="#bae6fd"/><text x="85" y="47" text-anchor="middle" class="svg-ink" font-size="13">LAPTOP1 wired</text>
<rect x="20" y="150" width="130" height="44" rx="8" fill="#ddd6fe"/><text x="85" y="177" text-anchor="middle" class="svg-ink" font-size="13">Phone Wi-Fi par</text>
<rect x="240" y="20" width="150" height="44" rx="8" fill="#bae6fd"/><text x="315" y="40" text-anchor="middle" class="svg-ink" font-size="13">Access switch</text><text x="315" y="56" text-anchor="middle" class="svg-muted" font-size="12">NAS-Port-Type 15</text>
<rect x="240" y="150" width="150" height="44" rx="8" fill="#ddd6fe"/><text x="315" y="170" text-anchor="middle" class="svg-ink" font-size="13">Controller / IAP</text><text x="315" y="186" text-anchor="middle" class="svg-muted" font-size="12">NAS-Port-Type 19</text>
<rect x="490" y="80" width="130" height="64" rx="8" fill="#bbf7d0"/><text x="555" y="108" text-anchor="middle" class="svg-ink" font-size="14">ClearPass</text><text x="555" y="126" text-anchor="middle" class="svg-muted" font-size="12">do services</text>
<line x1="150" y1="42" x2="240" y2="42" stroke="#64748b" stroke-width="2"/><line x1="150" y1="172" x2="240" y2="172" stroke="#64748b" stroke-width="2"/>
<line x1="390" y1="42" x2="490" y2="100" stroke="#64748b" stroke-width="2"/><line x1="390" y1="172" x2="490" y2="126" stroke="#64748b" stroke-width="2"/>
<text x="320" y="218" text-anchor="middle" class="svg-muted" font-size="12">NAS-Port-Type attribute request ko sahi service mein bhejta hai</text>
</svg><p class="cap">Wired aur wireless NADs dono ClearPass ko feed karte hain; NAS-Port-Type par classification rules services ko alag karte hain.</p></div>

<h3>Wireless onboarding mein kya badalta hai</h3>
<ul>
<li><b>Har NAD register karo.</b> Controller ya Instant AP cluster ka address right secret ke saath network device hona chahiye. Instant APs ke saath check karo ki RADIUS requests kaunsa address source karta hai (virtual controller address ya har AP ka address, configuration ke hisaab se) aur usi hisaab se register karo; lab mein test karo, kyunki yeh classic source-IP surprise hai.</li>
<li><b>Roles controller par hote hain.</b> Return kiya gaya Aruba-User-Role controller par defined user role se match hona chahiye, same exact spelling aur case ke saath, bilkul wired switch role ki tarah.</li>
<li><b>CoA same tarah kaam karta hai.</b> Port 3799, dono ends par same secret.</li>
<li><b>Service classification.</b> Wired service wireless requests match nahi karni chahiye aur ulta bhi. Yahi pichhle module ki cp-service-miss galti hai: wireless se clone ki hui service ab bhi NAS-Port-Type 19 dhoondhti thi.</li>
<li><b>AirGroup.</b> Aisa feature jisme ClearPass policy se users ko Bonjour-style services (printers, Apple TV) VLANs ke across share karne deta hai. Yahan sirf concept.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Ek school mein wired classrooms aur Wi-Fi hain. Controller se teacher ki request NAS-Port-Type 19 ke saath aati hai aur Wireless 802.1X service se match hoti hai. Role mapping TEACHER deti hai, aur enforcement profile Aruba-User-Role TEACHER return karta hai. Controller par TEACHER naam ka user role firewall rules ke saath hai. Wahi teacher classroom wall port mein plug kare to Wired 802.1X service match hoti hai, isliye ek identity ko do tarah ke NAD par consistent roles milte hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> TACACS+ TCP 49 aur RADIUS se alag secret use karta hai. RADIUS network access ke liye hai, TACACS+ device administration ke liye. Aur Wi-Fi NAS-Port-Type 19 use karta hai jabki wired Ethernet 15.</p></div>

<div class="scn"><h4>Clone ke baad Wi-Fi chalta hai, wired dead</h4><p>Ek engineer ne time bachane ke liye Wireless 802.1X service ko clone karke naya Wired 802.1X service banaya aur classification rule NAS-Port-Type 19 par chhod diya. Wi-Fi logins phir bhi chale kyunki purani wireless service uske upar thi, par wired logins kisi service se match nahi hue aur Access Tracker mein error 9002 ke saath fail hue. Fix tha clone ka rule NAS-Port-Type 15 karna aur Service-Type 1, 2 ya 8 rakhna.</p><p><b>Seekh:</b> services clone karte waqt sabse pehle classification rule review karo.</p></div>

<div class="iv"><p class="q">"RADIUS aur TACACS+ mein kya fark hai, aur ClearPass ke saath kab kaunsa use karoge?"</p><p>Strong answer: RADIUS (UDP) authentication aur authorization combine karta hai aur user network access jaise 802.1X, MAC authentication, VPN aur Wi-Fi ke liye use hota hai. TACACS+ (TCP 49) teen A alag karta hai, poori body encrypt karta hai aur per-command authorization support karta hai, isliye network devices par administrator logins ke liye use hota hai. ClearPass dono offer karta hai, TACACS+ service type aur TACACS+ profile ke saath. Main lockout se bachne ke liye local fallback account bhi jodunga.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>RADIUS network access ke liye hai; TACACS+ (TCP 49) command-level control ke saath device administration ke liye.</li>
<li>NAD wireless controller ya Instant AP cluster bhi ho sakta hai; wahi trust rules (IP, secret) lagte hain.</li>
<li>NAS-Port-Type 15 wired hai aur 19 wireless; services ko usi hisaab se classify karo.</li>
<li>Roles NAD par define hote hain aur naam se refer hote hain; controllers par bhi exact spelling matter karti hai.</li>
<li>Device login ko TACACS+ par move karte waqt local fallback account rakho. Lab mein simulate nahi hota.</li>
</ul></div>
`}};export{e as default};