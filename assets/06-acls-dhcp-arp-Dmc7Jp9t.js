var e={id:`acls-dhcp-arp`,h:{en:`Flex ACLs, DHCP, ARP caching and guest breakout`,hi:`Flex ACLs, DHCP, ARP caching aur guest breakout`},body:{en:`
<p>When switching is local, the controller no longer sees the packets, so it cannot filter them. The security guard has moved to the branch door. That guard is the <b>flex ACL</b>: an access list that the AP itself enforces on locally switched traffic. This chapter covers the small services around local switching: ACLs, DHCP, ARP caching and the guest case. In the labs, <code>acl-policy</code> and <code>arp-caching</code> are <b>stored and shown only</b>; the data plane does not enforce them. Everything below the commands is concept you need for the exam and for real branches.</p>

<h3>Why the controller ACL does not help</h3>
<p>A controller ACL on a policy profile or an interface is applied where the traffic arrives at the controller. A locally switched frame never arrives there. If Pune staff must not reach the management network, the filter must run on the AP, the branch switch or the branch router. FlexConnect gives you the AP option.</p>

<h3>The kinds of flex ACL</h3>
<dl class="terms">
<dt>VLAN ACL (per VLAN, in and out)</dt><dd>An ACL bound to a VLAN mapping of the flex profile, in the ingress or egress direction. Use it to limit what staff VLAN 220 can reach.</dd>
<dt>Policy ACL</dt><dd>A named ACL in the flex profile that the AP applies to a client after a policy or AAA result names it. Used in central web authentication: the pre-authentication ACL lets the client reach the login page and DHCP and DNS, blocks the rest.</dd>
<dt>WLAN-level ACL</dt><dd>Applied to every client of a WLAN on the AP. Less common than the first two.</dd>
</dl>
<pre class="code"><span class="c">! flex profile: ACL names the AP will enforce</span>
wireless profile flex FLEX-PUNE
 acl-policy ACL-STAFF-PUN
 arp-caching
 exit</pre>
<pre class="out">WLC1# show wireless profile flex detailed FLEX-PUNE
ARP Caching                       : <span class="hl">ENABLED</span>
Policy ACLs: <span class="hl">ACL-STAFF-PUN</span></pre>
<p>On a real controller the ACL is created first with <code>ip access-list extended ACL-STAFF-PUN</code>, and the flex profile references it by name. The model keeps only the name.</p>
<div class="warn"><p><b>Common mistake.</b> Writing a flex ACL as if it were stateful. As documented for flex ACLs, the AP does a simple per-packet match without session tracking: you need both the request permit and the matching return permit. Test in both directions, and verify the behaviour on your release.</p></div>

<h3>DHCP for local switching</h3>
<p>With local switching the client broadcasts DHCP on the branch VLAN. The branch router R2 answers from the pool <code>STAFF-PUN</code> (10.30.20.0/24, gateway 10.30.20.1, DNS 10.30.60.20). Nothing crosses the WAN, so DHCP works even in standalone mode. That is a big reason to keep DHCP local at branches.</p>
<ul>
<li><b>Local DHCP</b> (default for local switching): the AP bridges the DHCP exchange to the branch VLAN.</li>
<li><code>central dhcp</code> in the policy profile: the DHCP exchange is handled through the controller path while the data stays local. It needs the WAN, so it fails in standalone mode.</li>
<li>Central switching is different again: the client is in a headquarters VLAN, so the headquarters DHCP serves it.</li>
</ul>
<pre class="code">wireless profile policy PP-STAFF-PUN
 shutdown
 central dhcp
 no shutdown</pre>
<div class="exam"><p><b>Exam trap.</b> <code>central dhcp</code> does not move the client VLAN to headquarters; it only changes who handles the DHCP exchange. A question that offers it as the fix for a wrong subnet is a distractor: the wrong subnet is a VLAN mapping problem.</p></div>

<h3>ARP caching</h3>
<p>In a busy Wi-Fi VLAN, ARP broadcasts waste airtime, because every broadcast must be sent at low data rates to all clients. With <code>arp-caching</code> in the flex profile the AP remembers the IP and MAC pairs of its clients and <b>answers ARP requests on their behalf</b>, so a sleeping phone can still be found and the broadcast is not sent over the air. It reduces load; it does not change connectivity, so a lab cannot "break" it.</p>

<h3>Multicast on a flex AP</h3>
<p>Concept only. A locally switched WLAN follows the branch VLAN for multicast. For centrally switched WLANs the controller's multicast mode applies (module wl-qos covers it). A flex profile can also name a multicast overridden interface on real releases; check your guide.</p>

<h3>Guest breakout and the central WLAN</h3>
<p>For guests, keep <code>central switching</code> (the default). In the lab, <code>PP-GUEST</code> is mapped on <code>PT-PUNE</code>, VLAN 50 at headquarters (10.10.50.0/24). GUEST2 in Pune receives a 10.10.50.x address from the HQ network. Pros: one firewall and one guest policy; guest traffic never touches the Pune LAN. Cons: guest traffic crosses the WAN, and the WLAN disappears in standalone mode, because the AP cannot tunnel to a dead controller.</p>
<pre class="out">WLC1# show wireless client mac-address 0050.32e9.9f05 detail
Client IPv4 Address: 10.10.50.31
AP Name            : AP-PUN2
Policy Profile     : PP-GUEST
VLAN               : 50
FlexConnect (model view):
  <span class="hl">Switching Mode                : Central (the policy profile uses central switching)</span></pre>
<p>Alternative designs, as concept: a local guest VLAN with an internet-only ACL on the AP and on the router, accepting that guests use the branch internet line. Choose by risk, not by habit.</p>

<div class="eg"><p><b>Worked example.</b> Pune has 40 staff and 80 guests per day. Staff go to the Pune file server (local), the HQ ERP (over the WAN), the guests only to the internet. Design: staff WLAN local switching with VLAN ACL denying 10.10.99.0/24 except the controller; guest WLAN central at HQ. Result: the staff file traffic never leaves Pune, guests are filtered at HQ, and the AP ACL protects the management network from a compromised branch laptop.</p></div>

<div class="scn"><h4>The printer that guests could reach</h4><p>A branch had a locally switched guest SSID on the same VLAN as the office printers, "to save WAN bandwidth". Guests found the printers and the print queue showed strangers' documents. The fix was to move NK-GUEST to central switching in a HQ guest VLAN, and add a VLAN ACL on the staff VLAN so only the print server could reach the printers.</p><p><b>Lesson:</b> local switching moves traffic to the branch; decide what else lives in that VLAN before you put guests there.</p></div>

<div class="iv"><p class="q">"Where do you filter traffic of a locally switched client?"</p><p>Not on the controller, which never sees the data. Use a flex ACL on the AP (per VLAN, in or out), and back it with the branch router or firewall. Note that flex ACLs are simple per-packet filters, so permit return traffic explicitly.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Local switching moves filtering to the AP (flex ACL), the switch or the router.</li>
<li>Flex ACL kinds: per-VLAN ACL, policy ACL (for web auth and AAA results), WLAN ACL.</li>
<li><code>acl-policy</code> and <code>arp-caching</code> are stored and shown in the labs, not enforced.</li>
<li>Local DHCP survives a WAN failure; <code>central dhcp</code> does not.</li>
<li>Guest breakout at HQ means central switching: simple and safe, but gone in standalone mode.</li>
</ul></div>
`,hi:`
<p>Switching local ho to controller ko packets dikhte hi nahi, isliye woh unhe filter nahi kar sakta. Security guard branch ke darwaze par chala gaya. Woh guard <b>flex ACL</b> hai: ek access list jo AP khud locally switched traffic par enforce karta hai. Yeh chapter local switching ke aas-paas ki chhoti services cover karta hai: ACLs, DHCP, ARP caching aur guest case. Labs mein <code>acl-policy</code> aur <code>arp-caching</code> <b>sirf stored aur shown</b> hain; data plane unhe enforce nahi karta. Commands ke neeche sab kuch woh concept hai jo exam aur asli branches ke liye chahiye.</p>

<h3>Controller ACL kaam kyun nahi aata</h3>
<p>Policy profile ya interface par controller ACL wahan lagta hai jahan traffic controller par pahunchta hai. Locally switched frame wahan pahunchta hi nahi. Pune staff ko management network tak nahi pahunchna hai to filter AP, branch switch ya branch router par chalna chahiye. FlexConnect AP wala option deta hai.</p>

<h3>Flex ACL ke kinds</h3>
<dl class="terms">
<dt>VLAN ACL (per VLAN, in aur out)</dt><dd>Flex profile ke VLAN mapping se bandha ACL, ingress ya egress direction mein. Isse limit karo ki staff VLAN 220 kya reach kar sakta hai.</dd>
<dt>Policy ACL</dt><dd>Flex profile mein ek named ACL jo AP client par tab lagata hai jab policy ya AAA result use naam leta hai. Central web authentication mein use hota hai: pre-authentication ACL client ko login page, DHCP aur DNS tak jaane deta hai, baaki block.</dd>
<dt>WLAN-level ACL</dt><dd>AP par WLAN ke har client par lagta hai. Pehle do se kam common.</dd>
</dl>
<pre class="code"><span class="c">! flex profile: ACL names jo AP enforce karega</span>
wireless profile flex FLEX-PUNE
 acl-policy ACL-STAFF-PUN
 arp-caching
 exit</pre>
<pre class="out">WLC1# show wireless profile flex detailed FLEX-PUNE
ARP Caching                       : <span class="hl">ENABLED</span>
Policy ACLs: <span class="hl">ACL-STAFF-PUN</span></pre>
<p>Asli controller par ACL pehle <code>ip access-list extended ACL-STAFF-PUN</code> se banta hai, aur flex profile use naam se reference karta hai. Model sirf naam rakhta hai.</p>
<div class="warn"><p><b>Common mistake.</b> Flex ACL ko stateful samajh kar likhna. Flex ACLs ke documented behaviour ke mutabiq AP session tracking ke bina simple per-packet match karta hai: request permit aur matching return permit dono chahiye. Dono directions mein test karo, aur apne release par behaviour verify karo.</p></div>

<h3>Local switching ke liye DHCP</h3>
<p>Local switching mein client branch VLAN par DHCP broadcast karta hai. Branch router R2 pool <code>STAFF-PUN</code> (10.30.20.0/24, gateway 10.30.20.1, DNS 10.30.60.20) se jawab deta hai. Kuch WAN cross nahi karta, isliye DHCP standalone mode mein bhi chalta hai. Branches par DHCP local rakhne ki yeh badi wajah hai.</p>
<ul>
<li><b>Local DHCP</b> (local switching ka default): AP DHCP exchange ko branch VLAN par bridge karta hai.</li>
<li>Policy profile mein <code>central dhcp</code>: DHCP exchange controller path se handle hota hai jabki data local rehta hai. WAN chahiye, isliye standalone mode mein fail hota hai.</li>
<li>Central switching alag hai: client headquarters VLAN mein hai, isliye headquarters DHCP use serve karta hai.</li>
</ul>
<pre class="code">wireless profile policy PP-STAFF-PUN
 shutdown
 central dhcp
 no shutdown</pre>
<div class="exam"><p><b>Exam trap.</b> <code>central dhcp</code> client VLAN ko headquarters nahi le jata; yeh sirf badalta hai ki DHCP exchange kaun handle karta hai. Galat subnet ke fix ke roop mein jo question yeh option de woh distractor hai: galat subnet VLAN mapping problem hai.</p></div>

<h3>ARP caching</h3>
<p>Busy Wi-Fi VLAN mein ARP broadcasts airtime waste karte hain, kyunki har broadcast sab clients ko low data rate par bhejna padta hai. Flex profile mein <code>arp-caching</code> ke saath AP apne clients ke IP aur MAC pairs yaad rakhta hai aur <b>unki taraf se ARP requests ka jawab deta hai</b>, to sota hua phone bhi mil jata hai aur broadcast air par nahi jata. Yeh load kam karta hai; connectivity nahi badalta, isliye lab ise "tod" nahi sakta.</p>

<h3>Flex AP par multicast</h3>
<p>Concept only. Locally switched WLAN multicast ke liye branch VLAN follow karta hai. Centrally switched WLANs ke liye controller ka multicast mode lagta hai (module wl-qos cover karta hai). Asli releases par flex profile multicast overridden interface bhi naam kar sakta hai; apni guide dekho.</p>

<h3>Guest breakout aur central WLAN</h3>
<p>Guests ke liye <code>central switching</code> rakho (default). Lab mein <code>PP-GUEST</code> <code>PT-PUNE</code> par mapped hai, headquarters ka VLAN 50 (10.10.50.0/24). Pune ke GUEST2 ko HQ network se 10.10.50.x address milta hai. Fayde: ek firewall aur ek guest policy; guest traffic Pune LAN ko kabhi nahi chhuta. Nuksan: guest traffic WAN cross karta hai, aur standalone mode mein WLAN gayab ho jata hai, kyunki AP mari hui controller tak tunnel nahi bana sakta.</p>
<pre class="out">WLC1# show wireless client mac-address 0050.32e9.9f05 detail
Client IPv4 Address: 10.10.50.31
AP Name            : AP-PUN2
Policy Profile     : PP-GUEST
VLAN               : 50
FlexConnect (model view):
  <span class="hl">Switching Mode                : Central (the policy profile uses central switching)</span></pre>
<p>Alternative designs, concept ke roop mein: local guest VLAN jisme AP aur router par sirf internet wala ACL ho, yeh maante hue ki guests branch ki internet line use karenge. Aadat se nahi, risk se choose karo.</p>

<div class="eg"><p><b>Worked example.</b> Pune mein roz 40 staff aur 80 guests hain. Staff Pune file server (local), HQ ERP (WAN ke upar) jaate hain, guests sirf internet. Design: staff WLAN local switching, VLAN ACL jo 10.10.99.0/24 deny kare sirf controller ko chhodkar; guest WLAN HQ par central. Result: staff file traffic Pune se bahar nahi jata, guests HQ par filter hote hain, aur AP ACL compromised branch laptop se management network ko bachata hai.</p></div>

<div class="scn"><h4>Printer jis tak guests pahunch gaye</h4><p>Ek branch mein locally switched guest SSID office printers ke same VLAN par tha, "WAN bandwidth bachane ke liye". Guests ko printers mil gaye aur print queue mein ajnabiyon ke documents dikhne lage. Fix: NK-GUEST ko HQ guest VLAN mein central switching par le jana, aur staff VLAN par VLAN ACL lagana taaki sirf print server printers tak pahunche.</p><p><b>Lesson:</b> local switching traffic branch mein le aata hai; guests ko wahan rakhne se pehle decide karo us VLAN mein aur kya rehta hai.</p></div>

<div class="iv"><p class="q">"Locally switched client ka traffic kahan filter karte ho?"</p><p>Controller par nahi, jo data kabhi nahi dekhta. AP par flex ACL (per VLAN, in ya out), aur uske peeche branch router ya firewall. Dhyan rakho ki flex ACLs simple per-packet filters hain, isliye return traffic explicitly permit karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Local switching filtering ko AP (flex ACL), switch ya router par le jata hai.</li>
<li>Flex ACL kinds: per-VLAN ACL, policy ACL (web auth aur AAA results ke liye), WLAN ACL.</li>
<li><code>acl-policy</code> aur <code>arp-caching</code> labs mein stored aur shown hain, enforce nahi.</li>
<li>Local DHCP WAN failure survive karta hai; <code>central dhcp</code> nahi.</li>
<li>HQ par guest breakout matlab central switching: simple aur safe, lekin standalone mode mein gayab.</li>
</ul></div>
`}};export{e as default};