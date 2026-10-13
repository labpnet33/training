var e={id:`summarisation`,h:{en:`Summarisation: area range and summary-prefix for IPv6`,hi:`Summarisation: IPv6 ke liye area range aur summary-prefix`},body:{en:`
<p>A sorting centre in Delhi does not keep a separate shelf for every street in Bengaluru. It has one shelf labelled "PIN 5600xx: send to Bengaluru", and the Bengaluru centre sorts to street level. That one label is a <b>summary</b>. OSPFv3 summarisation does the same thing: an ABR or ASBR replaces many specific IPv6 prefixes with one shorter prefix, so the rest of the network keeps fewer routes and is shielded from flaps inside the summarised block.</p>

<h3>Where you can summarise</h3>
<p>Inside an area, every router must have the identical LSDB, so no summarisation is possible there. OSPFv3 summarises only at <b>boundaries</b>:</p>
<ul>
<li><b>ABR</b>: <code>area X range</code> summarises area X's intra-area prefixes into the inter-area prefix LSAs (0x2003) that it sends into other areas.</li>
<li><b>ASBR</b>: <code>summary-prefix</code> summarises redistributed external prefixes (0x4005, or 0x2007 in an NSSA). An NSSA ABR can also apply it when translating type 7 into type 5.</li>
</ul>

<h3>IPv6 summary math, step by step</h3>
<p>IPv6 is written in hex, so convert only the hextet that changes to binary. Each hex digit is exactly 4 bits, which makes the math easier than IPv4.</p>
<div class="eg"><p><b>Worked example 1: the lab.</b> Prefixes 2001:DB8:ACAD:<b>10</b>::/64 to 2001:DB8:ACAD:<b>13</b>::/64. The fourth hextet (bits 49 to 64) is 0010, 0011, 0012, 0013. The last hex digit goes 0, 1, 2, 3 = 0000, 0001, 0010, 0011. Only the last 2 bits vary. Prefix length = 64 - 2 = <b>62</b>. Summary: <code>2001:DB8:ACAD:10::/62</code>, covering 10:: to 13:: exactly.</p>
<p><b>Example 2.</b> 10:: to 17:: gives last digits 0 to 7 = 3 varying bits, so /61. And 10:: to 1F:: gives 4 varying bits, so /60.</p>
<p><b>Example 3, the trap.</b> 12:: to 15::. A /62 block must start on a multiple of 4 (10, 14, 18...). 12 to 15 crosses the 14 boundary. One summary would need /61 (10:: to 17::), which also claims 10, 11, 16 and 17. The exact answer is two summaries: 12::/63 and 14::/63.</p></div>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Area range">
<rect x="20" y="30" width="250" height="180" rx="10" fill="#e2e8f0"/><text x="40" y="52" class="svg-muted" font-size="12">Area 0</text>
<rect x="370" y="30" width="250" height="180" rx="10" fill="#ddd6fe"/><text x="390" y="52" class="svg-muted" font-size="12">Area 1</text>
<rect x="60" y="100" width="110" height="50" rx="8" fill="#bae6fd"/><text x="115" y="130" text-anchor="middle" class="svg-ink" font-size="14">R1</text>
<rect x="260" y="100" width="120" height="50" rx="8" fill="#fde68a"/><text x="320" y="122" text-anchor="middle" class="svg-ink" font-size="14">R2 ABR</text><text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">area 1 range</text>
<rect x="470" y="70" width="130" height="110" rx="8" fill="#fed7aa"/><text x="535" y="95" text-anchor="middle" class="svg-ink" font-size="12">R3 loopbacks</text><text x="535" y="115" text-anchor="middle" class="svg-muted" font-size="12">10::1/128</text><text x="535" y="133" text-anchor="middle" class="svg-muted" font-size="12">11::1  12::1</text><text x="535" y="151" text-anchor="middle" class="svg-muted" font-size="12">13::1/128</text>
<line x1="170" y1="125" x2="260" y2="125" stroke="#64748b" stroke-width="2"/><line x1="380" y1="125" x2="470" y2="125" stroke="#64748b" stroke-width="2"/>
<text x="215" y="190" text-anchor="middle" class="svg-accent" font-size="12">one OI 10::/62</text>
<text x="425" y="190" text-anchor="middle" class="svg-accent" font-size="12">four specifics</text>
</svg><p class="cap">R2 keeps the four specific routes inside area 1 and advertises only the /62 into area 0.</p></div>

<h3>Lab task 3: summarise on R2</h3>
<pre class="code">R2(config)# ipv6 router ospf 1
R2(config-rtr)# area 1 range 2001:DB8:ACAD:10::/62
<span class="c">! options: not-advertise (hide the block entirely), cost N (fix the metric)</span>
<span class="c">! AF style: router ospfv3 1 / address-family ipv6 unicast / area 1 range ...</span></pre>
<p>R1 before and after:</p>
<pre class="out">R1# show ipv6 route ospf        <span class="c">(before)</span>
OI  2001:DB8:ACAD:10::1/128 [110/2]
     via FE80::5200:FF:FE02:0, GigabitEthernet0/0
OI  2001:DB8:ACAD:11::1/128 [110/2]
     via FE80::5200:FF:FE02:0, GigabitEthernet0/0
OI  2001:DB8:ACAD:12::1/128 [110/2]
     via FE80::5200:FF:FE02:0, GigabitEthernet0/0
OI  2001:DB8:ACAD:13::1/128 [110/2]
     via FE80::5200:FF:FE02:0, GigabitEthernet0/0
OI  2001:DB8:ACAD:F23::/64 [110/2]
     via FE80::5200:FF:FE02:0, GigabitEthernet0/0

R1# show ipv6 route ospf        <span class="c">(after)</span>
<span class="hl">OI  2001:DB8:ACAD:10::/62 [110/2]</span>
     via FE80::5200:FF:FE02:0, GigabitEthernet0/0
OI  2001:DB8:ACAD:F23::/64 [110/2]
     via FE80::5200:FF:FE02:0, GigabitEthernet0/0</pre>
<p>F23::/64 is not inside the /62, so it still travels on its own. The loopbacks show as /128 because OSPFv3 advertises loopbacks as host routes (chapter 3); the /62 covers them just as well.</p>
<pre class="out">R2# show ipv6 ospf | section Area 1
    Area 1
        Number of interfaces in this area is 1
        SPF algorithm executed 7 times
        <span class="hl">Area ranges are</span>
           <span class="hl">2001:DB8:ACAD:10::/62 Active(1) Advertise</span></pre>
<p>"Active" means at least one component prefix exists, so the summary is advertised. If every component disappears, the summary is withdrawn. On the ABR, the summary also creates a <b>discard route</b> to Null0, so a packet for an unused address inside the block, such as 2001:DB8:ACAD:13::99, is dropped at R2 instead of looping toward a default route.</p>

<h3>Lab task 4: prove it</h3>
<pre class="out">R1# ping 2001:DB8:ACAD:12::1
Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to 2001:DB8:ACAD:12::1, timeout is 2 seconds:
<span class="hl">!!!!!</span>
Success rate is 100 percent (5/5), round-trip min/avg/max = 1/1/2 ms</pre>
<p>R1 matches the /62 and sends the packet to R2. R2 holds the specific <code>O 2001:DB8:ACAD:12::1/128</code> learned inside area 1 and forwards it to R3. Longest match does the rest.</p>

<h3>Summarising externals: summary-prefix</h3>
<pre class="code"><span class="c">! on the ASBR that redistributes (for example from static or BGP)</span>
ipv6 router ospf 1
 redistribute static
 summary-prefix 2001:DB8:FF00::/40
<span class="c">! add not-advertise to suppress the block, or tag N to mark it</span></pre>
<p>A common exam distractor puts <code>summary-prefix</code> on an ABR for internal prefixes, or <code>area range</code> on an ASBR for externals. Each command only works on its own LSA type.</p>

<div class="warn"><p><b>Common mistake.</b> Configuring the range with the wrong area number. <code>area 0 range 2001:DB8:ACAD:10::/62</code> on R2 does nothing for these prefixes, because they live in area 1. The area in the command is the area the prefixes come <b>from</b>.</p></div>

<div class="exam"><p><b>Exam trap.</b> Summarisation happens only on ABRs (<code>area range</code>) and ASBRs (<code>summary-prefix</code>). A range typed on an internal router such as R3 is accepted but has no effect. Also, a summary does not hide changes of the <b>last</b> component: when all components disappear, the summary is withdrawn.</p></div>

<div class="scn"><h4>The new subnet nobody could reach</h4><p>A lab team added Loopback14 with 2001:DB8:ACAD:14::1/64 on R3. From the backbone it was reachable, but a remote site that filtered inbound OSPFv3 routes with a prefix list allowing only 2001:DB8:ACAD:10::/62 could not reach it. <code>show ipv6 route</code> at the core showed a separate <code>OI 2001:DB8:ACAD:14::1/128</code>, because 14:: is outside the /62 block. The team chose to widen the range to /61 on R2 (10:: to 17::, all owned by the lab) and update the remote filter.</p><p><b>Lesson:</b> a summary only covers its bit boundary; plan address blocks so growth stays inside the summary.</p></div>

<div class="iv"><p class="q">"How do you summarise in OSPFv3, and what side effects should you expect?"</p><p>Strong answer: on the ABR with <code>area X range prefix/len</code>, which replaces that area's intra-area prefixes with one inter-area prefix LSA; on the ASBR with <code>summary-prefix</code> for externals. Side effects: the ABR installs a Null0 discard route for the summary, the summary stays up while any component exists, routers outside lose visibility of individual prefixes (which can cause suboptimal routing with multiple ABRs), and over-summarising can attract traffic for prefixes that live elsewhere.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Summarise only at boundaries: <code>area X range</code> on ABRs, <code>summary-prefix</code> on ASBRs.</li>
<li>IPv6 math: count the varying bits in the changing hextet; 10:: to 13:: = /62.</li>
<li>Summary blocks must start on their own boundary; otherwise split them.</li>
<li>The ABR adds a Null0 discard route; the summary is withdrawn when all components vanish.</li>
<li>Lab result: R1 has one <code>OI 2001:DB8:ACAD:10::/62</code> and can ping 12::1.</li>
</ul></div>
`,hi:`
<p>Delhi ka sorting centre Bengaluru ki har street ke liye alag shelf nahi rakhta. Uske paas ek shelf hai jis par likha hai "PIN 5600xx: Bengaluru bhejo", aur Bengaluru centre street level tak sort karta hai. Woh ek label <b>summary</b> hai. OSPFv3 summarisation yahi karta hai: ABR ya ASBR bahut saare specific IPv6 prefixes ki jagah ek chhota prefix bhejta hai, isliye baaki network kam routes rakhta hai aur summarised block ke andar ke flaps se bacha rehta hai.</p>

<h3>Summarise kahan kar sakte ho</h3>
<p>Area ke andar har router ka LSDB identical hona chahiye, isliye wahan summarisation possible nahi. OSPFv3 sirf <b>boundaries</b> par summarise karta hai:</p>
<ul>
<li><b>ABR</b>: <code>area X range</code> area X ke intra-area prefixes ko un inter-area prefix LSAs (0x2003) mein summarise karta hai jo woh doosre areas mein bhejta hai.</li>
<li><b>ASBR</b>: <code>summary-prefix</code> redistributed external prefixes (0x4005, ya NSSA mein 0x2007) ko summarise karta hai. NSSA ABR bhi type 7 ko type 5 mein translate karte waqt ise laga sakta hai.</li>
</ul>

<h3>IPv6 summary math, step by step</h3>
<p>IPv6 hex mein likha jaata hai, isliye sirf badalne wale hextet ko binary mein convert karo. Har hex digit exactly 4 bits hai, jisse math IPv4 se aasaan ho jaata hai.</p>
<div class="eg"><p><b>Worked example 1: lab.</b> Prefixes 2001:DB8:ACAD:<b>10</b>::/64 se 2001:DB8:ACAD:<b>13</b>::/64. Chautha hextet (bits 49 se 64) 0010, 0011, 0012, 0013 hai. Aakhri hex digit 0, 1, 2, 3 = 0000, 0001, 0010, 0011 jaata hai. Sirf aakhri 2 bits badalte hain. Prefix length = 64 - 2 = <b>62</b>. Summary: <code>2001:DB8:ACAD:10::/62</code>, jo 10:: se 13:: tak exactly cover karta hai.</p>
<p><b>Example 2.</b> 10:: se 17:: mein aakhri digits 0 se 7 = 3 badalne wale bits, isliye /61. Aur 10:: se 1F:: mein 4 badalne wale bits, isliye /60.</p>
<p><b>Example 3, trap.</b> 12:: se 15::. /62 block 4 ke multiple par shuru hona chahiye (10, 14, 18...). 12 se 15 14 ki boundary cross karta hai. Ek summary ke liye /61 (10:: se 17::) chahiye, jo 10, 11, 16 aur 17 ko bhi claim karta hai. Sahi jawab do summaries hain: 12::/63 aur 14::/63.</p></div>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Area range">
<rect x="20" y="30" width="250" height="180" rx="10" fill="#e2e8f0"/><text x="40" y="52" class="svg-muted" font-size="12">Area 0</text>
<rect x="370" y="30" width="250" height="180" rx="10" fill="#ddd6fe"/><text x="390" y="52" class="svg-muted" font-size="12">Area 1</text>
<rect x="60" y="100" width="110" height="50" rx="8" fill="#bae6fd"/><text x="115" y="130" text-anchor="middle" class="svg-ink" font-size="14">R1</text>
<rect x="260" y="100" width="120" height="50" rx="8" fill="#fde68a"/><text x="320" y="122" text-anchor="middle" class="svg-ink" font-size="14">R2 ABR</text><text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">area 1 range</text>
<rect x="470" y="70" width="130" height="110" rx="8" fill="#fed7aa"/><text x="535" y="95" text-anchor="middle" class="svg-ink" font-size="12">R3 loopbacks</text><text x="535" y="115" text-anchor="middle" class="svg-muted" font-size="12">10::1/128</text><text x="535" y="133" text-anchor="middle" class="svg-muted" font-size="12">11::1  12::1</text><text x="535" y="151" text-anchor="middle" class="svg-muted" font-size="12">13::1/128</text>
<line x1="170" y1="125" x2="260" y2="125" stroke="#64748b" stroke-width="2"/><line x1="380" y1="125" x2="470" y2="125" stroke="#64748b" stroke-width="2"/>
<text x="215" y="190" text-anchor="middle" class="svg-accent" font-size="12">ek OI 10::/62</text>
<text x="425" y="190" text-anchor="middle" class="svg-accent" font-size="12">chaar specifics</text>
</svg><p class="cap">R2 area 1 ke andar chaar specific routes rakhta hai aur area 0 mein sirf /62 advertise karta hai.</p></div>

<h3>Lab task 3: R2 par summarise karo</h3>
<pre class="code">R2(config)# ipv6 router ospf 1
R2(config-rtr)# area 1 range 2001:DB8:ACAD:10::/62
<span class="c">! options: not-advertise (block ko poora chhupao), cost N (metric fix karo)</span>
<span class="c">! AF style: router ospfv3 1 / address-family ipv6 unicast / area 1 range ...</span></pre>
<p>R1 pehle aur baad mein:</p>
<pre class="out">R1# show ipv6 route ospf        <span class="c">(pehle)</span>
OI  2001:DB8:ACAD:10::1/128 [110/2]
     via FE80::5200:FF:FE02:0, GigabitEthernet0/0
OI  2001:DB8:ACAD:11::1/128 [110/2]
     via FE80::5200:FF:FE02:0, GigabitEthernet0/0
OI  2001:DB8:ACAD:12::1/128 [110/2]
     via FE80::5200:FF:FE02:0, GigabitEthernet0/0
OI  2001:DB8:ACAD:13::1/128 [110/2]
     via FE80::5200:FF:FE02:0, GigabitEthernet0/0
OI  2001:DB8:ACAD:F23::/64 [110/2]
     via FE80::5200:FF:FE02:0, GigabitEthernet0/0

R1# show ipv6 route ospf        <span class="c">(baad mein)</span>
<span class="hl">OI  2001:DB8:ACAD:10::/62 [110/2]</span>
     via FE80::5200:FF:FE02:0, GigabitEthernet0/0
OI  2001:DB8:ACAD:F23::/64 [110/2]
     via FE80::5200:FF:FE02:0, GigabitEthernet0/0</pre>
<p>F23::/64 /62 ke andar nahi hai, isliye woh abhi bhi alag se jaata hai. Loopbacks /128 dikhte hain kyunki OSPFv3 loopbacks ko host routes ki tarah advertise karta hai (chapter 3); /62 unhe bhi utna hi achha cover karta hai.</p>
<pre class="out">R2# show ipv6 ospf | section Area 1
    Area 1
        Number of interfaces in this area is 1
        SPF algorithm executed 7 times
        <span class="hl">Area ranges are</span>
           <span class="hl">2001:DB8:ACAD:10::/62 Active(1) Advertise</span></pre>
<p>"Active" ka matlab hai kam se kam ek component prefix exist karta hai, isliye summary advertise hota hai. Agar har component gayab ho jaaye, to summary withdraw ho jaata hai. ABR par summary ek <b>discard route</b> bhi banata hai jo Null0 ki taraf hai, isliye block ke andar kisi unused address ka packet, jaise 2001:DB8:ACAD:13::99, default route ki taraf loop hone ki jagah R2 par drop hota hai.</p>

<h3>Lab task 4: prove karo</h3>
<pre class="out">R1# ping 2001:DB8:ACAD:12::1
Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to 2001:DB8:ACAD:12::1, timeout is 2 seconds:
<span class="hl">!!!!!</span>
Success rate is 100 percent (5/5), round-trip min/avg/max = 1/1/2 ms</pre>
<p>R1 /62 match karta hai aur packet R2 ko bhejta hai. R2 ke paas area 1 ke andar seekha specific <code>O 2001:DB8:ACAD:12::1/128</code> hai aur woh ise R3 ko forward karta hai. Baaki kaam longest match karta hai.</p>

<h3>Externals summarise karna: summary-prefix</h3>
<pre class="code"><span class="c">! redistribute karne wale ASBR par (jaise static ya BGP se)</span>
ipv6 router ospf 1
 redistribute static
 summary-prefix 2001:DB8:FF00::/40
<span class="c">! block suppress karne ke liye not-advertise, ya mark karne ke liye tag N jodo</span></pre>
<p>Ek common exam distractor internal prefixes ke liye ABR par <code>summary-prefix</code> rakhta hai, ya externals ke liye ASBR par <code>area range</code>. Har command sirf apne LSA type par kaam karti hai.</p>

<div class="warn"><p><b>Common galti.</b> Range ko galat area number ke saath configure karna. R2 par <code>area 0 range 2001:DB8:ACAD:10::/62</code> in prefixes ke liye kuch nahi karta, kyunki woh area 1 mein rehte hain. Command mein area woh hai jahan <b>se</b> prefixes aate hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> Summarisation sirf ABRs (<code>area range</code>) aur ASBRs (<code>summary-prefix</code>) par hota hai. R3 jaise internal router par type ki gayi range accept ho jaati hai lekin koi asar nahi karti. Aur summary <b>aakhri</b> component ke changes nahi chhupata: jab saare components gayab ho jaate hain, summary withdraw ho jaata hai.</p></div>

<div class="scn"><h4>Naya subnet jahan koi pahunch nahi paaya</h4><p>Ek lab team ne R3 par 2001:DB8:ACAD:14::1/64 ke saath Loopback14 joda. Backbone se yeh reachable tha, lekin ek remote site jo inbound OSPFv3 routes ko sirf 2001:DB8:ACAD:10::/62 allow karne wali prefix list se filter karti thi, wahan tak nahi pahunch paayi. Core par <code>show ipv6 route</code> ne alag <code>OI 2001:DB8:ACAD:14::1/128</code> dikhaya, kyunki 14:: /62 block ke bahar hai. Team ne R2 par range ko /61 tak badhane ka faisla kiya (10:: se 17::, sab lab ke) aur remote filter update kiya.</p><p><b>Seekh:</b> summary sirf apni bit boundary cover karta hai; address blocks aise plan karo ki growth summary ke andar rahe.</p></div>

<div class="iv"><p class="q">"OSPFv3 mein summarise kaise karte ho, aur kya side effects expect karne chahiye?"</p><p>Strong answer: ABR par <code>area X range prefix/len</code> se, jo us area ke intra-area prefixes ki jagah ek inter-area prefix LSA bhejta hai; ASBR par externals ke liye <code>summary-prefix</code> se. Side effects: ABR summary ke liye Null0 discard route install karta hai, summary tab tak up rehta hai jab tak koi component exist kare, bahar ke routers individual prefixes nahi dekh paate (jisse multiple ABRs ke saath suboptimal routing ho sakti hai), aur over-summarising doosri jagah rehne wale prefixes ka traffic kheench sakta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Sirf boundaries par summarise karo: ABRs par <code>area X range</code>, ASBRs par <code>summary-prefix</code>.</li>
<li>IPv6 math: badalne wale hextet mein badalne wale bits gino; 10:: se 13:: = /62.</li>
<li>Summary blocks apni boundary par shuru hone chahiye; warna unhe split karo.</li>
<li>ABR Null0 discard route jodta hai; saare components gayab hone par summary withdraw hota hai.</li>
<li>Lab result: R1 ke paas ek <code>OI 2001:DB8:ACAD:10::/62</code> hai aur woh 12::1 ping kar sakta hai.</li>
</ul></div>
`}};export{e as default};