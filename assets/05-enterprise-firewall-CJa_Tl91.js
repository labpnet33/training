var e={id:`enterprise-firewall`,h:{en:`Enterprise firewall with application awareness`,hi:`Application awareness wala enterprise firewall`},body:{en:`
<p>ACLs look at addresses and ports. A modern branch also needs to know <b>which application</b> is talking, and to track the conversation so that replies are allowed back automatically. The <b>Enterprise Firewall with Application Awareness</b> on a WAN Edge is a stateful, zone-based firewall that does exactly this. It is the answer to the question left open in the DIA module: what protects the branch when traffic leaves locally?</p>

<h3>Analogy: a reception desk with a visitor book</h3>
<p>A reception desk does not only check who is at the door; it records who went in, so when that visitor leaves or a courier brings back something for them, the guard recognises it. A stranger arriving unannounced with a parcel for the inside is refused. A stateful firewall works the same way: it remembers sessions that started from the inside and allows only their return traffic.</p>

<h3>Zones, zone pairs, and the default</h3>
<p>You group interfaces (or VPNs) into <b>zones</b>. A <b>zone pair</b> is a direction: source zone to destination zone, for example USER to INTERNET. A policy is attached to each zone pair. Traffic between interfaces in <b>different zones is dropped unless a zone-pair policy permits it</b>. Traffic inside the same zone is allowed. The router itself is a special zone, the <b>self zone</b>, used to control traffic to and from the device (for example management access).</p>
<table class="cmp"><tr><th>Concept</th><th>Example at Pune</th></tr>
<tr><td>Zone</td><td>USER = VPN 10, GUEST = VPN 20, INTERNET = VPN 0 (the transport side), SERVER = VPN 30</td></tr>
<tr><td>Zone pair</td><td>GUEST to INTERNET, USER to INTERNET, GUEST to USER</td></tr>
<tr><td>Default</td><td>No pair, no traffic: different zones drop by default</td></tr>
<tr><td>Self zone</td><td>Controls what may reach the router itself</td></tr></table>

<h3>Actions: inspect, pass, drop</h3>
<table class="cmp"><tr><th>Action</th><th>Effect</th><th>Use</th></tr>
<tr><td><b>Inspect</b></td><td>Stateful: allows the flow and automatically allows the return traffic; tracks the session</td><td>Normal permitted traffic (for example web browsing)</td></tr>
<tr><td><b>Pass</b></td><td>Allows packets one way without stateful tracking; you must also permit the reverse</td><td>Special flows such as routing protocols or when no state is wanted</td></tr>
<tr><td><b>Drop</b></td><td>Discards; can be logged</td><td>Blocked applications and default behaviour</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Zone based firewall with zone pairs">
<rect x="20" y="30" width="150" height="50" rx="8" fill="#bbf7d0"/><text x="95" y="60" text-anchor="middle" class="svg-ink" font-size="13">Zone USER (VPN 10)</text>
<rect x="20" y="95" width="150" height="50" rx="8" fill="#fde68a"/><text x="95" y="125" text-anchor="middle" class="svg-ink" font-size="13">Zone GUEST (VPN 20)</text>
<rect x="250" y="55" width="140" height="90" rx="10" fill="#ddd6fe"/><text x="320" y="95" text-anchor="middle" class="svg-ink" font-size="14">E-BR1</text><text x="320" y="115" text-anchor="middle" class="svg-muted" font-size="11">zone-pair policies</text>
<rect x="470" y="55" width="150" height="90" rx="10" fill="#bae6fd"/><text x="545" y="95" text-anchor="middle" class="svg-ink" font-size="13">Zone INTERNET</text><text x="545" y="115" text-anchor="middle" class="svg-muted" font-size="11">VPN 0 transport</text>
<line x1="170" y1="55" x2="250" y2="85" stroke="#16a34a" stroke-width="3"/><line x1="170" y1="120" x2="250" y2="115" stroke="#ea580c" stroke-width="3"/><line x1="390" y1="100" x2="470" y2="100" stroke="#64748b" stroke-width="3"/>
<text x="210" y="175" text-anchor="middle" class="svg-accent" font-size="12">USER to INTERNET: inspect</text><text x="210" y="195" text-anchor="middle" class="svg-accent" font-size="12">GUEST to INTERNET: inspect, block risky apps</text>
<text x="500" y="195" text-anchor="middle" class="svg-muted" font-size="12">no pair means drop</text>
</svg><p class="cap">Traffic needs a zone-pair policy to cross zones. Guests get a stricter policy than staff.</p></div>

<h3>Application awareness</h3>
<p>Matching in a policy can use <b>applications</b>, not only ports. The WAN Edge uses the same application recognition engine as AAR and can classify over a thousand applications (more than 1400 in current releases) and application families, so a rule can say "allow Microsoft 365 and web browsing, block peer-to-peer and games". You can also match on source and destination addresses and protocols. Policies are built in SD-WAN Manager (Configuration, Security), as a security policy attached to devices. The Manager generates the equivalent zone and policy commands on the edge. The resulting configuration looks like the following, and is a good thing to be able to read:</p>
<pre class="code">zone security GUEST
 vpn 20
zone security INTERNET
 vpn 0
ip access-list extended GUEST-WEB-ACL
 10 permit tcp any any eq www
 20 permit tcp any any eq 443
class-map type inspect match-any GUEST-WEB-CM
 match access-group name GUEST-WEB-ACL
 match protocol dns
policy-map type inspect GUEST-PM
 class type inspect GUEST-WEB-CM
  inspect
 class class-default
  drop log
zone-pair security GUEST-TO-INET source GUEST destination INTERNET
 service-policy type inspect GUEST-PM</pre>

<h3>Verification</h3>
<table class="cmp"><tr><th>Command</th><th>Shows</th></tr>
<tr><td><code>show zone-pair security</code></td><td>Configured pairs and the policy attached</td></tr>
<tr><td><code>show policy-map type inspect</code></td><td>Policy structure and match counters</td></tr>
<tr><td><code>show sdwan zonebfwdp sessions</code></td><td>Active inspected sessions</td></tr>
<tr><td><code>show sdwan zbfw zonepair-statistics</code></td><td>Counters per zone pair: packets inspected, passed, dropped</td></tr>
<tr><td><code>show sdwan zbfw drop-statistics</code></td><td>Why packets were dropped</td></tr></table>

<div class="eg"><p><b>Worked example.</b> At Pune, GUEST-PC (10.1.20.10) should browse but not reach staff systems. The security policy has GUEST to INTERNET with inspect for web and DNS, drop with log for everything else, and no GUEST to USER pair, so guest to staff traffic is dropped by default. From GUEST-PC a web request works. A ping to STAFF-PC fails, and <code>show sdwan zbfw drop-statistics</code> increments the zone-pair-drop counter. The test proves the intent.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Using pass when inspect was meant, then wondering why replies are blocked. (2) Forgetting that unlisted zone pairs drop, and being surprised when a new service breaks. (3) Leaving the self zone open to management from the internet. (4) Not using the log option for blocks, so there is no evidence. (5) Assuming the firewall decrypts HTTPS; without TLS inspection it classifies by what it can see and does not read the content.</p></div>

<div class="exam"><p><b>Exam trap.</b> Between different zones the default is drop; within a zone it is allow. Actions: inspect (stateful), pass (no state), drop. The self zone covers traffic to or from the router. The firewall is evaluated after the data policy and before IPsec encryption on traffic leaving the edge.</p></div>

<div class="scn"><h4>New SaaS app blocked after a firewall rollout</h4><p>After a new security policy went live, users in Pune could not open a new CRM service. The policy inspected only web and DNS for USER to INTERNET, with a final drop. <code>show sdwan zbfw drop-statistics</code> showed drops with the new application. The team added the CRM application to the allowed class and tested from STAFF-PC.</p><p><b>Lesson:</b> a final drop is correct, but new needs must go through change control and tests.</p></div>

<div class="iv"><p class="q">"What is the enterprise firewall in SD-WAN and how does it handle traffic?"</p><p>It is a stateful zone-based firewall on the WAN Edge with application awareness. Interfaces or VPNs are put in zones, policies are attached to zone pairs, and traffic between zones is dropped unless a pair permits it. Actions are inspect (stateful, returns allowed), pass and drop, and rules can match applications as well as ports. A self zone protects the device. I verify with show sdwan zbfw zonepair-statistics and drop-statistics.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Zone-based, stateful, application aware; built in Manager as a security policy.</li>
<li>Different zones drop by default; same zone allows; self zone guards the router.</li>
<li>Actions: inspect, pass, drop (with logging).</li>
<li>Verify with <code>show sdwan zbfw zonepair-statistics</code>, <code>drop-statistics</code> and <code>show sdwan zonebfwdp sessions</code>.</li>
<li>It is the main branch protection for DIA traffic.</li>
</ul></div>
`,hi:`
<p>ACLs addresses aur ports dekhti hain. Modern branch ko yeh bhi jaanna padta hai ki <b>kaunsi application</b> baat kar rahi hai, aur conversation ko track karna padta hai taaki replies apne aap wapas aa sakein. WAN Edge par <b>Enterprise Firewall with Application Awareness</b> stateful, zone-based firewall hai jo bilkul yahi karta hai. Yeh DIA module ke adhoore sawaal ka jawab hai: jab traffic locally nikalta hai to branch ko kya protect karta hai?</p>

<h3>Analogy: visitor book wala reception desk</h3>
<p>Reception desk sirf yeh nahi dekhta ki darwaze par kaun hai; woh record bhi rakhta hai ki kaun andar gaya, taaki jab woh visitor wapas jaaye ya courier uske liye kuch laaye to guard pehchaan le. Bina bataye andar ke liye parcel lekar aaya ajnabi refuse hota hai. Stateful firewall bhi aise hi kaam karta hai: woh un sessions ko yaad rakhta hai jo andar se shuru hue aur sirf unka return traffic allow karta hai.</p>

<h3>Zones, zone pairs aur default</h3>
<p>Tum interfaces (ya VPNs) ko <b>zones</b> mein group karte ho. <b>Zone pair</b> ek direction hai: source zone se destination zone, jaise USER se INTERNET. Har zone pair par ek policy lagti hai. <b>Alag zones ke interfaces ke beech traffic tab tak drop hota hai jab tak zone-pair policy permit na kare</b>. Ek hi zone ke andar traffic allowed hai. Router khud ek special zone hai, <b>self zone</b>, jo device ke traffic (jaise management access) ko control karne ke liye hai.</p>
<table class="cmp"><tr><th>Concept</th><th>Pune par example</th></tr>
<tr><td>Zone</td><td>USER = VPN 10, GUEST = VPN 20, INTERNET = VPN 0 (transport side), SERVER = VPN 30</td></tr>
<tr><td>Zone pair</td><td>GUEST se INTERNET, USER se INTERNET, GUEST se USER</td></tr>
<tr><td>Default</td><td>Pair nahi to traffic nahi: alag zones default drop</td></tr>
<tr><td>Self zone</td><td>Router tak kya pahunch sakta hai yeh control karta hai</td></tr></table>

<h3>Actions: inspect, pass, drop</h3>
<table class="cmp"><tr><th>Action</th><th>Asar</th><th>Use</th></tr>
<tr><td><b>Inspect</b></td><td>Stateful: flow allow karta hai aur return traffic apne aap allow; session track karta hai</td><td>Normal permitted traffic (jaise web browsing)</td></tr>
<tr><td><b>Pass</b></td><td>Stateful tracking ke bina ek taraf packets allow karta hai; reverse bhi permit karna padta hai</td><td>Routing protocols jaise special flows ya jab state nahi chahiye</td></tr>
<tr><td><b>Drop</b></td><td>Discard karta hai; log ho sakta hai</td><td>Blocked applications aur default behaviour</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Zone pairs wala zone based firewall">
<rect x="20" y="30" width="150" height="50" rx="8" fill="#bbf7d0"/><text x="95" y="60" text-anchor="middle" class="svg-ink" font-size="13">Zone USER (VPN 10)</text>
<rect x="20" y="95" width="150" height="50" rx="8" fill="#fde68a"/><text x="95" y="125" text-anchor="middle" class="svg-ink" font-size="13">Zone GUEST (VPN 20)</text>
<rect x="250" y="55" width="140" height="90" rx="10" fill="#ddd6fe"/><text x="320" y="95" text-anchor="middle" class="svg-ink" font-size="14">E-BR1</text><text x="320" y="115" text-anchor="middle" class="svg-muted" font-size="11">zone-pair policies</text>
<rect x="470" y="55" width="150" height="90" rx="10" fill="#bae6fd"/><text x="545" y="95" text-anchor="middle" class="svg-ink" font-size="13">Zone INTERNET</text><text x="545" y="115" text-anchor="middle" class="svg-muted" font-size="11">VPN 0 transport</text>
<line x1="170" y1="55" x2="250" y2="85" stroke="#16a34a" stroke-width="3"/><line x1="170" y1="120" x2="250" y2="115" stroke="#ea580c" stroke-width="3"/><line x1="390" y1="100" x2="470" y2="100" stroke="#64748b" stroke-width="3"/>
<text x="210" y="175" text-anchor="middle" class="svg-accent" font-size="12">USER se INTERNET: inspect</text><text x="210" y="195" text-anchor="middle" class="svg-accent" font-size="12">GUEST se INTERNET: inspect, risky apps block</text>
<text x="500" y="195" text-anchor="middle" class="svg-muted" font-size="12">pair nahi to drop</text>
</svg><p class="cap">Zones cross karne ke liye zone-pair policy chahiye. Guests ko staff se zyada strict policy milti hai.</p></div>

<h3>Application awareness</h3>
<p>Policy mein matching <b>applications</b> par ho sakti hai, sirf ports par nahi. WAN Edge AAR wala hi application recognition engine use karta hai aur hazaar se zyada applications (current releases mein 1400 se zyada) aur application families classify kar sakta hai, isliye rule keh sakta hai "Microsoft 365 aur web browsing allow karo, peer-to-peer aur games block karo". Source aur destination addresses aur protocols par bhi match kar sakte ho. Policies SD-WAN Manager (Configuration, Security) mein, devices par lagne wali security policy ke roop mein banti hain. Manager edge par equivalent zone aur policy commands generate karta hai. Nateeja kuch aisa dikhta hai, aur ise padh sakna accha hai:</p>
<pre class="code">zone security GUEST
 vpn 20
zone security INTERNET
 vpn 0
ip access-list extended GUEST-WEB-ACL
 10 permit tcp any any eq www
 20 permit tcp any any eq 443
class-map type inspect match-any GUEST-WEB-CM
 match access-group name GUEST-WEB-ACL
 match protocol dns
policy-map type inspect GUEST-PM
 class type inspect GUEST-WEB-CM
  inspect
 class class-default
  drop log
zone-pair security GUEST-TO-INET source GUEST destination INTERNET
 service-policy type inspect GUEST-PM</pre>

<h3>Verification</h3>
<table class="cmp"><tr><th>Command</th><th>Kya dikhata hai</th></tr>
<tr><td><code>show zone-pair security</code></td><td>Configured pairs aur lagi policy</td></tr>
<tr><td><code>show policy-map type inspect</code></td><td>Policy structure aur match counters</td></tr>
<tr><td><code>show sdwan zonebfwdp sessions</code></td><td>Active inspected sessions</td></tr>
<tr><td><code>show sdwan zbfw zonepair-statistics</code></td><td>Per zone pair counters: inspected, passed, dropped packets</td></tr>
<tr><td><code>show sdwan zbfw drop-statistics</code></td><td>Packets kyun drop hue</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Pune par GUEST-PC (10.1.20.10) browse kare lekin staff systems tak na pahunche. Security policy mein web aur DNS ke liye GUEST se INTERNET inspect, baaki sab ke liye log ke saath drop, aur koi GUEST se USER pair nahi, isliye guest se staff traffic default drop hota hai. GUEST-PC se web request chalti hai. STAFF-PC ko ping fail hota hai, aur <code>show sdwan zbfw drop-statistics</code> mein zone-pair-drop counter badhta hai. Test intent saabit karta hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Inspect ke bajaye pass use karna, phir sochna ki replies kyun block hain. (2) Yaad na rakhna ki unlisted zone pairs drop karte hain, aur naya service tootne par hairan hona. (3) Self zone ko internet se management ke liye khula chhodna. (4) Blocks ke liye log option na lagana, isliye evidence nahi. (5) Maan lena ki firewall HTTPS decrypt karta hai; TLS inspection ke bina woh jo dikhta hai usi se classify karta hai aur content nahi padhta.</p></div>

<div class="exam"><p><b>Exam trap.</b> Alag zones ke beech default drop hai; ek zone ke andar allow. Actions: inspect (stateful), pass (no state), drop. Self zone router ke traffic ko cover karta hai. Firewall edge se nikalte traffic par data policy ke baad aur IPsec encryption se pehle evaluate hota hai.</p></div>

<div class="scn"><h4>Firewall rollout ke baad naya SaaS app blocked</h4><p>Naye security policy ke live hone ke baad Pune ke users naya CRM service nahi khol paaye. Policy USER se INTERNET ke liye sirf web aur DNS inspect karti thi, aakhir mein drop. <code>show sdwan zbfw drop-statistics</code> mein naye application ke saath drops dikhe. Team ne CRM application ko allowed class mein jodkar STAFF-PC se test kiya.</p><p><b>Lesson:</b> final drop sahi hai, lekin nayi zarooratein change control aur tests se guzarni chahiye.</p></div>

<div class="iv"><p class="q">"SD-WAN mein enterprise firewall kya hai aur traffic kaise handle karta hai?"</p><p>Yeh WAN Edge par application awareness wala stateful zone-based firewall hai. Interfaces ya VPNs zones mein jaate hain, policies zone pairs par lagti hain, aur zones ke beech traffic tab tak drop hota hai jab tak pair permit na kare. Actions inspect (stateful, returns allowed), pass aur drop hain, aur rules ports ke saath applications bhi match kar sakte hain. Self zone device ko protect karta hai. Main show sdwan zbfw zonepair-statistics aur drop-statistics se verify karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Zone-based, stateful, application aware; Manager mein security policy ke roop mein banta hai.</li>
<li>Alag zones default drop; ek zone allow; self zone router ki raksha karta hai.</li>
<li>Actions: inspect, pass, drop (logging ke saath).</li>
<li><code>show sdwan zbfw zonepair-statistics</code>, <code>drop-statistics</code> aur <code>show sdwan zonebfwdp sessions</code> se verify karo.</li>
<li>DIA traffic ke liye yeh main branch protection hai.</li>
</ul></div>
`}};export{e as default};