var e={id:`longest-prefix-match`,h:{en:`Longest prefix match, with drills`,hi:`Longest prefix match, drills ke saath`},body:{en:`
<p>A courier has three instructions pinned on the wall: "Anything for India goes to the Delhi hub", "Anything for Maharashtra goes to the Mumbai van", and "Anything for Flat 7B, Sea View Towers, Pune goes by bike to Ravi". A parcel for Flat 7B matches all three notes. Which one does he follow? The <b>most specific</b> one, the note that describes the parcel most exactly. Routers do the same, and the rule is called <b>longest prefix match</b>.</p>

<h3>The rule</h3>
<p>For every packet, the router compares the destination IP with every route in the table. A route <b>matches</b> if the first <i>n</i> bits of the destination equal the first <i>n</i> bits of the route's prefix, where <i>n</i> is the prefix length. Among all matching routes, the one with the <b>largest</b> <i>n</i> wins. It does not matter what AD or metric the other matching routes have: a /26 beats a /24 even if the /24 is connected and the /26 is static.</p>
<p>A /32 matches exactly one address. A /0 (the default route) matches every address because zero bits have to match, which is why it is used only when nothing longer matches.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Nested prefixes from /0 to /32">
<rect x="10" y="10" width="620" height="240" rx="10" fill="#e2e8f0"/><text x="24" y="32" class="svg-ink" font-size="13">0.0.0.0/0 default</text>
<rect x="40" y="45" width="560" height="195" rx="10" fill="#bae6fd"/><text x="54" y="66" class="svg-ink" font-size="13">10.0.0.0/8</text>
<rect x="70" y="80" width="500" height="150" rx="10" fill="#ddd6fe"/><text x="84" y="100" class="svg-ink" font-size="13">10.10.0.0/16</text>
<rect x="100" y="112" width="440" height="110" rx="10" fill="#bbf7d0"/><text x="114" y="132" class="svg-ink" font-size="13">10.10.20.0/24</text>
<rect x="250" y="142" width="270" height="70" rx="10" fill="#fde68a"/><text x="264" y="162" class="svg-ink" font-size="13">10.10.20.64/26 (.64 to .127)</text>
<rect x="330" y="172" width="170" height="30" rx="8" fill="#fed7aa"/><text x="415" y="192" text-anchor="middle" class="svg-ink" font-size="12">10.10.20.77/32</text>
</svg><p class="cap">The drill table as nested boxes. A destination matches every box it sits inside; the smallest box wins.</p></div>

<h3>The drill table</h3>
<p>Router EDGE has these routes (next hops shortened):</p>
<pre class="out">S*    0.0.0.0/0 [1/0] via 203.0.113.1
S     10.0.0.0/8 [1/0] via 10.255.0.1
S     10.10.0.0/16 [1/0] via 10.255.0.5
S     10.10.20.0/24 [1/0] via 10.255.0.9
S     10.10.20.64/26 [1/0] via 10.255.0.13
S     10.10.20.77/32 [1/0] via 10.255.0.17</pre>

<div class="eg"><p><b>Worked example in binary: 10.10.20.100.</b> The first three octets 10.10.20 match the /8, /16 and /24. For the /26 we need the first 2 bits of the fourth octet to match. 64 is <code>01000000</code>, so the /26 wants <code>01</code>. 100 is <code>01100100</code>, which starts with <code>01</code>: match. For the /32 we need all of 100 to equal 77: no. Matching routes: /0, /8, /16, /24, /26. Longest is /26, so the packet goes to 10.255.0.13.</p>
<p>Now 10.10.20.200: 200 is <code>11001000</code>, which starts with <code>11</code>, not <code>01</code>. The /26 does not match. Longest match is the /24, next hop 10.255.0.9.</p></div>

<h3>Drills: cover the answers and try</h3>
<table class="cmp">
<tr><th>Destination</th><th>Matching routes</th><th>Winner</th><th>Next hop</th></tr>
<tr><td>10.10.20.77</td><td>/0 /8 /16 /24 /26 /32</td><td>/32</td><td>10.255.0.17</td></tr>
<tr><td>10.10.20.100</td><td>/0 /8 /16 /24 /26</td><td>/26</td><td>10.255.0.13</td></tr>
<tr><td>10.10.20.63</td><td>/0 /8 /16 /24</td><td>/24</td><td>10.255.0.9</td></tr>
<tr><td>10.10.20.127</td><td>/0 /8 /16 /24 /26</td><td>/26</td><td>10.255.0.13</td></tr>
<tr><td>10.10.21.5</td><td>/0 /8 /16</td><td>/16</td><td>10.255.0.5</td></tr>
<tr><td>10.200.1.1</td><td>/0 /8</td><td>/8</td><td>10.255.0.1</td></tr>
<tr><td>192.0.2.50</td><td>/0</td><td>/0 (default)</td><td>203.0.113.1</td></tr>
</table>
<p>The fast method: find the block size of each prefix from the IPv4 module. A /26 has block size 64 in the fourth octet, so 10.10.20.64/26 covers .64 to .127. Anything from .64 to .127 matches; .63 and .128 do not.</p>

<h3>Let the router do it for you</h3>
<pre class="out">EDGE#show ip route 10.10.20.100
Routing entry for 10.10.20.64/26
  Known via "static", distance 1, metric 0
  Routing Descriptor Blocks:
  <span class="hl">* 10.255.0.13</span>
      Route metric is 0, traffic share count is 1</pre>
<p><code>show ip route</code> followed by an address runs the longest-match lookup and prints the winning entry. If nothing matches and there is no default, you see <code>% Network not in table</code> or <code>% Subnet not in table</code>. The CEF equivalent, <code>show ip cef 10.10.20.100</code>, shows the same winner plus the exit interface.</p>

<div class="warn"><p><b>Common mistake.</b> Choosing the route with the lowest AD or the "best-looking" next hop among routes with different prefix lengths. AD and metric are only compared between routes for the <b>same prefix and length</b>. Different lengths are never a competition: the longest match is used, full stop.</p></div>

<div class="exam"><p><b>Exam trap.</b> Exhibits often include a route whose block ends just before the destination, such as 10.10.20.64/27 (.64 to .95) for destination 10.10.20.100. It looks close, but it does not match. Always calculate the range; never guess from how similar the numbers look.</p></div>

<div class="scn"><h4>The /32 that hijacked a server</h4><p>A hospital's PACS server 10.10.20.77 suddenly became unreachable from the imaging floor, while its neighbours in the same /24 worked. <code>show ip route 10.10.20.77</code> on the core showed <code>Routing entry for 10.10.20.77/32</code> via a firewall that no longer existed: someone had added a host route months earlier for a migration and forgotten it. When the old firewall was removed, the /32 still pointed to its address through a still-valid subnet, so it stayed installed and won by longest match. Removing the stale host route fixed it.</p><p><b>Lesson:</b> a very specific route always wins; audit old host routes before blaming the network.</p></div>

<div class="iv"><p class="q">"A router has routes for 10.0.0.0/8 learned by OSPF and 10.1.1.0/24 learned statically. Where does a packet for 10.1.1.5 go, and why?"</p><p>Strong answer: via the /24, because forwarding uses longest prefix match first. AD only decides between routes for the identical prefix and length; 10.0.0.0/8 and 10.1.1.0/24 are different prefixes and both live in the table. A packet to 10.2.2.2 would use the OSPF /8.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A route matches when the first n bits of the destination equal its prefix, n being the prefix length.</li>
<li>Among matches, the longest prefix wins; /32 is the most specific, /0 the least.</li>
<li>AD and metric never override longest match between different prefix lengths.</li>
<li>Use block sizes to find a prefix's range quickly and check edge addresses.</li>
<li><code>show ip route x.x.x.x</code> and <code>show ip cef x.x.x.x</code> show the winning entry.</li>
</ul></div>
`,hi:`
<p>Ek courier ki deewar par teen instructions lage hain: "India ke liye sab kuch Delhi hub jaata hai", "Maharashtra ke liye sab kuch Mumbai van mein", aur "Flat 7B, Sea View Towers, Pune ke liye sab kuch bike se Ravi le jaayega". Flat 7B ka parcel teeno notes match karta hai. Woh kaunsa follow karega? <b>Sabse specific</b> wala, jo note parcel ko sabse exactly describe karta hai. Routers bhi yahi karte hain, aur is rule ko <b>longest prefix match</b> kehte hain.</p>

<h3>Rule</h3>
<p>Har packet ke liye router destination IP ko table ke har route se compare karta hai. Route <b>match</b> karta hai agar destination ke pehle <i>n</i> bits route ke prefix ke pehle <i>n</i> bits ke barabar hon, jahan <i>n</i> prefix length hai. Saare matching routes mein se sabse <b>bada</b> <i>n</i> wala jeetta hai. Doosre matching routes ki AD ya metric kuch bhi ho, farak nahi padta: /26 /24 ko harata hai chahe /24 connected ho aur /26 static.</p>
<p>/32 exactly ek address match karta hai. /0 (default route) har address match karta hai kyunki zero bits match hone hain, isliye yeh tabhi use hota hai jab koi lamba match na ho.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="/0 se /32 tak nested prefixes">
<rect x="10" y="10" width="620" height="240" rx="10" fill="#e2e8f0"/><text x="24" y="32" class="svg-ink" font-size="13">0.0.0.0/0 default</text>
<rect x="40" y="45" width="560" height="195" rx="10" fill="#bae6fd"/><text x="54" y="66" class="svg-ink" font-size="13">10.0.0.0/8</text>
<rect x="70" y="80" width="500" height="150" rx="10" fill="#ddd6fe"/><text x="84" y="100" class="svg-ink" font-size="13">10.10.0.0/16</text>
<rect x="100" y="112" width="440" height="110" rx="10" fill="#bbf7d0"/><text x="114" y="132" class="svg-ink" font-size="13">10.10.20.0/24</text>
<rect x="250" y="142" width="270" height="70" rx="10" fill="#fde68a"/><text x="264" y="162" class="svg-ink" font-size="13">10.10.20.64/26 (.64 se .127)</text>
<rect x="330" y="172" width="170" height="30" rx="8" fill="#fed7aa"/><text x="415" y="192" text-anchor="middle" class="svg-ink" font-size="12">10.10.20.77/32</text>
</svg><p class="cap">Drill table nested boxes ki tarah. Destination har us box ko match karta hai jiske andar woh hai; sabse chhota box jeetta hai.</p></div>

<h3>Drill table</h3>
<p>Router EDGE par yeh routes hain (next hops chhote kiye gaye):</p>
<pre class="out">S*    0.0.0.0/0 [1/0] via 203.0.113.1
S     10.0.0.0/8 [1/0] via 10.255.0.1
S     10.10.0.0/16 [1/0] via 10.255.0.5
S     10.10.20.0/24 [1/0] via 10.255.0.9
S     10.10.20.64/26 [1/0] via 10.255.0.13
S     10.10.20.77/32 [1/0] via 10.255.0.17</pre>

<div class="eg"><p><b>Binary mein worked example: 10.10.20.100.</b> Pehle teen octets 10.10.20 /8, /16 aur /24 match karte hain. /26 ke liye chauthe octet ke pehle 2 bits match hone chahiye. 64 <code>01000000</code> hai, isliye /26 ko <code>01</code> chahiye. 100 <code>01100100</code> hai, jo <code>01</code> se shuru hota hai: match. /32 ke liye poora 100 77 ke barabar hona chahiye: nahi. Matching routes: /0, /8, /16, /24, /26. Sabse lamba /26 hai, isliye packet 10.255.0.13 ko jaata hai.</p>
<p>Ab 10.10.20.200: 200 <code>11001000</code> hai, jo <code>11</code> se shuru hota hai, <code>01</code> se nahi. /26 match nahi karta. Longest match /24 hai, next hop 10.255.0.9.</p></div>

<h3>Drills: answers dhako aur try karo</h3>
<table class="cmp">
<tr><th>Destination</th><th>Matching routes</th><th>Winner</th><th>Next hop</th></tr>
<tr><td>10.10.20.77</td><td>/0 /8 /16 /24 /26 /32</td><td>/32</td><td>10.255.0.17</td></tr>
<tr><td>10.10.20.100</td><td>/0 /8 /16 /24 /26</td><td>/26</td><td>10.255.0.13</td></tr>
<tr><td>10.10.20.63</td><td>/0 /8 /16 /24</td><td>/24</td><td>10.255.0.9</td></tr>
<tr><td>10.10.20.127</td><td>/0 /8 /16 /24 /26</td><td>/26</td><td>10.255.0.13</td></tr>
<tr><td>10.10.21.5</td><td>/0 /8 /16</td><td>/16</td><td>10.255.0.5</td></tr>
<tr><td>10.200.1.1</td><td>/0 /8</td><td>/8</td><td>10.255.0.1</td></tr>
<tr><td>192.0.2.50</td><td>/0</td><td>/0 (default)</td><td>203.0.113.1</td></tr>
</table>
<p>Fast method: IPv4 module se har prefix ka block size nikaalo. /26 ka chauthe octet mein block size 64 hai, isliye 10.10.20.64/26 .64 se .127 tak cover karta hai. .64 se .127 tak kuch bhi match karta hai; .63 aur .128 nahi.</p>

<h3>Router se hi karwao</h3>
<pre class="out">EDGE#show ip route 10.10.20.100
Routing entry for 10.10.20.64/26
  Known via "static", distance 1, metric 0
  Routing Descriptor Blocks:
  <span class="hl">* 10.255.0.13</span>
      Route metric is 0, traffic share count is 1</pre>
<p><code>show ip route</code> ke baad address likhne se longest-match lookup chalta hai aur jeetne wali entry print hoti hai. Agar kuch match na ho aur default bhi na ho, to <code>% Network not in table</code> ya <code>% Subnet not in table</code> dikhta hai. CEF equivalent, <code>show ip cef 10.10.20.100</code>, wahi winner plus exit interface dikhata hai.</p>

<div class="warn"><p><b>Common galti.</b> Alag prefix lengths wale routes mein sabse kam AD ya "sabse achha dikhne wala" next hop chunna. AD aur metric sirf <b>same prefix aur length</b> wale routes ke beech compare hote hain. Alag lengths kabhi competition nahi hoti: longest match use hota hai, bas.</p></div>

<div class="exam"><p><b>Exam trap.</b> Exhibits mein aksar aisa route hota hai jiska block destination se theek pehle khatam ho jaata hai, jaise destination 10.10.20.100 ke liye 10.10.20.64/27 (.64 se .95). Paas dikhta hai, lekin match nahi karta. Hamesha range calculate karo; numbers kitne milte-julte dikhte hain uspe guess mat karo.</p></div>

<div class="scn"><h4>Woh /32 jisne server hijack kar liya</h4><p>Ek hospital ka PACS server 10.10.20.77 achanak imaging floor se unreachable ho gaya, jabki same /24 ke padosi chal rahe the. Core par <code>show ip route 10.10.20.77</code> ne <code>Routing entry for 10.10.20.77/32</code> ek aise firewall ke via dikhaya jo ab exist hi nahi karta tha: kisi ne mahino pehle migration ke liye host route add kiya aur bhool gaya. Purana firewall hatne ke baad bhi /32 ek abhi bhi valid subnet ke through uske address ki taraf point karta raha, isliye installed raha aur longest match se jeet gaya. Stale host route hatane se fix hua.</p><p><b>Seekh:</b> bahut specific route hamesha jeetta hai; network ko blame karne se pehle purane host routes audit karo.</p></div>

<div class="iv"><p class="q">"Router ke paas OSPF se seekha 10.0.0.0/8 aur statically seekha 10.1.1.0/24 hai. 10.1.1.5 ka packet kahan jaata hai, aur kyun?"</p><p>Strong answer: /24 se, kyunki forwarding pehle longest prefix match use karta hai. AD sirf bilkul same prefix aur length wale routes mein decide karti hai; 10.0.0.0/8 aur 10.1.1.0/24 alag prefixes hain aur dono table mein rehte hain. 10.2.2.2 ka packet OSPF /8 use karega.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Route tab match karta hai jab destination ke pehle n bits uske prefix ke barabar hon, n prefix length hai.</li>
<li>Matches mein longest prefix jeetta hai; /32 sabse specific, /0 sabse kam.</li>
<li>Alag prefix lengths ke beech AD aur metric kabhi longest match ko override nahi karte.</li>
<li>Prefix ki range jaldi nikaalne aur edge addresses check karne ke liye block sizes use karo.</li>
<li><code>show ip route x.x.x.x</code> aur <code>show ip cef x.x.x.x</code> jeetne wali entry dikhate hain.</li>
</ul></div>
`}};export{e as default};