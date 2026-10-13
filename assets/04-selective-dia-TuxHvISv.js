var e={id:`selective-dia`,h:{en:`Step 2, option B: selective DIA with a data policy (Lab 2 walkthrough)`,hi:`Step 2, option B: data policy se selective DIA (Lab 2 walkthrough)`},body:{en:`
<p>The NAT route is all-or-nothing for a VPN. Real companies rarely want that. Security says "guests may use the local internet; staff must keep using the data center firewall". To choose <i>which</i> traffic breaks out, you use a <b>centralized data policy</b> with the action <code>nat use-vpn 0</code>. This chapter explains the policy and walks through Lab 2, <i>Selective DIA for guests with a data policy</i>.</p>

<h3>Analogy: only the guest wing's mail goes by local courier</h3>
<p>Instead of one standing instruction for the whole building, the head office sends a rule sheet to the branch reception: "Mail from the guest wing goes by local courier. Everything else follows the normal route." The rule is selective, written once centrally, and applies to many branches if you want. That sheet is the data policy.</p>

<h3>How it works</h3>
<ol>
<li>Prepare the transport with NAT (chapter 2). Do <b>not</b> add the NAT route, or all of VPN 10 would break out.</li>
<li>On the Controller, build lists: a <b>site-list</b> (site 200), a <b>vpn-list</b> (VPN 10) and a <b>data-prefix-list</b> (the guest subnet 10.1.20.0/24).</li>
<li>Write a data policy whose sequence matches the guest source prefix and has the action <code>nat use-vpn 0</code>, with a counter.</li>
<li>Apply it to the site-list <b>from-service</b>: traffic entering the edge from the LAN is evaluated.</li>
</ol>
<p>Matching traffic is handed to VPN 0 and translated by the DIA NAT. Everything else follows the routing table, which means staff still use the OMP default route to Mumbai.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Data policy splitting guest and staff traffic">
<rect x="10" y="30" width="110" height="46" rx="8" fill="#fed7aa"/><text x="65" y="50" text-anchor="middle" class="svg-ink" font-size="12">GUEST-PC</text><text x="65" y="66" text-anchor="middle" class="svg-muted" font-size="11">10.1.20.10</text>
<rect x="10" y="130" width="110" height="46" rx="8" fill="#e2e8f0"/><text x="65" y="150" text-anchor="middle" class="svg-ink" font-size="12">STAFF-PC</text><text x="65" y="166" text-anchor="middle" class="svg-muted" font-size="11">10.1.10.10</text>
<rect x="210" y="70" width="150" height="80" rx="8" fill="#bae6fd"/><text x="285" y="98" text-anchor="middle" class="svg-ink" font-size="14">E-BR1</text><text x="285" y="118" text-anchor="middle" class="svg-muted" font-size="12">data policy GUEST-DIA</text><text x="285" y="136" text-anchor="middle" class="svg-muted" font-size="12">from-service</text>
<rect x="480" y="20" width="150" height="60" rx="8" fill="#bbf7d0"/><text x="555" y="46" text-anchor="middle" class="svg-ink" font-size="13">Local internet</text><text x="555" y="64" text-anchor="middle" class="svg-muted" font-size="11">seen as 203.0.113.10</text>
<rect x="480" y="130" width="150" height="60" rx="8" fill="#fde68a"/><text x="555" y="156" text-anchor="middle" class="svg-ink" font-size="13">Overlay to E-DC, DC-FW</text><text x="555" y="174" text-anchor="middle" class="svg-muted" font-size="11">seen as 203.0.113.14</text>
<line x1="120" y1="53" x2="210" y2="95" stroke="#64748b" stroke-width="2"/><line x1="120" y1="153" x2="210" y2="125" stroke="#64748b" stroke-width="2"/>
<line x1="360" y1="95" x2="480" y2="50" stroke="#16a34a" stroke-width="3"/><text x="420" y="62" text-anchor="middle" class="svg-accent" font-size="11">nat use-vpn 0</text>
<line x1="360" y1="125" x2="480" y2="160" stroke="#2563eb" stroke-width="3" stroke-dasharray="6 4"/><text x="425" y="152" text-anchor="middle" class="svg-accent" font-size="11">routing table</text>
</svg><p class="cap">The policy diverts only guest-sourced traffic. Staff stay on the backhaul path.</p></div>

<h3>The policy</h3>
<pre class="code"><span class="c">! on the Controller (VSMART): policy, then apply-policy</span>
VSMART# config
VSMART(config)# policy
 lists
  site-list PUNE
   site-id 200
  vpn-list CORP
   vpn 10
  data-prefix-list GUEST-NET
   ip-prefix 10.1.20.0/24
 data-policy GUEST-DIA
  vpn-list CORP
   sequence 10
    match
     source-data-prefix-list GUEST-NET
    action accept
     nat use-vpn 0 fallback
     count guest-dia
   default-action accept
exit
VSMART(config)# apply-policy
 site-list PUNE
  data-policy GUEST-DIA from-service
 exit
VSMART(config)# commit and-quit</pre>
<ul>
<li><code>nat use-vpn 0</code> means: translate the traffic and send it out of VPN 0 (the transport).</li>
<li><code>fallback</code> means: if the local exit cannot be used (NAT interface down), do <b>not</b> drop; continue with a normal routing lookup, for example the backhaul default. Without it, matching traffic is dropped when the DIA exit is down. In Manager this is the <b>NAT Fallback</b> checkbox next to the NAT VPN 0 action; some releases display it as a separate <code>nat fallback</code> line.</li>
<li><code>default-action accept</code> keeps all other traffic flowing normally. A data policy's default is drop.</li>
<li><code>from-service</code> is the right direction: DIA traffic comes from the LAN. Applied <code>from-tunnel</code> it would never see branch traffic.</li>
</ul>

<h3>Lab 2 tasks, step by step</h3>
<h4>Task 1: NAT on GigabitEthernet1, but no NAT route</h4>
<p>Same two NAT lines as before. Confirm with <code>show sdwan nat-dia summary</code> that the interface is listed and the routes line says none: staff must stay on backhaul.</p>

<h4>Task 2: build and apply the policy on VSMART</h4>
<p>Use the policy above. Then check what the edge received:</p>
<pre class="out">E-BR1# show sdwan policy from-vsmart
from-vsmart data-policy GUEST-DIA
 direction from-service
 vpn-list CORP
  sequence 10
   match
    source-data-prefix-list GUEST-NET
   action accept
    <span class="hl">nat use-vpn 0 fallback</span>
    count guest-dia
  default-action accept</pre>

<h4>Task 3: prove guest DIA</h4>
<pre class="out">GUEST-PC&gt; ping 8.8.8.8
84 bytes from 8.8.8.8 icmp_seq=1 ttl=63 time=3.1 ms

E-BR1# show sdwan policy data-policy-filter
data-policy-filter GUEST-DIA
 data-policy-vpnlist CORP
  data-policy-counter guest-dia
   <span class="hl">packets  5</span>

E-BR1# show ip nat translations
icmp 203.0.113.10:20003  10.1.20.10:20003  8.8.8.8:20003  8.8.8.8:20003</pre>
<p>The counter increases, and the guest address is translated to the Pune transport address 203.0.113.10.</p>

<h4>Task 4: prove staff backhaul</h4>
<pre class="out">STAFF-PC&gt; traceroute 8.8.8.8
 1  10.1.10.1
 2  10.100.0.1
 3  10.100.0.2
 4  8.8.8.8

E-BR1# show sdwan policy service-path vpn 10 interface GigabitEthernet3 source-ip 10.1.10.10 dest-ip 8.8.8.8 protocol 1
 Next Hop: IPsec
  <span class="hl">Remote System IP: 10.255.0.1</span> (overlay to E-DC)</pre>
<p>Staff traffic still reaches the internet through the Mumbai firewall (seen as 203.0.113.14), using the overlay.</p>

<h4>Task 5: confirm the safe fallback</h4>
<p>The keyword <code>fallback</code> after <code>nat use-vpn 0</code> is in the received policy (see Task 2). If you had forgotten it, add it on VSMART and commit, then re-check <code>show sdwan policy from-vsmart</code>.</p>

<h3>Improving the policy: do not break internal access</h3>
<p>The first version matches only the guest <b>source</b>. Guests now also reach the data center prefix through local NAT, which breaks a captive-portal server in the data center. Add an <b>earlier sequence</b> that accepts internal destinations without NAT, or match the destination too:</p>
<pre class="code">   sequence 5
    match
     source-data-prefix-list GUEST-NET
     destination-data-prefix-list INTERNAL-NETS
    action accept
     count guest-internal
   sequence 10
    match
     source-data-prefix-list GUEST-NET
    action accept
     nat use-vpn 0 fallback
     count guest-dia</pre>
<p>Sequence 5 matches guest traffic to the internal prefixes (10.0.0.0/8) and simply accepts it, so it follows the routing table through the overlay. Sequence 10 catches the remaining guest traffic, which is internet-bound, and breaks it out.</p>

<table class="cmp"><tr><th></th><th>NAT DIA route</th><th>Data policy nat use-vpn 0</th></tr>
<tr><td>Match</td><td>Destination only (default route)</td><td>Source, destination, application, port, DSCP</td></tr>
<tr><td>Scope</td><td>Whole VRF at this site</td><td>Exactly what you match; many sites at once</td></tr>
<tr><td>Where configured</td><td>On the edge (template or CLI)</td><td>On the Controller (centralized policy)</td></tr>
<tr><td>Failure behaviour</td><td>Route stays unless a tracker removes it</td><td>fallback continues with routing</td></tr></table>

<div class="warn"><p><b>Common mistakes.</b> (1) Adding the NAT route as well as the policy, which turns the whole VPN local. (2) Forgetting <code>default-action accept</code>, which drops all non-guest traffic. (3) Applying the policy <code>from-tunnel</code>. (4) Omitting <code>fallback</code>. (5) A match that is too broad and sends internal destinations to the internet.</p></div>

<div class="exam"><p><b>Exam trap.</b> When only part of the traffic may break out, the answer is a <b>centralized data policy</b> with <code>nat use-vpn 0</code>, applied <b>from-service</b>. The NAT route cannot match on source and is not the right tool.</p></div>

<div class="scn"><h4>Guests lost the captive portal</h4><p>After the Pune guest DIA policy went live, guests could browse but could no longer open the captive-portal login page hosted in the Mumbai data center. The policy matched the guest subnet as source only, so traffic to the DC prefix was translated and sent to the internet, where the private address did not exist. The engineer added a first sequence that accepted guest traffic to the internal prefix list without NAT. The portal worked again, and the guest-dia counter still increased for internet traffic.</p><p><b>Lesson:</b> a source-only match is wider than it looks. Always think about destinations.</p></div>

<div class="iv"><p class="q">"How would you let only guest Wi-Fi use the local internet at a branch while staff stay on backhaul?"</p><p>Enable NAT on the transport, do not add a NAT route, and create a centralized data policy matching the guest source prefix with nat use-vpn 0 plus fallback, apply it to the branch site-list from-service, and finish with default-action accept. Add an earlier sequence for internal destinations. Prove it with the policy counter, NAT translations and service-path.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>nat use-vpn 0 in a centralized data policy breaks out only the traffic you match.</li>
<li>Apply it from-service to a site-list; end with default-action accept; do not add the NAT route.</li>
<li>fallback keeps traffic flowing through normal routing if the local exit is down.</li>
<li>Guard internal destinations with an earlier sequence so they are not sent to the internet.</li>
<li>Prove with show sdwan policy from-vsmart, data-policy-filter counters, NAT translations and service-path.</li>
</ul></div>
`,hi:`
<p>NAT route ek VPN ke liye all-or-nothing hai. Real companies ko aksar yeh nahi chahiye. Security kehti hai "guests local internet use kar sakte hain; staff ko data center firewall hi use karna hai". <i>Kaunsa</i> traffic break out kare yeh chunne ke liye aap <code>nat use-vpn 0</code> action wali <b>centralized data policy</b> use karte ho. Yeh chapter policy samjhata hai aur Lab 2, <i>Data policy se sirf guests ke liye DIA</i>, walk-through karta hai.</p>

<h3>Analogy: sirf guest wing ki mail local courier se</h3>
<p>Poori building ke liye ek standing instruction ki jagah, head office branch reception ko rule sheet bhejta hai: "Guest wing ki mail local courier se jaayegi. Baaki sab normal route follow karega." Rule selective hai, ek baar centrally likha jaata hai, aur chaho to kai branches par lagta hai. Woh sheet hi data policy hai.</p>

<h3>Yeh kaise kaam karta hai</h3>
<ol>
<li>Transport par NAT taiyaar karo (chapter 2). NAT route <b>mat</b> jodo, warna VPN 10 ka sab kuch break out ho jaayega.</li>
<li>Controller par lists banao: <b>site-list</b> (site 200), <b>vpn-list</b> (VPN 10) aur <b>data-prefix-list</b> (guest subnet 10.1.20.0/24).</li>
<li>Aisi data policy likho jiska sequence guest source prefix match kare aur action <code>nat use-vpn 0</code> ho, counter ke saath.</li>
<li>Use site-list par <b>from-service</b> apply karo: LAN se edge mein aane wala traffic evaluate hota hai.</li>
</ol>
<p>Matching traffic VPN 0 ko diya jaata hai aur DIA NAT se translate hota hai. Baaki sab routing table follow karta hai, yaani staff abhi bhi Mumbai ke OMP default route ka use karta hai.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Data policy guest aur staff traffic ko baantti hai">
<rect x="10" y="30" width="110" height="46" rx="8" fill="#fed7aa"/><text x="65" y="50" text-anchor="middle" class="svg-ink" font-size="12">GUEST-PC</text><text x="65" y="66" text-anchor="middle" class="svg-muted" font-size="11">10.1.20.10</text>
<rect x="10" y="130" width="110" height="46" rx="8" fill="#e2e8f0"/><text x="65" y="150" text-anchor="middle" class="svg-ink" font-size="12">STAFF-PC</text><text x="65" y="166" text-anchor="middle" class="svg-muted" font-size="11">10.1.10.10</text>
<rect x="210" y="70" width="150" height="80" rx="8" fill="#bae6fd"/><text x="285" y="98" text-anchor="middle" class="svg-ink" font-size="14">E-BR1</text><text x="285" y="118" text-anchor="middle" class="svg-muted" font-size="12">data policy GUEST-DIA</text><text x="285" y="136" text-anchor="middle" class="svg-muted" font-size="12">from-service</text>
<rect x="480" y="20" width="150" height="60" rx="8" fill="#bbf7d0"/><text x="555" y="46" text-anchor="middle" class="svg-ink" font-size="13">Local internet</text><text x="555" y="64" text-anchor="middle" class="svg-muted" font-size="11">203.0.113.10 dikhta hai</text>
<rect x="480" y="130" width="150" height="60" rx="8" fill="#fde68a"/><text x="555" y="156" text-anchor="middle" class="svg-ink" font-size="13">Overlay se E-DC, DC-FW</text><text x="555" y="174" text-anchor="middle" class="svg-muted" font-size="11">203.0.113.14 dikhta hai</text>
<line x1="120" y1="53" x2="210" y2="95" stroke="#64748b" stroke-width="2"/><line x1="120" y1="153" x2="210" y2="125" stroke="#64748b" stroke-width="2"/>
<line x1="360" y1="95" x2="480" y2="50" stroke="#16a34a" stroke-width="3"/><text x="420" y="62" text-anchor="middle" class="svg-accent" font-size="11">nat use-vpn 0</text>
<line x1="360" y1="125" x2="480" y2="160" stroke="#2563eb" stroke-width="3" stroke-dasharray="6 4"/><text x="425" y="152" text-anchor="middle" class="svg-accent" font-size="11">routing table</text>
</svg><p class="cap">Policy sirf guest-sourced traffic ko divert karti hai. Staff backhaul path par rehta hai.</p></div>

<h3>Policy</h3>
<pre class="code"><span class="c">! on the Controller (VSMART): policy, then apply-policy</span>
VSMART# config
VSMART(config)# policy
 lists
  site-list PUNE
   site-id 200
  vpn-list CORP
   vpn 10
  data-prefix-list GUEST-NET
   ip-prefix 10.1.20.0/24
 data-policy GUEST-DIA
  vpn-list CORP
   sequence 10
    match
     source-data-prefix-list GUEST-NET
    action accept
     nat use-vpn 0 fallback
     count guest-dia
   default-action accept
exit
VSMART(config)# apply-policy
 site-list PUNE
  data-policy GUEST-DIA from-service
 exit
VSMART(config)# commit and-quit</pre>
<ul>
<li><code>nat use-vpn 0</code> ka matlab: traffic ko translate karo aur VPN 0 (transport) se bahar bhejo.</li>
<li><code>fallback</code> ka matlab: agar local exit use na ho sake (NAT interface down), to drop <b>mat</b> karo; normal routing lookup ke saath aage badho, jaise backhaul default. Iske bina DIA exit down hone par matching traffic drop ho jaata hai. Manager mein yeh NAT VPN 0 action ke paas <b>NAT Fallback</b> checkbox hai; kuch releases ise alag <code>nat fallback</code> line ke roop mein dikhate hain.</li>
<li><code>default-action accept</code> baaki saara traffic normally chalata hai. Data policy ka default drop hota hai.</li>
<li><code>from-service</code> sahi direction hai: DIA traffic LAN se aata hai. <code>from-tunnel</code> par lagayi to woh branch traffic kabhi nahi dekhegi.</li>
</ul>

<h3>Lab 2 tasks, step by step</h3>
<h4>Task 1: GigabitEthernet1 par NAT, lekin NAT route nahi</h4>
<p>Pehle wali hi do NAT lines. <code>show sdwan nat-dia summary</code> se confirm karo ki interface listed hai aur routes line none kehti hai: staff ko backhaul par hi rehna hai.</p>

<h4>Task 2: VSMART par policy banao aur apply karo</h4>
<p>Upar wali policy use karo. Phir check karo edge ko kya mila:</p>
<pre class="out">E-BR1# show sdwan policy from-vsmart
from-vsmart data-policy GUEST-DIA
 direction from-service
 vpn-list CORP
  sequence 10
   match
    source-data-prefix-list GUEST-NET
   action accept
    <span class="hl">nat use-vpn 0 fallback</span>
    count guest-dia
  default-action accept</pre>

<h4>Task 3: guest DIA saabit karo</h4>
<pre class="out">GUEST-PC&gt; ping 8.8.8.8
84 bytes from 8.8.8.8 icmp_seq=1 ttl=63 time=3.1 ms

E-BR1# show sdwan policy data-policy-filter
data-policy-filter GUEST-DIA
 data-policy-vpnlist CORP
  data-policy-counter guest-dia
   <span class="hl">packets  5</span>

E-BR1# show ip nat translations
icmp 203.0.113.10:20003  10.1.20.10:20003  8.8.8.8:20003  8.8.8.8:20003</pre>
<p>Counter badhta hai, aur guest address Pune transport address 203.0.113.10 mein translate hota hai.</p>

<h4>Task 4: staff backhaul saabit karo</h4>
<pre class="out">STAFF-PC&gt; traceroute 8.8.8.8
 1  10.1.10.1
 2  10.100.0.1
 3  10.100.0.2
 4  8.8.8.8

E-BR1# show sdwan policy service-path vpn 10 interface GigabitEthernet3 source-ip 10.1.10.10 dest-ip 8.8.8.8 protocol 1
 Next Hop: IPsec
  <span class="hl">Remote System IP: 10.255.0.1</span> (overlay to E-DC)</pre>
<p>Staff traffic abhi bhi Mumbai firewall (203.0.113.14 dikhta hai) se internet tak jaata hai, overlay use karke.</p>

<h4>Task 5: safe fallback confirm karo</h4>
<p><code>nat use-vpn 0</code> ke baad <code>fallback</code> keyword received policy mein hai (Task 2 dekho). Agar bhool gaye hote to VSMART par jodo aur commit karo, phir <code>show sdwan policy from-vsmart</code> dobara check karo.</p>

<h3>Policy behtar banana: internal access mat todo</h3>
<p>Pehla version sirf guest <b>source</b> match karta hai. Ab guests data center prefix tak bhi local NAT se pahunchte hain, jo data center mein hosted captive-portal server ko tod deta hai. <b>Pehle ka sequence</b> jodo jo internal destinations ko bina NAT accept kare, ya destination bhi match karo:</p>
<pre class="code">   sequence 5
    match
     source-data-prefix-list GUEST-NET
     destination-data-prefix-list INTERNAL-NETS
    action accept
     count guest-internal
   sequence 10
    match
     source-data-prefix-list GUEST-NET
    action accept
     nat use-vpn 0 fallback
     count guest-dia</pre>
<p>Sequence 5 guest traffic ko internal prefixes (10.0.0.0/8) tak match karke bas accept karta hai, isliye woh routing table se overlay ke through jaata hai. Sequence 10 baaki guest traffic pakadta hai, jo internet-bound hai, aur use break out karta hai.</p>

<table class="cmp"><tr><th></th><th>NAT DIA route</th><th>Data policy nat use-vpn 0</th></tr>
<tr><td>Match</td><td>Sirf destination (default route)</td><td>Source, destination, application, port, DSCP</td></tr>
<tr><td>Scope</td><td>Is site par poora VRF</td><td>Jo aap match karo wahi; ek saath kai sites</td></tr>
<tr><td>Kahan configure</td><td>Edge par (template ya CLI)</td><td>Controller par (centralized policy)</td></tr>
<tr><td>Failure behaviour</td><td>Route rehta hai jab tak tracker na hataye</td><td>fallback routing ke saath aage badhta hai</td></tr></table>

<div class="warn"><p><b>Common mistakes.</b> (1) Policy ke saath NAT route bhi jodna, jisse poora VPN local ho jaata hai. (2) <code>default-action accept</code> bhoolna, jo saare non-guest traffic ko drop kar deta hai. (3) Policy ko <code>from-tunnel</code> apply karna. (4) <code>fallback</code> chhod dena. (5) Bahut broad match jo internal destinations ko internet bhej deta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Jab sirf kuch traffic break out kar sakta ho, jawab <b>centralized data policy</b> hai jisme <code>nat use-vpn 0</code>, <b>from-service</b> apply. NAT route source par match nahi kar sakta aur sahi tool nahi hai.</p></div>

<div class="scn"><h4>Guests ka captive portal chala gaya</h4><p>Pune guest DIA policy live hone ke baad guests browse kar sakte the lekin Mumbai data center mein hosted captive-portal login page ab nahi khol paate the. Policy sirf guest subnet ko source ke roop mein match karti thi, isliye DC prefix ka traffic translate hokar internet bheja gaya, jahan private address exist hi nahi karta. Engineer ne pehla sequence joda jo guest traffic ko internal prefix list tak bina NAT accept karta tha. Portal wapas chala, aur internet traffic ke liye guest-dia counter ab bhi badhta raha.</p><p><b>Lesson:</b> source-only match dikhne se zyada wide hota hai. Hamesha destinations ke baare mein socho.</p></div>

<div class="iv"><p class="q">"Branch par sirf guest Wi-Fi ko local internet kaise doge jabki staff backhaul par rahe?"</p><p>Transport par NAT enable karo, NAT route mat jodo, guest source prefix match karne wali centralized data policy banao nat use-vpn 0 plus fallback ke saath, use branch site-list par from-service apply karo, aur default-action accept se khatam karo. Internal destinations ke liye pehle ka sequence jodo. Policy counter, NAT translations aur service-path se saabit karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Centralized data policy mein nat use-vpn 0 sirf wahi traffic break out karta hai jo aap match karo.</li>
<li>Site-list par from-service apply karo; default-action accept se khatam karo; NAT route mat jodo.</li>
<li>fallback local exit down hone par traffic ko normal routing se chalata rakhta hai.</li>
<li>Internal destinations ko pehle ke sequence se guard karo taaki woh internet na bheje jaayein.</li>
<li>show sdwan policy from-vsmart, data-policy-filter counters, NAT translations aur service-path se saabit karo.</li>
</ul></div>
`}};export{e as default};