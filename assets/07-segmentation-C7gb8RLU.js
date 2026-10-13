var e={id:`segmentation`,h:{en:`Segmentation with VPNs: building a guest segment (lab 3)`,hi:`VPNs se segmentation: guest segment banana (lab 3)`},body:{en:`
<p>A hotel, a hospital or a retailer carries traffic of very different trust levels over the same routers: staff systems, guest Wi-Fi, payment terminals, cameras. Putting all of it in one routing table and then filtering with access lists is fragile. SD-WAN solves this with <b>segmentation</b>: separate routing domains that stay separate across the whole overlay. This chapter explains the VPN types, how routes and labels keep segments apart, and walks through the third lab step by step.</p>

<h3>VPN means segment</h3>
<p>In Catalyst SD-WAN a <b>VPN</b> is a separate routing domain that exists end to end, in every edge that has it. It is not an encrypted tunnel; the encryption is done by IPsec between edges. On IOS XE edges each VPN is a VRF. Three kinds exist:</p>
<table class="cmp"><tr><th>VPN</th><th>Purpose</th><th>IOS XE form</th></tr>
<tr><td>0</td><td>Transport: WAN interfaces, TLOCs, control connections, underlay routes</td><td>Global routing table</td></tr>
<tr><td>512</td><td>Out-of-band management</td><td>VRF <code>Mgmt-intf</code></td></tr>
<tr><td>1 to 511 and 513 to 65527</td><td>Service VPNs: users, servers, guest, IoT, payment and so on</td><td><code>vrf definition N</code> and <code>vrf forwarding N</code> on the interface</td></tr></table>
<p>Each service VPN has its own OMP routes (carried with a VPN <b>label</b>), its own routing table on every edge, and its traffic is marked with that label inside the IPsec tunnel. The receiving edge uses the label to put the packet into the right VRF. A host in VPN 20 has no route to VPN 10 unless a policy deliberately leaks routes between them (for example with a control policy or through a firewall). Only edges that have a VPN configured receive routes for it.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Two VPNs across the overlay">
<rect x="20" y="30" width="170" height="170" rx="12" fill="#bbf7d0"/><text x="105" y="52" text-anchor="middle" class="svg-ink" font-size="13">E-PNQ-1 (Pune)</text>
<rect x="35" y="66" width="140" height="50" rx="8" fill="#bae6fd"/><text x="105" y="88" text-anchor="middle" class="svg-ink" font-size="12">VPN 10 corporate</text><text x="105" y="104" text-anchor="middle" class="svg-muted" font-size="11">10.1.10.0/24</text>
<rect x="35" y="130" width="140" height="50" rx="8" fill="#fde68a"/><text x="105" y="152" text-anchor="middle" class="svg-ink" font-size="12">VPN 20 guest</text><text x="105" y="168" text-anchor="middle" class="svg-muted" font-size="11">10.1.20.0/24</text>
<rect x="450" y="30" width="170" height="170" rx="12" fill="#bbf7d0"/><text x="535" y="52" text-anchor="middle" class="svg-ink" font-size="13">E-GOI-1 (Goa)</text>
<rect x="465" y="66" width="140" height="50" rx="8" fill="#bae6fd"/><text x="535" y="88" text-anchor="middle" class="svg-ink" font-size="12">VPN 10 corporate</text><text x="535" y="104" text-anchor="middle" class="svg-muted" font-size="11">10.2.10.0/24</text>
<rect x="465" y="130" width="140" height="50" rx="8" fill="#fde68a"/><text x="535" y="152" text-anchor="middle" class="svg-ink" font-size="12">VPN 20 guest</text><text x="535" y="168" text-anchor="middle" class="svg-muted" font-size="11">10.2.20.0/24</text>
<line x1="175" y1="91" x2="465" y2="91" stroke="#0ea5e9" stroke-width="3"/><line x1="175" y1="155" x2="465" y2="155" stroke="#eab308" stroke-width="3"/>
<line x1="175" y1="100" x2="465" y2="146" stroke="#ef4444" stroke-width="2" stroke-dasharray="5 4"/>
<text x="320" y="80" text-anchor="middle" class="svg-muted" font-size="11">label for VPN 10</text><text x="320" y="176" text-anchor="middle" class="svg-muted" font-size="11">label for VPN 20</text>
<text x="320" y="230" text-anchor="middle" class="svg-ink" font-size="12">One IPsec tunnel carries both VPNs; labels keep them apart. Red dashed: no route between VPNs.</text>
</svg><p class="cap">Two segments across the same pair of edges. Guest hosts have no route to corporate prefixes.</p></div>

<h3>Lab 3: guest Wi-Fi for Sahyadri Hotels</h3>
<p>Sahyadri Hotels runs its corporate systems in VPN 10 at Pune (E-PNQ-1, 10.1.10.0/24) and Goa (E-GOI-1, 10.2.10.0/24). Guest Wi-Fi has to travel over the same edges in its own segment: <b>VPN 20 on GigabitEthernet4</b> (Pune 10.1.20.1/24, Goa 10.2.20.1/24). Guests at both hotels may reach each other's guest portal, but must never reach anything in VPN 10.</p>
<p>Three things are needed on each edge: the VRF, the interface in the VRF, and permission for OMP to advertise that VRF's connected network.</p>
<pre class="code"><span class="c">! E-PNQ-1 (repeat on E-GOI-1 with 10.2.20.1)</span>
config-transaction
vrf definition 20
 address-family ipv4
 exit-address-family
 exit
interface GigabitEthernet4
 description GUEST-WIFI
 vrf forwarding 20
 ip address 10.1.20.1 255.255.255.0
 no shutdown
 exit
sdwan
 omp
  address-family ipv4 vrf 20
   advertise connected
   exit
  exit
 exit
commit
end</pre>
<p>Order matters: define the VRF before putting the interface in it (<code>vrf forwarding</code> removes any existing IP address from the interface, so re-enter the address after it). Production templates generate extra lines for a VRF, such as a route distinguisher; the lab accepts the short form shown here. <code>advertise connected</code> is what makes OMP carry 10.1.20.0/24 into the overlay. Without it the guest prefix is local only.</p>

<h3>Verify, step by step</h3>
<p><b>1. The Controller holds both guest prefixes in VPN 20.</b></p>
<pre class="code">VSMART# show omp routes vpn 20
                               PATH              ATTRIBUTE
VPN    PREFIX        FROM PEER    ID   LABEL    STATUS TYPE      TLOC IP     COLOR        ENCAP PREFERENCE
-----------------------------------------------------------------------------------------------------------
20     10.1.20.0/24  10.255.0.21  66   1004     C,R    installed 10.255.0.21 biz-internet ipsec -
20     10.2.20.0/24  10.255.0.22  66   1004     C,R    installed 10.255.0.22 biz-internet ipsec -</pre>
<p><b>2. The edge installs the remote guest prefix in VRF 20.</b></p>
<pre class="code">E-PNQ-1# show ip route vrf 20 | begin Gateway
      10.0.0.0/8 is variably subnetted, 3 subnets, 2 masks
C        10.1.20.0/24 is directly connected, GigabitEthernet4
L        10.1.20.1/32 is directly connected, GigabitEthernet4
<span class="hl">m        10.2.20.0/24 [251/0] via 10.255.0.22, 00:00:41, Sdwan-system-intf</span></pre>
<p><b>3. Guests reach guests, and nothing else.</b> From GST-PNQ, <code>ping 10.2.20.10</code> succeeds. <code>ping 10.2.10.10</code> (the Goa corporate host) fails, and the VRF 20 table above contains no 10.2.10.0/24 or any other VPN 10 prefix. VPN 10 itself is unchanged: CORP-PNQ still reaches 10.2.10.10. No access list was needed: the guest VRF simply has no route.</p>

<div class="eg"><p><b>Worked example.</b> Count the routes. Pune's VRF 20 has two connected entries (the network and the local address) and one OMP route to Goa, three lines. VRF 10 at Pune is separate and holds the corporate prefixes. If a third hotel, Nashik, adds VPN 20, Pune and Goa learn its guest prefix automatically; if Nashik only has VPN 10, its guest hosts do not exist and Pune never receives anything for VPN 20 from it.</p></div>

<h3>Segmentation design tips</h3>
<ul>
<li>Use the same VPN numbering at every site (VPN 10 corporate everywhere). The same number joins the pieces into one segment.</li>
<li>Keep VPN 0 free of user traffic; keep VPN 512 for management only.</li>
<li>When two segments must talk (for example guests reaching a public portal in a DMZ), do it on purpose with a control policy that leaks routes, or send the traffic through a firewall, and document it.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Forgetting <code>commit</code>; forgetting <code>advertise connected</code> in the VRF (the prefix never reaches the Controller); typing the IP address before <code>vrf forwarding</code> so it is wiped; creating VPN 20 on one site only and expecting the other to learn it; thinking an ACL is needed to isolate VPNs.</p></div>

<div class="exam"><p><b>Exam traps.</b> VPN 0 is transport (global table on cEdge), VPN 512 is management (<code>Mgmt-intf</code>), service VPNs are everything else. A service VPN is a segment, not an encrypted tunnel. Routes of a VPN reach only edges that have that VPN. Each VPN has its own label inside the IPsec tunnel.</p></div>

<div class="scn"><h4>Guests that could see the finance printer</h4><p>A hotel launched guest Wi-Fi by copying the staff LAN interface configuration, which put guests in VPN 10. Security noticed that a guest laptop could reach the finance printer. The fix was to create VPN 20 on the router, move the guest interface into it and advertise it in OMP. After the change the guest VRF had no route to any corporate prefix, and a penetration tester's scan from the guest network found nothing in VPN 10.</p><p><b>Lesson:</b> isolation comes from separate routing tables, not from remembering to write the right access list.</p></div>

<div class="iv"><p class="q">"How does SD-WAN keep two segments separate across the WAN?"</p><p>Strong answer: each segment is a VPN (a VRF on IOS XE) with its own routing table on every edge; OMP carries routes per VPN with a label, and the label inside the IPsec tunnel tells the receiving edge which VRF to use. Prefixes of a VPN are advertised only to edges that have it. Between VPNs there is no route unless you configure leaking by policy or via a firewall.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A VPN is a routing segment (a VRF on IOS XE); VPN 0 transport, VPN 512 management, others service VPNs.</li>
<li>OMP routes carry a VPN label; one IPsec tunnel carries many segments.</li>
<li>To add a segment: vrf definition, vrf forwarding on the interface, advertise connected under sdwan omp, commit.</li>
<li>Verify with show omp routes vpn on the Controller and show ip route vrf on the edge.</li>
<li>Isolation needs no ACL; the segment simply has no route to the other.</li>
</ul></div>
`,hi:`
<p>Hotel, hospital ya retailer bahut alag trust levels ka traffic same routers par le jaate hain: staff systems, guest Wi-Fi, payment terminals, cameras. Sab kuch ek routing table mein rakhkar access lists se filter karna fragile hai. SD-WAN iska hal <b>segmentation</b> se karta hai: alag routing domains jo poore overlay mein alag rehte hain. Yeh chapter VPN types, routes aur labels segments ko kaise alag rakhte hain, aur teesre lab ko step by step samjhata hai.</p>

<h3>VPN ka matlab segment</h3>
<p>Catalyst SD-WAN mein <b>VPN</b> ek alag routing domain hai jo end to end har us edge mein rehta hai jisme woh ho. Yeh encrypted tunnel nahi hai; encryption edges ke beech IPsec karta hai. IOS XE edges par har VPN ek VRF hai. Teen kism ke hote hain:</p>
<table class="cmp"><tr><th>VPN</th><th>Kaam</th><th>IOS XE form</th></tr>
<tr><td>0</td><td>Transport: WAN interfaces, TLOCs, control connections, underlay routes</td><td>Global routing table</td></tr>
<tr><td>512</td><td>Out-of-band management</td><td>VRF <code>Mgmt-intf</code></td></tr>
<tr><td>1 se 511 aur 513 se 65527</td><td>Service VPNs: users, servers, guest, IoT, payment aur aise</td><td><code>vrf definition N</code> aur interface par <code>vrf forwarding N</code></td></tr></table>
<p>Har service VPN ke apne OMP routes hote hain (VPN <b>label</b> ke saath), har edge par apni routing table, aur uska traffic IPsec tunnel ke andar us label se mark hota hai. Receiving edge label se packet ko sahi VRF mein daalta hai. VPN 20 ke host ke paas VPN 10 ka route nahi hota jab tak koi policy jaanbujhkar routes leak na kare (jaise control policy se ya firewall ke through). Kisi VPN ke routes sirf un edges ko milte hain jinme woh VPN configured ho.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Overlay mein do VPNs">
<rect x="20" y="30" width="170" height="170" rx="12" fill="#bbf7d0"/><text x="105" y="52" text-anchor="middle" class="svg-ink" font-size="13">E-PNQ-1 (Pune)</text>
<rect x="35" y="66" width="140" height="50" rx="8" fill="#bae6fd"/><text x="105" y="88" text-anchor="middle" class="svg-ink" font-size="12">VPN 10 corporate</text><text x="105" y="104" text-anchor="middle" class="svg-muted" font-size="11">10.1.10.0/24</text>
<rect x="35" y="130" width="140" height="50" rx="8" fill="#fde68a"/><text x="105" y="152" text-anchor="middle" class="svg-ink" font-size="12">VPN 20 guest</text><text x="105" y="168" text-anchor="middle" class="svg-muted" font-size="11">10.1.20.0/24</text>
<rect x="450" y="30" width="170" height="170" rx="12" fill="#bbf7d0"/><text x="535" y="52" text-anchor="middle" class="svg-ink" font-size="13">E-GOI-1 (Goa)</text>
<rect x="465" y="66" width="140" height="50" rx="8" fill="#bae6fd"/><text x="535" y="88" text-anchor="middle" class="svg-ink" font-size="12">VPN 10 corporate</text><text x="535" y="104" text-anchor="middle" class="svg-muted" font-size="11">10.2.10.0/24</text>
<rect x="465" y="130" width="140" height="50" rx="8" fill="#fde68a"/><text x="535" y="152" text-anchor="middle" class="svg-ink" font-size="12">VPN 20 guest</text><text x="535" y="168" text-anchor="middle" class="svg-muted" font-size="11">10.2.20.0/24</text>
<line x1="175" y1="91" x2="465" y2="91" stroke="#0ea5e9" stroke-width="3"/><line x1="175" y1="155" x2="465" y2="155" stroke="#eab308" stroke-width="3"/>
<line x1="175" y1="100" x2="465" y2="146" stroke="#ef4444" stroke-width="2" stroke-dasharray="5 4"/>
<text x="320" y="80" text-anchor="middle" class="svg-muted" font-size="11">VPN 10 ka label</text><text x="320" y="176" text-anchor="middle" class="svg-muted" font-size="11">VPN 20 ka label</text>
<text x="320" y="230" text-anchor="middle" class="svg-ink" font-size="12">Ek IPsec tunnel dono VPNs carry karta hai; labels unhe alag rakhte hain. Red dashed: VPNs ke beech route nahi.</text>
</svg><p class="cap">Edges ki same pair par do segments. Guest hosts ke paas corporate prefixes ka route nahi.</p></div>

<h3>Lab 3: Sahyadri Hotels ke liye guest Wi-Fi</h3>
<p>Sahyadri Hotels Pune (E-PNQ-1, 10.1.10.0/24) aur Goa (E-GOI-1, 10.2.10.0/24) mein corporate systems VPN 10 mein chalata hai. Guest Wi-Fi ko usi edges par apne segment mein jaana hai: <b>GigabitEthernet4 par VPN 20</b> (Pune 10.1.20.1/24, Goa 10.2.20.1/24). Dono hotels ke guests ek doosre ka guest portal reach kar sakte hain, par VPN 10 mein kuch bhi kabhi reach nahi hona chahiye.</p>
<p>Har edge par teen cheezein chahiye: VRF, VRF mein interface, aur OMP ko us VRF ka connected network advertise karne ki permission.</p>
<pre class="code"><span class="c">! E-PNQ-1 (repeat on E-GOI-1 with 10.2.20.1)</span>
config-transaction
vrf definition 20
 address-family ipv4
 exit-address-family
 exit
interface GigabitEthernet4
 description GUEST-WIFI
 vrf forwarding 20
 ip address 10.1.20.1 255.255.255.0
 no shutdown
 exit
sdwan
 omp
  address-family ipv4 vrf 20
   advertise connected
   exit
  exit
 exit
commit
end</pre>
<p>Order matter karta hai: interface ko VRF mein daalne se pehle VRF define karo (<code>vrf forwarding</code> interface ka koi existing IP address hata deta hai, isliye uske baad address dobara daalo). Production templates VRF ke liye extra lines banate hain, jaise route distinguisher; lab yahan dikhayi chhoti form accept karta hai. <code>advertise connected</code> hi OMP ko 10.1.20.0/24 overlay mein le jaane deta hai. Iske bina guest prefix sirf local rehta hai.</p>

<h3>Step by step verify karo</h3>
<p><b>1. Controller ke paas VPN 20 mein dono guest prefixes hain.</b></p>
<pre class="code">VSMART# show omp routes vpn 20
                               PATH              ATTRIBUTE
VPN    PREFIX        FROM PEER    ID   LABEL    STATUS TYPE      TLOC IP     COLOR        ENCAP PREFERENCE
-----------------------------------------------------------------------------------------------------------
20     10.1.20.0/24  10.255.0.21  66   1004     C,R    installed 10.255.0.21 biz-internet ipsec -
20     10.2.20.0/24  10.255.0.22  66   1004     C,R    installed 10.255.0.22 biz-internet ipsec -</pre>
<p><b>2. Edge VRF 20 mein remote guest prefix install karta hai.</b></p>
<pre class="code">E-PNQ-1# show ip route vrf 20 | begin Gateway
      10.0.0.0/8 is variably subnetted, 3 subnets, 2 masks
C        10.1.20.0/24 is directly connected, GigabitEthernet4
L        10.1.20.1/32 is directly connected, GigabitEthernet4
<span class="hl">m        10.2.20.0/24 [251/0] via 10.255.0.22, 00:00:41, Sdwan-system-intf</span></pre>
<p><b>3. Guests guests tak pahunchte hain, aur kuch nahi.</b> GST-PNQ se <code>ping 10.2.20.10</code> succeed hota hai. <code>ping 10.2.10.10</code> (Goa corporate host) fail hota hai, aur upar ki VRF 20 table mein 10.2.10.0/24 ya koi aur VPN 10 prefix nahi hai. VPN 10 khud unchanged hai: CORP-PNQ ab bhi 10.2.10.10 tak pahunchta hai. Koi access list nahi chahiye thi: guest VRF mein bas route hi nahi hai.</p>

<div class="eg"><p><b>Worked example.</b> Routes gino. Pune ke VRF 20 mein do connected entries (network aur local address) aur Goa tak ek OMP route hai, teen lines. Pune ka VRF 10 alag hai aur corporate prefixes rakhta hai. Agar teesra hotel, Nashik, VPN 20 jodta hai, to Pune aur Goa uska guest prefix apne aap seekh lete hain; agar Nashik ke paas sirf VPN 10 hai, to uske guest hosts hain hi nahi aur Pune ko usse VPN 20 ka kuch nahi milta.</p></div>

<h3>Segmentation design tips</h3>
<ul>
<li>Har site par same VPN numbering rakho (VPN 10 corporate har jagah). Wahi same number tukdon ko ek segment mein jodta hai.</li>
<li>VPN 0 ko user traffic se free rakho; VPN 512 sirf management ke liye.</li>
<li>Jab do segments ko baat karni ho (jaise guests DMZ ke public portal tak), woh jaanbujhkar karo, routes leak karne wali control policy se, ya traffic firewall ke through bhejkar, aur document karo.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> <code>commit</code> bhool jaana; VRF mein <code>advertise connected</code> bhool jaana (prefix Controller tak kabhi nahi pahunchta); <code>vrf forwarding</code> se pehle IP address type karna jisse woh wipe ho jaata hai; VPN 20 sirf ek site par banakar doosri site se seekhne ki ummeed karna; yeh sochna ki VPNs isolate karne ke liye ACL chahiye.</p></div>

<div class="exam"><p><b>Exam traps.</b> VPN 0 transport hai (cEdge par global table), VPN 512 management hai (<code>Mgmt-intf</code>), service VPNs baaki sab. Service VPN ek segment hai, encrypted tunnel nahi. Kisi VPN ke routes sirf un edges tak pahunchte hain jinme woh VPN ho. Har VPN ka IPsec tunnel ke andar apna label hota hai.</p></div>

<div class="scn"><h4>Guests jo finance printer dekh sakte the</h4><p>Ek hotel ne guest Wi-Fi staff LAN interface ki configuration copy karke launch kiya, jisse guests VPN 10 mein aa gaye. Security ne dekha ki ek guest laptop finance printer tak pahunch sakta tha. Fix router par VPN 20 banana, guest interface ko usme daalna aur OMP mein advertise karna tha. Change ke baad guest VRF mein kisi corporate prefix ka route nahi tha, aur penetration tester ke guest network se scan ko VPN 10 mein kuch nahi mila.</p><p><b>Seekh:</b> isolation alag routing tables se aata hai, sahi access list likhna yaad rakhne se nahi.</p></div>

<div class="iv"><p class="q">"SD-WAN WAN ke across do segments ko alag kaise rakhta hai?"</p><p>Strong answer: har segment ek VPN hai (IOS XE par VRF) jiski har edge par apni routing table hoti hai; OMP routes ko per VPN label ke saath le jaata hai, aur IPsec tunnel ke andar ka label receiving edge ko batata hai ki kaunsa VRF use karna hai. Kisi VPN ke prefixes sirf un edges ko advertise hote hain jinme woh ho. VPNs ke beech route nahi hota jab tak aap policy se ya firewall ke through leaking configure na karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VPN routing segment hai (IOS XE par VRF); VPN 0 transport, VPN 512 management, baaki service VPNs.</li>
<li>OMP routes VPN label carry karte hain; ek IPsec tunnel kai segments le jaata hai.</li>
<li>Segment jodne ke liye: vrf definition, interface par vrf forwarding, sdwan omp ke neeche advertise connected, commit.</li>
<li>Controller par show omp routes vpn aur edge par show ip route vrf se verify karo.</li>
<li>Isolation ke liye ACL nahi chahiye; segment ke paas doosre ka route hi nahi hota.</li>
</ul></div>
`}};export{e as default};