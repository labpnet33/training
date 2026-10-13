var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You now know how a FortiGate rewrites addresses in both directions, how to prove it with the session table, and how to publish a server without opening more than needed. This chapter is your quick revision before an exam or interview.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="NAT module map">
<rect x="10" y="20" width="190" height="70" rx="10" fill="#bae6fd"/><text x="105" y="50" text-anchor="middle" class="svg-ink" font-size="13">Source NAT (PAT)</text><text x="105" y="70" text-anchor="middle" class="svg-muted" font-size="12">nat enable, egress IP</text>
<rect x="225" y="20" width="190" height="70" rx="10" fill="#bbf7d0"/><text x="320" y="50" text-anchor="middle" class="svg-ink" font-size="13">IP pool</text><text x="320" y="70" text-anchor="middle" class="svg-muted" font-size="12">overload, one-to-one ...</text>
<rect x="440" y="20" width="190" height="70" rx="10" fill="#ddd6fe"/><text x="535" y="50" text-anchor="middle" class="svg-ink" font-size="13">VIP (DNAT)</text><text x="535" y="70" text-anchor="middle" class="svg-muted" font-size="12">extip, mappedip</text>
<rect x="10" y="110" width="190" height="70" rx="10" fill="#fde68a"/><text x="105" y="140" text-anchor="middle" class="svg-ink" font-size="13">Port forwarding</text><text x="105" y="160" text-anchor="middle" class="svg-muted" font-size="12">extport to mappedport</text>
<rect x="225" y="110" width="190" height="70" rx="10" fill="#fed7aa"/><text x="320" y="140" text-anchor="middle" class="svg-ink" font-size="13">Central NAT</text><text x="320" y="160" text-anchor="middle" class="svg-muted" font-size="12">central-snat-map</text>
<rect x="440" y="110" width="190" height="70" rx="10" fill="#e2e8f0"/><text x="535" y="140" text-anchor="middle" class="svg-ink" font-size="13">Proof</text><text x="535" y="160" text-anchor="middle" class="svg-muted" font-size="12">session list, lookup</text>
</svg><p class="cap">Six topics. Each one maps to a command you practised.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Explain source NAT versus destination NAT and which one a VIP performs.</li>
<li>Turn on source NAT with <code>nat enable</code> and say which address is used by default.</li>
<li>Create an IP pool, attach it to a policy (<code>ippool enable</code>, <code>poolname</code>) and prove it in the session table.</li>
<li>Name the four IP pool types and the default (overload).</li>
<li>Create a static VIP and a port-forwarding VIP; explain <code>extip</code>, <code>extintf</code>, <code>mappedip</code>, <code>extport</code>, <code>mappedport</code>.</li>
<li>Write the inbound policy: VIP as destination, internal interface as <code>dstintf</code>, mapped-port service, NAT off.</li>
<li>State the order: DNAT, route, policy, SNAT.</li>
<li>Read SOURCE, SOURCE-NAT, DESTINATION and DESTINATION-NAT in <code>get system session list</code>.</li>
<li>Explain why internal users may not reach a public VIP and two ways to fix it.</li>
<li>Describe central NAT and when to use it (reference topic).</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>SNAT</dt><dd>Source NAT: rewriting the source address, usually for traffic going out.</dd>
<dt>DNAT</dt><dd>Destination NAT: rewriting the destination, used to publish servers.</dd>
<dt>PAT</dt><dd>Port address translation: many hosts share an address by using different source ports.</dd>
<dt>IP pool</dt><dd>A named range of addresses used as translated source.</dd>
<dt>VIP</dt><dd>Virtual IP object that maps an external address (and port) to an internal one.</dd>
<dt>Port forwarding</dt><dd>A VIP that maps one external port to one internal port.</dd>
<dt>Hairpin NAT</dt><dd>Internal clients reaching a server through its public address via the firewall.</dd>
<dt>Central NAT</dt><dd>Mode where source NAT is defined in <code>central-snat-map</code>, not in policies.</dd>
<dt>Proxy ARP</dt><dd>The FortiGate answering ARP for pool and VIP addresses on a connected subnet.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Answer</th></tr>
<tr><td>Default SNAT source</td><td>Address of the egress interface, with port translation</td></tr>
<tr><td>Default IP pool type</td><td>overload</td></tr>
<tr><td>Where a VIP is used</td><td>As the destination address of a firewall policy</td></tr>
<tr><td>Policy service for a port-forward VIP</td><td>The mapped port (DNAT happens first)</td></tr>
<tr><td>Policy dstintf for a VIP policy</td><td>The interface towards the real server</td></tr>
<tr><td>NAT on the inbound VIP policy</td><td>Normally disabled</td></tr>
<tr><td>VIP applies on</td><td>The interface named in <code>extintf</code> (<code>any</code> = all)</td></tr>
<tr><td>Central NAT switch</td><td><code>config system settings</code>, <code>set central-nat enable</code></td></tr>
<tr><td>A policy change affects</td><td>New sessions; old sessions keep their translation</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! source NAT</span>
config firewall policy
    edit 1
        set nat enable
<span class="c">! pool</span>
config firewall ippool
    edit NAT-POOL
        set startip 203.0.113.5
        set endip 203.0.113.6
config firewall policy
    edit 1
        set ippool enable
        set poolname NAT-POOL
<span class="c">! VIP with port forwarding</span>
config firewall vip
    edit WEB-VIP
        set extip 203.0.113.3
        set mappedip 10.0.2.10
        set extintf port1
        set portforward enable
        set extport 8080
        set mappedport 80
<span class="c">! proof</span>
get system session list
diagnose sys session list
diagnose firewall iprope lookup 8.8.8.8 50000 203.0.113.3 8080 tcp port1
show firewall vip
get firewall ippool</pre>

<h3>Practice</h3>
<p>Practise in the three labs of this module: <b>Publish the web server with a virtual IP</b>, <b>Source NAT with an IP pool</b> and <b>Ticket: the published server is unreachable</b>. Central NAT has no lab here because the simulator runs policy-based NAT only. For the same NAT ideas on another vendor, work through <code>sec-asa-nat</code>. Next, <code>nse4-auth</code> adds users and groups to firewall policies.</p>

<div class="eg"><p><b>Worked example for revision.</b> Say aloud: "A customer on the internet opens 203.0.113.3 on port 8080. The packet arrives on port1, the VIP matches and the destination becomes 10.0.2.10 port 80. Routing sends it to port3. The policy WAN-to-WEB matches with the VIP as destination and service HTTP, so it is accepted and a session is created. The server replies and the session translates the source back to 203.0.113.3:8080." If you can say this, you can answer most NAT questions.</p></div>

<div class="warn"><p><b>Last-minute reminders.</b> The policy still decides permission. A VIP without a policy is useless. The service in the policy is the mapped port. NAT between internal networks is usually off. Test blocked ports as well as allowed ones.</p></div>
<div class="exam"><p><b>Exam trap summary.</b> "Pool replaces the source only." "VIP is used in the policy destination." "Mapped port, not external port, in the service." "The session keeps its old translation." "Central NAT does not replace policies."</p></div>

<div class="scn"><h4>The one-hour handover</h4><p>A new engineer inherited a branch FortiGate with no documentation. In an hour she listed the VIPs (<code>show firewall vip</code>), the pools, the policies that referenced them, and drew the translation for each published server from the session table. She found one VIP with all ports mapped and a policy with service ALL. She restricted the service and logged it. The handover document was written from the command outputs.</p><p><b>Lesson:</b> the CLI tells you the whole NAT design if you ask in the right order.</p></div>

<div class="iv"><p class="q">"Describe the packet flow of an inbound connection to a published server."</p><p>It arrives on the WAN interface, the VIP matches and rewrites the destination (DNAT), routing picks the DMZ interface, the policy with the VIP as destination is evaluated, the session is created, and replies are translated back automatically. Mention that NAT is usually off on that policy, the service is the mapped port, and the session list proves it.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SNAT on the policy (PAT by default), IP pools for chosen addresses, VIPs for DNAT.</li>
<li>Order of operations: DNAT, routing, policy, SNAT.</li>
<li>Port forwarding policies use the mapped port; NAT is normally off inbound.</li>
<li>Session table columns prove the translation; the lookup proves the policy.</li>
<li>Central NAT is a table-based alternative for source NAT; policies still decide permission.</li>
</ul></div>
`,hi:`
<p>Ab aap jaante ho ki FortiGate dono directions mein addresses kaise rewrite karta hai, session table se use kaise saabit karte hain, aur server ko zaroorat se zyada khole bina kaise publish karte hain. Yeh chapter exam ya interview se pehle aapki quick revision hai.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="NAT module map">
<rect x="10" y="20" width="190" height="70" rx="10" fill="#bae6fd"/><text x="105" y="50" text-anchor="middle" class="svg-ink" font-size="13">Source NAT (PAT)</text><text x="105" y="70" text-anchor="middle" class="svg-muted" font-size="12">nat enable, egress IP</text>
<rect x="225" y="20" width="190" height="70" rx="10" fill="#bbf7d0"/><text x="320" y="50" text-anchor="middle" class="svg-ink" font-size="13">IP pool</text><text x="320" y="70" text-anchor="middle" class="svg-muted" font-size="12">overload, one-to-one ...</text>
<rect x="440" y="20" width="190" height="70" rx="10" fill="#ddd6fe"/><text x="535" y="50" text-anchor="middle" class="svg-ink" font-size="13">VIP (DNAT)</text><text x="535" y="70" text-anchor="middle" class="svg-muted" font-size="12">extip, mappedip</text>
<rect x="10" y="110" width="190" height="70" rx="10" fill="#fde68a"/><text x="105" y="140" text-anchor="middle" class="svg-ink" font-size="13">Port forwarding</text><text x="105" y="160" text-anchor="middle" class="svg-muted" font-size="12">extport se mappedport</text>
<rect x="225" y="110" width="190" height="70" rx="10" fill="#fed7aa"/><text x="320" y="140" text-anchor="middle" class="svg-ink" font-size="13">Central NAT</text><text x="320" y="160" text-anchor="middle" class="svg-muted" font-size="12">central-snat-map</text>
<rect x="440" y="110" width="190" height="70" rx="10" fill="#e2e8f0"/><text x="535" y="140" text-anchor="middle" class="svg-ink" font-size="13">Proof</text><text x="535" y="160" text-anchor="middle" class="svg-muted" font-size="12">session list, lookup</text>
</svg><p class="cap">Chhe topics. Har ek us command se map hota hai jo aapne practise kiya.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Source NAT aur destination NAT mein fark samjhao aur batao ki VIP kaunsa karta hai.</li>
<li><code>nat enable</code> se source NAT on karo aur batao ki default mein kaunsa address use hota hai.</li>
<li>IP pool banao, use policy se attach karo (<code>ippool enable</code>, <code>poolname</code>) aur session table mein saabit karo.</li>
<li>IP pool ke chaar types aur default (overload) batao.</li>
<li>Static VIP aur port-forwarding VIP banao; <code>extip</code>, <code>extintf</code>, <code>mappedip</code>, <code>extport</code>, <code>mappedport</code> samjhao.</li>
<li>Inbound policy likho: VIP destination, internal interface <code>dstintf</code>, mapped-port service, NAT off.</li>
<li>Order batao: DNAT, route, policy, SNAT.</li>
<li><code>get system session list</code> mein SOURCE, SOURCE-NAT, DESTINATION aur DESTINATION-NAT padho.</li>
<li>Samjhao ki internal users public VIP kyun nahi pahunch paate aur fix ke do tareeke.</li>
<li>Central NAT aur use kab karna hai describe karo (reference topic).</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>SNAT</dt><dd>Source NAT: source address rewrite karna, aam taur par bahar jaane wale traffic ke liye.</dd>
<dt>DNAT</dt><dd>Destination NAT: destination rewrite karna, servers publish karne ke liye.</dd>
<dt>PAT</dt><dd>Port address translation: kai hosts alag source ports use karke ek address share karte hain.</dd>
<dt>IP pool</dt><dd>Addresses ki named range jo translated source ke roop mein use hoti hai.</dd>
<dt>VIP</dt><dd>Virtual IP object jo external address (aur port) ko internal se map karta hai.</dd>
<dt>Port forwarding</dt><dd>VIP jo ek external port ko ek internal port se map karta hai.</dd>
<dt>Hairpin NAT</dt><dd>Internal clients firewall ke through server ke public address se use reach karte hain.</dd>
<dt>Central NAT</dt><dd>Mode jisme source NAT policies mein nahi, <code>central-snat-map</code> mein define hota hai.</dd>
<dt>Proxy ARP</dt><dd>Connected subnet par pool aur VIP addresses ke liye FortiGate ka ARP jawab dena.</dd>
</dl>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Jawab</th></tr>
<tr><td>Default SNAT source</td><td>Egress interface ka address, port translation ke saath</td></tr>
<tr><td>Default IP pool type</td><td>overload</td></tr>
<tr><td>VIP kahan use hota hai</td><td>Firewall policy ke destination address ke roop mein</td></tr>
<tr><td>Port-forward VIP ke liye policy service</td><td>Mapped port (DNAT pehle hota hai)</td></tr>
<tr><td>VIP policy ka dstintf</td><td>Real server ki taraf ka interface</td></tr>
<tr><td>Inbound VIP policy par NAT</td><td>Aam taur par disabled</td></tr>
<tr><td>VIP kahan apply hota hai</td><td><code>extintf</code> mein likhe interface par (<code>any</code> = sab)</td></tr>
<tr><td>Central NAT switch</td><td><code>config system settings</code>, <code>set central-nat enable</code></td></tr>
<tr><td>Policy change kispar asar karta hai</td><td>Naye sessions par; purane sessions apni translation rakhte hain</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! source NAT</span>
config firewall policy
    edit 1
        set nat enable
<span class="c">! pool</span>
config firewall ippool
    edit NAT-POOL
        set startip 203.0.113.5
        set endip 203.0.113.6
config firewall policy
    edit 1
        set ippool enable
        set poolname NAT-POOL
<span class="c">! VIP with port forwarding</span>
config firewall vip
    edit WEB-VIP
        set extip 203.0.113.3
        set mappedip 10.0.2.10
        set extintf port1
        set portforward enable
        set extport 8080
        set mappedport 80
<span class="c">! proof</span>
get system session list
diagnose sys session list
diagnose firewall iprope lookup 8.8.8.8 50000 203.0.113.3 8080 tcp port1
show firewall vip
get firewall ippool</pre>

<h3>Practice</h3>
<p>Is module ke teen labs mein practise karo: <b>Virtual IP se web server publish karo</b>, <b>IP pool ke saath source NAT</b> aur <b>Ticket: published server unreachable hai</b>. Central NAT ka yahan koi lab nahi hai kyunki simulator sirf policy-based NAT chalata hai. Doosre vendor par wahi NAT ideas ke liye <code>sec-asa-nat</code> karo. Agla, <code>nse4-auth</code> firewall policies mein users aur groups jodta hai.</p>

<div class="eg"><p><b>Revision ke liye worked example.</b> Zor se bolo: "Internet par ek customer 203.0.113.3 ka port 8080 kholta hai. Packet port1 par aata hai, VIP match hota hai aur destination 10.0.2.10 port 80 ban jaata hai. Routing use port3 bhejti hai. Policy WAN-to-WEB VIP destination aur service HTTP ke saath match karti hai, isliye accept hoti hai aur session banta hai. Server reply karta hai aur session source ko wapas 203.0.113.3:8080 translate karta hai." Yeh bol sako to zyadatar NAT sawalon ka jawab de sakte ho.</p></div>

<div class="warn"><p><b>Last-minute reminders.</b> Policy phir bhi permission decide karti hai. Policy ke bina VIP bekaar hai. Policy ki service mapped port hoti hai. Internal networks ke beech NAT aam taur par off hota hai. Allowed ke saath blocked ports bhi test karo.</p></div>
<div class="exam"><p><b>Exam trap summary.</b> "Pool sirf source replace karta hai." "VIP policy destination mein use hota hai." "Service mein mapped port, external nahi." "Session apni purani translation rakhta hai." "Central NAT policies ko replace nahi karta."</p></div>

<div class="scn"><h4>Ek ghante ka handover</h4><p>Ek nayi engineer ko bina documentation ka branch FortiGate virasat mein mila. Ek ghante mein usne VIPs (<code>show firewall vip</code>), pools, unhe refer karne wali policies list ki, aur session table se har published server ki translation draw ki. Use ek VIP mila jisme saare ports mapped the aur service ALL wali policy. Usne service restrict ki aur logging on ki. Handover document command outputs se likha gaya.</p><p><b>Lesson:</b> sahi order mein poochho to CLI poora NAT design bata deta hai.</p></div>

<div class="iv"><p class="q">"Published server tak inbound connection ka packet flow describe karo."</p><p>Woh WAN interface par aata hai, VIP match karke destination rewrite karta hai (DNAT), routing DMZ interface chunti hai, VIP destination wali policy evaluate hoti hai, session banta hai, aur replies apne aap wapas translate hote hain. Batao ki us policy par NAT aam taur par off hota hai, service mapped port hoti hai, aur session list saabit karti hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Policy par SNAT (default PAT), chune hue addresses ke liye IP pools, DNAT ke liye VIPs.</li>
<li>Operations ka order: DNAT, routing, policy, SNAT.</li>
<li>Port forwarding policies mapped port use karti hain; inbound NAT aam taur par off.</li>
<li>Session table columns translation saabit karte hain; lookup policy saabit karta hai.</li>
<li>Central NAT source NAT ka table-based alternative hai; policies phir bhi permission decide karti hain.</li>
</ul></div>
`}};export{e as default};