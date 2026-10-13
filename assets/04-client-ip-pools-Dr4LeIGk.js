var e={id:`client-ip-pools`,h:{en:`Client IP pools: minimum /23, reserved ranges and sizing`,hi:`Client IP pools: minimum /23, reserved ranges aur sizing`},body:{en:`
<p>Every connected laptop and phone needs an IP address inside the tunnel. That address comes from the <b>client IP pool</b> you define. A pool that is too small, or that overlaps another network, causes some of the most common mobile user outages.</p>

<h3>Analogy: parking tokens at a stadium</h3>
<p>A stadium prints a fixed number of parking tokens. When all tokens are used, the next car cannot enter, even if the gate and the guard are fine. A client IP pool is the stock of tokens: when it is exhausted, a new user authenticates successfully but gets no address.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Pool split into blocks">
<rect x="20" y="30" width="600" height="44" rx="6" fill="#fde68a"/><text x="320" y="58" text-anchor="middle" class="svg-ink" font-size="13">Pool 10.200.0.0/23 (512 addresses)</text>
<rect x="20" y="100" width="290" height="44" rx="6" fill="#bae6fd"/><text x="165" y="127" text-anchor="middle" class="svg-ink" font-size="12">Block 10.200.0.0/24</text>
<rect x="330" y="100" width="290" height="44" rx="6" fill="#bbf7d0"/><text x="475" y="127" text-anchor="middle" class="svg-ink" font-size="12">Block 10.200.1.0/24</text>
<line x1="165" y1="74" x2="165" y2="100" stroke="#64748b"/><line x1="475" y1="74" x2="475" y2="100" stroke="#64748b"/>
<text x="320" y="180" text-anchor="middle" class="svg-muted" font-size="12">Addresses are handed out in /24 blocks per gateway</text>
</svg><p class="cap">The lab pool is the minimum allowed size: a /23, which is two /24 blocks.</p></div>

<h3>The rules</h3>
<ul>
<li><b>Minimum size:</b> custom pools need at least a <b>/23 per location</b>. (On Panorama the text speaks of a pool per Worldwide or regional setting.)</li>
<li><b>Default:</b> in SCM the default pool is 100.127.0.0/16 for all locations. You can define custom pools instead.</li>
<li><b>Reserved ranges:</b> do not use 169.254.0.0/16 or 100.64.0.0/10 in your own pools.</li>
<li><b>No overlaps:</b> pools must not overlap the infrastructure subnet, remote network subnets, or HQ.</li>
<li><b>Order of use:</b> Prisma Access uses a pool for a location group first, then for the theater (region), then Worldwide. Within a pool, blocks are used in the order you entered them.</li>
<li><b>Block handout:</b> addresses are given out in /24 blocks per gateway.</li>
<li><b>Sizing advice:</b> plan for about <b>twice the number of mobile user devices</b>.</li>
<li><b>Changing a pool:</b> changing the mask or region of an existing pool disrupts connected users. Add a new block instead.</li>
</ul>
<table class="cmp"><tr><th>Block size</th><th>Addresses</th><th>Sized for about (at 2x)</th></tr>
<tr><td>/23</td><td>512</td><td>256 devices</td></tr>
<tr><td>/22</td><td>1,024</td><td>512 devices</td></tr>
<tr><td>/21</td><td>2,048</td><td>1,024 devices</td></tr>
<tr><td>/20</td><td>4,096</td><td>2,048 devices</td></tr>
</table>

<h3>Verification</h3>
<pre class="out">Mobile Users &gt; IP Pools (lab console view)
Region      Pool             Blocks used   Addresses in use
Worldwide   10.200.0.0/23    1 of 2        <span class="hl">5 of 510</span>
</pre>
<p>Read the "in use" column. When it approaches the total, new users fail to receive an address. The lab console also shows the pool usage in the Users view.</p>

<div class="eg"><p><b>Worked example.</b> A company has 600 staff, and about 900 devices including phones. Using the 2x advice, it needs about 1,800 addresses. The next size is a /21, which has 2,048. The company chooses 10.200.0.0/21, check that it does not overlap 10.10.0.0/24, 10.20.0.0/24, or the infrastructure subnet 10.255.0.0/24, and adds it. In the lab the pool is 10.200.0.0/23: it supports about 256 devices at the 2x rule, which is enough for a lab but not for a company.</p></div>

<h3>A monitoring habit</h3>
<p>Check pool usage weekly and after every hiring wave. A simple rule is to add a block when usage passes about 70 percent of the pool. Record each block with its purpose and date in your address register, so the next engineer knows why 10.200.2.0/23 exists.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) A pool smaller than /23. (2) A pool that overlaps the data center, so return traffic goes to the wrong place. (3) Resizing an existing pool during working hours, which drops users. (4) Forgetting that the data center needs a route back to the pool through the service connection.</p></div>
<div class="exam"><p><b>Exam trap.</b> Minimum is /23 per location; sizing is about 2x the device count; reserved are 169.254.0.0/16 and 100.64.0.0/10; and pool changes should be additions, not edits.</p></div>

<div class="scn"><h4>Authentication fine, no address</h4><p>On the first Monday after a hiring wave, new staff could log in, the app said "connecting", and then failed. Pool usage showed 508 of 510 addresses used, because the /23 was sized for the old headcount. The administrator added a second block 10.200.2.0/23 (not changing the old one), pushed, and the new users connected at once.</p><p><b>Lesson:</b> monitor pool usage, and grow by adding blocks.</p></div>

<div class="iv"><p class="q">"How do you size the GlobalProtect client IP pool?"</p><p>Strong answer: at least a /23 per location, about twice the number of devices, no overlap with infrastructure, branch, HQ or reserved ranges (169.254.0.0/16, 100.64.0.0/10). Blocks are given in /24s per gateway. Add blocks rather than editing existing pools, and ensure HQ has a return route to the pool.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Minimum /23 per location; the lab pool is 10.200.0.0/23.</li>
<li>Plan about 2x the number of devices.</li>
<li>Avoid 169.254.0.0/16 and 100.64.0.0/10; never overlap other networks.</li>
<li>Blocks are handed out in /24s per gateway, in the order entered.</li>
<li>Add new blocks instead of changing existing ones.</li>
</ul></div>
`,hi:`
<p>Har connected laptop aur phone ko tunnel ke andar ek IP address chahiye. Yeh address aapke define kiye <b>client IP pool</b> se aata hai. Bahut chhota pool, ya doosre network se overlap karta pool, mobile user outages ke sabse common reasons mein se hain.</p>

<h3>Analogy: stadium ke parking tokens</h3>
<p>Stadium ek fixed number ke parking tokens print karta hai. Saare tokens use ho jaayein to agli gaadi andar nahi ja sakti, chahe gate aur guard theek hon. Client IP pool tokens ka stock hai: khatam ho jaaye to naya user successfully authenticate hota hai lekin use address nahi milta.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Pool blocks mein bata hua">
<rect x="20" y="30" width="600" height="44" rx="6" fill="#fde68a"/><text x="320" y="58" text-anchor="middle" class="svg-ink" font-size="13">Pool 10.200.0.0/23 (512 addresses)</text>
<rect x="20" y="100" width="290" height="44" rx="6" fill="#bae6fd"/><text x="165" y="127" text-anchor="middle" class="svg-ink" font-size="12">Block 10.200.0.0/24</text>
<rect x="330" y="100" width="290" height="44" rx="6" fill="#bbf7d0"/><text x="475" y="127" text-anchor="middle" class="svg-ink" font-size="12">Block 10.200.1.0/24</text>
<line x1="165" y1="74" x2="165" y2="100" stroke="#64748b"/><line x1="475" y1="74" x2="475" y2="100" stroke="#64748b"/>
<text x="320" y="180" text-anchor="middle" class="svg-muted" font-size="12">Addresses per gateway /24 blocks mein diye jaate hain</text>
</svg><p class="cap">Lab pool allowed minimum size hai: /23, yaani do /24 blocks.</p></div>

<h3>Rules</h3>
<ul>
<li><b>Minimum size:</b> custom pools ko <b>per location kam se kam /23</b> chahiye. (Panorama par text Worldwide ya regional setting ke hisaab se pool ki baat karta hai.)</li>
<li><b>Default:</b> SCM mein default pool saare locations ke liye 100.127.0.0/16 hai. Aap custom pools define kar sakte ho.</li>
<li><b>Reserved ranges:</b> apne pools mein 169.254.0.0/16 ya 100.64.0.0/10 use mat karo.</li>
<li><b>Koi overlap nahi:</b> pools infrastructure subnet, remote network subnets, ya HQ se overlap nahi karne chahiye.</li>
<li><b>Use ka order:</b> Prisma Access pehle location group ka pool, phir theater (region), phir Worldwide use karta hai. Pool ke andar blocks usi order mein use hote hain jis order mein aapne enter kiye.</li>
<li><b>Block handout:</b> addresses per gateway /24 blocks mein diye jaate hain.</li>
<li><b>Sizing advice:</b> mobile user devices ka lagbhag <b>do guna</b> plan karo.</li>
<li><b>Pool badalna:</b> existing pool ka mask ya region badalna connected users ko disrupt karta hai. Iske bajaye naya block jodo.</li>
</ul>
<table class="cmp"><tr><th>Block size</th><th>Addresses</th><th>Lagbhag kitne devices ke liye (2x par)</th></tr>
<tr><td>/23</td><td>512</td><td>256 devices</td></tr>
<tr><td>/22</td><td>1,024</td><td>512 devices</td></tr>
<tr><td>/21</td><td>2,048</td><td>1,024 devices</td></tr>
<tr><td>/20</td><td>4,096</td><td>2,048 devices</td></tr>
</table>

<h3>Verification</h3>
<pre class="out">Mobile Users &gt; IP Pools (lab console view)
Region      Pool             Blocks used   Addresses in use
Worldwide   10.200.0.0/23    1 of 2        <span class="hl">5 of 510</span>
</pre>
<p>"In use" column padho. Jab yeh total ke paas pahunche, naye users ko address nahi milta. Lab console Users view mein bhi pool usage dikhata hai.</p>

<div class="eg"><p><b>Worked example.</b> Company ke 600 staff hain, aur phones sahit lagbhag 900 devices. 2x advice se lagbhag 1,800 addresses chahiye. Agla size /21 hai jismein 2,048 hote hain. Company 10.200.0.0/21 chunti hai, check karti hai ki yeh 10.10.0.0/24, 10.20.0.0/24 ya infrastructure subnet 10.255.0.0/24 se overlap nahi karta, aur add karti hai. Lab mein pool 10.200.0.0/23 hai: 2x rule par yeh lagbhag 256 devices support karta hai, jo lab ke liye kaafi hai lekin company ke liye nahi.</p></div>

<h3>Monitoring ki aadat</h3>
<p>Pool usage har hafte aur har hiring wave ke baad check karo. Ek simple rule hai ki usage pool ke lagbhag 70 percent se upar jaye to block jodo. Har block ko uske purpose aur date ke saath address register mein likho, taaki agla engineer jaane ki 10.200.2.0/23 kyun hai.</p>

<div class="warn"><p><b>Common galtiyan.</b> (1) /23 se chhota pool. (2) Data center se overlap karta pool, jisse return traffic galat jagah jaata hai. (3) Working hours mein existing pool resize karna, jisse users drop hote hain. (4) Bhool jaana ki data center ko service connection ke through pool tak wapas route chahiye.</p></div>
<div class="exam"><p><b>Exam trap.</b> Minimum per location /23; sizing lagbhag device count ka 2x; reserved 169.254.0.0/16 aur 100.64.0.0/10; aur pool changes additions hone chahiye, edits nahi.</p></div>

<div class="scn"><h4>Authentication theek, address nahi</h4><p>Hiring wave ke baad pehle Monday ko naye staff login kar paaye, app ne "connecting" kaha, aur phir fail hua. Pool usage 510 mein se 508 addresses used dikha raha tha, kyunki /23 purane headcount ke hisaab se size hua tha. Administrator ne purana block badle bina doosra block 10.200.2.0/23 add kiya, push kiya, aur naye users turant connect ho gaye.</p><p><b>Seekh:</b> pool usage monitor karo, aur naye blocks jodkar badhao.</p></div>

<div class="iv"><p class="q">"GlobalProtect client IP pool ko size kaise karte ho?"</p><p>Strong answer: per location kam se kam /23, devices ka lagbhag do guna, infrastructure, branch, HQ ya reserved ranges (169.254.0.0/16, 100.64.0.0/10) se koi overlap nahi. Blocks per gateway /24 mein milte hain. Existing pools edit karne ke bajaye blocks jodo, aur ensure karo ki HQ ke paas pool tak return route hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Per location minimum /23; lab pool 10.200.0.0/23 hai.</li>
<li>Devices ka lagbhag 2x plan karo.</li>
<li>169.254.0.0/16 aur 100.64.0.0/10 avoid karo; doosre networks se kabhi overlap nahi.</li>
<li>Blocks per gateway /24 mein, enter kiye gaye order mein diye jaate hain.</li>
<li>Existing blocks badalne ke bajaye naye blocks jodo.</li>
</ul></div>
`}};export{e as default};