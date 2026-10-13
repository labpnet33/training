var e={id:`equal-subnets`,h:{en:`Subnetting a network into N equal subnets`,hi:`Ek network ko N barabar subnets mein baantna`},body:{en:`
<p>You have one big cake and six guests. Cake cutting in binary has a rule: every cut halves the pieces, so you can only make 2, 4, 8 or 16 equal slices. For six guests you cut three times and get eight slices, and two slices wait in the fridge for later. Splitting a network into equal subnets works exactly like that. This chapter gives you a five-step recipe and then drills it on /24, /16 and cross-octet examples.</p>

<h3>The recipe</h3>
<ol>
<li><b>Borrow bits.</b> Find the smallest s with 2<sup>s</sup> ≥ the number of subnets needed.</li>
<li><b>New prefix</b> = original prefix + s. Convert it to a mask.</li>
<li><b>Block size</b> = 256 − the mask value in the interesting octet.</li>
<li><b>List the subnets</b>: start at the original network and keep adding the block size.</li>
<li>For any subnet: <b>broadcast</b> = next subnet − 1, <b>usable</b> = network + 1 to broadcast − 1. Hosts per subnet = 2<sup>h</sup> − 2.</li>
</ol>
<p>To jump straight to the <b>N-th subnet</b> (counting subnet zero as the first): network = start + (N − 1) × block size.</p>

<div class="eg"><p><b>Worked example 1: 192.168.10.0/24 into 6 subnets.</b> 2<sup>3</sup> = 8 ≥ 6, borrow 3 bits, new prefix /27 = 255.255.255.224, block 32, hosts 30 each.</p>
<table class="cmp"><tr><th>#</th><th>Network</th><th>Usable range</th><th>Broadcast</th></tr>
<tr><td>1</td><td>192.168.10.0/27</td><td>.1 to .30</td><td>.31</td></tr>
<tr><td>2</td><td>192.168.10.32/27</td><td>.33 to .62</td><td>.63</td></tr>
<tr><td>3</td><td>192.168.10.64/27</td><td>.65 to .94</td><td>.95</td></tr>
<tr><td>4</td><td>192.168.10.96/27</td><td>.97 to .126</td><td>.127</td></tr>
<tr><td>5</td><td>192.168.10.128/27</td><td>.129 to .158</td><td>.159</td></tr>
<tr><td>6</td><td>192.168.10.160/27</td><td>.161 to .190</td><td>.191</td></tr>
<tr><td>7</td><td>192.168.10.192/27</td><td>.193 to .222</td><td>.223</td></tr>
<tr><td>8</td><td>192.168.10.224/27</td><td>.225 to .254</td><td>.255</td></tr></table>
<p>Six subnets are used; two are spare for growth.</p></div>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="A /24 cut into eight /27s">
<text x="320" y="22" text-anchor="middle" class="svg-ink" font-size="14">192.168.10.0/24 → eight /27 slices</text>
<rect x="20" y="40" width="75" height="44" fill="#bae6fd"/><text x="57" y="67" text-anchor="middle" class="svg-ink" font-size="12">.0</text>
<rect x="95" y="40" width="75" height="44" fill="#bbf7d0"/><text x="132" y="67" text-anchor="middle" class="svg-ink" font-size="12">.32</text>
<rect x="170" y="40" width="75" height="44" fill="#bae6fd"/><text x="207" y="67" text-anchor="middle" class="svg-ink" font-size="12">.64</text>
<rect x="245" y="40" width="75" height="44" fill="#bbf7d0"/><text x="282" y="67" text-anchor="middle" class="svg-ink" font-size="12">.96</text>
<rect x="320" y="40" width="75" height="44" fill="#bae6fd"/><text x="357" y="67" text-anchor="middle" class="svg-ink" font-size="12">.128</text>
<rect x="395" y="40" width="75" height="44" fill="#bbf7d0"/><text x="432" y="67" text-anchor="middle" class="svg-ink" font-size="12">.160</text>
<rect x="470" y="40" width="75" height="44" fill="#e2e8f0"/><text x="507" y="67" text-anchor="middle" class="svg-ink" font-size="12">.192</text>
<rect x="545" y="40" width="75" height="44" fill="#e2e8f0"/><text x="582" y="67" text-anchor="middle" class="svg-ink" font-size="12">.224</text>
<text x="245" y="110" text-anchor="middle" class="svg-accent" font-size="12">six in use</text><text x="545" y="110" text-anchor="middle" class="svg-muted" font-size="12">two spare</text>
<text x="320" y="138" text-anchor="middle" class="svg-muted" font-size="12">each slice = block of 32 = 30 hosts</text>
</svg><p class="cap">Equal subnetting always produces a power of two of equal slices.</p></div>

<div class="eg"><p><b>Worked example 2: 172.16.0.0/16 into 50 subnets.</b> 2<sup>6</sup> = 64 ≥ 50, borrow 6, new prefix /22 = 255.255.252.0, block 4 in the <b>third</b> octet, hosts 2<sup>10</sup> − 2 = 1,022. Subnets: 172.16.0.0, 172.16.4.0, 172.16.8.0, 172.16.12.0 ... up to 172.16.252.0. The <b>10th</b> subnet is 172.16.(9 × 4 = 36).0/22: usable 172.16.36.1 to 172.16.39.254, broadcast 172.16.39.255.</p></div>

<div class="eg"><p><b>Worked example 3: crossing an octet.</b> 172.20.0.0/16 into 300 subnets. 2<sup>9</sup> = 512 ≥ 300, borrow 9, new prefix /25, block 128 in the <b>fourth</b> octet, 126 hosts. Because two /25s fit in each value of the third octet, the list runs: 172.20.0.0, 172.20.0.128, 172.20.1.0, 172.20.1.128, 172.20.2.0 ... The 5th subnet is 172.20.2.0/25 (4 × 128 = 512 addresses from the start = two full third-octet steps). Its broadcast is 172.20.2.127.</p></div>

<h3>Putting subnets on a router</h3>
<p>Three LANs from example 1 on one router. Each interface takes the first usable address of its subnet:</p>
<pre class="code">interface GigabitEthernet0/1
 ip address 192.168.10.1 255.255.255.224
 no shutdown
interface GigabitEthernet0/2
 ip address 192.168.10.33 255.255.255.224
 no shutdown
interface GigabitEthernet0/3
 ip address 192.168.10.65 255.255.255.224
 no shutdown</pre>
<pre class="out">R1# show ip route connected | include C
C        192.168.10.0/27 is directly connected, GigabitEthernet0/1
C        192.168.10.32/27 is directly connected, GigabitEthernet0/2
<span class="hl">C        192.168.10.64/27 is directly connected, GigabitEthernet0/3</span></pre>

<h3>Practice drills (answers below)</h3>
<p><b>a)</b> 192.168.5.0/24 into 12 subnets: prefix, hosts each, 4th subnet and its broadcast. <b>b)</b> 10.10.0.0/16 into 16 subnets: prefix, hosts, 3rd subnet and broadcast, last subnet. <b>c)</b> 192.168.100.0/24 into 3 subnets: prefix, hosts, last subnet.</p>
<div class="tip"><p><b>Answers.</b> a) 2<sup>4</sup> = 16 → /28, 14 hosts, 4th = 3 × 16 = 192.168.5.48/28, broadcast .63. b) 2<sup>4</sup> = 16 → /20, block 16 in the third octet, 4,094 hosts; 3rd = 10.10.32.0/20, broadcast 10.10.47.255; last = 10.10.240.0/20. c) 2<sup>2</sup> = 4 → /26, 62 hosts; last subnet 192.168.100.192/26 (one spare).</p></div>

<div class="warn"><p><b>Common mistakes.</b> Borrowing too few bits: 6 subnets need 3 bits, because 2 bits give only 4. Off-by-one when asked for the "third subnet": the first subnet is the one that starts at the original network address (subnet zero). And forgetting that equal subnetting gives every segment the size of the biggest one, which wastes addresses; chapter 9 fixes that with VLSM.</p></div>

<div class="exam"><p><b>Exam trap.</b> Questions like "What is the last usable address of the third subnet of 172.16.0.0/16 using /22?" are solved in one line: third subnet = 2 × 4 = 172.16.8.0, next is 172.16.12.0, so broadcast 172.16.11.255 and last usable <b>172.16.11.254</b>.</p></div>

<div class="scn"><h4>Building 2 stole Building 1's users</h4><p>A campus split 10.10.0.0/16 into sixteen /20s, one per building. The engineer for Building 2 assumed "one /24 per building" and configured 10.10.1.0/24 on his core switch. That /24 sits inside Building 1's 10.10.0.0/20. Because routers prefer the <b>longest matching prefix</b>, traffic for any Building 1 host in 10.10.1.x was routed to Building 2 and disappeared. The team listed the /20s with the block size (0, 16, 32 ...), saw that Building 2 owned 10.10.16.0/20, and re-addressed.</p><p><b>Lesson:</b> write the full subnet list before assigning anything, and never pick a subnet that is not on the list.</p></div>

<div class="iv"><p class="q">"Split 192.168.10.0/24 into six subnets. What mask, how many hosts, and what are the first three subnets?"</p><p>Strong answer: six needs 3 borrowed bits (2<sup>3</sup> = 8), so /27, 255.255.255.224, block 32, 30 hosts each. Subnets 192.168.10.0, .32 and .64, and so on up to .224, with two spare. Mention that if the six segments need very different sizes you would use VLSM instead of equal subnets.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Borrow the smallest s with 2<sup>s</sup> ≥ subnets needed; new prefix = old + s.</li>
<li>List subnets by adding the block size, starting at the original network (subnet zero).</li>
<li>N-th subnet = start + (N − 1) × block; broadcast = next subnet − 1.</li>
<li>When the block size is 128 or more in the fourth octet, subnets roll over into the third octet.</li>
<li>Assign only subnets from the written list; anything else risks overlap.</li>
</ul></div>
`,hi:`
<p>Aapke paas ek bada cake hai aur chhe mehmaan. Binary mein cake kaatne ka ek rule hai: har cut pieces ko aadha karta hai, isliye aap sirf 2, 4, 8 ya 16 barabar slices bana sakte ho. Chhe mehmaanon ke liye aap teen baar kaat te ho aur aath slices milte hain, aur do slices baad ke liye fridge mein intezaar karte hain. Network ko barabar subnets mein baantna bilkul aise hi kaam karta hai. Yeh chapter aapko paanch-step recipe deta hai aur phir use /24, /16 aur cross-octet examples par drill karta hai.</p>

<h3>Recipe</h3>
<ol>
<li><b>Bits borrow karo.</b> Sabse chhota s dhoondo jahan 2<sup>s</sup> ≥ zaroori subnets.</li>
<li><b>Naya prefix</b> = original prefix + s. Ise mask mein convert karo.</li>
<li><b>Block size</b> = 256 − interesting octet mein mask ki value.</li>
<li><b>Subnets list karo</b>: original network se shuru karo aur block size jodte jao.</li>
<li>Kisi bhi subnet ke liye: <b>broadcast</b> = agla subnet − 1, <b>usable</b> = network + 1 se broadcast − 1. Har subnet mein hosts = 2<sup>h</sup> − 2.</li>
</ol>
<p>Seedha <b>N-th subnet</b> par jump karne ke liye (subnet zero ko pehla gin kar): network = start + (N − 1) × block size.</p>

<div class="eg"><p><b>Worked example 1: 192.168.10.0/24 ko 6 subnets mein.</b> 2<sup>3</sup> = 8 ≥ 6, 3 bits borrow karo, naya prefix /27 = 255.255.255.224, block 32, har ek mein 30 hosts.</p>
<table class="cmp"><tr><th>#</th><th>Network</th><th>Usable range</th><th>Broadcast</th></tr>
<tr><td>1</td><td>192.168.10.0/27</td><td>.1 se .30</td><td>.31</td></tr>
<tr><td>2</td><td>192.168.10.32/27</td><td>.33 se .62</td><td>.63</td></tr>
<tr><td>3</td><td>192.168.10.64/27</td><td>.65 se .94</td><td>.95</td></tr>
<tr><td>4</td><td>192.168.10.96/27</td><td>.97 se .126</td><td>.127</td></tr>
<tr><td>5</td><td>192.168.10.128/27</td><td>.129 se .158</td><td>.159</td></tr>
<tr><td>6</td><td>192.168.10.160/27</td><td>.161 se .190</td><td>.191</td></tr>
<tr><td>7</td><td>192.168.10.192/27</td><td>.193 se .222</td><td>.223</td></tr>
<tr><td>8</td><td>192.168.10.224/27</td><td>.225 se .254</td><td>.255</td></tr></table>
<p>Chhe subnets use hote hain; do growth ke liye spare hain.</p></div>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Ek /24 ko aath /27s mein kaata">
<text x="320" y="22" text-anchor="middle" class="svg-ink" font-size="14">192.168.10.0/24 → aath /27 slices</text>
<rect x="20" y="40" width="75" height="44" fill="#bae6fd"/><text x="57" y="67" text-anchor="middle" class="svg-ink" font-size="12">.0</text>
<rect x="95" y="40" width="75" height="44" fill="#bbf7d0"/><text x="132" y="67" text-anchor="middle" class="svg-ink" font-size="12">.32</text>
<rect x="170" y="40" width="75" height="44" fill="#bae6fd"/><text x="207" y="67" text-anchor="middle" class="svg-ink" font-size="12">.64</text>
<rect x="245" y="40" width="75" height="44" fill="#bbf7d0"/><text x="282" y="67" text-anchor="middle" class="svg-ink" font-size="12">.96</text>
<rect x="320" y="40" width="75" height="44" fill="#bae6fd"/><text x="357" y="67" text-anchor="middle" class="svg-ink" font-size="12">.128</text>
<rect x="395" y="40" width="75" height="44" fill="#bbf7d0"/><text x="432" y="67" text-anchor="middle" class="svg-ink" font-size="12">.160</text>
<rect x="470" y="40" width="75" height="44" fill="#e2e8f0"/><text x="507" y="67" text-anchor="middle" class="svg-ink" font-size="12">.192</text>
<rect x="545" y="40" width="75" height="44" fill="#e2e8f0"/><text x="582" y="67" text-anchor="middle" class="svg-ink" font-size="12">.224</text>
<text x="245" y="110" text-anchor="middle" class="svg-accent" font-size="12">chhe use mein</text><text x="545" y="110" text-anchor="middle" class="svg-muted" font-size="12">do spare</text>
<text x="320" y="138" text-anchor="middle" class="svg-muted" font-size="12">har slice = 32 ka block = 30 hosts</text>
</svg><p class="cap">Barabar subnetting hamesha barabar slices ki power of two sankhya banati hai.</p></div>

<div class="eg"><p><b>Worked example 2: 172.16.0.0/16 ko 50 subnets mein.</b> 2<sup>6</sup> = 64 ≥ 50, 6 borrow karo, naya prefix /22 = 255.255.252.0, <b>third</b> octet mein block 4, hosts 2<sup>10</sup> − 2 = 1,022. Subnets: 172.16.0.0, 172.16.4.0, 172.16.8.0, 172.16.12.0 ... 172.16.252.0 tak. <b>10th</b> subnet 172.16.(9 × 4 = 36).0/22 hai: usable 172.16.36.1 se 172.16.39.254, broadcast 172.16.39.255.</p></div>

<div class="eg"><p><b>Worked example 3: octet cross karna.</b> 172.20.0.0/16 ko 300 subnets mein. 2<sup>9</sup> = 512 ≥ 300, 9 borrow karo, naya prefix /25, <b>fourth</b> octet mein block 128, 126 hosts. Kyunki third octet ki har value mein do /25 fit hote hain, list aise chalti hai: 172.20.0.0, 172.20.0.128, 172.20.1.0, 172.20.1.128, 172.20.2.0 ... 5th subnet 172.20.2.0/25 hai (shuruaat se 4 × 128 = 512 addresses = third octet ke do poore steps). Iska broadcast 172.20.2.127 hai.</p></div>

<h3>Subnets ko router par lagana</h3>
<p>Example 1 ke teen LANs ek router par. Har interface apne subnet ka pehla usable address leta hai:</p>
<pre class="code">interface GigabitEthernet0/1
 ip address 192.168.10.1 255.255.255.224
 no shutdown
interface GigabitEthernet0/2
 ip address 192.168.10.33 255.255.255.224
 no shutdown
interface GigabitEthernet0/3
 ip address 192.168.10.65 255.255.255.224
 no shutdown</pre>
<pre class="out">R1# show ip route connected | include C
C        192.168.10.0/27 is directly connected, GigabitEthernet0/1
C        192.168.10.32/27 is directly connected, GigabitEthernet0/2
<span class="hl">C        192.168.10.64/27 is directly connected, GigabitEthernet0/3</span></pre>

<h3>Practice drills (answers neeche)</h3>
<p><b>a)</b> 192.168.5.0/24 ko 12 subnets mein: prefix, har ek mein hosts, 4th subnet aur uska broadcast. <b>b)</b> 10.10.0.0/16 ko 16 subnets mein: prefix, hosts, 3rd subnet aur broadcast, aakhri subnet. <b>c)</b> 192.168.100.0/24 ko 3 subnets mein: prefix, hosts, aakhri subnet.</p>
<div class="tip"><p><b>Answers.</b> a) 2<sup>4</sup> = 16 → /28, 14 hosts, 4th = 3 × 16 = 192.168.5.48/28, broadcast .63. b) 2<sup>4</sup> = 16 → /20, third octet mein block 16, 4,094 hosts; 3rd = 10.10.32.0/20, broadcast 10.10.47.255; aakhri = 10.10.240.0/20. c) 2<sup>2</sup> = 4 → /26, 62 hosts; aakhri subnet 192.168.100.192/26 (ek spare).</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Kam bits borrow karna: 6 subnets ko 3 bits chahiye, kyunki 2 bits sirf 4 dete hain. "Third subnet" poochne par off-by-one: pehla subnet woh hai jo original network address se shuru hota hai (subnet zero). Aur bhool jaana ki barabar subnetting har segment ko sabse bade segment jitna size deti hai, jisse addresses waste hote hain; chapter 9 ise VLSM se theek karta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> "172.16.0.0/16 ko /22 se baantne par third subnet ka last usable address kya hai?" jaise sawaal ek line mein solve hote hain: third subnet = 2 × 4 = 172.16.8.0, agla 172.16.12.0 hai, to broadcast 172.16.11.255 aur last usable <b>172.16.11.254</b>.</p></div>

<div class="scn"><h4>Building 2 ne Building 1 ke users chura liye</h4><p>Ek campus ne 10.10.0.0/16 ko solah /20s mein baanta, har building ke liye ek. Building 2 ke engineer ne maan liya "har building ko ek /24" aur apne core switch par 10.10.1.0/24 configure kar diya. Woh /24 Building 1 ke 10.10.0.0/20 ke andar hai. Kyunki routers <b>longest matching prefix</b> ko prefer karte hain, 10.10.1.x mein Building 1 ke kisi bhi host ka traffic Building 2 route hua aur gaayab ho gaya. Team ne block size (0, 16, 32 ...) se /20s list kiye, dekha ki Building 2 ka 10.10.16.0/20 hai, aur re-address kiya.</p><p><b>Seekh:</b> kuch bhi assign karne se pehle poori subnet list likho, aur kabhi aisa subnet mat chuno jo list mein nahi hai.</p></div>

<div class="iv"><p class="q">"192.168.10.0/24 ko chhe subnets mein baanto. Kaunsa mask, kitne hosts, aur pehle teen subnets kaunse hain?"</p><p>Strong answer: chhe ke liye 3 borrowed bits chahiye (2<sup>3</sup> = 8), to /27, 255.255.255.224, block 32, har ek mein 30 hosts. Subnets 192.168.10.0, .32 aur .64, aur aise hi .224 tak, do spare ke saath. Batao ki agar chhe segments ko bahut alag sizes chahiye to aap barabar subnets ki jagah VLSM use karoge.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Sabse chhota s borrow karo jahan 2<sup>s</sup> ≥ zaroori subnets; naya prefix = purana + s.</li>
<li>Original network (subnet zero) se shuru karke block size jodte hue subnets list karo.</li>
<li>N-th subnet = start + (N − 1) × block; broadcast = agla subnet − 1.</li>
<li>Jab fourth octet mein block size 128 ya zyada ho, subnets third octet mein roll over hote hain.</li>
<li>Sirf likhi hui list ke subnets assign karo; kuch aur overlap ka risk hai.</li>
</ul></div>
`}};export{e as default};