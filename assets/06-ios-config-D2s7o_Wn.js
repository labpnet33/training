var e={id:`ios-config`,h:{en:`Configuring IPv6 on Cisco IOS interfaces`,hi:`Cisco IOS interfaces par IPv6 configure karna`},body:{en:`
<p>Opening a new shop takes two separate steps: registering the business so it may trade, and putting a name board on each door. On a Cisco router, <code>ipv6 unicast-routing</code> is the registration: it allows the router to forward IPv6 and act as a router. The <code>ipv6 address</code> commands are the name boards on each interface. Forget either one and customers cannot find you or cannot pass through. This chapter walks through lab 1, <b>IPv6 addressing on router links</b>, for the Pune branch.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Lab 1 topology">
<rect x="120" y="30" width="120" height="46" rx="8" fill="#bae6fd"/><text x="180" y="58" text-anchor="middle" class="svg-ink" font-size="14">R1</text>
<rect x="420" y="30" width="120" height="46" rx="8" fill="#bae6fd"/><text x="480" y="58" text-anchor="middle" class="svg-ink" font-size="14">R2</text>
<line x1="240" y1="53" x2="420" y2="53" stroke="#64748b" stroke-width="2"/>
<text x="330" y="24" text-anchor="middle" class="svg-accent" font-size="12">2001:db8:acad:12::/64</text>
<text x="250" y="72" class="svg-muted" font-size="12">G0/0 ::1, FE80::1</text>
<text x="410" y="72" text-anchor="end" class="svg-muted" font-size="12">::2, FE80::2 G0/0</text>
<rect x="120" y="130" width="120" height="40" rx="8" fill="#e2e8f0"/><text x="180" y="155" text-anchor="middle" class="svg-ink" font-size="13">SW1</text>
<line x1="180" y1="76" x2="180" y2="130" stroke="#64748b" stroke-width="2"/><text x="190" y="108" class="svg-muted" font-size="12">G0/1 2001:db8:acad:10::1/64</text>
<rect x="380" y="150" width="160" height="44" rx="8" fill="#bbf7d0"/><text x="460" y="170" text-anchor="middle" class="svg-ink" font-size="13">PC1</text><text x="460" y="186" text-anchor="middle" class="svg-muted" font-size="12">2001:db8:acad:10::10</text>
<line x1="240" y1="152" x2="380" y2="170" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Lab 1: a WAN /64 between R1 and R2 with easy link-locals, and an office LAN /64 behind R1.</p></div>

<h3>Step 1: turn on IPv6 routing</h3>
<p>IPv4 routing is on by default on a Cisco router; <b>IPv6 routing is not</b>. Without <code>ipv6 unicast-routing</code> the router behaves like an IPv6 host: it answers pings to its own addresses, but it does <b>not forward</b> IPv6 packets between interfaces, does <b>not send Router Advertisements</b>, and does not join <code>ff02::2</code>. Hosts behind it then have no gateway.</p>

<h3>Step 2: interface commands</h3>
<table class="cmp"><tr><th>Command</th><th>What it does</th></tr>
<tr><td><code>ipv6 address 2001:db8:acad:12::1/64</code></td><td>Adds a global (or ULA) address with a manual interface ID. Also enables IPv6 on the interface and creates the automatic link-local.</td></tr>
<tr><td><code>ipv6 address 2001:db8:cafe:1::/64 eui-64</code></td><td>Adds a global address whose interface ID comes from the MAC.</td></tr>
<tr><td><code>ipv6 address fe80::1 link-local</code></td><td>Replaces the automatic link-local with a readable one. No prefix length.</td></tr>
<tr><td><code>ipv6 enable</code></td><td>Enables IPv6 with a link-local address only.</td></tr>
<tr><td><code>ipv6 address autoconfig [default]</code> / <code>ipv6 address dhcp</code></td><td>The router becomes a SLAAC or DHCPv6 client (chapter 8).</td></tr></table>
<p>One important difference from IPv4: typing a second <code>ipv6 address</code> <b>adds</b> another address, it does not replace the first. An IPv6 interface can hold several global addresses. To remove one, use <code>no ipv6 address</code> followed by that exact address.</p>

<h3>Lab 1 configuration</h3>
<pre class="code"><span class="c">! R1</span>
R1(config)# ipv6 unicast-routing
R1(config)# interface g0/0
R1(config-if)# ipv6 address 2001:db8:acad:12::1/64
R1(config-if)# ipv6 address fe80::1 link-local
R1(config-if)# interface g0/1
R1(config-if)# ipv6 address 2001:db8:acad:10::1/64
<span class="c">! R2</span>
R2(config)# ipv6 unicast-routing
R2(config)# interface g0/0
R2(config-if)# ipv6 address 2001:db8:acad:12::2/64
R2(config-if)# ipv6 address fe80::2 link-local
<span class="c">! PC1: address/prefix-length, then gateway</span>
PC1&gt; ip 2001:db8:acad:10::10/64 2001:db8:acad:10::1
PC1&gt; ping 2001:db8:acad:10::1</pre>
<p>Why set link-locals by hand? Router link-locals appear as next hops in routing tables and as default gateways. <code>FE80::1</code> is much easier to read and type than <code>FE80::5054:CFF:FE04:4B01</code>. Because a link-local only has to be unique <b>on its link</b>, you may reuse <code>fe80::1</code> on every interface of R1, as lab 3 does.</p>

<h3>Verification</h3>
<pre class="out">R1# show ipv6 interface brief
GigabitEthernet0/0     [up/up]
    <span class="hl">FE80::1
    2001:DB8:ACAD:12::1</span>
GigabitEthernet0/1     [up/up]
    FE80::5054:CFF:FE04:4B02
    2001:DB8:ACAD:10::1</pre>
<p>Each interface shows its status, then the link-local, then every global address. G0/1 still has its automatic EUI-64 link-local because we did not replace it. <code>show ipv6 interface g0/0</code> gives the detail: joined multicast groups, DAD, RA timers and how hosts should get addresses.</p>

<div class="eg"><p><b>Worked example: pinging a link-local.</b> <code>fe80::2</code> could exist on every link of R1, so the router must ask which interface to use. IOS prompts for it:</p>
<pre class="out">R1# ping fe80::2
<span class="hl">Output Interface: GigabitEthernet0/0</span>
Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to FE80::2, timeout is 2 seconds:
Packet sent with a source address of FE80::1%GigabitEthernet0/0
!!!!!
Success rate is 100 percent (5/5), round-trip min/avg/max = 1/1/2 ms
R1# ping 2001:db8:acad:12::2
!!!!!
Success rate is 100 percent (5/5), round-trip min/avg/max = 1/1/3 ms</pre>
<p>The <code>%GigabitEthernet0/0</code> part is the <b>zone</b>: it tells you which link the link-local belongs to. On Windows you see the same idea as <code>fe80::2%12</code>.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Forgetting <code>ipv6 unicast-routing</code>; typing <code>ipv6 address fe80::1/64 link-local</code> (the link-local form takes no prefix length); expecting a new <code>ipv6 address</code> to replace the old one; and forgetting <code>no shutdown</code>, which leaves addresses shown as tentative.</p></div>

<div class="exam"><p><b>Exam trap.</b> "A router has IPv6 addresses on two interfaces; it can ping its own addresses but hosts behind it cannot reach each other." The missing command is <code>ipv6 unicast-routing</code>, not <code>ip routing</code> and not <code>ipv6 enable</code>. Also know that <code>ipv6 enable</code> alone gives only a link-local address.</p></div>

<div class="scn"><h4>The address that would not go away</h4><p>An engineer re-addressed a WAN link from <code>2001:db8:acad:99::1/64</code> to <code>2001:db8:acad:12::1/64</code> by simply typing the new command, as he would in IPv4. Two days later a new router was connected to the old <code>:99</code> subnet with address <code>2001:db8:acad:99::1</code> and logged <code>%IPV6_ND-4-DUPLICATE: Duplicate address 2001:DB8:ACAD:99::1 on GigabitEthernet0/0</code>. <code>show ipv6 interface brief</code> on the first router showed both addresses still configured. Removing the old one with <code>no ipv6 address 2001:db8:acad:99::1/64</code> cleared the conflict.</p><p><b>Lesson:</b> IPv6 interface addresses accumulate. When you change an address, remove the old one explicitly and verify.</p></div>

<div class="iv"><p class="q">"What does ipv6 unicast-routing do, and what happens if you forget it?"</p><p>Strong answer: it turns the device into an IPv6 router. It forwards IPv6 between interfaces, sends Router Advertisements so hosts learn prefixes and a default gateway, and joins the all-routers group ff02::2. Without it the router still owns its addresses and answers pings to them, but hosts get no RA, cannot autoconfigure and cannot route through it. Mention that IPv4 routing is on by default but IPv6 routing is not.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>ipv6 unicast-routing</code> is off by default; it enables forwarding, RAs and the ff02::2 group.</li>
<li><code>ipv6 address X/64</code> adds an address and enables IPv6; extra addresses accumulate, so remove old ones explicitly.</li>
<li><code>ipv6 address fe80::1 link-local</code> sets a readable link-local (no prefix length); it can repeat on different links.</li>
<li><code>ipv6 enable</code> gives only a link-local address.</li>
<li>Verify with <code>show ipv6 interface brief</code> and <code>show ipv6 interface</code>; pinging a link-local asks for the output interface.</li>
</ul></div>
`,hi:`
<p>Nayi dukaan kholne mein do alag steps hote hain: business register karna taaki woh vyapaar kar sake, aur har darwaze par name board lagana. Cisco router par <code>ipv6 unicast-routing</code> registration hai: yeh router ko IPv6 forward karne aur router ki tarah kaam karne deta hai. <code>ipv6 address</code> commands har interface ke name boards hain. Dono mein se ek bhi bhoole to customers aapko dhoondh nahi paate ya aapke through aage nahi jaa paate. Yeh chapter Pune branch ke liye lab 1, <b>Router links par IPv6 addressing</b>, ko step by step dikhata hai.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Lab 1 topology">
<rect x="120" y="30" width="120" height="46" rx="8" fill="#bae6fd"/><text x="180" y="58" text-anchor="middle" class="svg-ink" font-size="14">R1</text>
<rect x="420" y="30" width="120" height="46" rx="8" fill="#bae6fd"/><text x="480" y="58" text-anchor="middle" class="svg-ink" font-size="14">R2</text>
<line x1="240" y1="53" x2="420" y2="53" stroke="#64748b" stroke-width="2"/>
<text x="330" y="24" text-anchor="middle" class="svg-accent" font-size="12">2001:db8:acad:12::/64</text>
<text x="250" y="72" class="svg-muted" font-size="12">G0/0 ::1, FE80::1</text>
<text x="410" y="72" text-anchor="end" class="svg-muted" font-size="12">::2, FE80::2 G0/0</text>
<rect x="120" y="130" width="120" height="40" rx="8" fill="#e2e8f0"/><text x="180" y="155" text-anchor="middle" class="svg-ink" font-size="13">SW1</text>
<line x1="180" y1="76" x2="180" y2="130" stroke="#64748b" stroke-width="2"/><text x="190" y="108" class="svg-muted" font-size="12">G0/1 2001:db8:acad:10::1/64</text>
<rect x="380" y="150" width="160" height="44" rx="8" fill="#bbf7d0"/><text x="460" y="170" text-anchor="middle" class="svg-ink" font-size="13">PC1</text><text x="460" y="186" text-anchor="middle" class="svg-muted" font-size="12">2001:db8:acad:10::10</text>
<line x1="240" y1="152" x2="380" y2="170" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Lab 1: R1 aur R2 ke beech aasaan link-locals wala WAN /64, aur R1 ke peeche office LAN /64.</p></div>

<h3>Step 1: IPv6 routing on karo</h3>
<p>Cisco router par IPv4 routing default mein on hoti hai; <b>IPv6 routing nahi</b>. <code>ipv6 unicast-routing</code> ke bina router IPv6 host ki tarah behave karta hai: apne addresses ke pings ka jawab deta hai, par interfaces ke beech IPv6 packets <b>forward nahi karta</b>, <b>Router Advertisements nahi bhejta</b>, aur <code>ff02::2</code> join nahi karta. Tab uske peeche ke hosts ke paas koi gateway nahi hota.</p>

<h3>Step 2: interface commands</h3>
<table class="cmp"><tr><th>Command</th><th>Kya karti hai</th></tr>
<tr><td><code>ipv6 address 2001:db8:acad:12::1/64</code></td><td>Manual interface ID ke saath global (ya ULA) address jodti hai. Interface par IPv6 enable bhi karti hai aur automatic link-local banati hai.</td></tr>
<tr><td><code>ipv6 address 2001:db8:cafe:1::/64 eui-64</code></td><td>Global address jodti hai jiska interface ID MAC se aata hai.</td></tr>
<tr><td><code>ipv6 address fe80::1 link-local</code></td><td>Automatic link-local ko padhne layak address se badalti hai. Prefix length nahi.</td></tr>
<tr><td><code>ipv6 enable</code></td><td>Sirf link-local address ke saath IPv6 enable karti hai.</td></tr>
<tr><td><code>ipv6 address autoconfig [default]</code> / <code>ipv6 address dhcp</code></td><td>Router SLAAC ya DHCPv6 client ban jaata hai (chapter 8).</td></tr></table>
<p>IPv4 se ek zaroori fark: doosra <code>ipv6 address</code> type karne se ek aur address <b>judta</b> hai, pehla replace nahi hota. Ek IPv6 interface kai global addresses rakh sakta hai. Ek hatane ke liye <code>no ipv6 address</code> ke baad wahi exact address likho.</p>

<h3>Lab 1 configuration</h3>
<pre class="code"><span class="c">! R1</span>
R1(config)# ipv6 unicast-routing
R1(config)# interface g0/0
R1(config-if)# ipv6 address 2001:db8:acad:12::1/64
R1(config-if)# ipv6 address fe80::1 link-local
R1(config-if)# interface g0/1
R1(config-if)# ipv6 address 2001:db8:acad:10::1/64
<span class="c">! R2</span>
R2(config)# ipv6 unicast-routing
R2(config)# interface g0/0
R2(config-if)# ipv6 address 2001:db8:acad:12::2/64
R2(config-if)# ipv6 address fe80::2 link-local
<span class="c">! PC1: address/prefix-length, phir gateway</span>
PC1&gt; ip 2001:db8:acad:10::10/64 2001:db8:acad:10::1
PC1&gt; ping 2001:db8:acad:10::1</pre>
<p>Link-locals haath se kyun set karein? Router link-locals routing tables mein next hops aur default gateways ki tarah dikhte hain. <code>FE80::1</code> padhna aur type karna <code>FE80::5054:CFF:FE04:4B01</code> se kahin aasaan hai. Kyunki link-local ko sirf <b>apne link par</b> unique hona hai, aap R1 ke har interface par <code>fe80::1</code> dobara use kar sakte ho, jaisa lab 3 karta hai.</p>

<h3>Verification</h3>
<pre class="out">R1# show ipv6 interface brief
GigabitEthernet0/0     [up/up]
    <span class="hl">FE80::1
    2001:DB8:ACAD:12::1</span>
GigabitEthernet0/1     [up/up]
    FE80::5054:CFF:FE04:4B02
    2001:DB8:ACAD:10::1</pre>
<p>Har interface apna status, phir link-local, phir har global address dikhata hai. G0/1 par abhi bhi automatic EUI-64 link-local hai kyunki humne use replace nahi kiya. <code>show ipv6 interface g0/0</code> detail deta hai: joined multicast groups, DAD, RA timers aur hosts ko address kaise lena chahiye.</p>

<div class="eg"><p><b>Worked example: link-local ko ping karna.</b> <code>fe80::2</code> R1 ke har link par ho sakta hai, isliye router ko poochna padta hai ki kaunsa interface use kare. IOS iske liye prompt karta hai:</p>
<pre class="out">R1# ping fe80::2
<span class="hl">Output Interface: GigabitEthernet0/0</span>
Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to FE80::2, timeout is 2 seconds:
Packet sent with a source address of FE80::1%GigabitEthernet0/0
!!!!!
Success rate is 100 percent (5/5), round-trip min/avg/max = 1/1/2 ms
R1# ping 2001:db8:acad:12::2
!!!!!
Success rate is 100 percent (5/5), round-trip min/avg/max = 1/1/3 ms</pre>
<p><code>%GigabitEthernet0/0</code> wala hissa <b>zone</b> hai: yeh batata hai ki link-local kis link ka hai. Windows par yahi idea <code>fe80::2%12</code> ki tarah dikhta hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> <code>ipv6 unicast-routing</code> bhoolna; <code>ipv6 address fe80::1/64 link-local</code> type karna (link-local form mein prefix length nahi lagti); yeh expect karna ki naya <code>ipv6 address</code> purane ko replace karega; aur <code>no shutdown</code> bhoolna, jisse addresses tentative dikhte hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Router ke do interfaces par IPv6 addresses hain; woh apne addresses ping kar leta hai par uske peeche ke hosts ek doosre tak nahi pahunchte." Missing command <code>ipv6 unicast-routing</code> hai, <code>ip routing</code> nahi aur <code>ipv6 enable</code> bhi nahi. Yeh bhi jaano ki akela <code>ipv6 enable</code> sirf link-local address deta hai.</p></div>

<div class="scn"><h4>Woh address jo jaata hi nahi tha</h4><p>Ek engineer ne WAN link ko <code>2001:db8:acad:99::1/64</code> se <code>2001:db8:acad:12::1/64</code> par re-address kiya, bas nayi command type karke, jaise IPv4 mein karta. Do din baad ek naya router purane <code>:99</code> subnet se <code>2001:db8:acad:99::1</code> address ke saath joda gaya aur usne log kiya <code>%IPV6_ND-4-DUPLICATE: Duplicate address 2001:DB8:ACAD:99::1 on GigabitEthernet0/0</code>. Pehle router par <code>show ipv6 interface brief</code> ne dono addresses configured dikhaye. <code>no ipv6 address 2001:db8:acad:99::1/64</code> se purana hatane par conflict khatam hua.</p><p><b>Seekh:</b> IPv6 interface addresses jama hote jaate hain. Address badlo to purana explicitly hatao aur verify karo.</p></div>

<div class="iv"><p class="q">"ipv6 unicast-routing kya karta hai, aur ise bhool gaye to kya hota hai?"</p><p>Strong answer: yeh device ko IPv6 router bana deta hai. Interfaces ke beech IPv6 forward karta hai, Router Advertisements bhejta hai taaki hosts prefixes aur default gateway seekhein, aur all-routers group ff02::2 join karta hai. Iske bina router ke paas apne addresses rehte hain aur woh unke pings ka jawab deta hai, par hosts ko RA nahi milta, woh autoconfigure nahi kar paate aur uske through route nahi kar paate. Batao ki IPv4 routing default mein on hoti hai par IPv6 routing nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>ipv6 unicast-routing</code> default mein off hai; yeh forwarding, RAs aur ff02::2 group enable karta hai.</li>
<li><code>ipv6 address X/64</code> address jodta hai aur IPv6 enable karta hai; extra addresses jama hote hain, isliye purane explicitly hatao.</li>
<li><code>ipv6 address fe80::1 link-local</code> padhne layak link-local set karta hai (prefix length nahi); yeh alag links par repeat ho sakta hai.</li>
<li><code>ipv6 enable</code> sirf link-local address deta hai.</li>
<li><code>show ipv6 interface brief</code> aur <code>show ipv6 interface</code> se verify karo; link-local ping karne par output interface poocha jaata hai.</li>
</ul></div>
`}};export{e as default};