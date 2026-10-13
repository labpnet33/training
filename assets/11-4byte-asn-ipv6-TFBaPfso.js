var e={id:`asn-ipv6`,h:{en:`4-byte AS numbers and address families (IPv4 and IPv6 unicast)`,hi:`4-byte AS numbers aur address families (IPv4 aur IPv6 unicast)`},body:{en:`
<p>Indian mobile numbers once had fewer digits; when the country ran out, numbers grew longer, and old phones had to learn to dial them. BGP went through the same change. Two-byte AS numbers (0 to 65535) ran out, so <b>4-byte AS numbers</b> were introduced, and routers had to learn to carry and display them. At the same time BGP stopped being "the IPv4 protocol" and became <b>multiprotocol BGP</b>, carrying several <b>address families</b> over one or more sessions. ENARSI 1.10 lists both.</p>

<h3>4-byte AS numbers: the numbers</h3>
<p>A 4-byte ASN ranges from 0 to 4294967295. There are two ways to write it:</p>
<ul>
<li><b>asplain</b>: a plain decimal number, for example <code>65546</code> or <code>4200000001</code>. This is the IOS default.</li>
<li><b>asdot</b>: <code>high.low</code>, where high = ASN divided by 65536 and low = the remainder. Values below 65536 are still written plainly.</li>
</ul>
<div class="eg"><p><b>Worked conversions.</b> 65546: 65546 / 65536 = 1, remainder 10, so asdot <b>1.10</b>. 131072 = 2 x 65536 + 0 = <b>2.0</b>. 4200000001: 64086 x 65536 = 4199940096, remainder 59905, so <b>64086.59905</b>. Reverse: 3.100 = 3 x 65536 + 100 = <b>196708</b>.</p></div>
<table class="cmp"><tr><th>Range</th><th>Use</th></tr>
<tr><td>1 to 64495</td><td>Public 2-byte ASNs</td></tr>
<tr><td>64512 to 65534</td><td>Private 2-byte ASNs (used in these labs)</td></tr>
<tr><td>65536 to 4199999999</td><td>Public 4-byte ASNs</td></tr>
<tr><td>4200000000 to 4294967294</td><td>Private 4-byte ASNs</td></tr>
<tr><td>23456</td><td>AS_TRANS, a placeholder for old 2-byte speakers</td></tr>
</table>

<h3>How 4-byte and 2-byte speakers talk</h3>
<p>A 4-byte-capable router announces the <b>4-octet AS capability</b> in its OPEN message, with its real ASN inside. If both sides announce it, they simply exchange 4-byte AS_PATHs. If the peer is an old 2-byte speaker, the new router puts <b>AS_TRANS 23456</b> in the 2-byte "My AS" field and in the AS_PATH, and carries the real path in the optional transitive <b>AS4_PATH</b> attribute, which the old router passes on untouched. A later 4-byte speaker rebuilds the true path.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="4-byte AS and an old 2-byte speaker">
<rect x="20" y="40" width="170" height="60" rx="8" fill="#bae6fd"/><text x="105" y="66" text-anchor="middle" class="svg-ink" font-size="13">NEW, AS 4200000001</text><text x="105" y="84" text-anchor="middle" class="svg-muted" font-size="12">4-byte capable</text>
<rect x="450" y="40" width="170" height="60" rx="8" fill="#fde68a"/><text x="535" y="66" text-anchor="middle" class="svg-ink" font-size="13">OLD, AS 64999</text><text x="535" y="84" text-anchor="middle" class="svg-muted" font-size="12">2-byte only</text>
<line x1="190" y1="70" x2="450" y2="70" stroke="#64748b" stroke-width="2"/>
<text x="320" y="60" text-anchor="middle" class="svg-accent" font-size="12">OPEN: My AS = 23456</text>
<text x="320" y="92" text-anchor="middle" class="svg-muted" font-size="12">AS_PATH 23456 + AS4_PATH 4200000001</text>
<text x="320" y="150" text-anchor="middle" class="svg-ink" font-size="12">OLD configures: neighbor X remote-as 23456</text>
<text x="320" y="175" text-anchor="middle" class="svg-muted" font-size="12">NEW configures the real 2-byte AS of OLD as usual</text>
</svg><p class="cap">AS_TRANS lets old routers peer with 4-byte ASNs without understanding them.</p></div>

<pre class="code"><span class="c">! Configure with either notation; IOS stores the same value</span>
router bgp 4200000001
 neighbor 203.0.113.2 remote-as 65546
<span class="c">! Display in asdot instead of asplain</span>
 bgp asnotation dot</pre>
<pre class="out">R1# show ip bgp summary | include local AS|203.0.113.2
BGP router identifier 10.255.9.1, local AS number <span class="hl">64086.59905</span>
203.0.113.2     4          1.10      22      20        7    0    0 00:10:31        3</pre>
<p>With asdot display, regular expressions must escape the dot, because a bare <code>.</code> means "any character": write <code>^1&#92;.10_</code> to match routes from AS 1.10. Reserved ranges and AS migration features (local-as) are outside the ENARSI scope.</p>

<h3>Address families: one BGP, many tables</h3>
<p>Multiprotocol BGP (MP-BGP) adds MP_REACH_NLRI and MP_UNREACH_NLRI attributes so BGP can carry prefixes for different <b>address families</b>: IPv4 unicast, IPv6 unicast, VPNv4 and more. Each family has its own table, its own policies and its own best paths. A neighbor exchanges a family only when it is <b>activated</b> in that family.</p>
<p>By default IOS automatically activates every neighbor in IPv4 unicast. <code>no bgp default ipv4-unicast</code> turns that off, which is cleaner when you run several families, because then every activation is explicit.</p>
<pre class="code">router bgp 65300
 bgp router-id 10.255.0.1
 no bgp default ipv4-unicast
 neighbor 10.255.0.2 remote-as 65300
 neighbor 10.255.0.2 update-source Loopback0
 neighbor 2001:DB8:64::1 remote-as 64999
 !
 address-family ipv4 unicast
  neighbor 10.255.0.2 activate
  neighbor 10.255.0.2 next-hop-self
 exit-address-family
 !
 address-family ipv6 unicast
  neighbor 2001:DB8:64::1 activate
  network 2001:DB8:300::/48
 exit-address-family</pre>
<pre class="out">EDGE# show bgp ipv6 unicast summary | begin Neighbor
Neighbor        V           AS MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd
<span class="hl">2001:DB8:64::1  4        64999      15      14        3    0    0 00:08:44        1</span>
EDGE# show bgp ipv6 unicast | begin Network
     Network          Next Hop            Metric LocPrf Weight Path
 *&gt;  2001:DB8:300::/48
                       ::                       0         32768 i
 *&gt;  2001:DB8:FFFF::/48
                       2001:DB8:64::1           0             0 64999 i</pre>

<h3>Rules that cause real tickets</h3>
<ul>
<li><b>Router ID.</b> BGP needs a 32-bit router ID even on an IPv6-only router. With no IPv4 address configured, set <code>bgp router-id</code> manually or BGP will not start.</li>
<li><b>network needs an exact RIB match.</b> <code>network 2001:DB8:300::/48</code> (or the IPv4 <code>network ... mask ...</code>) is advertised only if exactly that prefix is in the routing table. A common fix is a static route to Null0.</li>
<li><b>Transport versus payload.</b> IPv6 prefixes can travel over an IPv4 session (activate the IPv4 neighbor under <code>address-family ipv6</code>). The next hop then becomes an IPv4-mapped address such as <code>::FFFF:10.255.0.1</code>, which is unreachable, so the paths are inaccessible. Fix with an outbound route-map that does <code>set ipv6 next-hop</code>, or peer over IPv6 addresses.</li>
<li><b>Show commands.</b> <code>show ip bgp</code> shows only IPv4 unicast. Use <code>show bgp ipv6 unicast</code>, <code>show bgp ipv4 unicast summary</code> or <code>show bgp all summary</code>.</li>
<li><b>Policies are per family.</b> A route-map or prefix-list applied under <code>address-family ipv4</code> does nothing for IPv6; IPv6 needs <code>ipv6 prefix-list</code> applied under the IPv6 family.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Converting asdot to asplain with 1000 instead of 65536. Adding a new neighbor after <code>no bgp default ipv4-unicast</code> and forgetting <code>activate</code>: with no active family the session never comes up, and with only one family active the other family carries nothing. Looking at <code>show ip bgp</code> and concluding IPv6 routes are missing. Using an IPv4 prefix-list for IPv6 routes.</p></div>

<div class="exam"><p><b>Exam traps.</b> asdot X.Y = X x 65536 + Y. AS_TRANS is 23456. Private 4-byte range starts at 4200000000. A neighbor that is Established but not activated in a family exchanges nothing in that family. IPv6 over an IPv4 session needs a next-hop fix.</p></div>

<div class="scn"><h4>The dual-stack session that carried nothing</h4><p>An enterprise running <code>no bgp default ipv4-unicast</code> added a second provider link with a new IPv4 neighbor, 100.64.9.1. The engineer activated it only under <code>address-family ipv6 unicast</code>, copying the IPv6 template by mistake. The session came up, IPv6 routes arrived, but no IPv4 prefixes were exchanged, so the new link carried no IPv4 traffic for a week. <code>show bgp ipv4 unicast summary</code> did not even list the neighbor. Adding <code>neighbor 100.64.9.1 activate</code> under <code>address-family ipv4 unicast</code> fixed it.</p><p><b>Lesson:</b> after changing default activation, check <code>show bgp all summary</code> for every family.</p></div>

<div class="iv"><p class="q">"What happens when a router with a 4-byte ASN peers with a router that only supports 2-byte ASNs?"</p><p>Explain the 4-octet AS capability in the OPEN message; without it the new router uses AS_TRANS 23456 as its AS in the OPEN and in AS_PATH, and carries the real path in AS4_PATH (optional transitive), which the old router passes through. The old router must configure <code>remote-as 23456</code>. Show you can convert asplain and asdot, and mention escaping the dot in regular expressions.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>4-byte ASN: asplain (default) or asdot X.Y where value = X x 65536 + Y.</li>
<li>AS_TRANS 23456 and AS4_PATH keep old 2-byte speakers working.</li>
<li>Each address family has its own table, activation and policies.</li>
<li><code>no bgp default ipv4-unicast</code> means every neighbor needs explicit <code>activate</code>.</li>
<li>IPv6 over an IPv4 session needs a usable IPv6 next hop; use <code>show bgp ipv6 unicast</code> to verify.</li>
</ul></div>
`,hi:`
<p>Kabhi Indian mobile numbers mein kam digits hote the; jab numbers khatam hone lage, to numbers lambe hue, aur purane phones ko unhe dial karna seekhna pada. BGP bhi isi change se guzra. Two-byte AS numbers (0 se 65535) khatam ho gaye, isliye <b>4-byte AS numbers</b> aaye, aur routers ko unhe carry aur display karna seekhna pada. Saath hi BGP "IPv4 protocol" nahi raha aur <b>multiprotocol BGP</b> ban gaya, jo ek ya zyada sessions par kai <b>address families</b> carry karta hai. ENARSI 1.10 dono list karta hai.</p>

<h3>4-byte AS numbers: numbers</h3>
<p>4-byte ASN 0 se 4294967295 tak hota hai. Ise likhne ke do tareeke hain:</p>
<ul>
<li><b>asplain</b>: seedha decimal number, jaise <code>65546</code> ya <code>4200000001</code>. Yeh IOS default hai.</li>
<li><b>asdot</b>: <code>high.low</code>, jahan high = ASN ko 65536 se divide karo aur low = remainder. 65536 se kam values ab bhi seedhi likhi jaati hain.</li>
</ul>
<div class="eg"><p><b>Worked conversions.</b> 65546: 65546 / 65536 = 1, remainder 10, isliye asdot <b>1.10</b>. 131072 = 2 x 65536 + 0 = <b>2.0</b>. 4200000001: 64086 x 65536 = 4199940096, remainder 59905, isliye <b>64086.59905</b>. Ulta: 3.100 = 3 x 65536 + 100 = <b>196708</b>.</p></div>
<table class="cmp"><tr><th>Range</th><th>Use</th></tr>
<tr><td>1 se 64495</td><td>Public 2-byte ASNs</td></tr>
<tr><td>64512 se 65534</td><td>Private 2-byte ASNs (in labs mein use hote hain)</td></tr>
<tr><td>65536 se 4199999999</td><td>Public 4-byte ASNs</td></tr>
<tr><td>4200000000 se 4294967294</td><td>Private 4-byte ASNs</td></tr>
<tr><td>23456</td><td>AS_TRANS, purane 2-byte speakers ke liye placeholder</td></tr>
</table>

<h3>4-byte aur 2-byte speakers kaise baat karte hain</h3>
<p>4-byte-capable router apne OPEN message mein <b>4-octet AS capability</b> announce karta hai, jiske andar uska asli ASN hota hai. Agar dono sides ise announce karein, to woh seedhe 4-byte AS_PATHs exchange karte hain. Agar peer purana 2-byte speaker hai, to naya router 2-byte "My AS" field aur AS_PATH mein <b>AS_TRANS 23456</b> daalta hai, aur asli path optional transitive <b>AS4_PATH</b> attribute mein carry karta hai, jise purana router bina chhede aage de deta hai. Baad ka koi 4-byte speaker sahi path dobara bana leta hai.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="4-byte AS aur purana 2-byte speaker">
<rect x="20" y="40" width="170" height="60" rx="8" fill="#bae6fd"/><text x="105" y="66" text-anchor="middle" class="svg-ink" font-size="13">NEW, AS 4200000001</text><text x="105" y="84" text-anchor="middle" class="svg-muted" font-size="12">4-byte capable</text>
<rect x="450" y="40" width="170" height="60" rx="8" fill="#fde68a"/><text x="535" y="66" text-anchor="middle" class="svg-ink" font-size="13">OLD, AS 64999</text><text x="535" y="84" text-anchor="middle" class="svg-muted" font-size="12">sirf 2-byte</text>
<line x1="190" y1="70" x2="450" y2="70" stroke="#64748b" stroke-width="2"/>
<text x="320" y="60" text-anchor="middle" class="svg-accent" font-size="12">OPEN: My AS = 23456</text>
<text x="320" y="92" text-anchor="middle" class="svg-muted" font-size="12">AS_PATH 23456 + AS4_PATH 4200000001</text>
<text x="320" y="150" text-anchor="middle" class="svg-ink" font-size="12">OLD configure karta hai: neighbor X remote-as 23456</text>
<text x="320" y="175" text-anchor="middle" class="svg-muted" font-size="12">NEW hamesha ki tarah OLD ka asli 2-byte AS configure karta hai</text>
</svg><p class="cap">AS_TRANS purane routers ko 4-byte ASNs samjhe bina unse peer karne deta hai.</p></div>

<pre class="code"><span class="c">! Kisi bhi notation se configure karo; IOS same value store karta hai</span>
router bgp 4200000001
 neighbor 203.0.113.2 remote-as 65546
<span class="c">! asplain ki jagah asdot mein display karo</span>
 bgp asnotation dot</pre>
<pre class="out">R1# show ip bgp summary | include local AS|203.0.113.2
BGP router identifier 10.255.9.1, local AS number <span class="hl">64086.59905</span>
203.0.113.2     4          1.10      22      20        7    0    0 00:10:31        3</pre>
<p>asdot display ke saath regular expressions mein dot ko escape karna padta hai, kyunki akela <code>.</code> matlab "koi bhi character": AS 1.10 se aaye routes match karne ke liye <code>^1&#92;.10_</code> likho. Reserved ranges aur AS migration features (local-as) ENARSI scope se bahar hain.</p>

<h3>Address families: ek BGP, kai tables</h3>
<p>Multiprotocol BGP (MP-BGP) MP_REACH_NLRI aur MP_UNREACH_NLRI attributes jodta hai taaki BGP alag <b>address families</b> ke prefixes carry kar sake: IPv4 unicast, IPv6 unicast, VPNv4 aur aur bhi. Har family ki apni table, apni policies aur apne best paths hote hain. Neighbor koi family tabhi exchange karta hai jab woh us family mein <b>activate</b> ho.</p>
<p>Default mein IOS har neighbor ko IPv4 unicast mein automatically activate karta hai. <code>no bgp default ipv4-unicast</code> ise band karta hai, jo kai families chalate waqt zyada saaf hai, kyunki tab har activation explicit hota hai.</p>
<pre class="code">router bgp 65300
 bgp router-id 10.255.0.1
 no bgp default ipv4-unicast
 neighbor 10.255.0.2 remote-as 65300
 neighbor 10.255.0.2 update-source Loopback0
 neighbor 2001:DB8:64::1 remote-as 64999
 !
 address-family ipv4 unicast
  neighbor 10.255.0.2 activate
  neighbor 10.255.0.2 next-hop-self
 exit-address-family
 !
 address-family ipv6 unicast
  neighbor 2001:DB8:64::1 activate
  network 2001:DB8:300::/48
 exit-address-family</pre>
<pre class="out">EDGE# show bgp ipv6 unicast summary | begin Neighbor
Neighbor        V           AS MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd
<span class="hl">2001:DB8:64::1  4        64999      15      14        3    0    0 00:08:44        1</span>
EDGE# show bgp ipv6 unicast | begin Network
     Network          Next Hop            Metric LocPrf Weight Path
 *&gt;  2001:DB8:300::/48
                       ::                       0         32768 i
 *&gt;  2001:DB8:FFFF::/48
                       2001:DB8:64::1           0             0 64999 i</pre>

<h3>Rules jo real tickets banate hain</h3>
<ul>
<li><b>Router ID.</b> IPv6-only router par bhi BGP ko 32-bit router ID chahiye. Koi IPv4 address configured na ho to <code>bgp router-id</code> manually set karo warna BGP start nahi hoga.</li>
<li><b>network ko exact RIB match chahiye.</b> <code>network 2001:DB8:300::/48</code> (ya IPv4 <code>network ... mask ...</code>) tabhi advertise hota hai jab exactly wahi prefix routing table mein ho. Common fix hai Null0 ki taraf static route.</li>
<li><b>Transport versus payload.</b> IPv6 prefixes IPv4 session par bhi ja sakte hain (IPv4 neighbor ko <code>address-family ipv6</code> ke neeche activate karo). Tab next hop <code>::FFFF:10.255.0.1</code> jaisa IPv4-mapped address ban jaata hai, jo unreachable hai, isliye paths inaccessible hote hain. Outbound route-map se <code>set ipv6 next-hop</code> karke fix karo, ya IPv6 addresses par peer karo.</li>
<li><b>Show commands.</b> <code>show ip bgp</code> sirf IPv4 unicast dikhata hai. <code>show bgp ipv6 unicast</code>, <code>show bgp ipv4 unicast summary</code> ya <code>show bgp all summary</code> use karo.</li>
<li><b>Policies per family hoti hain.</b> <code>address-family ipv4</code> ke neeche laga route-map ya prefix-list IPv6 ke liye kuch nahi karta; IPv6 ko IPv6 family ke neeche lagi <code>ipv6 prefix-list</code> chahiye.</li>
</ul>

<div class="warn"><p><b>Common galtiyan.</b> asdot ko asplain mein 65536 ki jagah 1000 se convert karna. <code>no bgp default ipv4-unicast</code> ke baad naya neighbor jod kar <code>activate</code> bhoolna: koi family active na ho to session kabhi up nahi hota, aur sirf ek family active ho to dusri family kuch carry nahi karti. <code>show ip bgp</code> dekh kar maan lena ki IPv6 routes missing hain. IPv6 routes ke liye IPv4 prefix-list use karna.</p></div>

<div class="exam"><p><b>Exam traps.</b> asdot X.Y = X x 65536 + Y. AS_TRANS 23456 hai. Private 4-byte range 4200000000 se shuru hoti hai. Jo neighbor Established hai par kisi family mein activate nahi, woh us family mein kuch exchange nahi karta. IPv4 session par IPv6 ko next-hop fix chahiye.</p></div>

<div class="scn"><h4>Dual-stack session jo kuch nahi le jaata tha</h4><p><code>no bgp default ipv4-unicast</code> chalane wale ek enterprise ne naye IPv4 neighbor 100.64.9.1 ke saath dusra provider link joda. Engineer ne galti se IPv6 template copy karke use sirf <code>address-family ipv6 unicast</code> ke neeche activate kiya. Session up hua, IPv6 routes aaye, par koi IPv4 prefix exchange nahi hua, isliye naya link ek hafte tak koi IPv4 traffic carry nahi karta raha. <code>show bgp ipv4 unicast summary</code> mein neighbor list bhi nahi tha. <code>address-family ipv4 unicast</code> ke neeche <code>neighbor 100.64.9.1 activate</code> jodne se fix hua.</p><p><b>Seekh:</b> default activation badalne ke baad har family ke liye <code>show bgp all summary</code> check karo.</p></div>

<div class="iv"><p class="q">"Jab 4-byte ASN wala router aise router se peer kare jo sirf 2-byte ASNs support karta hai, to kya hota hai?"</p><p>OPEN message mein 4-octet AS capability samjhao; iske bina naya router OPEN aur AS_PATH mein apne AS ki jagah AS_TRANS 23456 use karta hai, aur asli path AS4_PATH (optional transitive) mein carry karta hai, jise purana router aage pass kar deta hai. Purane router ko <code>remote-as 23456</code> configure karna hota hai. Dikhao ki aap asplain aur asdot convert kar sakte ho, aur regular expressions mein dot escape karna mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>4-byte ASN: asplain (default) ya asdot X.Y jahan value = X x 65536 + Y.</li>
<li>AS_TRANS 23456 aur AS4_PATH purane 2-byte speakers ko chalne dete hain.</li>
<li>Har address family ki apni table, activation aur policies hoti hain.</li>
<li><code>no bgp default ipv4-unicast</code> ka matlab har neighbor ko explicit <code>activate</code> chahiye.</li>
<li>IPv4 session par IPv6 ko usable IPv6 next hop chahiye; verify karne ke liye <code>show bgp ipv6 unicast</code> use karo.</li>
</ul></div>
`}};export{e as default};