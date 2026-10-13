var e={id:`ipv6`,h:{en:`IPv6 addressing on Junos`,hi:`Junos par IPv6 addressing`},body:{en:`
<p>IPv4 has about 4.3 billion addresses and they ran out. <b>IPv6</b> has 128-bit addresses, about 3.4 x 10<sup>38</sup> of them. You will use IPv6 more and more, and the JNCIA-Junos exam expects you to read, shorten and configure IPv6 addresses. Think of IPv4 as a telephone number with 10 digits and IPv6 as a number so long that every grain of sand could have its own line.</p>

<h3>Format and shortening rules</h3>
<p>An IPv6 address is eight groups of 16 bits, each written as up to four hex digits, separated by colons: <code>2001:0db8:0000:0000:0000:0000:0000:0050</code>. Two rules make it short:</p>
<ol><li>Leading zeros in a group may be dropped: <code>0db8</code> becomes <code>db8</code>, <code>0000</code> becomes <code>0</code>.</li>
<li>One run of consecutive all-zero groups may be replaced by <code>::</code>. This can be done <b>only once</b> in an address, otherwise it would be ambiguous.</li></ol>
<p>So the address above becomes <code>2001:db8::50</code>. Another: <code>2001:0db8:0000:0000:0a00:0000:0000:0001</code> can be <code>2001:db8::a00:0:0:1</code> or <code>2001:db8:0:0:a00::1</code>; both are valid, but <code>2001:db8::a00::1</code> is not.</p>

<h3>Prefixes and the /64 rule</h3>
<p>Prefix notation is the same as IPv4: <code>2001:db8:50:10::/64</code> means the first 64 bits are the network. On LAN segments the standard is <b>/64</b>: the last 64 bits are the interface identifier. Point-to-point links often use /127 (or /64). A common site allocation is a /48, which holds 65,536 /64 subnets.</p>

<div class="dia"><svg viewBox="0 0 640 160" role="img" aria-label="IPv6 address structure">
<rect x="20" y="30" width="220" height="50" rx="6" fill="#bae6fd"/><text x="130" y="60" text-anchor="middle" class="svg-ink" font-size="13">Global prefix (48 bits)</text>
<rect x="245" y="30" width="110" height="50" rx="6" fill="#ddd6fe"/><text x="300" y="60" text-anchor="middle" class="svg-ink" font-size="13">Subnet (16)</text>
<rect x="360" y="30" width="260" height="50" rx="6" fill="#fde68a"/><text x="490" y="60" text-anchor="middle" class="svg-ink" font-size="13">Interface ID (64 bits)</text>
<text x="320" y="110" text-anchor="middle" class="svg-ink" font-size="13">2001:db8:50 : 10 : 0000:0000:0000:0001</text>
<text x="320" y="135" text-anchor="middle" class="svg-muted" font-size="12">network = first 64 bits (/64); host = last 64 bits</text>
</svg><p class="cap">A typical layout: site prefix, subnet number, interface identifier.</p></div>

<h3>Address types</h3>
<table class="cmp"><tr><th>Type</th><th>Prefix</th><th>Use</th></tr>
<tr><td>Global unicast</td><td>2000::/3</td><td>Routable on the internet (2001:db8::/32 is documentation)</td></tr>
<tr><td>Unique local</td><td>fc00::/7 (fd00::/8 used)</td><td>Private, like RFC 1918</td></tr>
<tr><td>Link-local</td><td>fe80::/10</td><td>On every IPv6 interface, valid on one link only, used by neighbour discovery and routing protocol next hops</td></tr>
<tr><td>Multicast</td><td>ff00::/8</td><td>One to many; replaces broadcast. ff02::1 all nodes, ff02::2 all routers</td></tr>
<tr><td>Loopback</td><td>::1/128</td><td>The device itself</td></tr>
<tr><td>Unspecified</td><td>::/128</td><td>"No address yet"; default route is ::/0</td></tr></table>
<p><b>There is no broadcast in IPv6.</b> Multicast, in particular the solicited-node address, does the job that ARP broadcasts did. Neighbour Discovery uses ICMPv6 messages Neighbor Solicitation and Neighbor Advertisement. Hosts can build their own address with <b>SLAAC</b> (stateless autoconfiguration) from router advertisements, or use DHCPv6.</p>

<h3>Configuring IPv6 on Junos</h3>
<p>IPv6 uses <code>family inet6</code>. A dual-stack interface carries both families on the same unit:</p>
<pre class="code">set interfaces ge-0/0/1 unit 0 family inet address 10.50.0.1/25
set interfaces ge-0/0/1 unit 0 family inet6 address 2001:db8:50:10::1/64
set interfaces lo0 unit 0 family inet6 address 2001:db8:ffff::1/128</pre>
<pre class="out">lab@R1&gt; show interfaces terse ge-0/0/1
Interface               Admin Link Proto    Local                 Remote
ge-0/0/1                up    up
ge-0/0/1.0              up    up   inet     10.50.0.1/25
                                   <span class="hl">inet6    2001:db8:50:10::1/64
                                            fe80::2e6b:f5ff:fe3a:10c1/64</span></pre>
<p>The link-local address <code>fe80::...</code> appears automatically once family inet6 is enabled. IPv6 routes live in the table <code>inet6.0</code>: <code>show route table inet6.0</code>. Test with <code>ping 2001:db8:50:10::10</code>.</p>

<div class="eg"><p><b>Worked example.</b> Shorten <code>2001:0db8:0001:0000:0000:0000:0000:00ff</code>. Drop leading zeros: 2001:db8:1:0:0:0:0:ff. Replace the single run of four zero groups with ::, giving <code>2001:db8:1::ff</code>.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Using :: twice. Forgetting that you cannot drop trailing zeros (a00 is not a). Using a /126 or /112 on a LAN that needs SLAAC, which requires /64.</p></div>

<div class="exam"><p><b>Exam trap.</b> fe80::/10 is link-local, fc00::/7 is unique local, 2000::/3 is global unicast, ff00::/8 is multicast. IPv6 has no broadcast and uses no ARP.</p></div>

<div class="scn"><h4>Dual-stack and the missing family</h4><p>A branch added IPv6 and users reached websites over IPv4 but IPv6-only services failed. <code>show interfaces terse</code> showed only inet on the LAN interface: the engineer had configured the IPv6 address on the physical port name but never committed family inet6 on the unit. Adding <code>family inet6 address 2001:db8:50:10::1/64</code> and committing brought up router advertisements and the hosts.</p><p><b>Lesson:</b> verify with show interfaces terse that the protocol family you expect appears.</p></div>

<div class="iv"><p class="q">"What replaces broadcast and ARP in IPv6?"</p><p>Multicast replaces broadcast, and Neighbor Discovery (ICMPv6 NS/NA, using solicited-node multicast) replaces ARP. Mention link-local addresses fe80::/10 and /64 subnets.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IPv6 is 128 bits as eight hex groups; drop leading zeros and use :: once for one zero run.</li>
<li>LAN prefixes are /64; types: global 2000::/3, unique local fc00::/7, link-local fe80::/10, multicast ff00::/8.</li>
<li>No broadcast and no ARP in IPv6; Neighbor Discovery and multicast do that work.</li>
<li>Junos uses family inet6; routes are in inet6.0.</li>
<li>Dual stack means both families on the same unit.</li>
</ul></div>
`,hi:`
<p>IPv4 mein lagbhag 4.3 arab addresses hain aur woh khatam ho gaye. <b>IPv6</b> mein 128-bit addresses hain, lagbhag 3.4 x 10<sup>38</sup>. Aap IPv6 zyada se zyada use karoge, aur JNCIA-Junos exam mein IPv6 addresses padhna, chhota karna aur configure karna aana chahiye. IPv4 ko 10 digit ka phone number socho aur IPv6 ko itna lamba number ki ret ke har kan ki apni line ho sakti hai.</p>

<h3>Format aur shortening rules</h3>
<p>IPv6 address aath groups ka hota hai, har group 16 bits ka, chaar hex digits tak, colon se alag: <code>2001:0db8:0000:0000:0000:0000:0000:0050</code>. Do rules ise chhota karte hain:</p>
<ol><li>Group ke leading zeros hata sakte ho: <code>0db8</code> ban jaata hai <code>db8</code>, <code>0000</code> ban jaata hai <code>0</code>.</li>
<li>Lagaataar all-zero groups ki ek run ko <code>::</code> se replace kar sakte ho. Yeh address mein <b>sirf ek baar</b> ho sakta hai, warna ambiguous ho jaayega.</li></ol>
<p>To upar wala address ban jaata hai <code>2001:db8::50</code>. Ek aur: <code>2001:0db8:0000:0000:0a00:0000:0000:0001</code> ban sakta hai <code>2001:db8::a00:0:0:1</code> ya <code>2001:db8:0:0:a00::1</code>; dono valid hain, lekin <code>2001:db8::a00::1</code> valid nahi.</p>

<h3>Prefixes aur /64 rule</h3>
<p>Prefix notation IPv4 jaisi hi hai: <code>2001:db8:50:10::/64</code> ka matlab pehle 64 bits network hain. LAN segments par standard <b>/64</b> hai: aakhri 64 bits interface identifier hain. Point-to-point links aksar /127 (ya /64) use karte hain. Aam site allocation /48 hai, jisme 65,536 /64 subnets aate hain.</p>

<div class="dia"><svg viewBox="0 0 640 160" role="img" aria-label="IPv6 address ka structure">
<rect x="20" y="30" width="220" height="50" rx="6" fill="#bae6fd"/><text x="130" y="60" text-anchor="middle" class="svg-ink" font-size="13">Global prefix (48 bits)</text>
<rect x="245" y="30" width="110" height="50" rx="6" fill="#ddd6fe"/><text x="300" y="60" text-anchor="middle" class="svg-ink" font-size="13">Subnet (16)</text>
<rect x="360" y="30" width="260" height="50" rx="6" fill="#fde68a"/><text x="490" y="60" text-anchor="middle" class="svg-ink" font-size="13">Interface ID (64 bits)</text>
<text x="320" y="110" text-anchor="middle" class="svg-ink" font-size="13">2001:db8:50 : 10 : 0000:0000:0000:0001</text>
<text x="320" y="135" text-anchor="middle" class="svg-muted" font-size="12">network = pehle 64 bits (/64); host = aakhri 64 bits</text>
</svg><p class="cap">Typical layout: site prefix, subnet number, interface identifier.</p></div>

<h3>Address types</h3>
<table class="cmp"><tr><th>Type</th><th>Prefix</th><th>Use</th></tr>
<tr><td>Global unicast</td><td>2000::/3</td><td>Internet par routable (2001:db8::/32 documentation hai)</td></tr>
<tr><td>Unique local</td><td>fc00::/7 (fd00::/8 use hota hai)</td><td>Private, RFC 1918 jaisa</td></tr>
<tr><td>Link-local</td><td>fe80::/10</td><td>Har IPv6 interface par, sirf ek link par valid, neighbour discovery aur routing protocol next hops mein use</td></tr>
<tr><td>Multicast</td><td>ff00::/8</td><td>One to many; broadcast ki jagah. ff02::1 all nodes, ff02::2 all routers</td></tr>
<tr><td>Loopback</td><td>::1/128</td><td>Device khud</td></tr>
<tr><td>Unspecified</td><td>::/128</td><td>"Abhi address nahi"; default route ::/0 hai</td></tr></table>
<p><b>IPv6 mein broadcast nahi hota.</b> Multicast, khaaskar solicited-node address, wahi kaam karta hai jo ARP broadcasts karte the. Neighbour Discovery ICMPv6 messages Neighbor Solicitation aur Neighbor Advertisement use karta hai. Hosts router advertisements se <b>SLAAC</b> (stateless autoconfiguration) dwara apna address bana sakte hain, ya DHCPv6 use kar sakte hain.</p>

<h3>Junos par IPv6 configure karna</h3>
<p>IPv6 <code>family inet6</code> use karta hai. Dual-stack interface ek hi unit par dono families rakhta hai:</p>
<pre class="code">set interfaces ge-0/0/1 unit 0 family inet address 10.50.0.1/25
set interfaces ge-0/0/1 unit 0 family inet6 address 2001:db8:50:10::1/64
set interfaces lo0 unit 0 family inet6 address 2001:db8:ffff::1/128</pre>
<pre class="out">lab@R1&gt; show interfaces terse ge-0/0/1
Interface               Admin Link Proto    Local                 Remote
ge-0/0/1                up    up
ge-0/0/1.0              up    up   inet     10.50.0.1/25
                                   <span class="hl">inet6    2001:db8:50:10::1/64
                                            fe80::2e6b:f5ff:fe3a:10c1/64</span></pre>
<p>family inet6 enable karte hi link-local address <code>fe80::...</code> apne aap aa jaata hai. IPv6 routes table <code>inet6.0</code> mein rehte hain: <code>show route table inet6.0</code>. Test ke liye <code>ping 2001:db8:50:10::10</code>.</p>

<div class="eg"><p><b>Worked example.</b> <code>2001:0db8:0001:0000:0000:0000:0000:00ff</code> ko chhota karo. Leading zeros hatao: 2001:db8:1:0:0:0:0:ff. Chaar zero groups ki ek run ko :: se badlo, to <code>2001:db8:1::ff</code>.</p></div>

<div class="warn"><p><b>Common mistakes.</b> :: do baar use karna. Yeh bhoolna ki trailing zeros nahi hata sakte (a00 a nahi hai). SLAAC chahiye wale LAN par /126 ya /112 use karna, jabki SLAAC ko /64 chahiye.</p></div>

<div class="exam"><p><b>Exam trap.</b> fe80::/10 link-local hai, fc00::/7 unique local, 2000::/3 global unicast, ff00::/8 multicast. IPv6 mein broadcast nahi aur ARP nahi.</p></div>

<div class="scn"><h4>Dual-stack aur gayab family</h4><p>Ek branch ne IPv6 joda aur users websites IPv4 se kholte rahe lekin IPv6-only services fail ho gayi. <code>show interfaces terse</code> mein LAN interface par sirf inet dikha: engineer ne unit par family inet6 commit hi nahi ki thi. <code>family inet6 address 2001:db8:50:10::1/64</code> jodkar commit karne se router advertisements aur hosts chalu ho gaye.</p><p><b>Lesson:</b> show interfaces terse se verify karo ki jo protocol family aap expect karte ho woh dikhti hai.</p></div>

<div class="iv"><p class="q">"IPv6 mein broadcast aur ARP ki jagah kya aata hai?"</p><p>Broadcast ki jagah multicast, aur ARP ki jagah Neighbor Discovery (ICMPv6 NS/NA, solicited-node multicast ke saath). Link-local addresses fe80::/10 aur /64 subnets ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IPv6 128 bits hai, aath hex groups; leading zeros hatao aur ek zero run ke liye :: sirf ek baar.</li>
<li>LAN prefixes /64; types: global 2000::/3, unique local fc00::/7, link-local fe80::/10, multicast ff00::/8.</li>
<li>IPv6 mein broadcast aur ARP nahi; Neighbor Discovery aur multicast yeh kaam karte hain.</li>
<li>Junos family inet6 use karta hai; routes inet6.0 mein hote hain.</li>
<li>Dual stack ka matlab ek hi unit par dono families.</li>
</ul></div>
`}};export{e as default};