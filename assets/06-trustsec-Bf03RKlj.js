var e={id:`trustsec`,h:{en:`TrustSec and security group tags (concept only)`,hi:`TrustSec aur security group tags (concept only)`},body:{en:`
<p>In a hospital, staff wear coloured badges: blue for doctors, green for nurses, grey for visitors. Doors do not check names. They check the <b>colour</b>. When a nurse moves from ward A to ward B she keeps her green badge, so every door still treats her correctly without anyone editing a door list. <b>Cisco TrustSec</b> does this for networks. The badge colour is a <b>Security Group Tag (SGT)</b>, and the rule is written between groups, not between IP addresses. This chapter is <b>concept only</b>: the simulator has no SGT objects, but the blueprint expects you to explain the model.</p>

<h3>The problem it solves</h3>
<p>VLANs and ACLs tie policy to <b>where</b> a device is: a subnet or a port. That works until the business grows. A contractor and an employee in the same VLAN need different access; the same finance user roams between floors and gets different IP addresses; ACLs on dozens of devices grow into thousands of lines nobody dares to edit. TrustSec ties policy to <b>who or what</b> the endpoint is, wherever it connects (Wi-Fi, wired, VPN) and whatever its IP address.</p>

<h3>Three jobs: classify, propagate, enforce</h3>
<dl class="terms">
<dt>Classification</dt><dd>Giving the endpoint an SGT. Dynamic: ISE returns the SGT in the authorization result after 802.1X or MAB. Static: map an IP address, subnet, VLAN or port to a tag on a device.</dd>
<dt>Propagation</dt><dd>Carrying the tag across the network. <b>Inline tagging</b> puts the SGT in a Cisco Meta Data field in the Ethernet frame, so every capable hop sees it. <b>SXP</b> (SGT Exchange Protocol, TCP, default port 64999) sends IP-to-SGT bindings between devices that cannot tag inline: a speaker tells a listener "10.10.40.15 is tag 10". Newer fabric designs carry the tag in the VXLAN header.</dd>
<dt>Enforcement</dt><dd>Applying a rule based on source tag and destination tag. An <b>SGACL</b> (group ACL) is a small ACL such as "permit tcp to port 443, deny everything else" applied in a <b>matrix</b> cell: source group by destination group. Enforcement happens on switches, firewalls and other capable devices, not necessarily on the controller.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="TrustSec SGT matrix">
<text x="320" y="20" text-anchor="middle" class="svg-ink" font-size="13" font-weight="bold">Policy matrix: source group (rows) by destination group (columns)</text>
<rect x="150" y="34" width="110" height="30" fill="#e2e8f0"/><text x="205" y="54" text-anchor="middle" class="svg-ink" font-size="12">Servers (SGT 20)</text>
<rect x="260" y="34" width="110" height="30" fill="#e2e8f0"/><text x="315" y="54" text-anchor="middle" class="svg-ink" font-size="12">Printers (30)</text>
<rect x="370" y="34" width="110" height="30" fill="#e2e8f0"/><text x="425" y="54" text-anchor="middle" class="svg-ink" font-size="12">Internet</text>
<rect x="30" y="64" width="120" height="36" fill="#bae6fd"/><text x="90" y="87" text-anchor="middle" class="svg-ink" font-size="12">Employee (10)</text>
<rect x="30" y="100" width="120" height="36" fill="#fde68a"/><text x="90" y="123" text-anchor="middle" class="svg-ink" font-size="12">Contractor (11)</text>
<rect x="30" y="136" width="120" height="36" fill="#fed7aa"/><text x="90" y="159" text-anchor="middle" class="svg-ink" font-size="12">Guest (12)</text>
<rect x="150" y="64" width="110" height="36" fill="#bbf7d0"/><text x="205" y="87" text-anchor="middle" class="svg-ink" font-size="12">permit</text>
<rect x="260" y="64" width="110" height="36" fill="#bbf7d0"/><text x="315" y="87" text-anchor="middle" class="svg-ink" font-size="12">permit</text>
<rect x="370" y="64" width="110" height="36" fill="#bbf7d0"/><text x="425" y="87" text-anchor="middle" class="svg-ink" font-size="12">permit</text>
<rect x="150" y="100" width="110" height="36" fill="#fde68a"/><text x="205" y="123" text-anchor="middle" class="svg-ink" font-size="12">SGACL: 443 only</text>
<rect x="260" y="100" width="110" height="36" fill="#fecaca"/><text x="315" y="123" text-anchor="middle" class="svg-ink" font-size="12">deny</text>
<rect x="370" y="100" width="110" height="36" fill="#bbf7d0"/><text x="425" y="123" text-anchor="middle" class="svg-ink" font-size="12">permit</text>
<rect x="150" y="136" width="110" height="36" fill="#fecaca"/><text x="205" y="159" text-anchor="middle" class="svg-ink" font-size="12">deny</text>
<rect x="260" y="136" width="110" height="36" fill="#fecaca"/><text x="315" y="159" text-anchor="middle" class="svg-ink" font-size="12">deny</text>
<rect x="370" y="136" width="110" height="36" fill="#bbf7d0"/><text x="425" y="159" text-anchor="middle" class="svg-ink" font-size="12">permit</text>
<text x="320" y="205" text-anchor="middle" class="svg-muted" font-size="12">Three groups and three destinations: nine cells replace pages of IP ACLs.</text>
<text x="320" y="228" text-anchor="middle" class="svg-muted" font-size="12">Numbers are example SGT values.</text>
</svg><p class="cap">Policy reads like the business: "contractors may reach servers on port 443 only".</p></div>

<h3>Where TrustSec meets wireless</h3>
<p>On a wireless network the typical flow is: the client authenticates with 802.1X or MAB, ISE returns an authorization profile that includes the SGT, the controller records the tag for that client session and, depending on the release and design, applies or propagates it (inline tagging on the uplink, SXP, or the fabric header in a software-defined access design), and a switch, firewall or the fabric edge enforces the SGACL. Because the tag follows the user, the same contractor gets the same restrictions on Wi-Fi in building A and on a wired port in building B.</p>
<p>Platform support, the exact commands and where enforcement can run differ by release and by device, so verify against the configuration guide for your software. Never assume that the wireless controller itself enforces a group matrix.</p>

<h3>How TrustSec complements, not replaces, VLANs and ACLs</h3>
<table class="cmp"><tr><th>Control</th><th>Policy is based on</th><th>Strength</th><th>Weakness</th></tr>
<tr><td>VLAN</td><td>Broadcast domain</td><td>Simple, universal</td><td>Many VLANs, IP-bound</td></tr>
<tr><td>ACL (IP)</td><td>Address and port</td><td>Fine grained, everywhere</td><td>Grows fast, breaks on renumbering</td></tr>
<tr><td>AAA override</td><td>Per-user VLAN or ACL name</td><td>Dynamic, one SSID</td><td>Still VLAN/IP-bound</td></tr>
<tr><td>TrustSec SGT</td><td>Identity group</td><td>Follows the user, small matrix</td><td>Needs ISE, capable hardware, planning</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> A company wants "contractors may use the ERP web front end, nothing else". Old way: ACLs on every access switch listing ERP addresses and contractor subnets. TrustSec way: ISE assigns Contractor (SGT 11) at login, the ERP servers are tagged Servers (SGT 20), and one matrix cell says permit TCP 443, deny the rest. A new server joins group 20 and inherits the rule at once.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Believing SGTs encrypt or authenticate by themselves: they are labels and rely on trusted links and authenticated assignment. Tagging a frame on a link where the next hop cannot read the tag. Forgetting that unclassified traffic gets the "unknown" tag and has its own matrix cell. Turning enforcement on before running in monitor mode.</p></div>

<div class="exam"><p><b>Exam traps.</b> The three jobs are classification, propagation, enforcement. SXP is for devices that cannot tag inline, and uses TCP. An SGACL is applied between a source group and a destination group, not to an interface address range. ISE normally supplies the tag.</p></div>

<div class="scn"><h4>Contractors on the finance floor</h4><p>A firm lets contractors use the same Wi-Fi as staff. VLAN design would need a second SSID per floor. Instead the security team deployed tags: contractors authenticate, receive SGT 11, and the data center firewall allows SGT 11 only to the ERP front end. When a contractor moved from the fourth to the sixth floor nothing changed in the policy; the tag moved with the session.</p><p><b>Lesson:</b> use tags when the policy question is "who", and VLANs and ACLs when the question is "where".</p></div>

<div class="iv"><p class="q">"What does TrustSec give you that VLANs and ACLs do not?"</p><p>Identity-based segmentation that follows the user across wired, wireless and VPN independent of IP. Describe classification (ISE returns the SGT), propagation (inline or SXP), enforcement (SGACL matrix). Admit the costs: ISE, hardware support, design effort, and that VLANs and ACLs still exist underneath.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>An SGT is a label for a group of endpoints; policy is written between groups.</li>
<li>Three jobs: classify (dynamic from ISE or static), propagate (inline, SXP, fabric), enforce (SGACL).</li>
<li>SXP uses TCP, default port 64999, for devices that cannot tag inline.</li>
<li>TrustSec complements VLANs and ACLs; it does not replace them.</li>
<li>Concept only here: check platform support before promising enforcement on the controller.</li>
</ul></div>
`,hi:`
<p>Hospital mein staff rang-birange badge pehente hain: doctors ke liye neela, nurses ke liye hara, visitors ke liye grey. Darwaze naam check nahi karte. Woh <b>rang</b> check karte hain. Jab nurse ward A se ward B jaati hai to uska hara badge saath rehta hai, isliye har darwaza use sahi treat karta hai bina kisi door list ko edit kiye. <b>Cisco TrustSec</b> networks ke liye yahi karta hai. Badge ka rang <b>Security Group Tag (SGT)</b> hai, aur rule groups ke beech likha jata hai, IP addresses ke beech nahi. Yeh chapter <b>concept only</b> hai: simulator mein SGT objects nahi hain, lekin blueprint aapse model samjhane ki ummeed rakhta hai.</p>

<h3>Yeh kaunsi problem solve karta hai</h3>
<p>VLANs aur ACLs policy ko <b>kahan</b> device hai usse jodte hain: subnet ya port. Yeh tab tak chalta hai jab tak business badhta nahi. Same VLAN mein contractor aur employee ko alag access chahiye; same finance user floors ke beech ghoomta hai aur alag IP addresses leta hai; darjano devices par ACLs hazaaron lines ban jaate hain jinhe koi edit karne ki himmat nahi karta. TrustSec policy ko <b>kaun ya kya</b> endpoint hai usse jodta hai, chahe woh kahin bhi connect ho (Wi-Fi, wired, VPN) aur uska IP address kuch bhi ho.</p>

<h3>Teen kaam: classify, propagate, enforce</h3>
<dl class="terms">
<dt>Classification</dt><dd>Endpoint ko SGT dena. Dynamic: 802.1X ya MAB ke baad ISE authorization result mein SGT return karta hai. Static: device par IP address, subnet, VLAN ya port ko tag se map karo.</dd>
<dt>Propagation</dt><dd>Tag ko network mein le jaana. <b>Inline tagging</b> SGT ko Ethernet frame ke Cisco Meta Data field mein daalta hai, isliye har capable hop use dekhta hai. <b>SXP</b> (SGT Exchange Protocol, TCP, default port 64999) un devices ke beech IP-to-SGT bindings bhejta hai jo inline tag nahi kar sakte: speaker listener ko batata hai "10.10.40.15 tag 10 hai". Naye fabric designs tag ko VXLAN header mein le jaate hain.</dd>
<dt>Enforcement</dt><dd>Source tag aur destination tag ke aadhaar par rule lagana. <b>SGACL</b> (group ACL) ek chhota ACL hai jaise "tcp port 443 permit, baaki sab deny" jo <b>matrix</b> ke cell mein lagta hai: source group ke saamne destination group. Enforcement switches, firewalls aur doosre capable devices par hota hai, zaroori nahi ki controller par.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="TrustSec SGT matrix">
<text x="320" y="20" text-anchor="middle" class="svg-ink" font-size="13" font-weight="bold">Policy matrix: source group (rows) aur destination group (columns)</text>
<rect x="150" y="34" width="110" height="30" fill="#e2e8f0"/><text x="205" y="54" text-anchor="middle" class="svg-ink" font-size="12">Servers (SGT 20)</text>
<rect x="260" y="34" width="110" height="30" fill="#e2e8f0"/><text x="315" y="54" text-anchor="middle" class="svg-ink" font-size="12">Printers (30)</text>
<rect x="370" y="34" width="110" height="30" fill="#e2e8f0"/><text x="425" y="54" text-anchor="middle" class="svg-ink" font-size="12">Internet</text>
<rect x="30" y="64" width="120" height="36" fill="#bae6fd"/><text x="90" y="87" text-anchor="middle" class="svg-ink" font-size="12">Employee (10)</text>
<rect x="30" y="100" width="120" height="36" fill="#fde68a"/><text x="90" y="123" text-anchor="middle" class="svg-ink" font-size="12">Contractor (11)</text>
<rect x="30" y="136" width="120" height="36" fill="#fed7aa"/><text x="90" y="159" text-anchor="middle" class="svg-ink" font-size="12">Guest (12)</text>
<rect x="150" y="64" width="110" height="36" fill="#bbf7d0"/><text x="205" y="87" text-anchor="middle" class="svg-ink" font-size="12">permit</text>
<rect x="260" y="64" width="110" height="36" fill="#bbf7d0"/><text x="315" y="87" text-anchor="middle" class="svg-ink" font-size="12">permit</text>
<rect x="370" y="64" width="110" height="36" fill="#bbf7d0"/><text x="425" y="87" text-anchor="middle" class="svg-ink" font-size="12">permit</text>
<rect x="150" y="100" width="110" height="36" fill="#fde68a"/><text x="205" y="123" text-anchor="middle" class="svg-ink" font-size="12">SGACL: sirf 443</text>
<rect x="260" y="100" width="110" height="36" fill="#fecaca"/><text x="315" y="123" text-anchor="middle" class="svg-ink" font-size="12">deny</text>
<rect x="370" y="100" width="110" height="36" fill="#bbf7d0"/><text x="425" y="123" text-anchor="middle" class="svg-ink" font-size="12">permit</text>
<rect x="150" y="136" width="110" height="36" fill="#fecaca"/><text x="205" y="159" text-anchor="middle" class="svg-ink" font-size="12">deny</text>
<rect x="260" y="136" width="110" height="36" fill="#fecaca"/><text x="315" y="159" text-anchor="middle" class="svg-ink" font-size="12">deny</text>
<rect x="370" y="136" width="110" height="36" fill="#bbf7d0"/><text x="425" y="159" text-anchor="middle" class="svg-ink" font-size="12">permit</text>
<text x="320" y="205" text-anchor="middle" class="svg-muted" font-size="12">Teen groups aur teen destinations: nau cells IP ACLs ke pages ki jagah lete hain.</text>
<text x="320" y="228" text-anchor="middle" class="svg-muted" font-size="12">Numbers example SGT values hain.</text>
</svg><p class="cap">Policy business ki tarah padhi jati hai: "contractors sirf port 443 par servers tak ja sakte hain".</p></div>

<h3>TrustSec wireless se kahan milta hai</h3>
<p>Wireless network mein typical flow yeh hai: client 802.1X ya MAB se authenticate karta hai, ISE authorization profile return karta hai jisme SGT hota hai, controller us client session ke liye tag record karta hai aur release aur design ke hisaab se use apply ya propagate karta hai (uplink par inline tagging, SXP, ya software-defined access design mein fabric header), aur switch, firewall ya fabric edge SGACL enforce karta hai. Kyunki tag user ke saath chalta hai, same contractor ko building A ke Wi-Fi par aur building B ke wired port par wahi restrictions milte hain.</p>
<p>Platform support, exact commands aur enforcement kahan chal sakta hai, yeh release aur device ke hisaab se alag hai, isliye apne software ki configuration guide se verify karo. Yeh kabhi mat maano ki wireless controller khud group matrix enforce karta hai.</p>

<h3>TrustSec VLANs aur ACLs ko complement karta hai, replace nahi</h3>
<table class="cmp"><tr><th>Control</th><th>Policy kis par based</th><th>Strength</th><th>Weakness</th></tr>
<tr><td>VLAN</td><td>Broadcast domain</td><td>Simple, universal</td><td>Bahut VLANs, IP se bandha</td></tr>
<tr><td>ACL (IP)</td><td>Address aur port</td><td>Fine grained, har jagah</td><td>Tezi se badhta hai, renumbering par tootta hai</td></tr>
<tr><td>AAA override</td><td>Per-user VLAN ya ACL naam</td><td>Dynamic, ek SSID</td><td>Phir bhi VLAN/IP se bandha</td></tr>
<tr><td>TrustSec SGT</td><td>Identity group</td><td>User ke saath chalta hai, chhota matrix</td><td>ISE, capable hardware, planning chahiye</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> Ek company chahti hai "contractors ERP ka web front end use kar sakte hain, aur kuch nahi". Purana tareeka: har access switch par ERP addresses aur contractor subnets ki ACLs. TrustSec tareeka: ISE login par Contractor (SGT 11) deta hai, ERP servers Servers (SGT 20) tag hain, aur ek matrix cell kehta hai TCP 443 permit, baaki deny. Naya server group 20 mein aata hai aur turant rule inherit karta hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Yeh maanna ki SGTs khud encrypt ya authenticate karte hain: woh labels hain aur trusted links aur authenticated assignment par depend karte hain. Aise link par frame tag karna jahan next hop tag padh nahi sakta. Yeh bhoolna ki unclassified traffic ko "unknown" tag milta hai aur uska apna matrix cell hai. Monitor mode mein chalaye bina enforcement on kar dena.</p></div>

<div class="exam"><p><b>Exam traps.</b> Teen kaam hain classification, propagation, enforcement. SXP un devices ke liye hai jo inline tag nahi kar sakte, aur TCP use karta hai. SGACL source group aur destination group ke beech lagta hai, interface address range par nahi. Tag aam taur par ISE deta hai.</p></div>

<div class="scn"><h4>Finance floor par contractors</h4><p>Ek firm contractors ko staff wala hi Wi-Fi use karne deti hai. VLAN design mein har floor ke liye doosra SSID chahiye hota. Uski jagah security team ne tags lagaye: contractors authenticate karte hain, SGT 11 paate hain, aur data center firewall SGT 11 ko sirf ERP front end tak allow karta hai. Jab contractor chauthi se chhathi floor gaya to policy mein kuch nahi badla; tag session ke saath chala gaya.</p><p><b>Lesson:</b> jab policy ka sawal "kaun" hai tab tags use karo, aur jab sawal "kahan" hai tab VLANs aur ACLs.</p></div>

<div class="iv"><p class="q">"TrustSec woh kya deta hai jo VLANs aur ACLs nahi dete?"</p><p>Identity-based segmentation jo user ke saath wired, wireless aur VPN mein IP se independent chalti hai. Classification (ISE SGT return karta hai), propagation (inline ya SXP), enforcement (SGACL matrix) batao. Costs maan lo: ISE, hardware support, design effort, aur VLANs aur ACLs neeche phir bhi rehte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SGT endpoints ke group ka label hai; policy groups ke beech likhi jati hai.</li>
<li>Teen kaam: classify (ISE se dynamic ya static), propagate (inline, SXP, fabric), enforce (SGACL).</li>
<li>SXP TCP use karta hai, default port 64999, un devices ke liye jo inline tag nahi kar sakte.</li>
<li>TrustSec VLANs aur ACLs ko complement karta hai; replace nahi.</li>
<li>Yahan concept only: controller par enforcement ka waada karne se pehle platform support check karo.</li>
</ul></div>
`}};export{e as default};