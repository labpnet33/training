var e={id:`summary-exam-checklist`,h:{en:`Summary, cheat-sheet and exam checklist`,hi:`Summary, cheat-sheet aur exam checklist`},body:{en:`
<p><b>What you can now do.</b> You can open a factory-default PAN-OS firewall, name it, create management profiles, bring up two Layer 3 interfaces with zones and a virtual router, add a default route, commit in safe steps, prove the data plane with a sourced ping, and troubleshoot a dead interface by following a fixed workflow. Those are the building blocks for everything else in the track: policy, NAT, subinterfaces, routing, VPN, profiles and high availability all assume these foundations.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Build order">
<rect x="10" y="20" width="110" height="55" rx="8" fill="#fde68a"/><text x="65" y="45" text-anchor="middle" class="svg-ink" font-size="13">1 Hostname</text><text x="65" y="63" text-anchor="middle" class="svg-muted" font-size="12">commit</text>
<rect x="135" y="20" width="110" height="55" rx="8" fill="#fde68a"/><text x="190" y="45" text-anchor="middle" class="svg-ink" font-size="13">2 Profiles</text><text x="190" y="63" text-anchor="middle" class="svg-muted" font-size="12">ping, mgmt</text>
<rect x="260" y="20" width="110" height="55" rx="8" fill="#bae6fd"/><text x="315" y="45" text-anchor="middle" class="svg-ink" font-size="13">3 Interfaces</text><text x="315" y="63" text-anchor="middle" class="svg-muted" font-size="12">IP + profile</text>
<rect x="385" y="20" width="110" height="55" rx="8" fill="#bae6fd"/><text x="440" y="45" text-anchor="middle" class="svg-ink" font-size="13">4 VR + zones</text><text x="440" y="63" text-anchor="middle" class="svg-muted" font-size="12">bind</text>
<rect x="510" y="20" width="120" height="55" rx="8" fill="#bbf7d0"/><text x="570" y="45" text-anchor="middle" class="svg-ink" font-size="13">5 Route</text><text x="570" y="63" text-anchor="middle" class="svg-muted" font-size="12">default to ISP</text>
<rect x="135" y="100" width="170" height="55" rx="8" fill="#ddd6fe"/><text x="220" y="125" text-anchor="middle" class="svg-ink" font-size="13">6 Policy + NAT</text><text x="220" y="143" text-anchor="middle" class="svg-muted" font-size="12">next module</text>
<rect x="335" y="100" width="170" height="55" rx="8" fill="#fed7aa"/><text x="420" y="125" text-anchor="middle" class="svg-ink" font-size="13">7 Verify</text><text x="420" y="143" text-anchor="middle" class="svg-muted" font-size="12">interface, route, session</text>
</svg><p class="cap">Build in this order, commit in small steps, verify at the end of each step.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>I can switch between operational and configure mode and read the [edit] line.</li>
<li>I can use set, delete, edit, up, top, show and run.</li>
<li>I can explain candidate versus running and read validation errors.</li>
<li>I can use show jobs all and revert config.</li>
<li>I can create an interface management profile and say what it controls.</li>
<li>I can configure a Layer 3 interface with IP, virtual router and zone.</li>
<li>I can add a default route and test with ping source.</li>
<li>I can write one outbound security rule and one source NAT rule.</li>
<li>I can fix an interface with zone N/A and forwarding N/A.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Operational / configure mode</dt><dd>Look and test (&gt;) versus edit the candidate (#).</dd>
<dt>Candidate / running</dt><dd>Draft versus enforced configuration.</dd>
<dt>Commit</dt><dd>Validate the candidate and make it running; all or nothing.</dd>
<dt>Interface management profile</dt><dd>Services the firewall itself answers on one interface.</dd>
<dt>Virtual router</dt><dd>Routing instance with routing table; interfaces join it.</dd>
<dt>Zone</dt><dd>Security grouping of interfaces; the "from" and "to" of rules.</dd>
<dt>Static route</dt><dd>Manually configured prefix, next hop and egress interface.</dd>
<dt>Source NAT (dynamic IP and port)</dt><dd>Translates private sources to the interface address.</dd>
</dl>

<h3>Most tested facts</h3>
<ul>
<li>set writes the candidate; nothing is enforced until commit.</li>
<li>One invalid item fails the whole commit; nothing is applied.</li>
<li>A routed interface needs IP, virtual router and zone. N/A in show interface all means a missing binding.</li>
<li>Data interfaces answer ping, SSH and HTTPS only via an interface management profile.</li>
<li>Plain ping uses the management interface; ping source tests the data plane.</li>
<li>Intrazone-default allows, interzone-default denies.</li>
<li>Security policy and NAT are separate rulebases; both are needed for outbound internet.</li>
</ul>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c"># operational</span>
configure
show system info
show interface all
show interface ethernet1/2
show routing route
show routing route type static
show arp all
show session all
show log traffic
show jobs all
show running security-policy
show running nat-policy
show counter global filter delta yes severity drop
test security-policy-match from trust to untrust source 10.0.1.10 destination 8.8.8.8 protocol 6 destination-port 443
ping source 203.0.113.2 host 8.8.8.8
set cli config-output-format set
<span class="c"># configure</span>
set deviceconfig system hostname NK-PUNE-PA
set network profiles interface-management-profile allow-ping ping yes
set network interface ethernet ethernet1/2 layer3 ip 10.0.1.1/24 interface-management-profile mgmt-lan
set network virtual-router default interface [ ethernet1/1 ethernet1/2 ]
set zone trust network layer3 ethernet1/2
set network virtual-router default routing-table ip static-route default destination 0.0.0.0/0 nexthop ip-address 203.0.113.1 interface ethernet1/1
commit
revert config</pre>

<h3>Troubleshooting map</h3>
<table class="cmp"><tr><th>Symptom</th><th>Most likely missing</th><th>Check</th></tr>
<tr><td>Host says "not reachable" to the gateway</td><td>IP on the interface, link, cabling</td><td>show interface all, show arp all</td></tr>
<tr><td>Timeout to the firewall's own IP</td><td>Management profile with ping</td><td>show interface (profile line), counters</td></tr>
<tr><td>Zone or forwarding N/A</td><td>Zone or virtual router membership</td><td>show interface all</td></tr>
<tr><td>Firewall ping to the internet loses all packets</td><td>Default route or ISP link</td><td>show routing route, show arp all</td></tr>
<tr><td>Users cannot pass through</td><td>Security rule or NAT</td><td>test security-policy-match, show session all</td></tr></table>

<div class="warn"><p><b>Common mistake.</b> Treating the exam as a list of commands. The questions describe a symptom and ask which object is missing. Study the table above until you can fill it in from memory.</p></div>
<div class="exam"><p><b>Exam trap.</b> Candidate versus running, management profile versus security policy, zone versus virtual router: these three pairs produce most wrong answers. Check the current official exam guide for the full list of topics.</p></div>

<div class="scn"><h4>The interview whiteboard</h4><p>A candidate was asked to bring up a firewall with two interfaces on a whiteboard. She wrote the five bindings (IP, profile, virtual router, zone, route), said commit in stages, and listed the verification commands. She did not know a single advanced feature but showed a method. She got the offer.</p><p><b>Lesson:</b> method and verification impress more than memorised syntax.</p></div>

<div class="iv"><p class="q">"Summarise how you configure and verify a basic Layer 3 deployment on PAN-OS."</p><p>Set the hostname and commit. Create management profiles. Configure interface IPs and attach profiles. Add interfaces to the virtual router and zones. Add a default route. Add security and NAT rules. Commit in stages. Verify with show interface all, show routing route, ping source, test security-policy-match and show session all.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Build order: hostname, profiles, interfaces, virtual router and zones, route, policy and NAT.</li>
<li>Commit small, verify each step.</li>
<li>Every missing binding has its own symptom; learn the map.</li>
<li>Candidate versus running, profile versus policy, zone versus virtual router.</li>
<li>Next in the track: pan-policy, then pan-nat and pan-vlans.</li>
</ul></div>
`,hi:`
<p><b>Ab aap kya kar sakte ho.</b> Aap factory-default PAN-OS firewall khol sakte ho, use naam de sakte ho, management profiles bana sakte ho, zones aur virtual router ke saath do Layer 3 interfaces up kar sakte ho, default route jod sakte ho, safe steps mein commit kar sakte ho, sourced ping se data plane saabit kar sakte ho, aur fixed workflow follow karke dead interface troubleshoot kar sakte ho. Track ki baaki sab cheezon ki yahi buniyaad hai: policy, NAT, subinterfaces, routing, VPN, profiles aur high availability sab inhi foundations ko maan kar chalte hain.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Build order">
<rect x="10" y="20" width="110" height="55" rx="8" fill="#fde68a"/><text x="65" y="45" text-anchor="middle" class="svg-ink" font-size="13">1 Hostname</text><text x="65" y="63" text-anchor="middle" class="svg-muted" font-size="12">commit</text>
<rect x="135" y="20" width="110" height="55" rx="8" fill="#fde68a"/><text x="190" y="45" text-anchor="middle" class="svg-ink" font-size="13">2 Profiles</text><text x="190" y="63" text-anchor="middle" class="svg-muted" font-size="12">ping, mgmt</text>
<rect x="260" y="20" width="110" height="55" rx="8" fill="#bae6fd"/><text x="315" y="45" text-anchor="middle" class="svg-ink" font-size="13">3 Interfaces</text><text x="315" y="63" text-anchor="middle" class="svg-muted" font-size="12">IP + profile</text>
<rect x="385" y="20" width="110" height="55" rx="8" fill="#bae6fd"/><text x="440" y="45" text-anchor="middle" class="svg-ink" font-size="13">4 VR + zones</text><text x="440" y="63" text-anchor="middle" class="svg-muted" font-size="12">bind</text>
<rect x="510" y="20" width="120" height="55" rx="8" fill="#bbf7d0"/><text x="570" y="45" text-anchor="middle" class="svg-ink" font-size="13">5 Route</text><text x="570" y="63" text-anchor="middle" class="svg-muted" font-size="12">ISP ki taraf default</text>
<rect x="135" y="100" width="170" height="55" rx="8" fill="#ddd6fe"/><text x="220" y="125" text-anchor="middle" class="svg-ink" font-size="13">6 Policy + NAT</text><text x="220" y="143" text-anchor="middle" class="svg-muted" font-size="12">agla module</text>
<rect x="335" y="100" width="170" height="55" rx="8" fill="#fed7aa"/><text x="420" y="125" text-anchor="middle" class="svg-ink" font-size="13">7 Verify</text><text x="420" y="143" text-anchor="middle" class="svg-muted" font-size="12">interface, route, session</text>
</svg><p class="cap">Is order mein build karo, chhote steps mein commit karo, har step ke ant mein verify karo.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Main operational aur configure mode ke beech switch kar sakta hoon aur [edit] line padh sakta hoon.</li>
<li>Main set, delete, edit, up, top, show aur run use kar sakta hoon.</li>
<li>Main candidate versus running explain kar sakta hoon aur validation errors padh sakta hoon.</li>
<li>Main show jobs all aur revert config use kar sakta hoon.</li>
<li>Main interface management profile bana sakta hoon aur bata sakta hoon woh kya control karta hai.</li>
<li>Main IP, virtual router aur zone ke saath Layer 3 interface configure kar sakta hoon.</li>
<li>Main default route jod sakta hoon aur ping source se test kar sakta hoon.</li>
<li>Main ek outbound security rule aur ek source NAT rule likh sakta hoon.</li>
<li>Main zone N/A aur forwarding N/A wala interface fix kar sakta hoon.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Operational / configure mode</dt><dd>Dekho aur test karo (&gt;) versus candidate edit karo (#).</dd>
<dt>Candidate / running</dt><dd>Draft versus enforce hoti configuration.</dd>
<dt>Commit</dt><dd>Candidate validate karke running banao; all or nothing.</dd>
<dt>Interface management profile</dt><dd>Ek interface par firewall khud kaunsi services ka jawab deta hai.</dd>
<dt>Virtual router</dt><dd>Routing table wala routing instance; interfaces uska hissa bante hain.</dd>
<dt>Zone</dt><dd>Interfaces ka security grouping; rules ka "from" aur "to".</dd>
<dt>Static route</dt><dd>Haath se configure kiya prefix, next hop aur egress interface.</dd>
<dt>Source NAT (dynamic IP and port)</dt><dd>Private sources ko interface address mein translate karta hai.</dd>
</dl>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<ul>
<li>set candidate likhta hai; commit tak kuch enforce nahi hota.</li>
<li>Ek invalid item poora commit fail karta hai; kuch apply nahi hota.</li>
<li>Routed interface ko IP, virtual router aur zone chahiye. show interface all mein N/A matlab missing binding.</li>
<li>Data interfaces ping, SSH aur HTTPS ka jawab sirf interface management profile se dete hain.</li>
<li>Plain ping management interface use karta hai; ping source data plane test karta hai.</li>
<li>Intrazone-default allow karta hai, interzone-default deny karta hai.</li>
<li>Security policy aur NAT alag rulebases hain; outbound internet ke liye dono chahiye.</li>
</ul>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c"># operational</span>
configure
show system info
show interface all
show interface ethernet1/2
show routing route
show routing route type static
show arp all
show session all
show log traffic
show jobs all
show running security-policy
show running nat-policy
show counter global filter delta yes severity drop
test security-policy-match from trust to untrust source 10.0.1.10 destination 8.8.8.8 protocol 6 destination-port 443
ping source 203.0.113.2 host 8.8.8.8
set cli config-output-format set
<span class="c"># configure</span>
set deviceconfig system hostname NK-PUNE-PA
set network profiles interface-management-profile allow-ping ping yes
set network interface ethernet ethernet1/2 layer3 ip 10.0.1.1/24 interface-management-profile mgmt-lan
set network virtual-router default interface [ ethernet1/1 ethernet1/2 ]
set zone trust network layer3 ethernet1/2
set network virtual-router default routing-table ip static-route default destination 0.0.0.0/0 nexthop ip-address 203.0.113.1 interface ethernet1/1
commit
revert config</pre>

<h3>Troubleshooting map</h3>
<table class="cmp"><tr><th>Symptom</th><th>Sabse likely missing</th><th>Check</th></tr>
<tr><td>Host gateway ko "not reachable" kehta hai</td><td>Interface par IP, link, cabling</td><td>show interface all, show arp all</td></tr>
<tr><td>Firewall ke apne IP tak timeout</td><td>Ping wala management profile</td><td>show interface (profile line), counters</td></tr>
<tr><td>Zone ya forwarding N/A</td><td>Zone ya virtual router membership</td><td>show interface all</td></tr>
<tr><td>Firewall se internet ping mein poora loss</td><td>Default route ya ISP link</td><td>show routing route, show arp all</td></tr>
<tr><td>Users through nahi ja paate</td><td>Security rule ya NAT</td><td>test security-policy-match, show session all</td></tr></table>

<div class="warn"><p><b>Common mistake.</b> Exam ko commands ki list samajhna. Sawaal symptom batate hain aur poochte hain kaunsa object missing hai. Upar ki table ko tab tak padho jab tak aap use yaad se bhar na sako.</p></div>
<div class="exam"><p><b>Exam trap.</b> Candidate versus running, management profile versus security policy, zone versus virtual router: yeh teen jodiyaan zyadatar galat jawab banati hain. Topics ki poori list ke liye current official exam guide dekho.</p></div>

<div class="scn"><h4>Interview whiteboard</h4><p>Ek candidate se whiteboard par do interfaces wala firewall up karne ko kaha gaya. Usne paanch bindings likhi (IP, profile, virtual router, zone, route), kaha ki stages mein commit karoge, aur verification commands list kiye. Usse ek bhi advanced feature nahi aata tha lekin usne method dikhaya. Use offer mila.</p><p><b>Lesson:</b> method aur verification ratti hui syntax se zyada impress karte hain.</p></div>

<div class="iv"><p class="q">"Basic Layer 3 deployment PAN-OS par kaise configure aur verify karte ho, summary do."</p><p>Hostname set karke commit karo. Management profiles banao. Interface IPs configure karo aur profiles attach karo. Interfaces ko virtual router aur zones mein daalo. Default route jodo. Security aur NAT rules jodo. Stages mein commit karo. show interface all, show routing route, ping source, test security-policy-match aur show session all se verify karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Build order: hostname, profiles, interfaces, virtual router aur zones, route, policy aur NAT.</li>
<li>Chhote commits, har step verify.</li>
<li>Har missing binding ka apna symptom hai; map seekho.</li>
<li>Candidate versus running, profile versus policy, zone versus virtual router.</li>
<li>Track mein aage: pan-policy, phir pan-nat aur pan-vlans.</li>
</ul></div>
`}};export{e as default};