var e={id:`policy`,h:{en:`Policy: group-based access, virtual networks and application QoS`,hi:`Policy: group-based access, virtual networks aur application QoS`},body:{en:`
<p>In an office building, security guards do not memorise which desk number each employee sits at. They check your <b>badge colour</b>: blue badges can enter the finance floor, visitor badges can only reach reception. If you move desks, your badge still works. <b>Group-based policy</b> in Catalyst Center works the same way: rules follow <i>who you are</i>, not <i>which IP address you have today</i>.</p>

<h3>The problem with IP-based ACLs</h3>
<p>The classic way to write security is an ACL keyed on subnets, like <code>WAN-IN</code> on R1 in Lab 2: <code>deny tcp 10.20.20.0 0.0.0.255 host 172.16.50.10 eq 80</code>. It works, but it ties policy to addressing. When staff move to a new VLAN, when DHCP scopes grow, or when the same user connects over Wi-Fi from another building, the ACL is wrong. Large networks end up with thousands of ACL lines nobody dares to delete.</p>

<h3>Group-based access control</h3>
<ul><li><b>Scalable groups</b> (tagged with a <b>Scalable Group Tag, SGT</b>, a 16-bit number) represent roles: Employees, Contractors, Guests, Printers, PCI-Servers.</li>
<li>A user or device is placed into a group when it authenticates to <b>ISE</b> (802.1X, MAB or web auth), based on identity and context, not its IP.</li>
<li>A <b>contract</b> says what is allowed between groups: permit, deny, or a custom list of protocols and ports.</li>
<li>The <b>policy matrix</b> is a grid of source groups against destination groups, with a contract in each cell. You edit it in Catalyst Center; ISE stores it and pushes the matching <b>SGACLs</b> to the switches, which enforce them.</li></ul>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Policy matrix">
<rect x="20" y="20" width="160" height="36" rx="6" fill="#e2e8f0"/><text x="100" y="43" text-anchor="middle" class="svg-ink" font-size="13">Source → Destination</text>
<rect x="190" y="20" width="140" height="36" rx="6" fill="#bae6fd"/><text x="260" y="43" text-anchor="middle" class="svg-ink" font-size="13">Intranet-Web</text>
<rect x="340" y="20" width="140" height="36" rx="6" fill="#bae6fd"/><text x="410" y="43" text-anchor="middle" class="svg-ink" font-size="13">PCI-Servers</text>
<rect x="490" y="20" width="130" height="36" rx="6" fill="#bae6fd"/><text x="555" y="43" text-anchor="middle" class="svg-ink" font-size="13">Printers</text>
<rect x="20" y="66" width="160" height="36" rx="6" fill="#fde68a"/><text x="100" y="89" text-anchor="middle" class="svg-ink" font-size="13">Employees</text>
<rect x="190" y="66" width="140" height="36" rx="6" fill="#bbf7d0"/><text x="260" y="89" text-anchor="middle" class="svg-ink" font-size="13">permit web</text>
<rect x="340" y="66" width="140" height="36" rx="6" fill="#fed7aa"/><text x="410" y="89" text-anchor="middle" class="svg-ink" font-size="13">deny</text>
<rect x="490" y="66" width="130" height="36" rx="6" fill="#bbf7d0"/><text x="555" y="89" text-anchor="middle" class="svg-ink" font-size="13">permit</text>
<rect x="20" y="112" width="160" height="36" rx="6" fill="#fde68a"/><text x="100" y="135" text-anchor="middle" class="svg-ink" font-size="13">Contractors</text>
<rect x="190" y="112" width="140" height="36" rx="6" fill="#bbf7d0"/><text x="260" y="135" text-anchor="middle" class="svg-ink" font-size="13">permit web</text>
<rect x="340" y="112" width="140" height="36" rx="6" fill="#fed7aa"/><text x="410" y="135" text-anchor="middle" class="svg-ink" font-size="13">deny</text>
<rect x="490" y="112" width="130" height="36" rx="6" fill="#fed7aa"/><text x="555" y="135" text-anchor="middle" class="svg-ink" font-size="13">deny</text>
<rect x="20" y="158" width="160" height="36" rx="6" fill="#fde68a"/><text x="100" y="181" text-anchor="middle" class="svg-ink" font-size="13">Guests</text>
<rect x="190" y="158" width="430" height="36" rx="6" fill="#fed7aa"/><text x="405" y="181" text-anchor="middle" class="svg-ink" font-size="13">deny (internet only via a separate virtual network)</text>
</svg><p class="cap">Each cell is a contract. Nine cells replace hundreds of subnet-based ACL lines.</p></div>

<h3>Virtual networks: macro-segmentation</h3>
<p>A <b>virtual network (VN)</b> is a separate routing domain, implemented as a <b>VRF</b> on the devices. Groups inside one VN can be allowed or denied by the matrix (<b>micro-segmentation</b>), but traffic between VNs is completely isolated unless it passes through a firewall or fusion device (<b>macro-segmentation</b>). A typical design: Campus VN for employees and contractors, Guest VN for visitors, IoT VN for cameras and building systems. In SD-Access, VNs are carried across the fabric in the VXLAN header together with the SGT, as you learned in the SD-Access chapters.</p>

<h3>Other policy types</h3>
<ul><li><b>IP-based access control</b> — for places that cannot use groups yet; Catalyst Center still builds the ACLs centrally.</li>
<li><b>Application policy</b> — QoS by intent. Applications (recognised with NBAR) are sorted into <b>business relevant</b>, <b>default</b> and <b>business irrelevant</b>. Catalyst Center translates that into class maps, DSCP marking and queuing on each platform, so you never type an MQC policy by hand. The QoS module explained the queues underneath.</li>
<li><b>Traffic copy</b> — send a copy of a group's traffic to an analyser (ERSPAN-style), useful for security investigations.</li></ul>

<div class="eg"><p><b>Worked example: Lab 2 rewritten as group policy.</b> The rule in WAN-IN, "Staff may not reach the intranet web server on TCP 80", was a mistake left from a migration. With groups, the intent would be one matrix cell: <b>Employees → Intranet-Web: permit TCP 80 and 443</b>. Staff in VLAN 10 or VLAN 20, wired or wireless, all get the same SGT and the same result. In the lab you fix the IP-based version by removing sequence 10:</p></div>
<pre class="code">R1(config)# ip access-list extended WAN-IN
R1(config-ext-nacl)# no 10
R1(config-ext-nacl)# end
R1# show access-lists WAN-IN</pre>
<pre class="out">Extended IP access list WAN-IN
    <span class="hl">20 permit ip any any (3 matches)</span></pre>

<div class="warn"><p><b>Common mistakes.</b> Expecting group policy to work before ISE integration is complete (no ISE, no SGT assignment, no enforcement). Forgetting that the default cell of the matrix matters: a default "permit" means any pair you forgot is allowed; a default "deny" means you must list everything needed. And assuming VNs can talk to each other directly: they cannot without a route-leaking or firewall design.</p></div>
<div class="exam"><p><b>Exam traps.</b> VN = VRF = macro-segmentation; SGT = scalable group = micro-segmentation. Catalyst Center <b>authors</b> the matrix; <b>ISE</b> holds it and pushes SGACLs; the <b>switch</b> enforces. Application policy classes are business relevant, default and business irrelevant.</p></div>

<div class="scn"><h4>The printer that saw everything</h4><p>A school's security scan showed that lab printers could reach the student records database. The IP ACLs allowed the whole 10.30.0.0/16 because printers and teachers shared a DHCP scope. The team created a Printers scalable group (assigned by ISE profiling), a PCI-style Records group for the database, and set the matrix cell Printers → Records to deny. No readdressing was needed and the next scan was clean.</p><p><b>Lesson:</b> group-based policy separates "who" from "where", which is exactly what flat or shared subnets need.</p></div>

<div class="iv"><p class="q">"What is the difference between a virtual network and a scalable group in Catalyst Center?"</p><p>A VN is a VRF: a separate routing table, isolating whole communities (macro-segmentation), and traffic between VNs needs a fusion router or firewall. A scalable group is a role tag (SGT) inside a VN; the policy matrix controls which groups talk (micro-segmentation). Mention that ISE assigns the SGT and pushes SGACLs, while Catalyst Center is where you author the policy.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IP ACLs tie policy to addressing; group-based policy ties it to identity.</li>
<li>Scalable groups (SGTs), contracts and the policy matrix are authored in Catalyst Center and enforced via ISE SGACLs.</li>
<li>Virtual networks are VRFs for macro-segmentation; groups give micro-segmentation inside a VN.</li>
<li>Application policy turns business relevance into QoS on every platform.</li>
<li>Lab 2's WAN-IN fault is the IP-based version of a one-cell matrix fix.</li>
</ul></div>
`,hi:`
<p>Office building mein security guards yeh yaad nahi rakhte ki har employee kaunse desk number par baithta hai. Woh aapka <b>badge colour</b> check karte hain: blue badge finance floor par jaa sakta hai, visitor badge sirf reception tak. Aap desk badlo, badge phir bhi kaam karta hai. Catalyst Center mein <b>group-based policy</b> bilkul aise hi kaam karti hai: rules follow karte hain ki <i>aap kaun ho</i>, na ki <i>aaj aapka IP address kya hai</i>.</p>

<h3>IP-based ACLs ki problem</h3>
<p>Security likhne ka classic tareeka subnets par based ACL hai, jaise Lab 2 mein R1 par <code>WAN-IN</code>: <code>deny tcp 10.20.20.0 0.0.0.255 host 172.16.50.10 eq 80</code>. Yeh kaam karta hai, lekin policy ko addressing se baandh deta hai. Jab staff naye VLAN mein jaaye, DHCP scopes bade hon, ya wahi user doosri building se Wi-Fi par connect kare, ACL galat ho jaata hai. Bade networks mein hazaaron ACL lines ho jaati hain jinhe koi delete karne ki himmat nahi karta.</p>

<h3>Group-based access control</h3>
<ul><li><b>Scalable groups</b> (ek <b>Scalable Group Tag, SGT</b>, 16-bit number se tagged) roles represent karte hain: Employees, Contractors, Guests, Printers, PCI-Servers.</li>
<li>User ya device <b>ISE</b> par authenticate karte waqt (802.1X, MAB ya web auth) group mein daala jaata hai, identity aur context ke basis par, IP ke basis par nahi.</li>
<li><b>Contract</b> batata hai ki groups ke beech kya allowed hai: permit, deny, ya protocols aur ports ki custom list.</li>
<li><b>Policy matrix</b> source groups versus destination groups ka grid hai, har cell mein ek contract. Aap ise Catalyst Center mein edit karte ho; ISE ise store karta hai aur matching <b>SGACLs</b> switches par push karta hai, jo inhe enforce karte hain.</li></ul>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Policy matrix">
<rect x="20" y="20" width="160" height="36" rx="6" fill="#e2e8f0"/><text x="100" y="43" text-anchor="middle" class="svg-ink" font-size="13">Source → Destination</text>
<rect x="190" y="20" width="140" height="36" rx="6" fill="#bae6fd"/><text x="260" y="43" text-anchor="middle" class="svg-ink" font-size="13">Intranet-Web</text>
<rect x="340" y="20" width="140" height="36" rx="6" fill="#bae6fd"/><text x="410" y="43" text-anchor="middle" class="svg-ink" font-size="13">PCI-Servers</text>
<rect x="490" y="20" width="130" height="36" rx="6" fill="#bae6fd"/><text x="555" y="43" text-anchor="middle" class="svg-ink" font-size="13">Printers</text>
<rect x="20" y="66" width="160" height="36" rx="6" fill="#fde68a"/><text x="100" y="89" text-anchor="middle" class="svg-ink" font-size="13">Employees</text>
<rect x="190" y="66" width="140" height="36" rx="6" fill="#bbf7d0"/><text x="260" y="89" text-anchor="middle" class="svg-ink" font-size="13">permit web</text>
<rect x="340" y="66" width="140" height="36" rx="6" fill="#fed7aa"/><text x="410" y="89" text-anchor="middle" class="svg-ink" font-size="13">deny</text>
<rect x="490" y="66" width="130" height="36" rx="6" fill="#bbf7d0"/><text x="555" y="89" text-anchor="middle" class="svg-ink" font-size="13">permit</text>
<rect x="20" y="112" width="160" height="36" rx="6" fill="#fde68a"/><text x="100" y="135" text-anchor="middle" class="svg-ink" font-size="13">Contractors</text>
<rect x="190" y="112" width="140" height="36" rx="6" fill="#bbf7d0"/><text x="260" y="135" text-anchor="middle" class="svg-ink" font-size="13">permit web</text>
<rect x="340" y="112" width="140" height="36" rx="6" fill="#fed7aa"/><text x="410" y="135" text-anchor="middle" class="svg-ink" font-size="13">deny</text>
<rect x="490" y="112" width="130" height="36" rx="6" fill="#fed7aa"/><text x="555" y="135" text-anchor="middle" class="svg-ink" font-size="13">deny</text>
<rect x="20" y="158" width="160" height="36" rx="6" fill="#fde68a"/><text x="100" y="181" text-anchor="middle" class="svg-ink" font-size="13">Guests</text>
<rect x="190" y="158" width="430" height="36" rx="6" fill="#fed7aa"/><text x="405" y="181" text-anchor="middle" class="svg-ink" font-size="13">deny (internet sirf alag virtual network se)</text>
</svg><p class="cap">Har cell ek contract hai. Nau cells sainkdon subnet-based ACL lines ki jagah le lete hain.</p></div>

<h3>Virtual networks: macro-segmentation</h3>
<p><b>Virtual network (VN)</b> ek alag routing domain hai, devices par <b>VRF</b> ke roop mein implement hota hai. Ek VN ke andar ke groups ko matrix se allow ya deny kiya ja sakta hai (<b>micro-segmentation</b>), lekin VNs ke beech ka traffic poori tarah isolated hota hai jab tak woh firewall ya fusion device se na guzre (<b>macro-segmentation</b>). Typical design: employees aur contractors ke liye Campus VN, visitors ke liye Guest VN, cameras aur building systems ke liye IoT VN. SD-Access mein VNs fabric ke across VXLAN header mein SGT ke saath jaate hain, jaisa aapne SD-Access chapters mein seekha.</p>

<h3>Dusre policy types</h3>
<ul><li><b>IP-based access control</b> — un jagahon ke liye jo abhi groups use nahi kar sakti; Catalyst Center phir bhi ACLs centrally banata hai.</li>
<li><b>Application policy</b> — intent se QoS. Applications (NBAR se pehchaani hui) <b>business relevant</b>, <b>default</b> aur <b>business irrelevant</b> mein bati jaati hain. Catalyst Center ise har platform par class maps, DSCP marking aur queuing mein translate karta hai, taaki aapko kabhi haath se MQC policy type na karni pade. QoS module ne neeche ki queues samjhayi thi.</li>
<li><b>Traffic copy</b> — kisi group ke traffic ki copy analyser ko bhejo (ERSPAN jaisa), security investigations ke liye useful.</li></ul>

<div class="eg"><p><b>Worked example: Lab 2 ko group policy ke roop mein.</b> WAN-IN ka rule, "Staff intranet web server tak TCP 80 par nahi jaa sakta", ek migration se bachi hui galti thi. Groups ke saath intent ek matrix cell hota: <b>Employees → Intranet-Web: permit TCP 80 aur 443</b>. VLAN 10 ho ya VLAN 20, wired ho ya wireless, sab staff ko same SGT aur same result milta. Lab mein aap IP-based version ko sequence 10 hata kar fix karte ho:</p></div>
<pre class="code">R1(config)# ip access-list extended WAN-IN
R1(config-ext-nacl)# no 10
R1(config-ext-nacl)# end
R1# show access-lists WAN-IN</pre>
<pre class="out">Extended IP access list WAN-IN
    <span class="hl">20 permit ip any any (3 matches)</span></pre>

<div class="warn"><p><b>Common galtiyan.</b> ISE integration poora hone se pehle group policy ke kaam karne ki ummeed karna (ISE nahi, to SGT assignment nahi, enforcement nahi). Bhool jaana ki matrix ka default cell matter karta hai: default "permit" ka matlab jo pair bhool gaye woh allowed hai; default "deny" ka matlab jo chahiye sab list karna padega. Aur yeh maan lena ki VNs seedhe aapas mein baat kar sakte hain: route-leaking ya firewall design ke bina nahi kar sakte.</p></div>
<div class="exam"><p><b>Exam traps.</b> VN = VRF = macro-segmentation; SGT = scalable group = micro-segmentation. Catalyst Center matrix <b>likhta</b> hai; <b>ISE</b> use rakhta hai aur SGACLs push karta hai; <b>switch</b> enforce karta hai. Application policy classes hain business relevant, default aur business irrelevant.</p></div>

<div class="scn"><h4>Woh printer jo sab kuch dekh sakta tha</h4><p>Ek school ke security scan ne dikhaya ki lab printers student records database tak pahunch sakte the. IP ACLs poore 10.30.0.0/16 ko allow karte the kyunki printers aur teachers ek hi DHCP scope share karte the. Team ne Printers scalable group banaya (ISE profiling se assign), database ke liye PCI-style Records group, aur matrix cell Printers → Records ko deny kiya. Koi readdressing nahi karni padi aur agla scan saaf tha.</p><p><b>Lesson:</b> group-based policy "kaun" ko "kahan" se alag karti hai, jo flat ya shared subnets ko bilkul chahiye.</p></div>

<div class="iv"><p class="q">"Catalyst Center mein virtual network aur scalable group mein kya farak hai?"</p><p>VN ek VRF hai: alag routing table, poori communities ko isolate karta hai (macro-segmentation), aur VNs ke beech traffic ke liye fusion router ya firewall chahiye. Scalable group VN ke andar ek role tag (SGT) hai; policy matrix control karta hai ki kaunse groups baat karein (micro-segmentation). Batao ki ISE SGT assign karta hai aur SGACLs push karta hai, jabki Catalyst Center woh jagah hai jahan policy likhi jaati hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IP ACLs policy ko addressing se baandhte hain; group-based policy use identity se baandhti hai.</li>
<li>Scalable groups (SGTs), contracts aur policy matrix Catalyst Center mein likhe jaate hain aur ISE SGACLs se enforce hote hain.</li>
<li>Virtual networks macro-segmentation ke liye VRFs hain; groups VN ke andar micro-segmentation dete hain.</li>
<li>Application policy business relevance ko har platform par QoS mein badalti hai.</li>
<li>Lab 2 ka WAN-IN fault ek-cell matrix fix ka IP-based version hai.</li>
</ul></div>
`}};export{e as default};