var e={id:`addressing-speed-review`,h:{en:`IPv4 and IPv6 addressing: a speed review`,hi:`IPv4 aur IPv6 addressing: speed review`},body:{en:`
<p>A postal address has a city, a street and a house number. The <b>network part</b> of an IP address is the city and street; the <b>host part</b> is the house number; the <b>mask or prefix length</b> says where the street name ends. At CCNA you could work this out slowly. ENCOR questions assume you can do it in your head in seconds, because they bury the real question (a summary route, a wildcard mask, an OSPF network statement, a NAT pool) behind the arithmetic. This chapter rebuilds that speed.</p>

<h3>The block-size method for IPv4</h3>
<p>Find the <b>interesting octet</b>: the one where the mask is neither 255 nor 0. The <b>block size</b> is 256 minus the mask value in that octet. Subnets start at multiples of the block size.</p>
<table class="cmp"><tr><th>Prefix</th><th>Mask</th><th>Block</th><th>Usable hosts</th><th>Typical use</th></tr>
<tr><td>/24</td><td>255.255.255.0</td><td>256</td><td>254</td><td>User VLAN</td></tr>
<tr><td>/25</td><td>255.255.255.128</td><td>128</td><td>126</td><td>Large VLAN half</td></tr>
<tr><td>/26</td><td>255.255.255.192</td><td>64</td><td>62</td><td>Server segment</td></tr>
<tr><td>/27</td><td>255.255.255.224</td><td>32</td><td>30</td><td>Small VLAN</td></tr>
<tr><td>/28</td><td>255.255.255.240</td><td>16</td><td>14</td><td>Public NAT pool</td></tr>
<tr><td>/30</td><td>255.255.255.252</td><td>4</td><td>2</td><td>Legacy point-to-point</td></tr>
<tr><td>/31</td><td>255.255.255.254</td><td>2</td><td>2 (RFC 3021)</td><td>Point-to-point links</td></tr>
<tr><td>/32</td><td>255.255.255.255</td><td>1</td><td>1</td><td>Loopbacks, host routes</td></tr>
</table>
<p>The same works in the third octet: /20 is 255.255.240.0, block 16 in the third octet; /22 is 255.255.252.0, block 4.</p>

<div class="eg"><p><b>Worked example 1.</b> Host 10.1.10.77/27. Block = 256 − 224 = 32. Multiples: 0, 32, 64, 96. 77 lies in the 64 block. Network 10.1.10.64, broadcast 10.1.10.95, usable 10.1.10.65 to 10.1.10.94.</p>
<p><b>Worked example 2.</b> Host 172.16.45.200/20. Interesting octet is the third, block 16. Multiples: 32, 48. 45 lies in the 32 block. Network 172.16.32.0, broadcast 172.16.47.255.</p>
<p><b>Worked example 3 (summarisation).</b> NK Corp's HQ uses 10.1.8.0/24 to 10.1.15.0/24 in one building. That is 8 consecutive /24s starting at a multiple of 8, so one summary covers them: 10.1.8.0/21 (mask 255.255.248.0). Check: block 8 in the third octet, 8 is a multiple of 8, so it is valid.</p>
<p><b>Worked example 4 (wildcard).</b> The wildcard for /21 is 255.255.255.255 − 255.255.248.0 = 0.0.7.255. You will type wildcards in ACLs and in OSPF network statements.</p></div>

<p>Know the special IPv4 ranges: RFC 1918 private (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16), shared address space 100.64.0.0/10 (carrier-grade NAT), link-local 169.254.0.0/16 (APIPA, "DHCP failed"), loopback 127.0.0.0/8, multicast 224.0.0.0/4, and the documentation ranges 192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24.</p>

<h3>IPv6 in ten minutes</h3>
<p>An IPv6 address is 128 bits written as eight 16-bit <b>hextets</b> in hex. Two shortening rules: drop leading zeros inside a hextet, and replace <b>one</b> run of all-zero hextets with <code>::</code>. <code>2001:0db8:0001:0010:0000:0000:0000:0002</code> becomes <code>2001:db8:1:10::2</code>.</p>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Subnet blocks and IPv6 structure">
<text x="20" y="20" class="svg-ink" font-size="13">10.1.10.0/24 split into four /26 blocks</text>
<rect x="20" y="30" width="150" height="40" fill="#bae6fd"/><text x="95" y="55" text-anchor="middle" class="svg-ink" font-size="12">.0 to .63</text>
<rect x="170" y="30" width="150" height="40" fill="#bbf7d0"/><text x="245" y="55" text-anchor="middle" class="svg-ink" font-size="12">.64 to .127</text>
<rect x="320" y="30" width="150" height="40" fill="#ddd6fe"/><text x="395" y="55" text-anchor="middle" class="svg-ink" font-size="12">.128 to .191</text>
<rect x="470" y="30" width="150" height="40" fill="#fde68a"/><text x="545" y="55" text-anchor="middle" class="svg-ink" font-size="12">.192 to .255</text>
<text x="20" y="115" class="svg-ink" font-size="13">2001:db8:1:10::2/64 structure</text>
<rect x="20" y="125" width="225" height="44" fill="#fed7aa"/><text x="132" y="152" text-anchor="middle" class="svg-ink" font-size="12">Site prefix /48: 2001:db8:1</text>
<rect x="245" y="125" width="75" height="44" fill="#bbf7d0"/><text x="282" y="152" text-anchor="middle" class="svg-ink" font-size="12">Subnet 10</text>
<rect x="320" y="125" width="300" height="44" fill="#e2e8f0"/><text x="470" y="152" text-anchor="middle" class="svg-ink" font-size="12">Interface ID, 64 bits: ::2</text>
<text x="132" y="190" text-anchor="middle" class="svg-muted" font-size="12">48 bits</text><text x="282" y="190" text-anchor="middle" class="svg-muted" font-size="12">16 bits</text><text x="470" y="190" text-anchor="middle" class="svg-muted" font-size="12">64 bits</text>
</svg><p class="cap">IPv4 subnets start at multiples of the block size; an IPv6 /48 site gives 65,536 /64 subnets.</p></div>
<table class="cmp"><tr><th>Type</th><th>Prefix</th><th>Notes</th></tr>
<tr><td>Global unicast (GUA)</td><td>2000::/3</td><td>Internet-routable; documentation prefix 2001:db8::/32</td></tr>
<tr><td>Link-local (LLA)</td><td>fe80::/10</td><td>Every IPv6 interface has one; used as routing next hop and for ND</td></tr>
<tr><td>Unique local (ULA)</td><td>fc00::/7 (fd00::/8 in practice)</td><td>Private, like RFC 1918</td></tr>
<tr><td>Multicast</td><td>ff00::/8</td><td>ff02::1 all nodes, ff02::2 all routers, ff02::1:ff00:0/104 solicited-node</td></tr>
<tr><td>Loopback / unspecified</td><td>::1 / ::</td><td>No broadcast exists in IPv6</td></tr>
</table>
<p>Interface IDs come from <b>EUI-64</b> (split the 48-bit MAC, insert FFFE in the middle, flip the 7th bit of the first byte), from random or privacy generation, or from manual configuration. Hosts get addresses by <b>SLAAC</b> (prefix from the router advertisement), <b>stateless DHCPv6</b> (SLAAC address plus DNS from DHCPv6, O flag) or <b>stateful DHCPv6</b> (M flag). <b>Neighbor Discovery</b> (ICMPv6 types 133 to 137: RS, RA, NS, NA, redirect) replaces ARP. Use /64 on LANs, /127 on point-to-point links and /128 on loopbacks.</p>

<div class="eg"><p><b>EUI-64 example.</b> DIST1's MAC is a0b1.c2d3.0001. Split: a0b1c2 | d30001. Insert fffe: a0b1:c2ff:fed3:0001. The first byte a0 is 1010 0000; flipping the 7th bit gives 1010 0010 = a2. Interface ID: a2b1:c2ff:fed3:1, so the EUI-64 address in VLAN 10 is 2001:db8:1:10:a2b1:c2ff:fed3:1.</p></div>

<pre class="code">DIST1(config)# ipv6 unicast-routing
DIST1(config)# interface Vlan10
DIST1(config-if)# ip address 10.1.10.2 255.255.255.0
DIST1(config-if)# ipv6 address 2001:db8:1:10::2/64
DIST1(config-if)# ipv6 address fe80::2 link-local
DIST1(config-if)# do show ipv6 interface brief Vlan10</pre>
<pre class="out">Vlan10                 [up/up]
    <span class="hl">FE80::2</span>
    <span class="hl">2001:DB8:1:10::2</span></pre>

<div class="warn"><p><b>Common mistake.</b> Forgetting <code>ipv6 unicast-routing</code>. Without it the device acts as an IPv6 host: interfaces get addresses, but it does not route IPv6 or send router advertisements, so SLAAC clients never get a prefix or gateway.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>::</code> can appear only once. When two zero runs are equally long, compress the first: <code>2001:db8:0:0:10:0:0:1</code> becomes <code>2001:db8::10:0:0:1</code>. Also, a /31 has two usable addresses and no broadcast, and a summary is only valid if the first subnet sits on a multiple of the block size.</p></div>

<div class="scn"><h4>The wireless VLAN that ate the voice VLAN</h4><p>A change request asked for a new guest wireless VLAN with room for 1000 clients. The engineer chose 10.1.28.0/22 and typed it on DIST1's new SVI. IOS rejected the command with an overlap error naming Vlan30, because 10.1.28.0/22 covers 10.1.28.0 to 10.1.31.255, which includes the existing wireless range 10.1.30.0/24. A quick block-size check (block 4 in the third octet: 28, 29, 30, 31) would have caught it in the planning stage. The team used 10.1.32.0/22 instead.</p><p><b>Lesson:</b> do the arithmetic before the change window, not in it. Every prefix should be checked against the IP plan for overlap.</p></div>

<div class="iv"><p class="q">"How does an IPv6 host get its address and default gateway without DHCP?"</p><p>Strong answer: with SLAAC. The host creates a link-local address, runs duplicate address detection, sends a Router Solicitation to ff02::2, and the router replies with a Router Advertisement carrying the /64 prefix and flags. The host builds its global address from the prefix plus an interface ID (EUI-64 or random) and uses the router's link-local address as the default gateway. Mention the M and O flags for stateful and stateless DHCPv6.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Block size = 256 − mask octet; subnets start at multiples of it; this gives network, broadcast and range instantly.</li>
<li>Summaries must start on a block boundary; wildcard = 255.255.255.255 − mask.</li>
<li>/31 for point-to-point, /32 for loopbacks; know RFC 1918, 100.64/10, 169.254/16 and documentation ranges.</li>
<li>IPv6: one <code>::</code> only, GUA 2000::/3, LLA fe80::/10, ULA fc00::/7, multicast ff00::/8, no broadcast.</li>
<li>SLAAC, stateless and stateful DHCPv6; ND (ICMPv6 133 to 137) replaces ARP; enable <code>ipv6 unicast-routing</code>.</li>
</ul></div>
`,hi:`
<p>Ek postal address mein sheher, gali aur ghar ka number hota hai. IP address ka <b>network part</b> sheher aur gali hai; <b>host part</b> ghar ka number hai; <b>mask ya prefix length</b> batata hai ki gali ka naam kahan khatam hota hai. CCNA mein aap yeh dheere dheere nikaal lete the. ENCOR questions maan kar chalte hain ki aap yeh seconds mein dimaag mein kar loge, kyunki woh asli question (summary route, wildcard mask, OSPF network statement, NAT pool) ko arithmetic ke peeche chhupa dete hain. Yeh chapter woh speed wapas banata hai.</p>

<h3>IPv4 ke liye block-size method</h3>
<p><b>Interesting octet</b> dhoondho: woh jahan mask na 255 hai na 0. <b>Block size</b> 256 minus us octet ki mask value hai. Subnets block size ke multiples par shuru hote hain.</p>
<table class="cmp"><tr><th>Prefix</th><th>Mask</th><th>Block</th><th>Usable hosts</th><th>Typical use</th></tr>
<tr><td>/24</td><td>255.255.255.0</td><td>256</td><td>254</td><td>User VLAN</td></tr>
<tr><td>/25</td><td>255.255.255.128</td><td>128</td><td>126</td><td>Bade VLAN ka aadha</td></tr>
<tr><td>/26</td><td>255.255.255.192</td><td>64</td><td>62</td><td>Server segment</td></tr>
<tr><td>/27</td><td>255.255.255.224</td><td>32</td><td>30</td><td>Chhota VLAN</td></tr>
<tr><td>/28</td><td>255.255.255.240</td><td>16</td><td>14</td><td>Public NAT pool</td></tr>
<tr><td>/30</td><td>255.255.255.252</td><td>4</td><td>2</td><td>Legacy point-to-point</td></tr>
<tr><td>/31</td><td>255.255.255.254</td><td>2</td><td>2 (RFC 3021)</td><td>Point-to-point links</td></tr>
<tr><td>/32</td><td>255.255.255.255</td><td>1</td><td>1</td><td>Loopbacks, host routes</td></tr>
</table>
<p>Yahi teesre octet mein bhi kaam karta hai: /20 255.255.240.0 hai, teesre octet mein block 16; /22 255.255.252.0 hai, block 4.</p>

<div class="eg"><p><b>Worked example 1.</b> Host 10.1.10.77/27. Block = 256 − 224 = 32. Multiples: 0, 32, 64, 96. 77, 64 wale block mein hai. Network 10.1.10.64, broadcast 10.1.10.95, usable 10.1.10.65 se 10.1.10.94.</p>
<p><b>Worked example 2.</b> Host 172.16.45.200/20. Interesting octet teesra hai, block 16. Multiples: 32, 48. 45, 32 wale block mein hai. Network 172.16.32.0, broadcast 172.16.47.255.</p>
<p><b>Worked example 3 (summarisation).</b> NK Corp ka HQ ek building mein 10.1.8.0/24 se 10.1.15.0/24 use karta hai. Yeh 8 lagataar /24s hain jo 8 ke multiple par shuru hote hain, isliye ek summary sabko cover karti hai: 10.1.8.0/21 (mask 255.255.248.0). Check: teesre octet mein block 8, 8 khud 8 ka multiple hai, isliye valid hai.</p>
<p><b>Worked example 4 (wildcard).</b> /21 ka wildcard 255.255.255.255 − 255.255.248.0 = 0.0.7.255 hai. Aap wildcards ACLs aur OSPF network statements mein type karoge.</p></div>

<p>Special IPv4 ranges jaano: RFC 1918 private (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16), shared address space 100.64.0.0/10 (carrier-grade NAT), link-local 169.254.0.0/16 (APIPA, "DHCP fail hua"), loopback 127.0.0.0/8, multicast 224.0.0.0/4, aur documentation ranges 192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24.</p>

<h3>Das minute mein IPv6</h3>
<p>IPv6 address 128 bits ka hota hai jo hex mein aath 16-bit <b>hextets</b> ki tarah likha jaata hai. Do shortening rules: hextet ke andar leading zeros hatao, aur all-zero hextets ke <b>ek</b> run ko <code>::</code> se replace karo. <code>2001:0db8:0001:0010:0000:0000:0000:0002</code> ban jaata hai <code>2001:db8:1:10::2</code>.</p>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Subnet blocks and IPv6 structure">
<text x="20" y="20" class="svg-ink" font-size="13">10.1.10.0/24 chaar /26 blocks mein</text>
<rect x="20" y="30" width="150" height="40" fill="#bae6fd"/><text x="95" y="55" text-anchor="middle" class="svg-ink" font-size="12">.0 se .63</text>
<rect x="170" y="30" width="150" height="40" fill="#bbf7d0"/><text x="245" y="55" text-anchor="middle" class="svg-ink" font-size="12">.64 se .127</text>
<rect x="320" y="30" width="150" height="40" fill="#ddd6fe"/><text x="395" y="55" text-anchor="middle" class="svg-ink" font-size="12">.128 se .191</text>
<rect x="470" y="30" width="150" height="40" fill="#fde68a"/><text x="545" y="55" text-anchor="middle" class="svg-ink" font-size="12">.192 se .255</text>
<text x="20" y="115" class="svg-ink" font-size="13">2001:db8:1:10::2/64 ka structure</text>
<rect x="20" y="125" width="225" height="44" fill="#fed7aa"/><text x="132" y="152" text-anchor="middle" class="svg-ink" font-size="12">Site prefix /48: 2001:db8:1</text>
<rect x="245" y="125" width="75" height="44" fill="#bbf7d0"/><text x="282" y="152" text-anchor="middle" class="svg-ink" font-size="12">Subnet 10</text>
<rect x="320" y="125" width="300" height="44" fill="#e2e8f0"/><text x="470" y="152" text-anchor="middle" class="svg-ink" font-size="12">Interface ID, 64 bits: ::2</text>
<text x="132" y="190" text-anchor="middle" class="svg-muted" font-size="12">48 bits</text><text x="282" y="190" text-anchor="middle" class="svg-muted" font-size="12">16 bits</text><text x="470" y="190" text-anchor="middle" class="svg-muted" font-size="12">64 bits</text>
</svg><p class="cap">IPv4 subnets block size ke multiples par shuru hote hain; IPv6 /48 site 65,536 /64 subnets deti hai.</p></div>
<table class="cmp"><tr><th>Type</th><th>Prefix</th><th>Notes</th></tr>
<tr><td>Global unicast (GUA)</td><td>2000::/3</td><td>Internet-routable; documentation prefix 2001:db8::/32</td></tr>
<tr><td>Link-local (LLA)</td><td>fe80::/10</td><td>Har IPv6 interface par ek hota hai; routing next hop aur ND ke liye use hota hai</td></tr>
<tr><td>Unique local (ULA)</td><td>fc00::/7 (practice mein fd00::/8)</td><td>Private, RFC 1918 jaisa</td></tr>
<tr><td>Multicast</td><td>ff00::/8</td><td>ff02::1 all nodes, ff02::2 all routers, ff02::1:ff00:0/104 solicited-node</td></tr>
<tr><td>Loopback / unspecified</td><td>::1 / ::</td><td>IPv6 mein broadcast exist nahi karta</td></tr>
</table>
<p>Interface IDs <b>EUI-64</b> se aate hain (48-bit MAC ko beech se todo, beech mein FFFE daalo, pehle byte ki 7th bit flip karo), random ya privacy generation se, ya manual configuration se. Hosts addresses <b>SLAAC</b> (router advertisement se prefix), <b>stateless DHCPv6</b> (SLAAC address plus DHCPv6 se DNS, O flag) ya <b>stateful DHCPv6</b> (M flag) se lete hain. <b>Neighbor Discovery</b> (ICMPv6 types 133 se 137: RS, RA, NS, NA, redirect) ARP ki jagah leta hai. LANs par /64, point-to-point links par /127 aur loopbacks par /128 use karo.</p>

<div class="eg"><p><b>EUI-64 example.</b> DIST1 ka MAC a0b1.c2d3.0001 hai. Todo: a0b1c2 | d30001. fffe daalo: a0b1:c2ff:fed3:0001. Pehla byte a0, 1010 0000 hai; 7th bit flip karne par 1010 0010 = a2 milta hai. Interface ID: a2b1:c2ff:fed3:1, isliye VLAN 10 mein EUI-64 address 2001:db8:1:10:a2b1:c2ff:fed3:1 hai.</p></div>

<pre class="code">DIST1(config)# ipv6 unicast-routing
DIST1(config)# interface Vlan10
DIST1(config-if)# ip address 10.1.10.2 255.255.255.0
DIST1(config-if)# ipv6 address 2001:db8:1:10::2/64
DIST1(config-if)# ipv6 address fe80::2 link-local
DIST1(config-if)# do show ipv6 interface brief Vlan10</pre>
<pre class="out">Vlan10                 [up/up]
    <span class="hl">FE80::2</span>
    <span class="hl">2001:DB8:1:10::2</span></pre>

<div class="warn"><p><b>Common galti.</b> <code>ipv6 unicast-routing</code> bhool jaana. Iske bina device IPv6 host ki tarah behave karta hai: interfaces ko addresses milte hain, par woh IPv6 route nahi karta aur router advertisements nahi bhejta, isliye SLAAC clients ko kabhi prefix ya gateway nahi milta.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>::</code> sirf ek baar aa sakta hai. Jab do zero runs barabar lambe hon, pehle waale ko compress karo: <code>2001:db8:0:0:10:0:0:1</code> ban jaata hai <code>2001:db8::10:0:0:1</code>. Aur /31 mein do usable addresses hain aur koi broadcast nahi, aur summary tabhi valid hai jab pehla subnet block size ke multiple par ho.</p></div>

<div class="scn"><h4>Wireless VLAN jo voice VLAN kha gaya</h4><p>Ek change request mein 1000 clients ki jagah wala naya guest wireless VLAN maanga gaya. Engineer ne 10.1.28.0/22 chuna aur DIST1 ke naye SVI par type kiya. IOS ne command ko Vlan30 ka naam lekar overlap error ke saath reject kar diya, kyunki 10.1.28.0/22, 10.1.28.0 se 10.1.31.255 tak cover karta hai, jisme existing wireless range 10.1.30.0/24 shaamil hai. Ek quick block-size check (teesre octet mein block 4: 28, 29, 30, 31) planning stage mein hi ise pakad leta. Team ne iski jagah 10.1.32.0/22 use kiya.</p><p><b>Seekh:</b> arithmetic change window se pehle karo, uske andar nahi. Har prefix ko IP plan ke against overlap ke liye check karna chahiye.</p></div>

<div class="iv"><p class="q">"IPv6 host bina DHCP ke apna address aur default gateway kaise leta hai?"</p><p>Strong answer: SLAAC se. Host ek link-local address banata hai, duplicate address detection chalata hai, ff02::2 ko Router Solicitation bhejta hai, aur router /64 prefix aur flags wala Router Advertisement bhej kar reply karta hai. Host prefix plus interface ID (EUI-64 ya random) se apna global address banata hai aur router ke link-local address ko default gateway ki tarah use karta hai. Stateful aur stateless DHCPv6 ke liye M aur O flags mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Block size = 256 − mask octet; subnets iske multiples par shuru hote hain; isse network, broadcast aur range turant milte hain.</li>
<li>Summaries block boundary par shuru honi chahiye; wildcard = 255.255.255.255 − mask.</li>
<li>Point-to-point ke liye /31, loopbacks ke liye /32; RFC 1918, 100.64/10, 169.254/16 aur documentation ranges jaano.</li>
<li>IPv6: sirf ek <code>::</code>, GUA 2000::/3, LLA fe80::/10, ULA fc00::/7, multicast ff00::/8, koi broadcast nahi.</li>
<li>SLAAC, stateless aur stateful DHCPv6; ND (ICMPv6 133 se 137) ARP ki jagah leta hai; <code>ipv6 unicast-routing</code> enable karo.</li>
</ul></div>
`}};export{e as default};