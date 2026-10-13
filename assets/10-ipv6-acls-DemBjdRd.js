var e={id:`ipv6-acls`,h:{en:`IPv6 ACLs: what changes and the implicit ND permits`,hi:`IPv6 ACLs: kya badalta hai aur implicit ND permits`},body:{en:`
<p>Moving from IPv4 to IPv6 ACLs is like moving from a Maruti to a new Maruti model: the steering, pedals and road rules are the same, but a few switches have moved and one new warning light matters a lot. First-match logic, top-down order and placement thinking are unchanged. The syntax, the way you apply the list and the hidden entries at the end are different. And IPv6 depends on ICMPv6 so heavily that careless ACLs break basic connectivity.</p>

<h3>What stays the same</h3>
<ul>
<li>Top-down processing, first match wins, an implicit deny at the end.</li>
<li>Specific entries before general ones.</li>
<li>Filter close to the source when you can match the destination and service.</li>
<li>One IPv6 ACL per interface per direction. It coexists with the IPv4 ACL on the same interface, because they are different protocols.</li>
</ul>

<h3>What changes</h3>
<table class="cmp">
<tr><th>Topic</th><th>IPv4</th><th>IPv6</th></tr>
<tr><td>Type</td><td>Standard or extended, numbered or named</td><td><b>Named only</b>, always "extended" in ability</td></tr>
<tr><td>Create</td><td><code>ip access-list extended NAME</code></td><td><code>ipv6 access-list NAME</code></td></tr>
<tr><td>Address matching</td><td>Address plus wildcard</td><td><b>Prefix length</b>: <code>2001:db8:40::/64</code>, plus <code>host</code> and <code>any</code></td></tr>
<tr><td>Apply to interface</td><td><code>ip access-group NAME in</code></td><td><code>ipv6 traffic-filter NAME in</code></td></tr>
<tr><td>Apply to VTY</td><td><code>access-class NAME in</code></td><td><code>ipv6 access-class NAME in</code></td></tr>
<tr><td>Insert an entry</td><td><code>15 permit ...</code></td><td><code>sequence 15 permit ...</code></td></tr>
<tr><td>Hidden last lines</td><td><code>deny any</code></td><td><code>permit icmp any any nd-na</code>, <code>permit icmp any any nd-ns</code>, <code>deny ipv6 any any</code></td></tr>
</table>

<h3>The implicit neighbour discovery permits</h3>
<p>In IPv6 there is no ARP. Hosts and routers find each other's MAC addresses with <b>Neighbor Solicitation (NS)</b> and <b>Neighbor Advertisement (NA)</b>, which are ICMPv6 messages. If an IPv6 ACL silently dropped them, nothing on the link could talk. So every IPv6 ACL ends with three invisible entries:</p>
<pre class="code">permit icmp any any nd-na
permit icmp any any nd-ns
deny ipv6 any any</pre>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Implicit entries in an IPv6 ACL">
<rect x="150" y="20" width="340" height="34" rx="6" fill="#e2e8f0"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">your entries (sequence 10, 20, 30 ...)</text>
<rect x="150" y="62" width="340" height="34" rx="6" fill="#fed7aa"/><text x="320" y="84" text-anchor="middle" class="svg-ink" font-size="13">optional: deny ipv6 any any log</text>
<rect x="150" y="112" width="340" height="30" rx="6" fill="#bbf7d0" stroke="#64748b" stroke-dasharray="4 3"/><text x="320" y="132" text-anchor="middle" class="svg-ink" font-size="13">implicit permit icmp any any nd-na</text>
<rect x="150" y="148" width="340" height="30" rx="6" fill="#bbf7d0" stroke="#64748b" stroke-dasharray="4 3"/><text x="320" y="168" text-anchor="middle" class="svg-ink" font-size="13">implicit permit icmp any any nd-ns</text>
<rect x="150" y="184" width="340" height="30" rx="6" fill="#e2e8f0" stroke="#64748b" stroke-dasharray="4 3"/><text x="320" y="204" text-anchor="middle" class="svg-ink" font-size="13">implicit deny ipv6 any any</text>
<text x="575" y="84" text-anchor="middle" class="svg-accent" font-size="12">catches NS/NA</text><text x="575" y="100" text-anchor="middle" class="svg-accent" font-size="12">first!</text>
<line x1="490" y1="79" x2="530" y2="79" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">An explicit deny above the hidden ND permits matches NS and NA first and breaks neighbour discovery.</p></div>

<p>Here is the trap: if you add your own <code>deny ipv6 any any log</code> at the end (a good habit in IPv4), it sits <b>above</b> the hidden ND permits. NS and NA now match your deny first, neighbour discovery fails, and hosts can no longer resolve the router's link-layer address. The fix is to add the ND permits explicitly before your deny. Also note that <b>router solicitations and router advertisements are not implicitly permitted</b>; if an inbound ACL must allow hosts' RS messages, or an ACL filters RAs from an upstream router, permit <code>router-solicitation</code> or <code>router-advertisement</code> explicitly.</p>

<h3>Example: the training-lab policy in IPv6</h3>
<p>Suppose the extended-ACL lab is dual-stacked: the lab subnet is 2001:db8:40::/64 and the web server is 2001:db8:31::80. The same policy on R1 Gi0/2 inbound:</p>
<pre class="code">R1(config)# ipv6 access-list LAB6-IN
R1(config-ipv6-acl)# remark TRAINING-LAB policy, IPv6
R1(config-ipv6-acl)# deny icmp 2001:db8:40::/64 any echo-request
R1(config-ipv6-acl)# permit tcp 2001:db8:40::/64 host 2001:db8:31::80 eq www
R1(config-ipv6-acl)# permit tcp 2001:db8:40::/64 host 2001:db8:31::80 eq 443
R1(config-ipv6-acl)# permit tcp 2001:db8:40::/64 any eq 22
<span class="c">! keep neighbour and router discovery working before the logged deny</span>
R1(config-ipv6-acl)# permit icmp any any nd-ns
R1(config-ipv6-acl)# permit icmp any any nd-na
R1(config-ipv6-acl)# permit icmp any any router-solicitation
R1(config-ipv6-acl)# deny ipv6 any any log
R1(config-ipv6-acl)# exit
R1(config)# interface GigabitEthernet0/2
R1(config-if)# ipv6 traffic-filter LAB6-IN in</pre>
<pre class="out">R1# show ipv6 access-list LAB6-IN
IPv6 access list LAB6-IN
    deny icmp 2001:DB8:40::/64 any echo-request (5 matches) sequence 10
    permit tcp 2001:DB8:40::/64 host 2001:DB8:31::80 eq www (9 matches) sequence 20
    permit tcp 2001:DB8:40::/64 host 2001:DB8:31::80 eq 443 sequence 30
    permit tcp 2001:DB8:40::/64 any eq 22 (4 matches) sequence 40
    <span class="hl">permit icmp any any nd-ns (12 matches) sequence 50</span>
    permit icmp any any nd-na (11 matches) sequence 60
    permit icmp any any router-solicitation (2 matches) sequence 70
    deny ipv6 any any log (3 matches) sequence 80</pre>
<p>Note that IOS prints the sequence number at the <b>end</b> of each IPv6 line, and the ICMPv6 ping keyword is <code>echo-request</code>, not <code>echo</code>. Check the interface with <code>show ipv6 interface g0/2</code>, which lists the inbound and outgoing access lists.</p>

<div class="eg"><p><b>Worked example: insert a line.</b> To allow the lab to reach a DNS server 2001:db8:31::53 over UDP, insert it before the logged deny: <code>ipv6 access-list LAB6-IN</code>, then <code>sequence 45 permit udp 2001:db8:40::/64 host 2001:db8:31::53 eq domain</code>. Without the <code>sequence</code> keyword the line would land after sequence 80 and never match.</p></div>

<div class="warn"><p><b>Common mistake.</b> Blocking all ICMPv6 "for security". IPv6 needs ICMPv6 for neighbour discovery, router discovery and Packet Too Big messages (routers do not fragment in IPv6). Block specific types such as echo-request where policy demands it, not ICMPv6 as a whole.</p></div>

<div class="exam"><p><b>Exam trap.</b> The exam expects you to know that IPv6 ACLs are applied with <code>ipv6 traffic-filter</code>, not <code>ipv6 access-group</code>, and that the implicit entries permit NS and NA before denying everything else.</p></div>

<div class="scn"><h4>Dual-stack users lost IPv6 after a clean-up</h4><p>An ISP engineer tidied up a customer edge router and appended <code>deny ipv6 any any log</code> to every IPv6 ACL "for visibility". Within minutes IPv6 on the customer LAN failed while IPv4 kept working. The logs showed denied ICMPv6 type 135 and 136 packets: neighbour solicitations and advertisements. The explicit deny had shadowed the hidden ND permits. Adding <code>permit icmp any any nd-ns</code> and <code>permit icmp any any nd-na</code> above the deny restored service.</p><p><b>Lesson:</b> in IPv6, an explicit final deny must be preceded by explicit ND permits.</p></div>

<div class="iv"><p class="q">"How do IPv6 ACLs differ from IPv4 ACLs?"</p><p>Strong answer: IPv6 ACLs are named only, use prefix lengths instead of wildcards, have no standard or extended split, are applied with <code>ipv6 traffic-filter</code> (and <code>ipv6 access-class</code> on VTY), and insert entries with the <code>sequence</code> keyword. Most importantly, they end with implicit permits for ND NS and NA before the implicit deny, so an explicit <code>deny ipv6 any any</code> must be preceded by ND permits. Mention that RS and RA are not implicitly permitted.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IPv6 ACLs: named only, prefix lengths, created with <code>ipv6 access-list NAME</code>.</li>
<li>Apply with <code>ipv6 traffic-filter NAME in|out</code>; VTY with <code>ipv6 access-class</code>.</li>
<li>Hidden last lines: permit nd-na, permit nd-ns, deny ipv6 any any.</li>
<li>An explicit final deny shadows the ND permits; add them back above it. RS and RA are not implicit.</li>
<li>Insert with <code>sequence N</code>; IOS shows the sequence at the end of each line.</li>
</ul></div>
`,hi:`
<p>IPv4 se IPv6 ACLs par jaana ek Maruti se nayi Maruti model par jaane jaisa hai: steering, pedals aur road rules same hain, par kuch switches ki jagah badal gayi hai aur ek nayi warning light bahut matter karti hai. First-match logic, top-down order aur placement ki soch nahi badalti. Syntax, list apply karne ka tareeka aur end ki chhupi entries alag hain. Aur IPv6 ICMPv6 par itna depend karta hai ki laaparwah ACLs basic connectivity tod dete hain.</p>

<h3>Kya same rehta hai</h3>
<ul>
<li>Top-down processing, first match jeetta hai, end mein implicit deny.</li>
<li>Specific entries general se pehle.</li>
<li>Jab destination aur service match kar sako to source ke paas filter karo.</li>
<li>Har interface, har direction par ek IPv6 ACL. Yeh same interface par IPv4 ACL ke saath reh sakta hai, kyunki dono alag protocols hain.</li>
</ul>

<h3>Kya badalta hai</h3>
<table class="cmp">
<tr><th>Topic</th><th>IPv4</th><th>IPv6</th></tr>
<tr><td>Type</td><td>Standard ya extended, numbered ya named</td><td><b>Sirf named</b>, ability mein hamesha "extended"</td></tr>
<tr><td>Banana</td><td><code>ip access-list extended NAME</code></td><td><code>ipv6 access-list NAME</code></td></tr>
<tr><td>Address matching</td><td>Address plus wildcard</td><td><b>Prefix length</b>: <code>2001:db8:40::/64</code>, plus <code>host</code> aur <code>any</code></td></tr>
<tr><td>Interface par apply</td><td><code>ip access-group NAME in</code></td><td><code>ipv6 traffic-filter NAME in</code></td></tr>
<tr><td>VTY par apply</td><td><code>access-class NAME in</code></td><td><code>ipv6 access-class NAME in</code></td></tr>
<tr><td>Entry insert karna</td><td><code>15 permit ...</code></td><td><code>sequence 15 permit ...</code></td></tr>
<tr><td>Chhupi aakhri lines</td><td><code>deny any</code></td><td><code>permit icmp any any nd-na</code>, <code>permit icmp any any nd-ns</code>, <code>deny ipv6 any any</code></td></tr>
</table>

<h3>Implicit neighbour discovery permits</h3>
<p>IPv6 mein ARP nahi hai. Hosts aur routers ek doosre ke MAC addresses <b>Neighbor Solicitation (NS)</b> aur <b>Neighbor Advertisement (NA)</b> se dhoondte hain, jo ICMPv6 messages hain. Agar IPv6 ACL inhe chupchaap drop kar de, to link par koi baat hi nahi kar paayega. Isliye har IPv6 ACL teen invisible entries par khatam hota hai:</p>
<pre class="code">permit icmp any any nd-na
permit icmp any any nd-ns
deny ipv6 any any</pre>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="IPv6 ACL ki implicit entries">
<rect x="150" y="20" width="340" height="34" rx="6" fill="#e2e8f0"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">aapki entries (sequence 10, 20, 30 ...)</text>
<rect x="150" y="62" width="340" height="34" rx="6" fill="#fed7aa"/><text x="320" y="84" text-anchor="middle" class="svg-ink" font-size="13">optional: deny ipv6 any any log</text>
<rect x="150" y="112" width="340" height="30" rx="6" fill="#bbf7d0" stroke="#64748b" stroke-dasharray="4 3"/><text x="320" y="132" text-anchor="middle" class="svg-ink" font-size="13">implicit permit icmp any any nd-na</text>
<rect x="150" y="148" width="340" height="30" rx="6" fill="#bbf7d0" stroke="#64748b" stroke-dasharray="4 3"/><text x="320" y="168" text-anchor="middle" class="svg-ink" font-size="13">implicit permit icmp any any nd-ns</text>
<rect x="150" y="184" width="340" height="30" rx="6" fill="#e2e8f0" stroke="#64748b" stroke-dasharray="4 3"/><text x="320" y="204" text-anchor="middle" class="svg-ink" font-size="13">implicit deny ipv6 any any</text>
<text x="575" y="84" text-anchor="middle" class="svg-accent" font-size="12">NS/NA pehle</text><text x="575" y="100" text-anchor="middle" class="svg-accent" font-size="12">pakad leta hai!</text>
<line x1="490" y1="79" x2="530" y2="79" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Chhupe ND permits ke upar explicit deny NS aur NA ko pehle match karta hai aur neighbour discovery tod deta hai.</p></div>

<p>Trap yeh hai: agar aap end mein apna <code>deny ipv6 any any log</code> jodte ho (IPv4 mein achhi aadat), to woh chhupe ND permits ke <b>upar</b> baithta hai. Ab NS aur NA pehle aapke deny se match hote hain, neighbour discovery fail hoti hai, aur hosts router ka link-layer address resolve nahi kar paate. Fix hai deny se pehle ND permits explicitly jodna. Yeh bhi dhyan do ki <b>router solicitations aur router advertisements implicitly permit nahi hote</b>; agar inbound ACL ko hosts ke RS messages allow karne hain, ya ACL upstream router ke RAs filter karta hai, to <code>router-solicitation</code> ya <code>router-advertisement</code> explicitly permit karo.</p>

<h3>Example: training-lab policy IPv6 mein</h3>
<p>Maan lo extended-ACL lab dual-stack hai: lab subnet 2001:db8:40::/64 hai aur web server 2001:db8:31::80. R1 Gi0/2 inbound par wahi policy:</p>
<pre class="code">R1(config)# ipv6 access-list LAB6-IN
R1(config-ipv6-acl)# remark TRAINING-LAB policy, IPv6
R1(config-ipv6-acl)# deny icmp 2001:db8:40::/64 any echo-request
R1(config-ipv6-acl)# permit tcp 2001:db8:40::/64 host 2001:db8:31::80 eq www
R1(config-ipv6-acl)# permit tcp 2001:db8:40::/64 host 2001:db8:31::80 eq 443
R1(config-ipv6-acl)# permit tcp 2001:db8:40::/64 any eq 22
<span class="c">! logged deny se pehle neighbour aur router discovery chalu rakho</span>
R1(config-ipv6-acl)# permit icmp any any nd-ns
R1(config-ipv6-acl)# permit icmp any any nd-na
R1(config-ipv6-acl)# permit icmp any any router-solicitation
R1(config-ipv6-acl)# deny ipv6 any any log
R1(config-ipv6-acl)# exit
R1(config)# interface GigabitEthernet0/2
R1(config-if)# ipv6 traffic-filter LAB6-IN in</pre>
<pre class="out">R1# show ipv6 access-list LAB6-IN
IPv6 access list LAB6-IN
    deny icmp 2001:DB8:40::/64 any echo-request (5 matches) sequence 10
    permit tcp 2001:DB8:40::/64 host 2001:DB8:31::80 eq www (9 matches) sequence 20
    permit tcp 2001:DB8:40::/64 host 2001:DB8:31::80 eq 443 sequence 30
    permit tcp 2001:DB8:40::/64 any eq 22 (4 matches) sequence 40
    <span class="hl">permit icmp any any nd-ns (12 matches) sequence 50</span>
    permit icmp any any nd-na (11 matches) sequence 60
    permit icmp any any router-solicitation (2 matches) sequence 70
    deny ipv6 any any log (3 matches) sequence 80</pre>
<p>Dhyan do ki IOS har IPv6 line ke <b>end</b> mein sequence number print karta hai, aur ICMPv6 ping ka keyword <code>echo-request</code> hai, <code>echo</code> nahi. Interface ko <code>show ipv6 interface g0/2</code> se check karo, jo inbound aur outgoing access lists dikhata hai.</p>

<div class="eg"><p><b>Worked example: line insert karo.</b> Lab ko UDP par DNS server 2001:db8:31::53 tak pahunchane ke liye, use logged deny se pehle insert karo: <code>ipv6 access-list LAB6-IN</code>, phir <code>sequence 45 permit udp 2001:db8:40::/64 host 2001:db8:31::53 eq domain</code>. <code>sequence</code> keyword ke bina line sequence 80 ke baad jaati aur kabhi match nahi karti.</p></div>

<div class="warn"><p><b>Common galti.</b> "Security ke liye" saara ICMPv6 block karna. IPv6 ko neighbour discovery, router discovery aur Packet Too Big messages (IPv6 mein routers fragment nahi karte) ke liye ICMPv6 chahiye. Policy jahan maange wahan echo-request jaise specific types block karo, poora ICMPv6 nahi.</p></div>

<div class="exam"><p><b>Exam trap.</b> Exam expect karta hai ki aapko pata ho IPv6 ACLs <code>ipv6 traffic-filter</code> se apply hote hain, <code>ipv6 access-group</code> se nahi, aur implicit entries baaki sab deny karne se pehle NS aur NA permit karti hain.</p></div>

<div class="scn"><h4>Clean-up ke baad dual-stack users ka IPv6 chala gaya</h4><p>Ek ISP engineer ne customer edge router saaf kiya aur "visibility ke liye" har IPv6 ACL mein <code>deny ipv6 any any log</code> jod diya. Kuch hi minutes mein customer LAN par IPv6 fail ho gaya jabki IPv4 chalta raha. Logs mein denied ICMPv6 type 135 aur 136 packets dikhe: neighbour solicitations aur advertisements. Explicit deny ne chhupe ND permits ko shadow kar diya tha. Deny ke upar <code>permit icmp any any nd-ns</code> aur <code>permit icmp any any nd-na</code> jodne se service wapas aa gayi.</p><p><b>Seekh:</b> IPv6 mein explicit final deny se pehle explicit ND permits hone chahiye.</p></div>

<div class="iv"><p class="q">"IPv6 ACLs IPv4 ACLs se kaise alag hain?"</p><p>Strong answer: IPv6 ACLs sirf named hote hain, wildcards ki jagah prefix lengths use karte hain, standard ya extended split nahi hota, <code>ipv6 traffic-filter</code> se apply hote hain (aur VTY par <code>ipv6 access-class</code>), aur entries <code>sequence</code> keyword se insert hoti hain. Sabse zaroori, yeh implicit deny se pehle ND NS aur NA ke implicit permits par khatam hote hain, isliye explicit <code>deny ipv6 any any</code> se pehle ND permits hone chahiye. Batao ki RS aur RA implicitly permit nahi hote.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IPv6 ACLs: sirf named, prefix lengths, <code>ipv6 access-list NAME</code> se bante hain.</li>
<li><code>ipv6 traffic-filter NAME in|out</code> se apply karo; VTY par <code>ipv6 access-class</code>.</li>
<li>Chhupi aakhri lines: permit nd-na, permit nd-ns, deny ipv6 any any.</li>
<li>Explicit final deny ND permits ko shadow karta hai; unhe uske upar wapas jodo. RS aur RA implicit nahi hain.</li>
<li><code>sequence N</code> se insert karo; IOS har line ke end mein sequence dikhata hai.</li>
</ul></div>
`}};export{e as default};