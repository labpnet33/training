var e={id:`ipv6-traffic-filter`,h:{en:`IPv6 traffic filters: implicit ND permits and the deny that breaks them`,hi:`IPv6 traffic filters: implicit ND permits aur woh deny jo unhe tod deta hai`},body:{en:`
<p>Imagine the office tower adds a second entrance for a new wing. The old door list was carefully written, but nobody wrote one for the new door, so anyone can walk in. That is the situation in many dual-stack networks: IPv4 is filtered, IPv6 is not, and IPv6 is often preferred by the hosts. The lab in this chapter fixes exactly that. And the new door has one extra rule: the building's intercom system (Neighbor Discovery) must always be allowed, or the whole wing goes silent.</p>

<h3>What is different from IPv4</h3>
<table class="cmp"><tr><th>Topic</th><th>IPv4 ACL</th><th>IPv6 ACL</th></tr>
<tr><td>Numbered or named</td><td>Both</td><td><b>Named only</b></td></tr>
<tr><td>Standard / extended</td><td>Both types</td><td>One type, always extended style</td></tr>
<tr><td>Address format</td><td>Address + wildcard</td><td><code>prefix/length</code>, <code>host X</code>, <code>any</code></td></tr>
<tr><td>Apply to interface</td><td><code>ip access-group NAME in</code></td><td><code>ipv6 traffic-filter NAME in</code></td></tr>
<tr><td>Apply to VTY</td><td><code>access-class NAME in</code></td><td><code>ipv6 access-class NAME in</code></td></tr>
<tr><td>Implicit end</td><td><code>deny ip any any</code></td><td><code>permit icmp any any nd-na</code>, <code>permit icmp any any nd-ns</code>, <code>deny ipv6 any any</code></td></tr>
<tr><td>Sequence shown</td><td>At the start of each line</td><td>At the <b>end</b> of each line</td></tr></table>

<h3>Why ND needs the implicit permits</h3>
<p>IPv6 has no ARP. A router or host finds the MAC address of a neighbour with <b>Neighbor Solicitation</b> (NS, ICMPv6 type 135) and gets the answer in a <b>Neighbor Advertisement</b> (NA, type 136). If an inbound filter dropped NS and NA, neighbours could never be resolved and nothing on the link would work. So IOS appends two hidden permits for <code>nd-ns</code> and <code>nd-na</code> before the hidden <code>deny ipv6 any any</code>.</p>
<p>Here is the trap. If you add your own <b>explicit</b> <code>deny ipv6 any any log</code> at the end, for logging, the packet matches your line first and never reaches the hidden ND permits. ND breaks, neighbours go INCOMPLETE and traffic dies, even for things you meant to permit. If you need an explicit final deny, put the ND permits above it yourself. Also remember that <b>Router Solicitation</b> (RS, type 133) and <b>Router Advertisement</b> (RA, type 134) are <b>not</b> implicitly permitted: an inbound filter on an interface where the router learns its address by SLAAC must permit <code>router-advertisement</code>. Permit ICMPv6 <code>packet-too-big</code> too, because IPv6 routers never fragment and path MTU discovery depends on it.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="IPv6 ACL lab topology">
<rect x="250" y="85" width="140" height="60" rx="10" fill="#bae6fd"/><text x="320" y="112" text-anchor="middle" class="svg-ink" font-size="14">R1</text><text x="320" y="131" text-anchor="middle" class="svg-muted" font-size="12">GUEST-IN on Gi0/1 in</text>
<rect x="20" y="20" width="170" height="50" rx="8" fill="#bbf7d0"/><text x="105" y="42" text-anchor="middle" class="svg-ink" font-size="13">PC-STAFF</text><text x="105" y="59" text-anchor="middle" class="svg-muted" font-size="12">2001:db8:10::/64</text>
<rect x="20" y="160" width="170" height="50" rx="8" fill="#fed7aa"/><text x="105" y="182" text-anchor="middle" class="svg-ink" font-size="13">PC-GUEST</text><text x="105" y="199" text-anchor="middle" class="svg-muted" font-size="12">2001:db8:20::/64</text>
<rect x="450" y="90" width="170" height="50" rx="8" fill="#ddd6fe"/><text x="535" y="112" text-anchor="middle" class="svg-ink" font-size="13">SRV6 ::10</text><text x="535" y="129" text-anchor="middle" class="svg-muted" font-size="12">2001:db8:99::/64</text>
<line x1="190" y1="45" x2="250" y2="100" stroke="#64748b" stroke-width="2"/><line x1="190" y1="185" x2="250" y2="130" stroke="#64748b" stroke-width="2"/><line x1="390" y1="115" x2="450" y2="115" stroke="#64748b" stroke-width="2"/>
<text x="215" y="60" class="svg-muted" font-size="12">Gi0/0</text><text x="215" y="190" class="svg-accent" font-size="12">Gi0/1</text><text x="400" y="105" class="svg-muted" font-size="12">Gi0/2</text>
</svg><p class="cap">The lab: guests must not reach the server LAN over IPv6, except for a ping to the file server.</p></div>

<h3>The lab configuration, step by step</h3>
<pre class="code">R1(config)# ipv6 access-list GUEST-IN
R1(config-ipv6-acl)# deny ipv6 2001:db8:20::/64 2001:db8:99::/64
R1(config-ipv6-acl)# permit ipv6 any any
<span class="c">! insert the exception above the deny: sequence 5</span>
R1(config-ipv6-acl)# sequence 5 permit icmp 2001:db8:20::/64 host 2001:db8:99::10 echo-request
R1(config-ipv6-acl)# exit
R1(config)# interface GigabitEthernet0/1
R1(config-if)# ipv6 traffic-filter GUEST-IN in</pre>
<p>The first two lines get sequence numbers 10 and 20 automatically. Sequence 5 lands above both. The echo-reply from SRV6 is not filtered, because GUEST-IN only checks packets entering Gi0/1; the reply leaves through Gi0/1. After a guest ping and a guest UDP flow to port 445, the counters show both entries working:</p>
<pre class="out">R1# show ipv6 access-list GUEST-IN
IPv6 access list GUEST-IN
    permit icmp 2001:DB8:20::/64 host 2001:DB8:99::10 echo-request (5 matches) <span class="hl">sequence 5</span>
    deny ipv6 2001:DB8:20::/64 2001:DB8:99::/64 (3 matches) <span class="hl">sequence 10</span>
    permit ipv6 any any (41 matches) sequence 20

R1# show ipv6 interface GigabitEthernet0/1 | include Access|access
  <span class="hl">Input features: Access List</span>
  Inbound access list GUEST-IN</pre>

<div class="eg"><p><b>Worked example: the log line that broke the LAN.</b> Security asks for logging of everything denied, so an engineer replaces <code>permit ipv6 any any</code> with specific permits and adds <code>deny ipv6 any any log</code> at sequence 100. Within a minute guests lose even the staff LAN. <code>show ipv6 neighbors</code> on PC-GUEST's router shows entries stuck in INCMP. The NS packets from guests to R1 now hit sequence 100. Fix: <code>sequence 90 permit icmp any any nd-ns</code> and <code>sequence 95 permit icmp any any nd-na</code>, plus <code>router-solicitation</code> if hosts need an RA on demand.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Typing <code>ip access-group</code> or <code>ipv6 access-group</code> on the interface; the IPv6 command is <code>ipv6 traffic-filter</code>. Forgetting that link-local addresses (fe80::/10) are the source of ND and routing protocol packets, so a filter that permits only global prefixes can break OSPFv3 or EIGRP for IPv6 unless you permit them. Writing IPv4-style wildcards; IPv6 uses prefix lengths only.</p></div>

<div class="exam"><p><b>Exam trap.</b> The implicit ND permits cover only NS and NA, not RS and RA. And an explicit <code>deny ipv6 any any</code> placed by you is evaluated before the implicit permits, which is why it breaks ND. In <code>show ipv6 access-list</code> the sequence number is printed at the end of each line.</p></div>

<div class="scn"><h4>The dual-stack back door</h4><p>A penetration test found that guests could reach the finance file server even though the IPv4 ACL on the guest VLAN was perfect. The hosts preferred IPv6, SLAAC gave them global addresses, and no IPv6 filter existed. The engineer wrote GUEST-IN with a deny for the server prefix and a final permit, applied it with <code>ipv6 traffic-filter GUEST-IN in</code>, and verified with <code>show ipv6 access-list</code> that the deny counter increased during a retest.</p><p><b>Lesson:</b> every IPv4 filter needs an IPv6 twin on dual-stack interfaces.</p></div>

<div class="iv"><p class="q">"Why can an explicit deny ipv6 any any at the end of an IPv6 ACL break a network, when an explicit deny ip any any in IPv4 does not?"</p><p>Strong answer: IPv6 ACLs have implicit permits for Neighbor Discovery NS and NA placed just before the implicit deny. An explicit deny is matched first, so NS and NA are dropped, address resolution fails and neighbours stay incomplete. IPv4 uses ARP, which is not IP and not filtered by an IP ACL. The fix is to permit nd-ns and nd-na (and RS/RA where needed) above the explicit deny.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IPv6 ACLs are named only, use prefix lengths and are applied with <code>ipv6 traffic-filter</code>.</li>
<li>The hidden end is: permit nd-na, permit nd-ns, deny ipv6 any any.</li>
<li>An explicit final deny blocks ND unless you permit NS and NA above it; RS and RA are never implicit.</li>
<li>Insert exceptions with <code>sequence N</code>; the sequence is shown at the end of each line.</li>
<li>On dual-stack interfaces, filter IPv6 as carefully as IPv4.</li>
</ul></div>
`,hi:`
<p>Socho office tower ek naye wing ke liye doosra entrance jodta hai. Purani door list dhyan se likhi gayi thi, lekin naye darwaze ke liye kisi ne list nahi likhi, isliye koi bhi andar aa sakta hai. Kai dual-stack networks ki yahi haalat hai: IPv4 filter hota hai, IPv6 nahi, aur hosts aksar IPv6 ko prefer karte hain. Is chapter ka lab bilkul yahi theek karta hai. Aur naye darwaze ka ek extra niyam hai: building ka intercom system (Neighbor Discovery) hamesha allowed hona chahiye, warna poora wing chup ho jaata hai.</p>

<h3>IPv4 se kya alag hai</h3>
<table class="cmp"><tr><th>Topic</th><th>IPv4 ACL</th><th>IPv6 ACL</th></tr>
<tr><td>Numbered ya named</td><td>Dono</td><td><b>Sirf named</b></td></tr>
<tr><td>Standard / extended</td><td>Dono types</td><td>Ek type, hamesha extended jaisi</td></tr>
<tr><td>Address format</td><td>Address + wildcard</td><td><code>prefix/length</code>, <code>host X</code>, <code>any</code></td></tr>
<tr><td>Interface par apply</td><td><code>ip access-group NAME in</code></td><td><code>ipv6 traffic-filter NAME in</code></td></tr>
<tr><td>VTY par apply</td><td><code>access-class NAME in</code></td><td><code>ipv6 access-class NAME in</code></td></tr>
<tr><td>Implicit end</td><td><code>deny ip any any</code></td><td><code>permit icmp any any nd-na</code>, <code>permit icmp any any nd-ns</code>, <code>deny ipv6 any any</code></td></tr>
<tr><td>Sequence kahan dikhta hai</td><td>Har line ke shuru mein</td><td>Har line ke <b>aakhir</b> mein</td></tr></table>

<h3>ND ko implicit permits kyun chahiye</h3>
<p>IPv6 mein ARP nahi hai. Router ya host neighbour ka MAC address <b>Neighbor Solicitation</b> (NS, ICMPv6 type 135) se dhoondhta hai aur jawab <b>Neighbor Advertisement</b> (NA, type 136) mein milta hai. Agar inbound filter NS aur NA drop kar de, to neighbours kabhi resolve nahi honge aur link par kuch kaam nahi karega. Isliye IOS hidden <code>deny ipv6 any any</code> se pehle <code>nd-ns</code> aur <code>nd-na</code> ke do hidden permits jod deta hai.</p>
<p>Yahi trap hai. Agar aap logging ke liye aakhir mein apna <b>explicit</b> <code>deny ipv6 any any log</code> jodte ho, to packet pehle aapki line se match karta hai aur hidden ND permits tak kabhi nahi pahunchta. ND toot jaata hai, neighbours INCOMPLETE ho jaate hain aur traffic mar jaata hai, un cheezon ka bhi jo aap permit karna chahte the. Agar explicit final deny chahiye, to ND permits khud uske upar rakho. Yeh bhi yaad rakho ki <b>Router Solicitation</b> (RS, type 133) aur <b>Router Advertisement</b> (RA, type 134) implicitly permit <b>nahi</b> hote: jis interface par router SLAAC se apna address seekhta hai, wahan ke inbound filter ko <code>router-advertisement</code> permit karna hoga. ICMPv6 <code>packet-too-big</code> bhi permit karo, kyunki IPv6 routers kabhi fragment nahi karte aur path MTU discovery isi par nirbhar hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="IPv6 ACL lab topology">
<rect x="250" y="85" width="140" height="60" rx="10" fill="#bae6fd"/><text x="320" y="112" text-anchor="middle" class="svg-ink" font-size="14">R1</text><text x="320" y="131" text-anchor="middle" class="svg-muted" font-size="12">GUEST-IN Gi0/1 in par</text>
<rect x="20" y="20" width="170" height="50" rx="8" fill="#bbf7d0"/><text x="105" y="42" text-anchor="middle" class="svg-ink" font-size="13">PC-STAFF</text><text x="105" y="59" text-anchor="middle" class="svg-muted" font-size="12">2001:db8:10::/64</text>
<rect x="20" y="160" width="170" height="50" rx="8" fill="#fed7aa"/><text x="105" y="182" text-anchor="middle" class="svg-ink" font-size="13">PC-GUEST</text><text x="105" y="199" text-anchor="middle" class="svg-muted" font-size="12">2001:db8:20::/64</text>
<rect x="450" y="90" width="170" height="50" rx="8" fill="#ddd6fe"/><text x="535" y="112" text-anchor="middle" class="svg-ink" font-size="13">SRV6 ::10</text><text x="535" y="129" text-anchor="middle" class="svg-muted" font-size="12">2001:db8:99::/64</text>
<line x1="190" y1="45" x2="250" y2="100" stroke="#64748b" stroke-width="2"/><line x1="190" y1="185" x2="250" y2="130" stroke="#64748b" stroke-width="2"/><line x1="390" y1="115" x2="450" y2="115" stroke="#64748b" stroke-width="2"/>
<text x="215" y="60" class="svg-muted" font-size="12">Gi0/0</text><text x="215" y="190" class="svg-accent" font-size="12">Gi0/1</text><text x="400" y="105" class="svg-muted" font-size="12">Gi0/2</text>
</svg><p class="cap">Lab: guests IPv6 se server LAN tak nahi pahunchne chahiye, sirf file server ko ping chhod kar.</p></div>

<h3>Lab configuration, step by step</h3>
<pre class="code">R1(config)# ipv6 access-list GUEST-IN
R1(config-ipv6-acl)# deny ipv6 2001:db8:20::/64 2001:db8:99::/64
R1(config-ipv6-acl)# permit ipv6 any any
<span class="c">! insert the exception above the deny: sequence 5</span>
R1(config-ipv6-acl)# sequence 5 permit icmp 2001:db8:20::/64 host 2001:db8:99::10 echo-request
R1(config-ipv6-acl)# exit
R1(config)# interface GigabitEthernet0/1
R1(config-if)# ipv6 traffic-filter GUEST-IN in</pre>
<p>Pehli do lines ko apne aap sequence numbers 10 aur 20 milte hain. Sequence 5 dono ke upar aata hai. SRV6 ka echo-reply filter nahi hota, kyunki GUEST-IN sirf Gi0/1 mein ghusne wale packets check karti hai; reply Gi0/1 se bahar jaata hai. Guest ping aur port 445 tak guest UDP flow ke baad counters dono entries ko kaam karte dikhate hain:</p>
<pre class="out">R1# show ipv6 access-list GUEST-IN
IPv6 access list GUEST-IN
    permit icmp 2001:DB8:20::/64 host 2001:DB8:99::10 echo-request (5 matches) <span class="hl">sequence 5</span>
    deny ipv6 2001:DB8:20::/64 2001:DB8:99::/64 (3 matches) <span class="hl">sequence 10</span>
    permit ipv6 any any (41 matches) sequence 20

R1# show ipv6 interface GigabitEthernet0/1 | include Access|access
  <span class="hl">Input features: Access List</span>
  Inbound access list GUEST-IN</pre>

<div class="eg"><p><b>Worked example: woh log line jisne LAN tod diya.</b> Security har deny ki logging maangti hai, isliye ek engineer <code>permit ipv6 any any</code> ko specific permits se badalta hai aur sequence 100 par <code>deny ipv6 any any log</code> jodta hai. Ek minute mein guests staff LAN bhi kho dete hain. PC-GUEST ke router par <code>show ipv6 neighbors</code> INCMP mein atki entries dikhata hai. Guests ke R1 ki taraf NS packets ab sequence 100 se takraate hain. Fix: <code>sequence 90 permit icmp any any nd-ns</code> aur <code>sequence 95 permit icmp any any nd-na</code>, plus <code>router-solicitation</code> agar hosts ko maangne par RA chahiye.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Interface par <code>ip access-group</code> ya <code>ipv6 access-group</code> type karna; IPv6 command <code>ipv6 traffic-filter</code> hai. Bhool jaana ki link-local addresses (fe80::/10) ND aur routing protocol packets ka source hote hain, isliye sirf global prefixes permit karne wala filter OSPFv3 ya EIGRP for IPv6 tod sakta hai jab tak aap unhe permit na karo. IPv4 jaise wildcards likhna; IPv6 sirf prefix lengths use karta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Implicit ND permits sirf NS aur NA cover karte hain, RS aur RA nahi. Aur aapka rakha explicit <code>deny ipv6 any any</code> implicit permits se pehle evaluate hota hai, isiliye woh ND todta hai. <code>show ipv6 access-list</code> mein sequence number har line ke aakhir mein print hota hai.</p></div>

<div class="scn"><h4>Dual-stack ka pichhla darwaza</h4><p>Ek penetration test mein pata chala ki guests finance file server tak pahunch sakte the, bhale hi guest VLAN par IPv4 ACL perfect thi. Hosts IPv6 prefer karte the, SLAAC ne unhe global addresses de diye the, aur koi IPv6 filter tha hi nahi. Engineer ne server prefix ke liye deny aur aakhri permit ke saath GUEST-IN likhi, use <code>ipv6 traffic-filter GUEST-IN in</code> se lagaya, aur retest ke dauraan <code>show ipv6 access-list</code> se verify kiya ki deny counter badha.</p><p><b>Seekh:</b> dual-stack interfaces par har IPv4 filter ka ek IPv6 judwa chahiye.</p></div>

<div class="iv"><p class="q">"IPv6 ACL ke end mein explicit deny ipv6 any any network kyun tod sakta hai, jabki IPv4 mein explicit deny ip any any nahi todta?"</p><p>Strong answer: IPv6 ACLs mein Neighbor Discovery NS aur NA ke implicit permits hote hain jo implicit deny se theek pehle rakhe jaate hain. Explicit deny pehle match hota hai, isliye NS aur NA drop hote hain, address resolution fail hota hai aur neighbours incomplete rehte hain. IPv4 ARP use karta hai, jo IP nahi hai aur IP ACL se filter nahi hota. Fix hai explicit deny ke upar nd-ns aur nd-na (aur zaroorat ho to RS/RA) permit karna.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IPv6 ACLs sirf named hoti hain, prefix lengths use karti hain aur <code>ipv6 traffic-filter</code> se lagti hain.</li>
<li>Hidden end hai: permit nd-na, permit nd-ns, deny ipv6 any any.</li>
<li>Explicit final deny ND ko block karta hai jab tak aap uske upar NS aur NA permit na karo; RS aur RA kabhi implicit nahi hote.</li>
<li><code>sequence N</code> se exceptions insert karo; sequence har line ke aakhir mein dikhta hai.</li>
<li>Dual-stack interfaces par IPv6 ko IPv4 jitni saavdhani se filter karo.</li>
</ul></div>
`}};export{e as default};