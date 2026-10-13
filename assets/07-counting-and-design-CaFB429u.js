var e={id:`counting`,h:{en:`Counting hosts and subnets: design from requirements`,hi:`Hosts aur subnets ginna: requirements se design`},body:{en:`
<p>So far you have taken an address and found its subnet. Real work usually runs the other way: someone says "we need six departments of about 400 users each; here is 10.10.0.0/16", and you must choose the prefix. This chapter gives you the two formulas and the habit of checking both directions.</p>

<h3>An analogy: cutting a cake</h3>
<p>A cake is a fixed size. Cut it into more pieces and each piece gets smaller; cut it into fewer and each piece gets bigger. An address block is the cake. Every bit you move from the host part into the network part (called <b>borrowing</b> a bit) <b>doubles the number of subnets</b> and <b>halves the size of each one</b>. Your job is to find the cut that gives enough pieces and pieces big enough.</p>

<div class="dia"><svg viewBox="0 0 640 160" role="img" aria-label="Borrowing bits from the host part">
<rect x="20" y="40" width="360" height="44" rx="6" fill="#bae6fd"/><text x="200" y="67" text-anchor="middle" class="svg-ink" font-size="13">Original network bits (/24)</text>
<rect x="384" y="40" width="60" height="44" rx="6" fill="#fde68a"/><text x="414" y="67" text-anchor="middle" class="svg-ink" font-size="13">s = 2</text>
<rect x="448" y="40" width="172" height="44" rx="6" fill="#bbf7d0"/><text x="534" y="67" text-anchor="middle" class="svg-ink" font-size="13">h = 6 host bits</text>
<text x="414" y="108" text-anchor="middle" class="svg-accent" font-size="12">2^2 = 4 subnets</text>
<text x="534" y="128" text-anchor="middle" class="svg-accent" font-size="12">2^6 − 2 = 62 hosts</text>
<text x="200" y="108" text-anchor="middle" class="svg-muted" font-size="12">192.168.50</text>
</svg><p class="cap">Borrow 2 bits from a /24 and you get the lab's four /26 subnets of 62 hosts.</p></div>

<h3>The two formulas</h3>
<ul>
<li><b>Number of subnets</b> = 2<sup>s</sup>, where <b>s</b> = bits borrowed = new prefix − original prefix.</li>
<li><b>Usable hosts per subnet</b> = 2<sup>h</sup> − 2, where <b>h</b> = host bits = 32 − new prefix.</li>
</ul>
<p>Older textbooks used 2<sup>s</sup> − 2 for subnets, because the first and last subnets ("subnet zero" and the all-ones subnet) were once avoided. Modern equipment uses them freely (Cisco IOS has done so by default for decades), and Network+ expects 2<sup>s</sup>.</p>

<h3>Designing from a requirement</h3>
<ol>
<li>If the requirement is a <b>number of subnets N</b>, find the smallest s with 2<sup>s</sup> ≥ N.</li>
<li>If it is a <b>number of hosts H</b>, find the smallest h with 2<sup>h</sup> − 2 ≥ H.</li>
<li>Convert to a prefix, then <b>check the other constraint</b> still holds.</li>
<li>List the subnets with the block size.</li>
</ol>

<div class="eg"><p><b>Worked example 1: six subnets from 10.10.0.0/16.</b> 2<sup>2</sup> = 4 is too few, 2<sup>3</sup> = 8 is enough, so s = 3 and the prefix is /19 (255.255.224.0). Block 32 in the third octet: 10.10.0.0, 10.10.32.0, 10.10.64.0 … 10.10.224.0, eight subnets. Hosts each: h = 13, 2<sup>13</sup> − 2 = <b>8190</b>. Two subnets are spare.</p>
<p><b>Worked example 2: at least 500 hosts per subnet from 172.16.0.0/16.</b> 2<sup>8</sup> − 2 = 254 is too few; 2<sup>9</sup> − 2 = 510 is enough. h = 9 → prefix /23 (255.255.254.0). Block 2 in the third octet: 172.16.0.0/23, 172.16.2.0/23, 172.16.4.0/23 … 2<sup>7</sup> = <b>128</b> subnets.</p>
<p><b>Worked example 3: the lab.</b> 192.168.50.0/24 must give at least three subnets of 50 hosts. For hosts, h = 6 (62 ≥ 50) → /26. Check subnets: s = 2 → 4 ≥ 3. Both constraints pass. /27 would give 8 subnets but only 30 hosts; /25 would give 126 hosts but only 2 subnets. <b>/26</b> is the only answer.</p></div>

<h3>Leave room to grow</h3>
<p>If a department has exactly 30 people today, /27 (30 hosts) is full on day one, before counting the printer, the access point and next month's hire. Good designers add 20–30% headroom and remember that the gateway also consumes an address. In the lab, each /26 holds 62 addresses for a department far smaller than that, and a whole /26 is kept for growth.</p>

<h3>Drills</h3>
<table class="cmp"><tr><th>Requirement</th><th>Answer</th></tr>
<tr><td>Smallest subnet for 25 hosts</td><td>/27 (30 hosts)</td></tr>
<tr><td>Smallest subnet for 62 hosts; for 63 hosts</td><td>/26 (62); /25 (126)</td></tr>
<tr><td>Smallest subnet for 1000 hosts</td><td>/22 (1022 hosts)</td></tr>
<tr><td>Router-to-router link</td><td>/30 (2 hosts), or /31 where supported</td></tr>
<tr><td>10 equal subnets from a /24</td><td>s = 4 → /28, 16 subnets of 14 hosts</td></tr>
<tr><td>How many /27s fit in a /24?</td><td>2<sup>3</sup> = 8</td></tr>
<tr><td>How many /30s fit in a /24?</td><td>2<sup>6</sup> = 64</td></tr>
<tr><td>How many /24s fit in a /16?</td><td>2<sup>8</sup> = 256</td></tr>
</table>

<div class="warn"><p><b>Common mistakes.</b> Satisfying only one constraint: choosing /28 for "ten subnets" and never checking that each also needs 20 hosts. And forgetting the −2 on hosts: 32 addresses do not hold 32 hosts.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Which mask supports 30 hosts per subnet and the most subnets?" /27 gives exactly 30 usable hosts and is the answer; /26 also works but yields fewer subnets. Words like <i>most subnets</i> or <i>fewest wasted addresses</i> tell you to pick the longest prefix that still fits.</p></div>

<div class="scn"><h4>The phones that could not get an address</h4><p>A branch installed 40 new IP phones in a voice VLAN planned as 10.60.5.0/27 "because the team has 25 people". On day one, fifteen phones showed no registration and 169.254.x.x in their network menus. The DHCP server logs showed the pool exhausted: a /27 has only 30 usable addresses, minus the gateway. The engineer re-planned the voice VLAN as 10.60.5.0/26 (62 hosts), widened the scope and the gateway mask together, and every phone registered.</p><p><b>Lesson:</b> size subnets for devices, not people, and add headroom. A full subnet shows up as APIPA addresses on the clients that lost the race.</p></div>

<div class="iv"><p class="q">"From 192.168.1.0/24, I need 12 subnets with at least 12 hosts each. Design it."</p><p>Strong answer: 12 subnets needs s = 4 (16 subnets); 12 hosts needs h = 4 (14 usable). 4 + 4 = 8 bits, exactly the host octet of a /24, so /28 (255.255.255.240) works: 16 subnets of 14 hosts, block 16, starting .0, .16, .32 and so on. Point out there is no headroom in either direction, and ask whether a bigger block or VLSM is possible.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Subnets = 2<sup>s</sup> (bits borrowed); hosts = 2<sup>h</sup> − 2 (host bits left).</li>
<li>Each borrowed bit doubles the subnets and halves the hosts per subnet.</li>
<li>Pick the prefix from the tightest requirement, then check the other one.</li>
<li>Plan headroom: devices, gateway and growth, not just today's headcount.</li>
<li>Modern networks use subnet zero; use 2<sup>s</sup>, not 2<sup>s</sup> − 2.</li>
</ul></div>
`,hi:`
<p>Ab tak aapne ek address lekar uska subnet nikaala. Asli kaam aksar ulta chalta hai: koi kehta hai "humein lagbhag 400 users ke chhe departments chahiye; yeh raha 10.10.0.0/16", aur aapko prefix chunna hai. Yeh chapter aapko do formulas aur dono taraf check karne ki aadat deta hai.</p>

<h3>Ek analogy: cake kaatna</h3>
<p>Cake ka size fixed hai. Zyada tukde karo to har tukda chhota hota hai; kam karo to har tukda bada. Address block cake hai. Host part se network part mein le jaaya gaya har bit (ise bit <b>borrow</b> karna kehte hain) <b>subnets ki ginti double</b> aur <b>har ek ka size aadha</b> kar deta hai. Aapka kaam woh cut dhoondhna hai jo kaafi tukde de aur tukde kaafi bade hon.</p>

<div class="dia"><svg viewBox="0 0 640 160" role="img" aria-label="Host part se bits borrow karna">
<rect x="20" y="40" width="360" height="44" rx="6" fill="#bae6fd"/><text x="200" y="67" text-anchor="middle" class="svg-ink" font-size="13">Original network bits (/24)</text>
<rect x="384" y="40" width="60" height="44" rx="6" fill="#fde68a"/><text x="414" y="67" text-anchor="middle" class="svg-ink" font-size="13">s = 2</text>
<rect x="448" y="40" width="172" height="44" rx="6" fill="#bbf7d0"/><text x="534" y="67" text-anchor="middle" class="svg-ink" font-size="13">h = 6 host bits</text>
<text x="414" y="108" text-anchor="middle" class="svg-accent" font-size="12">2^2 = 4 subnets</text>
<text x="534" y="128" text-anchor="middle" class="svg-accent" font-size="12">2^6 − 2 = 62 hosts</text>
<text x="200" y="108" text-anchor="middle" class="svg-muted" font-size="12">192.168.50</text>
</svg><p class="cap">/24 se 2 bits borrow karo aur aapko lab ke 62 hosts wale chaar /26 subnets milte hain.</p></div>

<h3>Do formulas</h3>
<ul>
<li><b>Subnets ki ginti</b> = 2<sup>s</sup>, jahan <b>s</b> = borrow kiye bits = naya prefix − original prefix.</li>
<li><b>Har subnet mein usable hosts</b> = 2<sup>h</sup> − 2, jahan <b>h</b> = host bits = 32 − naya prefix.</li>
</ul>
<p>Purani textbooks subnets ke liye 2<sup>s</sup> − 2 use karti thi, kyunki pehla aur aakhri subnet ("subnet zero" aur all-ones subnet) kabhi avoid kiye jaate the. Modern equipment inhe aaram se use karta hai (Cisco IOS dashakon se default mein aisa karta hai), aur Network+ 2<sup>s</sup> expect karta hai.</p>

<h3>Requirement se design karna</h3>
<ol>
<li>Agar requirement <b>N subnets</b> ki hai, sabse chhota s dhoondo jisme 2<sup>s</sup> ≥ N.</li>
<li>Agar <b>H hosts</b> ki hai, sabse chhota h dhoondo jisme 2<sup>h</sup> − 2 ≥ H.</li>
<li>Prefix mein badlo, phir <b>doosri condition check karo</b> ki woh bhi poori ho rahi hai.</li>
<li>Block size se subnets ki list banao.</li>
</ol>

<div class="eg"><p><b>Worked example 1: 10.10.0.0/16 se chhe subnets.</b> 2<sup>2</sup> = 4 kam hai, 2<sup>3</sup> = 8 kaafi hai, to s = 3 aur prefix /19 (255.255.224.0). Teesre octet mein block 32: 10.10.0.0, 10.10.32.0, 10.10.64.0 … 10.10.224.0, aath subnets. Har ek mein hosts: h = 13, 2<sup>13</sup> − 2 = <b>8190</b>. Do subnets spare hain.</p>
<p><b>Worked example 2: 172.16.0.0/16 se har subnet mein kam se kam 500 hosts.</b> 2<sup>8</sup> − 2 = 254 kam hai; 2<sup>9</sup> − 2 = 510 kaafi hai. h = 9 → prefix /23 (255.255.254.0). Teesre octet mein block 2: 172.16.0.0/23, 172.16.2.0/23, 172.16.4.0/23 … 2<sup>7</sup> = <b>128</b> subnets.</p>
<p><b>Worked example 3: lab.</b> 192.168.50.0/24 se kam se kam 50 hosts ke teen subnets chahiye. Hosts ke liye h = 6 (62 ≥ 50) → /26. Subnets check karo: s = 2 → 4 ≥ 3. Dono conditions pass. /27 8 subnets deta lekin sirf 30 hosts; /25 126 hosts deta lekin sirf 2 subnets. <b>/26</b> hi ek answer hai.</p></div>

<h3>Badhne ki jagah chhodo</h3>
<p>Agar aaj department mein theek 30 log hain, to /27 (30 hosts) pehle din hi full hai, printer, access point aur agle mahine ki hiring gine bina. Achhe designers 20–30% headroom jodte hain aur yaad rakhte hain ki gateway bhi ek address leta hai. Lab mein har /26 62 addresses rakhta hai ek bahut chhote department ke liye, aur ek poora /26 growth ke liye rakha hai.</p>

<h3>Drills</h3>
<table class="cmp"><tr><th>Requirement</th><th>Answer</th></tr>
<tr><td>25 hosts ke liye sabse chhota subnet</td><td>/27 (30 hosts)</td></tr>
<tr><td>62 hosts ke liye sabse chhota subnet; 63 hosts ke liye</td><td>/26 (62); /25 (126)</td></tr>
<tr><td>1000 hosts ke liye sabse chhota subnet</td><td>/22 (1022 hosts)</td></tr>
<tr><td>Router-to-router link</td><td>/30 (2 hosts), ya jahan support ho wahan /31</td></tr>
<tr><td>/24 se 10 barabar subnets</td><td>s = 4 → /28, 14 hosts ke 16 subnets</td></tr>
<tr><td>Ek /24 mein kitne /27 aate hain?</td><td>2<sup>3</sup> = 8</td></tr>
<tr><td>Ek /24 mein kitne /30 aate hain?</td><td>2<sup>6</sup> = 64</td></tr>
<tr><td>Ek /16 mein kitne /24 aate hain?</td><td>2<sup>8</sup> = 256</td></tr>
</table>

<div class="warn"><p><b>Common galtiyan.</b> Sirf ek condition poori karna: "das subnets" ke liye /28 chun lena aur kabhi check na karna ki har ek ko 20 hosts bhi chahiye. Aur hosts par −2 bhool jaana: 32 addresses mein 32 hosts nahi aate.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Kaunsa mask har subnet mein 30 hosts aur sabse zyada subnets support karta hai?" /27 theek 30 usable hosts deta hai aur yahi answer hai; /26 bhi chalega lekin kam subnets deta hai. <i>Most subnets</i> ya <i>fewest wasted addresses</i> jaise shabd batate hain ki sabse lamba prefix chuno jo phir bhi fit ho.</p></div>

<div class="scn"><h4>Phones jinhe address nahi mila</h4><p>Ek branch ne voice VLAN mein 40 naye IP phones lagaye jo 10.60.5.0/27 plan kiya gaya tha "kyunki team mein 25 log hain". Pehle din pandrah phones registration nahi dikha rahe the aur unke network menu mein 169.254.x.x tha. DHCP server logs ne pool exhausted dikhaya: /27 mein sirf 30 usable addresses hain, gateway minus karke. Engineer ne voice VLAN ko 10.60.5.0/26 (62 hosts) par re-plan kiya, scope aur gateway mask saath mein badhaye, aur har phone register ho gaya.</p><p><b>Seekh:</b> subnets devices ke hisaab se size karo, logon ke hisaab se nahi, aur headroom jodo. Full subnet un clients par APIPA addresses ke roop mein dikhta hai jo race haar gaye.</p></div>

<div class="iv"><p class="q">"192.168.1.0/24 se mujhe 12 subnets chahiye jinmein har ek mein kam se kam 12 hosts hon. Design karo."</p><p>Strong answer: 12 subnets ke liye s = 4 (16 subnets); 12 hosts ke liye h = 4 (14 usable). 4 + 4 = 8 bits, bilkul /24 ka host octet, to /28 (255.255.255.240) chalta hai: 14 hosts ke 16 subnets, block 16, .0, .16, .32 aur aage se shuru. Batao ki kisi bhi taraf headroom nahi hai, aur poocho ki kya bada block ya VLSM possible hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Subnets = 2<sup>s</sup> (borrow kiye bits); hosts = 2<sup>h</sup> − 2 (bache host bits).</li>
<li>Har borrow kiya bit subnets double aur har subnet ke hosts aadhe karta hai.</li>
<li>Sabse tight requirement se prefix chuno, phir doosri check karo.</li>
<li>Headroom plan karo: devices, gateway aur growth, sirf aaj ka headcount nahi.</li>
<li>Modern networks subnet zero use karte hain; 2<sup>s</sup> use karo, 2<sup>s</sup> − 2 nahi.</li>
</ul></div>
`}};export{e as default};