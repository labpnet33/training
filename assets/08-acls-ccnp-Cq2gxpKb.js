var e={id:`acls-ccnp`,h:{en:`ACLs at CCNP depth`,hi:`CCNP depth par ACLs`},body:{en:`
<p>An ACL is a bouncer with a printed list. He reads the list from the top, and the first line that matches the guest decides: in or out. If nobody on the list matches, the unwritten last line says "no entry". At CCNA you learned to write the list. At CCNP you must write it so it is easy to maintain, precise, valid only at the right times, and correct for IPv6 as well.</p>

<h3>Rules that never change</h3>
<ul>
<li>Entries are checked top-down; the <b>first match wins</b> and processing stops.</li>
<li>Every ACL ends with an invisible <b>implicit deny</b>. An empty ACL applied to an interface on IOS permits everything, but one entry is enough to activate the implicit deny.</li>
<li>One ACL per interface, per direction, per protocol (IPv4 and IPv6).</li>
<li>Wildcard masks: 0 means "must match", 1 means "don't care". 10.99.0.0 0.0.0.255 matches 10.99.0.0/24.</li>
<li>Place <b>extended</b> ACLs close to the source, <b>standard</b> ACLs close to the destination.</li>
<li>Traffic the router itself generates is not filtered by its own outbound interface ACL.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="ACL processing">
<rect x="20" y="90" width="110" height="44" rx="8" fill="#e2e8f0"/><text x="75" y="117" text-anchor="middle" class="svg-ink" font-size="13">packet</text>
<rect x="180" y="15" width="220" height="36" rx="6" fill="#bae6fd"/><text x="290" y="38" text-anchor="middle" class="svg-ink" font-size="12">10 permit ... ?</text>
<rect x="180" y="65" width="220" height="36" rx="6" fill="#bae6fd"/><text x="290" y="88" text-anchor="middle" class="svg-ink" font-size="12">20 permit ... ?</text>
<rect x="180" y="115" width="220" height="36" rx="6" fill="#bae6fd"/><text x="290" y="138" text-anchor="middle" class="svg-ink" font-size="12">30 deny ... ?</text>
<rect x="180" y="165" width="220" height="36" rx="6" fill="#fed7aa"/><text x="290" y="188" text-anchor="middle" class="svg-ink" font-size="12">implicit deny any</text>
<line x1="130" y1="112" x2="180" y2="33" stroke="#64748b" stroke-width="2"/>
<line x1="290" y1="51" x2="290" y2="65" stroke="#64748b" stroke-width="2"/><line x1="290" y1="101" x2="290" y2="115" stroke="#64748b" stroke-width="2"/><line x1="290" y1="151" x2="290" y2="165" stroke="#64748b" stroke-width="2"/>
<line x1="400" y1="33" x2="460" y2="33" stroke="#64748b" stroke-width="2"/><line x1="400" y1="83" x2="460" y2="83" stroke="#64748b" stroke-width="2"/><line x1="400" y1="133" x2="460" y2="133" stroke="#64748b" stroke-width="2"/>
<text x="470" y="38" class="svg-muted" font-size="12">match: permit, stop</text><text x="470" y="88" class="svg-muted" font-size="12">match: permit, stop</text><text x="470" y="138" class="svg-muted" font-size="12">match: drop, stop</text>
<text x="470" y="188" class="svg-accent" font-size="12">nothing matched: drop</text>
</svg><p class="cap">Top-down, first match wins; a packet that matches nothing meets the invisible deny.</p></div>

<h3>Standard, extended and named</h3>
<table class="cmp"><tr><th>Type</th><th>Numbers</th><th>Matches</th></tr>
<tr><td>Standard</td><td>1 to 99, 1300 to 1999</td><td>Source IP only</td></tr>
<tr><td>Extended</td><td>100 to 199, 2000 to 2699</td><td>Protocol, source, destination, ports, flags, DSCP</td></tr>
<tr><td>Named</td><td>Any name</td><td>Standard or extended, with sequence-number editing</td></tr></table>
<p>Named ACLs are the professional choice: every entry gets a sequence number (10, 20, 30 by default) so you can insert and delete lines without rewriting the list.</p>
<pre class="code">ip access-list extended EDGE-IN
 10 permit tcp any host 192.0.2.10 eq 443
 20 permit udp any host 192.0.2.53 eq domain
 30 deny   ip any any log
ip access-list extended EDGE-IN
 15 permit tcp any host 192.0.2.10 eq 80    <span class="c">! inserted between 10 and 20</span>
 no 30
ip access-list resequence EDGE-IN 10 10       <span class="c">! renumber 10, 20, 30...</span></pre>

<h3>Object groups</h3>
<p>When the same servers and ports appear in many lines, <b>object groups</b> keep the ACL short and readable:</p>
<pre class="code">object-group network WEB-SERVERS
 host 192.0.2.10
 host 192.0.2.11
 192.0.2.32 255.255.255.224
object-group service WEB-PORTS
 tcp eq 443
 tcp eq 8443
ip access-list extended DMZ-IN
 10 permit object-group WEB-PORTS any object-group WEB-SERVERS</pre>
<p>One line now expands to 3 destinations times 2 ports. Adding a server means editing the group, not the ACL.</p>

<h3>Time-based ACLs</h3>
<p>A <b>time-range</b> makes an entry active only at certain times, based on the router clock (so NTP matters):</p>
<pre class="code">time-range BUSINESS-HOURS
 periodic weekdays 8:00 to 18:00
ip access-list extended GUEST-OUT
 10 permit tcp 10.1.1.0 0.0.0.255 any eq 443 time-range BUSINESS-HOURS
 20 deny   ip 10.1.1.0 0.0.0.255 any</pre>
<pre class="out">R1# show time-range
time-range entry: BUSINESS-HOURS <span class="hl">(active)</span>
   periodic weekdays 8:00 to 18:00
   used in: IP ACL entry</pre>

<h3>Reflexive ACLs (concept)</h3>
<p>A plain ACL is stateless: to let replies back in, you would have to permit wide port ranges inbound. The <code>established</code> keyword only checks the ACK or RST bit, which an attacker can set. A <b>reflexive ACL</b> watches outbound sessions and creates temporary mirror entries for the replies:</p>
<pre class="code">ip access-list extended OUT-FILTER
 permit tcp 10.1.1.0 0.0.0.255 any reflect MIRROR
ip access-list extended IN-FILTER
 evaluate MIRROR                            <span class="c">! allow only replies to sessions we started</span>
 deny ip any any</pre>
<p>Know the concept for the exam; in production, stateful inspection in the Zone-Based Firewall or a dedicated firewall does this job better.</p>

<h3>IPv6 ACLs</h3>
<p>IPv6 ACLs are always named and are applied with <code>ipv6 traffic-filter</code>, not <code>ip access-group</code>. They also have a different implicit ending:</p>
<pre class="code">ipv6 access-list V6-MGMT
 permit tcp 2001:db8:99::/64 any eq 22
interface GigabitEthernet0/2
 ipv6 traffic-filter V6-MGMT in
<span class="c">! implicit end of every IPv6 ACL:</span>
<span class="c">!  permit icmp any any nd-na</span>
<span class="c">!  permit icmp any any nd-ns</span>
<span class="c">!  deny ipv6 any any</span></pre>
<p>The implicit neighbor discovery permits exist so that IPv6 keeps working. If you add your own <code>deny ipv6 any any log</code> at the end, you override them and break neighbor discovery unless you permit ND explicitly first.</p>

<h3>VTY ACLs</h3>
<p>To control who may even try to log in, apply an ACL to the lines with <code>access-class</code>. It matches the source address of incoming sessions, whatever router address they target:</p>
<pre class="code">ip access-list standard VTY-MGMT
 10 permit 10.10.10.0 0.0.0.255
 20 permit 10.99.0.0 0.0.0.255
line vty 0 15
 access-class VTY-MGMT in              <span class="c">! add vrf-also if sessions arrive in a VRF</span>
 ipv6 access-class V6-MGMT in</pre>
<pre class="out">R1# show ip access-lists VTY-MGMT
Standard IP access list VTY-MGMT
<span class="hl">    10 permit 10.10.10.0, wildcard bits 0.0.0.255 (6 matches)</span>
    20 permit 10.99.0.0, wildcard bits 0.0.0.255</pre>

<h3>Filters versus selectors</h3>
<p>Applied with <code>ip access-group</code> or <code>access-class</code>, an ACL is a <b>filter</b>: deny drops. Referenced from a class-map, route-map, NAT or crypto map, it is a <b>selector</b>: permit means "this traffic belongs here", deny means "not this one", and nothing is dropped by the ACL itself. CoPP (chapter 9) uses ACLs as selectors.</p>

<div class="eg"><p><b>Worked example.</b> Protect R1's management plane in the CoPP lab: only 10.99.0.0/24 may SSH. Wildcard for /24 is 0.0.0.255, so the standard ACL entry is <code>permit 10.99.0.0 0.0.0.255</code>. PC-USER at 10.1.1.20 matches nothing, hits the implicit deny, and its SSH attempt to 10.1.1.1 is refused at the line, before any password prompt.</p></div>

<div class="warn"><p><b>Common mistake.</b> Adding a new permit to a numbered ACL with <code>access-list 101 permit ...</code>: it goes to the end, after the deny. Use named ACLs and sequence numbers to place it correctly.</p></div>

<div class="exam"><p><b>Exam trap.</b> IPv6: <code>ipv6 traffic-filter</code> on interfaces, <code>ipv6 access-class</code> on lines, and the implicit ND permits before the implicit deny. IPv4: <code>ip access-group</code> on interfaces, <code>access-class</code> on lines.</p></div>

<div class="scn"><h4>The IPv6 ACL that killed the neighbours</h4><p>A team copied their IPv4 habit of ending every ACL with an explicit <code>deny ip any any log</code> to IPv6. After applying <code>deny ipv6 any any log</code> inbound on a server VLAN, hosts lost their default gateway within minutes as neighbor cache entries expired. The explicit deny overrode the implicit ND permits. Adding <code>permit icmp any any nd-na</code> and <code>permit icmp any any nd-ns</code> (and router advertisements where needed) above the deny fixed it.</p><p><b>Lesson:</b> IPv6 depends on ICMPv6. Never write a final IPv6 deny without the ND permits above it.</p></div>

<div class="iv"><p class="q">"How do you restrict SSH access to a router to the management subnet?"</p><p>Create a standard or extended ACL that permits the management subnet and apply it to all VTY lines with <code>access-class NAME in</code>, plus <code>ipv6 access-class</code> for IPv6 and <code>vrf-also</code> if management is in a VRF. Mention verifying with the match counters in <code>show ip access-lists</code>, and that CoPP and an infrastructure ACL add further layers.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Top-down, first match, implicit deny; named ACLs with sequence numbers are easy to edit.</li>
<li>Object groups (network, service) shrink large ACLs; time-ranges make entries time-dependent.</li>
<li>Reflexive ACLs mirror outbound sessions; <code>established</code> only checks TCP flags.</li>
<li>IPv6 ACLs: always named, <code>ipv6 traffic-filter</code>, implicit ND permits before the implicit deny.</li>
<li>VTY ACLs use <code>access-class</code>; ACLs in class-maps are selectors, not filters.</li>
</ul></div>
`,hi:`
<p>ACL ek bouncer hai jiske paas ek printed list hai. Woh list upar se padhta hai, aur guest se match hone wali pehli line faisla karti hai: andar ya bahar. Agar list mein koi match nahi karta, to ansuni aakhri line kehti hai "entry nahi". CCNA mein aapne list likhna seekha. CCNP mein aapko use aise likhna hai ki woh maintain karne mein aasaan, sateek, sirf sahi samay par valid, aur IPv6 ke liye bhi sahi ho.</p>

<h3>Niyam jo kabhi nahi badalte</h3>
<ul>
<li>Entries upar se neeche check hoti hain; <b>pehla match jeet-ta hai</b> aur processing ruk jaati hai.</li>
<li>Har ACL ek invisible <b>implicit deny</b> se khatam hoti hai. IOS par interface par lagi khaali ACL sab permit karti hai, lekin ek entry implicit deny ko active karne ke liye kaafi hai.</li>
<li>Har interface, har direction, har protocol (IPv4 aur IPv6) par ek ACL.</li>
<li>Wildcard masks: 0 ka matlab "match hona chahiye", 1 ka matlab "fark nahi padta". 10.99.0.0 0.0.0.255 10.99.0.0/24 ko match karta hai.</li>
<li><b>Extended</b> ACLs source ke paas, <b>standard</b> ACLs destination ke paas lagao.</li>
<li>Router ka khud banaya traffic uski apni outbound interface ACL se filter nahi hota.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="ACL processing">
<rect x="20" y="90" width="110" height="44" rx="8" fill="#e2e8f0"/><text x="75" y="117" text-anchor="middle" class="svg-ink" font-size="13">packet</text>
<rect x="180" y="15" width="220" height="36" rx="6" fill="#bae6fd"/><text x="290" y="38" text-anchor="middle" class="svg-ink" font-size="12">10 permit ... ?</text>
<rect x="180" y="65" width="220" height="36" rx="6" fill="#bae6fd"/><text x="290" y="88" text-anchor="middle" class="svg-ink" font-size="12">20 permit ... ?</text>
<rect x="180" y="115" width="220" height="36" rx="6" fill="#bae6fd"/><text x="290" y="138" text-anchor="middle" class="svg-ink" font-size="12">30 deny ... ?</text>
<rect x="180" y="165" width="220" height="36" rx="6" fill="#fed7aa"/><text x="290" y="188" text-anchor="middle" class="svg-ink" font-size="12">implicit deny any</text>
<line x1="130" y1="112" x2="180" y2="33" stroke="#64748b" stroke-width="2"/>
<line x1="290" y1="51" x2="290" y2="65" stroke="#64748b" stroke-width="2"/><line x1="290" y1="101" x2="290" y2="115" stroke="#64748b" stroke-width="2"/><line x1="290" y1="151" x2="290" y2="165" stroke="#64748b" stroke-width="2"/>
<line x1="400" y1="33" x2="460" y2="33" stroke="#64748b" stroke-width="2"/><line x1="400" y1="83" x2="460" y2="83" stroke="#64748b" stroke-width="2"/><line x1="400" y1="133" x2="460" y2="133" stroke="#64748b" stroke-width="2"/>
<text x="470" y="38" class="svg-muted" font-size="12">match: permit, ruko</text><text x="470" y="88" class="svg-muted" font-size="12">match: permit, ruko</text><text x="470" y="138" class="svg-muted" font-size="12">match: drop, ruko</text>
<text x="470" y="188" class="svg-accent" font-size="12">kuch match nahi: drop</text>
</svg><p class="cap">Upar se neeche, pehla match jeet-ta hai; kisi se match na karne wala packet invisible deny se milta hai.</p></div>

<h3>Standard, extended aur named</h3>
<table class="cmp"><tr><th>Type</th><th>Numbers</th><th>Kya match karta hai</th></tr>
<tr><td>Standard</td><td>1 se 99, 1300 se 1999</td><td>Sirf source IP</td></tr>
<tr><td>Extended</td><td>100 se 199, 2000 se 2699</td><td>Protocol, source, destination, ports, flags, DSCP</td></tr>
<tr><td>Named</td><td>Koi bhi naam</td><td>Standard ya extended, sequence-number editing ke saath</td></tr></table>
<p>Named ACLs professional choice hain: har entry ko sequence number milta hai (default mein 10, 20, 30) taaki aap poori list dobara likhe bina lines insert aur delete kar sako.</p>
<pre class="code">ip access-list extended EDGE-IN
 10 permit tcp any host 192.0.2.10 eq 443
 20 permit udp any host 192.0.2.53 eq domain
 30 deny   ip any any log
ip access-list extended EDGE-IN
 15 permit tcp any host 192.0.2.10 eq 80    <span class="c">! 10 aur 20 ke beech insert</span>
 no 30
ip access-list resequence EDGE-IN 10 10       <span class="c">! 10, 20, 30... renumber</span></pre>

<h3>Object groups</h3>
<p>Jab same servers aur ports kai lines mein aate hain, <b>object groups</b> ACL ko chhota aur padhne layak rakhte hain:</p>
<pre class="code">object-group network WEB-SERVERS
 host 192.0.2.10
 host 192.0.2.11
 192.0.2.32 255.255.255.224
object-group service WEB-PORTS
 tcp eq 443
 tcp eq 8443
ip access-list extended DMZ-IN
 10 permit object-group WEB-PORTS any object-group WEB-SERVERS</pre>
<p>Ab ek line 3 destinations guna 2 ports mein expand hoti hai. Server jodne ka matlab group edit karna hai, ACL nahi.</p>

<h3>Time-based ACLs</h3>
<p><b>Time-range</b> entry ko sirf kuch samay par active banata hai, router clock ke hisaab se (isliye NTP zaroori hai):</p>
<pre class="code">time-range BUSINESS-HOURS
 periodic weekdays 8:00 to 18:00
ip access-list extended GUEST-OUT
 10 permit tcp 10.1.1.0 0.0.0.255 any eq 443 time-range BUSINESS-HOURS
 20 deny   ip 10.1.1.0 0.0.0.255 any</pre>
<pre class="out">R1# show time-range
time-range entry: BUSINESS-HOURS <span class="hl">(active)</span>
   periodic weekdays 8:00 to 18:00
   used in: IP ACL entry</pre>

<h3>Reflexive ACLs (concept)</h3>
<p>Plain ACL stateless hoti hai: replies ko andar aane dene ke liye aapko inbound mein chaude port ranges permit karne padte. <code>established</code> keyword sirf ACK ya RST bit check karta hai, jise attacker set kar sakta hai. <b>Reflexive ACL</b> outbound sessions ko dekhti hai aur replies ke liye temporary mirror entries banati hai:</p>
<pre class="code">ip access-list extended OUT-FILTER
 permit tcp 10.1.1.0 0.0.0.255 any reflect MIRROR
ip access-list extended IN-FILTER
 evaluate MIRROR                            <span class="c">! sirf hamare shuru kiye sessions ke replies allow</span>
 deny ip any any</pre>
<p>Exam ke liye concept jaano; production mein Zone-Based Firewall ya dedicated firewall ka stateful inspection yeh kaam behtar karta hai.</p>

<h3>IPv6 ACLs</h3>
<p>IPv6 ACLs hamesha named hoti hain aur <code>ip access-group</code> nahi, <code>ipv6 traffic-filter</code> se lagti hain. Unka implicit end bhi alag hai:</p>
<pre class="code">ipv6 access-list V6-MGMT
 permit tcp 2001:db8:99::/64 any eq 22
interface GigabitEthernet0/2
 ipv6 traffic-filter V6-MGMT in
<span class="c">! har IPv6 ACL ka implicit end:</span>
<span class="c">!  permit icmp any any nd-na</span>
<span class="c">!  permit icmp any any nd-ns</span>
<span class="c">!  deny ipv6 any any</span></pre>
<p>Implicit neighbor discovery permits isliye hain taaki IPv6 chalta rahe. Agar aap aakhir mein apna <code>deny ipv6 any any log</code> jodte ho, to aap unhe override kar dete ho aur neighbor discovery tod dete ho, jab tak pehle ND ko saaf permit na karo.</p>

<h3>VTY ACLs</h3>
<p>Kaun login ki koshish bhi kar sake, yeh control karne ke liye lines par <code>access-class</code> se ACL lagao. Yeh aane wale sessions ka source address match karti hai, chahe woh router ke kisi bhi address ko target karein:</p>
<pre class="code">ip access-list standard VTY-MGMT
 10 permit 10.10.10.0 0.0.0.255
 20 permit 10.99.0.0 0.0.0.255
line vty 0 15
 access-class VTY-MGMT in              <span class="c">! sessions VRF mein aayein to vrf-also jodo</span>
 ipv6 access-class V6-MGMT in</pre>
<pre class="out">R1# show ip access-lists VTY-MGMT
Standard IP access list VTY-MGMT
<span class="hl">    10 permit 10.10.10.0, wildcard bits 0.0.0.255 (6 matches)</span>
    20 permit 10.99.0.0, wildcard bits 0.0.0.255</pre>

<h3>Filter vs selector</h3>
<p><code>ip access-group</code> ya <code>access-class</code> se lagi ACL <b>filter</b> hai: deny drop karta hai. Class-map, route-map, NAT ya crypto map se refer ho to yeh <b>selector</b> hai: permit ka matlab "yeh traffic yahan ka hai", deny ka "yeh nahi", aur ACL khud kuch drop nahi karti. CoPP (chapter 9) ACLs ko selectors ki tarah use karta hai.</p>

<div class="eg"><p><b>Worked example.</b> CoPP lab mein R1 ka management plane bachao: sirf 10.99.0.0/24 SSH kar sake. /24 ka wildcard 0.0.0.255 hai, isliye standard ACL entry <code>permit 10.99.0.0 0.0.0.255</code> hai. 10.1.1.20 wala PC-USER kisi se match nahi karta, implicit deny se takraata hai, aur 10.1.1.1 par uski SSH koshish line par hi, kisi password prompt se pehle, mana ho jaati hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Numbered ACL mein <code>access-list 101 permit ...</code> se naya permit jodna: yeh end mein, deny ke baad jaata hai. Sahi jagah rakhne ke liye named ACLs aur sequence numbers use karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> IPv6: interfaces par <code>ipv6 traffic-filter</code>, lines par <code>ipv6 access-class</code>, aur implicit deny se pehle implicit ND permits. IPv4: interfaces par <code>ip access-group</code>, lines par <code>access-class</code>.</p></div>

<div class="scn"><h4>Woh IPv6 ACL jisne neighbours maar diye</h4><p>Ek team ne har ACL ko explicit <code>deny ip any any log</code> se khatam karne ki IPv4 aadat IPv6 mein copy kar di. Server VLAN par inbound <code>deny ipv6 any any log</code> lagane ke baad kuch hi minute mein neighbor cache entries expire hone par hosts ne apna default gateway kho diya. Explicit deny ne implicit ND permits ko override kar diya tha. Deny ke upar <code>permit icmp any any nd-na</code> aur <code>permit icmp any any nd-ns</code> (aur zaroorat ho to router advertisements) jodne se fix hua.</p><p><b>Seekh:</b> IPv6 ICMPv6 par nirbhar hai. Upar ND permits ke bina kabhi aakhri IPv6 deny mat likho.</p></div>

<div class="iv"><p class="q">"Router par SSH access ko management subnet tak kaise seemit karte ho?"</p><p>Ek standard ya extended ACL banao jo management subnet permit kare aur use saari VTY lines par <code>access-class NAME in</code> se lagao, IPv6 ke liye <code>ipv6 access-class</code>, aur management VRF mein ho to <code>vrf-also</code>. <code>show ip access-lists</code> ke match counters se verify karne ka zikr karo, aur yeh ki CoPP aur infrastructure ACL aur layers jodte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Upar se neeche, pehla match, implicit deny; sequence numbers wali named ACLs edit karna aasaan hai.</li>
<li>Object groups (network, service) badi ACLs chhoti karte hain; time-ranges entries ko samay par nirbhar banate hain.</li>
<li>Reflexive ACLs outbound sessions ko mirror karti hain; <code>established</code> sirf TCP flags check karta hai.</li>
<li>IPv6 ACLs: hamesha named, <code>ipv6 traffic-filter</code>, implicit deny se pehle implicit ND permits.</li>
<li>VTY ACLs <code>access-class</code> use karti hain; class-maps mein ACLs selectors hain, filters nahi.</li>
</ul></div>
`}};export{e as default};