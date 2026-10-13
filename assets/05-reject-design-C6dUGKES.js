var e={id:`reject-design`,h:{en:`Designing reject and guest outcomes safely`,hi:`Reject aur guest outcomes ko safely design karna`},body:{en:`
<h3>Start with an analogy: the lobby must be safe too</h3>
<p>A visitor lobby is only safe if it is really separate from the office floors. If the lobby lift quietly stops at floor 10, the visitor desk is a hole in the wall. In the same way, a reject-role or guest role is only as safe as the VLAN, the ACL and the routing behind it. This chapter is about the design choices that decide whether your safety net is safe.</p>

<h3>What lands in the reject-role</h3>
<p>Anything that ends in a rejection is a candidate for the port's reject-role. In the lab model that includes failed passwords, unknown users, disabled accounts, an unknown or disabled endpoint on MAC authentication, a policy that falls to the default deny profile, and also a returned role that the switch does not know. They are very different events but they all go to the same place.</p>
<table class="cmp"><tr><th>Cause</th><th>ClearPass alert</th><th>Typical meaning</th></tr>
<tr><td>Wrong password</td><td>215</td><td>Typo, stale saved credential, or guessing</td></tr>
<tr><td>Unknown user or endpoint</td><td>216</td><td>Not yet onboarded, or a stranger</td></tr>
<tr><td>Account disabled</td><td>217</td><td>Leaver, or locked administratively</td></tr>
<tr><td>No enforcement rule matched</td><td>9010</td><td>Policy gap; default deny used</td></tr>
<tr><td>No service matched</td><td>9002</td><td>Misclassified request; not a user problem</td></tr></table>
<p>Notice the last two rows. They are <b>platform</b> problems, not user problems. If a service is broken, every user is rejected, and every user lands in the GUEST role. The reject-role then hides a major outage behind "everyone is on guest Wi-Fi". Treat a sudden wave of rejects as an alarm, not as normal guest traffic.</p>

<h3>Design rules that keep the reject-role safe</h3>
<ol>
<li><b>Make GUEST truly isolated.</b> The role must point to a VLAN whose gateway applies an ACL. In the lab, R1's GUEST-IN list blocks VLAN 40 from VLANs 10, 20 and 30 and from the server networks. You must test that ping to APP1 fails.</li>
<li><b>Allow only what the guest needs.</b> DHCP, DNS and internet. Do not let a reject-role user reach ClearPass admin or management networks.</li>
<li><b>Do not reuse an internal VLAN.</b> A shortcut such as "reject-role EMPLOYEE" would give every failed login full access. It defeats authentication.</li>
<li><b>Separate guest from quarantine.</b> A visitor and a risky device are different cases. In the lab, QUARANTINE (VLAN 50) reaches only 10.20.60.0/24 so that remediation can work. GUEST (VLAN 40) reaches the internet. Do not merge them.</li>
<li><b>Limit the blast radius.</b> The reject-role is a per-port setting. Put it on user ports, not on infrastructure uplinks or on ports with servers.</li>
<li><b>Watch for rejects.</b> Count Access-Reject in the Access Tracker. A spike of 215 can be an attack or a password rotation; a spike of 9002 is a configuration fault.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Guest versus quarantine">
<rect x="10" y="10" width="290" height="150" rx="10" fill="#fed7aa"/><text x="155" y="34" text-anchor="middle" class="svg-ink" font-size="14">GUEST  VLAN 40</text><text x="155" y="62" text-anchor="middle" class="svg-muted" font-size="12">10.20.40.0/24</text><text x="155" y="88" text-anchor="middle" class="svg-ink" font-size="12">allowed: DHCP, DNS, internet</text><text x="155" y="112" text-anchor="middle" class="svg-ink" font-size="12">blocked: VLAN 10, 20, 30</text><text x="155" y="136" text-anchor="middle" class="svg-ink" font-size="12">blocked: server networks</text>
<rect x="340" y="10" width="290" height="150" rx="10" fill="#ddd6fe"/><text x="485" y="34" text-anchor="middle" class="svg-ink" font-size="14">QUARANTINE  VLAN 50</text><text x="485" y="62" text-anchor="middle" class="svg-muted" font-size="12">10.20.50.0/24</text><text x="485" y="88" text-anchor="middle" class="svg-ink" font-size="12">allowed: 10.20.60.0/24 only</text><text x="485" y="112" text-anchor="middle" class="svg-ink" font-size="12">ClearPass and remediation</text><text x="485" y="136" text-anchor="middle" class="svg-ink" font-size="12">no general internet</text>
<text x="320" y="186" text-anchor="middle" class="svg-muted" font-size="12">Two different safety purposes, two different roles and ACLs.</text>
</svg><p class="cap">Guest is for people without an account; quarantine is for known devices that must be fixed.</p></div>

<h3>Retry behaviour and what you will see</h3>
<p>A rejected supplicant retries, so the Access Tracker fills with repeated failures from the same MAC. That is why the lab model has a quiet period (20 seconds): after a failure the port waits before a new attempt. If a user fixes the password, the next attempt after the quiet period succeeds and the port changes from the reject-role to the real role. You can speed this up by bouncing the port with <code>shutdown</code> and <code>no shutdown</code>, which forces a new authentication.</p>
<pre class="out">ACCESS# show port-access clients
Port Access Clients

Total Number of Clients : 2

Port   MAC-Address        User   Method  Status                         Role      VLAN
1/1/3  00:50:2f:e9:9a:01  alice  dot1x   Authenticated                  EMPLOYEE  10
<span class="hl">1/1/4  00:50:2f:e9:9a:02  bob    dot1x   Rejected (reject-role applied) GUEST     40</span></pre>
<p>In this table the Status column tells you the truth that the Role column alone does not: GUEST with status "Rejected (reject-role applied)" is a failed login, not a registered visitor.</p>

<h3>One more trap: a dropped request looks like silence</h3>
<p>ClearPass has three kinds of deny. [Deny Access Profile] sends Access-Reject, which is what triggers the reject-role. A reject-type profile is an explicit refusal. A <b>drop</b> profile ([Drop Access Profile]) sends nothing back. To a switch, silence looks like an unreachable server. Never use drop on a production access port that relies on a critical-role, because the switch cannot tell a deliberate drop from a failure. Also remember from earlier modules that an unknown NAD or a wrong shared secret is dropped silently as well.</p>

<div class="warn"><p><b>Common mistake.</b> Using the reject-role to hide policy faults. If bob lands in GUEST because the service rule is wrong, the user sees "Wi-Fi works but nothing internal opens", the helpdesk blames the user, and the real fault stays for days. Always look at the alert code.</p></div>

<div class="exam"><p><b>Exam trap.</b> A client in GUEST is not necessarily a guest. Check the method and status columns on the switch and the Access Tracker on ClearPass: a reject-role session shows Rejected, a policy-assigned guest shows Authenticated.</p></div>

<div class="scn"><h4>Everyone in guest after a change window</h4><p>After a Saturday change, 300 users reported "internet works but intranet is gone". The switches showed them all in the GUEST role with status Rejected. The Access Tracker showed alert 9002 on every request: someone had edited the service rule so wired requests no longer matched. The reject-role had kept people online, which hid the outage from monitoring until Monday. Fixing the service rule restored roles at the next authentication.</p><p><b>Lesson:</b> a safety net must be monitored, or it silently turns an outage into a slow degradation.</p></div>

<div class="iv"><p class="q">"What are the security risks of a reject-role and how do you reduce them?"</p><p>Strong answer: anyone who fails authentication gets that role, so it must be an isolated VLAN with an ACL, no internal reachability, and no reuse of an employee or quarantine VLAN. Monitor the volume of rejects, keep the role off uplinks, and separate guest from quarantine. Also point out that platform faults such as a misclassified service can send everyone to the reject-role, so alert on that.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Every kind of rejection can end in the reject-role, including platform faults such as a broken service rule.</li>
<li>GUEST must be isolated by role, VLAN and ACL, and tested with a failing ping to internal servers.</li>
<li>Keep guest and quarantine separate: different purposes, different ACLs.</li>
<li>Read the Status column: Rejected (reject-role applied) means a failed login.</li>
<li>A drop profile or a wrong secret looks like silence to a switch, not like a reject.</li>
</ul></div>
`,hi:`
<h3>Ek analogy se shuru karo: lobby bhi safe honi chahiye</h3>
<p>Visitor lobby tabhi safe hai jab woh office floors se sach mein alag ho. Agar lobby ki lift chupchaap floor 10 par ruk jaati hai, to visitor desk deewar mein hole hai. Isi tarah reject-role ya guest role utna hi safe hai jitni uske peeche ki VLAN, ACL aur routing. Yeh chapter un design choices ke baare mein hai jo decide karte hain ki aapka safety net safe hai ya nahi.</p>

<h3>Reject-role mein kya land hota hai</h3>
<p>Jo bhi rejection par khatam hota hai woh port ke reject-role ka candidate hai. Lab model mein ismein galat password, unknown user, disabled account, MAC authentication par unknown ya disabled endpoint, default deny profile par girti policy, aur aisa returned role bhi shamil hai jise switch nahi jaanta. Yeh bahut alag events hain lekin sab ek hi jagah jaate hain.</p>
<table class="cmp"><tr><th>Cause</th><th>ClearPass alert</th><th>Typical matlab</th></tr>
<tr><td>Galat password</td><td>215</td><td>Typo, purana saved credential, ya guessing</td></tr>
<tr><td>Unknown user ya endpoint</td><td>216</td><td>Abhi onboard nahi hua, ya ajnabi</td></tr>
<tr><td>Account disabled</td><td>217</td><td>Leaver, ya administratively locked</td></tr>
<tr><td>Koi enforcement rule match nahi hua</td><td>9010</td><td>Policy gap; default deny use hua</td></tr>
<tr><td>Koi service match nahi hui</td><td>9002</td><td>Request misclassify hui; user problem nahi</td></tr></table>
<p>Aakhri do rows dekho. Yeh <b>platform</b> problems hain, user problems nahi. Agar service toot gayi hai to har user reject hota hai, aur har user GUEST role mein land hota hai. Tab reject-role bade outage ko "sab guest Wi-Fi par hain" ke peeche chhupa deta hai. Achanak bahut saare rejects ko alarm samjho, normal guest traffic nahi.</p>

<h3>Design rules jo reject-role ko safe rakhte hain</h3>
<ol>
<li><b>GUEST ko sach mein isolated banao.</b> Role aisi VLAN ko point kare jiske gateway par ACL lagi ho. Lab mein R1 ki GUEST-IN list VLAN 40 ko VLANs 10, 20, 30 aur server networks se block karti hai. Aapko test karna hai ki APP1 ko ping fail hota hai.</li>
<li><b>Sirf wahi allow karo jo guest ko chahiye.</b> DHCP, DNS aur internet. Reject-role user ko ClearPass admin ya management networks tak mat jaane do.</li>
<li><b>Internal VLAN reuse mat karo.</b> "reject-role EMPLOYEE" jaisa shortcut har failed login ko full access de deta hai. Authentication ka matlab hi khatam.</li>
<li><b>Guest aur quarantine alag rakho.</b> Visitor aur risky device alag cases hain. Lab mein QUARANTINE (VLAN 50) sirf 10.20.60.0/24 tak pahunchta hai taaki remediation chal sake. GUEST (VLAN 40) internet tak pahunchta hai. Inhe merge mat karo.</li>
<li><b>Blast radius chhota rakho.</b> Reject-role per-port setting hai. Use user ports par lagao, infrastructure uplinks ya servers wale ports par nahi.</li>
<li><b>Rejects par nazar rakho.</b> Access Tracker mein Access-Reject count karo. 215 ka spike attack ya password rotation ho sakta hai; 9002 ka spike configuration fault hai.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Guest versus quarantine">
<rect x="10" y="10" width="290" height="150" rx="10" fill="#fed7aa"/><text x="155" y="34" text-anchor="middle" class="svg-ink" font-size="14">GUEST  VLAN 40</text><text x="155" y="62" text-anchor="middle" class="svg-muted" font-size="12">10.20.40.0/24</text><text x="155" y="88" text-anchor="middle" class="svg-ink" font-size="12">allowed: DHCP, DNS, internet</text><text x="155" y="112" text-anchor="middle" class="svg-ink" font-size="12">blocked: VLAN 10, 20, 30</text><text x="155" y="136" text-anchor="middle" class="svg-ink" font-size="12">blocked: server networks</text>
<rect x="340" y="10" width="290" height="150" rx="10" fill="#ddd6fe"/><text x="485" y="34" text-anchor="middle" class="svg-ink" font-size="14">QUARANTINE  VLAN 50</text><text x="485" y="62" text-anchor="middle" class="svg-muted" font-size="12">10.20.50.0/24</text><text x="485" y="88" text-anchor="middle" class="svg-ink" font-size="12">allowed: sirf 10.20.60.0/24</text><text x="485" y="112" text-anchor="middle" class="svg-ink" font-size="12">ClearPass aur remediation</text><text x="485" y="136" text-anchor="middle" class="svg-ink" font-size="12">general internet nahi</text>
<text x="320" y="186" text-anchor="middle" class="svg-muted" font-size="12">Do alag safety purposes, do alag roles aur ACLs.</text>
</svg><p class="cap">Guest un logon ke liye hai jinke paas account nahi; quarantine un known devices ke liye hai jinhe fix karna hai.</p></div>

<h3>Retry behaviour aur aap kya dekhoge</h3>
<p>Rejected supplicant retry karta hai, isliye Access Tracker mein same MAC ke repeated failures bhar jaate hain. Isiliye lab model mein quiet period (20 second) hai: failure ke baad port naye attempt se pehle wait karta hai. Agar user password theek kar le to quiet period ke baad agla attempt succeed hota hai aur port reject-role se asli role mein badal jaata hai. Aap <code>shutdown</code> aur <code>no shutdown</code> se port bounce karke isse tez kar sakte ho, jo nayi authentication force karta hai.</p>
<pre class="out">ACCESS# show port-access clients
Port Access Clients

Total Number of Clients : 2

Port   MAC-Address        User   Method  Status                         Role      VLAN
1/1/3  00:50:2f:e9:9a:01  alice  dot1x   Authenticated                  EMPLOYEE  10
<span class="hl">1/1/4  00:50:2f:e9:9a:02  bob    dot1x   Rejected (reject-role applied) GUEST     40</span></pre>
<p>Is table mein Status column wahi sach batata hai jo akela Role column nahi batata: "Rejected (reject-role applied)" status ke saath GUEST failed login hai, registered visitor nahi.</p>

<h3>Ek aur trap: dropped request silence jaisa dikhta hai</h3>
<p>ClearPass mein teen tarah ke deny hain. [Deny Access Profile] Access-Reject bhejta hai, jo reject-role trigger karta hai. Reject-type profile explicit refusal hai. <b>Drop</b> profile ([Drop Access Profile]) kuch wapas nahi bhejta. Switch ko silence unreachable server jaisa lagta hai. Jis production access port par critical-role par depend karte ho wahan drop kabhi use mat karo, kyunki switch deliberate drop aur failure mein farak nahi kar sakta. Pichhle modules se yaad rakho ki unknown NAD ya galat shared secret bhi silently drop hota hai.</p>

<div class="warn"><p><b>Common mistake.</b> Reject-role se policy faults chhupana. Agar service rule galat hone se bob GUEST mein land hota hai, user ko "Wi-Fi chalta hai lekin intranet nahi khulta" dikhta hai, helpdesk user ko blame karta hai, aur asli fault dino tak rehta hai. Hamesha alert code dekho.</p></div>

<div class="exam"><p><b>Exam trap.</b> GUEST mein jo client hai woh zaroori nahi ki guest ho. Switch par method aur status columns dekho aur ClearPass par Access Tracker: reject-role session Rejected dikhata hai, policy-assigned guest Authenticated dikhata hai.</p></div>

<div class="scn"><h4>Change window ke baad sab guest mein</h4><p>Saturday ke change ke baad 300 users ne report kiya "internet chalta hai lekin intranet gaya". Switches ne unhe GUEST role mein Rejected status ke saath dikhaya. Access Tracker ne har request par alert 9002 dikhaya: kisi ne service rule edit kar diya tha jisse wired requests match nahi hoti thi. Reject-role ne logon ko online rakha, jisse monitoring ko Monday tak outage nahi dikha. Service rule fix karne se agli authentication par roles wapas aa gaye.</p><p><b>Seekh:</b> safety net monitor hona chahiye, warna woh outage ko chupchaap slow degradation bana deta hai.</p></div>

<div class="iv"><p class="q">"Reject-role ke security risks kya hain aur unhe kaise kam karte ho?"</p><p>Strong answer: jo bhi authentication fail karta hai use woh role milta hai, isliye woh isolated VLAN hona chahiye jisme ACL ho, internal reachability na ho, aur employee ya quarantine VLAN reuse na ho. Rejects ka volume monitor karo, role ko uplinks se door rakho, aur guest aur quarantine alag rakho. Yeh bhi batao ki misclassified service jaise platform faults sabko reject-role mein bhej sakte hain, isliye uspar alert lagao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har tarah ki rejection reject-role mein khatam ho sakti hai, broken service rule jaise platform faults bhi.</li>
<li>GUEST ko role, VLAN aur ACL se isolate karo aur internal servers ko failing ping se test karo.</li>
<li>Guest aur quarantine alag rakho: alag purpose, alag ACLs.</li>
<li>Status column padho: Rejected (reject-role applied) ka matlab failed login.</li>
<li>Drop profile ya galat secret switch ko reject nahi, silence jaisa dikhta hai.</li>
</ul></div>
`}};export{e as default};