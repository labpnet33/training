var e={id:`binary`,h:{en:`Binary and dotted decimal: the only maths you need`,hi:`Binary aur dotted decimal: bas itna hi maths chahiye`},body:{en:`
<p>Imagine a row of eight light switches on a wall. Each switch has a value painted above it: 128, 64, 32, 16, 8, 4, 2, 1. To show a number, you switch on the lights whose values add up to it. To show 200 you switch on 128, 64 and 8. That row of switches is one <b>octet</b>, and "on" is 1, "off" is 0. This chapter is a short recap of binary, but it is the recap that makes every later chapter easy, so do the drills.</p>

<h3>Place values in one octet</h3>
<p>Binary is base 2. Each position is worth double the position to its right. In one octet the eight positions, from left to right, are worth <b>128 64 32 16 8 4 2 1</b>. The leftmost bit is the <b>most significant bit</b>, the rightmost the <b>least significant</b>. All eight on gives 128+64+32+16+8+4+2+1 = <b>255</b>, all off gives <b>0</b>. So an octet has 256 possible values, 0 to 255, and that is why no octet of an IPv4 address can ever be 256 or more.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Octet place values">
<text x="320" y="22" text-anchor="middle" class="svg-ink" font-size="14">200 = 128 + 64 + 8</text>
<rect x="40" y="40" width="64" height="36" rx="6" fill="#bae6fd"/><text x="72" y="63" text-anchor="middle" class="svg-ink" font-size="13">128</text>
<rect x="110" y="40" width="64" height="36" rx="6" fill="#bae6fd"/><text x="142" y="63" text-anchor="middle" class="svg-ink" font-size="13">64</text>
<rect x="180" y="40" width="64" height="36" rx="6" fill="#e2e8f0"/><text x="212" y="63" text-anchor="middle" class="svg-ink" font-size="13">32</text>
<rect x="250" y="40" width="64" height="36" rx="6" fill="#e2e8f0"/><text x="282" y="63" text-anchor="middle" class="svg-ink" font-size="13">16</text>
<rect x="320" y="40" width="64" height="36" rx="6" fill="#bae6fd"/><text x="352" y="63" text-anchor="middle" class="svg-ink" font-size="13">8</text>
<rect x="390" y="40" width="64" height="36" rx="6" fill="#e2e8f0"/><text x="422" y="63" text-anchor="middle" class="svg-ink" font-size="13">4</text>
<rect x="460" y="40" width="64" height="36" rx="6" fill="#e2e8f0"/><text x="492" y="63" text-anchor="middle" class="svg-ink" font-size="13">2</text>
<rect x="530" y="40" width="64" height="36" rx="6" fill="#e2e8f0"/><text x="562" y="63" text-anchor="middle" class="svg-ink" font-size="13">1</text>
<text x="72" y="104" text-anchor="middle" class="svg-accent" font-size="14">1</text><text x="142" y="104" text-anchor="middle" class="svg-accent" font-size="14">1</text><text x="212" y="104" text-anchor="middle" class="svg-muted" font-size="14">0</text><text x="282" y="104" text-anchor="middle" class="svg-muted" font-size="14">0</text><text x="352" y="104" text-anchor="middle" class="svg-accent" font-size="14">1</text><text x="422" y="104" text-anchor="middle" class="svg-muted" font-size="14">0</text><text x="492" y="104" text-anchor="middle" class="svg-muted" font-size="14">0</text><text x="562" y="104" text-anchor="middle" class="svg-muted" font-size="14">0</text>
<text x="320" y="140" text-anchor="middle" class="svg-ink" font-size="13">binary 11001000</text>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">blue = switched on (1), grey = off (0)</text>
</svg><p class="cap">One octet is eight switches. The values of the switches that are on add up to the decimal number.</p></div>

<h3>Decimal to binary: the subtraction method</h3>
<p>Walk the place values from left to right. If the value fits into what is left, write 1 and subtract it; if not, write 0 and move on. Always write all eight bits.</p>
<div class="eg"><p><b>Worked example: 172.</b> 128 fits (172 − 128 = 44) → 1. 64 does not fit into 44 → 0. 32 fits (44 − 32 = 12) → 1. 16 does not fit → 0. 8 fits (12 − 8 = 4) → 1. 4 fits (4 − 4 = 0) → 1. 2 → 0. 1 → 0. Result <code>10101100</code>.</p>
<p><b>Worked example: 50.</b> 128 no, 64 no → 0 0. 32 fits (18 left) → 1. 16 fits (2 left) → 1. 8 no, 4 no → 0 0. 2 fits (0 left) → 1. 1 → 0. Result <code>00110010</code>. Note the two leading zeros: they matter.</p></div>

<h3>Binary to decimal: add the place values</h3>
<p>Write the place values above the bits and add the ones that sit over a 1. <code>10101000</code> = 128 + 32 + 8 = <b>168</b>. <code>01001101</code> = 64 + 8 + 4 + 1 = <b>77</b>. That is all there is.</p>

<h3>A whole address in binary</h3>
<p>Convert each octet on its own and keep the dots. 172.16.45.77 becomes:</p>
<pre class="out">172      .16       .45       .77
10101100 .00010000 .00101101 .01001101</pre>
<p>You will almost never convert all four octets in real life. Only the octet where the mask boundary falls, the <b>interesting octet</b>, needs binary. The octets fully inside the network part are copied, and the octets fully inside the host part become 0 or 255. Chapter 5 uses exactly that shortcut.</p>

<h3>Two patterns worth memorising</h3>
<p><b>1. Bits switched on from the left.</b> These are the only values a mask octet can take, and you will use them constantly:</p>
<table class="cmp"><tr><th>Bits on from the left</th><th>Binary</th><th>Decimal</th></tr>
<tr><td>0</td><td>00000000</td><td>0</td></tr><tr><td>1</td><td>10000000</td><td>128</td></tr><tr><td>2</td><td>11000000</td><td>192</td></tr><tr><td>3</td><td>11100000</td><td>224</td></tr><tr><td>4</td><td>11110000</td><td>240</td></tr><tr><td>5</td><td>11111000</td><td>248</td></tr><tr><td>6</td><td>11111100</td><td>252</td></tr><tr><td>7</td><td>11111110</td><td>254</td></tr><tr><td>8</td><td>11111111</td><td>255</td></tr></table>
<p><b>2. Powers of two.</b> 2<sup>1</sup>=2, 2<sup>2</sup>=4, 2<sup>3</sup>=8, 2<sup>4</sup>=16, 2<sup>5</sup>=32, 2<sup>6</sup>=64, 2<sup>7</sup>=128, 2<sup>8</sup>=256, 2<sup>9</sup>=512, 2<sup>10</sup>=1024, 2<sup>11</sup>=2048, 2<sup>12</sup>=4096, 2<sup>16</sup>=65536. Host counts and subnet counts are always powers of two.</p>

<h3>Practice drills (answers below)</h3>
<p>Decimal to binary: <b>a)</b> 10 <b>b)</b> 99 <b>c)</b> 127 <b>d)</b> 130 <b>e)</b> 224. Binary to decimal: <b>f)</b> 11110000 <b>g)</b> 00011111 <b>h)</b> 10000001 <b>i)</b> 01100100.</p>
<div class="tip"><p><b>Answers.</b> a) 00001010 b) 01100011 (64+32+2+1) c) 01111111 d) 10000010 e) 11100000 f) 240 g) 31 h) 129 i) 100 (64+32+4).</p></div>

<p><b>A note on hexadecimal.</b> macOS and some Linux tools print masks in hex, for example <code>0xffffff80</code>. Each hex digit is 4 bits: f = 1111, 8 = 1000, c = 1100, e = 1110, 0 = 0000. So ff = 255 and 80 = 128, and <code>0xffffff80</code> is 255.255.255.128. You will see this again in chapter 11.</p>

<div class="warn"><p><b>Common mistake.</b> Dropping leading zeros. 4 is <code>00000100</code>, not <code>100</code>. When you line up two octets bit by bit (for summarisation or AND operations), a missing zero shifts every bit and gives a wrong answer.</p></div>

<div class="exam"><p><b>Exam trap.</b> An answer option like 192.168.1.256 or 10.300.1.1 is never a valid address: no octet can exceed 255. Also remember that 255 in a host octet is not automatically a broadcast; whether it is depends on the mask (10.1.0.255/23 is a normal host, because that subnet runs from 10.1.0.0 to 10.1.1.255).</p></div>

<div class="scn"><h4>The summary that swallowed a branch</h4><p>An engineer had to advertise one summary for 172.16.12.0/24 through 172.16.15.0/24. He wrote 12 as <code>1100</code> and 15 as <code>1111</code>, without leading zeros, lined the short strings up wrongly against the other octets on his notepad, and concluded that only the first four bits of the third octet matched. He configured 172.16.0.0/20. That summary also covered 172.16.0.0 to 172.16.11.255, which lived at another branch, and some of that traffic was pulled to the wrong site. Redoing the maths with full eight-bit octets (<code>00001100</code> to <code>00001111</code>) gave the correct 172.16.12.0/22.</p><p><b>Lesson:</b> always write all eight bits. Binary errors turn into routing errors.</p></div>

<div class="iv"><p class="q">"Convert 200 to binary and talk me through it."</p><p>Strong answer: say the place values aloud, 128 64 32 16 8 4 2 1, then subtract: 128 fits leaving 72, 64 fits leaving 8, 32 and 16 do not fit, 8 fits leaving 0, then zeros, giving 11001000. Interviewers ask this to see a method, not a memorised answer. Add that the same skill tells you 255.255.255.200 is not a valid mask, because 11001000 is not a contiguous run of ones.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>An octet has place values 128 64 32 16 8 4 2 1 and holds 0 to 255.</li>
<li>Decimal to binary: subtract place values from left to right; binary to decimal: add them.</li>
<li>Only the interesting octet (where the mask boundary falls) needs binary work.</li>
<li>Mask octets can only be 0, 128, 192, 224, 240, 248, 252, 254 or 255.</li>
<li>Always write eight bits per octet; leading zeros matter.</li>
</ul></div>
`,hi:`
<p>Deewar par aath light switches ki ek line socho. Har switch ke upar ek value likhi hai: 128, 64, 32, 16, 8, 4, 2, 1. Koi number dikhane ke liye aap woh lights on karte ho jinki values jodkar woh number banta hai. 200 dikhane ke liye aap 128, 64 aur 8 on karte ho. Switches ki woh line ek <b>octet</b> hai, aur "on" 1 hai, "off" 0. Yeh chapter binary ka chhota recap hai, par yahi recap aage ke har chapter ko aasaan banata hai, isliye drills zaroor karo.</p>

<h3>Ek octet mein place values</h3>
<p>Binary base 2 hai. Har position apne right wali position se double value ki hoti hai. Ek octet mein aath positions, left se right, ki value hai <b>128 64 32 16 8 4 2 1</b>. Sabse left wala bit <b>most significant bit</b> hai, sabse right wala <b>least significant</b>. Aathon on karne par 128+64+32+16+8+4+2+1 = <b>255</b> aata hai, sab off karne par <b>0</b>. To ek octet ki 256 possible values hain, 0 se 255, aur isiliye IPv4 address ka koi octet kabhi 256 ya usse zyada nahi ho sakta.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Octet place values">
<text x="320" y="22" text-anchor="middle" class="svg-ink" font-size="14">200 = 128 + 64 + 8</text>
<rect x="40" y="40" width="64" height="36" rx="6" fill="#bae6fd"/><text x="72" y="63" text-anchor="middle" class="svg-ink" font-size="13">128</text>
<rect x="110" y="40" width="64" height="36" rx="6" fill="#bae6fd"/><text x="142" y="63" text-anchor="middle" class="svg-ink" font-size="13">64</text>
<rect x="180" y="40" width="64" height="36" rx="6" fill="#e2e8f0"/><text x="212" y="63" text-anchor="middle" class="svg-ink" font-size="13">32</text>
<rect x="250" y="40" width="64" height="36" rx="6" fill="#e2e8f0"/><text x="282" y="63" text-anchor="middle" class="svg-ink" font-size="13">16</text>
<rect x="320" y="40" width="64" height="36" rx="6" fill="#bae6fd"/><text x="352" y="63" text-anchor="middle" class="svg-ink" font-size="13">8</text>
<rect x="390" y="40" width="64" height="36" rx="6" fill="#e2e8f0"/><text x="422" y="63" text-anchor="middle" class="svg-ink" font-size="13">4</text>
<rect x="460" y="40" width="64" height="36" rx="6" fill="#e2e8f0"/><text x="492" y="63" text-anchor="middle" class="svg-ink" font-size="13">2</text>
<rect x="530" y="40" width="64" height="36" rx="6" fill="#e2e8f0"/><text x="562" y="63" text-anchor="middle" class="svg-ink" font-size="13">1</text>
<text x="72" y="104" text-anchor="middle" class="svg-accent" font-size="14">1</text><text x="142" y="104" text-anchor="middle" class="svg-accent" font-size="14">1</text><text x="212" y="104" text-anchor="middle" class="svg-muted" font-size="14">0</text><text x="282" y="104" text-anchor="middle" class="svg-muted" font-size="14">0</text><text x="352" y="104" text-anchor="middle" class="svg-accent" font-size="14">1</text><text x="422" y="104" text-anchor="middle" class="svg-muted" font-size="14">0</text><text x="492" y="104" text-anchor="middle" class="svg-muted" font-size="14">0</text><text x="562" y="104" text-anchor="middle" class="svg-muted" font-size="14">0</text>
<text x="320" y="140" text-anchor="middle" class="svg-ink" font-size="13">binary 11001000</text>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">blue = on (1), grey = off (0)</text>
</svg><p class="cap">Ek octet aath switches hai. Jo switches on hain unki values jodkar decimal number banta hai.</p></div>

<h3>Decimal se binary: subtraction method</h3>
<p>Place values par left se right chalo. Agar value bache hue number mein fit hoti hai, 1 likho aur use ghata do; agar nahi, 0 likho aur aage badho. Hamesha poore aath bits likho.</p>
<div class="eg"><p><b>Worked example: 172.</b> 128 fit hota hai (172 − 128 = 44) → 1. 64, 44 mein fit nahi hota → 0. 32 fit hota hai (44 − 32 = 12) → 1. 16 fit nahi → 0. 8 fit (12 − 8 = 4) → 1. 4 fit (4 − 4 = 0) → 1. 2 → 0. 1 → 0. Result <code>10101100</code>.</p>
<p><b>Worked example: 50.</b> 128 nahi, 64 nahi → 0 0. 32 fit (18 bache) → 1. 16 fit (2 bache) → 1. 8 nahi, 4 nahi → 0 0. 2 fit (0 bache) → 1. 1 → 0. Result <code>00110010</code>. Do leading zeros par dhyan do: yeh matter karte hain.</p></div>

<h3>Binary se decimal: place values jodo</h3>
<p>Bits ke upar place values likho aur jo 1 ke upar hain unhe jodo. <code>10101000</code> = 128 + 32 + 8 = <b>168</b>. <code>01001101</code> = 64 + 8 + 4 + 1 = <b>77</b>. Bas itna hi hai.</p>

<h3>Poora address binary mein</h3>
<p>Har octet ko alag se convert karo aur dots rakho. 172.16.45.77 banta hai:</p>
<pre class="out">172      .16       .45       .77
10101100 .00010000 .00101101 .01001101</pre>
<p>Real life mein aap shayad hi kabhi chaaron octets convert karoge. Sirf woh octet jahan mask ki boundary padti hai, <b>interesting octet</b>, ko binary kaam chahiye. Jo octets poori tarah network part ke andar hain woh copy hote hain, aur jo poori tarah host part mein hain woh 0 ya 255 ban jaate hain. Chapter 5 bilkul yahi shortcut use karta hai.</p>

<h3>Do patterns jo yaad karne layak hain</h3>
<p><b>1. Left se on kiye bits.</b> Mask octet sirf yahi values le sakta hai, aur aap inhe lagataar use karoge:</p>
<table class="cmp"><tr><th>Left se on bits</th><th>Binary</th><th>Decimal</th></tr>
<tr><td>0</td><td>00000000</td><td>0</td></tr><tr><td>1</td><td>10000000</td><td>128</td></tr><tr><td>2</td><td>11000000</td><td>192</td></tr><tr><td>3</td><td>11100000</td><td>224</td></tr><tr><td>4</td><td>11110000</td><td>240</td></tr><tr><td>5</td><td>11111000</td><td>248</td></tr><tr><td>6</td><td>11111100</td><td>252</td></tr><tr><td>7</td><td>11111110</td><td>254</td></tr><tr><td>8</td><td>11111111</td><td>255</td></tr></table>
<p><b>2. Powers of two.</b> 2<sup>1</sup>=2, 2<sup>2</sup>=4, 2<sup>3</sup>=8, 2<sup>4</sup>=16, 2<sup>5</sup>=32, 2<sup>6</sup>=64, 2<sup>7</sup>=128, 2<sup>8</sup>=256, 2<sup>9</sup>=512, 2<sup>10</sup>=1024, 2<sup>11</sup>=2048, 2<sup>12</sup>=4096, 2<sup>16</sup>=65536. Host counts aur subnet counts hamesha powers of two hote hain.</p>

<h3>Practice drills (answers neeche)</h3>
<p>Decimal se binary: <b>a)</b> 10 <b>b)</b> 99 <b>c)</b> 127 <b>d)</b> 130 <b>e)</b> 224. Binary se decimal: <b>f)</b> 11110000 <b>g)</b> 00011111 <b>h)</b> 10000001 <b>i)</b> 01100100.</p>
<div class="tip"><p><b>Answers.</b> a) 00001010 b) 01100011 (64+32+2+1) c) 01111111 d) 10000010 e) 11100000 f) 240 g) 31 h) 129 i) 100 (64+32+4).</p></div>

<p><b>Hexadecimal par ek note.</b> macOS aur kuch Linux tools masks ko hex mein print karte hain, jaise <code>0xffffff80</code>. Har hex digit 4 bits hai: f = 1111, 8 = 1000, c = 1100, e = 1110, 0 = 0000. To ff = 255 aur 80 = 128, aur <code>0xffffff80</code> matlab 255.255.255.128. Yeh aap chapter 11 mein phir dekhoge.</p>

<div class="warn"><p><b>Common galti.</b> Leading zeros chhod dena. 4 hota hai <code>00000100</code>, <code>100</code> nahi. Jab aap do octets ko bit by bit line up karte ho (summarisation ya AND operations ke liye), ek missing zero har bit ko khiska deta hai aur answer galat aata hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> 192.168.1.256 ya 10.300.1.1 jaisa answer option kabhi valid address nahi hota: koi octet 255 se zyada nahi ho sakta. Yeh bhi yaad rakho ki host octet mein 255 apne aap broadcast nahi hota; woh mask par depend karta hai (10.1.0.255/23 ek normal host hai, kyunki woh subnet 10.1.0.0 se 10.1.1.255 tak chalta hai).</p></div>

<div class="scn"><h4>Woh summary jo ek branch nigal gayi</h4><p>Ek engineer ko 172.16.12.0/24 se 172.16.15.0/24 tak ke liye ek summary advertise karni thi. Usne 12 ko <code>1100</code> aur 15 ko <code>1111</code> likha, bina leading zeros ke, notepad par un chhoti strings ko baaki octets ke saamne galat line up kiya, aur nateeja nikala ki third octet ke sirf pehle chaar bits match karte hain. Usne 172.16.0.0/20 configure kar diya. Woh summary 172.16.0.0 se 172.16.11.255 ko bhi cover karti thi, jo doosri branch par tha, aur us traffic ka kuch hissa galat site par khinch gaya. Poore aath-bit octets (<code>00001100</code> se <code>00001111</code>) ke saath maths dobara karne par sahi 172.16.12.0/22 mila.</p><p><b>Seekh:</b> hamesha poore aath bits likho. Binary ki galtiyan routing ki galtiyan ban jaati hain.</p></div>

<div class="iv"><p class="q">"200 ko binary mein convert karo aur mujhe step by step batao."</p><p>Strong answer: place values bolkar batao, 128 64 32 16 8 4 2 1, phir subtract karo: 128 fit hota hai 72 bachte hain, 64 fit hota hai 8 bachte hain, 32 aur 16 fit nahi hote, 8 fit hota hai 0 bachta hai, phir zeros, to 11001000. Interviewers yeh method dekhne ke liye poochte hain, ratta hua answer nahi. Jodo ki yahi skill batati hai ki 255.255.255.200 valid mask nahi hai, kyunki 11001000 ones ki lagataar line nahi hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Octet ki place values 128 64 32 16 8 4 2 1 hain aur yeh 0 se 255 tak rakhta hai.</li>
<li>Decimal se binary: left se right place values ghatao; binary se decimal: unhe jodo.</li>
<li>Sirf interesting octet (jahan mask boundary padti hai) ko binary kaam chahiye.</li>
<li>Mask octets sirf 0, 128, 192, 224, 240, 248, 252, 254 ya 255 ho sakte hain.</li>
<li>Har octet ke hamesha aath bits likho; leading zeros matter karte hain.</li>
</ul></div>
`}};export{e as default};