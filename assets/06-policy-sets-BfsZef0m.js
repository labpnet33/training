var e={id:`policy-sets`,h:{en:`Policy sets, authentication and authorization policies, conditions`,hi:`Policy sets, authentication aur authorization policies, conditions`},body:{en:`
<p>Think of an airport. First you are sorted by <b>terminal</b>: domestic or international (the policy set). At the terminal, a check-in counter verifies your <b>ID</b> against the right list: passport for international, any government ID for domestic (the authentication policy). Then the boarding pass decides <b>where you may go</b>: lounge, gate 12, or "please see the desk" (the authorization policy). ISE evaluates every request the same way, top to bottom, and stops at the first match at each stage.</p>

<h3>The evaluation pipeline</h3>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="ISE policy evaluation">
<rect x="10" y="80" width="110" height="56" rx="8" fill="#bae6fd"/><text x="65" y="104" text-anchor="middle" class="svg-ink" font-size="13">RADIUS</text><text x="65" y="122" text-anchor="middle" class="svg-muted" font-size="12">Access-Request</text>
<rect x="150" y="80" width="130" height="56" rx="8" fill="#ddd6fe"/><text x="215" y="104" text-anchor="middle" class="svg-ink" font-size="13">Policy set</text><text x="215" y="122" text-anchor="middle" class="svg-muted" font-size="12">first match</text>
<rect x="310" y="80" width="140" height="56" rx="8" fill="#bbf7d0"/><text x="380" y="104" text-anchor="middle" class="svg-ink" font-size="13">Authentication</text><text x="380" y="122" text-anchor="middle" class="svg-muted" font-size="12">which identity store</text>
<rect x="480" y="80" width="150" height="56" rx="8" fill="#fde68a"/><text x="555" y="104" text-anchor="middle" class="svg-ink" font-size="13">Authorization</text><text x="555" y="122" text-anchor="middle" class="svg-muted" font-size="12">first matching rule</text>
<line x1="120" y1="108" x2="150" y2="108" stroke="#64748b" stroke-width="2"/><line x1="280" y1="108" x2="310" y2="108" stroke="#64748b" stroke-width="2"/><line x1="450" y1="108" x2="480" y2="108" stroke="#64748b" stroke-width="2"/>
<text x="215" y="160" text-anchor="middle" class="svg-muted" font-size="12">allowed protocols</text>
<text x="380" y="160" text-anchor="middle" class="svg-muted" font-size="12">reject, drop or continue</text>
<text x="555" y="160" text-anchor="middle" class="svg-accent" font-size="12">authorization profile</text>
<text x="555" y="180" text-anchor="middle" class="svg-accent" font-size="12">+ security group</text>
<text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">Top-down, first match, at every stage</text>
</svg><p class="cap">Every RADIUS request goes through three ordered tables. A miss falls to the Default row at the bottom of each.</p></div>

<h3>Policy sets</h3>
<p>A <b>policy set</b> is a container with a condition, an <b>allowed protocols</b> service, an authentication policy and an authorization policy. ISE checks policy sets from top to bottom and uses the <b>first</b> whose condition matches; the built-in <b>Default</b> set catches the rest. Typical sets: Wired, Wireless-Corp, Wireless-Guest, VPN. Conditions often use the network device group (DEVICE:Device Type EQUALS Access-Switch) or the request type (Wired_802.1X, Wired_MAB, Wireless_802.1X).</p>
<p>The <b>allowed protocols</b> list (for example "Default Network Access") enables PAP, CHAP, EAP-MD5, PEAP, EAP-TLS, EAP-FAST, TEAP and <b>Process Host Lookup</b> (required for MAB). If PEAP is not allowed, PEAP clients fail before any identity check.</p>

<h3>Authentication policy</h3>
<p>Inside the set, authentication rules choose <b>where to check the identity</b>. Example rules:</p>
<table class="cmp"><tr><th>Rule</th><th>Condition</th><th>Use identity source</th><th>Options</th></tr>
<tr><td>Dot1X</td><td>Wired_802.1X</td><td>AD_then_Internal (identity source sequence)</td><td>Auth fail: REJECT; User not found: REJECT; Process fail: DROP</td></tr>
<tr><td>MAB</td><td>Wired_MAB</td><td>Internal Endpoints</td><td>User not found: <b>CONTINUE</b></td></tr>
<tr><td>Default</td><td>(none)</td><td>All_User_ID_Stores</td><td>REJECT</td></tr>
</table>
<p>The result of authentication is "who you are" plus attributes from the store (AD groups, internal identity group). It does not decide access; it feeds the next stage.</p>

<h3>Authorization policy</h3>
<p>Authorization rules decide <b>what you get</b>. Each rule has conditions and returns one or more <b>authorization profiles</b> and optionally a <b>security group</b> (SGT). Rules are evaluated <b>top-down, first match</b>; put specific rules above general ones.</p>
<table class="cmp"><tr><th>#</th><th>Rule name</th><th>Conditions</th><th>Profile</th><th>Security group</th></tr>
<tr><td>1</td><td>Quarantine</td><td>Session:PostureStatus EQUALS NonCompliant</td><td>QuarantineVLAN90</td><td>Quarantine</td></tr>
<tr><td>2</td><td>Staff</td><td>Wired_802.1X AND AD:ExternalGroups EQUALS example.local/Staff</td><td>StaffVLAN20</td><td>Employees</td></tr>
<tr><td>3</td><td>Cameras</td><td>Wired_MAB AND EndPoints:LogicalProfile EQUALS IP-Cameras</td><td>CameraVLAN40</td><td>Cameras (40)</td></tr>
<tr><td>4</td><td>Guest redirect</td><td>Wired_MAB</td><td>Cisco_WebAuth</td><td>Guests</td></tr>
<tr><td>Default</td><td></td><td></td><td>DenyAccess</td><td></td></tr>
</table>
<p>Note the order. If rule 4 (any MAB) were above rule 3, cameras would be sent to the guest portal they cannot use.</p>

<h3>Conditions and dictionaries</h3>
<p>Conditions are built from <b>dictionary attributes</b>: RADIUS (NAS-Port-Type, Called-Station-Id), Cisco (cisco-av-pair), DEVICE (Location, Device Type), Network Access (AuthenticationMethod, EapAuthentication), Session (PostureStatus), EndPoints (LogicalProfile, BYODRegistration), identity group, AD and LDAP attributes, IdentityGroup:Name. You combine them with AND/OR into <b>compound conditions</b> and save reusable ones in the <b>library</b>. Built-in library conditions include Wired_802.1X, Wired_MAB, Wireless_802.1X, Wireless_MAB and Switch_Local_Web_Authentication.</p>

<h3>From the lab's point of view</h3>
<p>The simulated ISE command <code>aaa-server authz priya vlan 20</code> stands for "the authorization rule that matches priya returns the StaffVLAN20 profile". When the CoA lab changes it to <code>vlan 90</code>, it imitates the posture result changing so that rule 1 (Quarantine) now matches priya instead of rule 2.</p>

<div class="eg"><p><b>Worked example.</b> priya (AD group Staff) plugs into Gi0/1. Policy set "Wired" matches (DEVICE:Device Type = Access-Switch). Authentication rule Dot1X matches Wired_802.1X and checks AD: success. Authorization: rule 1 does not match (posture is Compliant), rule 2 matches Wired_802.1X and Staff, so ISE returns StaffVLAN20 and SGT Employees. Rules 3, 4 and Default are never evaluated. Live Logs shows Policy Set = Wired, Authentication Rule = Dot1X, Authorization Rule = Staff.</p></div>

<div class="warn"><p><b>Common mistake.</b> Adding a new rule at the bottom, just above Default, when a broader rule above already catches the same users. The new rule never matches. Check the "Hits" counter on each rule: a new rule with zero hits is usually shadowed.</p></div>

<div class="exam"><p><b>Exam trap.</b> Authentication picks the identity store and proves identity; authorization picks the result. "If User not found = Continue" is what lets unknown MAB endpoints reach authorization. Allowed protocols must include Process Host Lookup for MAB.</p></div>

<div class="scn"><h4>Printers on the guest portal</h4><p>After a policy clean-up, all printers on one floor stopped working. Live Logs showed Authorization Rule = Guest redirect with profile Cisco_WebAuth. An administrator had dragged the generic "Wired_MAB to guest portal" rule to the top. The printer rule below it never matched any more. Moving the printer rule above the generic MAB rule restored printing; the team then added a naming convention and a peer review for policy reordering.</p><p><b>Lesson:</b> ISE authorization is first-match; order the rules from most specific to most general.</p></div>

<div class="iv"><p class="q">"What is the difference between a policy set, an authentication policy and an authorization policy in ISE?"</p><p>Strong answer: the policy set is selected first by a condition such as device type or request type and defines the allowed protocols. Inside it, the authentication policy chooses the identity source and what to do if the user is not found or fails. The authorization policy then evaluates rules top-down and returns authorization profiles and security groups. All three are first-match. Give an example such as Wired_MAB with Continue reaching a guest redirect rule.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Policy sets, authentication rules and authorization rules are all evaluated top-down, first match.</li>
<li>Policy sets carry the allowed protocols list (enable Process Host Lookup for MAB).</li>
<li>Authentication chooses the identity source and the reject, drop or continue behaviour.</li>
<li>Authorization rules return authorization profiles and security groups; order specific before general.</li>
<li>Conditions use dictionary attributes and reusable library conditions such as Wired_802.1X and Wired_MAB.</li>
</ul></div>
`,hi:`
<p>Ek airport socho. Pehle aapko <b>terminal</b> ke hisaab se sort kiya jaata hai: domestic ya international (policy set). Terminal par check-in counter aapki <b>ID</b> sahi list ke against verify karta hai: international ke liye passport, domestic ke liye koi bhi government ID (authentication policy). Phir boarding pass decide karta hai ki aap <b>kahan jaa sakte ho</b>: lounge, gate 12, ya "kripya desk par milein" (authorization policy). ISE har request ko isi tarah evaluate karta hai, upar se neeche, aur har stage par pehle match par ruk jaata hai.</p>

<h3>Evaluation pipeline</h3>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="ISE policy evaluation">
<rect x="10" y="80" width="110" height="56" rx="8" fill="#bae6fd"/><text x="65" y="104" text-anchor="middle" class="svg-ink" font-size="13">RADIUS</text><text x="65" y="122" text-anchor="middle" class="svg-muted" font-size="12">Access-Request</text>
<rect x="150" y="80" width="130" height="56" rx="8" fill="#ddd6fe"/><text x="215" y="104" text-anchor="middle" class="svg-ink" font-size="13">Policy set</text><text x="215" y="122" text-anchor="middle" class="svg-muted" font-size="12">pehla match</text>
<rect x="310" y="80" width="140" height="56" rx="8" fill="#bbf7d0"/><text x="380" y="104" text-anchor="middle" class="svg-ink" font-size="13">Authentication</text><text x="380" y="122" text-anchor="middle" class="svg-muted" font-size="12">kaunsa identity store</text>
<rect x="480" y="80" width="150" height="56" rx="8" fill="#fde68a"/><text x="555" y="104" text-anchor="middle" class="svg-ink" font-size="13">Authorization</text><text x="555" y="122" text-anchor="middle" class="svg-muted" font-size="12">pehla matching rule</text>
<line x1="120" y1="108" x2="150" y2="108" stroke="#64748b" stroke-width="2"/><line x1="280" y1="108" x2="310" y2="108" stroke="#64748b" stroke-width="2"/><line x1="450" y1="108" x2="480" y2="108" stroke="#64748b" stroke-width="2"/>
<text x="215" y="160" text-anchor="middle" class="svg-muted" font-size="12">allowed protocols</text>
<text x="380" y="160" text-anchor="middle" class="svg-muted" font-size="12">reject, drop ya continue</text>
<text x="555" y="160" text-anchor="middle" class="svg-accent" font-size="12">authorization profile</text>
<text x="555" y="180" text-anchor="middle" class="svg-accent" font-size="12">+ security group</text>
<text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">Har stage par top-down, pehla match</text>
</svg><p class="cap">Har RADIUS request teen ordered tables se guzarti hai. Miss hone par har ek ke neeche Default row mein girti hai.</p></div>

<h3>Policy sets</h3>
<p><b>Policy set</b> ek container hai jismein ek condition, ek <b>allowed protocols</b> service, ek authentication policy aur ek authorization policy hoti hai. ISE policy sets ko upar se neeche check karta hai aur <b>pehla</b> jiski condition match ho use use karta hai; built-in <b>Default</b> set baaki sab pakadta hai. Typical sets: Wired, Wireless-Corp, Wireless-Guest, VPN. Conditions aksar network device group (DEVICE:Device Type EQUALS Access-Switch) ya request type (Wired_802.1X, Wired_MAB, Wireless_802.1X) use karti hain.</p>
<p><b>Allowed protocols</b> list (jaise "Default Network Access") PAP, CHAP, EAP-MD5, PEAP, EAP-TLS, EAP-FAST, TEAP aur <b>Process Host Lookup</b> (MAB ke liye zaroori) enable karti hai. Agar PEAP allowed nahi hai, to PEAP clients kisi identity check se pehle hi fail ho jaate hain.</p>

<h3>Authentication policy</h3>
<p>Set ke andar authentication rules chunte hain ki <b>identity kahan check karni hai</b>. Example rules:</p>
<table class="cmp"><tr><th>Rule</th><th>Condition</th><th>Identity source</th><th>Options</th></tr>
<tr><td>Dot1X</td><td>Wired_802.1X</td><td>AD_then_Internal (identity source sequence)</td><td>Auth fail: REJECT; User not found: REJECT; Process fail: DROP</td></tr>
<tr><td>MAB</td><td>Wired_MAB</td><td>Internal Endpoints</td><td>User not found: <b>CONTINUE</b></td></tr>
<tr><td>Default</td><td>(kuch nahi)</td><td>All_User_ID_Stores</td><td>REJECT</td></tr>
</table>
<p>Authentication ka result hai "aap kaun ho" plus store se attributes (AD groups, internal identity group). Yeh access decide nahi karta; yeh agle stage ko input deta hai.</p>

<h3>Authorization policy</h3>
<p>Authorization rules decide karte hain ki <b>aapko kya milega</b>. Har rule mein conditions hoti hain aur woh ek ya zyada <b>authorization profiles</b> aur optionally ek <b>security group</b> (SGT) lautata hai. Rules <b>top-down, pehla match</b> evaluate hote hain; specific rules ko general rules ke upar rakho.</p>
<table class="cmp"><tr><th>#</th><th>Rule naam</th><th>Conditions</th><th>Profile</th><th>Security group</th></tr>
<tr><td>1</td><td>Quarantine</td><td>Session:PostureStatus EQUALS NonCompliant</td><td>QuarantineVLAN90</td><td>Quarantine</td></tr>
<tr><td>2</td><td>Staff</td><td>Wired_802.1X AND AD:ExternalGroups EQUALS example.local/Staff</td><td>StaffVLAN20</td><td>Employees</td></tr>
<tr><td>3</td><td>Cameras</td><td>Wired_MAB AND EndPoints:LogicalProfile EQUALS IP-Cameras</td><td>CameraVLAN40</td><td>Cameras (40)</td></tr>
<tr><td>4</td><td>Guest redirect</td><td>Wired_MAB</td><td>Cisco_WebAuth</td><td>Guests</td></tr>
<tr><td>Default</td><td></td><td></td><td>DenyAccess</td><td></td></tr>
</table>
<p>Order par dhyan do. Agar rule 4 (koi bhi MAB) rule 3 ke upar hota, to cameras us guest portal par bheje jaate jise woh use nahi kar sakte.</p>

<h3>Conditions aur dictionaries</h3>
<p>Conditions <b>dictionary attributes</b> se banti hain: RADIUS (NAS-Port-Type, Called-Station-Id), Cisco (cisco-av-pair), DEVICE (Location, Device Type), Network Access (AuthenticationMethod, EapAuthentication), Session (PostureStatus), EndPoints (LogicalProfile, BYODRegistration), identity group, AD aur LDAP attributes, IdentityGroup:Name. Aap inhe AND/OR se jodkar <b>compound conditions</b> banaate ho aur reusable conditions ko <b>library</b> mein save karte ho. Built-in library conditions mein Wired_802.1X, Wired_MAB, Wireless_802.1X, Wireless_MAB aur Switch_Local_Web_Authentication hain.</p>

<h3>Lab ke nazariye se</h3>
<p>Simulated ISE command <code>aaa-server authz priya vlan 20</code> ka matlab hai "jo authorization rule priya ko match karta hai woh StaffVLAN20 profile lautata hai". Jab CoA lab ise <code>vlan 90</code> karta hai, to woh posture result badalne ki nakal karta hai taaki ab priya ko rule 2 ki jagah rule 1 (Quarantine) match kare.</p>

<div class="eg"><p><b>Worked example.</b> priya (AD group Staff) Gi0/1 mein plug karti hai. Policy set "Wired" match hota hai (DEVICE:Device Type = Access-Switch). Authentication rule Dot1X Wired_802.1X match karta hai aur AD check karta hai: success. Authorization: rule 1 match nahi hota (posture Compliant hai), rule 2 Wired_802.1X aur Staff match karta hai, isliye ISE StaffVLAN20 aur SGT Employees lautata hai. Rules 3, 4 aur Default kabhi evaluate nahi hote. Live Logs dikhata hai Policy Set = Wired, Authentication Rule = Dot1X, Authorization Rule = Staff.</p></div>

<div class="warn"><p><b>Common galti.</b> Naya rule neeche, Default ke theek upar add karna, jabki upar ka ek broader rule pehle se same users pakad leta hai. Naya rule kabhi match nahi hota. Har rule par "Hits" counter check karo: zero hits wala naya rule aam taur par shadowed hota hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Authentication identity store chunta hai aur identity prove karta hai; authorization result chunta hai. "If User not found = Continue" hi anjaan MAB endpoints ko authorization tak pahunchne deta hai. MAB ke liye allowed protocols mein Process Host Lookup hona chahiye.</p></div>

<div class="scn"><h4>Guest portal par printers</h4><p>Ek policy clean-up ke baad ek floor ke saare printers band ho gaye. Live Logs mein Authorization Rule = Guest redirect aur profile Cisco_WebAuth tha. Ek administrator ne generic "Wired_MAB to guest portal" rule ko top par drag kar diya tha. Uske neeche ka printer rule ab kabhi match nahi hota tha. Printer rule ko generic MAB rule ke upar le jaane se printing wapas aayi; phir team ne naming convention aur policy reordering ke liye peer review joda.</p><p><b>Seekh:</b> ISE authorization first-match hai; rules ko sabse specific se sabse general ke order mein rakho.</p></div>

<div class="iv"><p class="q">"ISE mein policy set, authentication policy aur authorization policy mein kya fark hai?"</p><p>Strong answer: policy set pehle device type ya request type jaisi condition se select hota hai aur allowed protocols define karta hai. Uske andar authentication policy identity source chunti hai aur yeh ki user na mile ya fail ho to kya karna hai. Phir authorization policy rules ko top-down evaluate karti hai aur authorization profiles aur security groups lautati hai. Teeno first-match hain. Example do jaise Wired_MAB Continue ke saath guest redirect rule tak pahunchta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Policy sets, authentication rules aur authorization rules sab top-down, pehle match par evaluate hote hain.</li>
<li>Policy sets allowed protocols list rakhte hain (MAB ke liye Process Host Lookup enable karo).</li>
<li>Authentication identity source aur reject, drop ya continue behaviour chunta hai.</li>
<li>Authorization rules authorization profiles aur security groups lautate hain; specific ko general se pehle rakho.</li>
<li>Conditions dictionary attributes aur Wired_802.1X aur Wired_MAB jaisi reusable library conditions use karti hain.</li>
</ul></div>
`}};export{e as default};