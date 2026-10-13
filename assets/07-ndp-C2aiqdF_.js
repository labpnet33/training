var e={id:`ndp`,h:{en:`Neighbor Discovery: RS, RA, NS, NA and DAD`,hi:`Neighbor Discovery: RS, RA, NS, NA aur DAD`},body:{en:`
<p>When you move into a new colony you do four things. You ask "where is the colony office?" and the office also pins a notice on the board every few minutes with the rules and the gate address. You ask "who lives in house 5?" when you need to deliver something. And before you paint your house number on the gate, you ask loudly "does anyone already use number 12?" so two families never share one number. IPv6 <b>Neighbor Discovery Protocol (NDP)</b> does exactly these jobs on every link.</p>

<h3>NDP is ICMPv6</h3>
<p>NDP is not a separate protocol stack; it is a set of <b>ICMPv6</b> messages (IPv6 Next Header 58). It replaces ARP, ICMP router discovery and ICMP redirect from IPv4, and adds Duplicate Address Detection and Neighbor Unreachability Detection. ND messages are sent with a <b>Hop Limit of 255</b>, and receivers drop any ND message that arrives with a lower value; that proves the sender is on the same link, because a router would have decremented it.</p>
<table class="cmp"><tr><th>Message</th><th>ICMPv6 type</th><th>Sent to</th><th>Job</th></tr>
<tr><td>Router Solicitation (RS)</td><td>133</td><td><code>ff02::2</code></td><td>Host asks: are there routers here? Send me an RA now.</td></tr>
<tr><td>Router Advertisement (RA)</td><td>134</td><td><code>ff02::1</code> (or the asking host)</td><td>Router announces prefixes, default gateway, M/O flags, MTU.</td></tr>
<tr><td>Neighbor Solicitation (NS)</td><td>135</td><td>Solicited-node group of the target</td><td>Who has this address? Also used for DAD and reachability checks.</td></tr>
<tr><td>Neighbor Advertisement (NA)</td><td>136</td><td>The asker (or <code>ff02::1</code>)</td><td>I have it; here is my MAC.</td></tr>
<tr><td>Redirect</td><td>137</td><td>The host</td><td>A better first hop exists for that destination.</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 290" role="img" aria-label="ND message flow">
<rect x="60" y="10" width="140" height="36" rx="8" fill="#bbf7d0"/><text x="130" y="33" text-anchor="middle" class="svg-ink" font-size="13">PC1 (host)</text>
<rect x="440" y="10" width="140" height="36" rx="8" fill="#bae6fd"/><text x="510" y="33" text-anchor="middle" class="svg-ink" font-size="13">R1 (router)</text>
<line x1="130" y1="46" x2="130" y2="280" stroke="#64748b" stroke-width="1" stroke-dasharray="4 4"/>
<line x1="510" y1="46" x2="510" y2="280" stroke="#64748b" stroke-width="1" stroke-dasharray="4 4"/>
<line x1="130" y1="75" x2="510" y2="75" stroke="#64748b" stroke-width="2"/><text x="320" y="68" text-anchor="middle" class="svg-ink" font-size="12">1. RS 133 to ff02::2</text>
<line x1="510" y1="115" x2="130" y2="115" stroke="#64748b" stroke-width="2"/><text x="320" y="108" text-anchor="middle" class="svg-ink" font-size="12">2. RA 134: prefix /64, gateway FE80 of R1</text>
<line x1="130" y1="160" x2="330" y2="160" stroke="#64748b" stroke-width="2" stroke-dasharray="6 3"/><text x="140" y="153" class="svg-accent" font-size="12">3. DAD: NS from :: for my new address</text>
<text x="340" y="165" class="svg-muted" font-size="12">no answer = unique</text>
<line x1="130" y1="210" x2="510" y2="210" stroke="#64748b" stroke-width="2"/><text x="320" y="203" text-anchor="middle" class="svg-ink" font-size="12">4. NS 135 to ff02::1:ff.. of gateway</text>
<line x1="510" y1="250" x2="130" y2="250" stroke="#64748b" stroke-width="2"/><text x="320" y="243" text-anchor="middle" class="svg-ink" font-size="12">5. NA 136: my MAC is 5254.0c04.4b01</text>
</svg><p class="cap">A host joining the link in lab 2: find the router, check the address is unique, then resolve the gateway's MAC.</p></div>

<h3>Address resolution: NS and NA replace ARP</h3>
<p>PC1 wants to send a packet to its gateway, R1's link-local. It checks its <b>neighbor cache</b> (the IPv6 equivalent of the ARP cache). If there is no entry, it sends an <b>NS</b> to the target's solicited-node group (for example <code>ff02::1:ff04:4b01</code>, MAC <code>3333.ff04.4b01</code>). Only R1 has joined that group, so only R1 processes it. R1 replies with a unicast <b>NA</b> carrying its MAC, and both sides cache each other.</p>
<p>Cache entries have states. <b>INCMP</b> (incomplete): NS sent, no answer yet. <b>REACH</b> (reachable): confirmed recently. <b>STALE</b>: not confirmed for a while, still usable; the next packet moves it to <b>DELAY</b> and then <b>PROBE</b>, where the device sends unicast NS messages to check the neighbour is still alive. This is <b>Neighbor Unreachability Detection</b>.</p>
<pre class="out">R1# show ipv6 neighbors
IPv6 Address                              Age Link-layer Addr State Interface
<span class="hl">FE80::2                                     0 5254.0f04.5001  REACH Gi0/0</span>
2001:DB8:ACAD:12::2                         3 5254.0f04.5001  STALE Gi0/0
2001:DB8:ACAD:10::10                        0 0050.7f06.6d01  REACH Gi0/1</pre>

<h3>Router discovery: RS and RA</h3>
<p>An IOS router with <code>ipv6 unicast-routing</code> sends an unsolicited RA to <code>ff02::1</code> on every IPv6 interface, every 200 seconds by default, and immediately answers any RS. The RA is always sourced from the router's <b>link-local</b> address, and that is why hosts use a link-local as their default gateway. An RA carries:</p>
<ul>
<li>One or more <b>prefixes</b> with a prefix length, lifetimes, the <b>L</b> (on-link) flag and the <b>A</b> (autonomous, "you may use SLAAC with this") flag.</li>
<li>The <b>router lifetime</b> (IOS default 1800 seconds). Zero means "do not use me as a default router".</li>
<li>The <b>M</b> (managed) and <b>O</b> (other config) flags that steer hosts toward DHCPv6 (chapter 8).</li>
<li>The router's MAC (source link-layer option) and optionally the link MTU.</li>
</ul>

<h3>Duplicate Address Detection (DAD)</h3>
<p>Before using any new unicast address, including link-locals, a device marks it <b>tentative</b> and sends an NS with source <code>::</code> (it has no address yet), destination the solicited-node group of the tentative address, and the tentative address as the target. If anybody answers with an NA, the address is a duplicate and must not be used. If nothing comes back, the address becomes valid. IOS logs a failure like this and flags the address:</p>
<pre class="out">%IPV6_ND-4-DUPLICATE: Duplicate address 2001:DB8:ACAD:10::1 on GigabitEthernet0/1

R1# show ipv6 interface g0/1 | include subnet
    <span class="hl">2001:DB8:ACAD:10::1, subnet is 2001:DB8:ACAD:10::/64 [DUP]</span></pre>

<div class="eg"><p><b>Worked example.</b> PC1 in lab 2 builds <code>2001:db8:cafe:1:250:7fff:fe06:6d01</code>. For DAD it sends an NS from <code>::</code> to <code>ff02::1:ff06:6d01</code> (last 24 bits <code>06:6d01</code>), Ethernet destination <code>3333.ff06.6d01</code>, target the new address. No NA arrives, so the address becomes preferred and PC1 starts using it.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Looking for <code>show arp</code> output for IPv6 (use <code>show ipv6 neighbors</code>); blocking all ICMPv6 on an interface ACL "for security", which breaks ND completely; and forgetting that RAs need <code>ipv6 unicast-routing</code> on the router.</p></div>

<div class="exam"><p><b>Exam trap.</b> Match the pairs: <b>RS/RA</b> find routers and prefixes, <b>NS/NA</b> resolve MACs and do DAD. RS goes to <code>ff02::2</code>, periodic RA to <code>ff02::1</code>, NS to a solicited-node group. DAD's NS uses the <b>unspecified</b> source <code>::</code>.</p></div>

<div class="scn"><h4>The test router that hijacked a floor</h4><p>Users on the third floor suddenly got addresses from <code>2001:db8:9999:1::/64</code>, which was not in the IP plan, and lost Internet access over IPv6. <code>show ipv6 routers</code> on the floor's distribution switch listed a second router, <code>FE80::A8BB:CCFF:FE00:100</code>, advertising that prefix. The MAC led to an access port where a developer had plugged in a lab router with <code>ipv6 unicast-routing</code> enabled. The port was shut, clients recovered within minutes, and the team enabled <b>RA Guard</b> on access ports so only uplinks may send RAs.</p><p><b>Lesson:</b> any device that sends RAs can become the default gateway. RA Guard is the IPv6 equivalent of DHCP snooping for this risk.</p></div>

<div class="iv"><p class="q">"How does IPv6 find a neighbour's MAC address without ARP?"</p><p>Strong answer: with ICMPv6 Neighbor Discovery. The sender sends a Neighbor Solicitation (type 135) to the target's solicited-node multicast group, ff02::1:ff plus the last 24 bits, mapped to a 33:33 Ethernet MAC. The target replies with a Neighbor Advertisement (136) containing its MAC, and both cache the entry in the neighbor cache. Add that entries age from REACH to STALE and are re-verified with NUD, and that the same NS mechanism is used for DAD with source ::.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NDP uses ICMPv6 types 133 RS, 134 RA, 135 NS, 136 NA, 137 Redirect, always with Hop Limit 255.</li>
<li>NS/NA replace ARP; NS goes to the solicited-node group; see results with <code>show ipv6 neighbors</code>.</li>
<li>RAs come from the router's link-local, carry prefixes, router lifetime and M/O flags, every 200 s on IOS or on request.</li>
<li>DAD sends an NS from :: for every new address; a reply means duplicate, logged as %IPV6_ND-4-DUPLICATE and flagged [DUP].</li>
<li>Rogue RAs can hijack hosts; RA Guard on access ports protects against them.</li>
</ul></div>
`,hi:`
<p>Jab aap nayi colony mein shift hote ho to chaar kaam karte ho. Aap poochte ho "colony office kahan hai?" aur office bhi har kuch minute board par rules aur gate ke address ka notice lagata hai. Kuch deliver karna ho to poochte ho "house 5 mein kaun rehta hai?". Aur gate par apna house number paint karne se pehle aap zor se poochte ho "kya koi pehle se number 12 use karta hai?" taaki do families kabhi ek number share na karein. IPv6 <b>Neighbor Discovery Protocol (NDP)</b> har link par bilkul yahi kaam karta hai.</p>

<h3>NDP ICMPv6 hai</h3>
<p>NDP alag protocol stack nahi hai; yeh <b>ICMPv6</b> messages ka set hai (IPv6 Next Header 58). Yeh IPv4 ke ARP, ICMP router discovery aur ICMP redirect ki jagah leta hai, aur Duplicate Address Detection aur Neighbor Unreachability Detection jodta hai. ND messages <b>Hop Limit 255</b> ke saath bheje jaate hain, aur receivers kam value wala har ND message drop kar dete hain; isse saabit hota hai ki sender same link par hai, kyunki router use ghata deta.</p>
<table class="cmp"><tr><th>Message</th><th>ICMPv6 type</th><th>Kisko bheja jaata hai</th><th>Kaam</th></tr>
<tr><td>Router Solicitation (RS)</td><td>133</td><td><code>ff02::2</code></td><td>Host poochta hai: yahan routers hain? Abhi mujhe RA bhejo.</td></tr>
<tr><td>Router Advertisement (RA)</td><td>134</td><td><code>ff02::1</code> (ya poochne wala host)</td><td>Router prefixes, default gateway, M/O flags, MTU announce karta hai.</td></tr>
<tr><td>Neighbor Solicitation (NS)</td><td>135</td><td>Target ka solicited-node group</td><td>Yeh address kiske paas hai? DAD aur reachability checks ke liye bhi.</td></tr>
<tr><td>Neighbor Advertisement (NA)</td><td>136</td><td>Poochne wala (ya <code>ff02::1</code>)</td><td>Mere paas hai; yeh raha mera MAC.</td></tr>
<tr><td>Redirect</td><td>137</td><td>Host</td><td>Us destination ke liye behtar first hop maujood hai.</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 290" role="img" aria-label="ND message flow">
<rect x="60" y="10" width="140" height="36" rx="8" fill="#bbf7d0"/><text x="130" y="33" text-anchor="middle" class="svg-ink" font-size="13">PC1 (host)</text>
<rect x="440" y="10" width="140" height="36" rx="8" fill="#bae6fd"/><text x="510" y="33" text-anchor="middle" class="svg-ink" font-size="13">R1 (router)</text>
<line x1="130" y1="46" x2="130" y2="280" stroke="#64748b" stroke-width="1" stroke-dasharray="4 4"/>
<line x1="510" y1="46" x2="510" y2="280" stroke="#64748b" stroke-width="1" stroke-dasharray="4 4"/>
<line x1="130" y1="75" x2="510" y2="75" stroke="#64748b" stroke-width="2"/><text x="320" y="68" text-anchor="middle" class="svg-ink" font-size="12">1. RS 133 ff02::2 ko</text>
<line x1="510" y1="115" x2="130" y2="115" stroke="#64748b" stroke-width="2"/><text x="320" y="108" text-anchor="middle" class="svg-ink" font-size="12">2. RA 134: prefix /64, gateway R1 ka FE80</text>
<line x1="130" y1="160" x2="330" y2="160" stroke="#64748b" stroke-width="2" stroke-dasharray="6 3"/><text x="140" y="153" class="svg-accent" font-size="12">3. DAD: naye address ke liye :: se NS</text>
<text x="340" y="165" class="svg-muted" font-size="12">jawab nahi = unique</text>
<line x1="130" y1="210" x2="510" y2="210" stroke="#64748b" stroke-width="2"/><text x="320" y="203" text-anchor="middle" class="svg-ink" font-size="12">4. NS 135 gateway ke ff02::1:ff.. ko</text>
<line x1="510" y1="250" x2="130" y2="250" stroke="#64748b" stroke-width="2"/><text x="320" y="243" text-anchor="middle" class="svg-ink" font-size="12">5. NA 136: mera MAC 5254.0c04.4b01</text>
</svg><p class="cap">Lab 2 mein link join karta host: router dhoondho, check karo ki address unique hai, phir gateway ka MAC resolve karo.</p></div>

<h3>Address resolution: NS aur NA ARP ki jagah</h3>
<p>PC1 apne gateway, R1 ke link-local, ko packet bhejna chahta hai. Woh apna <b>neighbor cache</b> (ARP cache ka IPv6 version) check karta hai. Entry nahi hai to woh target ke solicited-node group ko <b>NS</b> bhejta hai (jaise <code>ff02::1:ff04:4b01</code>, MAC <code>3333.ff04.4b01</code>). Sirf R1 ne woh group join kiya hai, isliye sirf R1 use process karta hai. R1 apne MAC ke saath unicast <b>NA</b> se jawab deta hai, aur dono ek doosre ko cache kar lete hain.</p>
<p>Cache entries ki states hoti hain. <b>INCMP</b> (incomplete): NS gaya, abhi jawab nahi. <b>REACH</b> (reachable): haal hi mein confirm hua. <b>STALE</b>: kuch der se confirm nahi hua, phir bhi use ho sakta hai; agla packet use <b>DELAY</b> aur phir <b>PROBE</b> mein le jaata hai, jahan device unicast NS bhej kar check karta hai ki neighbour abhi zinda hai. Yeh <b>Neighbor Unreachability Detection</b> hai.</p>
<pre class="out">R1# show ipv6 neighbors
IPv6 Address                              Age Link-layer Addr State Interface
<span class="hl">FE80::2                                     0 5254.0f04.5001  REACH Gi0/0</span>
2001:DB8:ACAD:12::2                         3 5254.0f04.5001  STALE Gi0/0
2001:DB8:ACAD:10::10                        0 0050.7f06.6d01  REACH Gi0/1</pre>

<h3>Router discovery: RS aur RA</h3>
<p><code>ipv6 unicast-routing</code> wala IOS router har IPv6 interface par <code>ff02::1</code> ko unsolicited RA bhejta hai, default mein har 200 seconds, aur kisi bhi RS ka turant jawab deta hai. RA hamesha router ke <b>link-local</b> address se aata hai, isiliye hosts link-local ko default gateway banate hain. RA mein hota hai:</p>
<ul>
<li>Ek ya zyada <b>prefixes</b> prefix length, lifetimes, <b>L</b> (on-link) flag aur <b>A</b> (autonomous, "iske saath SLAAC use kar sakte ho") flag ke saath.</li>
<li><b>Router lifetime</b> (IOS default 1800 seconds). Zero ka matlab "mujhe default router mat banao".</li>
<li><b>M</b> (managed) aur <b>O</b> (other config) flags jo hosts ko DHCPv6 ki taraf bhejte hain (chapter 8).</li>
<li>Router ka MAC (source link-layer option) aur optionally link MTU.</li>
</ul>

<h3>Duplicate Address Detection (DAD)</h3>
<p>Koi bhi naya unicast address use karne se pehle, link-locals samet, device use <b>tentative</b> mark karta hai aur NS bhejta hai jiska source <code>::</code> hai (abhi uske paas address nahi), destination tentative address ka solicited-node group, aur target tentative address. Agar koi NA se jawab de, to address duplicate hai aur use nahi hona chahiye. Kuch wapas na aaye to address valid ho jaata hai. IOS failure aise log karta hai aur address ko flag karta hai:</p>
<pre class="out">%IPV6_ND-4-DUPLICATE: Duplicate address 2001:DB8:ACAD:10::1 on GigabitEthernet0/1

R1# show ipv6 interface g0/1 | include subnet
    <span class="hl">2001:DB8:ACAD:10::1, subnet is 2001:DB8:ACAD:10::/64 [DUP]</span></pre>

<div class="eg"><p><b>Worked example.</b> Lab 2 mein PC1 <code>2001:db8:cafe:1:250:7fff:fe06:6d01</code> banata hai. DAD ke liye woh <code>::</code> se <code>ff02::1:ff06:6d01</code> ko NS bhejta hai (aakhri 24 bits <code>06:6d01</code>), Ethernet destination <code>3333.ff06.6d01</code>, target naya address. Koi NA nahi aata, isliye address preferred ban jaata hai aur PC1 use use karna shuru karta hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> IPv6 ke liye <code>show arp</code> output dhoondhna (<code>show ipv6 neighbors</code> use karo); "security ke liye" interface ACL par saara ICMPv6 block karna, jo ND ko poori tarah tod deta hai; aur yeh bhoolna ki RAs ke liye router par <code>ipv6 unicast-routing</code> chahiye.</p></div>

<div class="exam"><p><b>Exam trap.</b> Jodiyan milao: <b>RS/RA</b> routers aur prefixes dhoondhte hain, <b>NS/NA</b> MACs resolve karte hain aur DAD karte hain. RS <code>ff02::2</code> ko jaata hai, periodic RA <code>ff02::1</code> ko, NS solicited-node group ko. DAD ka NS <b>unspecified</b> source <code>::</code> use karta hai.</p></div>

<div class="scn"><h4>Test router jisne poora floor hijack kar liya</h4><p>Teesre floor ke users ko achanak <code>2001:db8:9999:1::/64</code> se addresses milne lage, jo IP plan mein tha hi nahi, aur IPv6 par Internet access chala gaya. Floor ke distribution switch par <code>show ipv6 routers</code> ne ek doosra router, <code>FE80::A8BB:CCFF:FE00:100</code>, dikhaya jo woh prefix advertise kar raha tha. MAC ek access port tak le gaya jahan ek developer ne <code>ipv6 unicast-routing</code> enabled lab router laga diya tha. Port shut kiya gaya, clients kuch minute mein theek ho gaye, aur team ne access ports par <b>RA Guard</b> enable kiya taaki sirf uplinks RAs bhej sakein.</p><p><b>Seekh:</b> RA bhejne wala koi bhi device default gateway ban sakta hai. Is risk ke liye RA Guard DHCP snooping ka IPv6 equivalent hai.</p></div>

<div class="iv"><p class="q">"IPv6 bina ARP ke neighbour ka MAC address kaise dhoondhta hai?"</p><p>Strong answer: ICMPv6 Neighbor Discovery se. Sender target ke solicited-node multicast group, ff02::1:ff plus aakhri 24 bits, ko Neighbor Solicitation (type 135) bhejta hai, jo 33:33 Ethernet MAC par map hota hai. Target apne MAC ke saath Neighbor Advertisement (136) se jawab deta hai, aur dono entry neighbor cache mein rakhte hain. Jodo ki entries REACH se STALE hoti hain aur NUD se dobara verify hoti hain, aur yahi NS mechanism source :: ke saath DAD ke liye use hota hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NDP ICMPv6 types 133 RS, 134 RA, 135 NS, 136 NA, 137 Redirect use karta hai, hamesha Hop Limit 255 ke saath.</li>
<li>NS/NA ARP ki jagah lete hain; NS solicited-node group ko jaata hai; results <code>show ipv6 neighbors</code> mein dekho.</li>
<li>RAs router ke link-local se aate hain, prefixes, router lifetime aur M/O flags le jaate hain, IOS par har 200 s ya maangne par.</li>
<li>DAD har naye address ke liye :: se NS bhejta hai; jawab aaya to duplicate, %IPV6_ND-4-DUPLICATE log aur [DUP] flag.</li>
<li>Rogue RAs hosts ko hijack kar sakte hain; access ports par RA Guard inse bachata hai.</li>
</ul></div>
`}};export{e as default};