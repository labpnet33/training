var e={id:`lab-vlan-missing`,h:{en:`Lab walkthrough: wl-vlan-missing`,hi:`Lab walkthrough: wl-vlan-missing`},body:{en:`
<h3>The ticket</h3>
<div class="eg"><p><b>Ticket.</b> LAPTOP1 sees NK-STAFF and the policy profile PP-STAFF is enabled on VLAN 20, but the client cannot be placed and never gets an address. The switch and R1 carry VLAN 20. Inspect the policy profile and the controller log, then repair the controller object that is missing. Prove LAPTOP1 is in VLAN 20 and reaches RAD1.</p></div>
<p>This is a <b>troubleshooting lab</b>. The skill is not typing the fix; it is collecting evidence that points to one object, changing only that, and proving the repair. Follow the same discipline as earlier labs: symptom, evidence, hypothesis, smallest fix, verification.</p>

<h3>Step 0: describe the symptom precisely</h3>
<p>"Cannot connect" is too vague. Here the exact symptom is: <b>the SSID is visible</b> (so the WLAN, policy tag and AP tag work and the radios are on), the client <b>associates</b> at the radio level, but it ends with no usable IP address. That already tells us the problem is after the radio and before DHCP: client placement.</p>
<pre class="code">LAPTOP1&gt; wifi connect NK-STAFF psk NkStaff2024
LAPTOP1&gt; wifi status</pre>
<pre class="out">LAPTOP1&gt; wifi connect NK-STAFF psk NkStaff2024
Found "NK-STAFF" on AP1 (5 GHz, channel 36, -62 dBm)
WPA2-PSK 4-way handshake ... completed
<span class="hl">Association rejected by the controller.</span>

LAPTOP1&gt; wifi status
Not connected. Saved profile: NK-STAFF (auto-connect paused after an authentication failure)</pre>
<p>The simulator prints "Association rejected by the controller"; real hardware often shows the client dropping or waiting for an address. Either way there is no address in 10.10.20.0/24.</p>

<h3>Step 1: read the policy profile</h3>
<pre class="code">show wireless profile policy detailed PP-STAFF</pre>
<pre class="out">WLC1# show wireless profile policy detailed PP-STAFF

Policy Profile Name              : PP-STAFF
Description                      :
Status                           : ENABLED
VLAN                             : 20  <span class="hl">(NOT IN VLAN DATABASE)</span>
Central Switching                : ENABLED
Central Authentication           : ENABLED
Central DHCP                     : DISABLED</pre>
<p>The profile is enabled, the VLAN number is right, but the controller flags it: <b>NOT IN VLAN DATABASE</b>. Many engineers miss this because the status says ENABLED. Always read the VLAN line.</p>

<h3>Step 2: confirm in the log</h3>
<pre class="code">show logging</pre>
<pre class="out">WLC1# show logging
...
<span class="hl">%CLIENT_ORCH_LOG-3-VLAN_MISSING: policy profile PP-STAFF uses VLAN 20 which is not in the VLAN database; client cannot be placed</span></pre>
<p>Two independent sources now agree. The log message names the policy profile, the VLAN and the consequence. That is enough evidence to act without guessing. If you want a third confirmation:</p>
<pre class="code">show vlan brief</pre>
<pre class="out">WLC1# show vlan brief

VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active
99   WLC-MGMT                         active</pre>
<p>VLAN 20 is absent. Note that the switch and R1 are fine (the ticket says so, and you can see no log about trunk problems), so we leave them alone.</p>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Evidence funnel for missing VLAN">
<rect x="10" y="20" width="190" height="50" rx="8" fill="#bae6fd"/><text x="105" y="42" text-anchor="middle" class="svg-ink" font-size="12">Policy profile detail</text><text x="105" y="58" text-anchor="middle" class="svg-muted" font-size="11">NOT IN VLAN DATABASE</text>
<rect x="225" y="20" width="190" height="50" rx="8" fill="#ddd6fe"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="12">show logging</text><text x="320" y="58" text-anchor="middle" class="svg-muted" font-size="11">VLAN_MISSING</text>
<rect x="440" y="20" width="190" height="50" rx="8" fill="#fde68a"/><text x="535" y="42" text-anchor="middle" class="svg-ink" font-size="12">show vlan brief</text><text x="535" y="58" text-anchor="middle" class="svg-muted" font-size="11">VLAN 20 absent</text>
<line x1="105" y1="70" x2="320" y2="120" stroke="#64748b"/><line x1="320" y1="70" x2="320" y2="120" stroke="#64748b"/><line x1="535" y1="70" x2="320" y2="120" stroke="#64748b"/>
<rect x="220" y="120" width="200" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="150" text-anchor="middle" class="svg-ink" font-size="13">Create VLAN 20 on WLC1</text>
</svg><p class="cap">Three views of the same fact make a safe fix.</p></div>

<h3>Step 3: create the VLAN in the controller database</h3>
<pre class="code">configure terminal
vlan 20
 name STAFF
 exit</pre>
<p>That is the only change. We did not touch the policy profile (it was right), the WLAN, the tags, the switch or R1. Verify:</p>
<pre class="out">WLC1# show vlan brief

VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active
<span class="hl">20   STAFF                            active</span>
99   WLC-MGMT                         active

WLC1# show wireless profile policy detailed PP-STAFF
...
VLAN                             : 20</pre>
<p>The "NOT IN VLAN DATABASE" flag is gone.</p>

<h3>Step 4: prove the client</h3>
<pre class="code">wifi connect NK-STAFF psk NkStaff2024
wifi status
ping 10.10.60.20</pre>
<pre class="out">LAPTOP1&gt; wifi status
SSID        : NK-STAFF
BSSID       : 00:50:42:a6:98:10
AP          : AP1
Band/channel: 5 GHz / 36
Signal      : -62 dBm
Security    : WPA2-Personal (PSK)
IP address  : <span class="hl">10.10.20.11/24 (DHCP)</span>

LAPTOP1&gt; ping 10.10.60.20
<span class="hl">84 bytes from 10.10.60.20 icmp_seq=1 ttl=63 time=0.500 ms</span></pre>
<p>Address in 10.10.20.0/24, gateway reachable, RAD1 reachable: the ticket is closed. In your ticket note write the cause (VLAN 20 was never created on the controller; a rebuild or an incomplete staging checklist), the single change and the before and after evidence.</p>

<h3>Why the VLAN database is easy to forget</h3>
<ul>
<li>On a switch the VLAN is created because you assign ports to it. On a controller there are no access ports, so nothing forces you to create it.</li>
<li>When you rebuild or replace a WLC, the policy profile may be restored from a backup, but the VLAN database is a separate section that can be missed.</li>
<li>The 9800 may accept a policy profile pointing to an unknown VLAN number, so the error shows up only when a client joins.</li>
</ul>

<h3>Other ways a "placed but no address" ticket can fail</h3>
<table class="cmp"><tr><th>Cause</th><th>Evidence</th><th>Fix location</th></tr>
<tr><td>VLAN missing on controller</td><td>NOT IN VLAN DATABASE, VLAN_MISSING</td><td>WLC1: vlan 20</td></tr>
<tr><td>VLAN not on trunk</td><td>show interfaces trunk lacks 20</td><td>SW1 trunk allowed list</td></tr>
<tr><td>No DHCP scope or helper</td><td>VLAN present, client no address</td><td>R1 SVI and pool</td></tr>
<tr><td>Policy profile disabled</td><td>Status DISABLED, SSID absent</td><td>WLC1: no shutdown</td></tr>
<tr><td>Central switching off in local mode</td><td>Log mentions local mode</td><td>WLC1 policy profile</td></tr></table>
<p>The first row is this lab. The others are how you rule out neighbours. Always change the object that owns the evidence.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Rebuilding the policy profile because "it must be corrupt". (2) Changing the VLAN on R1 or SW1 even though the ticket says they carry VLAN 20. (3) Creating the VLAN with the wrong number (for example 200). (4) Not re-testing from the client. (5) Missing the "NOT IN VLAN DATABASE" flag because the status line says ENABLED.</p></div>
<div class="exam"><p><b>Exam trap.</b> A policy profile that is ENABLED with a VLAN set is not proof of a working VLAN. The VLAN must be in the controller database too.</p></div>

<div class="scn"><h4>The replaced controller</h4><p>After a hardware swap, restored config brought all WLANs and policy profiles but not the VLAN list. Every SSID showed, every client associated, nobody had an address. The helpdesk escalated to the DHCP team, who found healthy pools and leases not being requested. A look at the policy profile output found VLAN_MISSING in under a minute.</p><p><b>Lesson:</b> when DHCP shows no requests at all, look upstream: the client never reached the VLAN.</p></div>

<div class="iv"><p class="q">"Clients associate but get no IP. DHCP server is healthy. What do you check on the WLC?"</p><p>Policy profile detail for the VLAN and any warning, the controller log for placement errors, the VLAN database, the trunk and allowed VLANs towards the switch, and whether central switching matches the AP mode. Then I create the missing object only and test with a client.</p></div>

<div class="tip"><p><b>Doing it in the web UI.</b> Read the policy profile in <b>Configuration &gt; Tags &amp; Profiles &gt; Policy</b> and the message in <b>Troubleshooting &gt; Logs</b>; create the VLAN in <b>Configuration &gt; Layer2 &gt; VLAN &gt; Add</b> (20, STAFF); confirm in <b>Monitoring &gt; Wireless &gt; Clients</b>.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Associated but no address and no DHCP requests means the client was not placed.</li>
<li><code>show wireless profile policy detailed</code> flags NOT IN VLAN DATABASE.</li>
<li><code>show logging</code> gives VLAN_MISSING with the profile name.</li>
<li>Fix: <code>vlan 20</code> and <code>name STAFF</code> on WLC1, nothing else.</li>
<li>Prove with client address and a ping to RAD1.</li>
</ul></div>
`,hi:`
<h3>Ticket</h3>
<div class="eg"><p><b>Ticket.</b> LAPTOP1 ko NK-STAFF dikhta hai aur policy profile PP-STAFF VLAN 20 par enabled hai, lekin client ko place nahi kiya ja sakta aur use address kabhi nahi milta. Switch aur R1 VLAN 20 carry karte hain. Policy profile aur controller log inspect karo, phir controller ka jo object missing hai use repair karo. Prove karo ki LAPTOP1 VLAN 20 mein hai aur RAD1 tak pahunchta hai.</p></div>
<p>Yeh ek <b>troubleshooting lab</b> hai. Skill fix type karna nahi hai; skill hai evidence collect karna jo ek object ki taraf ishara kare, sirf usi ko badalna, aur repair prove karna. Pichhli labs jaisa hi discipline: symptom, evidence, hypothesis, smallest fix, verification.</p>

<h3>Step 0: symptom precisely describe karo</h3>
<p>"Connect nahi hota" bahut vague hai. Yahan exact symptom hai: <b>SSID visible hai</b> (yaani WLAN, policy tag aur AP tag kaam karte hain aur radios on hain), client radio level par <b>associate</b> hota hai, lekin end mein koi usable IP address nahi milta. Isse hi pata chal jaata hai ki problem radio ke baad aur DHCP se pehle hai: client placement.</p>
<pre class="code">LAPTOP1&gt; wifi connect NK-STAFF psk NkStaff2024
LAPTOP1&gt; wifi status</pre>
<pre class="out">LAPTOP1&gt; wifi connect NK-STAFF psk NkStaff2024
Found "NK-STAFF" on AP1 (5 GHz, channel 36, -62 dBm)
WPA2-PSK 4-way handshake ... completed
<span class="hl">Association rejected by the controller.</span>

LAPTOP1&gt; wifi status
Not connected. Saved profile: NK-STAFF (auto-connect paused after an authentication failure)</pre>
<p>Simulator "Association rejected by the controller" print karta hai; real hardware par aksar client drop hota hai ya address ka intezaar karta hai. Dono halat mein 10.10.20.0/24 ka address nahi milta.</p>

<h3>Step 1: policy profile padho</h3>
<pre class="code">show wireless profile policy detailed PP-STAFF</pre>
<pre class="out">WLC1# show wireless profile policy detailed PP-STAFF

Policy Profile Name              : PP-STAFF
Description                      :
Status                           : ENABLED
VLAN                             : 20  <span class="hl">(NOT IN VLAN DATABASE)</span>
Central Switching                : ENABLED
Central Authentication           : ENABLED
Central DHCP                     : DISABLED</pre>
<p>Profile enabled hai, VLAN number sahi hai, lekin controller flag karta hai: <b>NOT IN VLAN DATABASE</b>. Kai engineers ise miss karte hain kyunki status ENABLED dikhata hai. Hamesha VLAN line padho.</p>

<h3>Step 2: log mein confirm karo</h3>
<pre class="code">show logging</pre>
<pre class="out">WLC1# show logging
...
<span class="hl">%CLIENT_ORCH_LOG-3-VLAN_MISSING: policy profile PP-STAFF uses VLAN 20 which is not in the VLAN database; client cannot be placed</span></pre>
<p>Ab do independent sources agree karte hain. Log message policy profile, VLAN aur consequence ka naam leta hai. Guess kiye bina action lene ke liye yeh kaafi evidence hai. Teesri confirmation chahiye to:</p>
<pre class="code">show vlan brief</pre>
<pre class="out">WLC1# show vlan brief

VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active
99   WLC-MGMT                         active</pre>
<p>VLAN 20 absent hai. Dhyan do ki switch aur R1 theek hain (ticket yahi kehta hai, aur trunk problems ka koi log nahi dikhta), isliye unhe chhod dete hain.</p>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Evidence funnel for missing VLAN">
<rect x="10" y="20" width="190" height="50" rx="8" fill="#bae6fd"/><text x="105" y="42" text-anchor="middle" class="svg-ink" font-size="12">Policy profile detail</text><text x="105" y="58" text-anchor="middle" class="svg-muted" font-size="11">NOT IN VLAN DATABASE</text>
<rect x="225" y="20" width="190" height="50" rx="8" fill="#ddd6fe"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="12">show logging</text><text x="320" y="58" text-anchor="middle" class="svg-muted" font-size="11">VLAN_MISSING</text>
<rect x="440" y="20" width="190" height="50" rx="8" fill="#fde68a"/><text x="535" y="42" text-anchor="middle" class="svg-ink" font-size="12">show vlan brief</text><text x="535" y="58" text-anchor="middle" class="svg-muted" font-size="11">VLAN 20 absent</text>
<line x1="105" y1="70" x2="320" y2="120" stroke="#64748b"/><line x1="320" y1="70" x2="320" y2="120" stroke="#64748b"/><line x1="535" y1="70" x2="320" y2="120" stroke="#64748b"/>
<rect x="220" y="120" width="200" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="150" text-anchor="middle" class="svg-ink" font-size="13">WLC1 par VLAN 20 banao</text>
</svg><p class="cap">Ek hi fact ke teen views safe fix banate hain.</p></div>

<h3>Step 3: controller database mein VLAN banao</h3>
<pre class="code">configure terminal
vlan 20
 name STAFF
 exit</pre>
<p>Bas yahi ek change hai. Humne policy profile (woh sahi tha), WLAN, tags, switch ya R1 ko touch nahi kiya. Verify karo:</p>
<pre class="out">WLC1# show vlan brief

VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active
<span class="hl">20   STAFF                            active</span>
99   WLC-MGMT                         active

WLC1# show wireless profile policy detailed PP-STAFF
...
VLAN                             : 20</pre>
<p>"NOT IN VLAN DATABASE" flag chala gaya.</p>

<h3>Step 4: client prove karo</h3>
<pre class="code">wifi connect NK-STAFF psk NkStaff2024
wifi status
ping 10.10.60.20</pre>
<pre class="out">LAPTOP1&gt; wifi status
SSID        : NK-STAFF
BSSID       : 00:50:42:a6:98:10
AP          : AP1
Band/channel: 5 GHz / 36
Signal      : -62 dBm
Security    : WPA2-Personal (PSK)
IP address  : <span class="hl">10.10.20.11/24 (DHCP)</span>

LAPTOP1&gt; ping 10.10.60.20
<span class="hl">84 bytes from 10.10.60.20 icmp_seq=1 ttl=63 time=0.500 ms</span></pre>
<p>10.10.20.0/24 mein address, gateway reachable, RAD1 reachable: ticket close. Apne ticket note mein cause likho (VLAN 20 controller par kabhi create nahi hua; rebuild ya incomplete staging checklist), ek change, aur before aur after evidence.</p>

<h3>VLAN database bhoolna aasaan kyun hai</h3>
<ul>
<li>Switch par VLAN isliye banta hai kyunki aap ports ko usme assign karte ho. Controller par access ports nahi hote, isliye kuch aapko force nahi karta ki VLAN banao.</li>
<li>WLC rebuild ya replace karne par policy profile backup se restore ho sakta hai, lekin VLAN database alag section hai jo miss ho sakta hai.</li>
<li>9800 aise policy profile ko accept kar sakta hai jo unknown VLAN number ko point karta hai, isliye error tabhi dikhta hai jab client join karta hai.</li>
</ul>

<h3>"Placed lekin address nahi" ticket aur kaise fail ho sakta hai</h3>
<table class="cmp"><tr><th>Cause</th><th>Evidence</th><th>Fix location</th></tr>
<tr><td>Controller par VLAN missing</td><td>NOT IN VLAN DATABASE, VLAN_MISSING</td><td>WLC1: vlan 20</td></tr>
<tr><td>Trunk par VLAN nahi</td><td>show interfaces trunk mein 20 nahi</td><td>SW1 trunk allowed list</td></tr>
<tr><td>DHCP scope ya helper nahi</td><td>VLAN present, client ko address nahi</td><td>R1 SVI aur pool</td></tr>
<tr><td>Policy profile disabled</td><td>Status DISABLED, SSID absent</td><td>WLC1: no shutdown</td></tr>
<tr><td>Local mode mein central switching off</td><td>Log local mode ka zikr karta hai</td><td>WLC1 policy profile</td></tr></table>
<p>Pehli row is lab ki hai. Baaki padosiyon ko rule out karne ke tareeke hain. Hamesha usi object ko badlo jiske paas evidence hai.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Policy profile ko rebuild karna kyunki "corrupt hoga". (2) R1 ya SW1 par VLAN badalna jabki ticket kehta hai woh VLAN 20 carry karte hain. (3) VLAN galat number se banana (jaise 200). (4) Client se dobara test na karna. (5) "NOT IN VLAN DATABASE" flag miss karna kyunki status line ENABLED dikhati hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> VLAN set hone ke saath ENABLED policy profile working VLAN ka proof nahi hai. VLAN controller database mein bhi hona chahiye.</p></div>

<div class="scn"><h4>Replace kiya hua controller</h4><p>Hardware swap ke baad restored config mein saare WLANs aur policy profiles aaye lekin VLAN list nahi. Har SSID dikha, har client associate hua, kisi ko address nahi mila. Helpdesk ne DHCP team ko escalate kiya, jinhone healthy pools dekhe aur leases ki requests aayi hi nahi. Policy profile output dekhne par ek minute se kam mein VLAN_MISSING mila.</p><p><b>Lesson:</b> jab DHCP par koi request hi na dikhe, to upstream dekho: client kabhi VLAN tak pahuncha hi nahi.</p></div>

<div class="iv"><p class="q">"Clients associate hote hain lekin IP nahi milta. DHCP server healthy hai. WLC par kya check karoge?"</p><p>VLAN ke liye policy profile detail aur koi warning, placement errors ke liye controller log, VLAN database, switch ki taraf trunk aur allowed VLANs, aur central switching AP mode se match karta hai ya nahi. Phir main sirf missing object banata hoon aur client se test karta hoon.</p></div>

<div class="tip"><p><b>Web UI mein kaise karein.</b> Policy profile <b>Configuration &gt; Tags &amp; Profiles &gt; Policy</b> mein aur message <b>Troubleshooting &gt; Logs</b> mein padho; VLAN <b>Configuration &gt; Layer2 &gt; VLAN &gt; Add</b> se banao (20, STAFF); <b>Monitoring &gt; Wireless &gt; Clients</b> mein confirm karo.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Associated lekin address nahi aur DHCP requests nahi: matlab client place nahi hua.</li>
<li><code>show wireless profile policy detailed</code> NOT IN VLAN DATABASE flag karta hai.</li>
<li><code>show logging</code> profile name ke saath VLAN_MISSING deta hai.</li>
<li>Fix: WLC1 par <code>vlan 20</code> aur <code>name STAFF</code>, aur kuch nahi.</li>
<li>Client address aur RAD1 ping se prove karo.</li>
</ul></div>
`}};export{e as default};