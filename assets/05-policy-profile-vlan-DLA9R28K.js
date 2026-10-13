var e={id:`policy-profile-vlan`,h:{en:`Policy profile, VLAN database and central versus local switching`,hi:`Policy profile, VLAN database aur central versus local switching`},body:{en:`
<h3>The policy profile: where the client is placed</h3>
<p>The WLAN profile says <i>what the network is called and how it is secured</i>. The <b>policy profile</b> says <i>what happens to the client once it is in</i>: which VLAN it joins, how traffic is switched, and optional extras such as ACLs, QoS, session timeouts and AAA overrides. One WLAN profile can be used with several policy profiles (for example, one per building), and the policy tag decides which pair applies to which AP.</p>
<pre class="code">wireless profile policy PP-STAFF
 vlan 20
 no shutdown
 exit</pre>
<p>Rules the model enforces, same as the real platform:</p>
<ul>
<li>A new policy profile starts <b>shut down</b> (DISABLED). Until you run <code>no shutdown</code> it is not used by any AP.</li>
<li>It cannot be enabled until a VLAN is set.</li>
<li>The VLAN (or its name) cannot be changed while the profile is enabled. Shut it down first, change, then enable again.</li>
</ul>
<pre class="out">WLC1# show wireless profile policy detailed PP-STAFF

Policy Profile Name              : PP-STAFF
Description                      :
Status                           : <span class="hl">ENABLED</span>
VLAN                             : <span class="hl">20</span>
Central Switching                : ENABLED
Central Authentication           : ENABLED
Central DHCP                     : DISABLED</pre>

<h3>The VLAN database on the controller</h3>
<p>The policy profile only holds a VLAN <i>number</i> (or name). The controller must also <b>know that VLAN</b>. On the 9800 the VLAN database is the list of VLANs created with <code>vlan N</code> and <code>name</code>, just like on a switch. If a policy profile points to a VLAN that is not in the database, the controller cannot place the client in it: the client may associate at Layer 2 but never gets an address.</p>
<pre class="code">vlan 20
 name STAFF
 exit</pre>
<pre class="out">WLC1# show vlan brief

VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active
20   STAFF                            active
99   WLC-MGMT                         active</pre>
<p>Note two more things the VLAN needs to work end to end. First, the <b>trunk</b> from WLC1 to SW1 (GigabitEthernet1) must allow the VLAN. Second, R1 must have a gateway and DHCP scope for it. The controller VLAN database is the controller's own part of that chain; it is easy to forget because the switch and router are already fine.</p>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Client placement chain">
<rect x="10" y="60" width="110" height="60" rx="8" fill="#bae6fd"/><text x="65" y="95" text-anchor="middle" class="svg-ink" font-size="12">WLAN NK-STAFF</text>
<rect x="150" y="60" width="130" height="60" rx="8" fill="#ddd6fe"/><text x="215" y="85" text-anchor="middle" class="svg-ink" font-size="12">policy tag maps</text><text x="215" y="102" text-anchor="middle" class="svg-ink" font-size="12">to PP-STAFF</text>
<rect x="310" y="60" width="120" height="60" rx="8" fill="#bbf7d0"/><text x="370" y="85" text-anchor="middle" class="svg-ink" font-size="12">PP-STAFF</text><text x="370" y="102" text-anchor="middle" class="svg-ink" font-size="12">VLAN 20</text>
<rect x="460" y="60" width="170" height="60" rx="8" fill="#fde68a"/><text x="545" y="85" text-anchor="middle" class="svg-ink" font-size="12">VLAN 20 in WLC1</text><text x="545" y="102" text-anchor="middle" class="svg-ink" font-size="12">database + trunk</text>
<line x1="120" y1="90" x2="150" y2="90" stroke="#64748b"/><line x1="280" y1="90" x2="310" y2="90" stroke="#64748b"/><line x1="430" y1="90" x2="460" y2="90" stroke="#64748b"/>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">any broken link = client cannot be placed</text>
</svg><p class="cap">The client placement chain. Each box must exist and be enabled.</p></div>

<h3>Central switching versus local switching</h3>
<p>Another field of the policy profile is <b>central switching</b>. It decides where client data traffic is switched into the wired network.</p>
<table class="cmp"><tr><th></th><th>Central switching (local mode)</th><th>Local switching (FlexConnect)</th></tr>
<tr><td>Data path</td><td>Client to AP, CAPWAP data tunnel to WLC, then VLAN on the controller trunk</td><td>Client to AP, then straight into the AP's own switch port VLAN</td></tr>
<tr><td>Where VLAN is needed</td><td>On the controller trunk and VLAN database</td><td>On the AP's switch port (trunk) at the branch</td></tr>
<tr><td>Typical use</td><td>Campus, guest anchoring, central policy</td><td>Branch offices with a slow WAN</td></tr>
<tr><td>If WAN to WLC fails</td><td>Clients lose service</td><td>Existing clients may continue</td></tr></table>
<p>In the lab every policy profile uses <b>central switching</b> (shown as ENABLED). The AP is in local mode, so the VLAN lives on the controller. If someone disables central switching on a policy profile while the AP is in local mode, the model logs an error: the profile asks for local switching but the AP has no FlexConnect profile.</p>
<div class="note"><p><b>Not simulated in the lab.</b> FlexConnect, local switching, flex profiles, VLAN-to-ACL maps on the AP and native VLAN settings are concepts only. You should be able to say that with FlexConnect local switching the VLAN must exist on the AP switch port and the client IP is allocated locally at the branch.</p></div>

<h3>Putting it together: what decides a client's VLAN</h3>
<ol>
<li>The client joins the SSID, which is a WLAN profile.</li>
<li>The AP's policy tag maps that WLAN to a policy profile.</li>
<li>The policy profile gives the VLAN (and may be overridden by AAA attributes from RADIUS, concept).</li>
<li>The controller places the client in that VLAN if it is in the VLAN database, and sends frames on the trunk with that tag.</li>
<li>R1 DHCP answers for the subnet of that VLAN.</li>
</ol>
<div class="eg"><p>LAPTOP1 joins NK-STAFF on AP2. AP2 policy tag PT-CAMPUS maps NK-STAFF to PP-STAFF. PP-STAFF has VLAN 20, which is in the WLC1 database. Frames leave on GigabitEthernet1 tagged 20. R1 answers DHCP and leases 10.10.20.55. Gateway is 10.10.20.1.</p></div>

<h3>How faults show up</h3>
<p>The controller writes a log message when placement fails. In the lab, the key line is:</p>
<pre class="out">WLC1# show logging
%CLIENT_ORCH_LOG-3-VLAN_MISSING: policy profile PP-STAFF uses VLAN 20 which is not in the VLAN database; client cannot be placed</pre>
<p>Other related messages: an interface mapped to a missing VLAN, or a policy profile with central switching disabled while the AP is in local mode. Always read the log before changing anything.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Assuming "VLAN 20 exists on the switch and router, so it exists everywhere". The controller keeps its own VLAN database. (2) Trying to change the VLAN of an enabled policy profile and getting an error. (3) Forgetting to enable the policy profile after creating it. (4) Using the wrong VLAN number in the profile (for example 30 instead of 20).</p></div>
<div class="exam"><p><b>Exam trap.</b> The VLAN for a client comes from the policy profile, not the WLAN profile (on the 9800). On AireOS it was the WLAN-to-interface mapping. Know both.</p></div>

<div class="scn"><h4>Associated but no address</h4><p>After a staging error, a 9800 shows PP-STAFF enabled with VLAN 20. Phones associate and show full signal but get 169.254 addresses. The wired side is perfect. <code>show logging</code> reports VLAN_MISSING. The VLAN had never been created in the controller database. Creating <code>vlan 20</code> fixes it in seconds.</p><p><b>Lesson:</b> a policy VLAN needs to exist on the controller too.</p></div>

<div class="iv"><p class="q">"Where is the client VLAN defined on a 9800, and what must exist for it to work?"</p><p>In the policy profile. The VLAN must exist in the controller VLAN database, be allowed on the trunk to the switch, and have a gateway and DHCP on the router. The policy profile must be enabled and mapped in the AP's policy tag.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The policy profile holds the VLAN, central switching and other client policy.</li>
<li>New policy profiles start disabled; changing the VLAN needs shutdown first.</li>
<li>The VLAN must also exist in the controller VLAN database and on the trunk.</li>
<li>Central switching means data goes to the WLC; FlexConnect local switching is a concept only.</li>
<li>VLAN_MISSING in the log points at the VLAN database.</li>
</ul></div>
`,hi:`
<h3>Policy profile: jahan client ko place kiya jaata hai</h3>
<p>WLAN profile batata hai <i>network ka naam kya hai aur kaise secure hai</i>. <b>Policy profile</b> batata hai <i>client andar aane ke baad uske saath kya hota hai</i>: woh kaunse VLAN mein jayega, traffic kaise switch hoga, aur optional extras jaise ACLs, QoS, session timeouts aur AAA overrides. Ek WLAN profile kai policy profiles ke saath use ho sakta hai (jaise har building ke liye ek), aur policy tag decide karta hai ki kaunsa pair kaunse AP par lagu hoga.</p>
<pre class="code">wireless profile policy PP-STAFF
 vlan 20
 no shutdown
 exit</pre>
<p>Model jo rules enforce karta hai, real platform ki tarah:</p>
<ul>
<li>Naya policy profile <b>shut down</b> (DISABLED) se shuru hota hai. Jab tak aap <code>no shutdown</code> nahi karte, koi AP use use nahi karta.</li>
<li>Jab tak VLAN set na ho, use enable nahi kiya ja sakta.</li>
<li>Profile enabled hone par VLAN (ya uska naam) badla nahi ja sakta. Pehle shut down karo, badlo, phir dobara enable karo.</li>
</ul>
<pre class="out">WLC1# show wireless profile policy detailed PP-STAFF

Policy Profile Name              : PP-STAFF
Description                      :
Status                           : <span class="hl">ENABLED</span>
VLAN                             : <span class="hl">20</span>
Central Switching                : ENABLED
Central Authentication           : ENABLED
Central DHCP                     : DISABLED</pre>

<h3>Controller par VLAN database</h3>
<p>Policy profile sirf VLAN <i>number</i> (ya naam) rakhta hai. Controller ko woh <b>VLAN pata bhi hona chahiye</b>. 9800 par VLAN database un VLANs ki list hai jo <code>vlan N</code> aur <code>name</code> se bante hain, bilkul switch ki tarah. Agar policy profile aise VLAN ko point karta hai jo database mein nahi hai, to controller client ko usme place nahi kar sakta: client Layer 2 par associate ho sakta hai lekin address kabhi nahi milta.</p>
<pre class="code">vlan 20
 name STAFF
 exit</pre>
<pre class="out">WLC1# show vlan brief

VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active
20   STAFF                            active
99   WLC-MGMT                         active</pre>
<p>VLAN ke end-to-end kaam karne ke liye do aur cheezein dhyan mein rakho. Pehli, WLC1 se SW1 ka <b>trunk</b> (GigabitEthernet1) us VLAN ko allow kare. Doosri, R1 par us VLAN ka gateway aur DHCP scope ho. Controller VLAN database us chain ka controller wala hissa hai; ise bhoolna aasaan hai kyunki switch aur router pehle se theek hote hain.</p>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Client placement chain">
<rect x="10" y="60" width="110" height="60" rx="8" fill="#bae6fd"/><text x="65" y="95" text-anchor="middle" class="svg-ink" font-size="12">WLAN NK-STAFF</text>
<rect x="150" y="60" width="130" height="60" rx="8" fill="#ddd6fe"/><text x="215" y="85" text-anchor="middle" class="svg-ink" font-size="12">policy tag map</text><text x="215" y="102" text-anchor="middle" class="svg-ink" font-size="12">PP-STAFF tak</text>
<rect x="310" y="60" width="120" height="60" rx="8" fill="#bbf7d0"/><text x="370" y="85" text-anchor="middle" class="svg-ink" font-size="12">PP-STAFF</text><text x="370" y="102" text-anchor="middle" class="svg-ink" font-size="12">VLAN 20</text>
<rect x="460" y="60" width="170" height="60" rx="8" fill="#fde68a"/><text x="545" y="85" text-anchor="middle" class="svg-ink" font-size="12">WLC1 mein VLAN 20</text><text x="545" y="102" text-anchor="middle" class="svg-ink" font-size="12">database + trunk</text>
<line x1="120" y1="90" x2="150" y2="90" stroke="#64748b"/><line x1="280" y1="90" x2="310" y2="90" stroke="#64748b"/><line x1="430" y1="90" x2="460" y2="90" stroke="#64748b"/>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">koi bhi link toota = client place nahi ho sakta</text>
</svg><p class="cap">Client placement chain. Har box exist aur enabled hona chahiye.</p></div>

<h3>Central switching versus local switching</h3>
<p>Policy profile ka ek aur field <b>central switching</b> hai. Yeh decide karta hai ki client ka data traffic wired network mein kahan switch hota hai.</p>
<table class="cmp"><tr><th></th><th>Central switching (local mode)</th><th>Local switching (FlexConnect)</th></tr>
<tr><td>Data path</td><td>Client se AP, CAPWAP data tunnel se WLC, phir controller trunk par VLAN</td><td>Client se AP, phir seedha AP ke apne switch port VLAN mein</td></tr>
<tr><td>VLAN kahan chahiye</td><td>Controller trunk aur VLAN database par</td><td>Branch par AP ke switch port (trunk) par</td></tr>
<tr><td>Typical use</td><td>Campus, guest anchoring, central policy</td><td>Slow WAN wale branch offices</td></tr>
<tr><td>WLC tak WAN fail ho jaye</td><td>Clients service kho dete hain</td><td>Maujooda clients chalte reh sakte hain</td></tr></table>
<p>Lab mein har policy profile <b>central switching</b> use karta hai (ENABLED dikhta hai). AP local mode mein hai, isliye VLAN controller par rehta hai. Agar koi AP local mode mein hote hue policy profile par central switching disable kar de, to model error log karta hai: profile local switching maangta hai lekin AP ke paas FlexConnect profile nahi hai.</p>
<div class="note"><p><b>Not simulated in the lab.</b> FlexConnect, local switching, flex profiles, AP par VLAN-to-ACL maps aur native VLAN settings sirf concepts hain. Aapko bata sakna chahiye ki FlexConnect local switching mein VLAN AP switch port par exist karna chahiye aur client IP branch par locally allocate hota hai.</p></div>

<h3>Sab ek saath: client ka VLAN kaun decide karta hai</h3>
<ol>
<li>Client SSID join karta hai, jo ek WLAN profile hai.</li>
<li>AP ka policy tag us WLAN ko policy profile se map karta hai.</li>
<li>Policy profile VLAN deta hai (aur RADIUS ke AAA attributes se override ho sakta hai, concept).</li>
<li>Controller client ko us VLAN mein place karta hai agar woh VLAN database mein hai, aur trunk par us tag ke saath frames bhejta hai.</li>
<li>R1 DHCP us VLAN ke subnet ke liye jawab deta hai.</li>
</ol>
<div class="eg"><p>LAPTOP1 AP2 par NK-STAFF join karta hai. AP2 ka policy tag PT-CAMPUS NK-STAFF ko PP-STAFF se map karta hai. PP-STAFF mein VLAN 20 hai, jo WLC1 database mein hai. Frames GigabitEthernet1 par tag 20 ke saath nikalte hain. R1 DHCP jawab deta hai aur 10.10.20.55 lease karta hai. Gateway 10.10.20.1 hai.</p></div>

<h3>Faults kaise dikhte hain</h3>
<p>Placement fail hone par controller log message likhta hai. Lab mein key line yeh hai:</p>
<pre class="out">WLC1# show logging
%CLIENT_ORCH_LOG-3-VLAN_MISSING: policy profile PP-STAFF uses VLAN 20 which is not in the VLAN database; client cannot be placed</pre>
<p>Doosre related messages: missing VLAN se mapped interface, ya AP ke local mode mein hote hue central switching disabled wala policy profile. Kuch badalne se pehle hamesha log padho.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Maan lena "VLAN 20 switch aur router par hai, to har jagah hai". Controller apna VLAN database rakhta hai. (2) Enabled policy profile ka VLAN badalne ki koshish karke error lena. (3) Policy profile banane ke baad enable karna bhool jaana. (4) Profile mein galat VLAN number (jaise 20 ki jagah 30).</p></div>
<div class="exam"><p><b>Exam trap.</b> 9800 par client ka VLAN policy profile se aata hai, WLAN profile se nahi. AireOS mein yeh WLAN-to-interface mapping tha. Dono jaano.</p></div>

<div class="scn"><h4>Associated lekin address nahi</h4><p>Staging error ke baad 9800 par PP-STAFF enabled aur VLAN 20 dikhta hai. Phones associate hote hain, full signal dikhta hai lekin 169.254 address milte hain. Wired side perfect hai. <code>show logging</code> VLAN_MISSING report karta hai. VLAN controller database mein kabhi create hi nahi hua tha. <code>vlan 20</code> create karne se kuch seconds mein fix ho jaata hai.</p><p><b>Lesson:</b> policy VLAN controller par bhi exist karna chahiye.</p></div>

<div class="iv"><p class="q">"9800 par client VLAN kahan define hota hai, aur kaam karne ke liye kya exist karna chahiye?"</p><p>Policy profile mein. VLAN controller VLAN database mein exist kare, switch ke trunk par allowed ho, aur router par gateway aur DHCP ho. Policy profile enabled ho aur AP ke policy tag mein mapped ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Policy profile VLAN, central switching aur doosri client policy rakhta hai.</li>
<li>Naye policy profiles disabled shuru hote hain; VLAN badalne ke liye pehle shutdown chahiye.</li>
<li>VLAN controller VLAN database aur trunk par bhi hona chahiye.</li>
<li>Central switching matlab data WLC jaata hai; FlexConnect local switching sirf concept hai.</li>
<li>Log mein VLAN_MISSING VLAN database ki taraf ishara karta hai.</li>
</ul></div>
`}};export{e as default};