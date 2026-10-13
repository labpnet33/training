var e={id:`types-classes`,h:{en:`Address types: public, private, APIPA, loopback and classes A–E`,hi:`Address types: public, private, APIPA, loopback aur classes A–E`},body:{en:`
<p>Before you split any block, you must recognise what kind of address you are looking at. A help desk engineer who sees 169.254.x.x, 127.0.0.1 or 172.20.x.x should know the story behind it in one glance. The exam tests these ranges constantly, usually hidden inside a troubleshooting question.</p>

<h3>An analogy: phone numbers</h3>
<p>An office has <b>extension numbers</b> (say 2041) that work only inside the building; thousands of other companies use the same extensions without conflict. To call the outside world, the call goes through the reception switchboard, which uses the company's single <b>public number</b>. Private IPv4 addresses are the extensions; the public address is the main number; the router doing <b>NAT</b> is the switchboard. APIPA is like a phone that could not reach the switchboard and picked itself a temporary extension so it can at least talk to its neighbours. Loopback is dialling your own extension to test the handset.</p>

<h3>Public vs private (RFC 1918)</h3>
<p><b>Public</b> addresses are globally unique and routed on the internet; they are allocated through regional internet registries and your ISP. <b>Private</b> addresses, defined in <b>RFC 1918</b>, can be used by anyone inside their own network and are never routed on the public internet. To reach the internet, private hosts are translated to a public address by NAT or PAT (covered in the DHCP, DNS and NAT module).</p>
<table class="cmp"><tr><th>Private block</th><th>Range</th><th>Size</th></tr>
<tr><td>10.0.0.0/8</td><td>10.0.0.0 – 10.255.255.255</td><td>one class A-sized block (16.7 million addresses)</td></tr>
<tr><td>172.16.0.0/12</td><td>172.16.0.0 – 172.31.255.255</td><td>sixteen class B-sized blocks</td></tr>
<tr><td>192.168.0.0/16</td><td>192.168.0.0 – 192.168.255.255</td><td>256 class C-sized blocks</td></tr>
</table>

<h3>The other special ranges</h3>
<table class="cmp"><tr><th>Range</th><th>Name</th><th>What it means when you see it</th></tr>
<tr><td>169.254.0.0/16</td><td><b>APIPA</b> / IPv4 link-local</td><td>The host is set to DHCP, asked for an address and got no answer, so it picked one itself. Works only on the local link; no gateway.</td></tr>
<tr><td>127.0.0.0/8</td><td><b>Loopback</b> (localhost is 127.0.0.1)</td><td>Traffic never leaves the host. Pinging 127.0.0.1 tests the host's own TCP/IP stack, not the network.</td></tr>
<tr><td>100.64.0.0/10</td><td>Shared address space (CGNAT)</td><td>Used between an ISP's carrier-grade NAT and customers. Not RFC 1918, but also not public.</td></tr>
<tr><td>192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24</td><td>Documentation (TEST-NET)</td><td>Reserved for examples and books; never used on real networks.</td></tr>
<tr><td>0.0.0.0</td><td>Unspecified / "this host"</td><td>A host with no address yet (for example in a DHCP Discover). As 0.0.0.0/0 it means the default route.</td></tr>
<tr><td>255.255.255.255</td><td>Limited broadcast</td><td>Every host on the local link; routers never forward it.</td></tr>
</table>

<h3>Address classes A to E</h3>
<p>Before 1993, IPv4 was <b>classful</b>: the first few bits of the address fixed the mask. Modern networks are <b>classless</b> (CIDR, next chapter), but the classes still appear in exam questions, in old documentation and in the default mask a device suggests when you type an address.</p>

<div class="dia"><svg viewBox="0 0 640 160" role="img" aria-label="First octet ranges of classes A to E">
<rect x="20" y="40" width="240" height="40" fill="#bae6fd"/><text x="140" y="65" text-anchor="middle" class="svg-ink" font-size="13">A: 1–126 (/8)</text>
<rect x="260" y="40" width="4" height="40" fill="#fed7aa"/>
<rect x="264" y="40" width="124" height="40" fill="#bbf7d0"/><text x="326" y="65" text-anchor="middle" class="svg-ink" font-size="13">B: 128–191</text>
<rect x="388" y="40" width="62" height="40" fill="#ddd6fe"/><text x="419" y="65" text-anchor="middle" class="svg-ink" font-size="12">C</text>
<rect x="450" y="40" width="80" height="40" fill="#fde68a"/><text x="490" y="65" text-anchor="middle" class="svg-ink" font-size="12">D</text>
<rect x="530" y="40" width="90" height="40" fill="#e2e8f0"/><text x="575" y="65" text-anchor="middle" class="svg-ink" font-size="12">E</text>
<text x="20" y="30" class="svg-muted" font-size="12">0</text><text x="252" y="30" class="svg-accent" font-size="12">127</text><text x="380" y="30" class="svg-muted" font-size="12">192</text><text x="442" y="30" class="svg-muted" font-size="12">224</text><text x="520" y="30" class="svg-muted" font-size="12">240</text><text x="604" y="30" class="svg-muted" font-size="12">255</text>
<text x="419" y="102" text-anchor="middle" class="svg-muted" font-size="12">192–223 /24</text><text x="490" y="120" text-anchor="middle" class="svg-muted" font-size="12">multicast</text><text x="575" y="102" text-anchor="middle" class="svg-muted" font-size="12">reserved</text>
<text x="262" y="140" text-anchor="middle" class="svg-accent" font-size="12">127 = loopback</text>
</svg><p class="cap">The first octet alone tells you the class. 127 sits between A and B and is reserved for loopback.</p></div>

<table class="cmp"><tr><th>Class</th><th>First octet</th><th>Leading bits</th><th>Default mask</th><th>Use</th></tr>
<tr><td>A</td><td>1 – 126</td><td>0</td><td>255.0.0.0 (/8)</td><td>Unicast, 16,777,214 hosts per network</td></tr>
<tr><td>B</td><td>128 – 191</td><td>10</td><td>255.255.0.0 (/16)</td><td>Unicast, 65,534 hosts per network</td></tr>
<tr><td>C</td><td>192 – 223</td><td>110</td><td>255.255.255.0 (/24)</td><td>Unicast, 254 hosts per network</td></tr>
<tr><td>D</td><td>224 – 239</td><td>1110</td><td>none</td><td>Multicast (for example OSPF uses 224.0.0.5)</td></tr>
<tr><td>E</td><td>240 – 255</td><td>1111</td><td>none</td><td>Experimental / reserved</td></tr>
</table>
<p>Note that 0 and 127 are not usable class A networks, and that each RFC 1918 block sits inside a class: 10 in A, 172.16–31 in B, 192.168 in C.</p>

<div class="eg"><p><b>Worked example: classify quickly.</b> 172.20.14.9 → first octet 172 → class B, and 172.20 is inside 172.16.0.0/12, so it is <b>private</b>. 172.32.1.1 → class B but outside 172.16–31, so it is <b>public</b>. 169.254.23.9 → APIPA. 203.0.113.50 → class C documentation range. 239.1.1.1 → class D multicast. 192.168.50.62 (our PC-SALES) → class C, private.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Writing 172.16.0.0/16 when you mean the whole private block; the RFC 1918 block is 172.16.0.0/<b>12</b>, reaching up to 172.31.255.255. And thinking an address's class decides its mask today: 10.1.1.0/24 is perfectly normal even though 10 is "class A".</p></div>

<div class="exam"><p><b>Exam traps.</b> "Which address is private?" with options like 172.32.0.5, 192.169.1.1 and 10.255.0.1: only the last is RFC 1918. 100.64.0.0/10 is not RFC 1918 even though it is not publicly routed. And a host showing 169.254.x.x points to a DHCP problem, not a DNS problem.</p></div>

<div class="scn"><h4>The "private" range that was not private</h4><p>A growing company built a new lab using 172.32.0.0/16, assuming everything starting with 172 was private. Weeks later, staff in that lab could not reach a partner's cloud portal. A traceroute showed the traffic never left the building: the internal routers had a connected route for 172.32.0.0/16 and the partner's real public servers happened to live in that space. The team re-addressed the lab to 172.24.0.0/16, inside the true 172.16.0.0/12 block, and the portal worked.</p><p><b>Lesson:</b> the private 172 block ends at 172.31. Using public space internally hides real internet destinations.</p></div>

<div class="iv"><p class="q">"Why can a host with a 10.x address browse the internet if 10.x is not routed publicly?"</p><p>Strong answer: 10.0.0.0/8 is RFC 1918 private, so internet routers drop it. The edge router or firewall performs NAT, usually PAT, replacing the private source address with a public one and tracking the port so replies come back to the right host. Mention the other two private blocks, and that APIPA and loopback are also non-routable for different reasons.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>RFC 1918 private: 10.0.0.0/8, 172.16.0.0/12 (to 172.31.255.255), 192.168.0.0/16; they reach the internet through NAT.</li>
<li>169.254.0.0/16 is APIPA: DHCP failed. 127.0.0.0/8 is loopback: tests the local stack only.</li>
<li>Classes by first octet: A 1–126, B 128–191, C 192–223, D 224–239 multicast, E 240–255 reserved.</li>
<li>Default masks /8, /16, /24 belong to A, B, C, but modern networks are classless.</li>
<li>Know the extras: 100.64.0.0/10 CGNAT, TEST-NET documentation ranges, 0.0.0.0 and 255.255.255.255.</li>
</ul></div>
`,hi:`
<p>Kisi bhi block ko baantne se pehle aapko pehchaanna hoga ki aap kis tarah ka address dekh rahe ho. Jo help desk engineer 169.254.x.x, 127.0.0.1 ya 172.20.x.x dekhta hai use ek nazar mein uske peeche ki kahani pata honi chahiye. Exam in ranges ko lagataar test karta hai, aksar troubleshooting question ke andar chhupa kar.</p>

<h3>Ek analogy: phone numbers</h3>
<p>Ek office mein <b>extension numbers</b> hote hain (jaise 2041) jo sirf building ke andar kaam karte hain; hazaaron doosri companies bina conflict ke wahi extensions use karti hain. Bahar ki duniya ko call karne ke liye call reception switchboard se jaati hai, jo company ka ek <b>public number</b> use karta hai. Private IPv4 addresses extensions hain; public address main number hai; <b>NAT</b> karne wala router switchboard hai. APIPA us phone jaisa hai jo switchboard tak nahi pahunch paaya aur usne khud ek temporary extension chun liya taaki kam se kam padosiyon se baat kar sake. Loopback apna hi extension dial karke handset test karna hai.</p>

<h3>Public vs private (RFC 1918)</h3>
<p><b>Public</b> addresses globally unique hote hain aur internet par route hote hain; yeh regional internet registries aur aapke ISP ke through allocate hote hain. <b>Private</b> addresses, jo <b>RFC 1918</b> mein define hain, koi bhi apne network ke andar use kar sakta hai aur yeh public internet par kabhi route nahi hote. Internet tak pahunchne ke liye private hosts ko NAT ya PAT se public address mein translate kiya jaata hai (DHCP, DNS aur NAT module mein cover hai).</p>
<table class="cmp"><tr><th>Private block</th><th>Range</th><th>Size</th></tr>
<tr><td>10.0.0.0/8</td><td>10.0.0.0 – 10.255.255.255</td><td>ek class A size ka block (16.7 million addresses)</td></tr>
<tr><td>172.16.0.0/12</td><td>172.16.0.0 – 172.31.255.255</td><td>solah class B size ke blocks</td></tr>
<tr><td>192.168.0.0/16</td><td>192.168.0.0 – 192.168.255.255</td><td>256 class C size ke blocks</td></tr>
</table>

<h3>Baaki special ranges</h3>
<table class="cmp"><tr><th>Range</th><th>Naam</th><th>Dikhe to iska matlab</th></tr>
<tr><td>169.254.0.0/16</td><td><b>APIPA</b> / IPv4 link-local</td><td>Host DHCP par set hai, usne address maanga aur jawab nahi mila, to usne khud ek chun liya. Sirf local link par kaam karta hai; koi gateway nahi.</td></tr>
<tr><td>127.0.0.0/8</td><td><b>Loopback</b> (localhost 127.0.0.1 hai)</td><td>Traffic kabhi host se bahar nahi jaata. 127.0.0.1 ping karna host ka apna TCP/IP stack test karta hai, network nahi.</td></tr>
<tr><td>100.64.0.0/10</td><td>Shared address space (CGNAT)</td><td>ISP ke carrier-grade NAT aur customers ke beech use hota hai. RFC 1918 nahi hai, lekin public bhi nahi hai.</td></tr>
<tr><td>192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24</td><td>Documentation (TEST-NET)</td><td>Examples aur books ke liye reserved; real networks par kabhi use nahi hote.</td></tr>
<tr><td>0.0.0.0</td><td>Unspecified / "yeh host"</td><td>Jis host ke paas abhi address nahi hai (jaise DHCP Discover mein). 0.0.0.0/0 ke roop mein iska matlab default route hai.</td></tr>
<tr><td>255.255.255.255</td><td>Limited broadcast</td><td>Local link ka har host; routers ise kabhi forward nahi karte.</td></tr>
</table>

<h3>Address classes A se E</h3>
<p>1993 se pehle IPv4 <b>classful</b> tha: address ke pehle kuch bits mask fix kar dete the. Modern networks <b>classless</b> hain (CIDR, agla chapter), lekin classes ab bhi exam questions mein, purani documentation mein aur us default mask mein dikhti hain jo address type karne par device suggest karta hai.</p>

<div class="dia"><svg viewBox="0 0 640 160" role="img" aria-label="Classes A se E ki first octet ranges">
<rect x="20" y="40" width="240" height="40" fill="#bae6fd"/><text x="140" y="65" text-anchor="middle" class="svg-ink" font-size="13">A: 1–126 (/8)</text>
<rect x="260" y="40" width="4" height="40" fill="#fed7aa"/>
<rect x="264" y="40" width="124" height="40" fill="#bbf7d0"/><text x="326" y="65" text-anchor="middle" class="svg-ink" font-size="13">B: 128–191</text>
<rect x="388" y="40" width="62" height="40" fill="#ddd6fe"/><text x="419" y="65" text-anchor="middle" class="svg-ink" font-size="12">C</text>
<rect x="450" y="40" width="80" height="40" fill="#fde68a"/><text x="490" y="65" text-anchor="middle" class="svg-ink" font-size="12">D</text>
<rect x="530" y="40" width="90" height="40" fill="#e2e8f0"/><text x="575" y="65" text-anchor="middle" class="svg-ink" font-size="12">E</text>
<text x="20" y="30" class="svg-muted" font-size="12">0</text><text x="252" y="30" class="svg-accent" font-size="12">127</text><text x="380" y="30" class="svg-muted" font-size="12">192</text><text x="442" y="30" class="svg-muted" font-size="12">224</text><text x="520" y="30" class="svg-muted" font-size="12">240</text><text x="604" y="30" class="svg-muted" font-size="12">255</text>
<text x="419" y="102" text-anchor="middle" class="svg-muted" font-size="12">192–223 /24</text><text x="490" y="120" text-anchor="middle" class="svg-muted" font-size="12">multicast</text><text x="575" y="102" text-anchor="middle" class="svg-muted" font-size="12">reserved</text>
<text x="262" y="140" text-anchor="middle" class="svg-accent" font-size="12">127 = loopback</text>
</svg><p class="cap">Sirf pehla octet class bata deta hai. 127 A aur B ke beech hai aur loopback ke liye reserved hai.</p></div>

<table class="cmp"><tr><th>Class</th><th>Pehla octet</th><th>Leading bits</th><th>Default mask</th><th>Use</th></tr>
<tr><td>A</td><td>1 – 126</td><td>0</td><td>255.0.0.0 (/8)</td><td>Unicast, har network mein 16,777,214 hosts</td></tr>
<tr><td>B</td><td>128 – 191</td><td>10</td><td>255.255.0.0 (/16)</td><td>Unicast, har network mein 65,534 hosts</td></tr>
<tr><td>C</td><td>192 – 223</td><td>110</td><td>255.255.255.0 (/24)</td><td>Unicast, har network mein 254 hosts</td></tr>
<tr><td>D</td><td>224 – 239</td><td>1110</td><td>koi nahi</td><td>Multicast (jaise OSPF 224.0.0.5 use karta hai)</td></tr>
<tr><td>E</td><td>240 – 255</td><td>1111</td><td>koi nahi</td><td>Experimental / reserved</td></tr>
</table>
<p>Dhyan do ki 0 aur 127 usable class A networks nahi hain, aur har RFC 1918 block ek class ke andar hai: 10 A mein, 172.16–31 B mein, 192.168 C mein.</p>

<div class="eg"><p><b>Worked example: jaldi classify karo.</b> 172.20.14.9 → pehla octet 172 → class B, aur 172.20 172.16.0.0/12 ke andar hai, to yeh <b>private</b> hai. 172.32.1.1 → class B lekin 172.16–31 ke bahar, to yeh <b>public</b> hai. 169.254.23.9 → APIPA. 203.0.113.50 → class C documentation range. 239.1.1.1 → class D multicast. 192.168.50.62 (hamara PC-SALES) → class C, private.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Poore private block ki baat karte hue 172.16.0.0/16 likhna; RFC 1918 block 172.16.0.0/<b>12</b> hai, jo 172.31.255.255 tak jaata hai. Aur yeh sochna ki aaj address ki class uska mask tay karti hai: 10.1.1.0/24 bilkul normal hai bhale hi 10 "class A" ho.</p></div>

<div class="exam"><p><b>Exam traps.</b> "Kaunsa address private hai?" jismein options 172.32.0.5, 192.169.1.1 aur 10.255.0.1 jaise hon: sirf aakhri RFC 1918 hai. 100.64.0.0/10 RFC 1918 nahi hai bhale hi public route na ho. Aur 169.254.x.x dikhane wala host DHCP problem ki taraf ishara karta hai, DNS problem ki taraf nahi.</p></div>

<div class="scn"><h4>"Private" range jo private thi hi nahi</h4><p>Ek badhti company ne naya lab 172.32.0.0/16 use karke banaya, yeh maan kar ki 172 se shuru hone wala sab private hai. Hafton baad us lab ka staff ek partner ke cloud portal tak nahi pahunch pa raha tha. Traceroute ne dikhaya ki traffic building se bahar gaya hi nahi: internal routers ke paas 172.32.0.0/16 ka connected route tha aur partner ke asli public servers usi space mein the. Team ne lab ko 172.24.0.0/16 par re-address kiya, jo asli 172.16.0.0/12 block ke andar hai, aur portal chal gaya.</p><p><b>Seekh:</b> private 172 block 172.31 par khatam hota hai. Andar public space use karne se asli internet destinations chhup jaati hain.</p></div>

<div class="iv"><p class="q">"Agar 10.x publicly route nahi hota, to 10.x address wala host internet kaise browse karta hai?"</p><p>Strong answer: 10.0.0.0/8 RFC 1918 private hai, isliye internet routers use drop karte hain. Edge router ya firewall NAT karta hai, aam taur par PAT, jo private source address ko public address se badal deta hai aur port track karta hai taaki replies sahi host tak wapas aayein. Baaki do private blocks ka naam lo, aur batao ki APIPA aur loopback bhi alag wajahon se non-routable hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>RFC 1918 private: 10.0.0.0/8, 172.16.0.0/12 (172.31.255.255 tak), 192.168.0.0/16; yeh NAT ke through internet tak pahunchte hain.</li>
<li>169.254.0.0/16 APIPA hai: DHCP fail hua. 127.0.0.0/8 loopback hai: sirf local stack test karta hai.</li>
<li>Pehle octet se classes: A 1–126, B 128–191, C 192–223, D 224–239 multicast, E 240–255 reserved.</li>
<li>Default masks /8, /16, /24 A, B, C ke hain, lekin modern networks classless hain.</li>
<li>Extras yaad rakho: 100.64.0.0/10 CGNAT, TEST-NET documentation ranges, 0.0.0.0 aur 255.255.255.255.</li>
</ul></div>
`}};export{e as default};