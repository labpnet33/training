var e={id:`type5-mobility`,h:{en:`Type-5 prefix routes and MAC mobility`,hi:`Type-5 prefix routes aur MAC mobility`},body:{en:`
<p>Type 2 is like a personal visiting card: one host, one address. But the fabric also needs to say "the whole 10.30.0.0/16 network is behind LEAF3", like a signboard for a neighbourhood instead of a house number. That is <b>route type 5, the IP prefix route</b>. And when a person moves house, the post office must replace the old address with the new one. That is <b>MAC mobility</b>: a counter that tells everyone which announcement is the newest.</p>

<h3>Type 5: IP prefix advertisement</h3>
<p>A type-5 route carries an IP prefix and length, a gateway/next hop (the leaf VTEP), the L3VNI and the VRF's route target. It is created from the VRF's BGP table when <code>advertise l2vpn evpn</code> is configured under <code>address-family ipv4 vrf TENANT-A</code>, and the source of the prefix is a redistribution (<code>redistribute connected</code>, static, or a routing protocol toward an external router).</p>
<p>Without that one line, the VRF's connected subnets and external routes never leave the leaf as type 5. Hosts still work inside the fabric because /32 host routes come from type 2, but subnets that are not populated by hosts, and external networks, would be unreachable.</p>

<div class="dia"><svg viewBox="0 0 640 160" role="img" aria-label="Type 5 origin">
<rect x="20" y="50" width="120" height="50" rx="8" fill="#fed7aa"/><text x="80" y="72" text-anchor="middle" class="svg-ink" font-size="12">External router</text><text x="80" y="88" text-anchor="middle" class="svg-muted" font-size="12">172.31.0.0/16</text>
<rect x="190" y="40" width="160" height="70" rx="8" fill="#bae6fd"/><text x="270" y="62" text-anchor="middle" class="svg-ink" font-size="12">LEAF3 VRF TENANT-A</text><text x="270" y="80" text-anchor="middle" class="svg-muted" font-size="12">advertise l2vpn evpn</text><text x="270" y="96" text-anchor="middle" class="svg-muted" font-size="12">redistribute ...</text>
<rect x="400" y="50" width="120" height="50" rx="8" fill="#ddd6fe"/><text x="460" y="80" text-anchor="middle" class="svg-ink" font-size="12">SPINE RRs</text>
<rect x="560" y="50" width="70" height="50" rx="8" fill="#bae6fd"/><text x="595" y="80" text-anchor="middle" class="svg-ink" font-size="12">LEAF1/2</text>
<g stroke="#64748b" stroke-width="2"><line x1="140" y1="75" x2="190" y2="75"/><line x1="350" y1="75" x2="400" y2="75"/><line x1="520" y1="75" x2="560" y2="75"/></g>
<text x="460" y="130" text-anchor="middle" class="svg-accent" font-size="12">[5] 172.31.0.0/16 NH 10.255.1.13, L3VNI 50901, RT 65001:50901</text>
</svg><p class="cap">A type-5 route carries a prefix and the L3VNI, not a MAC.</p></div>

<pre class="out">LEAF1# show bgp l2vpn evpn route-type 5
Route Distinguisher: 65001:3
 *>i [5][65001:3][0][16][172.31.0.0]/17
                    10.255.1.13              0    100      0 ?
      Extended Community: RT:65001:50901 ENCAP:8 Router MAC:0c11.2233.4455

LEAF1# show ip route vrf TENANT-A 172.31.0.0
Routing entry for 172.31.0.0/16
  Known via "bgp 65001", distance 200, metric 0, type internal
  * 10.255.1.13 (default), from 10.255.0.101, 00:02:19 ago</pre>
<p>Look at the extended community. <b>RT</b> tells importers it belongs to TENANT-A, <b>ENCAP:8</b> means VXLAN, and the <b>Router MAC</b> is the inner destination MAC the ingress leaf will use for the routed packet.</p>

<h3>MAC mobility</h3>
<p>A VM moves from LEAF1 to LEAF2. The same MAC now appears on a different leaf. During the move both leaves may briefly advertise it. EVPN solves the ambiguity with a <b>MAC mobility extended community</b> containing a sequence number:</p>
<ol>
<li>LEAF1 advertises the MAC with no sequence number (meaning 0).</li>
<li>The VM moves; LEAF2 learns the MAC locally, sees the existing remote route from LEAF1, and advertises the MAC with <b>sequence 1</b>.</li>
<li>All leaves prefer the route with the higher sequence number. LEAF1, on seeing a higher sequence from another leaf, withdraws its local advertisement.</li>
<li>If it moves again, LEAF1 advertises sequence 2.</li>
</ol>

<pre class="out">LEAF3# show bgp l2vpn evpn route-type 2
Route Distinguisher: 65001:10
 *>i [2][65001:10][0][48][0050.56aa.0001][32][10.10.10.11]/24
                    10.255.1.12              0    100      0 i
      Extended Community: RT:65001:10 ENCAP:8 <span class="hl">MacMobility:0x0:1</span></pre>

<h3>Loops and duplicates</h3>
<p>If two leaves keep stealing the same MAC from each other, the sequence number climbs rapidly. Platforms detect "too many moves in a time window" (a typical default is five moves in a minute), freeze the MAC and log a duplicate warning. It usually means a loop behind the leaves or two hosts with the same MAC.</p>

<div class="eg"><p><b>Worked example: reading the sequence number.</b> <code>MacMobility:0x0:1</code> means flags 0x0 and sequence 1: this MAC has moved once. If you see sequence 4000 and rising, you have a loop or a flapping host, not a legitimate migration.</p></div>

<div class="warn"><p><b>Common mistake.</b> Waiting for MAC aging after a VM move. In EVPN the new leaf announces the MAC immediately with a higher sequence; stale traffic usually stops within seconds. If traffic still goes to the old leaf, the new announcement is not reaching it: check BGP and RT, not aging timers.</p></div>

<div class="exam"><p><b>Exam trap.</b> The anycast gateway MAC must not be treated as a mobile MAC, otherwise it would seem to "move" between leaves constantly. <code>default-gateway advertise enable</code> exists for this reason.</p></div>

<div class="scn"><h4>The stale MAC after the migration</h4><p>After a planned VM move to LEAF2, pings from LEAF3 still arrived at LEAF1 for two minutes. LEAF3 held the old type-2 route from LEAF1 with no mobility sequence; LEAF2's new advertisement had been dropped by an RT mismatch on LEAF3 (its EVI imported 65001:10 only, LEAF2 exported 65001:11). Fixing the RT made the new route (sequence 1) win at once.</p><p><b>Lesson:</b> a stale MAC after a move is almost always a missing or filtered announcement.</p></div>

<div class="iv"><p class="q">"How does EVPN handle a host moving between leaves?"</p><p>Strong answer: the new leaf learns the MAC locally and advertises a type-2 route with a MAC mobility extended community whose sequence is one higher than the old one. Receivers prefer the higher sequence, the old leaf withdraws its route, and rapid repeated moves are flagged as duplicates to stop loops.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Type 5 = prefix route; needs advertise l2vpn evpn and a redistribution source.</li>
<li>Type-5 attributes: RT, ENCAP:8 and Router MAC.</li>
<li>Type 2 mobility sequence: higher wins; old leaf withdraws.</li>
<li>Too many moves in a short time = duplicate or loop.</li>
</ul></div>
`,hi:`
<p>Type 2 ek personal visiting card jaisa hai: ek host, ek address. Lekin fabric ko yeh bhi batana hota hai "poora 10.30.0.0/16 network LEAF3 ke peeche hai", jaise ghar ke number ki jagah mohalle ka signboard. Yahi <b>route type 5, IP prefix route</b> hai. Aur jab koi ghar badalta hai, post office ko purana address naye se replace karna padta hai. Yahi <b>MAC mobility</b> hai: ek counter jo sabko batata hai kaunsa announcement sabse naya hai.</p>

<h3>Type 5: IP prefix advertisement</h3>
<p>Type-5 route IP prefix aur length, gateway/next hop (leaf VTEP), L3VNI aur VRF ka route target carry karta hai. Yeh VRF ki BGP table se tab banta hai jab <code>address-family ipv4 vrf TENANT-A</code> ke neeche <code>advertise l2vpn evpn</code> configured ho, aur prefix ka source redistribution hota hai (<code>redistribute connected</code>, static, ya external router ki taraf routing protocol).</p>
<p>Us ek line ke bina VRF ke connected subnets aur external routes leaf se type 5 ke roop mein bahar nahi jaate. Fabric ke andar hosts phir bhi kaam karte hain kyunki /32 host routes type 2 se aate hain, lekin jo subnets hosts se populate nahi hain aur external networks unreachable honge.</p>

<div class="dia"><svg viewBox="0 0 640 160" role="img" aria-label="Type 5 origin">
<rect x="20" y="50" width="120" height="50" rx="8" fill="#fed7aa"/><text x="80" y="72" text-anchor="middle" class="svg-ink" font-size="12">External router</text><text x="80" y="88" text-anchor="middle" class="svg-muted" font-size="12">172.31.0.0/16</text>
<rect x="190" y="40" width="160" height="70" rx="8" fill="#bae6fd"/><text x="270" y="62" text-anchor="middle" class="svg-ink" font-size="12">LEAF3 VRF TENANT-A</text><text x="270" y="80" text-anchor="middle" class="svg-muted" font-size="12">advertise l2vpn evpn</text><text x="270" y="96" text-anchor="middle" class="svg-muted" font-size="12">redistribute ...</text>
<rect x="400" y="50" width="120" height="50" rx="8" fill="#ddd6fe"/><text x="460" y="80" text-anchor="middle" class="svg-ink" font-size="12">SPINE RRs</text>
<rect x="560" y="50" width="70" height="50" rx="8" fill="#bae6fd"/><text x="595" y="80" text-anchor="middle" class="svg-ink" font-size="12">LEAF1/2</text>
<g stroke="#64748b" stroke-width="2"><line x1="140" y1="75" x2="190" y2="75"/><line x1="350" y1="75" x2="400" y2="75"/><line x1="520" y1="75" x2="560" y2="75"/></g>
<text x="460" y="130" text-anchor="middle" class="svg-accent" font-size="12">[5] 172.31.0.0/16 NH 10.255.1.13, L3VNI 50901, RT 65001:50901</text>
</svg><p class="cap">Type-5 route prefix aur L3VNI carry karta hai, MAC nahi.</p></div>

<pre class="out">LEAF1# show bgp l2vpn evpn route-type 5
Route Distinguisher: 65001:3
 *>i [5][65001:3][0][16][172.31.0.0]/17
                    10.255.1.13              0    100      0 ?
      Extended Community: RT:65001:50901 ENCAP:8 Router MAC:0c11.2233.4455

LEAF1# show ip route vrf TENANT-A 172.31.0.0
Routing entry for 172.31.0.0/16
  Known via "bgp 65001", distance 200, metric 0, type internal
  * 10.255.1.13 (default), from 10.255.0.101, 00:02:19 ago</pre>
<p>Extended community dekho. <b>RT</b> importers ko batata hai ki yeh TENANT-A ka hai, <b>ENCAP:8</b> ka matlab VXLAN, aur <b>Router MAC</b> woh inner destination MAC hai jo ingress leaf routed packet ke liye use karega.</p>

<h3>MAC mobility</h3>
<p>Ek VM LEAF1 se LEAF2 par move hota hai. Wahi MAC ab doosre leaf par dikhta hai. Move ke dauraan dono leaves thodi der ke liye use advertise kar sakte hain. EVPN is ambiguity ko <b>MAC mobility extended community</b> se solve karta hai jisme sequence number hota hai:</p>
<ol>
<li>LEAF1 MAC ko bina sequence number (matlab 0) ke advertise karta hai.</li>
<li>VM move hota hai; LEAF2 MAC locally learn karta hai, LEAF1 ka existing remote route dekhta hai, aur MAC ko <b>sequence 1</b> ke saath advertise karta hai.</li>
<li>Saare leaves higher sequence number wala route prefer karte hain. LEAF1, doosre leaf se higher sequence dekh kar, apna local advertisement withdraw karta hai.</li>
<li>Phir move ho to LEAF1 sequence 2 advertise karta hai.</li>
</ol>

<pre class="out">LEAF3# show bgp l2vpn evpn route-type 2
Route Distinguisher: 65001:10
 *>i [2][65001:10][0][48][0050.56aa.0001][32][10.10.10.11]/24
                    10.255.1.12              0    100      0 i
      Extended Community: RT:65001:10 ENCAP:8 <span class="hl">MacMobility:0x0:1</span></pre>

<h3>Loops aur duplicates</h3>
<p>Agar do leaves same MAC ko ek doosre se baar-baar "churate" rahein to sequence number tezi se badhta hai. Platforms "short time window mein bahut zyada moves" detect karte hain (typical default ek minute mein paanch moves), MAC ko freeze karte hain aur duplicate warning log karte hain. Matlab aam taur par leaves ke peeche loop ya same MAC wale do hosts.</p>

<div class="eg"><p><b>Worked example: sequence number padhna.</b> <code>MacMobility:0x0:1</code> ka matlab flags 0x0 aur sequence 1: yeh MAC ek baar move hua hai. Agar sequence 4000 aur badhta dikhe to yeh loop ya flapping host hai, legitimate migration nahi.</p></div>

<div class="warn"><p><b>Common galti.</b> VM move ke baad MAC aging ka intezaar karna. EVPN mein naya leaf turant higher sequence ke saath MAC announce karta hai; stale traffic aam taur par seconds mein band ho jaata hai. Agar traffic ab bhi purane leaf par ja raha hai, to naya announcement us tak nahi pahunch raha: BGP aur RT check karo, aging timers nahi.</p></div>

<div class="exam"><p><b>Exam trap.</b> Anycast gateway MAC ko mobile MAC nahi maanna chahiye, warna woh leaves ke beech baar-baar "move" hota dikhega. <code>default-gateway advertise enable</code> isi wajah se hai.</p></div>

<div class="scn"><h4>Migration ke baad stale MAC</h4><p>LEAF2 par planned VM move ke baad LEAF3 se pings do minute tak LEAF1 par pahunchte rahe. LEAF3 ke paas LEAF1 ka purana type-2 route tha jisme mobility sequence nahi tha; LEAF2 ka naya advertisement LEAF3 par RT mismatch se drop ho gaya tha (uska EVI sirf 65001:10 import karta tha, LEAF2 65001:11 export kar raha tha). RT theek karte hi naya route (sequence 1) turant jeet gaya.</p><p><b>Seekh:</b> move ke baad stale MAC aksar missing ya filtered announcement hota hai.</p></div>

<div class="iv"><p class="q">"Host ke leaves ke beech move karne ko EVPN kaise handle karta hai?"</p><p>Strong answer: naya leaf MAC ko locally learn karta hai aur MAC mobility extended community ke saath type-2 route advertise karta hai jiska sequence purane se ek zyada hota hai. Receivers higher sequence prefer karte hain, purana leaf apna route withdraw karta hai, aur tezi se baar-baar moves duplicate ke roop mein flag hote hain taaki loops rukein.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Type 5 = prefix route; advertise l2vpn evpn aur redistribution source chahiye.</li>
<li>Type-5 attributes: RT, ENCAP:8 aur Router MAC.</li>
<li>Type 2 mobility sequence: higher jeetta hai; purana leaf withdraw karta hai.</li>
<li>Kam samay mein bahut moves = duplicate ya loop.</li>
</ul></div>
`}};export{e as default};