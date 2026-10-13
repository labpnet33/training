var e={id:`wildcard-drills`,h:{en:`Wildcard drills: ranges and odd patterns`,hi:`Wildcard drills: ranges aur odd patterns`},body:{en:`
<p>Learning wildcards is like learning to ride a bicycle: the theory fits on a postcard, the confidence only comes from practice. In this chapter you will convert ranges into wildcard entries, split awkward ranges, write the "strange" non-contiguous wildcards the exam likes, and test whether a given address matches. Work each drill yourself before reading the answer.</p>

<h3>Method 1: turning a range into one entry</h3>
<p>A range can be written as a <b>single</b> ACL entry only if two things are true:</p>
<ol>
<li>The number of addresses (or of values in the changing octet) is a <b>power of two</b>: 1, 2, 4, 8, 16, 32, 64, 128, 256.</li>
<li>The range <b>starts on a multiple</b> of that number (it is aligned, like a subnet boundary).</li>
</ol>
<p>If both hold, the wildcard in that octet is <b>count minus 1</b>, the octets to the right are 255, and the octets to the left are 0.</p>

<div class="eg"><p><b>Worked example.</b> Match 10.1.16.0 through 10.1.31.255. The third octet runs 16 to 31: that is 16 values, a power of two. 16 is a multiple of 16, so it is aligned. Wildcard in the third octet: 16 minus 1 = 15; the fourth octet is fully free (255). Entry: <code>10.1.16.0 0.0.15.255</code>, which is the same block as 10.1.16.0/20.</p><p>Now try 10.1.16.0 through 10.1.47.255. That is 32 values (16 to 47), a power of two, but 16 is <b>not</b> a multiple of 32, so it is not aligned. Split it into aligned blocks: 16 to 31 (<code>10.1.16.0 0.0.15.255</code>) and 32 to 47 (<code>10.1.32.0 0.0.15.255</code>). Two entries.</p></div>

<h3>Method 2: splitting an awkward range</h3>
<p>When a range is not a clean block, cover it with the <b>largest aligned blocks</b> that fit, from the start upward. Match hosts 192.168.1.10 to 192.168.1.20:</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Splitting a range into aligned blocks">
<text x="320" y="24" text-anchor="middle" class="svg-accent" font-size="13">Hosts .10 to .20 = 11 addresses, not one block</text>
<rect x="30" y="50" width="90" height="44" rx="6" fill="#bae6fd"/><text x="75" y="70" text-anchor="middle" class="svg-ink" font-size="13">.10 - .11</text><text x="75" y="87" text-anchor="middle" class="svg-muted" font-size="12">0.0.0.1</text>
<rect x="130" y="50" width="170" height="44" rx="6" fill="#bbf7d0"/><text x="215" y="70" text-anchor="middle" class="svg-ink" font-size="13">.12 - .15</text><text x="215" y="87" text-anchor="middle" class="svg-muted" font-size="12">0.0.0.3</text>
<rect x="310" y="50" width="170" height="44" rx="6" fill="#ddd6fe"/><text x="395" y="70" text-anchor="middle" class="svg-ink" font-size="13">.16 - .19</text><text x="395" y="87" text-anchor="middle" class="svg-muted" font-size="12">0.0.0.3</text>
<rect x="490" y="50" width="90" height="44" rx="6" fill="#fde68a"/><text x="535" y="70" text-anchor="middle" class="svg-ink" font-size="13">.20</text><text x="535" y="87" text-anchor="middle" class="svg-muted" font-size="12">host</text>
<text x="320" y="130" text-anchor="middle" class="svg-ink" font-size="13">4 entries: 2 + 4 + 4 + 1 = 11 addresses, nothing extra matched</text>
</svg><p class="cap">Each block starts on a multiple of its own size. That is what makes it expressible with one wildcard.</p></div>

<pre class="code">access-list 40 permit 192.168.1.10 0.0.0.1
access-list 40 permit 192.168.1.12 0.0.0.3
access-list 40 permit 192.168.1.16 0.0.0.3
access-list 40 permit host 192.168.1.20</pre>
<p>In real life you might accept slightly over-matching (say .8 to .23 as <code>192.168.1.8 0.0.0.7</code> plus <code>192.168.1.16 0.0.0.7</code>) if the extra addresses are unused, but for a permit on a sensitive server, match exactly.</p>

<h3>Method 3: non-contiguous ("odd") wildcards</h3>
<p>Wildcards do not have to be a block of 0s followed by 1s. Each bit is independent, so you can check a bit in the middle and ignore the ones around it. Real networks rarely need this, but it appears in exams and in large, well-numbered enterprises.</p>
<table class="cmp">
<tr><th>Goal</th><th>Entry</th><th>Why it works</th></tr>
<tr><td>Every odd host in 192.168.1.0/24</td><td><code>192.168.1.1 0.0.0.254</code></td><td>Only the lowest bit is checked, and it must be 1</td></tr>
<tr><td>Every even host in 192.168.1.0/24</td><td><code>192.168.1.0 0.0.0.254</code></td><td>Lowest bit must be 0</td></tr>
<tr><td>Even-numbered /24s inside 10.1.0.0/16</td><td><code>10.1.0.0 0.0.254.255</code></td><td>Lowest bit of the third octet must be 0</td></tr>
<tr><td>The .1 gateway of every /24 in 10.0.0.0/8</td><td><code>10.0.0.1 0.255.255.0</code></td><td>First and last octets checked, middle two free</td></tr>
<tr><td>Subnet 10.X.10.0/24 at every site X</td><td><code>10.0.10.0 0.255.0.255</code></td><td>Third octet must be 10, site octet free</td></tr>
</table>

<h3>Drill set: try first, then check</h3>
<ol>
<li>172.16.0.0 to 172.31.255.255. <b>Answer:</b> 16 values in octet two, aligned: <code>172.16.0.0 0.15.255.255</code>.</li>
<li>192.168.100.128/25. <b>Answer:</b> 255 minus 128 = 127: <code>192.168.100.128 0.0.0.127</code>.</li>
<li>10.10.4.0 to 10.10.7.255. <b>Answer:</b> 4 values from 4, aligned: <code>10.10.4.0 0.0.3.255</code>.</li>
<li>Point-to-point /30 10.0.0.0 with mask .252. <b>Answer:</b> <code>10.0.0.0 0.0.0.3</code>.</li>
<li>Does 10.1.35.9 match <code>10.1.32.0 0.0.7.255</code>? <b>Answer:</b> the range is 10.1.32.0 to 10.1.39.255, so yes.</li>
<li>Does 10.1.40.1 match the same entry? <b>Answer:</b> 40 is outside 32 to 39, so no.</li>
<li>You type <code>permit 10.1.33.0 0.0.3.255</code>. What does IOS store? <b>Answer:</b> <code>10.1.32.0, wildcard bits 0.0.3.255</code>, because 33 has a 1 in an ignored bit. It now matches 32 to 35, not 33 to 36.</li>
<li>Hosts 10.5.5.64 to 10.5.5.127. <b>Answer:</b> 64 values from 64, aligned: <code>10.5.5.64 0.0.0.63</code>.</li>
<li>Hosts 10.5.5.60 to 10.5.5.67. <b>Answer:</b> 8 values but 60 is not a multiple of 8. Split: <code>10.5.5.60 0.0.0.3</code> (60 to 63) and <code>10.5.5.64 0.0.0.3</code> (64 to 67).</li>
<li>What does <code>0.0.0.0 255.255.255.255</code> equal? <b>Answer:</b> <code>any</code>.</li>
</ol>

<div class="warn"><p><b>Common mistake.</b> Assuming any "count minus 1" works without checking alignment. Hosts .60 to .67 with <code>10.5.5.60 0.0.0.7</code> is stored as 10.5.5.56 and matches .56 to .63, silently missing .64 to .67 and including four hosts you never meant.</p></div>

<div class="exam"><p><b>Exam trap.</b> Expect a multiple-choice item listing four wildcard entries and asking which one matches exactly a given range. Check both conditions: power of two and alignment. Another favourite: an entry like <code>10.1.1.1 0.0.0.254</code> and the question "which host is matched: .4, .6, .7 or .8?" Only the odd one, .7.</p></div>

<div class="scn"><h4>The build servers that half-worked</h4><p>A DevOps team asked for their build servers 10.30.8.60 to 10.30.8.67 to be allowed to an artifact store. The engineer wrote <code>permit 10.30.8.60 0.0.0.7</code>. Four servers worked and four got "administratively prohibited". <code>show access-lists</code> displayed the entry as 10.30.8.56 with wildcard 0.0.0.7. The range was not aligned. Replacing the line with two /30 entries (.60 and .64, wildcard 0.0.0.3) fixed all eight.</p><p><b>Lesson:</b> a block must start on a multiple of its size. When the stored address differs from what you typed, alignment was wrong.</p></div>

<div class="iv"><p class="q">"How would you match only the odd-numbered addresses in 192.168.1.0/24 with one ACL line?"</p><p>Strong answer: <code>192.168.1.1 0.0.0.254</code>. The wildcard checks only the lowest bit of the last octet, and the address sets it to 1, so every odd address matches. Explain that wildcard bits are independent, which is why non-contiguous masks are allowed, unlike subnet masks.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>One entry covers a range only if its size is a power of two and it starts on a multiple of that size.</li>
<li>Wildcard in the changing octet = count minus 1; octets to the right are 255, to the left 0.</li>
<li>Split awkward ranges into the largest aligned blocks that fit.</li>
<li>Wildcard bits are independent, so non-contiguous masks like 0.0.0.254 or 0.255.0.255 are legal.</li>
<li>If IOS stores a different address than you typed, your wildcard or alignment was wrong.</li>
</ul></div>
`,hi:`
<p>Wildcards seekhna cycle chalana seekhne jaisa hai: theory ek postcard par aa jaati hai, confidence sirf practice se aata hai. Is chapter mein aap ranges ko wildcard entries mein badloge, mushkil ranges ko split karoge, exam ko pasand aane wale "ajeeb" non-contiguous wildcards likhoge, aur test karoge ki diya gaya address match karta hai ya nahi. Answer padhne se pehle har drill khud karo.</p>

<h3>Method 1: range ko ek entry mein badalna</h3>
<p>Range ko <b>ek</b> ACL entry mein tabhi likha ja sakta hai jab do baatein sach hon:</p>
<ol>
<li>Addresses ki ginti (ya badalte octet ki values) <b>power of two</b> ho: 1, 2, 4, 8, 16, 32, 64, 128, 256.</li>
<li>Range us number ke <b>multiple par shuru</b> ho (aligned ho, subnet boundary ki tarah).</li>
</ol>
<p>Agar dono sach hain, to us octet mein wildcard <b>count minus 1</b> hai, right ke octets 255 hain, aur left ke octets 0.</p>

<div class="eg"><p><b>Worked example.</b> 10.1.16.0 se 10.1.31.255 match karo. Teesra octet 16 se 31 tak chalta hai: yeh 16 values hain, power of two. 16, 16 ka multiple hai, isliye aligned hai. Teesre octet mein wildcard: 16 minus 1 = 15; chautha octet poora free (255). Entry: <code>10.1.16.0 0.0.15.255</code>, jo 10.1.16.0/20 wala hi block hai.</p><p>Ab 10.1.16.0 se 10.1.47.255 try karo. Yeh 32 values hain (16 se 47), power of two, par 16, 32 ka multiple <b>nahi</b> hai, isliye aligned nahi. Ise aligned blocks mein todo: 16 se 31 (<code>10.1.16.0 0.0.15.255</code>) aur 32 se 47 (<code>10.1.32.0 0.0.15.255</code>). Do entries.</p></div>

<h3>Method 2: mushkil range ko split karna</h3>
<p>Jab range saaf block na ho, use shuru se upar ki taraf fit hone wale <b>sabse bade aligned blocks</b> se cover karo. Hosts 192.168.1.10 se 192.168.1.20 match karo:</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Range ko aligned blocks mein todna">
<text x="320" y="24" text-anchor="middle" class="svg-accent" font-size="13">Hosts .10 se .20 = 11 addresses, ek block nahi</text>
<rect x="30" y="50" width="90" height="44" rx="6" fill="#bae6fd"/><text x="75" y="70" text-anchor="middle" class="svg-ink" font-size="13">.10 - .11</text><text x="75" y="87" text-anchor="middle" class="svg-muted" font-size="12">0.0.0.1</text>
<rect x="130" y="50" width="170" height="44" rx="6" fill="#bbf7d0"/><text x="215" y="70" text-anchor="middle" class="svg-ink" font-size="13">.12 - .15</text><text x="215" y="87" text-anchor="middle" class="svg-muted" font-size="12">0.0.0.3</text>
<rect x="310" y="50" width="170" height="44" rx="6" fill="#ddd6fe"/><text x="395" y="70" text-anchor="middle" class="svg-ink" font-size="13">.16 - .19</text><text x="395" y="87" text-anchor="middle" class="svg-muted" font-size="12">0.0.0.3</text>
<rect x="490" y="50" width="90" height="44" rx="6" fill="#fde68a"/><text x="535" y="70" text-anchor="middle" class="svg-ink" font-size="13">.20</text><text x="535" y="87" text-anchor="middle" class="svg-muted" font-size="12">host</text>
<text x="320" y="130" text-anchor="middle" class="svg-ink" font-size="13">4 entries: 2 + 4 + 4 + 1 = 11 addresses, kuch extra match nahi</text>
</svg><p class="cap">Har block apne size ke multiple par shuru hota hai. Isi wajah se use ek wildcard se likha ja sakta hai.</p></div>

<pre class="code">access-list 40 permit 192.168.1.10 0.0.0.1
access-list 40 permit 192.168.1.12 0.0.0.3
access-list 40 permit 192.168.1.16 0.0.0.3
access-list 40 permit host 192.168.1.20</pre>
<p>Real life mein agar extra addresses unused hain to aap thoda zyada match karna accept kar sakte ho (jaise .8 se .23 ko <code>192.168.1.8 0.0.0.7</code> plus <code>192.168.1.16 0.0.0.7</code>), par sensitive server par permit ke liye bilkul exact match karo.</p>

<h3>Method 3: non-contiguous ("odd") wildcards</h3>
<p>Wildcards ka 0s ke block ke baad 1s ka block hona zaroori nahi. Har bit independent hai, isliye aap beech ka ek bit check karke uske aas paas wale ignore kar sakte ho. Real networks ko iski kam hi zaroorat padti hai, par yeh exams mein aur bade, achhe se numbered enterprises mein dikhta hai.</p>
<table class="cmp">
<tr><th>Goal</th><th>Entry</th><th>Kyun kaam karta hai</th></tr>
<tr><td>192.168.1.0/24 ka har odd host</td><td><code>192.168.1.1 0.0.0.254</code></td><td>Sirf sabse neeche wala bit check hota hai, aur woh 1 hona chahiye</td></tr>
<tr><td>192.168.1.0/24 ka har even host</td><td><code>192.168.1.0 0.0.0.254</code></td><td>Sabse neeche wala bit 0 hona chahiye</td></tr>
<tr><td>10.1.0.0/16 ke andar even-numbered /24s</td><td><code>10.1.0.0 0.0.254.255</code></td><td>Teesre octet ka sabse neeche wala bit 0 hona chahiye</td></tr>
<tr><td>10.0.0.0/8 ke har /24 ka .1 gateway</td><td><code>10.0.0.1 0.255.255.0</code></td><td>Pehla aur aakhri octet check, beech ke do free</td></tr>
<tr><td>Har site X par subnet 10.X.10.0/24</td><td><code>10.0.10.0 0.255.0.255</code></td><td>Teesra octet 10 hona chahiye, site octet free</td></tr>
</table>

<h3>Drill set: pehle try karo, phir check karo</h3>
<ol>
<li>172.16.0.0 se 172.31.255.255. <b>Answer:</b> doosre octet mein 16 values, aligned: <code>172.16.0.0 0.15.255.255</code>.</li>
<li>192.168.100.128/25. <b>Answer:</b> 255 minus 128 = 127: <code>192.168.100.128 0.0.0.127</code>.</li>
<li>10.10.4.0 se 10.10.7.255. <b>Answer:</b> 4 se shuru 4 values, aligned: <code>10.10.4.0 0.0.3.255</code>.</li>
<li>Point-to-point /30 10.0.0.0 mask .252 ke saath. <b>Answer:</b> <code>10.0.0.0 0.0.0.3</code>.</li>
<li>Kya 10.1.35.9 <code>10.1.32.0 0.0.7.255</code> se match karta hai? <b>Answer:</b> range 10.1.32.0 se 10.1.39.255 hai, isliye haan.</li>
<li>Kya 10.1.40.1 usi entry se match karta hai? <b>Answer:</b> 40, 32 se 39 ke bahar hai, isliye nahi.</li>
<li>Aap <code>permit 10.1.33.0 0.0.3.255</code> type karte ho. IOS kya store karega? <b>Answer:</b> <code>10.1.32.0, wildcard bits 0.0.3.255</code>, kyunki 33 ke ek ignored bit mein 1 hai. Ab yeh 32 se 35 match karta hai, 33 se 36 nahi.</li>
<li>Hosts 10.5.5.64 se 10.5.5.127. <b>Answer:</b> 64 se shuru 64 values, aligned: <code>10.5.5.64 0.0.0.63</code>.</li>
<li>Hosts 10.5.5.60 se 10.5.5.67. <b>Answer:</b> 8 values par 60, 8 ka multiple nahi. Split: <code>10.5.5.60 0.0.0.3</code> (60 se 63) aur <code>10.5.5.64 0.0.0.3</code> (64 se 67).</li>
<li><code>0.0.0.0 255.255.255.255</code> kiske barabar hai? <b>Answer:</b> <code>any</code>.</li>
</ol>

<div class="warn"><p><b>Common galti.</b> Alignment check kiye bina maan lena ki koi bhi "count minus 1" chal jaayega. Hosts .60 se .67 ke liye <code>10.5.5.60 0.0.0.7</code> 10.5.5.56 ki tarah store hota hai aur .56 se .63 match karta hai, chupchaap .64 se .67 chhod deta hai aur chaar aise hosts shaamil kar leta hai jo aapne kabhi nahi chahe.</p></div>

<div class="exam"><p><b>Exam trap.</b> Ek multiple-choice item expect karo jo chaar wildcard entries dikhakar pooche ki kaunsi di gayi range ko exactly match karti hai. Dono conditions check karo: power of two aur alignment. Ek aur favourite: <code>10.1.1.1 0.0.0.254</code> jaisi entry aur sawaal "kaunsa host match hota hai: .4, .6, .7 ya .8?" Sirf odd wala, .7.</p></div>

<div class="scn"><h4>Build servers jo aadhe chale</h4><p>Ek DevOps team ne apne build servers 10.30.8.60 se 10.30.8.67 ko artifact store tak allow karne ko kaha. Engineer ne <code>permit 10.30.8.60 0.0.0.7</code> likha. Chaar servers chale aur chaar ko "administratively prohibited" mila. <code>show access-lists</code> ne entry ko 10.30.8.56 wildcard 0.0.0.7 ke saath dikhaya. Range aligned nahi thi. Line ko do /30 entries (.60 aur .64, wildcard 0.0.0.3) se badalne par aathon theek ho gaye.</p><p><b>Seekh:</b> block apne size ke multiple par shuru hona chahiye. Jab stored address aapke type kiye se alag ho, to alignment galat tha.</p></div>

<div class="iv"><p class="q">"192.168.1.0/24 mein sirf odd-numbered addresses ek ACL line se kaise match karoge?"</p><p>Strong answer: <code>192.168.1.1 0.0.0.254</code>. Wildcard sirf aakhri octet ka sabse neeche wala bit check karta hai, aur address use 1 set karta hai, isliye har odd address match hota hai. Samjhao ki wildcard bits independent hain, isliye subnet masks ke ulat non-contiguous masks allowed hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ek entry range ko tabhi cover karti hai jab uska size power of two ho aur woh us size ke multiple par shuru ho.</li>
<li>Badalte octet mein wildcard = count minus 1; right ke octets 255, left ke 0.</li>
<li>Mushkil ranges ko fit hone wale sabse bade aligned blocks mein todo.</li>
<li>Wildcard bits independent hain, isliye 0.0.0.254 ya 0.255.0.255 jaise non-contiguous masks legal hain.</li>
<li>Agar IOS aapke type kiye se alag address store kare, to aapka wildcard ya alignment galat tha.</li>
</ul></div>
`}};export{e as default};