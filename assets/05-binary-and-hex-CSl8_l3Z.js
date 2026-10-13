var e={id:`binary-hex`,h:{en:`Bits, bytes, binary, decimal and hex`,hi:`Bits, bytes, binary, decimal aur hex`},body:{en:`
<p>Think of a row of light switches on a wall. Each switch is either off or on. With one switch you can show 2 states, with two switches 4 combinations, with eight switches 256 combinations. Computers store and send everything, from your photo to an IP address, as long rows of such on/off switches. Network engineers read these rows every day, so this chapter turns you into a fast, confident converter. Take a pen and paper: this is a practice chapter.</p>

<h3>Bits, bytes and friends</h3>
<dl class="terms">
<dt>Bit</dt><dd>One binary digit: 0 or 1. The smallest unit of data. On copper it is a voltage level, on fibre a light pulse, on Wi-Fi a change in the radio wave.</dd>
<dt>Byte</dt><dd>8 bits. File sizes and memory are counted in bytes.</dd>
<dt>Octet</dt><dd>Also exactly 8 bits. Networking prefers this word because it is unambiguous. An IPv4 address is 4 octets.</dd>
<dt>Nibble</dt><dd>4 bits, half a byte. One hex digit is exactly one nibble.</dd>
</dl>
<p>With <b>n</b> bits you can make 2<sup>n</sup> different patterns: 2<sup>8</sup> = 256, which is why one octet holds values from 0 to 255. Remember also 2<sup>10</sup> = 1,024 and that an IPv4 address has 32 bits, a MAC address 48 bits and an IPv6 address 128 bits.</p>

<h3>Decimal is positional; binary is too</h3>
<p>In decimal (base 10), 245 means 2 hundreds + 4 tens + 5 ones. Each place is worth 10 times the place to its right. Binary (base 2) works the same way, but each place is worth <b>2 times</b> the one to its right. For one octet, the place values are:</p>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Octet place values with 192 as an example">
<text x="320" y="20" text-anchor="middle" class="svg-accent" font-size="13">One octet: place values</text>
<rect x="20" y="32" width="70" height="36" rx="6" fill="#bae6fd"/><text x="55" y="55" text-anchor="middle" class="svg-ink" font-size="14">128</text>
<rect x="95" y="32" width="70" height="36" rx="6" fill="#bae6fd"/><text x="130" y="55" text-anchor="middle" class="svg-ink" font-size="14">64</text>
<rect x="170" y="32" width="70" height="36" rx="6" fill="#bae6fd"/><text x="205" y="55" text-anchor="middle" class="svg-ink" font-size="14">32</text>
<rect x="245" y="32" width="70" height="36" rx="6" fill="#bae6fd"/><text x="280" y="55" text-anchor="middle" class="svg-ink" font-size="14">16</text>
<rect x="320" y="32" width="70" height="36" rx="6" fill="#bae6fd"/><text x="355" y="55" text-anchor="middle" class="svg-ink" font-size="14">8</text>
<rect x="395" y="32" width="70" height="36" rx="6" fill="#bae6fd"/><text x="430" y="55" text-anchor="middle" class="svg-ink" font-size="14">4</text>
<rect x="470" y="32" width="70" height="36" rx="6" fill="#bae6fd"/><text x="505" y="55" text-anchor="middle" class="svg-ink" font-size="14">2</text>
<rect x="545" y="32" width="70" height="36" rx="6" fill="#bae6fd"/><text x="580" y="55" text-anchor="middle" class="svg-ink" font-size="14">1</text>
<rect x="20" y="76" width="70" height="36" rx="6" fill="#bbf7d0"/><text x="55" y="99" text-anchor="middle" class="svg-ink" font-size="14">1</text>
<rect x="95" y="76" width="70" height="36" rx="6" fill="#bbf7d0"/><text x="130" y="99" text-anchor="middle" class="svg-ink" font-size="14">1</text>
<rect x="170" y="76" width="70" height="36" rx="6" fill="#e2e8f0"/><text x="205" y="99" text-anchor="middle" class="svg-ink" font-size="14">0</text>
<rect x="245" y="76" width="70" height="36" rx="6" fill="#e2e8f0"/><text x="280" y="99" text-anchor="middle" class="svg-ink" font-size="14">0</text>
<rect x="320" y="76" width="70" height="36" rx="6" fill="#e2e8f0"/><text x="355" y="99" text-anchor="middle" class="svg-ink" font-size="14">0</text>
<rect x="395" y="76" width="70" height="36" rx="6" fill="#e2e8f0"/><text x="430" y="99" text-anchor="middle" class="svg-ink" font-size="14">0</text>
<rect x="470" y="76" width="70" height="36" rx="6" fill="#e2e8f0"/><text x="505" y="99" text-anchor="middle" class="svg-ink" font-size="14">0</text>
<rect x="545" y="76" width="70" height="36" rx="6" fill="#e2e8f0"/><text x="580" y="99" text-anchor="middle" class="svg-ink" font-size="14">0</text>
<text x="320" y="138" text-anchor="middle" class="svg-ink" font-size="13">11000000 = 128 + 64 = 192</text>
</svg><p class="cap">Write 128 64 32 16 8 4 2 1 above the bits, then add the places that hold a 1.</p></div>

<h3>Binary to decimal: add the places with a 1</h3>
<div class="eg"><p><b>Worked examples.</b></p><ul>
<li>10101000 = 128 + 32 + 8 = <b>168</b></li>
<li>00001010 = 8 + 2 = <b>10</b></li>
<li>11111111 = 128 + 64 + 32 + 16 + 8 + 4 + 2 + 1 = <b>255</b></li>
<li>01100100 = 64 + 32 + 4 = <b>100</b></li>
</ul></div>

<h3>Decimal to binary: the subtraction method</h3>
<p>Walk the place values from 128 down to 1. At each place ask: "does this value fit into what is left?" If yes, write 1 and subtract; if no, write 0.</p>
<div class="eg"><p><b>Worked example: 172.</b> 128 fits (1, left 44). 64 does not (0). 32 fits (1, left 12). 16 does not (0). 8 fits (1, left 4). 4 fits (1, left 0). 2 no (0). 1 no (0). Answer: <b>10101100</b>. Check: 128 + 32 + 8 + 4 = 172.</p>
<p><b>Worked example: 201.</b> 128 (1, left 73), 64 (1, left 9), 32 (0), 16 (0), 8 (1, left 1), 4 (0), 2 (0), 1 (1). Answer: <b>11001001</b>.</p>
<p><b>A whole IP address.</b> Convert each octet on its own: 192.168.10.5 = 11000000.10101000.00001010.00000101.</p></div>

<h3>Why this matters: subnet masks</h3>
<p>A subnet mask such as 255.255.255.0 is 24 ones followed by 8 zeros, written in short as <b>/24</b>. You will only ever see a handful of values inside a mask octet, so learn them now; subnetting modules later build directly on this table.</p>
<table class="cmp"><tr><th>Binary</th><th>Decimal</th><th>Ones</th></tr>
<tr><td>10000000</td><td>128</td><td>1</td></tr><tr><td>11000000</td><td>192</td><td>2</td></tr><tr><td>11100000</td><td>224</td><td>3</td></tr><tr><td>11110000</td><td>240</td><td>4</td></tr>
<tr><td>11111000</td><td>248</td><td>5</td></tr><tr><td>11111100</td><td>252</td><td>6</td></tr><tr><td>11111110</td><td>254</td><td>7</td></tr><tr><td>11111111</td><td>255</td><td>8</td></tr>
</table>

<h3>Hexadecimal (hex): base 16</h3>
<p>Long binary strings are hard for people to read, so engineers write them in <b>hex</b>. Hex has 16 digits: 0 to 9, then A=10, B=11, C=12, D=13, E=14, F=15. The magic is that <b>one hex digit equals exactly 4 bits</b>, so conversion between binary and hex is just grouping.</p>
<table class="cmp"><tr><th>Hex</th><th>Binary</th><th>Hex</th><th>Binary</th></tr>
<tr><td>0</td><td>0000</td><td>8</td><td>1000</td></tr><tr><td>1</td><td>0001</td><td>9</td><td>1001</td></tr>
<tr><td>2</td><td>0010</td><td>A</td><td>1010</td></tr><tr><td>3</td><td>0011</td><td>B</td><td>1011</td></tr>
<tr><td>4</td><td>0100</td><td>C</td><td>1100</td></tr><tr><td>5</td><td>0101</td><td>D</td><td>1101</td></tr>
<tr><td>6</td><td>0110</td><td>E</td><td>1110</td></tr><tr><td>7</td><td>0111</td><td>F</td><td>1111</td></tr>
</table>
<div class="eg"><p><b>Worked examples.</b></p><ul>
<li><b>Binary to hex:</b> 10101100 splits into 1010 and 1100, which are A and C, so <b>AC</b>.</li>
<li><b>Hex to decimal:</b> the left digit is worth 16 each. 0x2F = 2 x 16 + 15 = <b>47</b>. 0xC0 = 12 x 16 + 0 = <b>192</b>. 0xFF = 15 x 16 + 15 = <b>255</b>.</li>
<li><b>Decimal to hex:</b> divide by 16. 200 / 16 = 12 remainder 8, so C and 8: <b>C8</b>. Check: 12 x 16 + 8 = 200.</li>
</ul><p>The "0x" in front just means "this number is hex", so that 0x10 (sixteen) is not confused with 10 (ten).</p></div>

<h3>Where you will see hex: MAC and IPv6 addresses</h3>
<p>A <b>MAC address</b> is 48 bits, written as 12 hex digits in 6 pairs. Different systems write the same address differently:</p>
<pre class="out">Windows:   3C-52-82-1A-2B-3C
Linux/Mac: 3c:52:82:1a:2b:3c
Cisco IOS: 3c52.821a.2b3c</pre>
<p>The first 24 bits (3C-52-82) identify the manufacturer, called the <b>OUI</b> (organisationally unique identifier). The address FF-FF-FF-FF-FF-FF, all 48 bits set to 1, is the <b>broadcast</b> MAC that means "everyone on this LAN". IPv6 addresses are 128 bits written as eight groups of four hex digits, for example <code>2001:db8:0:1::10</code>; you will study them later in the track.</p>

<div class="warn"><p><b>Common beginner mistake.</b> Forgetting leading zeros. The octet 10 is 00001010, not 1010: every octet has exactly 8 bits. Another one: reading hex "10" as ten. In hex it is sixteen.</p></div>

<div class="exam"><p><b>Exam trap.</b> Exams love "which is the binary of 224?" (11100000) and "how many bits in a MAC / IPv4 / IPv6 address?" (48 / 32 / 128). The biggest value in one octet is 255, so an address like 192.168.1.256 is invalid.</p></div>

<div class="scn"><h4>The misread MAC address</h4><p>A help-desk engineer was told to find a laptop with MAC 3c52.821a.2b3c on a switch. He searched the switch table for "3C-52-82-1A-2B-3C", the Windows format from the ticket, and found nothing. A senior colleague explained that the switch shows MACs in dotted groups of four hex digits; the digits are the same, only the grouping changes. Searching for "2b3c" found the laptop on port 17 in seconds.</p><p><b>Lesson:</b> MAC formats differ by system, but it is always the same 12 hex digits. Compare digits, not punctuation.</p></div>

<div class="iv"><p class="q">"Convert 172.16.200.1 to binary, and tell me why an octet can hold only 0 to 255."</p><p>Strong answer: convert each octet separately using 128 64 32 16 8 4 2 1. 172 = 10101100, 16 = 00010000, 200 = 11001000, 1 = 00000001. An octet has 8 bits, 8 bits give 2 to the power 8 = 256 combinations, so the range is 0 to 255. Work out loud and check by adding back; interviewers care more about a clean method than raw speed.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Bit = 0 or 1; byte/octet = 8 bits; nibble = 4 bits = one hex digit.</li>
<li>Octet place values: 128 64 32 16 8 4 2 1; an octet holds 0 to 255.</li>
<li>Binary to decimal: add the places with a 1. Decimal to binary: subtract from 128 downwards.</li>
<li>Hex digits 0 to F; group binary in 4s to convert; 0xC0 = 192, 0xFF = 255.</li>
<li>MAC = 48 bits (12 hex digits, OUI in the first half), IPv4 = 32 bits, IPv6 = 128 bits.</li>
</ul></div>
`,hi:`
<p>Deewar par light switches ki ek line socho. Har switch ya to off hai ya on. Ek switch se aap 2 states dikha sakte ho, do switches se 4 combinations, aath switches se 256 combinations. Computers sab kuch, aapki photo se lekar IP address tak, aise hi on/off switches ki lambi lines ke roop mein store aur send karte hain. Network engineers yeh lines roz padhte hain, isliye yeh chapter aapko fast aur confident converter banayega. Pen aur paper le lo: yeh practice chapter hai.</p>

<h3>Bits, bytes aur dost</h3>
<dl class="terms">
<dt>Bit</dt><dd>Ek binary digit: 0 ya 1. Data ki sabse chhoti unit. Copper par yeh voltage level hai, fibre par light pulse, Wi-Fi par radio wave mein badlaav.</dd>
<dt>Byte</dt><dd>8 bits. File sizes aur memory bytes mein gine jaate hain.</dd>
<dt>Octet</dt><dd>Yeh bhi exactly 8 bits. Networking yeh word pasand karti hai kyunki isme koi confusion nahi. IPv4 address 4 octets ka hota hai.</dd>
<dt>Nibble</dt><dd>4 bits, aadha byte. Ek hex digit exactly ek nibble hota hai.</dd>
</dl>
<p><b>n</b> bits se aap 2<sup>n</sup> alag patterns bana sakte ho: 2<sup>8</sup> = 256, isiliye ek octet 0 se 255 tak values rakhta hai. Yeh bhi yaad rakho ki 2<sup>10</sup> = 1,024, aur IPv4 address mein 32 bits, MAC address mein 48 bits aur IPv6 address mein 128 bits hote hain.</p>

<h3>Decimal positional hai; binary bhi</h3>
<p>Decimal (base 10) mein 245 ka matlab hai 2 sau + 4 das + 5 ek. Har place apne right wale place se 10 guna value ka hota hai. Binary (base 2) bhi aise hi kaam karta hai, lekin har place apne right wale se <b>2 guna</b> hota hai. Ek octet ke liye place values yeh hain:</p>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Octet place values, 192 ka example">
<text x="320" y="20" text-anchor="middle" class="svg-accent" font-size="13">Ek octet: place values</text>
<rect x="20" y="32" width="70" height="36" rx="6" fill="#bae6fd"/><text x="55" y="55" text-anchor="middle" class="svg-ink" font-size="14">128</text>
<rect x="95" y="32" width="70" height="36" rx="6" fill="#bae6fd"/><text x="130" y="55" text-anchor="middle" class="svg-ink" font-size="14">64</text>
<rect x="170" y="32" width="70" height="36" rx="6" fill="#bae6fd"/><text x="205" y="55" text-anchor="middle" class="svg-ink" font-size="14">32</text>
<rect x="245" y="32" width="70" height="36" rx="6" fill="#bae6fd"/><text x="280" y="55" text-anchor="middle" class="svg-ink" font-size="14">16</text>
<rect x="320" y="32" width="70" height="36" rx="6" fill="#bae6fd"/><text x="355" y="55" text-anchor="middle" class="svg-ink" font-size="14">8</text>
<rect x="395" y="32" width="70" height="36" rx="6" fill="#bae6fd"/><text x="430" y="55" text-anchor="middle" class="svg-ink" font-size="14">4</text>
<rect x="470" y="32" width="70" height="36" rx="6" fill="#bae6fd"/><text x="505" y="55" text-anchor="middle" class="svg-ink" font-size="14">2</text>
<rect x="545" y="32" width="70" height="36" rx="6" fill="#bae6fd"/><text x="580" y="55" text-anchor="middle" class="svg-ink" font-size="14">1</text>
<rect x="20" y="76" width="70" height="36" rx="6" fill="#bbf7d0"/><text x="55" y="99" text-anchor="middle" class="svg-ink" font-size="14">1</text>
<rect x="95" y="76" width="70" height="36" rx="6" fill="#bbf7d0"/><text x="130" y="99" text-anchor="middle" class="svg-ink" font-size="14">1</text>
<rect x="170" y="76" width="70" height="36" rx="6" fill="#e2e8f0"/><text x="205" y="99" text-anchor="middle" class="svg-ink" font-size="14">0</text>
<rect x="245" y="76" width="70" height="36" rx="6" fill="#e2e8f0"/><text x="280" y="99" text-anchor="middle" class="svg-ink" font-size="14">0</text>
<rect x="320" y="76" width="70" height="36" rx="6" fill="#e2e8f0"/><text x="355" y="99" text-anchor="middle" class="svg-ink" font-size="14">0</text>
<rect x="395" y="76" width="70" height="36" rx="6" fill="#e2e8f0"/><text x="430" y="99" text-anchor="middle" class="svg-ink" font-size="14">0</text>
<rect x="470" y="76" width="70" height="36" rx="6" fill="#e2e8f0"/><text x="505" y="99" text-anchor="middle" class="svg-ink" font-size="14">0</text>
<rect x="545" y="76" width="70" height="36" rx="6" fill="#e2e8f0"/><text x="580" y="99" text-anchor="middle" class="svg-ink" font-size="14">0</text>
<text x="320" y="138" text-anchor="middle" class="svg-ink" font-size="13">11000000 = 128 + 64 = 192</text>
</svg><p class="cap">Bits ke upar 128 64 32 16 8 4 2 1 likho, phir jin places mein 1 hai unhe jod do.</p></div>

<h3>Binary se decimal: jin places mein 1 hai unhe jodo</h3>
<div class="eg"><p><b>Worked examples.</b></p><ul>
<li>10101000 = 128 + 32 + 8 = <b>168</b></li>
<li>00001010 = 8 + 2 = <b>10</b></li>
<li>11111111 = 128 + 64 + 32 + 16 + 8 + 4 + 2 + 1 = <b>255</b></li>
<li>01100100 = 64 + 32 + 4 = <b>100</b></li>
</ul></div>

<h3>Decimal se binary: subtraction method</h3>
<p>Place values par 128 se 1 tak chalo. Har place par poocho: "kya yeh value bache hue mein fit hoti hai?" Agar haan, 1 likho aur subtract karo; agar nahi, 0 likho.</p>
<div class="eg"><p><b>Worked example: 172.</b> 128 fit hota hai (1, bacha 44). 64 nahi (0). 32 fit (1, bacha 12). 16 nahi (0). 8 fit (1, bacha 4). 4 fit (1, bacha 0). 2 nahi (0). 1 nahi (0). Answer: <b>10101100</b>. Check: 128 + 32 + 8 + 4 = 172.</p>
<p><b>Worked example: 201.</b> 128 (1, bacha 73), 64 (1, bacha 9), 32 (0), 16 (0), 8 (1, bacha 1), 4 (0), 2 (0), 1 (1). Answer: <b>11001001</b>.</p>
<p><b>Poora IP address.</b> Har octet ko alag se convert karo: 192.168.10.5 = 11000000.10101000.00001010.00000101.</p></div>

<h3>Yeh kyun zaroori hai: subnet masks</h3>
<p>255.255.255.0 jaisa subnet mask 24 ones ke baad 8 zeros hai, jise short mein <b>/24</b> likhte hain. Mask octet ke andar aapko sirf kuch hi values dikhengi, isliye abhi seekh lo; baad ke subnetting modules seedhe isi table par bante hain.</p>
<table class="cmp"><tr><th>Binary</th><th>Decimal</th><th>Ones</th></tr>
<tr><td>10000000</td><td>128</td><td>1</td></tr><tr><td>11000000</td><td>192</td><td>2</td></tr><tr><td>11100000</td><td>224</td><td>3</td></tr><tr><td>11110000</td><td>240</td><td>4</td></tr>
<tr><td>11111000</td><td>248</td><td>5</td></tr><tr><td>11111100</td><td>252</td><td>6</td></tr><tr><td>11111110</td><td>254</td><td>7</td></tr><tr><td>11111111</td><td>255</td><td>8</td></tr>
</table>

<h3>Hexadecimal (hex): base 16</h3>
<p>Lambi binary strings logon ke liye padhna mushkil hai, isliye engineers unhe <b>hex</b> mein likhte hain. Hex mein 16 digits hain: 0 se 9, phir A=10, B=11, C=12, D=13, E=14, F=15. Magic yeh hai ki <b>ek hex digit exactly 4 bits ke barabar hai</b>, isliye binary aur hex ke beech conversion sirf grouping hai.</p>
<table class="cmp"><tr><th>Hex</th><th>Binary</th><th>Hex</th><th>Binary</th></tr>
<tr><td>0</td><td>0000</td><td>8</td><td>1000</td></tr><tr><td>1</td><td>0001</td><td>9</td><td>1001</td></tr>
<tr><td>2</td><td>0010</td><td>A</td><td>1010</td></tr><tr><td>3</td><td>0011</td><td>B</td><td>1011</td></tr>
<tr><td>4</td><td>0100</td><td>C</td><td>1100</td></tr><tr><td>5</td><td>0101</td><td>D</td><td>1101</td></tr>
<tr><td>6</td><td>0110</td><td>E</td><td>1110</td></tr><tr><td>7</td><td>0111</td><td>F</td><td>1111</td></tr>
</table>
<div class="eg"><p><b>Worked examples.</b></p><ul>
<li><b>Binary se hex:</b> 10101100 ko 1010 aur 1100 mein todo, jo A aur C hain, to <b>AC</b>.</li>
<li><b>Hex se decimal:</b> left digit ki har unit 16 ki hoti hai. 0x2F = 2 x 16 + 15 = <b>47</b>. 0xC0 = 12 x 16 + 0 = <b>192</b>. 0xFF = 15 x 16 + 15 = <b>255</b>.</li>
<li><b>Decimal se hex:</b> 16 se divide karo. 200 / 16 = 12 remainder 8, yaani C aur 8: <b>C8</b>. Check: 12 x 16 + 8 = 200.</li>
</ul><p>Aage laga "0x" sirf batata hai ki "yeh number hex hai", taaki 0x10 (solah) ko 10 (das) na samjha jaaye.</p></div>

<h3>Hex aapko kahan dikhega: MAC aur IPv6 addresses</h3>
<p><b>MAC address</b> 48 bits ka hota hai, 6 pairs mein 12 hex digits ke roop mein likha jaata hai. Alag systems same address ko alag tarah likhte hain:</p>
<pre class="out">Windows:   3C-52-82-1A-2B-3C
Linux/Mac: 3c:52:82:1a:2b:3c
Cisco IOS: 3c52.821a.2b3c</pre>
<p>Pehle 24 bits (3C-52-82) manufacturer ko identify karte hain, jise <b>OUI</b> (organisationally unique identifier) kehte hain. Address FF-FF-FF-FF-FF-FF, jismein saare 48 bits 1 hain, <b>broadcast</b> MAC hai jiska matlab hai "is LAN par sab log". IPv6 addresses 128 bits ke hote hain jo chaar hex digits ke aath groups mein likhe jaate hain, jaise <code>2001:db8:0:1::10</code>; inhe aap track mein baad mein padhoge.</p>

<div class="warn"><p><b>Beginners ki common galti.</b> Leading zeros bhool jaana. Octet 10 ka binary 00001010 hai, 1010 nahi: har octet mein exactly 8 bits hote hain. Ek aur: hex "10" ko das padhna. Hex mein yeh solah hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Exams ko pasand hai "224 ka binary kya hai?" (11100000) aur "MAC / IPv4 / IPv6 address mein kitne bits?" (48 / 32 / 128). Ek octet ki sabse badi value 255 hai, isliye 192.168.1.256 jaisa address invalid hai.</p></div>

<div class="scn"><h4>Galat padha gaya MAC address</h4><p>Ek help-desk engineer ko switch par MAC 3c52.821a.2b3c wala laptop dhoondhne ko kaha gaya. Usne ticket ke Windows format "3C-52-82-1A-2B-3C" se switch table mein search kiya aur kuch nahi mila. Ek senior colleague ne samjhaya ki switch MACs ko chaar hex digits ke dotted groups mein dikhata hai; digits same hain, sirf grouping badalti hai. "2b3c" search karne par laptop seconds mein port 17 par mil gaya.</p><p><b>Seekh:</b> MAC formats system ke hisaab se alag hote hain, lekin hamesha same 12 hex digits hote hain. Digits compare karo, punctuation nahi.</p></div>

<div class="iv"><p class="q">"172.16.200.1 ko binary mein convert karo, aur batao ki octet sirf 0 se 255 tak kyun rakh sakta hai."</p><p>Strong answer: 128 64 32 16 8 4 2 1 use karke har octet alag se convert karo. 172 = 10101100, 16 = 00010000, 200 = 11001000, 1 = 00000001. Octet mein 8 bits hain, 8 bits se 2 ki power 8 = 256 combinations bante hain, isliye range 0 se 255 hai. Bol kar kaam karo aur wapas jod kar check karo; interviewers ko raw speed se zyada saaf method pasand hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Bit = 0 ya 1; byte/octet = 8 bits; nibble = 4 bits = ek hex digit.</li>
<li>Octet place values: 128 64 32 16 8 4 2 1; octet 0 se 255 tak rakhta hai.</li>
<li>Binary se decimal: 1 wale places jodo. Decimal se binary: 128 se neeche ki taraf subtract karo.</li>
<li>Hex digits 0 se F; convert karne ke liye binary ko 4-4 ke groups mein baanto; 0xC0 = 192, 0xFF = 255.</li>
<li>MAC = 48 bits (12 hex digits, pehle aadhe mein OUI), IPv4 = 32 bits, IPv6 = 128 bits.</li>
</ul></div>
`}};export{e as default};