var e={id:`magic-number`,h:{en:`The magic number (block size) method: subnetting in seconds`,hi:`Magic number (block size) method: seconds mein subnetting`},body:{en:`
<p>Imagine a long train where every compartment has exactly 64 seats: seats 0 to 63 are compartment one, 64 to 127 compartment two, and so on. If your ticket says seat 77, you know instantly that you are in the compartment that starts at 64 and ends at 127. You did not need binary; you only needed the compartment size. Subnets are compartments, and their size is the <b>block size</b>, also called the <b>magic number</b>. This is the method you will use in the exam and on the job.</p>

<h3>The method in five steps</h3>
<ol>
<li>Find the <b>interesting octet</b>: the octet where the mask is not 255 and not 0.</li>
<li><b>Block size</b> = 256 − the mask value in that octet. /26 → 256 − 192 = <b>64</b>.</li>
<li>Subnets start at <b>multiples of the block size</b> in that octet: 0, 64, 128, 192.</li>
<li>The <b>network</b> is the largest multiple that is less than or equal to the address's value in that octet. Octets to the right become 0.</li>
<li>The <b>broadcast</b> is the next multiple minus 1, and octets to the right become 255. First usable = network + 1, last usable = broadcast − 1.</li>
</ol>
<p>A quick way to do step 4: divide the octet by the block size, throw away the remainder, multiply back. 77 ÷ 64 = 1 remainder 13, so 1 × 64 = 64.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Blocks of 64 on a number line">
<text x="320" y="22" text-anchor="middle" class="svg-ink" font-size="14">/26: block size 64 in the fourth octet</text>
<rect x="20" y="40" width="150" height="44" fill="#bae6fd"/><text x="95" y="67" text-anchor="middle" class="svg-ink" font-size="13">0 to 63</text>
<rect x="170" y="40" width="150" height="44" fill="#bbf7d0"/><text x="245" y="67" text-anchor="middle" class="svg-ink" font-size="13">64 to 127</text>
<rect x="320" y="40" width="150" height="44" fill="#fde68a"/><text x="395" y="67" text-anchor="middle" class="svg-ink" font-size="13">128 to 191</text>
<rect x="470" y="40" width="150" height="44" fill="#ddd6fe"/><text x="545" y="67" text-anchor="middle" class="svg-ink" font-size="13">192 to 255</text>
<line x1="351" y1="92" x2="351" y2="112" stroke="#64748b" stroke-width="2"/><text x="351" y="128" text-anchor="middle" class="svg-accent" font-size="13">.130 lives here</text>
<text x="320" y="158" text-anchor="middle" class="svg-muted" font-size="12">network .128, broadcast .191, hosts .129 to .190</text>
</svg><p class="cap">With the block size you can see the subnet boundaries without writing a single bit.</p></div>

<div class="eg"><p><b>Worked example 1 (fourth octet): 192.168.10.100/28.</b> Mask 255.255.255.240, block 256 − 240 = 16. Multiples of 16: ... 80, 96, 112 ... 100 falls between 96 and 112. Network 192.168.10.96, broadcast 192.168.10.111, usable .97 to .110.</p></div>

<div class="eg"><p><b>Worked example 2 (third octet): 172.30.77.200/20.</b> Mask 255.255.240.0. Interesting octet is the third, block 256 − 240 = 16. Multiples: 48, 64, 80. 77 falls in 64 to 79. Network <b>172.30.64.0</b>, broadcast <b>172.30.79.255</b> (next block 80 minus 1, fourth octet 255). First usable 172.30.64.1, last usable 172.30.79.254.</p></div>

<div class="eg"><p><b>Worked example 3 (second octet): 10.150.3.3/12.</b> Mask 255.240.0.0, interesting octet is the second, block 16. 150 ÷ 16 = 9 remainder 6, so 9 × 16 = 144. Network <b>10.144.0.0</b>, broadcast <b>10.159.255.255</b>, usable 10.144.0.1 to 10.159.255.254.</p></div>

<h3>The two Lab 1 questions, the fast way</h3>
<p><b>LAN-B broadcast.</b> LAN-B is 192.168.50.128/26: block 64, the block starting at 128 ends at 128 + 64 − 1 = <b>192.168.50.191</b>. That is exactly the answer the lab asks for. <b>R1 in the troubleshooting lab.</b> 10.20.30.1 with 255.255.255.240: block 16, the address sits in 0 to 15, so the broadcast R1 believes in is <b>10.20.30.15</b>.</p>

<h3>"Same subnet?" questions</h3>
<p>Two hosts are in the same subnet only if their addresses fall in the same block. With /26: 10.1.1.70 is in 64 to 127, 10.1.1.130 is in 128 to 191, so they are in <b>different</b> subnets and need a router. With /25 both would be in 0 to 127 and 128 to 255 respectively: still different. With /24 they would be together.</p>

<h3>Speed drills (answers below)</h3>
<table class="cmp"><tr><th>#</th><th>Address</th><th>Find</th></tr>
<tr><td>1</td><td>192.168.10.100/28</td><td>network, broadcast</td></tr>
<tr><td>2</td><td>10.20.30.50/26</td><td>network, usable range</td></tr>
<tr><td>3</td><td>172.16.200.9/29</td><td>network, broadcast</td></tr>
<tr><td>4</td><td>192.168.1.130/30</td><td>both usable addresses</td></tr>
<tr><td>5</td><td>172.16.35.123/19</td><td>network, broadcast</td></tr>
<tr><td>6</td><td>192.0.2.254/25</td><td>network, is .254 usable?</td></tr>
<tr><td>7</td><td>198.51.100.64/27</td><td>is it a valid host?</td></tr>
<tr><td>8</td><td>10.10.10.10/23</td><td>network, broadcast</td></tr></table>
<div class="tip"><p><b>Answers.</b> 1) block 16: net .96, bcast .111. 2) block 64: net 10.20.30.0, usable .1 to .62. 3) block 8: net 172.16.200.8, bcast .15. 4) block 4: net .128, usable .129 and .130, bcast .131. 5) third octet block 32: net 172.16.32.0, bcast 172.16.63.255. 6) block 128: net 192.0.2.128, bcast .255, so .254 is the last usable. 7) block 32: 64 is a multiple of 32, so it is the network address, not a valid host. 8) third octet block 2: 10 is even, net 10.10.10.0, bcast 10.10.11.255.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Taking the block size from the wrong octet (for /20 the block of 16 lives in the third octet, not the fourth). Writing the broadcast as the next network instead of next network minus one. Forgetting to set the octets to the right to 255 for the broadcast when the interesting octet is not the last.</p></div>

<div class="exam"><p><b>Exam trap.</b> Time is your enemy, not difficulty. Aim for about 20 seconds per "find the subnet" question. At the start of the exam, some candidates write the table of prefixes, masks and block sizes on the whiteboard they are given, so they never have to think about it again.</p></div>

<div class="scn"><h4>The camera that could not find its recorder</h4><p>A security integrator installed an IP camera at 10.20.30.70 with mask 255.255.255.192 and gateway 10.20.30.1, copied from the PC next to it. The camera could not reach the video recorder in the server VLAN. The network engineer did the block size check: /26 is a block of 64, .70 lives in .64 to .127, but the gateway .1 lives in .0 to .63. The camera was in the wrong subnet for that VLAN; its gateway was unreachable. The VLAN was actually 10.20.30.0/26, so the camera was re-addressed to 10.20.30.45.</p><p><b>Lesson:</b> the host and its gateway must fall in the same block. Check it in five seconds before you blame the network.</p></div>

<div class="iv"><p class="q">"Without paper, what subnet is 172.30.77.200/20 in?"</p><p>Strong answer: talk through it: /20 is 255.255.240.0, the interesting octet is the third, block size 256 − 240 = 16, multiples 64 and 80 surround 77, so the network is 172.30.64.0 and the broadcast is 172.30.79.255, hosts .64.1 to .79.254, 4094 of them. Interviewers want to hear the method named (block size or magic number), because it shows you can do it reliably under pressure.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Block size = 256 − mask value in the interesting octet.</li>
<li>Network = largest multiple of the block at or below the address; octets to the right become 0.</li>
<li>Broadcast = next multiple − 1; octets to the right become 255.</li>
<li>Two addresses are in the same subnet only if they fall in the same block.</li>
<li>Practise until each question takes about 20 seconds.</li>
</ul></div>
`,hi:`
<p>Ek lambi train socho jiske har compartment mein bilkul 64 seats hain: seats 0 se 63 compartment ek, 64 se 127 compartment do, aur aise hi aage. Agar aapke ticket par seat 77 likhi hai, to aapko turant pata chal jaata hai ki aap us compartment mein ho jo 64 se shuru hota hai aur 127 par khatam. Binary ki zaroorat nahi padi; sirf compartment ka size chahiye tha. Subnets compartments hain, aur unka size <b>block size</b> hai, jise <b>magic number</b> bhi kehte hain. Yahi method aap exam mein aur job par use karoge.</p>

<h3>Method paanch steps mein</h3>
<ol>
<li><b>Interesting octet</b> dhoondo: woh octet jahan mask na 255 hai na 0.</li>
<li><b>Block size</b> = 256 − us octet mein mask ki value. /26 → 256 − 192 = <b>64</b>.</li>
<li>Subnets us octet mein <b>block size ke multiples</b> par shuru hote hain: 0, 64, 128, 192.</li>
<li><b>Network</b> woh sabse bada multiple hai jo us octet mein address ki value ke barabar ya usse chhota ho. Right ke octets 0 ban jaate hain.</li>
<li><b>Broadcast</b> agla multiple minus 1 hai, aur right ke octets 255 ban jaate hain. First usable = network + 1, last usable = broadcast − 1.</li>
</ol>
<p>Step 4 karne ka tez tareeka: octet ko block size se divide karo, remainder phenk do, wapas multiply karo. 77 ÷ 64 = 1 remainder 13, to 1 × 64 = 64.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Number line par 64 ke blocks">
<text x="320" y="22" text-anchor="middle" class="svg-ink" font-size="14">/26: fourth octet mein block size 64</text>
<rect x="20" y="40" width="150" height="44" fill="#bae6fd"/><text x="95" y="67" text-anchor="middle" class="svg-ink" font-size="13">0 se 63</text>
<rect x="170" y="40" width="150" height="44" fill="#bbf7d0"/><text x="245" y="67" text-anchor="middle" class="svg-ink" font-size="13">64 se 127</text>
<rect x="320" y="40" width="150" height="44" fill="#fde68a"/><text x="395" y="67" text-anchor="middle" class="svg-ink" font-size="13">128 se 191</text>
<rect x="470" y="40" width="150" height="44" fill="#ddd6fe"/><text x="545" y="67" text-anchor="middle" class="svg-ink" font-size="13">192 se 255</text>
<line x1="351" y1="92" x2="351" y2="112" stroke="#64748b" stroke-width="2"/><text x="351" y="128" text-anchor="middle" class="svg-accent" font-size="13">.130 yahan rehta hai</text>
<text x="320" y="158" text-anchor="middle" class="svg-muted" font-size="12">network .128, broadcast .191, hosts .129 se .190</text>
</svg><p class="cap">Block size ke saath aap bina ek bhi bit likhe subnet boundaries dekh sakte ho.</p></div>

<div class="eg"><p><b>Worked example 1 (fourth octet): 192.168.10.100/28.</b> Mask 255.255.255.240, block 256 − 240 = 16. 16 ke multiples: ... 80, 96, 112 ... 100, 96 aur 112 ke beech aata hai. Network 192.168.10.96, broadcast 192.168.10.111, usable .97 se .110.</p></div>

<div class="eg"><p><b>Worked example 2 (third octet): 172.30.77.200/20.</b> Mask 255.255.240.0. Interesting octet third hai, block 256 − 240 = 16. Multiples: 48, 64, 80. 77, 64 se 79 mein aata hai. Network <b>172.30.64.0</b>, broadcast <b>172.30.79.255</b> (agla block 80 minus 1, fourth octet 255). First usable 172.30.64.1, last usable 172.30.79.254.</p></div>

<div class="eg"><p><b>Worked example 3 (second octet): 10.150.3.3/12.</b> Mask 255.240.0.0, interesting octet second hai, block 16. 150 ÷ 16 = 9 remainder 6, to 9 × 16 = 144. Network <b>10.144.0.0</b>, broadcast <b>10.159.255.255</b>, usable 10.144.0.1 se 10.159.255.254.</p></div>

<h3>Lab 1 ke do sawaal, tez tareeke se</h3>
<p><b>LAN-B broadcast.</b> LAN-B 192.168.50.128/26 hai: block 64, 128 se shuru hone wala block 128 + 64 − 1 = <b>192.168.50.191</b> par khatam hota hai. Lab bilkul yahi answer maangta hai. <b>Troubleshooting lab mein R1.</b> 10.20.30.1 ke saath 255.255.255.240: block 16, address 0 se 15 mein baitha hai, to R1 jis broadcast ko maanta hai woh <b>10.20.30.15</b> hai.</p>

<h3>"Same subnet?" sawaal</h3>
<p>Do hosts same subnet mein tabhi hain jab unke addresses same block mein aayein. /26 ke saath: 10.1.1.70, 64 se 127 mein hai, 10.1.1.130, 128 se 191 mein hai, to woh <b>alag</b> subnets mein hain aur unhe router chahiye. /25 ke saath dono kramshah 0 se 127 aur 128 se 255 mein honge: phir bhi alag. /24 ke saath woh saath honge.</p>

<h3>Speed drills (answers neeche)</h3>
<table class="cmp"><tr><th>#</th><th>Address</th><th>Nikalo</th></tr>
<tr><td>1</td><td>192.168.10.100/28</td><td>network, broadcast</td></tr>
<tr><td>2</td><td>10.20.30.50/26</td><td>network, usable range</td></tr>
<tr><td>3</td><td>172.16.200.9/29</td><td>network, broadcast</td></tr>
<tr><td>4</td><td>192.168.1.130/30</td><td>dono usable addresses</td></tr>
<tr><td>5</td><td>172.16.35.123/19</td><td>network, broadcast</td></tr>
<tr><td>6</td><td>192.0.2.254/25</td><td>network, kya .254 usable hai?</td></tr>
<tr><td>7</td><td>198.51.100.64/27</td><td>kya yeh valid host hai?</td></tr>
<tr><td>8</td><td>10.10.10.10/23</td><td>network, broadcast</td></tr></table>
<div class="tip"><p><b>Answers.</b> 1) block 16: net .96, bcast .111. 2) block 64: net 10.20.30.0, usable .1 se .62. 3) block 8: net 172.16.200.8, bcast .15. 4) block 4: net .128, usable .129 aur .130, bcast .131. 5) third octet block 32: net 172.16.32.0, bcast 172.16.63.255. 6) block 128: net 192.0.2.128, bcast .255, to .254 aakhri usable hai. 7) block 32: 64, 32 ka multiple hai, to yeh network address hai, valid host nahi. 8) third octet block 2: 10 even hai, net 10.10.10.0, bcast 10.10.11.255.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Block size galat octet se lena (/20 ke liye 16 ka block third octet mein rehta hai, fourth mein nahi). Broadcast ko agla network likh dena, agla network minus ek ki jagah. Jab interesting octet aakhri nahi hai to broadcast ke liye right ke octets ko 255 karna bhool jaana.</p></div>

<div class="exam"><p><b>Exam trap.</b> Aapka dushman time hai, difficulty nahi. Har "subnet nikalo" sawaal ke liye lagbhag 20 seconds ka target rakho. Exam ki shuruaat mein kuch candidates unhe diye gaye whiteboard par prefixes, masks aur block sizes ki table likh lete hain, taaki unhe dobara iske baare mein sochna na pade.</p></div>

<div class="scn"><h4>Woh camera jo apna recorder nahi dhoondh paaya</h4><p>Ek security integrator ne ek IP camera 10.20.30.70 par mask 255.255.255.192 aur gateway 10.20.30.1 ke saath install kiya, bagal wale PC se copy karke. Camera server VLAN mein video recorder tak nahi pahunch paaya. Network engineer ne block size check kiya: /26 64 ka block hai, .70, .64 se .127 mein rehta hai, par gateway .1, .0 se .63 mein rehta hai. Camera us VLAN ke galat subnet mein tha; uska gateway unreachable tha. VLAN asal mein 10.20.30.0/26 tha, isliye camera ko 10.20.30.45 par re-address kiya gaya.</p><p><b>Seekh:</b> host aur uska gateway same block mein hone chahiye. Network ko blame karne se pehle paanch second mein check karo.</p></div>

<div class="iv"><p class="q">"Bina paper ke batao, 172.30.77.200/20 kis subnet mein hai?"</p><p>Strong answer: bolkar samjhao: /20 matlab 255.255.240.0, interesting octet third, block size 256 − 240 = 16, multiples 64 aur 80 ke beech 77 hai, to network 172.30.64.0 aur broadcast 172.30.79.255, hosts .64.1 se .79.254, kul 4094. Interviewers method ka naam (block size ya magic number) sunna chahte hain, kyunki isse dikhta hai ki aap pressure mein bhi reliably kar sakte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Block size = 256 − interesting octet mein mask ki value.</li>
<li>Network = address ke barabar ya neeche block ka sabse bada multiple; right ke octets 0.</li>
<li>Broadcast = agla multiple − 1; right ke octets 255.</li>
<li>Do addresses same subnet mein tabhi hain jab woh same block mein aayein.</li>
<li>Itna practise karo ki har sawaal lagbhag 20 seconds le.</li>
</ul></div>
`}};export{e as default};