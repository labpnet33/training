var e={id:`segmentation-acl`,h:{en:`Segmentation with VPNs and per-VPN access lists`,hi:`VPNs se segmentation aur per-VPN access lists`},body:{en:`
<p>Encryption protects traffic in transit, but it does not stop a guest laptop from talking to a finance server once both are inside the same network. <b>Segmentation</b> divides the network into isolated parts so that a problem in one part cannot spread. Catalyst SD-WAN does this end to end with VPNs, which on a WAN Edge are VRFs.</p>

<h3>Analogy: floors of an office building</h3>
<p>A building has a ground floor for visitors, a floor for staff and a locked floor for finance. Each floor has its own corridors, and the lift only stops at a floor if you hold the right card. A visitor cannot wander into finance even though they are in the same building. In SD-WAN a <b>VPN</b> is a floor, the overlay is the shared lift, and policy decides who gets which card.</p>

<h3>VPN roles and numbers</h3>
<table class="cmp"><tr><th>VPN</th><th>Role</th><th>Notes</th></tr>
<tr><td><b>VPN 0</b></td><td>Transport (underlay)</td><td>Holds the transport interfaces and control connections; never used for user traffic by design</td></tr>
<tr><td><b>VPN 512</b></td><td>Out-of-band management</td><td>Separate from user traffic; use for the management port</td></tr>
<tr><td><b>Service VPNs</b> (1 to 65530 except 512)</td><td>User segments</td><td>Each has its own routing table, for example VPN 10 staff, VPN 20 guests, VPN 30 payment systems</td></tr></table>

<h3>How segmentation crosses the overlay</h3>
<p>Each service VPN on a WAN Edge is an independent VRF with its own routes. When the edge advertises a VPN's prefixes in OMP, it includes a <b>VPN label</b>. The Controller sends the routes to the other edges, and each edge only installs routes for VPNs it has configured. Packets travel through IPsec with that label inside, so the receiving edge delivers them to the right VRF. The result is end-to-end isolation using one set of tunnels: two VPNs never mix unless you explicitly connect them.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="VPN segmentation across the overlay">
<rect x="10" y="40" width="140" height="150" rx="10" fill="#bae6fd"/><text x="80" y="62" text-anchor="middle" class="svg-ink" font-size="13">E-BR1 Pune</text>
<rect x="25" y="75" width="110" height="28" rx="6" fill="#bbf7d0"/><text x="80" y="94" text-anchor="middle" class="svg-ink" font-size="12">VPN 10 staff</text>
<rect x="25" y="110" width="110" height="28" rx="6" fill="#fde68a"/><text x="80" y="129" text-anchor="middle" class="svg-ink" font-size="12">VPN 20 guest</text>
<rect x="25" y="145" width="110" height="28" rx="6" fill="#fed7aa"/><text x="80" y="164" text-anchor="middle" class="svg-ink" font-size="12">VPN 30 payments</text>
<rect x="490" y="40" width="140" height="150" rx="10" fill="#bae6fd"/><text x="560" y="62" text-anchor="middle" class="svg-ink" font-size="13">E-DC Mumbai</text>
<rect x="505" y="75" width="110" height="28" rx="6" fill="#bbf7d0"/><text x="560" y="94" text-anchor="middle" class="svg-ink" font-size="12">VPN 10 staff</text>
<rect x="505" y="145" width="110" height="28" rx="6" fill="#fed7aa"/><text x="560" y="164" text-anchor="middle" class="svg-ink" font-size="12">VPN 30 payments</text>
<line x1="135" y1="89" x2="505" y2="89" stroke="#16a34a" stroke-width="3"/><line x1="135" y1="159" x2="505" y2="159" stroke="#ea580c" stroke-width="3"/>
<text x="320" y="125" text-anchor="middle" class="svg-muted" font-size="12">VPN 20 guest has no peer at E-DC: it stays local</text>
<text x="320" y="215" text-anchor="middle" class="svg-accent" font-size="12">One IPsec tunnel set, separate VPN labels inside</text>
</svg><p class="cap">Each VPN only exists where you configure it. Guests never reach the DC because VPN 20 is not there.</p></div>

<h3>Controlling reachability between VPNs</h3>
<ul>
<li><b>No connection by default.</b> Different service VPNs do not share routes. This is the safest state.</li>
<li><b>Controlled leaking.</b> When two segments must talk (for example staff reaching a shared print service), connect them explicitly, either with route leaking on a hub or with a centralized control policy that exchanges only chosen prefixes. Keep the list small and review it.</li>
<li><b>Through a firewall.</b> The best pattern for sensitive segments is a hub where inter-VPN traffic passes through an inspecting device, such as DC-FW at E-DC, so that rules and logs apply.</li>
<li><b>Topology control.</b> A control policy can limit which sites see a VPN (for example payment-system routes only between branches and the data center), reducing the paths an intruder could use.</li>
</ul>

<h3>Per-VPN access lists</h3>
<p>Segmentation decides who is on which floor; an <b>access list (ACL)</b> then filters inside and across floors. A localized policy defines IPv4 or IPv6 ACLs with match conditions (source, destination, protocol, ports, DSCP) and actions (accept, drop, count, log). You apply an ACL to a service-side interface, in the input or output direction, in the VPN where that interface lives. Because the interface belongs to a VPN, the ACL is effectively per-VPN.</p>
<pre class="code">ip access-list extended GUEST-IN
 10 deny   ip 10.1.20.0 0.0.0.255 10.0.0.0 0.255.255.255
 20 permit ip 10.1.20.0 0.0.0.255 any
interface GigabitEthernet4
 vrf forwarding 20
 ip address 10.1.20.1 255.255.255.0
 ip access-group GUEST-IN in</pre>
<p>This example denies guests access to every 10.x.x.x destination, which includes the company's private ranges, and then permits internet access. Order matters: the first matching line wins, and a final implicit deny applies. Always add <code>log</code> or counters to important denies so you can prove they work.</p>
<p>Protect the router itself too. On the transport interface, <code>allow-service</code> opens only the services you list; keep it to what the device needs and do not expose management services to the internet. The management VPN 512 interface should be reachable only from a management network.</p>

<div class="eg"><p><b>Worked example.</b> Bharat Retail defines VPN 10 (staff), VPN 20 (guest) and VPN 30 (payments). VPN 20 is configured only at branches, so it has no route to the DC. VPN 30 exists at branches and E-DC, and an ACL on the branch payment interface permits only the POS terminals' subnet. The security team can show an auditor that a guest packet has no route to payments and that the ACL counters show denied attempts.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Putting user interfaces in VPN 0. (2) Reusing one VPN for guests and staff and relying only on ACLs. (3) Leaking whole default routes between VPNs. (4) ACLs without logging or counters, so you cannot tell if they work. (5) Applying an ACL on the wrong interface or wrong direction.</p></div>

<div class="exam"><p><b>Exam trap.</b> VPN 0 is the transport VPN and VPN 512 is management; service VPNs carry user traffic. Segmentation is end to end because the VPN label travels in OMP and the data plane. ACLs are localized policy (on the device); centralized data policy is different.</p></div>

<div class="scn"><h4>Guest laptop can ping a branch printer</h4><p>An auditor shows that a guest laptop reaches the staff printer in Pune. The cause is that the printer's switch port was put in VPN 20 during a rush. The fix: move the printer to VPN 10, and add an ACL on VPN 20 with logging as a second layer.</p><p><b>Lesson:</b> segmentation works only when interfaces are in the right VPN.</p></div>

<div class="iv"><p class="q">"How does Catalyst SD-WAN segment traffic end to end?"</p><p>Each service VPN is a VRF on the WAN Edge. OMP advertises routes per VPN with a VPN label, and edges install routes only for VPNs they have. IPsec carries that label so the far edge delivers to the right VRF. VPN 0 is transport and VPN 512 is management. Cross-VPN access is only by explicit leaking or policy, preferably through a firewall, and ACLs from localized policy add per-interface filtering.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VPN = VRF; VPN 0 transport, VPN 512 management, service VPNs for users.</li>
<li>The VPN label in OMP and the data plane gives end-to-end isolation.</li>
<li>Different VPNs share nothing unless you connect them; prefer a firewall in between.</li>
<li>ACLs filter on interfaces; the first match wins and an implicit deny ends the list.</li>
<li>Limit allow-service and keep management on its own network.</li>
</ul></div>
`,hi:`
<p>Encryption transit mein traffic ko protect karta hai, lekin jab guest laptop aur finance server dono ek hi network ke andar hon to yeh unhe aapas mein baat karne se nahi rokta. <b>Segmentation</b> network ko isolated hisson mein baant deta hai taaki ek hisse ki problem doosre tak na faile. Catalyst SD-WAN yeh end to end VPNs se karta hai, jo WAN Edge par VRFs hote hain.</p>

<h3>Analogy: office building ki floors</h3>
<p>Building mein visitors ke liye ground floor, staff ke liye ek floor aur finance ke liye locked floor hoti hai. Har floor ke apne corridors hain, aur lift tabhi rukti hai jab tumhare paas sahi card ho. Visitor ek hi building mein hokar bhi finance mein nahi ghus sakta. SD-WAN mein <b>VPN</b> ek floor hai, overlay shared lift hai, aur policy tay karti hai ki kisko kaunsa card mile.</p>

<h3>VPN roles aur numbers</h3>
<table class="cmp"><tr><th>VPN</th><th>Role</th><th>Notes</th></tr>
<tr><td><b>VPN 0</b></td><td>Transport (underlay)</td><td>Transport interfaces aur control connections rakhta hai; design se user traffic ke liye kabhi nahi</td></tr>
<tr><td><b>VPN 512</b></td><td>Out-of-band management</td><td>User traffic se alag; management port ke liye use karo</td></tr>
<tr><td><b>Service VPNs</b> (1 se 65530, 512 ko chhodkar)</td><td>User segments</td><td>Har ki apni routing table, jaise VPN 10 staff, VPN 20 guests, VPN 30 payment systems</td></tr></table>

<h3>Segmentation overlay ke par kaise jaata hai</h3>
<p>WAN Edge par har service VPN apne routes wala independent VRF hai. Jab edge kisi VPN ke prefixes OMP mein advertise karta hai to woh ek <b>VPN label</b> bhi daalta hai. Controller routes doosre edges ko bhejta hai, aur har edge sirf unhi VPNs ke routes install karta hai jo usne configure kiye hain. Packets us label ke saath IPsec ke andar jaate hain, isliye receiving edge unhe sahi VRF mein deliver karta hai. Result tunnels ke ek hi set se end-to-end isolation hai: do VPNs tab tak nahi milte jab tak aap unhe explicitly na jodein.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Overlay par VPN segmentation">
<rect x="10" y="40" width="140" height="150" rx="10" fill="#bae6fd"/><text x="80" y="62" text-anchor="middle" class="svg-ink" font-size="13">E-BR1 Pune</text>
<rect x="25" y="75" width="110" height="28" rx="6" fill="#bbf7d0"/><text x="80" y="94" text-anchor="middle" class="svg-ink" font-size="12">VPN 10 staff</text>
<rect x="25" y="110" width="110" height="28" rx="6" fill="#fde68a"/><text x="80" y="129" text-anchor="middle" class="svg-ink" font-size="12">VPN 20 guest</text>
<rect x="25" y="145" width="110" height="28" rx="6" fill="#fed7aa"/><text x="80" y="164" text-anchor="middle" class="svg-ink" font-size="12">VPN 30 payments</text>
<rect x="490" y="40" width="140" height="150" rx="10" fill="#bae6fd"/><text x="560" y="62" text-anchor="middle" class="svg-ink" font-size="13">E-DC Mumbai</text>
<rect x="505" y="75" width="110" height="28" rx="6" fill="#bbf7d0"/><text x="560" y="94" text-anchor="middle" class="svg-ink" font-size="12">VPN 10 staff</text>
<rect x="505" y="145" width="110" height="28" rx="6" fill="#fed7aa"/><text x="560" y="164" text-anchor="middle" class="svg-ink" font-size="12">VPN 30 payments</text>
<line x1="135" y1="89" x2="505" y2="89" stroke="#16a34a" stroke-width="3"/><line x1="135" y1="159" x2="505" y2="159" stroke="#ea580c" stroke-width="3"/>
<text x="320" y="125" text-anchor="middle" class="svg-muted" font-size="12">VPN 20 guest ka E-DC par peer nahi: woh local rehta hai</text>
<text x="320" y="215" text-anchor="middle" class="svg-accent" font-size="12">IPsec tunnels ka ek set, andar alag VPN labels</text>
</svg><p class="cap">Har VPN sirf wahin hota hai jahan aap configure karo. Guests DC tak kabhi nahi pahunchte kyunki VPN 20 wahan hai hi nahi.</p></div>

<h3>VPNs ke beech reachability control karna</h3>
<ul>
<li><b>Default mein koi connection nahi.</b> Alag service VPNs routes share nahi karte. Yeh sabse safe state hai.</li>
<li><b>Controlled leaking.</b> Jab do segments ko baat karni ho (jaise staff ko shared print service tak), unhe explicitly jodo, ya to hub par route leaking se ya aisi centralized control policy se jo sirf chune hue prefixes exchange kare. List chhoti rakho aur review karo.</li>
<li><b>Firewall ke through.</b> Sensitive segments ke liye best pattern aisa hub hai jahan inter-VPN traffic inspecting device se guzarta hai, jaise E-DC par DC-FW, taaki rules aur logs lagu hon.</li>
<li><b>Topology control.</b> Control policy limit kar sakti hai ki kaunsi sites VPN dekhti hain (jaise payment-system routes sirf branches aur data center ke beech), jisse intruder ke paas use karne ke raaste kam hote hain.</li>
</ul>

<h3>Per-VPN access lists</h3>
<p>Segmentation tay karta hai ki kaun kaunsi floor par hai; <b>access list (ACL)</b> phir floors ke andar aur beech filter karti hai. Localized policy IPv4 ya IPv6 ACLs define karti hai, match conditions (source, destination, protocol, ports, DSCP) aur actions (accept, drop, count, log) ke saath. ACL ko service-side interface par, input ya output direction mein, us VPN mein lagate ho jisme woh interface hai. Interface VPN ka hota hai, isliye ACL asal mein per-VPN hoti hai.</p>
<pre class="code">ip access-list extended GUEST-IN
 10 deny   ip 10.1.20.0 0.0.0.255 10.0.0.0 0.255.255.255
 20 permit ip 10.1.20.0 0.0.0.255 any
interface GigabitEthernet4
 vrf forwarding 20
 ip address 10.1.20.1 255.255.255.0
 ip access-group GUEST-IN in</pre>
<p>Yeh example guests ko har 10.x.x.x destination se rokta hai, jisme company ki private ranges shamil hain, aur phir internet access permit karta hai. Order matter karta hai: pehli matching line jeetti hai, aur aakhir mein implicit deny lagta hai. Important denies mein hamesha <code>log</code> ya counters jodo taaki saabit kar sako ki woh kaam kar rahe hain.</p>
<p>Router ko khud bhi protect karo. Transport interface par <code>allow-service</code> sirf wahi services kholta hai jo aap list karte ho; use device ki zaroorat tak rakho aur management services ko internet par expose mat karo. Management VPN 512 interface sirf management network se reachable hona chahiye.</p>

<div class="eg"><p><b>Worked example.</b> Bharat Retail VPN 10 (staff), VPN 20 (guest) aur VPN 30 (payments) define karta hai. VPN 20 sirf branches par configured hai, isliye DC tak uska route nahi. VPN 30 branches aur E-DC par hai, aur branch payment interface par ACL sirf POS terminals ka subnet permit karti hai. Security team auditor ko dikha sakti hai ki guest packet ka payments tak koi route nahi aur ACL counters denied attempts dikhate hain.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) User interfaces ko VPN 0 mein daalna. (2) Guests aur staff ke liye ek hi VPN rakhkar sirf ACLs par bharosa karna. (3) VPNs ke beech poore default routes leak karna. (4) Logging ya counters ke bina ACLs, jisse pata nahi chalta woh kaam karti hain ya nahi. (5) ACL galat interface ya galat direction par lagana.</p></div>

<div class="exam"><p><b>Exam trap.</b> VPN 0 transport VPN hai aur VPN 512 management; service VPNs user traffic le jaate hain. Segmentation end to end hai kyunki VPN label OMP aur data plane mein jaata hai. ACLs localized policy hain (device par); centralized data policy alag cheez hai.</p></div>

<div class="scn"><h4>Guest laptop branch printer ko ping kar leta hai</h4><p>Auditor dikhata hai ki guest laptop Pune ke staff printer tak pahunch jaata hai. Wajah: jaldi mein printer ka switch port VPN 20 mein daal diya gaya tha. Fix: printer ko VPN 10 mein move karo, aur doosri layer ke roop mein VPN 20 par logging wali ACL lagao.</p><p><b>Lesson:</b> segmentation tabhi kaam karta hai jab interfaces sahi VPN mein hon.</p></div>

<div class="iv"><p class="q">"Catalyst SD-WAN traffic ko end to end segment kaise karta hai?"</p><p>Har service VPN WAN Edge par VRF hai. OMP routes ko per VPN, VPN label ke saath advertise karta hai, aur edges sirf apne VPNs ke routes install karte hain. IPsec woh label le jaata hai taaki door ka edge sahi VRF mein deliver kare. VPN 0 transport hai aur VPN 512 management. VPNs ke beech access sirf explicit leaking ya policy se, preferably firewall ke through, aur localized policy ki ACLs per-interface filtering jodti hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VPN = VRF; VPN 0 transport, VPN 512 management, service VPNs users ke liye.</li>
<li>OMP mein VPN label aur data plane end-to-end isolation dete hain.</li>
<li>Alag VPNs kuch share nahi karte jab tak aap na jodein; beech mein firewall behtar.</li>
<li>ACLs interfaces par filter karti hain; pehla match jeetta hai aur implicit deny list khatam karta hai.</li>
<li>allow-service seemit rakho aur management ko alag network par rakho.</li>
</ul></div>
`}};export{e as default};