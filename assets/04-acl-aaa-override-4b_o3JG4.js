var e={id:`acl-aaa-override`,h:{en:`Guest ACLs and AAA override: policy that follows the user`,hi:`Guest ACLs aur AAA override: policy jo user ke saath chalti hai`},body:{en:`
<p>A hotel gives every guest a key card. The card opens the room, the gym and the lift, but not the staff office or the kitchen. The lock on each door checks the card, not the person. In Wi-Fi the <b>ACL</b> is the lock on the staff office, and <b>AAA override</b> is the card system that decides which floor your card belongs to at check-in, instead of everyone getting the same floor.</p>

<h3>ACLs on the controller: the three rules that matter</h3>
<p>You know router ACLs from CCNA. The controller uses the same <code>ip access-list extended</code> engine. Three rules decide everything:</p>
<ol>
<li><b>First match wins.</b> Entries are checked in sequence order (10, 20, 30 ...). The first line that matches decides; later lines are never read for that packet.</li>
<li><b>Implicit deny.</b> After the last entry, anything unmatched is dropped.</li>
<li><b>An ACL name that does not exist means permit all.</b> If a policy profile references an ACL that is not defined (typo, deleted), traffic is not blocked. This is the default behaviour and a classic hole.</li>
</ol>
<p>A <b>guest ACL</b> design is short: deny the internal ranges you must protect, then allow everything else (the internet). That order puts the denies first.</p>
<pre class="code"><span class="c">! guest ACL: deny internal servers and CORP, then allow the rest</span>
ip access-list extended GUEST-ACL
 20 deny ip any 10.10.60.0 0.0.0.255
 30 deny ip any 10.10.40.0 0.0.0.255
 40 permit ip any any
 exit
<span class="c">! apply through the policy profile (disable it first)</span>
wireless profile policy PP-GUEST
 shutdown
 ipv4 acl GUEST-ACL
 no shutdown
 exit</pre>
<p>Web UI: <b>Configuration &gt; Security &gt; ACL</b> to build and order the entries and to apply the ACL to a policy profile, and <b>Configuration &gt; Tags &amp; Profiles &gt; Policy &gt; Access Policies</b> for the WLAN ACL field. Remember the simulator limit stated in the lab: the ACL is evaluated for traffic the client sends and for traffic sent to it, at the first routed hop, and it is not a full model of the wireless datapath (no per-direction ACLs, no FlexConnect local switching ACLs, no dACL). Real controllers also let you set direction and pre-authentication ACLs; check your release.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="First match ordering of a guest ACL">
<rect x="10" y="20" width="290" height="36" rx="6" fill="#fed7aa"/><text x="20" y="43" class="svg-ink" font-size="12">10 permit ip any any  (wrong first)</text>
<rect x="10" y="60" width="290" height="36" rx="6" fill="#e2e8f0"/><text x="20" y="83" class="svg-ink" font-size="12">20 deny ip any 10.10.60.0 0.0.0.255</text>
<rect x="10" y="100" width="290" height="36" rx="6" fill="#e2e8f0"/><text x="20" y="123" class="svg-ink" font-size="12">30 deny ip any 10.10.40.0 0.0.0.255</text>
<text x="155" y="165" text-anchor="middle" class="svg-muted" font-size="12">Packet to 10.10.60.20 matches line 10: passes</text>
<rect x="340" y="20" width="290" height="36" rx="6" fill="#bbf7d0"/><text x="350" y="43" class="svg-ink" font-size="12">20 deny ip any 10.10.60.0 0.0.0.255</text>
<rect x="340" y="60" width="290" height="36" rx="6" fill="#bbf7d0"/><text x="350" y="83" class="svg-ink" font-size="12">30 deny ip any 10.10.40.0 0.0.0.255</text>
<rect x="340" y="100" width="290" height="36" rx="6" fill="#bae6fd"/><text x="350" y="123" class="svg-ink" font-size="12">40 permit ip any any  (last)</text>
<text x="485" y="165" text-anchor="middle" class="svg-accent" font-size="12">Packet to 10.10.60.20 matches line 20: dropped</text>
</svg><p class="cap">Same three ideas, different order, opposite result.</p></div>

<h3>Verifying the ACL</h3>
<pre class="out">WLC1# show ip access-lists GUEST-ACL
Extended IP access list GUEST-ACL
    <span class="hl">10 permit ip any any (14 matches)</span>
    20 deny ip any 10.10.60.0 0.0.0.255
    30 deny ip any 10.10.40.0 0.0.0.255

WLC1# show wireless profile policy detailed PP-GUEST
...
<span class="hl">IPv4 ACL           : (not set)</span></pre>
<p>This is the leaking state from lab 3: a permit-all in position 10, and the ACL never applied. Match counters help: counters on the permit line while a guest probes internal addresses show exactly where traffic leaked. After the fix the deny lines gain hits and the permit line carries only internet-bound traffic.</p>

<h3>AAA override: VLAN and policy from RADIUS</h3>
<p>Without override, everyone on a WLAN lands in the policy profile VLAN (VLAN 20 on PP-CORP). With <b>AAA override</b>, the RADIUS server can return per-user attributes: VLAN ID or name, ACL, QoS, session timeout. The controller applies them in place of the policy profile defaults. Two conditions must both hold: the <b>server returns the attribute</b>, and the <b>policy profile has <code>aaa-override</code></b> enabled. Without the second, the server value is silently ignored. The returned VLAN must also <b>exist on the controller</b>, or the association is rejected.</p>
<pre class="code"><span class="c">! RAD1 policy (server side): alice belongs in VLAN 40</span>
aaa-server authz alice vlan 40
<span class="c">! controller: accept the server's value</span>
wireless profile policy PP-CORP
 shutdown
 aaa-override
 no shutdown
 exit</pre>
<pre class="out">LAPTOP1&gt; wifi status
SSID        : NK-CORP
Security    : WPA2 802.1X (user alice)
IP address  : 10.10.40.101/24 (DHCP)
State       : RUN
<span class="hl">VLAN        : 40 (from RADIUS, AAA override)</span>

%CLIENT_ORCH_LOG-6-AAA_OVERRIDE: Client 0050.7966.6802 placed in VLAN 40 by the RADIUS server (AAA override) on WLAN 2 (NK-CORP)</pre>
<p>Real RADIUS carries this as the standard tunnel attributes: Tunnel-Type VLAN, Tunnel-Medium-Type 802, and Tunnel-Private-Group-ID with the VLAN. Web UI: <b>Configuration &gt; Tags &amp; Profiles &gt; Policy</b>, edit the profile, tab Advanced, <b>Allow AAA Override</b>. Keep the "edit while disabled" rule in mind.</p>

<div class="eg"><p><b>Worked example.</b> alice (Finance) and bob (Engineering) join the same SSID NK-CORP. RAD1 returns VLAN 40 for alice and nothing for bob. With override on, alice is in 10.10.40.0/24 and bob stays in the policy VLAN 20. One SSID, two VLANs: fewer SSIDs, less airtime wasted on beacons.</p></div>

<div class="warn"><p><b>Common mistakes.</b> A deny written after a broad permit. An ACL defined but never applied to the policy profile. A typo in the ACL name on the policy (permit-all by default). Enabling override on the controller but forgetting to add the returned VLAN to the VLAN database. Editing the policy profile without shutting it down first.</p></div>

<div class="exam"><p><b>Exam traps.</b> ACLs are first match with an implicit deny at the end. A missing named ACL permits traffic. AAA override needs both the server attribute and the policy profile setting. The policy profile is where the ACL and override live, not the WLAN profile.</p></div>

<div class="scn"><h4>The guest who could ping the RADIUS server</h4><p>A security review found that a guest could ping 10.10.60.20 and the CORP gateway. GUEST-ACL existed, so the team assumed guests were protected. Reading the ACL showed a permit-all at line 10; reading the policy profile showed no ACL applied. The engineer deleted line 10, added <code>40 permit ip any any</code>, applied the ACL to PP-GUEST, and the guest could reach only its own gateway and the internet.</p><p><b>Lesson:</b> an ACL protects nothing until it is correctly ordered and applied. Read both the list and the place it is applied.</p></div>

<div class="iv"><p class="q">"How do you give two users on the same SSID different network access?"</p><p>Use 802.1X with RADIUS authorization: return a VLAN, ACL name or tag per user, and enable AAA override on the policy profile so the controller honours it. Add that the VLAN must exist on the controller, and that a missing ACL name means permit-all.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ACLs: first match wins, implicit deny last, unknown ACL name means permit all.</li>
<li>Guest ACL pattern: deny internal ranges first, one permit ip any any last.</li>
<li>Apply the ACL with <code>ipv4 acl</code> in the policy profile, with the profile shut down while editing.</li>
<li>AAA override requires the server attribute and <code>aaa-override</code> on the policy profile.</li>
<li>The returned VLAN must exist on the controller or the association is rejected.</li>
</ul></div>
`,hi:`
<p>Hotel har guest ko key card deta hai. Card se room, gym aur lift khulte hain, lekin staff office ya kitchen nahi. Har darwaze ka lock card check karta hai, insaan nahi. Wi-Fi mein <b>ACL</b> staff office ka lock hai, aur <b>AAA override</b> woh card system hai jo check-in par tay karta hai ki aapka card kaunsi floor ka hai, bajaye iske ki sabko ek hi floor mile.</p>

<h3>Controller par ACLs: teen rules jo sab tay karte hain</h3>
<p>Router ACLs aap CCNA se jaante ho. Controller wahi <code>ip access-list extended</code> engine use karta hai. Teen rules sab kuch tay karte hain:</p>
<ol>
<li><b>First match wins.</b> Entries sequence order mein (10, 20, 30 ...) check hoti hain. Pehli line jo match kare wahi decide karti hai; us packet ke liye baad ki lines kabhi padhi nahi jaati.</li>
<li><b>Implicit deny.</b> Aakhri entry ke baad jo match nahi hua woh drop ho jata hai.</li>
<li><b>Jo ACL naam exist nahi karta uska matlab permit all.</b> Agar policy profile aise ACL ko refer kare jo defined nahi hai (typo, delete ho gaya), traffic block nahi hota. Yeh default behaviour hai aur classic hole.</li>
</ol>
<p><b>Guest ACL</b> design chhota hai: jin internal ranges ko protect karna hai unhe deny karo, phir baaki sab (internet) allow karo. Is order se denies pehle aate hain.</p>
<pre class="code"><span class="c">! guest ACL: internal servers aur CORP deny karo, phir baaki allow</span>
ip access-list extended GUEST-ACL
 20 deny ip any 10.10.60.0 0.0.0.255
 30 deny ip any 10.10.40.0 0.0.0.255
 40 permit ip any any
 exit
<span class="c">! policy profile ke through apply karo (pehle usse disable karo)</span>
wireless profile policy PP-GUEST
 shutdown
 ipv4 acl GUEST-ACL
 no shutdown
 exit</pre>
<p>Web UI: entries banane aur order karne ke liye aur ACL ko policy profile par apply karne ke liye <b>Configuration &gt; Security &gt; ACL</b>, aur WLAN ACL field ke liye <b>Configuration &gt; Tags &amp; Profiles &gt; Policy &gt; Access Policies</b>. Lab mein bataya simulator limit yaad rakho: ACL us traffic par evaluate hota hai jo client bhejta hai aur jo use bheja jata hai, pehle routed hop par, aur yeh wireless datapath ka poora model nahi hai (per-direction ACLs nahi, FlexConnect local switching ACLs nahi, dACL nahi). Real controllers direction aur pre-authentication ACLs bhi set karne dete hain; apni release check karo.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Guest ACL ka first match ordering">
<rect x="10" y="20" width="290" height="36" rx="6" fill="#fed7aa"/><text x="20" y="43" class="svg-ink" font-size="12">10 permit ip any any  (galat, pehle)</text>
<rect x="10" y="60" width="290" height="36" rx="6" fill="#e2e8f0"/><text x="20" y="83" class="svg-ink" font-size="12">20 deny ip any 10.10.60.0 0.0.0.255</text>
<rect x="10" y="100" width="290" height="36" rx="6" fill="#e2e8f0"/><text x="20" y="123" class="svg-ink" font-size="12">30 deny ip any 10.10.40.0 0.0.0.255</text>
<text x="155" y="165" text-anchor="middle" class="svg-muted" font-size="12">10.10.60.20 ka packet line 10 se match: pass</text>
<rect x="340" y="20" width="290" height="36" rx="6" fill="#bbf7d0"/><text x="350" y="43" class="svg-ink" font-size="12">20 deny ip any 10.10.60.0 0.0.0.255</text>
<rect x="340" y="60" width="290" height="36" rx="6" fill="#bbf7d0"/><text x="350" y="83" class="svg-ink" font-size="12">30 deny ip any 10.10.40.0 0.0.0.255</text>
<rect x="340" y="100" width="290" height="36" rx="6" fill="#bae6fd"/><text x="350" y="123" class="svg-ink" font-size="12">40 permit ip any any  (aakhri)</text>
<text x="485" y="165" text-anchor="middle" class="svg-accent" font-size="12">10.10.60.20 ka packet line 20 se match: drop</text>
</svg><p class="cap">Wahi teen ideas, alag order, ulta result.</p></div>

<h3>ACL verify karna</h3>
<pre class="out">WLC1# show ip access-lists GUEST-ACL
Extended IP access list GUEST-ACL
    <span class="hl">10 permit ip any any (14 matches)</span>
    20 deny ip any 10.10.60.0 0.0.0.255
    30 deny ip any 10.10.40.0 0.0.0.255

WLC1# show wireless profile policy detailed PP-GUEST
...
<span class="hl">IPv4 ACL           : (not set)</span></pre>
<p>Yeh lab 3 ki leaking state hai: position 10 par permit-all, aur ACL kabhi apply nahi hua. Match counters madad karte hain: jab guest internal addresses probe kare aur counters permit line par badhein, to saaf dikhta hai traffic kahan leak hua. Fix ke baad deny lines par hits aate hain aur permit line sirf internet-bound traffic carry karti hai.</p>

<h3>AAA override: RADIUS se VLAN aur policy</h3>
<p>Override ke bina WLAN ke sab log policy profile VLAN mein jaate hain (PP-CORP ka VLAN 20). <b>AAA override</b> ke saath RADIUS server per-user attributes return kar sakta hai: VLAN ID ya naam, ACL, QoS, session timeout. Controller unhe policy profile ke defaults ki jagah lagata hai. Do conditions dono sach honi chahiye: <b>server attribute return kare</b>, aur <b>policy profile par <code>aaa-override</code></b> enabled ho. Doosri ke bina server ki value chupchaap ignore ho jati hai. Return hua VLAN <b>controller par exist</b> karna chahiye, warna association reject hota hai.</p>
<pre class="code"><span class="c">! RAD1 policy (server side): alice VLAN 40 mein hai</span>
aaa-server authz alice vlan 40
<span class="c">! controller: server ki value accept karo</span>
wireless profile policy PP-CORP
 shutdown
 aaa-override
 no shutdown
 exit</pre>
<pre class="out">LAPTOP1&gt; wifi status
SSID        : NK-CORP
Security    : WPA2 802.1X (user alice)
IP address  : 10.10.40.101/24 (DHCP)
State       : RUN
<span class="hl">VLAN        : 40 (from RADIUS, AAA override)</span>

%CLIENT_ORCH_LOG-6-AAA_OVERRIDE: Client 0050.7966.6802 placed in VLAN 40 by the RADIUS server (AAA override) on WLAN 2 (NK-CORP)</pre>
<p>Asli RADIUS ise standard tunnel attributes mein bhejta hai: Tunnel-Type VLAN, Tunnel-Medium-Type 802, aur VLAN ke saath Tunnel-Private-Group-ID. Web UI: <b>Configuration &gt; Tags &amp; Profiles &gt; Policy</b>, profile edit karo, tab Advanced, <b>Allow AAA Override</b>. "Disabled hone par edit" rule yaad rakho.</p>

<div class="eg"><p><b>Worked example.</b> alice (Finance) aur bob (Engineering) same SSID NK-CORP par join karte hain. RAD1 alice ke liye VLAN 40 return karta hai aur bob ke liye kuch nahi. Override on hone par alice 10.10.40.0/24 mein hai aur bob policy VLAN 20 mein rehta hai. Ek SSID, do VLANs: kam SSIDs, beacons par kam airtime waste.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Broad permit ke baad deny likhna. ACL define kiya lekin policy profile par kabhi apply nahi kiya. Policy par ACL naam mein typo (default permit-all). Controller par override on kiya lekin return hone wala VLAN VLAN database mein nahi joda. Policy profile ko shut down kiye bina edit karna.</p></div>

<div class="exam"><p><b>Exam traps.</b> ACLs first match hote hain, end mein implicit deny. Missing named ACL traffic permit karta hai. AAA override ko server attribute aur policy profile setting dono chahiye. ACL aur override policy profile mein rehte hain, WLAN profile mein nahi.</p></div>

<div class="scn"><h4>Woh guest jo RADIUS server ping kar sakta tha</h4><p>Security review mein paaya gaya ki guest 10.10.60.20 aur CORP gateway ping kar sakta tha. GUEST-ACL exist karta tha, to team ne maan liya ki guests protected hain. ACL padhne par line 10 par permit-all mila; policy profile padhne par koi ACL applied nahi tha. Engineer ne line 10 delete ki, <code>40 permit ip any any</code> joda, ACL ko PP-GUEST par apply kiya, aur guest sirf apne gateway aur internet tak pahunch paya.</p><p><b>Lesson:</b> ACL tab tak kuch protect nahi karta jab tak woh sahi order mein aur sahi jagah apply na ho. List aur woh jagah, dono padho.</p></div>

<div class="iv"><p class="q">"Same SSID par do users ko alag network access kaise doge?"</p><p>802.1X ke saath RADIUS authorization use karo: per user VLAN, ACL naam ya tag return karo, aur policy profile par AAA override enable karo taaki controller use maane. Bolo ki VLAN controller par exist karna chahiye, aur missing ACL naam ka matlab permit-all hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ACLs: first match wins, implicit deny aakhir mein, unknown ACL naam ka matlab permit all.</li>
<li>Guest ACL pattern: internal ranges pehle deny, ek permit ip any any aakhir mein.</li>
<li>ACL ko policy profile mein <code>ipv4 acl</code> se apply karo, edit karte waqt profile shut down.</li>
<li>AAA override ko server attribute aur policy profile par <code>aaa-override</code> chahiye.</li>
<li>Return hua VLAN controller par exist kare warna association reject hota hai.</li>
</ul></div>
`}};export{e as default};