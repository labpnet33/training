var e={id:`overview`,h:{en:`NAT on a FortiGate: what you will learn and the big picture`,hi:`FortiGate par NAT: kya seekhoge aur big picture`},body:{en:`
<p><b>What you will learn in this module.</b> You will learn how a FortiGate translates addresses: source NAT for users going out, IP pools for a choice of public addresses, and virtual IPs (VIPs) with port forwarding for publishing servers to the internet. You will also read a translation in the session table and meet central NAT as the alternative design. These are the NAT objectives of the Fortinet NSE 4 / FortiOS Administrator track (FortiOS 7.x). You practise on the Pune lab in the simulator.</p>
<p><b>Prerequisites.</b> You should know the FortiOS CLI and interfaces (<code>nse4-setup</code>) and how firewall policies match and are ordered (<code>nse4-policy</code>). If you want a general NAT refresher on another platform, <code>sec-asa-nat</code> explains the same ideas with Cisco ASA commands. User-based policies come later in <code>nse4-auth</code>.</p>

<h3>Analogy: the company reception desk</h3>
<p>Your office has 200 employees but one public phone number. When an employee calls out, the receptionist places the call from the main number and writes in a notebook "line 3 is Asha". When the customer calls back on line 3, the receptionist connects Asha. This is <b>source NAT with port translation (PAT)</b>. Now suppose customers should reach the sales team directly: the receptionist keeps a list "extension 8080 goes to Sales desk". That is a <b>virtual IP with port forwarding</b>: a fixed public address and port that always lead to one internal server.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="SNAT out, DNAT in">
<rect x="10" y="70" width="120" height="60" rx="10" fill="#bae6fd"/><text x="70" y="96" text-anchor="middle" class="svg-ink" font-size="13">LAN PC1</text><text x="70" y="114" text-anchor="middle" class="svg-muted" font-size="12">10.0.1.10</text>
<rect x="260" y="50" width="120" height="100" rx="10" fill="#ddd6fe"/><text x="320" y="86" text-anchor="middle" class="svg-ink" font-size="14">FortiGate</text><text x="320" y="106" text-anchor="middle" class="svg-muted" font-size="12">policy + NAT</text><text x="320" y="124" text-anchor="middle" class="svg-muted" font-size="12">203.0.113.2</text>
<rect x="510" y="70" width="120" height="60" rx="10" fill="#bbf7d0"/><text x="570" y="96" text-anchor="middle" class="svg-ink" font-size="13">Internet</text><text x="570" y="114" text-anchor="middle" class="svg-muted" font-size="12">8.8.8.8</text>
<line x1="130" y1="90" x2="260" y2="90" stroke="#64748b" stroke-width="2"/><text x="195" y="82" text-anchor="middle" class="svg-accent" font-size="12">src 10.0.1.10</text>
<line x1="380" y1="90" x2="510" y2="90" stroke="#64748b" stroke-width="2"/><text x="445" y="82" text-anchor="middle" class="svg-accent" font-size="12">src 203.0.113.2</text>
<rect x="10" y="150" width="120" height="40" rx="10" fill="#fde68a"/><text x="70" y="175" text-anchor="middle" class="svg-ink" font-size="13">WEB 10.0.2.10</text>
<line x1="130" y1="170" x2="260" y2="130" stroke="#64748b" stroke-width="2"/><text x="470" y="170" text-anchor="middle" class="svg-accent" font-size="12">VIP 203.0.113.3:8080 in</text>
<line x1="510" y1="140" x2="380" y2="140" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
</svg><p class="cap">Outbound traffic gets a new source (SNAT). Inbound published traffic gets a new destination (DNAT through a VIP).</p></div>

<h3>Why NAT exists</h3>
<ul>
<li><b>Private addressing.</b> LANs use ranges such as 10.0.0.0/8 that are not routable on the internet. NAT lets them reach public servers with a public source.</li>
<li><b>Address saving.</b> Many hosts share one or a few public addresses (PAT).</li>
<li><b>Publishing.</b> A server in a DMZ is exposed on a public address without giving it that address directly.</li>
<li><b>Side effect, not a defence.</b> NAT hides internal addressing, but security comes from policies. A VIP with a permissive policy is still an open door.</li>
</ul>

<h3>The two NAT families in FortiOS</h3>
<table class="cmp"><tr><th>Direction</th><th>Tool</th><th>Where it is set</th></tr>
<tr><td>Source NAT (outbound)</td><td><code>nat enable</code>, optional IP pool</td><td>In the firewall policy (policy-based mode)</td></tr>
<tr><td>Destination NAT (inbound)</td><td>Virtual IP (VIP) object</td><td>Object under <code>config firewall vip</code>, used as <code>dstaddr</code> in a policy</td></tr>
<tr><td>Both, as separate tables</td><td>Central NAT</td><td>SNAT map and DNAT objects; policy has no NAT switch</td></tr></table>
<p>The default design for NSE 4 is <b>policy-based NAT</b>. Central NAT is shown in chapter 7 as a reference, since the simulator runs policy-based NAT only.</p>

<h3>The big question: what order?</h3>
<p>A packet entering from outside to a published server is translated <b>before</b> the policy is chosen: DNAT first, then routing, then the policy, and any SNAT happens last on the way out. For a packet leaving the LAN, the policy is chosen first and the source address is rewritten as it leaves. Keep this order in your head. It explains why a VIP policy names the VIP as destination and the DMZ as egress.</p>
<pre class="out">FGT1 # get system session list
PROTO   EXPIRE SOURCE                SOURCE-NAT            DESTINATION           DESTINATION-NAT
tcp     3600   10.0.1.10:64251       <span class="hl">203.0.113.2:60001</span>     8.8.8.8:80            -</pre>
<p>This is a real session of the lab: PC1 10.0.1.10 reached 8.8.8.8, and the server saw the FortiGate WAN address 203.0.113.2 with a translated source port.</p>

<div class="eg"><p><b>Worked example.</b> Three PCs open the same site at the same time. They all leave as 203.0.113.2. The FortiGate tells their connections apart by the translated source ports, such as 60001, 60002 and 60003, and rewrites the replies back to the right PC. That is PAT, and it is why one public IP can serve hundreds of users.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Assuming that NAT alone allows traffic. NAT only rewrites addresses of traffic that a policy has already accepted. Without an accept policy, even a perfect VIP gives timeouts.</p></div>
<div class="exam"><p><b>Exam trap.</b> In policy-based mode, source NAT is a policy setting. A VIP, on the other hand, is an object and is applied by using it as the policy destination. Do not mix them up.</p></div>

<div class="scn"><h4>The website that vanished after an ISP change</h4><p>A small company moved to a new ISP with the public block 203.0.113.0/29. Staff could browse but the customer portal was unreachable. The portal VIP still held the old public address. The engineer edited <code>extip</code> in one VIP object, and every policy that used the VIP started to match again.</p><p><b>Lesson:</b> VIPs are objects. Edit the object once and policies follow.</p></div>

<div class="iv"><p class="q">"What is the difference between source NAT and a virtual IP on a FortiGate?"</p><p>Source NAT rewrites the source address (and port) of outbound traffic and is enabled in the policy with <code>nat enable</code>, optionally with an IP pool. A VIP is a destination NAT object that maps a public address and port to a private server; it is used as the destination in an inbound policy. Say that a policy must still accept the traffic.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Source NAT is switched on in the policy; the default source is the egress interface address.</li>
<li>A VIP is an object for destination NAT (publishing a server) and is used as policy destination.</li>
<li>NAT rewrites addresses of traffic that a policy has already accepted; it never replaces a policy.</li>
<li>The session table shows the translation in SOURCE-NAT and DESTINATION-NAT.</li>
<li>Central NAT is an alternative design where NAT lives in its own tables.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap seekhoge ki FortiGate addresses ko kaise translate karta hai: bahar jaane wale users ke liye source NAT, public addresses ke choice ke liye IP pools, aur servers ko internet par publish karne ke liye virtual IPs (VIPs) port forwarding ke saath. Aap session table mein translation padhna bhi seekhoge aur alternative design ke roop mein central NAT se milenge. Yeh Fortinet NSE 4 / FortiOS Administrator track (FortiOS 7.x) ke NAT objectives hain. Practise simulator mein Pune lab par hota hai.</p>
<p><b>Prerequisites.</b> Aapko FortiOS CLI aur interfaces (<code>nse4-setup</code>) aur firewall policies kaise match aur order hoti hain (<code>nse4-policy</code>) pata hone chahiye. Doosre platform par general NAT refresher chahiye to <code>sec-asa-nat</code> wahi ideas Cisco ASA commands ke saath samjhata hai. User-based policies baad mein <code>nse4-auth</code> mein aati hain.</p>

<h3>Analogy: company ka reception desk</h3>
<p>Aapke office mein 200 employees hain lekin ek public phone number hai. Employee bahar call kare to receptionist main number se call lagati hai aur notebook mein likhti hai "line 3 Asha hai". Customer line 3 par wapas call kare to receptionist Asha ko connect karti hai. Yeh <b>port translation ke saath source NAT (PAT)</b> hai. Ab maano customers seedha sales team tak pahunchein: receptionist ek list rakhti hai "extension 8080 Sales desk ko jaata hai". Yeh <b>port forwarding ke saath virtual IP</b> hai: ek fixed public address aur port jo hamesha ek internal server tak le jaate hain.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="SNAT out, DNAT in">
<rect x="10" y="70" width="120" height="60" rx="10" fill="#bae6fd"/><text x="70" y="96" text-anchor="middle" class="svg-ink" font-size="13">LAN PC1</text><text x="70" y="114" text-anchor="middle" class="svg-muted" font-size="12">10.0.1.10</text>
<rect x="260" y="50" width="120" height="100" rx="10" fill="#ddd6fe"/><text x="320" y="86" text-anchor="middle" class="svg-ink" font-size="14">FortiGate</text><text x="320" y="106" text-anchor="middle" class="svg-muted" font-size="12">policy + NAT</text><text x="320" y="124" text-anchor="middle" class="svg-muted" font-size="12">203.0.113.2</text>
<rect x="510" y="70" width="120" height="60" rx="10" fill="#bbf7d0"/><text x="570" y="96" text-anchor="middle" class="svg-ink" font-size="13">Internet</text><text x="570" y="114" text-anchor="middle" class="svg-muted" font-size="12">8.8.8.8</text>
<line x1="130" y1="90" x2="260" y2="90" stroke="#64748b" stroke-width="2"/><text x="195" y="82" text-anchor="middle" class="svg-accent" font-size="12">src 10.0.1.10</text>
<line x1="380" y1="90" x2="510" y2="90" stroke="#64748b" stroke-width="2"/><text x="445" y="82" text-anchor="middle" class="svg-accent" font-size="12">src 203.0.113.2</text>
<rect x="10" y="150" width="120" height="40" rx="10" fill="#fde68a"/><text x="70" y="175" text-anchor="middle" class="svg-ink" font-size="13">WEB 10.0.2.10</text>
<line x1="130" y1="170" x2="260" y2="130" stroke="#64748b" stroke-width="2"/><text x="470" y="170" text-anchor="middle" class="svg-accent" font-size="12">VIP 203.0.113.3:8080 andar</text>
<line x1="510" y1="140" x2="380" y2="140" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
</svg><p class="cap">Outbound traffic ko naya source milta hai (SNAT). Inbound published traffic ko naya destination milta hai (VIP ke through DNAT).</p></div>

<h3>NAT kyun hota hai</h3>
<ul>
<li><b>Private addressing.</b> LANs 10.0.0.0/8 jaise ranges use karte hain jo internet par routable nahi hote. NAT unhe public source ke saath public servers tak pahunchne deta hai.</li>
<li><b>Address bachana.</b> Kai hosts ek ya kuch public addresses share karte hain (PAT).</li>
<li><b>Publishing.</b> DMZ ka server public address par expose hota hai bina use woh address seedha diye.</li>
<li><b>Side effect, defence nahi.</b> NAT internal addressing chhupata hai, lekin security policies se aati hai. Permissive policy wala VIP phir bhi khula darwaza hai.</li>
</ul>

<h3>FortiOS mein NAT ke do families</h3>
<table class="cmp"><tr><th>Direction</th><th>Tool</th><th>Kahan set hota hai</th></tr>
<tr><td>Source NAT (outbound)</td><td><code>nat enable</code>, optional IP pool</td><td>Firewall policy mein (policy-based mode)</td></tr>
<tr><td>Destination NAT (inbound)</td><td>Virtual IP (VIP) object</td><td><code>config firewall vip</code> ke neeche object, policy mein <code>dstaddr</code> ke roop mein</td></tr>
<tr><td>Dono, alag tables mein</td><td>Central NAT</td><td>SNAT map aur DNAT objects; policy mein NAT switch nahi</td></tr></table>
<p>NSE 4 ka default design <b>policy-based NAT</b> hai. Central NAT chapter 7 mein reference ke roop mein dikhaya gaya hai, kyunki simulator sirf policy-based NAT chalata hai.</p>

<h3>Bada sawal: kaunsa order?</h3>
<p>Bahar se published server ki taraf aane wala packet policy chunne se <b>pehle</b> translate hota hai: pehle DNAT, phir routing, phir policy, aur koi bhi SNAT aakhir mein bahar jaate waqt. LAN se nikalne wale packet ke liye pehle policy chuni jaati hai aur source address nikalte waqt rewrite hota hai. Yeh order dimaag mein rakho. Yahi samjhata hai ki VIP policy destination ke roop mein VIP ka naam aur egress ke roop mein DMZ kyun likhti hai.</p>
<pre class="out">FGT1 # get system session list
PROTO   EXPIRE SOURCE                SOURCE-NAT            DESTINATION           DESTINATION-NAT
tcp     3600   10.0.1.10:64251       <span class="hl">203.0.113.2:60001</span>     8.8.8.8:80            -</pre>
<p>Yeh lab ka real session hai: PC1 10.0.1.10 ne 8.8.8.8 reach kiya, aur server ne FortiGate ka WAN address 203.0.113.2 translated source port ke saath dekha.</p>

<div class="eg"><p><b>Worked example.</b> Teen PCs ek hi site ek saath kholte hain. Sab 203.0.113.2 ban kar nikalte hain. FortiGate unke connections ko translated source ports, jaise 60001, 60002 aur 60003, se alag pehchanta hai aur replies ko sahi PC par rewrite karta hai. Yeh PAT hai, aur isi wajah se ek public IP sainkdon users ko serve kar sakta hai.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Yeh maan lena ki sirf NAT traffic allow kar deta hai. NAT sirf un traffic ke addresses rewrite karta hai jinhe policy pehle hi accept kar chuki hai. Accept policy ke bina perfect VIP bhi timeouts deta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Policy-based mode mein source NAT policy setting hai. VIP, doosri taraf, object hai aur use policy destination banakar apply kiya jaata hai. Dono ko mat milao.</p></div>

<div class="scn"><h4>ISP badalne ke baad gayab hui website</h4><p>Ek chhoti company naye ISP par gayi jiska public block 203.0.113.0/29 tha. Staff browse kar pa raha tha lekin customer portal unreachable tha. Portal VIP mein purana public address bacha tha. Engineer ne ek VIP object mein <code>extip</code> edit kiya, aur VIP use karne wali har policy dobara match karne lagi.</p><p><b>Lesson:</b> VIPs objects hain. Object ek baar edit karo aur policies follow karti hain.</p></div>

<div class="iv"><p class="q">"FortiGate par source NAT aur virtual IP mein kya difference hai?"</p><p>Source NAT outbound traffic ka source address (aur port) rewrite karta hai aur policy mein <code>nat enable</code> se on hota hai, optionally IP pool ke saath. VIP destination NAT object hai jo public address aur port ko private server se map karta hai; woh inbound policy mein destination ke roop mein use hota hai. Batao ki policy ko phir bhi traffic accept karna padta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Source NAT policy mein on hota hai; default source egress interface ka address hota hai.</li>
<li>VIP destination NAT (server publish karne) ka object hai aur policy destination ke roop mein use hota hai.</li>
<li>NAT unhi traffic ke addresses rewrite karta hai jo policy accept kar chuki hai; policy ki jagah nahi leta.</li>
<li>Session table translation ko SOURCE-NAT aur DESTINATION-NAT mein dikhata hai.</li>
<li>Central NAT alternative design hai jahan NAT apni tables mein rehta hai.</li>
</ul></div>
`}};export{e as default};