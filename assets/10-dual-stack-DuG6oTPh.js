var e={id:`dual-stack`,h:{en:`Dual stack, transition methods and the verification toolkit`,hi:`Dual stack, transition methods aur verification toolkit`},body:{en:`
<p>Picture an office in Bengaluru where every employee speaks both Kannada and English. They talk to each visitor in whichever language the visitor knows. That is <b>dual stack</b>. If a letter written in one language must cross a region that only understands the other, you seal it inside an envelope in the local language: that is <b>tunnelling</b>. And if two people share no language at all, you hire an interpreter: that is <b>translation</b>. The world will run IPv4 and IPv6 together for many years, and these three methods are how they coexist.</p>

<h3>Dual stack: the preferred approach</h3>
<p>Every interface, router and host runs <b>both</b> IPv4 and IPv6 at the same time. Each protocol has its own addresses, its own routing table, its own neighbour table and its own ACLs. Nothing is converted.</p>
<pre class="code"><span class="c">! One router interface, two protocols</span>
R1(config)# ipv6 unicast-routing
R1(config)# interface g0/1
R1(config-if)# ip address 10.10.10.1 255.255.255.0
R1(config-if)# ipv6 address 2001:db8:acad:10::1/64
R1(config-if)# no shutdown</pre>
<p>Which protocol does a dual-stack host use? DNS may return both an A record (IPv4) and an AAAA record (IPv6). By default, operating systems prefer IPv6, and modern applications use <b>Happy Eyeballs</b>: they try IPv6 first and IPv4 a fraction of a second later, and keep whichever connects first. So a broken IPv6 path usually shows up as <b>slowness</b>, not as a hard failure.</p>

<h3>Tunnelling: IPv6 inside IPv4</h3>
<p>When two IPv6 islands are separated by an IPv4-only network, the edge routers put each IPv6 packet inside an IPv4 packet. A <b>manual 6in4</b> tunnel uses IPv4 protocol number <b>41</b>; a <b>GRE</b> tunnel (protocol 47) can carry IPv6 as well. Older automatic methods (6to4, ISATAP, Teredo) are deprecated.</p>
<pre class="code"><span class="c">! Manual IPv6-in-IPv4 tunnel on an edge router</span>
R1(config)# interface tunnel0
R1(config-if)# ipv6 address 2001:db8:ffff::1/64
R1(config-if)# tunnel source g0/2
R1(config-if)# tunnel destination 203.0.113.2
R1(config-if)# tunnel mode ipv6ip</pre>

<h3>Translation: NAT64 and DNS64</h3>
<p>An IPv6-only client cannot talk to an IPv4-only server directly. <b>NAT64</b> translates between them, and <b>DNS64</b> invents an AAAA record for IPv4-only names by embedding the IPv4 address inside a special prefix, usually the well-known <code>64:ff9b::/96</code>. The client connects to <code>64:ff9b::c000:20a</code> (which contains 192.0.2.10), and the NAT64 box translates. Many mobile networks run IPv6-only access and use this, plus a small translator on the phone (464XLAT) for apps that still need IPv4.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Transition methods">
<rect x="20" y="20" width="180" height="60" rx="8" fill="#bbf7d0"/><text x="110" y="45" text-anchor="middle" class="svg-ink" font-size="13">Dual stack</text><text x="110" y="64" text-anchor="middle" class="svg-muted" font-size="12">IPv4 + IPv6 side by side</text>
<rect x="230" y="20" width="180" height="60" rx="8" fill="#fde68a"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="13">Tunnelling</text><text x="320" y="64" text-anchor="middle" class="svg-muted" font-size="12">IPv6 inside IPv4 (41, GRE)</text>
<rect x="440" y="20" width="180" height="60" rx="8" fill="#ddd6fe"/><text x="530" y="45" text-anchor="middle" class="svg-ink" font-size="13">Translation</text><text x="530" y="64" text-anchor="middle" class="svg-muted" font-size="12">NAT64 + DNS64</text>
<rect x="20" y="130" width="120" height="40" rx="6" fill="#bae6fd"/><text x="80" y="155" text-anchor="middle" class="svg-ink" font-size="12">v6 island</text>
<rect x="250" y="130" width="140" height="40" rx="6" fill="#e2e8f0"/><text x="320" y="155" text-anchor="middle" class="svg-ink" font-size="12">IPv4-only core</text>
<rect x="500" y="130" width="120" height="40" rx="6" fill="#bae6fd"/><text x="560" y="155" text-anchor="middle" class="svg-ink" font-size="12">v6 island</text>
<line x1="140" y1="150" x2="500" y2="150" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/>
<text x="320" y="200" text-anchor="middle" class="svg-accent" font-size="12">tunnel0: IPv6 packets ride inside IPv4</text>
</svg><p class="cap">Dual stack is the default choice; tunnels and translation fill the gaps.</p></div>

<h3>Your verification toolkit</h3>
<table class="cmp"><tr><th>Question</th><th>IOS command</th><th>IPv4 twin</th></tr>
<tr><td>Which addresses, is IPv6 up?</td><td><code>show ipv6 interface brief</code></td><td><code>show ip interface brief</code></td></tr>
<tr><td>Groups, DAD, RA timers, M/O flags</td><td><code>show ipv6 interface g0/0</code></td><td><code>show ip interface g0/0</code></td></tr>
<tr><td>Routing table</td><td><code>show ipv6 route</code>, <code>show ipv6 route static</code>, <code>show ipv6 route 2001:db8:3::1</code></td><td><code>show ip route</code></td></tr>
<tr><td>MACs of neighbours</td><td><code>show ipv6 neighbors</code></td><td><code>show ip arp</code></td></tr>
<tr><td>Which routers send RAs here?</td><td><code>show ipv6 routers</code></td><td>none</td></tr>
<tr><td>DHCPv6 server state</td><td><code>show ipv6 dhcp pool</code>, <code>show ipv6 dhcp binding</code></td><td><code>show ip dhcp binding</code></td></tr>
<tr><td>Reachability and path</td><td><code>ping</code>, <code>traceroute</code> (with <code>source</code>)</td><td>same</td></tr>
<tr><td>Live ND events</td><td><code>debug ipv6 nd</code> (lab use)</td><td><code>debug arp</code></td></tr></table>
<p>On hosts: Windows <code>ipconfig /all</code> and <code>netsh interface ipv6 show neighbors</code>; Linux <code>ip -6 addr</code>, <code>ip -6 route</code> and <code>ip -6 neigh</code>; the lab PCs <code>show ipv6</code>.</p>

<div class="eg"><p><b>Worked example.</b> A router shows this; what do you conclude?</p>
<pre class="out">R2# show ipv6 routers
Router FE80::5054:CFF:FE04:4B01 on GigabitEthernet0/0, last update 0 min
  Hops 64, Lifetime 1800 sec, <span class="hl">AddrFlag=0, OtherFlag=0</span>, MTU=1500
  HomeAgentFlag=0, Preference=Medium
  Reachable time 0 (unspecified), Retransmit time 0 (unspecified)
  <span class="hl">Prefix 2001:DB8:CAFE:1::/64 onlink autoconfig</span>
    Valid lifetime 2592000, preferred lifetime 604800</pre>
<p>One router, R1, is advertising on G0/0. M=0 and O=0 mean SLAAC only. The prefix is a /64 with the autoconfig (A) flag, so hosts can build addresses. The lifetime of 1800 seconds means hosts will use R1 as default gateway. This is lab 2 working correctly.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Securing only IPv4 in a dual-stack network: an IPv4 ACL does not filter IPv6, so a server may be wide open over IPv6. Apply <code>ipv6 traffic-filter</code> ACLs with the same intent. Another mistake is publishing AAAA records before the IPv6 path is tested end to end.</p></div>

<div class="exam"><p><b>Exam trap.</b> Dual stack means both protocols run <b>independently</b>, with separate routing tables; nothing is translated. Tunnelling encapsulates, translation (NAT64) converts. IPv6-in-IPv4 is protocol 41.</p></div>

<div class="scn"><h4>The website that took three seconds to open</h4><p>After a data-centre firewall change, users said the intranet portal opened slowly but always opened. Pings to its IPv4 address were instant. The engineer ran <code>nslookup</code> and saw both A and AAAA records, then tested <code>ping 2001:db8:acad:80::10</code> from a client VLAN: no reply. The new firewall policy had been written for IPv4 only, so IPv6 connections were silently dropped; browsers tried IPv6, waited, and fell back to IPv4. After adding the matching IPv6 rule, the portal loaded instantly over IPv6.</p><p><b>Lesson:</b> in dual stack, a broken IPv6 path often looks like slowness. Test both protocols separately.</p></div>

<div class="iv"><p class="q">"What IPv6 transition mechanisms do you know, and which would you recommend?"</p><p>Strong answer: three families. Dual stack runs IPv4 and IPv6 side by side and is the recommended default. Tunnelling carries IPv6 over an IPv4-only network, for example manual 6in4 (protocol 41) or GRE. Translation such as NAT64 with DNS64 lets IPv6-only clients reach IPv4-only servers, common in mobile networks with 464XLAT. Mention that dual stack doubles the policy work: ACLs, firewall rules and monitoring must cover both protocols.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Dual stack: both protocols on every device with separate addresses, routing tables and ACLs; the preferred method.</li>
<li>Hosts prefer IPv6 and use Happy Eyeballs, so a broken IPv6 path usually appears as slowness.</li>
<li>Tunnelling (6in4 protocol 41, GRE) carries IPv6 across IPv4; translation (NAT64/DNS64, 64:ff9b::/96) converts between them.</li>
<li>Core toolkit: show ipv6 interface [brief], show ipv6 route, show ipv6 neighbors, show ipv6 routers, show ipv6 dhcp binding, ping/traceroute with source.</li>
<li>Always secure IPv6 as well as IPv4; IPv4 ACLs do not filter IPv6.</li>
</ul></div>
`,hi:`
<p>Bengaluru ka ek office socho jahan har employee Kannada aur English dono bolta hai. Woh har visitor se usi bhasha mein baat karte hain jo visitor jaanta hai. Yeh <b>dual stack</b> hai. Agar ek bhasha mein likhi chitthi ko aise ilaake se guzarna ho jo sirf doosri bhasha samajhta hai, to aap use local bhasha wale lifaafe mein band kar dete ho: yeh <b>tunnelling</b> hai. Aur agar do logon ki koi common bhasha hi nahi, to aap interpreter rakhte ho: yeh <b>translation</b> hai. Duniya kai saal tak IPv4 aur IPv6 saath chalayegi, aur yeh teen methods hi unhe saath rehne dete hain.</p>

<h3>Dual stack: pasandida approach</h3>
<p>Har interface, router aur host ek hi samay mein IPv4 aur IPv6 <b>dono</b> chalata hai. Har protocol ke apne addresses, apni routing table, apni neighbour table aur apne ACLs hote hain. Kuch convert nahi hota.</p>
<pre class="code"><span class="c">! Ek router interface, do protocols</span>
R1(config)# ipv6 unicast-routing
R1(config)# interface g0/1
R1(config-if)# ip address 10.10.10.1 255.255.255.0
R1(config-if)# ipv6 address 2001:db8:acad:10::1/64
R1(config-if)# no shutdown</pre>
<p>Dual-stack host kaunsa protocol use karta hai? DNS A record (IPv4) aur AAAA record (IPv6) dono de sakta hai. Default mein operating systems IPv6 pasand karte hain, aur modern applications <b>Happy Eyeballs</b> use karti hain: pehle IPv6 try karti hain aur second ke chhote hisse baad IPv4, aur jo pehle connect ho use rakhti hain. Isliye toota hua IPv6 path aam taur par <b>slowness</b> ki tarah dikhta hai, hard failure ki tarah nahi.</p>

<h3>Tunnelling: IPv4 ke andar IPv6</h3>
<p>Jab do IPv6 islands ke beech IPv4-only network ho, edge routers har IPv6 packet ko IPv4 packet ke andar rakhte hain. <b>Manual 6in4</b> tunnel IPv4 protocol number <b>41</b> use karta hai; <b>GRE</b> tunnel (protocol 47) bhi IPv6 le ja sakta hai. Purane automatic methods (6to4, ISATAP, Teredo) deprecated hain.</p>
<pre class="code"><span class="c">! Edge router par manual IPv6-in-IPv4 tunnel</span>
R1(config)# interface tunnel0
R1(config-if)# ipv6 address 2001:db8:ffff::1/64
R1(config-if)# tunnel source g0/2
R1(config-if)# tunnel destination 203.0.113.2
R1(config-if)# tunnel mode ipv6ip</pre>

<h3>Translation: NAT64 aur DNS64</h3>
<p>IPv6-only client IPv4-only server se seedha baat nahi kar sakta. <b>NAT64</b> dono ke beech translate karta hai, aur <b>DNS64</b> IPv4-only names ke liye ek AAAA record bana deta hai, IPv4 address ko ek special prefix ke andar rakh kar, aam taur par well-known <code>64:ff9b::/96</code>. Client <code>64:ff9b::c000:20a</code> se connect karta hai (jismein 192.0.2.10 hai), aur NAT64 box translate karta hai. Kai mobile networks IPv6-only access chalate hain aur yahi use karte hain, plus un apps ke liye jo abhi bhi IPv4 maangti hain phone par ek chhota translator (464XLAT).</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Transition methods">
<rect x="20" y="20" width="180" height="60" rx="8" fill="#bbf7d0"/><text x="110" y="45" text-anchor="middle" class="svg-ink" font-size="13">Dual stack</text><text x="110" y="64" text-anchor="middle" class="svg-muted" font-size="12">IPv4 + IPv6 saath saath</text>
<rect x="230" y="20" width="180" height="60" rx="8" fill="#fde68a"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="13">Tunnelling</text><text x="320" y="64" text-anchor="middle" class="svg-muted" font-size="12">IPv4 ke andar IPv6 (41, GRE)</text>
<rect x="440" y="20" width="180" height="60" rx="8" fill="#ddd6fe"/><text x="530" y="45" text-anchor="middle" class="svg-ink" font-size="13">Translation</text><text x="530" y="64" text-anchor="middle" class="svg-muted" font-size="12">NAT64 + DNS64</text>
<rect x="20" y="130" width="120" height="40" rx="6" fill="#bae6fd"/><text x="80" y="155" text-anchor="middle" class="svg-ink" font-size="12">v6 island</text>
<rect x="250" y="130" width="140" height="40" rx="6" fill="#e2e8f0"/><text x="320" y="155" text-anchor="middle" class="svg-ink" font-size="12">IPv4-only core</text>
<rect x="500" y="130" width="120" height="40" rx="6" fill="#bae6fd"/><text x="560" y="155" text-anchor="middle" class="svg-ink" font-size="12">v6 island</text>
<line x1="140" y1="150" x2="500" y2="150" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/>
<text x="320" y="200" text-anchor="middle" class="svg-accent" font-size="12">tunnel0: IPv6 packets IPv4 ke andar chalte hain</text>
</svg><p class="cap">Dual stack default choice hai; tunnels aur translation khaali jagah bharte hain.</p></div>

<h3>Aapka verification toolkit</h3>
<table class="cmp"><tr><th>Sawaal</th><th>IOS command</th><th>IPv4 jodidaar</th></tr>
<tr><td>Kaunse addresses, IPv6 up hai?</td><td><code>show ipv6 interface brief</code></td><td><code>show ip interface brief</code></td></tr>
<tr><td>Groups, DAD, RA timers, M/O flags</td><td><code>show ipv6 interface g0/0</code></td><td><code>show ip interface g0/0</code></td></tr>
<tr><td>Routing table</td><td><code>show ipv6 route</code>, <code>show ipv6 route static</code>, <code>show ipv6 route 2001:db8:3::1</code></td><td><code>show ip route</code></td></tr>
<tr><td>Neighbours ke MACs</td><td><code>show ipv6 neighbors</code></td><td><code>show ip arp</code></td></tr>
<tr><td>Yahan kaunse routers RAs bhejte hain?</td><td><code>show ipv6 routers</code></td><td>koi nahi</td></tr>
<tr><td>DHCPv6 server state</td><td><code>show ipv6 dhcp pool</code>, <code>show ipv6 dhcp binding</code></td><td><code>show ip dhcp binding</code></td></tr>
<tr><td>Reachability aur path</td><td><code>ping</code>, <code>traceroute</code> (<code>source</code> ke saath)</td><td>same</td></tr>
<tr><td>Live ND events</td><td><code>debug ipv6 nd</code> (lab mein)</td><td><code>debug arp</code></td></tr></table>
<p>Hosts par: Windows <code>ipconfig /all</code> aur <code>netsh interface ipv6 show neighbors</code>; Linux <code>ip -6 addr</code>, <code>ip -6 route</code> aur <code>ip -6 neigh</code>; lab PCs <code>show ipv6</code>.</p>

<div class="eg"><p><b>Worked example.</b> Router yeh dikhata hai; aap kya nishkarsh nikaaloge?</p>
<pre class="out">R2# show ipv6 routers
Router FE80::5054:CFF:FE04:4B01 on GigabitEthernet0/0, last update 0 min
  Hops 64, Lifetime 1800 sec, <span class="hl">AddrFlag=0, OtherFlag=0</span>, MTU=1500
  HomeAgentFlag=0, Preference=Medium
  Reachable time 0 (unspecified), Retransmit time 0 (unspecified)
  <span class="hl">Prefix 2001:DB8:CAFE:1::/64 onlink autoconfig</span>
    Valid lifetime 2592000, preferred lifetime 604800</pre>
<p>Ek router, R1, G0/0 par advertise kar raha hai. M=0 aur O=0 ka matlab sirf SLAAC. Prefix autoconfig (A) flag wala /64 hai, isliye hosts addresses bana sakte hain. 1800 seconds ki lifetime ka matlab hosts R1 ko default gateway banayenge. Yeh lab 2 sahi chal raha hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Dual-stack network mein sirf IPv4 secure karna: IPv4 ACL IPv6 ko filter nahi karta, isliye server IPv6 par poora khula ho sakta hai. Same intent ke saath <code>ipv6 traffic-filter</code> ACLs lagao. Doosri galti hai IPv6 path ko end to end test kiye bina AAAA records publish karna.</p></div>

<div class="exam"><p><b>Exam trap.</b> Dual stack ka matlab dono protocols <b>independently</b> chalte hain, alag routing tables ke saath; kuch translate nahi hota. Tunnelling encapsulate karti hai, translation (NAT64) convert karta hai. IPv6-in-IPv4 protocol 41 hai.</p></div>

<div class="scn"><h4>Website jo khulne mein teen second leti thi</h4><p>Data-centre firewall change ke baad users ne kaha ki intranet portal slow khulta hai par hamesha khul jaata hai. Uske IPv4 address ke pings turant the. Engineer ne <code>nslookup</code> chalaya aur A aur AAAA dono records dekhe, phir client VLAN se <code>ping 2001:db8:acad:80::10</code> test kiya: koi reply nahi. Nayi firewall policy sirf IPv4 ke liye likhi gayi thi, isliye IPv6 connections chupchap drop ho rahe the; browsers IPv6 try karte, intezaar karte, aur IPv4 par laut jaate. Matching IPv6 rule jodne ke baad portal IPv6 par turant load hone laga.</p><p><b>Seekh:</b> dual stack mein toota IPv6 path aksar slowness jaisa dikhta hai. Dono protocols alag alag test karo.</p></div>

<div class="iv"><p class="q">"Aap kaunse IPv6 transition mechanisms jaante ho, aur kaunsa recommend karoge?"</p><p>Strong answer: teen families. Dual stack IPv4 aur IPv6 saath saath chalata hai aur recommended default hai. Tunnelling IPv6 ko IPv4-only network par le jaati hai, jaise manual 6in4 (protocol 41) ya GRE. NAT64 with DNS64 jaisa translation IPv6-only clients ko IPv4-only servers tak pahunchne deta hai, jo 464XLAT ke saath mobile networks mein common hai. Batao ki dual stack policy ka kaam double karta hai: ACLs, firewall rules aur monitoring ko dono protocols cover karne chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Dual stack: har device par dono protocols alag addresses, routing tables aur ACLs ke saath; pasandida method.</li>
<li>Hosts IPv6 pasand karte hain aur Happy Eyeballs use karte hain, isliye toota IPv6 path aam taur par slowness jaisa dikhta hai.</li>
<li>Tunnelling (6in4 protocol 41, GRE) IPv6 ko IPv4 ke paar le jaati hai; translation (NAT64/DNS64, 64:ff9b::/96) dono ke beech convert karta hai.</li>
<li>Core toolkit: show ipv6 interface [brief], show ipv6 route, show ipv6 neighbors, show ipv6 routers, show ipv6 dhcp binding, source ke saath ping/traceroute.</li>
<li>IPv4 ke saath IPv6 ko bhi hamesha secure karo; IPv4 ACLs IPv6 ko filter nahi karte.</li>
</ul></div>
`}};export{e as default};