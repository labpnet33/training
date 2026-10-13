var e={id:`vlsm`,h:{en:`VLSM: right-sized subnets, allocated largest-first`,hi:`VLSM: sahi size ke subnets, largest-first allocate karke`},body:{en:`
<p>Equal-size subnetting is simple, but real networks are not equal. Engineering has 100 people, HR has 20, and a router link has exactly two ends. Giving each of them a /25 would waste most of the block. <b>VLSM</b>, <b>Variable Length Subnet Masking</b>, lets you use a different prefix for each subnet inside the same block, so every subnet is sized for its need.</p>

<h3>An analogy: packing a suitcase</h3>
<p>If you throw socks in first and then try to fit your shoes, the shoes do not fit in the gaps. Experienced travellers put the <b>big items in first</b>, then fill the remaining spaces with smaller ones. VLSM works the same way: allocate the largest subnet first, then the next largest, and so on. Big subnets must start on big boundaries; placing them first keeps every subnet aligned without any gaps.</p>

<h3>The VLSM procedure</h3>
<ol>
<li>List every subnet with its host requirement (include growth and the gateway).</li>
<li>Sort from <b>largest to smallest</b>.</li>
<li>For each, choose the smallest prefix whose 2<sup>h</sup> − 2 covers it.</li>
<li>Allocate it at the next free address, which will always be on a valid boundary if you go largest-first.</li>
<li>Record network, usable range and broadcast; the next subnet starts at broadcast + 1.</li>
</ol>

<div class="eg"><p><b>Worked example: 172.16.10.0/24 for one site.</b> Needs: Engineering 100 hosts, Sales 50, HR 20, Printers 10, and two router links (WAN1, WAN2) of 2 hosts each.</p>
<table class="cmp"><tr><th>Subnet</th><th>Need</th><th>Prefix (usable)</th><th>Network</th><th>Usable range</th><th>Broadcast</th></tr>
<tr><td>Engineering</td><td>100</td><td>/25 (126)</td><td>172.16.10.0</td><td>.1 – .126</td><td>.127</td></tr>
<tr><td>Sales</td><td>50</td><td>/26 (62)</td><td>172.16.10.128</td><td>.129 – .190</td><td>.191</td></tr>
<tr><td>HR</td><td>20</td><td>/27 (30)</td><td>172.16.10.192</td><td>.193 – .222</td><td>.223</td></tr>
<tr><td>Printers</td><td>10</td><td>/28 (14)</td><td>172.16.10.224</td><td>.225 – .238</td><td>.239</td></tr>
<tr><td>WAN1</td><td>2</td><td>/30 (2)</td><td>172.16.10.240</td><td>.241 – .242</td><td>.243</td></tr>
<tr><td>WAN2</td><td>2</td><td>/30 (2)</td><td>172.16.10.244</td><td>.245 – .246</td><td>.247</td></tr>
<tr><td>Free</td><td></td><td>/29</td><td>172.16.10.248</td><td colspan="2">spare for future links or a small segment</td></tr>
</table>
<p>With equal /25s you could have served only two of these six needs. VLSM fits all six and still leaves a /29.</p></div>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="VLSM allocation of 172.16.10.0/24">
<rect x="20" y="40" width="300" height="44" fill="#bae6fd"/><text x="170" y="60" text-anchor="middle" class="svg-ink" font-size="13">Engineering /25</text><text x="170" y="77" text-anchor="middle" class="svg-muted" font-size="12">.0 – .127</text>
<rect x="320" y="40" width="150" height="44" fill="#bbf7d0"/><text x="395" y="60" text-anchor="middle" class="svg-ink" font-size="13">Sales /26</text><text x="395" y="77" text-anchor="middle" class="svg-muted" font-size="12">.128 – .191</text>
<rect x="470" y="40" width="75" height="44" fill="#ddd6fe"/><text x="507" y="60" text-anchor="middle" class="svg-ink" font-size="12">HR /27</text><text x="507" y="77" text-anchor="middle" class="svg-muted" font-size="11">.192</text>
<rect x="545" y="40" width="38" height="44" fill="#fde68a"/><text x="564" y="66" text-anchor="middle" class="svg-ink" font-size="11">/28</text>
<rect x="583" y="40" width="9" height="44" fill="#fed7aa"/><rect x="592" y="40" width="9" height="44" fill="#fed7aa"/>
<rect x="601" y="40" width="19" height="44" fill="#e2e8f0"/>
<text x="596" y="104" text-anchor="middle" class="svg-muted" font-size="11">/30s + free /29</text>
<text x="320" y="132" text-anchor="middle" class="svg-accent" font-size="13">Largest first: every block lands on its own boundary</text>
</svg><p class="cap">One /24 cut into six different sizes with no overlap and no stranded gaps.</p></div>

<h3>Why largest-first matters</h3>
<p>A subnet can only start on a multiple of its own block size. A /25 must start at .0 or .128. If you place a /30 at .0 first, the /25 can no longer start at .0 and must jump to .128, and everything else has to squeeze around the fragments. Going largest-first guarantees each allocation begins on a legal boundary because every earlier block was a multiple of the later, smaller ones.</p>

<h3>Drill: re-plan the branch with VLSM</h3>
<p>Suppose the branch from the labs, 192.168.50.0/24, had Sales 50 hosts, HR 25, IT 12 and one link to a WAN router. Try it, then check:</p>
<table class="cmp"><tr><th>Subnet</th><th>Prefix</th><th>Network</th><th>Usable</th><th>Broadcast</th></tr>
<tr><td>Sales (50)</td><td>/26</td><td>192.168.50.0</td><td>.1 – .62</td><td>.63</td></tr>
<tr><td>HR (25)</td><td>/27</td><td>192.168.50.64</td><td>.65 – .94</td><td>.95</td></tr>
<tr><td>IT (12)</td><td>/28</td><td>192.168.50.96</td><td>.97 – .110</td><td>.111</td></tr>
<tr><td>WAN link</td><td>/30</td><td>192.168.50.112</td><td>.113 – .114</td><td>.115</td></tr>
</table>
<p>Everything from .116 to .255 stays free, almost half the block, compared with only one spare /26 in the equal-size design used by the lab. The lab keeps equal /26s because they are simpler to operate; VLSM is the tool when space is tight.</p>

<h3>What VLSM needs from the network</h3>
<p>Every router must know each subnet's exact prefix. Static routes, OSPF, EIGRP, IS-IS, BGP and RIPv2 all carry the mask with the route (they are <b>classless</b>); the old RIPv1 did not, which is one reason it disappeared. You configure those in the routing module.</p>

<div class="warn"><p><b>Common mistakes.</b> Allocating in the order people ask (smallest team first) and creating misaligned subnets, and overlapping: giving HR 192.168.50.64/26 while IT already has 192.168.50.96/28 inside it. A Cisco-style router refuses the second interface with a message such as <code>% 192.168.50.64 overlaps with GigabitEthernet0/1</code>.</p></div>

<div class="exam"><p><b>Exam trap.</b> Given a VLSM table, questions ask "which subnet can the next 60-host department use?" Look for a free, <b>aligned</b> /26: its network must be a multiple of 64. A free range starting at .112 is not a valid /26 even if 64 addresses remain after it.</p></div>

<div class="scn"><h4>Two sites, one overlapping /27</h4><p>A company planned sites A and B from 10.8.0.0/24 by hand. Site A got 10.8.0.0/25. Weeks later someone gave site B's servers 10.8.0.96/27, not noticing that .96 – .127 was inside site A's /25. Both routers advertised their subnets in OSPF; traffic for the servers followed the longer /27 to site B, while site A users with addresses in .96 – .127 became unreachable from everywhere else. The fix was a proper VLSM table: site B moved to 10.8.0.128/27 and the team started keeping one spreadsheet of allocations.</p><p><b>Lesson:</b> VLSM saves space but demands a single source of truth. Overlaps do not always error; sometimes they silently steal traffic.</p></div>

<div class="iv"><p class="q">"What is VLSM, and why do you allocate the largest subnets first?"</p><p>Strong answer: VLSM means using different prefix lengths inside one major block so each segment is right-sized: /25 for a big LAN, /30 or /31 for links. Allocating largest-first keeps every subnet on a valid boundary, because a subnet must start on a multiple of its block size, and it prevents fragmentation. Mention that it requires classless routing and good IPAM documentation.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VLSM uses different prefixes inside one block so every subnet fits its need.</li>
<li>Sort needs largest to smallest; choose the smallest prefix that fits each; allocate at the next free boundary.</li>
<li>Next subnet starts at the previous broadcast + 1.</li>
<li>Overlaps are the classic VLSM failure; keep one allocation table.</li>
<li>VLSM requires classless routing (static, OSPF, EIGRP, BGP, RIPv2).</li>
</ul></div>
`,hi:`
<p>Barabar size ki subnetting simple hai, lekin real networks barabar nahi hote. Engineering mein 100 log hain, HR mein 20, aur router link ke theek do sire hote hain. In sabko /25 dena block ka zyada hissa waste kar dega. <b>VLSM</b>, <b>Variable Length Subnet Masking</b>, aapko ek hi block ke andar har subnet ke liye alag prefix use karne deta hai, taaki har subnet apni zaroorat ke size ka ho.</p>

<h3>Ek analogy: suitcase pack karna</h3>
<p>Agar aap pehle socks daalo aur phir shoes fit karne ki koshish karo, to shoes gaps mein fit nahi hote. Experienced travellers <b>bade saamaan pehle</b> rakhte hain, phir bachi jagah chhoti cheezon se bharte hain. VLSM aise hi kaam karta hai: sabse bada subnet pehle allocate karo, phir usse chhota, aur aage. Bade subnets ko bade boundaries par shuru hona hota hai; unhe pehle rakhne se har subnet bina gaps ke aligned rehta hai.</p>

<h3>VLSM procedure</h3>
<ol>
<li>Har subnet ko uski host requirement ke saath list karo (growth aur gateway samet).</li>
<li><b>Sabse bade se sabse chhote</b> tak sort karo.</li>
<li>Har ek ke liye sabse chhota prefix chuno jiska 2<sup>h</sup> − 2 use cover kare.</li>
<li>Use agle free address par allocate karo, jo largest-first chalne par hamesha valid boundary par hoga.</li>
<li>Network, usable range aur broadcast record karo; agla subnet broadcast + 1 se shuru hota hai.</li>
</ol>

<div class="eg"><p><b>Worked example: ek site ke liye 172.16.10.0/24.</b> Zaroorat: Engineering 100 hosts, Sales 50, HR 20, Printers 10, aur do router links (WAN1, WAN2) jinmein 2-2 hosts.</p>
<table class="cmp"><tr><th>Subnet</th><th>Zaroorat</th><th>Prefix (usable)</th><th>Network</th><th>Usable range</th><th>Broadcast</th></tr>
<tr><td>Engineering</td><td>100</td><td>/25 (126)</td><td>172.16.10.0</td><td>.1 – .126</td><td>.127</td></tr>
<tr><td>Sales</td><td>50</td><td>/26 (62)</td><td>172.16.10.128</td><td>.129 – .190</td><td>.191</td></tr>
<tr><td>HR</td><td>20</td><td>/27 (30)</td><td>172.16.10.192</td><td>.193 – .222</td><td>.223</td></tr>
<tr><td>Printers</td><td>10</td><td>/28 (14)</td><td>172.16.10.224</td><td>.225 – .238</td><td>.239</td></tr>
<tr><td>WAN1</td><td>2</td><td>/30 (2)</td><td>172.16.10.240</td><td>.241 – .242</td><td>.243</td></tr>
<tr><td>WAN2</td><td>2</td><td>/30 (2)</td><td>172.16.10.244</td><td>.245 – .246</td><td>.247</td></tr>
<tr><td>Free</td><td></td><td>/29</td><td>172.16.10.248</td><td colspan="2">future links ya chhote segment ke liye spare</td></tr>
</table>
<p>Barabar /25s se aap in chhe mein se sirf do zarooratein poori kar paate. VLSM chhe ki chhe fit karta hai aur phir bhi ek /29 bachata hai.</p></div>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="172.16.10.0/24 ka VLSM allocation">
<rect x="20" y="40" width="300" height="44" fill="#bae6fd"/><text x="170" y="60" text-anchor="middle" class="svg-ink" font-size="13">Engineering /25</text><text x="170" y="77" text-anchor="middle" class="svg-muted" font-size="12">.0 – .127</text>
<rect x="320" y="40" width="150" height="44" fill="#bbf7d0"/><text x="395" y="60" text-anchor="middle" class="svg-ink" font-size="13">Sales /26</text><text x="395" y="77" text-anchor="middle" class="svg-muted" font-size="12">.128 – .191</text>
<rect x="470" y="40" width="75" height="44" fill="#ddd6fe"/><text x="507" y="60" text-anchor="middle" class="svg-ink" font-size="12">HR /27</text><text x="507" y="77" text-anchor="middle" class="svg-muted" font-size="11">.192</text>
<rect x="545" y="40" width="38" height="44" fill="#fde68a"/><text x="564" y="66" text-anchor="middle" class="svg-ink" font-size="11">/28</text>
<rect x="583" y="40" width="9" height="44" fill="#fed7aa"/><rect x="592" y="40" width="9" height="44" fill="#fed7aa"/>
<rect x="601" y="40" width="19" height="44" fill="#e2e8f0"/>
<text x="596" y="104" text-anchor="middle" class="svg-muted" font-size="11">/30s + free /29</text>
<text x="320" y="132" text-anchor="middle" class="svg-accent" font-size="13">Largest first: har block apni boundary par aata hai</text>
</svg><p class="cap">Ek /24 chhe alag sizes mein kata hua, bina overlap aur bina bekaar gaps ke.</p></div>

<h3>Largest-first kyun matter karta hai</h3>
<p>Subnet sirf apne block size ke multiple par shuru ho sakta hai. /25 ko .0 ya .128 par shuru hona hai. Agar aap pehle .0 par /30 rakh do, to /25 ab .0 par shuru nahi ho sakta aur use .128 par jaana padega, aur baaki sab ko tukdon ke aas-paas ghusna padega. Largest-first chalne se guarantee hai ki har allocation legal boundary par shuru ho, kyunki har pehle wala block baad wale chhote blocks ka multiple tha.</p>

<h3>Drill: branch ko VLSM se re-plan karo</h3>
<p>Maano labs wali branch, 192.168.50.0/24, mein Sales 50 hosts, HR 25, IT 12 aur WAN router tak ek link hai. Khud try karo, phir check karo:</p>
<table class="cmp"><tr><th>Subnet</th><th>Prefix</th><th>Network</th><th>Usable</th><th>Broadcast</th></tr>
<tr><td>Sales (50)</td><td>/26</td><td>192.168.50.0</td><td>.1 – .62</td><td>.63</td></tr>
<tr><td>HR (25)</td><td>/27</td><td>192.168.50.64</td><td>.65 – .94</td><td>.95</td></tr>
<tr><td>IT (12)</td><td>/28</td><td>192.168.50.96</td><td>.97 – .110</td><td>.111</td></tr>
<tr><td>WAN link</td><td>/30</td><td>192.168.50.112</td><td>.113 – .114</td><td>.115</td></tr>
</table>
<p>.116 se .255 tak sab free rehta hai, lagbhag aadha block, jabki lab ke barabar-size design mein sirf ek spare /26 hai. Lab barabar /26s rakhti hai kyunki unhe chalana aasaan hai; jab jagah kam ho tab VLSM tool hai.</p>

<h3>VLSM ko network se kya chahiye</h3>
<p>Har router ko har subnet ka exact prefix pata hona chahiye. Static routes, OSPF, EIGRP, IS-IS, BGP aur RIPv2 sab route ke saath mask le jaate hain (yeh <b>classless</b> hain); purana RIPv1 nahi le jaata tha, jo uske gayab hone ki ek wajah hai. Inhe aap routing module mein configure karoge.</p>

<div class="warn"><p><b>Common galtiyan.</b> Us order mein allocate karna jis order mein log maangte hain (sabse chhoti team pehle) aur misaligned subnets bana dena, aur overlap: HR ko 192.168.50.64/26 dena jabki IT ke paas pehle se uske andar 192.168.50.96/28 hai. Cisco-style router doosre interface ko <code>% 192.168.50.64 overlaps with GigabitEthernet0/1</code> jaise message ke saath reject karta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> VLSM table dekar questions poochte hain "agla 60-host department kaunsa subnet use kar sakta hai?" Ek free, <b>aligned</b> /26 dhoondo: uska network 64 ka multiple hona chahiye. .112 se shuru hone wali free range valid /26 nahi hai bhale hi uske baad 64 addresses bache hon.</p></div>

<div class="scn"><h4>Do sites, ek overlapping /27</h4><p>Ek company ne sites A aur B ko 10.8.0.0/24 se haath se plan kiya. Site A ko 10.8.0.0/25 mila. Hafton baad kisi ne site B ke servers ko 10.8.0.96/27 de diya, bina dhyan diye ki .96 – .127 site A ke /25 ke andar tha. Dono routers ne OSPF mein apne subnets advertise kiye; servers ka traffic lambe /27 ke peeche site B gaya, jabki .96 – .127 addresses wale site A users baaki har jagah se unreachable ho gaye. Fix ek proper VLSM table tha: site B 10.8.0.128/27 par gayi aur team ne allocations ki ek spreadsheet rakhni shuru ki.</p><p><b>Seekh:</b> VLSM jagah bachata hai lekin ek single source of truth maangta hai. Overlaps hamesha error nahi dete; kabhi kabhi chup-chaap traffic chura lete hain.</p></div>

<div class="iv"><p class="q">"VLSM kya hai, aur aap sabse bade subnets pehle kyun allocate karte ho?"</p><p>Strong answer: VLSM matlab ek major block ke andar alag prefix lengths use karna taaki har segment sahi size ka ho: bade LAN ke liye /25, links ke liye /30 ya /31. Largest-first allocate karne se har subnet valid boundary par rehta hai, kyunki subnet ko apne block size ke multiple par shuru hona hota hai, aur fragmentation nahi hota. Batao ki iske liye classless routing aur achhi IPAM documentation chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VLSM ek block ke andar alag prefixes use karta hai taaki har subnet apni zaroorat mein fit ho.</li>
<li>Zarooratein bade se chhote sort karo; har ek ke liye sabse chhota fit hone wala prefix chuno; agli free boundary par allocate karo.</li>
<li>Agla subnet pichhle broadcast + 1 se shuru hota hai.</li>
<li>Overlaps classic VLSM failure hain; ek allocation table rakho.</li>
<li>VLSM ko classless routing chahiye (static, OSPF, EIGRP, BGP, RIPv2).</li>
</ul></div>
`}};export{e as default};