var e={id:`trustsec-sgt`,h:{en:`TrustSec and Security Group Tags: policy that follows the role, not the IP`,hi:`TrustSec aur Security Group Tags: policy jo role ke saath chalti hai, IP ke saath nahi`},body:{en:`
<p>At a large conference every attendee gets a coloured wristband: blue for speakers, green for attendees, red for staff. Door guards do not memorise names or seat numbers; they check the colour. If a speaker changes seats, the rule "blue may enter the green room" still works. <b>Cisco TrustSec</b> does the same with a <b>Security Group Tag (SGT)</b>: a number that represents the role of the traffic source, carried with the traffic and checked near the destination.</p>

<h3>Why IP-based ACLs stop scaling</h3>
<p>With dACLs and VLANs, policy is still written in IP addresses. A rule like "employees may reach camera recorders but not cameras" becomes hundreds of ACL lines across subnets, sites and VPNs, and breaks whenever addressing changes. TrustSec separates <b>who</b> from <b>where</b>: employees get SGT 20, cameras SGT 40, and one matrix cell says what 20 may do to 40.</p>

<h3>The three TrustSec functions</h3>
<dl class="terms">
<dt>Classification</dt><dd>Assigning an SGT to traffic. <b>Dynamic</b>: ISE returns it in the Access-Accept after 802.1X, MAB or WebAuth (the lab's camera gets SGT 40). <b>Static</b>: IP-to-SGT, subnet-to-SGT, VLAN-to-SGT or port mappings for servers and devices that never authenticate.</dd>
<dt>Propagation</dt><dd>Getting the tag to where it is enforced. <b>Inline tagging</b> inserts a Cisco Meta Data (CMD) header with the SGT into each frame (Ethertype 0x8909) on capable links. <b>SXP</b> (SGT Exchange Protocol, TCP 64999) sends IP-to-SGT bindings from a speaker to a listener over the control plane, for hardware that cannot tag inline.</dd>
<dt>Enforcement</dt><dd>Applying the policy. <b>SGACLs</b> (security group ACLs) are enforced on the <b>egress</b> switch, the one closest to the destination, based on source SGT and destination SGT. Firewalls such as Secure Firewall Threat Defense and ASA can also use SGTs in their rules.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="TrustSec classify propagate enforce">
<rect x="20" y="70" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="80" y="92" text-anchor="middle" class="svg-ink" font-size="13">PC1 priya</text><text x="80" y="110" text-anchor="middle" class="svg-muted" font-size="12">SGT 20</text>
<rect x="190" y="70" width="120" height="50" rx="8" fill="#bae6fd"/><text x="250" y="92" text-anchor="middle" class="svg-ink" font-size="13">Access switch</text><text x="250" y="110" text-anchor="middle" class="svg-muted" font-size="12">classify</text>
<rect x="360" y="70" width="120" height="50" rx="8" fill="#bae6fd"/><text x="420" y="92" text-anchor="middle" class="svg-ink" font-size="13">Egress switch</text><text x="420" y="110" text-anchor="middle" class="svg-muted" font-size="12">enforce SGACL</text>
<rect x="520" y="70" width="110" height="50" rx="8" fill="#fde68a"/><text x="575" y="92" text-anchor="middle" class="svg-ink" font-size="13">CAM1</text><text x="575" y="110" text-anchor="middle" class="svg-muted" font-size="12">SGT 40</text>
<line x1="140" y1="95" x2="190" y2="95" stroke="#64748b" stroke-width="2"/><line x1="310" y1="95" x2="360" y2="95" stroke="#64748b" stroke-width="3"/><line x1="480" y1="95" x2="520" y2="95" stroke="#64748b" stroke-width="2"/>
<text x="335" y="60" text-anchor="middle" class="svg-accent" font-size="12">inline tag or SXP</text>
<rect x="190" y="160" width="290" height="44" rx="8" fill="#ddd6fe"/><text x="335" y="180" text-anchor="middle" class="svg-ink" font-size="13">ISE matrix: 20 to 40 = CAM_VIEW</text><text x="335" y="196" text-anchor="middle" class="svg-muted" font-size="12">downloaded to enforcing switches</text>
</svg><p class="cap">Classify at the edge, carry the tag, enforce near the destination with a policy that comes from the ISE matrix.</p></div>

<h3>The TrustSec matrix in ISE</h3>
<p>Under Work Centers &gt; TrustSec you create <b>security groups</b> (each with a number), <b>SGACLs</b> (ACLs without addresses, only protocols and ports) and the <b>egress policy matrix</b>: rows are source SGTs, columns are destination SGTs, each cell holds an SGACL. A default cell (often permit, sometimes deny for a zero-trust design) covers the rest. Network devices authenticate to ISE with TrustSec credentials and download the matrix cells they need. Reserved values: <b>0</b> = Unknown, <b>2</b> = TrustSec_Devices; ISE also ships a Quarantined_Systems group (255).</p>

<h3>Configuring the switch side (concept and lab commands)</h3>
<pre class="code"><span class="c">! enforcement on the egress switch</span>
cts role-based enforcement
cts role-based enforcement vlan-list 40
<span class="c">! a static mapping for a recorder that never authenticates</span>
cts role-based sgt-map 10.40.40.200 sgt 40
<span class="c">! a locally defined SGACL and a matrix cell (normally pushed by ISE)</span>
ip access-list role-based CAM_VIEW
 permit tcp dst eq 443
 permit tcp dst eq 554
 deny ip
cts role-based permissions from 20 to 40 CAM_VIEW</pre>

<pre class="out">ACC-SW1# show cts role-based sgt-map all
Active IPv4-SGT Bindings Information

IP Address              SGT     Source
============================================
10.20.20.10             20      LOCAL
<span class="hl">10.40.40.10             40      LOCAL</span>
10.40.40.200            40      CLI

ACC-SW1# show cts role-based permissions
IPv4 Role-based permissions default:
        Permit IP-00
<span class="hl">IPv4 Role-based permissions from group 20 to group 40:
        CAM_VIEW</span></pre>
<p>"LOCAL" bindings come from authentication sessions (the SGT that ISE returned); "CLI" are static. The camera's binding 10.40.40.10 to SGT 40 is the same tag you read in the lab with <code>show authentication sessions interface g0/2 details</code>.</p>

<div class="eg"><p><b>Worked example.</b> SGT 40 in hex is 0x28. In the RADIUS Access-Accept, ISE sends <code>cisco-av-pair = cts:security-group-tag=0028-00</code>. A PC with SGT 20 opens TCP 554 (RTSP) to a camera 10.40.40.10: the egress switch looks up source 20 and destination 40, finds CAM_VIEW, line 2 permits 554. The same PC tries TCP 23 (Telnet) to the camera: CAM_VIEW ends with deny ip, so it is dropped and <code>show cts role-based counters</code> increments the deny counter for 20 to 40.</p></div>

<div class="warn"><p><b>Common mistake.</b> Enforcing on the ingress switch and expecting it to know the destination's SGT. Enforcement happens where both tags are known, normally at egress. If the destination's binding is missing (no authentication, no static map, no SXP), its SGT is 0 (Unknown) and the default cell applies.</p></div>

<div class="exam"><p><b>Exam trap.</b> SXP uses TCP 64999 and carries IP-to-SGT bindings, not traffic. Inline tagging uses the CMD header, Ethertype 0x8909. SGACLs are enforced at egress. The SGT is 16 bits.</p></div>

<div class="scn"><h4>Contractors and the PCI servers</h4><p>A retailer needed contractors kept away from payment servers across 80 stores, with constantly changing IP plans. Instead of 80 sets of ACLs, ISE assigned SGT Contractors at authentication, payment servers were statically mapped to SGT PCI_Servers in the data center, SXP carried store bindings to the data center switches, and one matrix cell, Contractors to PCI_Servers = deny ip, was enforced at the data center egress. An audit later showed the counters rising when a contractor laptop scanned the network.</p><p><b>Lesson:</b> SGTs turn a site-by-site IP policy into one role-to-role rule.</p></div>

<div class="iv"><p class="q">"Explain TrustSec in three words and then in detail."</p><p>Strong answer: classify, propagate, enforce. Classification assigns an SGT dynamically from ISE after 802.1X or MAB, or statically for servers. Propagation carries it inline in the CMD header or via SXP on TCP 64999. Enforcement applies SGACLs from the ISE matrix at the egress device, or SGT-aware firewall rules. The benefit is policy by role, independent of IP addressing and topology.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>An SGT is a 16-bit role tag; ISE assigns it in the Access-Accept as cts:security-group-tag.</li>
<li>Classification can be dynamic (802.1X, MAB, WebAuth) or static (IP, subnet, VLAN, port).</li>
<li>Propagation: inline CMD tagging (Ethertype 0x8909) or SXP (TCP 64999).</li>
<li>Enforcement: SGACLs from the ISE matrix, applied at egress; firewalls can also match SGTs.</li>
<li>Unknown destination tag = SGT 0 and the default cell applies.</li>
</ul></div>
`,hi:`
<p>Ek bade conference mein har attendee ko ek rangeen wristband milta hai: speakers ke liye blue, attendees ke liye green, staff ke liye red. Door guards naam ya seat numbers yaad nahi rakhte; woh rang check karte hain. Agar speaker seat badle, to rule "blue green room mein jaa sakta hai" phir bhi chalta hai. <b>Cisco TrustSec</b> yahi <b>Security Group Tag (SGT)</b> se karta hai: ek number jo traffic source ka role darshata hai, traffic ke saath chalta hai aur destination ke paas check hota hai.</p>

<h3>IP-based ACLs scale karna kyun band karte hain</h3>
<p>dACLs aur VLANs ke saath policy abhi bhi IP addresses mein likhi jaati hai. "Employees camera recorders tak jaa sakte hain par cameras tak nahi" jaisa rule subnets, sites aur VPNs mein sainkdon ACL lines ban jaata hai, aur addressing badalte hi tootta hai. TrustSec <b>kaun</b> ko <b>kahan</b> se alag karta hai: employees ko SGT 20, cameras ko SGT 40, aur ek matrix cell batata hai ki 20, 40 ke saath kya kar sakta hai.</p>

<h3>TrustSec ke teen functions</h3>
<dl class="terms">
<dt>Classification</dt><dd>Traffic ko SGT dena. <b>Dynamic</b>: ISE ise 802.1X, MAB ya WebAuth ke baad Access-Accept mein lautata hai (lab ke camera ko SGT 40 milta hai). <b>Static</b>: un servers aur devices ke liye IP-to-SGT, subnet-to-SGT, VLAN-to-SGT ya port mappings jo kabhi authenticate nahi karte.</dd>
<dt>Propagation</dt><dd>Tag ko wahan tak pahunchana jahan enforce hota hai. <b>Inline tagging</b> capable links par har frame mein SGT ke saath Cisco Meta Data (CMD) header daalta hai (Ethertype 0x8909). <b>SXP</b> (SGT Exchange Protocol, TCP 64999) IP-to-SGT bindings ko control plane par speaker se listener tak bhejta hai, us hardware ke liye jo inline tag nahi kar sakta.</dd>
<dt>Enforcement</dt><dd>Policy apply karna. <b>SGACLs</b> (security group ACLs) <b>egress</b> switch par enforce hote hain, jo destination ke sabse paas hai, source SGT aur destination SGT ke basis par. Secure Firewall Threat Defense aur ASA jaise firewalls bhi apne rules mein SGTs use kar sakte hain.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="TrustSec classify propagate enforce">
<rect x="20" y="70" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="80" y="92" text-anchor="middle" class="svg-ink" font-size="13">PC1 priya</text><text x="80" y="110" text-anchor="middle" class="svg-muted" font-size="12">SGT 20</text>
<rect x="190" y="70" width="120" height="50" rx="8" fill="#bae6fd"/><text x="250" y="92" text-anchor="middle" class="svg-ink" font-size="13">Access switch</text><text x="250" y="110" text-anchor="middle" class="svg-muted" font-size="12">classify</text>
<rect x="360" y="70" width="120" height="50" rx="8" fill="#bae6fd"/><text x="420" y="92" text-anchor="middle" class="svg-ink" font-size="13">Egress switch</text><text x="420" y="110" text-anchor="middle" class="svg-muted" font-size="12">SGACL enforce</text>
<rect x="520" y="70" width="110" height="50" rx="8" fill="#fde68a"/><text x="575" y="92" text-anchor="middle" class="svg-ink" font-size="13">CAM1</text><text x="575" y="110" text-anchor="middle" class="svg-muted" font-size="12">SGT 40</text>
<line x1="140" y1="95" x2="190" y2="95" stroke="#64748b" stroke-width="2"/><line x1="310" y1="95" x2="360" y2="95" stroke="#64748b" stroke-width="3"/><line x1="480" y1="95" x2="520" y2="95" stroke="#64748b" stroke-width="2"/>
<text x="335" y="60" text-anchor="middle" class="svg-accent" font-size="12">inline tag ya SXP</text>
<rect x="190" y="160" width="290" height="44" rx="8" fill="#ddd6fe"/><text x="335" y="180" text-anchor="middle" class="svg-ink" font-size="13">ISE matrix: 20 se 40 = CAM_VIEW</text><text x="335" y="196" text-anchor="middle" class="svg-muted" font-size="12">enforce karne wale switches par download</text>
</svg><p class="cap">Edge par classify karo, tag saath le jaao, destination ke paas ISE matrix se aayi policy ke saath enforce karo.</p></div>

<h3>ISE mein TrustSec matrix</h3>
<p>Work Centers &gt; TrustSec ke neeche aap <b>security groups</b> (har ek ek number ke saath), <b>SGACLs</b> (bina addresses ke ACLs, sirf protocols aur ports) aur <b>egress policy matrix</b> banaate ho: rows source SGTs hain, columns destination SGTs, har cell mein ek SGACL. Ek default cell (aksar permit, zero-trust design mein kabhi deny) baaki sab cover karta hai. Network devices TrustSec credentials se ISE ke saath authenticate karte hain aur jo matrix cells chahiye woh download karte hain. Reserved values: <b>0</b> = Unknown, <b>2</b> = TrustSec_Devices; ISE ek Quarantined_Systems group (255) bhi deta hai.</p>

<h3>Switch side configure karna (concept aur lab commands)</h3>
<pre class="code"><span class="c">! egress switch par enforcement</span>
cts role-based enforcement
cts role-based enforcement vlan-list 40
<span class="c">! us recorder ke liye static mapping jo kabhi authenticate nahi karta</span>
cts role-based sgt-map 10.40.40.200 sgt 40
<span class="c">! locally defined SGACL aur ek matrix cell (normally ISE push karta hai)</span>
ip access-list role-based CAM_VIEW
 permit tcp dst eq 443
 permit tcp dst eq 554
 deny ip
cts role-based permissions from 20 to 40 CAM_VIEW</pre>

<pre class="out">ACC-SW1# show cts role-based sgt-map all
Active IPv4-SGT Bindings Information

IP Address              SGT     Source
============================================
10.20.20.10             20      LOCAL
<span class="hl">10.40.40.10             40      LOCAL</span>
10.40.40.200            40      CLI

ACC-SW1# show cts role-based permissions
IPv4 Role-based permissions default:
        Permit IP-00
<span class="hl">IPv4 Role-based permissions from group 20 to group 40:
        CAM_VIEW</span></pre>
<p>"LOCAL" bindings authentication sessions se aate hain (jo SGT ISE ne lautaya); "CLI" static hain. Camera ki binding 10.40.40.10 se SGT 40 wahi tag hai jo aap lab mein <code>show authentication sessions interface g0/2 details</code> se padhte ho.</p>

<div class="eg"><p><b>Worked example.</b> SGT 40 hex mein 0x28 hai. RADIUS Access-Accept mein ISE <code>cisco-av-pair = cts:security-group-tag=0028-00</code> bhejta hai. SGT 20 wala ek PC camera 10.40.40.10 tak TCP 554 (RTSP) kholta hai: egress switch source 20 aur destination 40 dekhta hai, CAM_VIEW paata hai, line 2 554 permit karti hai. Wahi PC camera par TCP 23 (Telnet) try karta hai: CAM_VIEW deny ip par khatam hota hai, isliye drop hota hai aur <code>show cts role-based counters</code> 20 se 40 ka deny counter badhata hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Ingress switch par enforce karna aur yeh ummeed rakhna ki use destination ka SGT pata hoga. Enforcement wahan hota hai jahan dono tags pata hon, normally egress par. Agar destination ki binding missing hai (na authentication, na static map, na SXP), to uska SGT 0 (Unknown) hai aur default cell lagta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> SXP TCP 64999 use karta hai aur IP-to-SGT bindings le jaata hai, traffic nahi. Inline tagging CMD header use karta hai, Ethertype 0x8909. SGACLs egress par enforce hote hain. SGT 16 bits ka hai.</p></div>

<div class="scn"><h4>Contractors aur PCI servers</h4><p>Ek retailer ko 80 stores mein contractors ko payment servers se door rakhna tha, jahan IP plans lagatar badalte the. 80 sets of ACLs ki jagah ISE ne authentication par SGT Contractors diya, payment servers ko data center mein statically SGT PCI_Servers se map kiya, SXP store bindings ko data center switches tak le gaya, aur ek matrix cell, Contractors to PCI_Servers = deny ip, data center egress par enforce hua. Baad mein ek audit ne dikhaya ki jab ek contractor laptop ne network scan kiya to counters badhe.</p><p><b>Seekh:</b> SGTs site-by-site IP policy ko ek role-to-role rule mein badal dete hain.</p></div>

<div class="iv"><p class="q">"TrustSec ko teen shabdon mein aur phir detail mein samjhao."</p><p>Strong answer: classify, propagate, enforce. Classification 802.1X ya MAB ke baad ISE se dynamically SGT deta hai, ya servers ke liye statically. Propagation use CMD header mein inline ya TCP 64999 par SXP se le jaata hai. Enforcement egress device par ISE matrix ke SGACLs apply karta hai, ya SGT-aware firewall rules. Fayda hai role ke hisaab se policy, IP addressing aur topology se independent.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SGT 16-bit role tag hai; ISE ise Access-Accept mein cts:security-group-tag ki tarah deta hai.</li>
<li>Classification dynamic (802.1X, MAB, WebAuth) ya static (IP, subnet, VLAN, port) ho sakta hai.</li>
<li>Propagation: inline CMD tagging (Ethertype 0x8909) ya SXP (TCP 64999).</li>
<li>Enforcement: ISE matrix ke SGACLs, egress par apply; firewalls bhi SGTs match kar sakte hain.</li>
<li>Anjaan destination tag = SGT 0 aur default cell lagta hai.</li>
</ul></div>
`}};export{e as default};