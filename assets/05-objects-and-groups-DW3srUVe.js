var e={id:`objects`,h:{en:`Network and service objects, object-groups and nesting`,hi:`Network aur service objects, object-groups aur nesting`},body:{en:`
<p>Raw IP addresses in ACLs are hard to read and harder to change. Objects give every host, subnet and service a <b>name</b>, and object-groups bundle several of them. A good ASA config reads almost like a policy document: "permit web to PUBLIC-SERVERS from any".</p>

<h3>The analogy: contacts and WhatsApp groups</h3>
<p>You do not type your friend's phone number every time you message them; you save it once as a <b>contact</b> (an object). When you want to message five friends at once, you create a <b>group</b> (an object-group). If a friend changes their number, you update one contact and every group containing them is updated automatically.</p>

<h3>Network objects: one thing each</h3>
<p>A <code>object network</code> holds exactly <b>one</b> of: a host, a subnet, a range or an FQDN. It can also carry one Auto NAT rule, which is how WEB and MAIL are published in the lab.</p>
<pre class="code">object network WEB
 host 10.0.2.10
 nat (dmz,outside) static 203.0.113.3
object network MAIL
 host 10.0.2.25
 nat (dmz,outside) static 203.0.113.4
object network DMZ-NET
 subnet 10.0.2.0 255.255.255.0
object network SCAN-POOL
 range 198.51.100.200 198.51.100.210
<span class="c">! FQDN objects need DNS configured on the ASA (dns domain-lookup)</span>
object network PARTNER-PORTAL
 fqdn portal.partner.example</pre>

<h3>Service objects: protocol plus ports</h3>
<pre class="code">object service SSH-ALT
 service tcp destination eq 2222
object service WEB-8443
 service tcp destination eq 8443
<span class="c">! used in the protocol slot of an ACE</span>
access-list OUTSIDE_IN extended permit object SSH-ALT host 198.51.100.10 object WEB</pre>
<p>When a service object is used, it replaces the protocol <i>and</i> port slots, so the ACE has no separate <code>eq</code>.</p>

<h3>Object-groups: bundles</h3>
<table class="cmp"><tr><th>Group type</th><th>Members</th><th>Typical use</th></tr>
<tr><td><code>object-group network</code></td><td><code>network-object host|subnet|object</code>, <code>group-object</code></td><td>All published servers, all partner networks</td></tr>
<tr><td><code>object-group service NAME tcp</code></td><td><code>port-object eq|range</code></td><td>Web ports 80 and 443 in the port slot</td></tr>
<tr><td><code>object-group service NAME</code> (no protocol)</td><td><code>service-object tcp|udp|icmp destination eq …</code></td><td>Mixed protocols, used in the protocol slot</td></tr>
<tr><td><code>object-group protocol</code></td><td><code>protocol-object tcp|udp|esp …</code></td><td>"tcp and udp" in the protocol slot</td></tr>
<tr><td><code>object-group icmp-type</code></td><td><code>icmp-object echo|echo-reply|unreachable …</code></td><td>Allow only safe ICMP types</td></tr>
</table>

<pre class="code"><span class="c">! the lab group: both published servers</span>
object-group network PUBLIC-SERVERS
 network-object object WEB
 network-object object MAIL
<span class="c">! web ports, tcp-typed group</span>
object-group service WEB-PORTS tcp
 port-object eq www
 port-object eq h&#116;tps
<span class="c">! mixed services, protocol-less group</span>
object-group service MGMT-SVC
 service-object tcp destination eq ssh
 service-object udp destination eq snmp
<span class="c">! only helpful ICMP</span>
object-group icmp-type SAFE-ICMP
 icmp-object echo
 icmp-object unreachable
 icmp-object time-exceeded
<span class="c">! nesting: partners = two networks + another group</span>
object-group network PARTNERS
 network-object host 198.51.100.10
 network-object 192.0.2.0 255.255.255.224
 group-object AUDITORS
<span class="c">! using them</span>
access-list OUTSIDE_IN extended permit tcp any object WEB object-group WEB-PORTS
access-list OUTSIDE_IN extended permit object-group MGMT-SVC object-group PARTNERS object-group PUBLIC-SERVERS
access-list OUTSIDE_IN extended permit icmp any object-group PUBLIC-SERVERS object-group SAFE-ICMP</pre>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Objects and nested groups inside one ACE">
<rect x="230" y="15" width="180" height="45" rx="8" fill="#fde68a"/><text x="320" y="43" text-anchor="middle" class="svg-ink" font-size="13">ACE in OUTSIDE_IN</text>
<rect x="20" y="90" width="180" height="45" rx="8" fill="#ddd6fe"/><text x="110" y="118" text-anchor="middle" class="svg-ink" font-size="13">MGMT-SVC (service)</text>
<rect x="230" y="90" width="180" height="45" rx="8" fill="#fed7aa"/><text x="320" y="118" text-anchor="middle" class="svg-ink" font-size="13">PARTNERS (source)</text>
<rect x="440" y="90" width="180" height="45" rx="8" fill="#bae6fd"/><text x="530" y="118" text-anchor="middle" class="svg-ink" font-size="13">PUBLIC-SERVERS (dst)</text>
<rect x="160" y="155" width="120" height="35" rx="6" fill="#e2e8f0"/><text x="220" y="177" text-anchor="middle" class="svg-muted" font-size="12">hosts, subnets</text>
<rect x="300" y="155" width="120" height="35" rx="6" fill="#bbf7d0"/><text x="360" y="177" text-anchor="middle" class="svg-muted" font-size="12">group AUDITORS</text>
<rect x="470" y="155" width="120" height="35" rx="6" fill="#e2e8f0"/><text x="530" y="177" text-anchor="middle" class="svg-muted" font-size="12">objects WEB, MAIL</text>
<line x1="320" y1="60" x2="110" y2="90" stroke="#64748b" stroke-width="2"/><line x1="320" y1="60" x2="320" y2="90" stroke="#64748b" stroke-width="2"/><line x1="320" y1="60" x2="530" y2="90" stroke="#64748b" stroke-width="2"/>
<line x1="300" y1="135" x2="220" y2="155" stroke="#64748b" stroke-width="2"/><line x1="340" y1="135" x2="360" y2="155" stroke="#64748b" stroke-width="2"/><line x1="530" y1="135" x2="530" y2="155" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">One ACE can reference a service group, a nested source group and a destination group. The ASA multiplies them out into elements.</p></div>

<h3>Expansion: what the ASA really stores</h3>
<p>The ASA expands every ACE with groups into all combinations. One line with a 2-member port group and a 2-member server group becomes 4 elements. <code>show access-list</code> shows the line you wrote, followed by indented expanded entries.</p>

<pre class="out">NK-ASA# show access-list OUTSIDE_IN
access-list OUTSIDE_IN; <span class="hl">4 elements</span>; name hash: 0x6892a938
access-list OUTSIDE_IN line 1 extended permit tcp host 198.51.100.10 object-group PUBLIC-SERVERS eq ssh (hitcnt=3) 0x2e4f1c07
  access-list OUTSIDE_IN line 1 extended permit tcp host 198.51.100.10 host 10.0.2.10 eq ssh (hitcnt=2) 0x9d31a5e0
  access-list OUTSIDE_IN line 1 extended permit tcp host 198.51.100.10 host 10.0.2.25 eq ssh (hitcnt=1) 0x40c7b2f9
access-list OUTSIDE_IN line 2 extended permit tcp any object WEB object-group WEB-PORTS (hitcnt=21) 0x51a8d3c4
  access-list OUTSIDE_IN line 2 extended permit tcp any host 10.0.2.10 eq www (hitcnt=14) 0x0be9f6a1
  access-list OUTSIDE_IN line 2 extended permit tcp any host 10.0.2.10 eq h&#116;tps (hitcnt=7) 0x6c2d8e53</pre>

<div class="eg"><p><b>Worked example.</b> An ACE with 10 source networks, 20 destination servers and 5 ports expands to 10 × 20 × 5 = <b>1,000</b> elements. A few such lines can consume real memory on a small ASA. Chapter 8 shows <code>object-group-search access-control</code>, which keeps groups unexpanded.</p></div>

<h3>Why objects matter in real operations</h3>
<ul>
<li><b>One change, everywhere.</b> WEB moves to 10.0.2.11: edit the object host line once; every ACE, NAT rule and capture follows.</li>
<li><b>Readable audits.</b> "permit PARTNERS to PUBLIC-SERVERS on MGMT-SVC" is self-explaining.</li>
<li><b>Safer changes.</b> Adding a partner means adding one member to PARTNERS, not writing new ACEs.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Using a tcp-typed service group in the protocol slot, or a protocol-less group in the port slot (the CLI rejects it); forgetting that editing a group instantly changes every ACE that uses it (great for speed, dangerous if the group is shared by several policies); and trying to delete an object that is still referenced (the ASA refuses until the reference is removed).</p></div>

<div class="exam"><p><b>Exam trap.</b> A network <b>object</b> holds one host, subnet, range or FQDN; a network <b>object-group</b> holds many. Only objects (not groups) can carry an Auto NAT rule. Know the member keywords: <code>network-object</code>, <code>port-object</code>, <code>service-object</code>, <code>protocol-object</code>, <code>icmp-object</code>, <code>group-object</code>.</p></div>

<div class="scn"><h4>The partner that got access by accident</h4><p>A retailer reused the group PARTNERS in two ACEs: SSH to the jump host, and SFTP to a file server. Months later a new analytics vendor needed only SFTP, and an engineer added them to PARTNERS. The vendor could now SSH to the jump host too. A quarterly review of <code>show access-list</code> expansions showed the vendor's network in the SSH line. The team split the group into SSH-PARTNERS and SFTP-PARTNERS.</p><p><b>Lesson:</b> name groups after the policy they serve, and check where a group is used before adding members.</p></div>

<div class="iv"><p class="q">"What is the difference between an object and an object-group on the ASA, and why use them?"</p><p>Strong answer: an object defines a single host, subnet, range, FQDN or service and can carry Auto NAT; an object-group bundles objects, addresses, ports, protocols or ICMP types, and can nest other groups with group-object. They make ACLs readable, let you change an address in one place, and reduce the chance of errors. Mention that groups expand into multiple ACEs and that you can check expansion with <code>show access-list</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Network objects: host, subnet, range or FQDN; one per object; can include Auto NAT.</li>
<li>Service objects replace the protocol and port slots of an ACE.</li>
<li>Group types: network, service (typed or protocol-less), protocol, icmp-type; nest with group-object.</li>
<li>Groups expand into many elements; watch the element count.</li>
<li>Name groups by policy and check reuse before adding members.</li>
</ul></div>
`,hi:`
<p>ACLs mein raw IP addresses padhne mein mushkil aur badalne mein aur bhi mushkil hote hain. Objects har host, subnet aur service ko ek <b>naam</b> dete hain, aur object-groups kai ko ek saath baandhte hain. Achha ASA config lagbhag policy document jaisa padha jaata hai: "any se PUBLIC-SERVERS tak web permit karo".</p>

<h3>Analogy: contacts aur WhatsApp groups</h3>
<p>Aap har baar dost ko message karte waqt uska phone number type nahi karte; aap use ek baar <b>contact</b> (object) ke roop mein save karte ho. Jab ek saath paanch doston ko message karna ho, to aap ek <b>group</b> (object-group) banate ho. Agar dost apna number badalta hai, to aap ek contact update karte ho aur jis bhi group mein woh hai, woh apne aap update ho jaata hai.</p>

<h3>Network objects: har ek mein ek cheez</h3>
<p><code>object network</code> exactly <b>ek</b> cheez rakhta hai: host, subnet, range ya FQDN. Isme ek Auto NAT rule bhi ho sakta hai, jisse lab mein WEB aur MAIL publish hote hain.</p>
<pre class="code">object network WEB
 host 10.0.2.10
 nat (dmz,outside) static 203.0.113.3
object network MAIL
 host 10.0.2.25
 nat (dmz,outside) static 203.0.113.4
object network DMZ-NET
 subnet 10.0.2.0 255.255.255.0
object network SCAN-POOL
 range 198.51.100.200 198.51.100.210
<span class="c">! FQDN objects ke liye ASA par DNS configured chahiye (dns domain-lookup)</span>
object network PARTNER-PORTAL
 fqdn portal.partner.example</pre>

<h3>Service objects: protocol plus ports</h3>
<pre class="code">object service SSH-ALT
 service tcp destination eq 2222
object service WEB-8443
 service tcp destination eq 8443
<span class="c">! ACE ke protocol slot mein use hota hai</span>
access-list OUTSIDE_IN extended permit object SSH-ALT host 198.51.100.10 object WEB</pre>
<p>Jab service object use hota hai, to woh protocol <i>aur</i> port dono slots replace kar deta hai, isliye ACE mein alag <code>eq</code> nahi hota.</p>

<h3>Object-groups: bundles</h3>
<table class="cmp"><tr><th>Group type</th><th>Members</th><th>Typical use</th></tr>
<tr><td><code>object-group network</code></td><td><code>network-object host|subnet|object</code>, <code>group-object</code></td><td>Saare published servers, saare partner networks</td></tr>
<tr><td><code>object-group service NAME tcp</code></td><td><code>port-object eq|range</code></td><td>Port slot mein web ports 80 aur 443</td></tr>
<tr><td><code>object-group service NAME</code> (bina protocol)</td><td><code>service-object tcp|udp|icmp destination eq …</code></td><td>Mixed protocols, protocol slot mein use</td></tr>
<tr><td><code>object-group protocol</code></td><td><code>protocol-object tcp|udp|esp …</code></td><td>Protocol slot mein "tcp aur udp"</td></tr>
<tr><td><code>object-group icmp-type</code></td><td><code>icmp-object echo|echo-reply|unreachable …</code></td><td>Sirf safe ICMP types allow karna</td></tr>
</table>

<pre class="code"><span class="c">! lab group: dono published servers</span>
object-group network PUBLIC-SERVERS
 network-object object WEB
 network-object object MAIL
<span class="c">! web ports, tcp-typed group</span>
object-group service WEB-PORTS tcp
 port-object eq www
 port-object eq h&#116;tps
<span class="c">! mixed services, bina protocol wala group</span>
object-group service MGMT-SVC
 service-object tcp destination eq ssh
 service-object udp destination eq snmp
<span class="c">! sirf kaam ka ICMP</span>
object-group icmp-type SAFE-ICMP
 icmp-object echo
 icmp-object unreachable
 icmp-object time-exceeded
<span class="c">! nesting: partners = do networks + ek aur group</span>
object-group network PARTNERS
 network-object host 198.51.100.10
 network-object 192.0.2.0 255.255.255.224
 group-object AUDITORS
<span class="c">! inka use</span>
access-list OUTSIDE_IN extended permit tcp any object WEB object-group WEB-PORTS
access-list OUTSIDE_IN extended permit object-group MGMT-SVC object-group PARTNERS object-group PUBLIC-SERVERS
access-list OUTSIDE_IN extended permit icmp any object-group PUBLIC-SERVERS object-group SAFE-ICMP</pre>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Ek ACE ke andar objects aur nested groups">
<rect x="230" y="15" width="180" height="45" rx="8" fill="#fde68a"/><text x="320" y="43" text-anchor="middle" class="svg-ink" font-size="13">OUTSIDE_IN ki ACE</text>
<rect x="20" y="90" width="180" height="45" rx="8" fill="#ddd6fe"/><text x="110" y="118" text-anchor="middle" class="svg-ink" font-size="13">MGMT-SVC (service)</text>
<rect x="230" y="90" width="180" height="45" rx="8" fill="#fed7aa"/><text x="320" y="118" text-anchor="middle" class="svg-ink" font-size="13">PARTNERS (source)</text>
<rect x="440" y="90" width="180" height="45" rx="8" fill="#bae6fd"/><text x="530" y="118" text-anchor="middle" class="svg-ink" font-size="13">PUBLIC-SERVERS (dst)</text>
<rect x="160" y="155" width="120" height="35" rx="6" fill="#e2e8f0"/><text x="220" y="177" text-anchor="middle" class="svg-muted" font-size="12">hosts, subnets</text>
<rect x="300" y="155" width="120" height="35" rx="6" fill="#bbf7d0"/><text x="360" y="177" text-anchor="middle" class="svg-muted" font-size="12">group AUDITORS</text>
<rect x="470" y="155" width="120" height="35" rx="6" fill="#e2e8f0"/><text x="530" y="177" text-anchor="middle" class="svg-muted" font-size="12">objects WEB, MAIL</text>
<line x1="320" y1="60" x2="110" y2="90" stroke="#64748b" stroke-width="2"/><line x1="320" y1="60" x2="320" y2="90" stroke="#64748b" stroke-width="2"/><line x1="320" y1="60" x2="530" y2="90" stroke="#64748b" stroke-width="2"/>
<line x1="300" y1="135" x2="220" y2="155" stroke="#64748b" stroke-width="2"/><line x1="340" y1="135" x2="360" y2="155" stroke="#64748b" stroke-width="2"/><line x1="530" y1="135" x2="530" y2="155" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Ek ACE service group, nested source group aur destination group refer kar sakti hai. ASA inhe multiply karke elements banata hai.</p></div>

<h3>Expansion: ASA asal mein kya store karta hai</h3>
<p>ASA groups wali har ACE ko saare combinations mein expand karta hai. 2-member port group aur 2-member server group wali ek line 4 elements ban jaati hai. <code>show access-list</code> aapki likhi line dikhata hai, uske baad indented expanded entries.</p>

<pre class="out">NK-ASA# show access-list OUTSIDE_IN
access-list OUTSIDE_IN; <span class="hl">4 elements</span>; name hash: 0x6892a938
access-list OUTSIDE_IN line 1 extended permit tcp host 198.51.100.10 object-group PUBLIC-SERVERS eq ssh (hitcnt=3) 0x2e4f1c07
  access-list OUTSIDE_IN line 1 extended permit tcp host 198.51.100.10 host 10.0.2.10 eq ssh (hitcnt=2) 0x9d31a5e0
  access-list OUTSIDE_IN line 1 extended permit tcp host 198.51.100.10 host 10.0.2.25 eq ssh (hitcnt=1) 0x40c7b2f9
access-list OUTSIDE_IN line 2 extended permit tcp any object WEB object-group WEB-PORTS (hitcnt=21) 0x51a8d3c4
  access-list OUTSIDE_IN line 2 extended permit tcp any host 10.0.2.10 eq www (hitcnt=14) 0x0be9f6a1
  access-list OUTSIDE_IN line 2 extended permit tcp any host 10.0.2.10 eq h&#116;tps (hitcnt=7) 0x6c2d8e53</pre>

<div class="eg"><p><b>Worked example.</b> 10 source networks, 20 destination servers aur 5 ports wali ACE 10 × 20 × 5 = <b>1,000</b> elements mein expand hoti hai. Aisi kuch lines chhote ASA par asli memory kha sakti hain. Chapter 8 <code>object-group-search access-control</code> dikhata hai, jo groups ko unexpanded rakhta hai.</p></div>

<h3>Real operations mein objects kyun matter karte hain</h3>
<ul>
<li><b>Ek change, har jagah.</b> WEB 10.0.2.11 par move hota hai: object ki host line ek baar edit karo; har ACE, NAT rule aur capture follow karta hai.</li>
<li><b>Readable audits.</b> "PARTNERS se PUBLIC-SERVERS tak MGMT-SVC par permit" khud samjha deta hai.</li>
<li><b>Safer changes.</b> Naya partner jodne ka matlab hai PARTNERS mein ek member jodna, nayi ACEs likhna nahi.</li>
</ul>

<div class="warn"><p><b>Common galtiyan.</b> Tcp-typed service group ko protocol slot mein, ya bina protocol wale group ko port slot mein use karna (CLI reject karti hai); yeh bhool jaana ki group edit karne se use karne wali har ACE turant badal jaati hai (speed ke liye badhiya, khatarnaak agar group kai policies share karti hain); aur aisa object delete karne ki koshish karna jo abhi bhi referenced hai (ASA tab tak mana karta hai jab tak reference hata na diya jaaye).</p></div>

<div class="exam"><p><b>Exam trap.</b> Network <b>object</b> ek host, subnet, range ya FQDN rakhta hai; network <b>object-group</b> kai rakhta hai. Sirf objects (groups nahi) Auto NAT rule rakh sakte hain. Member keywords yaad rakho: <code>network-object</code>, <code>port-object</code>, <code>service-object</code>, <code>protocol-object</code>, <code>icmp-object</code>, <code>group-object</code>.</p></div>

<div class="scn"><h4>Woh partner jise galti se access mil gaya</h4><p>Ek retailer ne group PARTNERS ko do ACEs mein reuse kiya: jump host tak SSH, aur file server tak SFTP. Mahino baad ek naye analytics vendor ko sirf SFTP chahiye tha, aur engineer ne unhe PARTNERS mein jod diya. Ab vendor jump host par SSH bhi kar sakta tha. <code>show access-list</code> expansions ke quarterly review mein vendor ka network SSH line mein dikha. Team ne group ko SSH-PARTNERS aur SFTP-PARTNERS mein split kiya.</p><p><b>Seekh:</b> groups ka naam us policy par rakho jiske liye woh hain, aur members jodne se pehle check karo ki group kahan use ho raha hai.</p></div>

<div class="iv"><p class="q">"ASA par object aur object-group mein kya farak hai, aur inhe kyun use karte hain?"</p><p>Strong answer: object ek single host, subnet, range, FQDN ya service define karta hai aur Auto NAT rakh sakta hai; object-group objects, addresses, ports, protocols ya ICMP types ko bundle karta hai, aur group-object se dusre groups nest kar sakta hai. Yeh ACLs ko readable banate hain, address ek jagah badalne dete hain, aur errors ka chance kam karte hain. Mention karo ki groups kai ACEs mein expand hote hain aur expansion <code>show access-list</code> se check kar sakte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Network objects: host, subnet, range ya FQDN; har object mein ek; Auto NAT include kar sakte hain.</li>
<li>Service objects ACE ke protocol aur port slots replace karte hain.</li>
<li>Group types: network, service (typed ya bina protocol), protocol, icmp-type; group-object se nest karo.</li>
<li>Groups kai elements mein expand hote hain; element count par nazar rakho.</li>
<li>Groups ka naam policy ke hisaab se rakho aur members jodne se pehle reuse check karo.</li>
</ul></div>
`}};export{e as default};