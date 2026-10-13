var e={id:`lab-guest-vlan`,h:{en:`Lab walkthrough: wl-guest-vlan`,hi:`Lab walkthrough: wl-guest-vlan`},body:{en:`
<h3>The task</h3>
<div class="eg"><p><b>Task.</b> Add an open guest SSID. Create WLAN NK-GUEST (id 3, no security), policy profile PP-GUEST in VLAN 50, and map them in PT-CAMPUS. Prove GUEST1 receives a guest address, can use its gateway, and cannot reach the server network, which R1 already blocks for VLAN 50. Staff must keep working on both APs.</p></div>
<p>This is a <b>config lab</b>: you build, then verify from three viewpoints (controller, guest client, staff client). The building order follows the dependency chain from chapter 5: WLAN, policy profile (with VLAN), mapping in the policy tag. The APs already carry PT-CAMPUS, so no AP command is needed.</p>

<h3>Step 1: create the open WLAN</h3>
<pre class="code">configure terminal
wlan NK-GUEST 3 NK-GUEST
 no security wpa
 no shutdown
 exit</pre>
<ul>
<li><code>wlan NK-GUEST 3 NK-GUEST</code> creates profile name NK-GUEST, id 3, SSID NK-GUEST. The id must be unique; id 1 is NK-STAFF.</li>
<li><code>no security wpa</code> removes WPA so the WLAN is open. A new WLAN may start with WPA defaults, and an open WLAN needs this explicit removal.</li>
<li><code>no shutdown</code> enables it. New WLANs start shut down, as on the real platform.</li>
</ul>
<pre class="out">WLC1# show wlan summary

Number of WLANs: 2

ID   Profile Name                     SSID                             Status Security
1    NK-STAFF                         NK-STAFF                         UP      [WPA2][PSK][AES]
3    NK-GUEST                         NK-GUEST                         UP      [Open]</pre>

<h3>Step 2: create the guest policy profile in VLAN 50</h3>
<pre class="code">wireless profile policy PP-GUEST
 vlan 50
 no shutdown
 exit</pre>
<p>The VLAN number must be set before the profile can be enabled. The profile starts disabled; the <code>no shutdown</code> line is easy to forget and then the SSID will not be broadcast.</p>
<div class="warn"><p>Do not forget that VLAN 50 must exist in the controller VLAN database. Check it with show vlan brief before you start; if VLAN 50 is absent, create it as in lab 3.</p></div>

<h3>Step 3: map WLAN to policy in the tag</h3>
<pre class="code">wireless tag policy PT-CAMPUS
 wlan NK-GUEST policy PP-GUEST
 exit</pre>
<pre class="out">WLC1# show wireless tag policy detailed PT-CAMPUS

Policy Tag Name   : PT-CAMPUS
Number of WLAN-POLICY maps: 2

WLAN Profile Name                   Policy Name
NK-STAFF                            PP-STAFF
NK-GUEST                            PP-GUEST</pre>
<p>Both AP1 and AP2 use PT-CAMPUS, so both now broadcast NK-GUEST. Check the policy profile with <code>show wireless profile policy summary</code> and confirm PP-GUEST shows enabled.</p>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Guest build chain">
<rect x="10" y="50" width="120" height="50" rx="8" fill="#bae6fd"/><text x="70" y="80" text-anchor="middle" class="svg-ink" font-size="12">1 WLAN NK-GUEST</text>
<rect x="170" y="50" width="130" height="50" rx="8" fill="#bbf7d0"/><text x="235" y="72" text-anchor="middle" class="svg-ink" font-size="12">2 PP-GUEST</text><text x="235" y="88" text-anchor="middle" class="svg-muted" font-size="11">VLAN 50, enabled</text>
<rect x="340" y="50" width="130" height="50" rx="8" fill="#ddd6fe"/><text x="405" y="72" text-anchor="middle" class="svg-ink" font-size="12">3 PT-CAMPUS</text><text x="405" y="88" text-anchor="middle" class="svg-muted" font-size="11">wlan NK-GUEST map</text>
<rect x="510" y="50" width="120" height="50" rx="8" fill="#fde68a"/><text x="570" y="72" text-anchor="middle" class="svg-ink" font-size="12">AP1 and AP2</text><text x="570" y="88" text-anchor="middle" class="svg-muted" font-size="11">already tagged</text>
<line x1="130" y1="75" x2="170" y2="75" stroke="#64748b"/><line x1="300" y1="75" x2="340" y2="75" stroke="#64748b"/><line x1="470" y1="75" x2="510" y2="75" stroke="#64748b"/>
<text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">build left to right; verify right to left</text>
</svg><p class="cap">Build in dependency order and no AP change is needed.</p></div>

<h3>Step 4: prove it from GUEST1</h3>
<p>On GUEST1, connect and check the address, then test the gateway and a server:</p>
<pre class="code">wifi connect NK-GUEST
wifi status
ping 10.10.50.1
ping 10.10.60.20</pre>
<pre class="out">GUEST1&gt; wifi status
SSID        : NK-GUEST
BSSID       : 00:50:43:a6:9a:12
AP          : AP2
Band/channel: 5 GHz / 40
Signal      : -61 dBm
Security    : Open
IP address  : <span class="hl">10.10.50.11/24 (DHCP)</span>

GUEST1&gt; ping 10.10.50.1
<span class="hl">84 bytes from 10.10.50.1 icmp_seq=1 ttl=255 time=0.500 ms</span>
(four more replies follow)

GUEST1&gt; ping 10.10.60.20
<span class="hl">*10.10.50.1 icmp_seq=1 ttl=255 time=1.012 ms (ICMP type:3, code:13, Communication administratively prohibited)</span>
(the same line repeats for each probe)</pre>
<p>Three facts are now proven: (1) the guest got an address in VLAN 50's subnet 10.10.50.0/24; (2) it reaches its own gateway, so the path through WLC1, SW1 and R1 works; (3) it cannot reach RAD1 at 10.10.60.20, so the ACL on R1 is effective. A failed ping to the server is a <b>success</b> for this lab: it is the isolation proof.</p>
<div class="tip"><p>Why gateway first? If the gateway ping fails, you cannot say anything about isolation, because the whole path is broken. A blocked ping to the server only means "isolation works" if the gateway ping succeeds.</p></div>

<h3>Step 5: prove staff did not break</h3>
<pre class="code">[LAPTOP1] wifi status
[LAPTOP1] ping 10.10.60.20</pre>
<pre class="out">LAPTOP1&gt; ping 10.10.60.20
<span class="hl">84 bytes from 10.10.60.20 icmp_seq=1 ttl=63 time=0.500 ms</span></pre>
<p>Staff are still in VLAN 20 and still reach RAD1. Finally verify that both SSIDs are served by both APs: <code>show wireless tag policy detailed PT-CAMPUS</code> lists the two maps and <code>show ap tag summary</code> shows both APs with PT-CAMPUS. Reconnect GUEST1 on the other AP if the lab lets you move it, and confirm the same subnet; that is the roaming angle of this lab, because identical policy on both APs means a guest can walk without changing address.</p>

<h3>Optional: save the config</h3>
<pre class="code">write memory</pre>
<p>Remember: on a real controller an unsaved change is lost at reload.</p>

<h3>What you did not do, on purpose</h3>
<ul>
<li>You did not edit the ACL. R1 already had GUEST-IN. In production, you check it too, with <code>show access-lists</code> on the router (concept for this controller lab).</li>
<li>You did not configure a web portal, rate limit or client isolation: concept only here.</li>
<li>You did not change AP tags: shared policy tag means shared behaviour.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> (1) Forgetting <code>no shutdown</code> on PP-GUEST or the WLAN. (2) Forgetting <code>no security wpa</code>, leaving the open WLAN with a default security that prevents joining. (3) Mapping NK-GUEST to PP-STAFF, which would put guests into VLAN 20. (4) Typing the wrong id (3 versus 1) and getting "already used by another profile". (5) Testing isolation without first testing the gateway.</p></div>
<div class="exam"><p><b>Exam trap.</b> Order of build: WLAN profile, policy profile, policy tag map, AP tag. If an object is disabled or missing at any step, the SSID is silently absent.</p></div>

<div class="scn"><h4>The guest SSID that reached payroll</h4><p>A new branch opened a guest SSID in 10 minutes by mapping it to the existing staff policy profile "to save time". Guests received 10.10.20.x addresses and could browse an internal HR portal. An audit caught it. The fix was PP-GUEST in VLAN 50 plus the guest ACL, then a test showing the gateway reachable and the HR server blocked.</p><p><b>Lesson:</b> never reuse a staff policy profile for guests, and always keep a negative test (a blocked ping) in your acceptance checklist.</p></div>

<div class="iv"><p class="q">"How do you verify a guest network is isolated?"</p><p>From a guest client: it gets an address in the guest subnet, reaches its gateway and the Internet, and fails to reach internal servers and staff subnets. Also check that the policy profile uses the guest VLAN, the ACL is on the gateway, and staff networks are unchanged. Positive test first, then the negative test.</p></div>

<div class="tip"><p><b>Doing it in the web UI.</b> <b>Configuration &gt; Tags &amp; Profiles &gt; WLANs &gt; Add</b> (NK-GUEST, id 3, open), <b>Policy &gt; Add</b> (PP-GUEST, VLAN 50), <b>Tags &gt; Policy</b> (add the map to PT-CAMPUS). Check <b>Monitoring &gt; Wireless &gt; WLANs</b>, <b>Monitoring &gt; Wireless &gt; Clients</b> and <b>Troubleshooting &gt; Ping</b>.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Build order: WLAN, policy profile with VLAN, enable, map in the policy tag.</li>
<li>No AP command is needed when APs already carry the shared policy tag.</li>
<li>Open WLAN needs <code>no security wpa</code> and <code>no shutdown</code>.</li>
<li>Prove with positive (gateway) and negative (server blocked) tests.</li>
<li>Always re-test staff after a change on a shared tag.</li>
</ul></div>
`,hi:`
<h3>Task</h3>
<div class="eg"><p><b>Task.</b> Ek open guest SSID add karo. WLAN NK-GUEST (id 3, no security), VLAN 50 mein policy profile PP-GUEST banao, aur dono ko PT-CAMPUS mein map karo. Prove karo ki GUEST1 ko guest address milta hai, woh apna gateway use kar sakta hai, aur server network tak nahi pahunch sakta, jise R1 VLAN 50 ke liye pehle se block karta hai. Staff dono APs par chalte rehne chahiye.</p></div>
<p>Yeh ek <b>config lab</b> hai: aap build karte ho, phir teen viewpoints se verify karte ho (controller, guest client, staff client). Building order chapter 5 ki dependency chain ko follow karta hai: WLAN, policy profile (VLAN ke saath), policy tag mein mapping. APs pehle se PT-CAMPUS carry karte hain, isliye koi AP command nahi chahiye.</p>

<h3>Step 1: open WLAN banao</h3>
<pre class="code">configure terminal
wlan NK-GUEST 3 NK-GUEST
 no security wpa
 no shutdown
 exit</pre>
<ul>
<li><code>wlan NK-GUEST 3 NK-GUEST</code> profile name NK-GUEST, id 3, SSID NK-GUEST banata hai. Id unique honi chahiye; id 1 NK-STAFF hai.</li>
<li><code>no security wpa</code> WPA hata deta hai taaki WLAN open ho. Naya WLAN WPA defaults ke saath shuru ho sakta hai, aur open WLAN ko yeh explicit removal chahiye.</li>
<li><code>no shutdown</code> use enable karta hai. Naye WLANs shut down se shuru hote hain, real platform ki tarah.</li>
</ul>
<pre class="out">WLC1# show wlan summary

Number of WLANs: 2

ID   Profile Name                     SSID                             Status Security
1    NK-STAFF                         NK-STAFF                         UP      [WPA2][PSK][AES]
3    NK-GUEST                         NK-GUEST                         UP      [Open]</pre>

<h3>Step 2: VLAN 50 mein guest policy profile banao</h3>
<pre class="code">wireless profile policy PP-GUEST
 vlan 50
 no shutdown
 exit</pre>
<p>Profile enable hone se pehle VLAN number set hona chahiye. Profile disabled shuru hota hai; <code>no shutdown</code> line bhoolna aasaan hai aur tab SSID broadcast nahi hoga.</p>
<div class="warn"><p>Yaad rakho ki VLAN 50 controller VLAN database mein exist karna chahiye. Shuru karne se pehle show vlan brief se check karo; agar VLAN 50 absent hai to lab 3 ki tarah use banao.</p></div>

<h3>Step 3: tag mein WLAN ko policy se map karo</h3>
<pre class="code">wireless tag policy PT-CAMPUS
 wlan NK-GUEST policy PP-GUEST
 exit</pre>
<pre class="out">WLC1# show wireless tag policy detailed PT-CAMPUS

Policy Tag Name   : PT-CAMPUS
Number of WLAN-POLICY maps: 2

WLAN Profile Name                   Policy Name
NK-STAFF                            PP-STAFF
NK-GUEST                            PP-GUEST</pre>
<p>AP1 aur AP2 dono PT-CAMPUS use karte hain, isliye dono ab NK-GUEST broadcast karte hain. <code>show wireless profile policy summary</code> se policy profile check karo aur confirm karo ki PP-GUEST enabled dikhta hai.</p>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Guest build chain">
<rect x="10" y="50" width="120" height="50" rx="8" fill="#bae6fd"/><text x="70" y="80" text-anchor="middle" class="svg-ink" font-size="12">1 WLAN NK-GUEST</text>
<rect x="170" y="50" width="130" height="50" rx="8" fill="#bbf7d0"/><text x="235" y="72" text-anchor="middle" class="svg-ink" font-size="12">2 PP-GUEST</text><text x="235" y="88" text-anchor="middle" class="svg-muted" font-size="11">VLAN 50, enabled</text>
<rect x="340" y="50" width="130" height="50" rx="8" fill="#ddd6fe"/><text x="405" y="72" text-anchor="middle" class="svg-ink" font-size="12">3 PT-CAMPUS</text><text x="405" y="88" text-anchor="middle" class="svg-muted" font-size="11">wlan NK-GUEST map</text>
<rect x="510" y="50" width="120" height="50" rx="8" fill="#fde68a"/><text x="570" y="72" text-anchor="middle" class="svg-ink" font-size="12">AP1 aur AP2</text><text x="570" y="88" text-anchor="middle" class="svg-muted" font-size="11">pehle se tagged</text>
<line x1="130" y1="75" x2="170" y2="75" stroke="#64748b"/><line x1="300" y1="75" x2="340" y2="75" stroke="#64748b"/><line x1="470" y1="75" x2="510" y2="75" stroke="#64748b"/>
<text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">left se right build karo; right se left verify karo</text>
</svg><p class="cap">Dependency order mein build karo aur koi AP change nahi chahiye.</p></div>

<h3>Step 4: GUEST1 se prove karo</h3>
<p>GUEST1 par connect karo aur address check karo, phir gateway aur ek server test karo:</p>
<pre class="code">wifi connect NK-GUEST
wifi status
ping 10.10.50.1
ping 10.10.60.20</pre>
<pre class="out">GUEST1&gt; wifi status
SSID        : NK-GUEST
BSSID       : 00:50:43:a6:9a:12
AP          : AP2
Band/channel: 5 GHz / 40
Signal      : -61 dBm
Security    : Open
IP address  : <span class="hl">10.10.50.11/24 (DHCP)</span>

GUEST1&gt; ping 10.10.50.1
<span class="hl">84 bytes from 10.10.50.1 icmp_seq=1 ttl=255 time=0.500 ms</span>
(four more replies follow)

GUEST1&gt; ping 10.10.60.20
<span class="hl">*10.10.50.1 icmp_seq=1 ttl=255 time=1.012 ms (ICMP type:3, code:13, Communication administratively prohibited)</span>
(the same line repeats for each probe)</pre>
<p>Ab teen facts prove ho gaye: (1) guest ko VLAN 50 ke subnet 10.10.50.0/24 mein address mila; (2) woh apne gateway tak pahunchta hai, yaani WLC1, SW1 aur R1 ka path kaam karta hai; (3) woh 10.10.60.20 par RAD1 tak nahi pahunch sakta, yaani R1 par ACL effective hai. Server ka failed ping is lab ke liye <b>success</b> hai: yahi isolation ka proof hai.</p>
<div class="tip"><p>Gateway pehle kyun? Agar gateway ping fail ho jaye, to aap isolation ke baare mein kuch nahi keh sakte, kyunki poora path toota hai. Server ka blocked ping tabhi "isolation works" ka matlab rakhta hai jab gateway ping succeed ho.</p></div>

<h3>Step 5: prove karo ki staff nahi toota</h3>
<pre class="code">[LAPTOP1] wifi status
[LAPTOP1] ping 10.10.60.20</pre>
<pre class="out">LAPTOP1&gt; ping 10.10.60.20
<span class="hl">84 bytes from 10.10.60.20 icmp_seq=1 ttl=63 time=0.500 ms</span></pre>
<p>Staff abhi bhi VLAN 20 mein hai aur RAD1 tak pahunchta hai. Aakhir mein verify karo ki dono SSIDs dono APs serve karte hain: <code>show wireless tag policy detailed PT-CAMPUS</code> do maps dikhata hai aur <code>show ap tag summary</code> dono APs ko PT-CAMPUS ke saath dikhata hai. Agar lab allow kare to GUEST1 ko doosre AP par move karke reconnect karo aur same subnet confirm karo; yeh is lab ka roaming angle hai, kyunki dono APs par identical policy ka matlab guest address badle bina chal sakta hai.</p>

<h3>Optional: config save karo</h3>
<pre class="code">write memory</pre>
<p>Yaad rakho: real controller par unsaved change reload par chala jaata hai.</p>

<h3>Jo aapne jaan-boojhkar nahi kiya</h3>
<ul>
<li>Aapne ACL edit nahi ki. R1 par GUEST-IN pehle se thi. Production mein aap use bhi check karte ho, router par <code>show access-lists</code> se (is controller lab ke liye concept).</li>
<li>Aapne web portal, rate limit ya client isolation configure nahi kiya: yahan sirf concept.</li>
<li>Aapne AP tags nahi badle: shared policy tag ka matlab shared behaviour.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> (1) PP-GUEST ya WLAN par <code>no shutdown</code> bhoolna. (2) <code>no security wpa</code> bhoolna, jisse open WLAN default security ke saath join hone se rukta hai. (3) NK-GUEST ko PP-STAFF se map karna, jisse guests VLAN 20 mein chale jaate hain. (4) Galat id type karna (3 ki jagah 1) aur "already used by another profile" milna. (5) Gateway test kiye bina isolation test karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Build ka order: WLAN profile, policy profile, policy tag map, AP tag. Kisi bhi step par koi object disabled ya missing ho to SSID chupchap gayab rehta hai.</p></div>

<div class="scn"><h4>Payroll tak pahunchne wala guest SSID</h4><p>Ek naye branch ne guest SSID 10 minute mein khola, "time bachane ke liye" use existing staff policy profile se map karke. Guests ko 10.10.20.x addresses mile aur woh internal HR portal browse kar sakte the. Audit ne pakda. Fix tha VLAN 50 mein PP-GUEST plus guest ACL, phir ek test jisme gateway reachable aur HR server blocked dikha.</p><p><b>Lesson:</b> guests ke liye staff policy profile kabhi reuse mat karo, aur acceptance checklist mein hamesha negative test (blocked ping) rakho.</p></div>

<div class="iv"><p class="q">"Guest network isolated hai, yeh kaise verify karte ho?"</p><p>Guest client se: use guest subnet ka address milta hai, woh apne gateway aur Internet tak pahunchta hai, aur internal servers aur staff subnets tak nahi pahunchta. Saath hi check karo ki policy profile guest VLAN use karta hai, ACL gateway par hai, aur staff networks unchanged hain. Pehle positive test, phir negative test.</p></div>

<div class="tip"><p><b>Web UI mein kaise karein.</b> <b>Configuration &gt; Tags &amp; Profiles &gt; WLANs &gt; Add</b> (NK-GUEST, id 3, open), <b>Policy &gt; Add</b> (PP-GUEST, VLAN 50), <b>Tags &gt; Policy</b> (PT-CAMPUS mein map add karo). Check karo <b>Monitoring &gt; Wireless &gt; WLANs</b>, <b>Monitoring &gt; Wireless &gt; Clients</b> aur <b>Troubleshooting &gt; Ping</b>.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Build order: WLAN, VLAN ke saath policy profile, enable, policy tag mein map.</li>
<li>Jab APs shared policy tag carry karte hain to koi AP command nahi chahiye.</li>
<li>Open WLAN ko <code>no security wpa</code> aur <code>no shutdown</code> chahiye.</li>
<li>Positive (gateway) aur negative (server blocked) tests se prove karo.</li>
<li>Shared tag par change ke baad hamesha staff dobara test karo.</li>
</ul></div>
`}};export{e as default};