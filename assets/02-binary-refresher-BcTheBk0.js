var e={id:`binary`,h:{en:`Binary refresher: the only maths subnetting needs`,hi:`Binary refresher: subnetting ke liye bas itna maths`},body:{en:`
<p>Subnetting looks scary only because people try to do it in decimal. Underneath, a mask is simply a row of 1s followed by a row of 0s. Once you can read one octet of binary quickly, everything else in this module becomes counting. This chapter refreshes exactly the binary you need, no more.</p>

<h3>An analogy: eight light switches with price tags</h3>
<p>Imagine a panel of eight light switches. Each switch has a fixed value printed under it: <b>128, 64, 32, 16, 8, 4, 2, 1</b>, from left to right. A switch that is ON counts its value; OFF counts nothing. The number the panel shows is the total of the ON switches. That panel is one octet. All switches off is 0; all on is 128+64+32+16+8+4+2+1 = <b>255</b>. That is why an octet can never be more than 255.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Place values of one octet showing 62">
<g font-size="13">
<rect x="20" y="20" width="70" height="36" rx="6" fill="#e2e8f0"/><text x="55" y="43" text-anchor="middle" class="svg-ink">128</text>
<rect x="95" y="20" width="70" height="36" rx="6" fill="#e2e8f0"/><text x="130" y="43" text-anchor="middle" class="svg-ink">64</text>
<rect x="170" y="20" width="70" height="36" rx="6" fill="#bbf7d0"/><text x="205" y="43" text-anchor="middle" class="svg-ink">32</text>
<rect x="245" y="20" width="70" height="36" rx="6" fill="#bbf7d0"/><text x="280" y="43" text-anchor="middle" class="svg-ink">16</text>
<rect x="320" y="20" width="70" height="36" rx="6" fill="#bbf7d0"/><text x="355" y="43" text-anchor="middle" class="svg-ink">8</text>
<rect x="395" y="20" width="70" height="36" rx="6" fill="#bbf7d0"/><text x="430" y="43" text-anchor="middle" class="svg-ink">4</text>
<rect x="470" y="20" width="70" height="36" rx="6" fill="#bbf7d0"/><text x="505" y="43" text-anchor="middle" class="svg-ink">2</text>
<rect x="545" y="20" width="70" height="36" rx="6" fill="#e2e8f0"/><text x="580" y="43" text-anchor="middle" class="svg-ink">1</text>
<text x="55" y="80" text-anchor="middle" class="svg-muted">0</text><text x="130" y="80" text-anchor="middle" class="svg-muted">0</text><text x="205" y="80" text-anchor="middle" class="svg-accent">1</text><text x="280" y="80" text-anchor="middle" class="svg-accent">1</text><text x="355" y="80" text-anchor="middle" class="svg-accent">1</text><text x="430" y="80" text-anchor="middle" class="svg-accent">1</text><text x="505" y="80" text-anchor="middle" class="svg-accent">1</text><text x="580" y="80" text-anchor="middle" class="svg-muted">0</text>
</g>
<text x="320" y="120" text-anchor="middle" class="svg-ink" font-size="14">32 + 16 + 8 + 4 + 2 = 62  so  62 = 00111110</text>
</svg><p class="cap">One octet: eight place values. Green boxes are ON. PC-SALES's last octet, 62, is 00111110.</p></div>

<h3>Decimal to binary: the subtraction method</h3>
<p>Walk the place values from left to right. If the value fits into what is left, write 1 and subtract it; if it does not fit, write 0 and move on.</p>
<div class="eg"><p><b>Worked example: 200.</b> 128 fits (200 − 128 = 72) → 1. 64 fits (72 − 64 = 8) → 1. 32 does not fit → 0. 16 → 0. 8 fits (8 − 8 = 0) → 1. 4, 2, 1 → 0. Result: <code>11001000</code>.</p>
<p><b>Worked example: 172.</b> 128 fits (44 left) → 1. 64 no → 0. 32 fits (12 left) → 1. 16 no → 0. 8 fits (4 left) → 1. 4 fits (0 left) → 1. 2, 1 → 0. Result: <code>10101100</code>.</p>
<p><b>Worked example: 50.</b> 128 no, 64 no → 00. 32 fits (18 left) → 1. 16 fits (2 left) → 1. 8 no, 4 no → 00. 2 fits → 1. 1 no → 0. Result: <code>00110010</code>.</p></div>

<h3>Binary to decimal: just add</h3>
<p>Write the place values above the bits and add the ones under a 1. <code>10110101</code> = 128 + 32 + 16 + 4 + 1 = <b>181</b>. <code>11100000</code> = 128 + 64 + 32 = <b>224</b>. Always keep all eight bits in an octet, including leading zeros; <code>110010</code> in an address really means <code>00110010</code>.</p>

<h3>The nine values a mask octet can take</h3>
<p>A subnet mask is always a run of 1s from the left followed by 0s. So an octet of a mask can only be one of nine values. Learn this row by heart; it is the most useful table in the module.</p>
<table class="cmp"><tr><th>Bits ON (from left)</th><th>Binary</th><th>Decimal</th></tr>
<tr><td>0</td><td>00000000</td><td>0</td></tr>
<tr><td>1</td><td>10000000</td><td>128</td></tr>
<tr><td>2</td><td>11000000</td><td>192</td></tr>
<tr><td>3</td><td>11100000</td><td>224</td></tr>
<tr><td>4</td><td>11110000</td><td>240</td></tr>
<tr><td>5</td><td>11111000</td><td>248</td></tr>
<tr><td>6</td><td>11111100</td><td>252</td></tr>
<tr><td>7</td><td>11111110</td><td>254</td></tr>
<tr><td>8</td><td>11111111</td><td>255</td></tr>
</table>
<p>Pattern trick: each value is the previous one plus the next place value. 128, +64 = 192, +32 = 224, +16 = 240, +8 = 248, +4 = 252, +2 = 254, +1 = 255.</p>

<h3>Powers of two: your counting table</h3>
<p>Every "how many subnets" and "how many hosts" answer is a power of two. Know these up to 2<sup>12</sup> without thinking and the rest when you need them.</p>
<table class="cmp"><tr><th>n</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th><th>9</th><th>10</th><th>11</th><th>12</th></tr>
<tr><td>2<sup>n</sup></td><td>2</td><td>4</td><td>8</td><td>16</td><td>32</td><td>64</td><td>128</td><td>256</td><td>512</td><td>1024</td><td>2048</td><td>4096</td></tr></table>
<p>Beyond that: 2<sup>13</sup> = 8192, 2<sup>14</sup> = 16384, 2<sup>16</sup> = 65536. Each extra bit doubles the count.</p>

<h3>Drills (cover the answers first)</h3>
<table class="cmp"><tr><th>Convert</th><th>Answer</th></tr>
<tr><td>192 to binary</td><td>11000000</td></tr>
<tr><td>100 to binary</td><td>01100100 (64 + 32 + 4)</td></tr>
<tr><td>129 to binary</td><td>10000001</td></tr>
<tr><td>11111000 to decimal</td><td>248</td></tr>
<tr><td>00111111 to decimal</td><td>63</td></tr>
<tr><td>01000000 to decimal</td><td>64</td></tr>
<tr><td>Is 255.255.255.244 a valid mask?</td><td>No. 244 = 11110100, the 1s are not contiguous</td></tr>
</table>

<div class="warn"><p><b>Common mistakes.</b> Dropping leading zeros so an octet has only six or seven bits, then lining the bits up wrongly against the mask. And starting the place values at 256 or ending at 2: the eight values are 128 down to 1.</p></div>

<div class="exam"><p><b>Exam trap.</b> Answer options sometimes include masks such as 255.255.255.225 or 255.255.0.255. Neither is valid: 225 is not in the nine-value list, and a 255 can never follow a 0. Eliminate those options instantly.</p></div>

<div class="scn"><h4>The printer with the impossible mask</h4><p>A technician set up a network printer by hand and typed the mask as 255.255.255.244 instead of 255.255.255.240. The printer's web page accepted it, but nobody could print from other floors and the printer's status page showed strange local-network behaviour. A senior engineer converted 244 to binary, saw 11110100, and pointed out that the 1s were not contiguous, so the device's local-versus-remote decision was nonsense. Correcting it to 240 fixed printing immediately.</p><p><b>Lesson:</b> when a mask looks odd, convert it to binary. A valid mask is always 1s then 0s.</p></div>

<div class="iv"><p class="q">"Convert 172 to binary and talk me through your method."</p><p>Strong answer: use the place values 128, 64, 32, 16, 8, 4, 2, 1 and subtract left to right. 172 minus 128 leaves 44, so the first bit is 1; 64 does not fit, 0; 32 fits leaving 12, 1; 16 does not, 0; 8 fits leaving 4, 1; 4 fits leaving 0, 1; then 0, 0. Answer 10101100. Mention that the same eight values give you the nine valid mask octets, which is why this skill matters for subnetting.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>One octet = eight bits with place values 128, 64, 32, 16, 8, 4, 2, 1; maximum 255.</li>
<li>Decimal to binary: subtract place values left to right. Binary to decimal: add the values under the 1s.</li>
<li>A mask octet can only be 0, 128, 192, 224, 240, 248, 252, 254 or 255.</li>
<li>Powers of two give every subnet and host count; each extra bit doubles.</li>
<li>Always keep eight bits per octet, leading zeros included.</li>
</ul></div>
`,hi:`
<p>Subnetting sirf isliye darawna lagta hai kyunki log ise decimal mein karne ki koshish karte hain. Andar se mask bas 1s ki ek line hai jiske baad 0s ki line aati hai. Jab aap binary ka ek octet jaldi padh lete ho, is module ki baaki har cheez ginti ban jaati hai. Yeh chapter bilkul utna hi binary refresh karta hai jitna chahiye, usse zyada nahi.</p>

<h3>Ek analogy: price tag wale aath light switches</h3>
<p>Aath light switches ka ek panel socho. Har switch ke neeche ek fixed value likhi hai: <b>128, 64, 32, 16, 8, 4, 2, 1</b>, left se right. Jo switch ON hai woh apni value ginta hai; OFF kuch nahi ginta. Panel jo number dikhata hai woh ON switches ka total hai. Woh panel ek octet hai. Saare switches off matlab 0; saare on matlab 128+64+32+16+8+4+2+1 = <b>255</b>. Isiliye octet kabhi 255 se zyada nahi ho sakta.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Ek octet ki place values, 62 dikhate hue">
<g font-size="13">
<rect x="20" y="20" width="70" height="36" rx="6" fill="#e2e8f0"/><text x="55" y="43" text-anchor="middle" class="svg-ink">128</text>
<rect x="95" y="20" width="70" height="36" rx="6" fill="#e2e8f0"/><text x="130" y="43" text-anchor="middle" class="svg-ink">64</text>
<rect x="170" y="20" width="70" height="36" rx="6" fill="#bbf7d0"/><text x="205" y="43" text-anchor="middle" class="svg-ink">32</text>
<rect x="245" y="20" width="70" height="36" rx="6" fill="#bbf7d0"/><text x="280" y="43" text-anchor="middle" class="svg-ink">16</text>
<rect x="320" y="20" width="70" height="36" rx="6" fill="#bbf7d0"/><text x="355" y="43" text-anchor="middle" class="svg-ink">8</text>
<rect x="395" y="20" width="70" height="36" rx="6" fill="#bbf7d0"/><text x="430" y="43" text-anchor="middle" class="svg-ink">4</text>
<rect x="470" y="20" width="70" height="36" rx="6" fill="#bbf7d0"/><text x="505" y="43" text-anchor="middle" class="svg-ink">2</text>
<rect x="545" y="20" width="70" height="36" rx="6" fill="#e2e8f0"/><text x="580" y="43" text-anchor="middle" class="svg-ink">1</text>
<text x="55" y="80" text-anchor="middle" class="svg-muted">0</text><text x="130" y="80" text-anchor="middle" class="svg-muted">0</text><text x="205" y="80" text-anchor="middle" class="svg-accent">1</text><text x="280" y="80" text-anchor="middle" class="svg-accent">1</text><text x="355" y="80" text-anchor="middle" class="svg-accent">1</text><text x="430" y="80" text-anchor="middle" class="svg-accent">1</text><text x="505" y="80" text-anchor="middle" class="svg-accent">1</text><text x="580" y="80" text-anchor="middle" class="svg-muted">0</text>
</g>
<text x="320" y="120" text-anchor="middle" class="svg-ink" font-size="14">32 + 16 + 8 + 4 + 2 = 62  isliye  62 = 00111110</text>
</svg><p class="cap">Ek octet: aath place values. Green boxes ON hain. PC-SALES ka aakhri octet, 62, 00111110 hai.</p></div>

<h3>Decimal se binary: subtraction method</h3>
<p>Place values par left se right chalo. Agar value bache hue number mein fit hoti hai, 1 likho aur use minus karo; agar fit nahi hoti, 0 likho aur aage badho.</p>
<div class="eg"><p><b>Worked example: 200.</b> 128 fit hota hai (200 − 128 = 72) → 1. 64 fit hota hai (72 − 64 = 8) → 1. 32 fit nahi hota → 0. 16 → 0. 8 fit hota hai (8 − 8 = 0) → 1. 4, 2, 1 → 0. Result: <code>11001000</code>.</p>
<p><b>Worked example: 172.</b> 128 fit (44 bache) → 1. 64 nahi → 0. 32 fit (12 bache) → 1. 16 nahi → 0. 8 fit (4 bache) → 1. 4 fit (0 bache) → 1. 2, 1 → 0. Result: <code>10101100</code>.</p>
<p><b>Worked example: 50.</b> 128 nahi, 64 nahi → 00. 32 fit (18 bache) → 1. 16 fit (2 bache) → 1. 8 nahi, 4 nahi → 00. 2 fit → 1. 1 nahi → 0. Result: <code>00110010</code>.</p></div>

<h3>Binary se decimal: bas jodo</h3>
<p>Bits ke upar place values likho aur jin ke neeche 1 hai unhe jodo. <code>10110101</code> = 128 + 32 + 16 + 4 + 1 = <b>181</b>. <code>11100000</code> = 128 + 64 + 32 = <b>224</b>. Octet mein hamesha aathon bits rakho, leading zeros samet; address mein <code>110010</code> ka asal matlab <code>00110010</code> hai.</p>

<h3>Mask octet ki sirf nau values ho sakti hain</h3>
<p>Subnet mask hamesha left se 1s ki line hai jiske baad 0s aate hain. Isliye mask ka ek octet sirf nau values mein se ek ho sakta hai. Is row ko ratt lo; yeh module ki sabse useful table hai.</p>
<table class="cmp"><tr><th>ON bits (left se)</th><th>Binary</th><th>Decimal</th></tr>
<tr><td>0</td><td>00000000</td><td>0</td></tr>
<tr><td>1</td><td>10000000</td><td>128</td></tr>
<tr><td>2</td><td>11000000</td><td>192</td></tr>
<tr><td>3</td><td>11100000</td><td>224</td></tr>
<tr><td>4</td><td>11110000</td><td>240</td></tr>
<tr><td>5</td><td>11111000</td><td>248</td></tr>
<tr><td>6</td><td>11111100</td><td>252</td></tr>
<tr><td>7</td><td>11111110</td><td>254</td></tr>
<tr><td>8</td><td>11111111</td><td>255</td></tr>
</table>
<p>Pattern trick: har value pichhli value plus agli place value hai. 128, +64 = 192, +32 = 224, +16 = 240, +8 = 248, +4 = 252, +2 = 254, +1 = 255.</p>

<h3>Powers of two: aapki ginti ki table</h3>
<p>Har "kitne subnets" aur "kitne hosts" ka jawab power of two hota hai. 2<sup>12</sup> tak bina soche yaad rakho aur baaki zaroorat par.</p>
<table class="cmp"><tr><th>n</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th><th>9</th><th>10</th><th>11</th><th>12</th></tr>
<tr><td>2<sup>n</sup></td><td>2</td><td>4</td><td>8</td><td>16</td><td>32</td><td>64</td><td>128</td><td>256</td><td>512</td><td>1024</td><td>2048</td><td>4096</td></tr></table>
<p>Uske aage: 2<sup>13</sup> = 8192, 2<sup>14</sup> = 16384, 2<sup>16</sup> = 65536. Har extra bit ginti double kar deta hai.</p>

<h3>Drills (pehle answers dhak lo)</h3>
<table class="cmp"><tr><th>Convert karo</th><th>Answer</th></tr>
<tr><td>192 ko binary mein</td><td>11000000</td></tr>
<tr><td>100 ko binary mein</td><td>01100100 (64 + 32 + 4)</td></tr>
<tr><td>129 ko binary mein</td><td>10000001</td></tr>
<tr><td>11111000 ko decimal mein</td><td>248</td></tr>
<tr><td>00111111 ko decimal mein</td><td>63</td></tr>
<tr><td>01000000 ko decimal mein</td><td>64</td></tr>
<tr><td>Kya 255.255.255.244 valid mask hai?</td><td>Nahi. 244 = 11110100, 1s lagatar nahi hain</td></tr>
</table>

<div class="warn"><p><b>Common galtiyan.</b> Leading zeros gira dena jisse octet mein sirf chhe ya saat bits reh jaate hain, phir bits ko mask ke saamne galat line up karna. Aur place values 256 se shuru karna ya 2 par khatam karna: aath values 128 se neeche 1 tak hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> Answer options mein kabhi kabhi 255.255.255.225 ya 255.255.0.255 jaise masks hote hain. Dono invalid hain: 225 nau values ki list mein nahi hai, aur 0 ke baad kabhi 255 nahi aa sakta. Aise options turant hata do.</p></div>

<div class="scn"><h4>Namumkin mask wala printer</h4><p>Ek technician ne network printer haath se set kiya aur mask 255.255.255.240 ki jagah 255.255.255.244 type kar diya. Printer ke web page ne use accept kar liya, lekin doosri floors se koi print nahi kar pa raha tha aur printer ka status page ajeeb local-network behaviour dikha raha tha. Ek senior engineer ne 244 ko binary mein badla, 11110100 dekha, aur bataya ki 1s lagatar nahi hain, isliye device ka local-versus-remote decision bekaar tha. 240 karte hi printing turant theek ho gayi.</p><p><b>Seekh:</b> jab mask ajeeb lage, use binary mein badlo. Valid mask hamesha pehle 1s phir 0s hota hai.</p></div>

<div class="iv"><p class="q">"172 ko binary mein convert karo aur apna method samjhao."</p><p>Strong answer: place values 128, 64, 32, 16, 8, 4, 2, 1 use karo aur left se right minus karo. 172 minus 128 se 44 bachte hain, to pehla bit 1; 64 fit nahi hota, 0; 32 fit hota hai aur 12 bachte hain, 1; 16 nahi, 0; 8 fit hota hai aur 4 bachte hain, 1; 4 fit hota hai aur 0 bachta hai, 1; phir 0, 0. Answer 10101100. Yeh bhi batao ki inhi aath values se nau valid mask octets bante hain, isliye subnetting ke liye yeh skill zaroori hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ek octet = aath bits jinki place values 128, 64, 32, 16, 8, 4, 2, 1 hain; maximum 255.</li>
<li>Decimal se binary: left se right place values minus karo. Binary se decimal: 1s ke neeche wali values jodo.</li>
<li>Mask octet sirf 0, 128, 192, 224, 240, 248, 252, 254 ya 255 ho sakta hai.</li>
<li>Powers of two har subnet aur host count dete hain; har extra bit double karta hai.</li>
<li>Har octet mein hamesha aath bits rakho, leading zeros samet.</li>
</ul></div>
`}};export{e as default};