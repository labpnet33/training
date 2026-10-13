var e={id:`ipv6`,h:{en:`IPv6 essentials for the data center`,hi:`Data center ke liye IPv6 essentials`},body:{en:`
<p>When a city runs out of phone numbers, it does not squeeze people into shared lines; it adds more digits. IPv4's 4.3 billion addresses ran out years ago, and <b>IPv6</b> is the "more digits" answer: 128 bits instead of 32. Large clouds, container platforms and many enterprises now run IPv6 inside the data center, often side by side with IPv4 (<b>dual stack</b>). You do not need to be an IPv6 expert yet, but you must read addresses fluently and know how hosts find their gateway without ARP.</p>

<h3>Address format and shortening rules</h3>
<p>An IPv6 address is 128 bits written as eight groups of four hex digits separated by colons: <code>2001:0db8:0010:0010:0000:0000:0000:0011</code>. Two rules make it readable:</p>
<ol>
<li>Drop <b>leading zeros</b> in each group: <code>2001:db8:10:10:0:0:0:11</code>.</li>
<li>Replace <b>one</b> run of consecutive all-zero groups with <code>::</code>: <code>2001:db8:10:10::11</code>. You may use <code>::</code> only once, otherwise the length would be ambiguous.</li>
</ol>
<p><code>2001:db8::/32</code> is reserved for documentation, so we use it in examples.</p>

<h3>Prefixes in the data center</h3>
<table class="cmp"><tr><th>Prefix</th><th>Use</th><th>Note</th></tr>
<tr><td>/64</td><td>Every server VLAN / SVI</td><td>Required for SLAAC; 64 bits of network, 64 bits of interface ID</td></tr>
<tr><td>/127</td><td>Point-to-point fabric links</td><td>RFC 6164; the IPv6 equivalent of /31</td></tr>
<tr><td>/128</td><td>Loopbacks</td><td>One address, like an IPv4 /32</td></tr>
<tr><td>/48 or /56</td><td>A site or a tenant allocation</td><td>A /48 contains 65,536 /64 subnets</td></tr></table>

<div class="eg"><p><b>Worked example: carving a /48.</b> The data center gets <code>2001:db8:a00::/48</code>. The fourth group (16 bits) numbers the subnets. Use it to encode the VLAN: VLAN 10 becomes <code>2001:db8:a00:10::/64</code>, VLAN 210 becomes <code>2001:db8:a00:210::/64</code>. Engineers see the VLAN in the address at a glance. Fabric links take <code>2001:db8:a00:ff00::/56</code> split into /127s, and loopbacks take <code>2001:db8:a00:fffe::/64</code> with a /128 each.</p></div>

<h3>Address types you must recognise</h3>
<ul>
<li><b>Global unicast</b> (2000::/3): routable addresses such as 2001:db8:...</li>
<li><b>Link-local</b> (<code>fe80::/10</code>): created automatically on every IPv6 interface, valid only on that link. Routers use link-local addresses as next hops, and routing protocols such as OSPFv3 peer over them.</li>
<li><b>Unique local</b> (fc00::/7, in practice fd00::/8): the IPv6 equivalent of private addresses.</li>
<li><b>Multicast</b> (ff00::/8): <code>ff02::1</code> all nodes, <code>ff02::2</code> all routers, and <b>solicited-node</b> <code>ff02::1:ffXX:XXXX</code> built from the last 24 bits of a unicast address. There is <b>no broadcast</b> in IPv6.</li>
</ul>

<h3>Neighbor Discovery replaces ARP</h3>
<p>IPv6 uses <b>NDP</b> (Neighbor Discovery Protocol), a set of ICMPv6 messages:</p>
<table class="cmp"><tr><th>Message</th><th>ICMPv6 type</th><th>Job</th></tr>
<tr><td>Router Solicitation (RS)</td><td>133</td><td>Host: "any routers here?"</td></tr>
<tr><td>Router Advertisement (RA)</td><td>134</td><td>Router: prefix, gateway, flags for SLAAC or DHCPv6</td></tr>
<tr><td>Neighbor Solicitation (NS)</td><td>135</td><td>"Who has this IPv6 address?" (the ARP request), also used for duplicate address detection</td></tr>
<tr><td>Neighbor Advertisement (NA)</td><td>136</td><td>"I have it, my MAC is ..." (the ARP reply)</td></tr>
<tr><td>Redirect</td><td>137</td><td>"Use a better first hop"</td></tr></table>
<p>The NS is sent to the target's <b>solicited-node multicast</b> address, not to everyone, so only the few hosts whose addresses end in the same 24 bits even look at it. That is much kinder to a large VLAN than ARP broadcasts.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Neighbor discovery">
<rect x="20" y="20" width="150" height="40" rx="6" fill="#bbf7d0"/><text x="95" y="45" text-anchor="middle" class="svg-ink" font-size="12">WEB1 host</text>
<rect x="470" y="20" width="150" height="40" rx="6" fill="#bae6fd"/><text x="545" y="45" text-anchor="middle" class="svg-ink" font-size="12">LEAF1 Vlan10</text>
<line x1="95" y1="60" x2="95" y2="200" stroke="#64748b"/><line x1="545" y1="60" x2="545" y2="200" stroke="#64748b"/>
<line x1="95" y1="85" x2="545" y2="85" stroke="#64748b" stroke-width="2"/><text x="320" y="80" text-anchor="middle" class="svg-muted" font-size="12">RS to ff02::2</text>
<line x1="545" y1="120" x2="95" y2="120" stroke="#64748b" stroke-width="2"/><text x="320" y="115" text-anchor="middle" class="svg-muted" font-size="12">RA: prefix 2001:db8:a00:10::/64, gateway fe80::1</text>
<line x1="95" y1="155" x2="545" y2="155" stroke="#64748b" stroke-width="2"/><text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">NS to solicited-node multicast</text>
<line x1="545" y1="190" x2="95" y2="190" stroke="#64748b" stroke-width="2"/><text x="320" y="185" text-anchor="middle" class="svg-accent" font-size="12">NA: MAC of the gateway</text>
</svg><p class="cap">RS and RA give the host its prefix and gateway; NS and NA resolve MAC addresses.</p></div>

<h3>SLAAC or DHCPv6?</h3>
<ul>
<li><b>SLAAC</b> (stateless address autoconfiguration): the host takes the /64 from the RA and builds its own interface ID (random, or EUI-64 from its MAC). The gateway is the router's link-local address from the RA. No server needed.</li>
<li><b>Stateless DHCPv6</b>: address by SLAAC, extra options (DNS servers) by DHCPv6. The RA sets the <b>O</b> (other config) flag.</li>
<li><b>Stateful DHCPv6</b>: a DHCPv6 server assigns addresses and records them. The RA sets the <b>M</b> (managed) flag. Note that the <b>default gateway always comes from the RA</b>, never from DHCPv6.</li>
</ul>
<p>Servers in data centers usually get <b>static</b> IPv6 addresses (or addresses from automation), just like IPv4, but they still learn the gateway from RAs unless it is configured statically.</p>

<h3>Dual stack on an NX-OS SVI</h3>
<pre class="code"><span class="c">! IPv6 routing is enabled by default on NX-OS; no global command needed</span>
LEAF1(config)# interface vlan 10
LEAF1(config-if)# ip address 10.10.10.1/24
LEAF1(config-if)# ipv6 address 2001:db8:a00:10::1/64
LEAF1(config-if)# ipv6 link-local fe80::1
LEAF1(config-if)# no shutdown
<span class="c">! optional: stop RAs on a VLAN that uses static addressing only</span>
LEAF1(config-if)# ipv6 nd suppress-ra</pre>
<pre class="out">LEAF1# show ipv6 interface brief
IPv6 Interface Status for VRF "default"(1)
Interface               IPv6 Address/Link-local Address     Interface Status
                                                             prot/link/admin
<span class="hl">Vlan10                  2001:db8:a00:10::1                  up/up/up
                        fe80::1                             up/up/up</span>
LEAF1# show ipv6 neighbor
IPv6 Adjacency Table for VRF default
Address                  Age       MAC Address     Pref Source     Interface
2001:db8:a00:10::11      00:01:12  0050.56a1.0b11  50   icmpv6     Vlan10</pre>
<p>Setting a simple link-local such as <code>fe80::1</code> on every SVI makes host gateway configuration identical in every VLAN, a common and tidy practice.</p>

<div class="warn"><p><b>Common mistakes.</b> Using <code>::</code> twice. Using a prefix longer than /64 on a SLAAC VLAN (SLAAC stops working). Forgetting to open ICMPv6 in firewall rules: without NDP and Packet Too Big messages, IPv6 breaks. Assuming an IPv4 ACL also protects IPv6 traffic.</p></div>
<div class="exam"><p><b>Exam tip.</b> 128 bits; link-local fe80::/10; no broadcast; NDP uses ICMPv6 133 to 137; RA M flag = stateful DHCPv6, O flag = other config; the gateway comes from RAs; /64 for LANs, /127 for point-to-point, /128 for loopbacks.</p></div>

<div class="scn"><h4>IPv6 works on one leaf but not the other</h4><p>After enabling dual stack, hosts behind LEAF3 (configured with static IPv6 addresses and no static gateway) could ping each other but could not leave their VLAN, while LEAF4 was fine. <code>show ipv6 interface brief</code> on LEAF3 showed Vlan30 up with the right global address, but <code>show running-config interface vlan 30</code> revealed <code>ipv6 nd suppress-ra</code> copied from a static-only template. With no Router Advertisements, the hosts had no default router at all. Removing the suppress line restored the gateway.</p><p><b>Lesson:</b> in IPv6 the gateway comes from Router Advertisements; if RAs stop, routing off the subnet stops.</p></div>

<div class="iv"><p class="q">"How does an IPv6 host find its default gateway and resolve MAC addresses?"</p><p>Strong answer: the router sends Router Advertisements (ICMPv6 134), periodically or in reply to a Router Solicitation (133), containing the prefix, flags and its link-local address as the gateway. MAC resolution uses Neighbor Solicitation (135) to the solicited-node multicast address and Neighbor Advertisement (136); there is no ARP and no broadcast. Mention SLAAC versus DHCPv6 (M and O flags) and that the gateway never comes from DHCPv6.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IPv6 = 128 bits in hex; drop leading zeros; use <code>::</code> once.</li>
<li>DC prefixes: /64 per VLAN, /127 links, /128 loopbacks; encode VLAN IDs in the subnet field.</li>
<li>Every interface has a link-local fe80:: address; routers use it as the next hop.</li>
<li>NDP (RS, RA, NS, NA, redirect) replaces ARP; no broadcast, solicited-node multicast instead.</li>
<li>NX-OS dual stack: add <code>ipv6 address</code> to the SVI; IPv6 routing is on by default.</li>
</ul></div>
`,hi:`
<p>Jab kisi shehar ke phone numbers khatam ho jaate hain, to woh logon ko shared lines mein nahi thoosta; woh aur digits jod deta hai. IPv4 ke 4.3 billion addresses saalon pehle khatam ho gaye, aur <b>IPv6</b> woh "aur digits" wala jawab hai: 32 ki jagah 128 bits. Bade clouds, container platforms aur kai enterprises ab data center ke andar IPv6 chalate hain, aksar IPv4 ke saath saath (<b>dual stack</b>). Abhi aapko IPv6 expert hone ki zaroorat nahi, lekin addresses fluently padhna aur yeh jaanna zaroori hai ki hosts bina ARP ke apna gateway kaise dhoondhte hain.</p>

<h3>Address format aur chhota karne ke rules</h3>
<p>IPv6 address 128 bits ka hota hai, colons se alag chaar-chaar hex digits ke aath groups mein likha: <code>2001:0db8:0010:0010:0000:0000:0000:0011</code>. Do rules ise readable banate hain:</p>
<ol>
<li>Har group mein <b>leading zeros</b> hatao: <code>2001:db8:10:10:0:0:0:11</code>.</li>
<li>Lagatar all-zero groups ke <b>ek</b> run ko <code>::</code> se replace karo: <code>2001:db8:10:10::11</code>. <code>::</code> sirf ek baar use kar sakte ho, warna length ambiguous ho jaayegi.</li>
</ol>
<p><code>2001:db8::/32</code> documentation ke liye reserved hai, isliye hum examples mein ise use karte hain.</p>

<h3>Data center mein prefixes</h3>
<table class="cmp"><tr><th>Prefix</th><th>Use</th><th>Note</th></tr>
<tr><td>/64</td><td>Har server VLAN / SVI</td><td>SLAAC ke liye zaroori; 64 bits network, 64 bits interface ID</td></tr>
<tr><td>/127</td><td>Point-to-point fabric links</td><td>RFC 6164; /31 ka IPv6 equivalent</td></tr>
<tr><td>/128</td><td>Loopbacks</td><td>Ek address, IPv4 /32 jaisa</td></tr>
<tr><td>/48 ya /56</td><td>Ek site ya tenant allocation</td><td>Ek /48 mein 65,536 /64 subnets hote hain</td></tr></table>

<div class="eg"><p><b>Worked example: /48 ko kaatna.</b> Data center ko <code>2001:db8:a00::/48</code> milta hai. Chautha group (16 bits) subnets ko number karta hai. Ise VLAN encode karne ke liye use karo: VLAN 10 ban jaata hai <code>2001:db8:a00:10::/64</code>, VLAN 210 ban jaata hai <code>2001:db8:a00:210::/64</code>. Engineers ek nazar mein address mein VLAN dekh lete hain. Fabric links <code>2001:db8:a00:ff00::/56</code> lete hain jo /127s mein baanta jaata hai, aur loopbacks <code>2001:db8:a00:fffe::/64</code> lete hain, har ek ko /128.</p></div>

<h3>Address types jo pehchaanne zaroori hain</h3>
<ul>
<li><b>Global unicast</b> (2000::/3): routable addresses jaise 2001:db8:...</li>
<li><b>Link-local</b> (<code>fe80::/10</code>): har IPv6 interface par automatically banta hai, sirf us link par valid. Routers link-local addresses ko next hops ki tarah use karte hain, aur OSPFv3 jaise routing protocols inke upar peer karte hain.</li>
<li><b>Unique local</b> (fc00::/7, practice mein fd00::/8): private addresses ka IPv6 equivalent.</li>
<li><b>Multicast</b> (ff00::/8): <code>ff02::1</code> all nodes, <code>ff02::2</code> all routers, aur <b>solicited-node</b> <code>ff02::1:ffXX:XXXX</code> jo unicast address ke aakhri 24 bits se banta hai. IPv6 mein <b>broadcast nahi hota</b>.</li>
</ul>

<h3>Neighbor Discovery ARP ki jagah leta hai</h3>
<p>IPv6 <b>NDP</b> (Neighbor Discovery Protocol) use karta hai, ICMPv6 messages ka ek set:</p>
<table class="cmp"><tr><th>Message</th><th>ICMPv6 type</th><th>Kaam</th></tr>
<tr><td>Router Solicitation (RS)</td><td>133</td><td>Host: "yahan koi router hai?"</td></tr>
<tr><td>Router Advertisement (RA)</td><td>134</td><td>Router: prefix, gateway, SLAAC ya DHCPv6 ke flags</td></tr>
<tr><td>Neighbor Solicitation (NS)</td><td>135</td><td>"Yeh IPv6 address kiske paas hai?" (ARP request), duplicate address detection ke liye bhi</td></tr>
<tr><td>Neighbor Advertisement (NA)</td><td>136</td><td>"Mere paas hai, mera MAC ... hai" (ARP reply)</td></tr>
<tr><td>Redirect</td><td>137</td><td>"Behtar first hop use karo"</td></tr></table>
<p>NS target ke <b>solicited-node multicast</b> address par bheja jaata hai, sabko nahi, isliye sirf woh kuch hosts jinke addresses same 24 bits par khatam hote hain use dekhte bhi hain. Yeh bade VLAN ke liye ARP broadcasts se kahin zyada narm hai.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Neighbor discovery">
<rect x="20" y="20" width="150" height="40" rx="6" fill="#bbf7d0"/><text x="95" y="45" text-anchor="middle" class="svg-ink" font-size="12">WEB1 host</text>
<rect x="470" y="20" width="150" height="40" rx="6" fill="#bae6fd"/><text x="545" y="45" text-anchor="middle" class="svg-ink" font-size="12">LEAF1 Vlan10</text>
<line x1="95" y1="60" x2="95" y2="200" stroke="#64748b"/><line x1="545" y1="60" x2="545" y2="200" stroke="#64748b"/>
<line x1="95" y1="85" x2="545" y2="85" stroke="#64748b" stroke-width="2"/><text x="320" y="80" text-anchor="middle" class="svg-muted" font-size="12">RS ff02::2 ko</text>
<line x1="545" y1="120" x2="95" y2="120" stroke="#64748b" stroke-width="2"/><text x="320" y="115" text-anchor="middle" class="svg-muted" font-size="12">RA: prefix 2001:db8:a00:10::/64, gateway fe80::1</text>
<line x1="95" y1="155" x2="545" y2="155" stroke="#64748b" stroke-width="2"/><text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">NS solicited-node multicast ko</text>
<line x1="545" y1="190" x2="95" y2="190" stroke="#64748b" stroke-width="2"/><text x="320" y="185" text-anchor="middle" class="svg-accent" font-size="12">NA: gateway ka MAC</text>
</svg><p class="cap">RS aur RA host ko uska prefix aur gateway dete hain; NS aur NA MAC addresses resolve karte hain.</p></div>

<h3>SLAAC ya DHCPv6?</h3>
<ul>
<li><b>SLAAC</b> (stateless address autoconfiguration): host RA se /64 leta hai aur apna interface ID khud banata hai (random, ya MAC se EUI-64). Gateway RA se router ka link-local address hota hai. Koi server nahi chahiye.</li>
<li><b>Stateless DHCPv6</b>: address SLAAC se, extra options (DNS servers) DHCPv6 se. RA <b>O</b> (other config) flag set karta hai.</li>
<li><b>Stateful DHCPv6</b>: DHCPv6 server addresses assign karta hai aur record rakhta hai. RA <b>M</b> (managed) flag set karta hai. Dhyaan do ki <b>default gateway hamesha RA se aata hai</b>, DHCPv6 se kabhi nahi.</li>
</ul>
<p>Data centers mein servers ko aam taur par <b>static</b> IPv6 addresses milte hain (ya automation se), bilkul IPv4 ki tarah, lekin woh gateway phir bhi RAs se seekhte hain jab tak use statically configure na kiya ho.</p>

<h3>NX-OS SVI par dual stack</h3>
<pre class="code"><span class="c">! NX-OS par IPv6 routing default mein enabled hai; koi global command nahi chahiye</span>
LEAF1(config)# interface vlan 10
LEAF1(config-if)# ip address 10.10.10.1/24
LEAF1(config-if)# ipv6 address 2001:db8:a00:10::1/64
LEAF1(config-if)# ipv6 link-local fe80::1
LEAF1(config-if)# no shutdown
<span class="c">! optional: sirf static addressing wale VLAN par RAs band karo</span>
LEAF1(config-if)# ipv6 nd suppress-ra</pre>
<pre class="out">LEAF1# show ipv6 interface brief
IPv6 Interface Status for VRF "default"(1)
Interface               IPv6 Address/Link-local Address     Interface Status
                                                             prot/link/admin
<span class="hl">Vlan10                  2001:db8:a00:10::1                  up/up/up
                        fe80::1                             up/up/up</span>
LEAF1# show ipv6 neighbor
IPv6 Adjacency Table for VRF default
Address                  Age       MAC Address     Pref Source     Interface
2001:db8:a00:10::11      00:01:12  0050.56a1.0b11  50   icmpv6     Vlan10</pre>
<p>Har SVI par <code>fe80::1</code> jaisa simple link-local set karne se har VLAN mein host gateway configuration ek jaisi ho jaati hai, ek common aur saaf practice.</p>

<div class="warn"><p><b>Common galtiyan.</b> <code>::</code> do baar use karna. SLAAC VLAN par /64 se lamba prefix use karna (SLAAC kaam karna band kar deta hai). Firewall rules mein ICMPv6 kholna bhoolna: NDP aur Packet Too Big messages ke bina IPv6 toot jaata hai. Yeh maan lena ki IPv4 ACL IPv6 traffic ko bhi protect karta hai.</p></div>
<div class="exam"><p><b>Exam tip.</b> 128 bits; link-local fe80::/10; broadcast nahi; NDP ICMPv6 133 se 137 use karta hai; RA M flag = stateful DHCPv6, O flag = other config; gateway RAs se aata hai; LANs ke liye /64, point-to-point ke liye /127, loopbacks ke liye /128.</p></div>

<div class="scn"><h4>IPv6 ek leaf par chalta hai lekin dusre par nahi</h4><p>Dual stack enable karne ke baad LEAF3 ke peeche ke hosts (static IPv6 addresses ke saath aur bina static gateway ke) ek dusre ko ping kar sakte the lekin apne VLAN se bahar nahi ja paaye, jabki LEAF4 theek tha. LEAF3 par <code>show ipv6 interface brief</code> ne Vlan30 ko sahi global address ke saath up dikhaya, lekin <code>show running-config interface vlan 30</code> ne <code>ipv6 nd suppress-ra</code> dikhaya jo ek static-only template se copy hua tha. Router Advertisements ke bina hosts ke paas koi default router tha hi nahi. Suppress line hatane se gateway wapas aa gaya.</p><p><b>Seekh:</b> IPv6 mein gateway Router Advertisements se aata hai; agar RAs ruk jaayein, to subnet se bahar routing ruk jaati hai.</p></div>

<div class="iv"><p class="q">"IPv6 host apna default gateway kaise dhoondhta hai aur MAC addresses kaise resolve karta hai?"</p><p>Strong answer: router Router Advertisements (ICMPv6 134) bhejta hai, periodically ya Router Solicitation (133) ke jawab mein, jisme prefix, flags aur gateway ki tarah uska link-local address hota hai. MAC resolution solicited-node multicast address par Neighbor Solicitation (135) aur Neighbor Advertisement (136) use karta hai; koi ARP aur broadcast nahi. SLAAC versus DHCPv6 (M aur O flags) ka zikr karo aur bolo ki gateway kabhi DHCPv6 se nahi aata.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IPv6 = hex mein 128 bits; leading zeros hatao; <code>::</code> ek baar use karo.</li>
<li>DC prefixes: har VLAN /64, links /127, loopbacks /128; subnet field mein VLAN IDs encode karo.</li>
<li>Har interface ka link-local fe80:: address hota hai; routers ise next hop ki tarah use karte hain.</li>
<li>NDP (RS, RA, NS, NA, redirect) ARP ki jagah leta hai; broadcast nahi, solicited-node multicast.</li>
<li>NX-OS dual stack: SVI par <code>ipv6 address</code> jodo; IPv6 routing default mein on hai.</li>
</ul></div>
`}};export{e as default};