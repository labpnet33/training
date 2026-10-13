var e={id:`hosts-subnets`,h:{en:`Counting hosts and subnets, and the /31 and /32 exceptions`,hi:`Hosts aur subnets ginna, aur /31 aur /32 exceptions`},body:{en:`
<p>A cinema has 32 seat-number bits to hand out. The manager decides how many bits name the <b>hall</b> and how many name the <b>seat</b>. More bits for halls means more halls but fewer seats in each; more bits for seats means bigger halls but fewer of them. Subnetting is exactly this trade-off. This chapter gives you the two formulas that answer every "how many" question, and the two special prefixes that break the first formula.</p>

<h3>The two formulas</h3>
<p><b>Usable hosts per subnet = 2<sup>h</sup> − 2</b>, where h is the number of host bits (32 − prefix). We subtract 2 because the all-zeros value is the network address and the all-ones value is the broadcast.</p>
<p><b>Number of subnets = 2<sup>s</sup></b>, where s is the number of bits you <b>borrowed</b>: the new prefix minus the prefix of the block you started with. Cutting a /24 into /27s borrows 3 bits, giving 2<sup>3</sup> = 8 subnets.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Network, subnet and host bits">
<text x="320" y="22" text-anchor="middle" class="svg-ink" font-size="14">192.168.10.0/24 cut into /27s</text>
<rect x="20" y="40" width="420" height="44" rx="6" fill="#bae6fd"/><text x="230" y="67" text-anchor="middle" class="svg-ink" font-size="13">original network: 24 bits</text>
<rect x="440" y="40" width="60" height="44" rx="6" fill="#ddd6fe"/><text x="470" y="67" text-anchor="middle" class="svg-ink" font-size="13">s=3</text>
<rect x="500" y="40" width="120" height="44" rx="6" fill="#bbf7d0"/><text x="560" y="67" text-anchor="middle" class="svg-ink" font-size="13">h=5</text>
<text x="470" y="110" text-anchor="middle" class="svg-accent" font-size="12">2^3 = 8 subnets</text>
<text x="560" y="130" text-anchor="middle" class="svg-accent" font-size="12">2^5 − 2 = 30 hosts</text>
<text x="320" y="160" text-anchor="middle" class="svg-muted" font-size="12">borrowed bits come from the host part</text>
</svg><p class="cap">Borrowing bits from the host part creates subnets; what remains decides the hosts per subnet.</p></div>

<h3>The host-count table</h3>
<table class="cmp"><tr><th>Prefix</th><th>Host bits</th><th>Usable hosts</th><th>Prefix</th><th>Host bits</th><th>Usable hosts</th></tr>
<tr><td>/30</td><td>2</td><td>2</td><td>/23</td><td>9</td><td>510</td></tr>
<tr><td>/29</td><td>3</td><td>6</td><td>/22</td><td>10</td><td>1,022</td></tr>
<tr><td>/28</td><td>4</td><td>14</td><td>/21</td><td>11</td><td>2,046</td></tr>
<tr><td>/27</td><td>5</td><td>30</td><td>/20</td><td>12</td><td>4,094</td></tr>
<tr><td>/26</td><td>6</td><td>62</td><td>/16</td><td>16</td><td>65,534</td></tr>
<tr><td>/25</td><td>7</td><td>126</td><td>/8</td><td>24</td><td>16,777,214</td></tr>
<tr><td>/24</td><td>8</td><td>254</td><td></td><td></td><td></td></tr></table>

<h3>Choosing a prefix for a number of hosts</h3>
<p>Find the smallest h where 2<sup>h</sup> − 2 is at least the number of hosts you need, then prefix = 32 − h. Always count the <b>router's gateway address</b> and any printers, access points and phones as hosts.</p>
<div class="eg"><p><b>Worked examples.</b> 100 hosts: 2<sup>7</sup> − 2 = 126 ≥ 100, so 7 host bits, <b>/25</b> (this is Lab 1's first question for LAN-A). 50 hosts: 2<sup>6</sup> − 2 = 62, <b>/26</b>. 20 hosts: 2<sup>5</sup> − 2 = 30, <b>/27</b>. 500 hosts: 2<sup>9</sup> − 2 = 510, <b>/23</b> = 255.255.254.0. 1,000 hosts: 1,022, <b>/22</b>. Boundary trap: 62 hosts fit a /26 exactly, but 63 need a /25.</p></div>

<h3>Choosing a prefix for a number of subnets</h3>
<div class="eg"><p><b>Worked example.</b> You own 172.16.0.0/16 and need 100 subnets. 2<sup>6</sup> = 64 is too few, 2<sup>7</sup> = 128 is enough, so borrow 7 bits: /16 + 7 = <b>/23</b>. Each /23 has 9 host bits: 510 hosts.</p>
<p><b>Two requirements at once.</b> From 10.0.0.0/8 you need at least 1,000 subnets and at least 2,000 hosts per subnet. Subnets need s ≥ 10 (1,024); hosts need h ≥ 11 (2,046). You have 24 bits to share and 10 + 11 = 21 fits. Any prefix from /18 to /21 works. If the question says "maximise the number of subnets", give hosts the minimum: <b>/21</b> (8,192 subnets of 2,046 hosts). If it says "maximise hosts", <b>/18</b> (1,024 subnets of 16,382 hosts).</p></div>

<h3>Subnet zero and the all-ones subnet</h3>
<p>Very old rules told you not to use the first subnet (all subnet bits 0) or the last (all subnet bits 1), which is why some old books use 2<sup>s</sup> − 2 for subnets. Cisco IOS has allowed subnet zero by default for decades (<code>ip subnet-zero</code>), and the CCNA counts <b>2<sup>s</sup></b>. In Lab 1, LAN-A is 192.168.50.0/25, which is subnet zero, and it works fine.</p>

<h3>The /31 exception</h3>
<p>A point-to-point link between two routers has exactly two devices, so a /30 wastes half its addresses on network and broadcast. <b>RFC 3021</b> allows a <b>/31</b> on point-to-point links: two addresses, both usable, no network and no broadcast. IOS accepts it and warns you on Ethernet:</p>
<pre class="code">R1(config)# interface GigabitEthernet0/0
R1(config-if)# ip address 10.0.0.0 255.255.255.254
% Warning: use /31 mask on non point-to-point interface cautiously</pre>
<p>The other end takes 10.0.0.1/31. The Lab 1 WAN link uses a classic /30 (192.168.50.224/30) so the maths stays simple.</p>

<h3>The /32 exception</h3>
<p>A <b>/32</b> identifies exactly one address. It is used for loopback interfaces (router IDs, management), host routes, and the <b>L</b> (local) entries in the routing table. The 2<sup>h</sup> − 2 formula does not apply.</p>
<pre class="code">interface Loopback0
 ip address 192.0.2.1 255.255.255.255</pre>

<div class="warn"><p><b>Common mistakes.</b> Forgetting the −2 (a /27 has 32 addresses but 30 hosts). Forgetting that the gateway uses an address. Counting subnets from the wrong starting prefix: going from /16 to /23 borrows 7 bits, not 23 − 8.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Maximum number of usable hosts" always means 2<sup>h</sup> − 2 unless the question clearly describes a point-to-point /31. "How many subnets" today means 2<sup>s</sup>. Read which requirement to maximise when two constraints are given.</p></div>

<div class="scn"><h4>The floor that ran out of addresses</h4><p>A sales floor with 55 laptops was given a /26 (62 hosts), which looked comfortable. Six months later 20 new staff joined and the facilities team added wireless access points and printers on the same VLAN. New laptops started showing 169.254.x.x addresses: the DHCP pool was exhausted. <code>show ip dhcp pool</code> showed 61 leased addresses. The fix was moving the floor to a /25 in a maintenance window and putting access points in their own VLAN.</p><p><b>Lesson:</b> size subnets for growth (a common rule is to plan for at least double today's count) and remember that every device, not just every person, needs an address.</p></div>

<div class="iv"><p class="q">"How many usable hosts are in a /29, why do you subtract two, and when would you use a /31?"</p><p>Strong answer: a /29 has 3 host bits, 8 addresses, 6 usable, because the all-zeros address is the network and the all-ones address is the broadcast. A /31 (RFC 3021) is for point-to-point links where both addresses are usable because there is no need for network or broadcast addresses; it halves address use on router links. A /32 is for loopbacks and host routes.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Hosts per subnet = 2<sup>h</sup> − 2; subnets = 2<sup>s</sup> where s = borrowed bits.</li>
<li>Pick the smallest h with 2<sup>h</sup> − 2 ≥ hosts needed, counting the gateway and every device.</li>
<li>With two constraints, check that subnet bits plus host bits fit, then read which to maximise.</li>
<li>/31 on point-to-point links: two usable addresses, no network or broadcast (RFC 3021).</li>
<li>/32 = one address: loopbacks, host routes and the L entries in the routing table.</li>
</ul></div>
`,hi:`
<p>Ek cinema ke paas baantne ke liye 32 seat-number bits hain. Manager decide karta hai ki kitne bits <b>hall</b> ka naam batayenge aur kitne <b>seat</b> ka. Halls ke liye zyada bits matlab zyada halls par har ek mein kam seats; seats ke liye zyada bits matlab bade halls par kam sankhya mein. Subnetting bilkul yahi trade-off hai. Yeh chapter aapko do formulas deta hai jo har "kitne" wale sawaal ka jawab dete hain, aur do special prefixes jo pehla formula tod dete hain.</p>

<h3>Do formulas</h3>
<p><b>Har subnet mein usable hosts = 2<sup>h</sup> − 2</b>, jahan h host bits ki sankhya hai (32 − prefix). Hum 2 ghatate hain kyunki all-zeros value network address hai aur all-ones value broadcast.</p>
<p><b>Subnets ki sankhya = 2<sup>s</sup></b>, jahan s woh bits hain jo aapne <b>borrow</b> kiye: naya prefix minus us block ka prefix jisse aapne shuru kiya. /24 ko /27s mein kaatne par 3 bits borrow hote hain, jisse 2<sup>3</sup> = 8 subnets milte hain.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Network, subnet aur host bits">
<text x="320" y="22" text-anchor="middle" class="svg-ink" font-size="14">192.168.10.0/24 ko /27s mein kaata</text>
<rect x="20" y="40" width="420" height="44" rx="6" fill="#bae6fd"/><text x="230" y="67" text-anchor="middle" class="svg-ink" font-size="13">original network: 24 bits</text>
<rect x="440" y="40" width="60" height="44" rx="6" fill="#ddd6fe"/><text x="470" y="67" text-anchor="middle" class="svg-ink" font-size="13">s=3</text>
<rect x="500" y="40" width="120" height="44" rx="6" fill="#bbf7d0"/><text x="560" y="67" text-anchor="middle" class="svg-ink" font-size="13">h=5</text>
<text x="470" y="110" text-anchor="middle" class="svg-accent" font-size="12">2^3 = 8 subnets</text>
<text x="560" y="130" text-anchor="middle" class="svg-accent" font-size="12">2^5 − 2 = 30 hosts</text>
<text x="320" y="160" text-anchor="middle" class="svg-muted" font-size="12">borrowed bits host part se aate hain</text>
</svg><p class="cap">Host part se bits borrow karne se subnets bante hain; jo bachta hai woh har subnet ke hosts decide karta hai.</p></div>

<h3>Host-count table</h3>
<table class="cmp"><tr><th>Prefix</th><th>Host bits</th><th>Usable hosts</th><th>Prefix</th><th>Host bits</th><th>Usable hosts</th></tr>
<tr><td>/30</td><td>2</td><td>2</td><td>/23</td><td>9</td><td>510</td></tr>
<tr><td>/29</td><td>3</td><td>6</td><td>/22</td><td>10</td><td>1,022</td></tr>
<tr><td>/28</td><td>4</td><td>14</td><td>/21</td><td>11</td><td>2,046</td></tr>
<tr><td>/27</td><td>5</td><td>30</td><td>/20</td><td>12</td><td>4,094</td></tr>
<tr><td>/26</td><td>6</td><td>62</td><td>/16</td><td>16</td><td>65,534</td></tr>
<tr><td>/25</td><td>7</td><td>126</td><td>/8</td><td>24</td><td>16,777,214</td></tr>
<tr><td>/24</td><td>8</td><td>254</td><td></td><td></td><td></td></tr></table>

<h3>Hosts ki sankhya ke liye prefix chunna</h3>
<p>Sabse chhota h dhoondo jahan 2<sup>h</sup> − 2 aapki zaroorat ke hosts ke barabar ya zyada ho, phir prefix = 32 − h. <b>Router ka gateway address</b> aur printers, access points aur phones ko bhi hamesha hosts mein gino.</p>
<div class="eg"><p><b>Worked examples.</b> 100 hosts: 2<sup>7</sup> − 2 = 126 ≥ 100, to 7 host bits, <b>/25</b> (yeh LAN-A ke liye Lab 1 ka pehla sawaal hai). 50 hosts: 2<sup>6</sup> − 2 = 62, <b>/26</b>. 20 hosts: 2<sup>5</sup> − 2 = 30, <b>/27</b>. 500 hosts: 2<sup>9</sup> − 2 = 510, <b>/23</b> = 255.255.254.0. 1,000 hosts: 1,022, <b>/22</b>. Boundary trap: 62 hosts /26 mein bilkul fit hote hain, par 63 ko /25 chahiye.</p></div>

<h3>Subnets ki sankhya ke liye prefix chunna</h3>
<div class="eg"><p><b>Worked example.</b> Aapke paas 172.16.0.0/16 hai aur 100 subnets chahiye. 2<sup>6</sup> = 64 kam hai, 2<sup>7</sup> = 128 kaafi hai, to 7 bits borrow karo: /16 + 7 = <b>/23</b>. Har /23 mein 9 host bits hain: 510 hosts.</p>
<p><b>Ek saath do requirements.</b> 10.0.0.0/8 se aapko kam se kam 1,000 subnets aur har subnet mein kam se kam 2,000 hosts chahiye. Subnets ko s ≥ 10 (1,024) chahiye; hosts ko h ≥ 11 (2,046). Baantne ke liye 24 bits hain aur 10 + 11 = 21 fit hota hai. /18 se /21 tak koi bhi prefix chalega. Agar sawaal kahe "subnets ki sankhya maximise karo", hosts ko minimum do: <b>/21</b> (2,046 hosts ke 8,192 subnets). Agar kahe "hosts maximise karo", <b>/18</b> (16,382 hosts ke 1,024 subnets).</p></div>

<h3>Subnet zero aur all-ones subnet</h3>
<p>Bahut purane rules kehte the ki pehla subnet (saare subnet bits 0) ya aakhri (saare subnet bits 1) use mat karo, isiliye kuch purani books subnets ke liye 2<sup>s</sup> − 2 use karti hain. Cisco IOS dashakon se default mein subnet zero allow karta hai (<code>ip subnet-zero</code>), aur CCNA <b>2<sup>s</sup></b> ginta hai. Lab 1 mein LAN-A 192.168.50.0/25 hai, jo subnet zero hai, aur bilkul theek chalta hai.</p>

<h3>/31 exception</h3>
<p>Do routers ke beech point-to-point link par bilkul do devices hote hain, isliye /30 apne aadhe addresses network aur broadcast par waste karta hai. <b>RFC 3021</b> point-to-point links par <b>/31</b> allow karta hai: do addresses, dono usable, na network na broadcast. IOS ise accept karta hai aur Ethernet par warning deta hai:</p>
<pre class="code">R1(config)# interface GigabitEthernet0/0
R1(config-if)# ip address 10.0.0.0 255.255.255.254
% Warning: use /31 mask on non point-to-point interface cautiously</pre>
<p>Doosra end 10.0.0.1/31 leta hai. Lab 1 ka WAN link classic /30 (192.168.50.224/30) use karta hai taaki maths simple rahe.</p>

<h3>/32 exception</h3>
<p><b>/32</b> bilkul ek address identify karta hai. Yeh loopback interfaces (router IDs, management), host routes, aur routing table ki <b>L</b> (local) entries ke liye use hota hai. 2<sup>h</sup> − 2 formula yahan lagu nahi hota.</p>
<pre class="code">interface Loopback0
 ip address 192.0.2.1 255.255.255.255</pre>

<div class="warn"><p><b>Common galtiyan.</b> −2 bhool jaana (/27 mein 32 addresses hain par 30 hosts). Bhool jaana ki gateway bhi ek address leta hai. Galat starting prefix se subnets ginna: /16 se /23 jaane mein 7 bits borrow hote hain, 23 − 8 nahi.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Maximum number of usable hosts" ka matlab hamesha 2<sup>h</sup> − 2 hai jab tak sawaal saaf taur par point-to-point /31 describe na kare. Aaj "kitne subnets" ka matlab 2<sup>s</sup> hai. Jab do constraints diye hon to padho ki kise maximise karna hai.</p></div>

<div class="scn"><h4>Woh floor jiske addresses khatam ho gaye</h4><p>55 laptops wale sales floor ko ek /26 (62 hosts) diya gaya, jo aaram wala lagta tha. Chhe mahine baad 20 naye staff aaye aur facilities team ne same VLAN par wireless access points aur printers jod diye. Naye laptops 169.254.x.x addresses dikhane lage: DHCP pool khatam ho chuka tha. <code>show ip dhcp pool</code> ne 61 leased addresses dikhaye. Fix tha maintenance window mein floor ko /25 par le jaana aur access points ko unke apne VLAN mein daalna.</p><p><b>Seekh:</b> subnets ko growth ke liye size karo (common rule hai aaj ki ginti ka kam se kam double plan karna) aur yaad rakho ki har device ko address chahiye, sirf har insaan ko nahi.</p></div>

<div class="iv"><p class="q">"/29 mein kitne usable hosts hain, aap do kyun ghatate ho, aur /31 kab use karoge?"</p><p>Strong answer: /29 mein 3 host bits, 8 addresses, 6 usable, kyunki all-zeros address network hai aur all-ones address broadcast. /31 (RFC 3021) point-to-point links ke liye hai jahan dono addresses usable hain kyunki network ya broadcast addresses ki zaroorat nahi; yeh router links par address use aadha kar deta hai. /32 loopbacks aur host routes ke liye hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har subnet mein hosts = 2<sup>h</sup> − 2; subnets = 2<sup>s</sup> jahan s = borrowed bits.</li>
<li>Sabse chhota h chuno jahan 2<sup>h</sup> − 2 ≥ zaroori hosts, gateway aur har device ko gin kar.</li>
<li>Do constraints ke saath check karo ki subnet bits plus host bits fit hote hain, phir padho kise maximise karna hai.</li>
<li>Point-to-point links par /31: do usable addresses, na network na broadcast (RFC 3021).</li>
<li>/32 = ek address: loopbacks, host routes aur routing table ki L entries.</li>
</ul></div>
`}};export{e as default};