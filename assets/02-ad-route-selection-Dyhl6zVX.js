var e={id:`ad-route-selection`,h:{en:`Route selection and administrative distance`,hi:`Route selection aur administrative distance`},body:{en:`
<p>A newspaper editor receives the same story from three sources: a staff reporter, a news agency and an anonymous social media post. She does not compare how exciting each version is; she first asks <b>which source she trusts more</b>. A router does the same. When several routing sources offer the same prefix, it does not compare their metrics (an EIGRP metric and an OSPF cost are different currencies). It compares a trust score called <b>administrative distance</b>.</p>

<h3>Three separate decisions</h3>
<p>Beginners often mix up three decisions that happen at different stages. Keep them apart and most AD questions become easy.</p>
<ol>
<li><b>Best path inside one protocol.</b> EIGRP picks its successor by lowest composite metric; OSPF picks by lowest cost, with intra-area preferred over inter-area over E1 over E2. This happens inside the protocol's own database.</li>
<li><b>Which source installs the prefix in the routing table (RIB).</b> If EIGRP, OSPF and a static route each offer <b>exactly the same prefix and length</b>, the router installs the one with the <b>lowest AD</b>. The losers stay in their own databases but are not used.</li>
<li><b>Which RIB entry forwards a packet.</b> When a packet arrives, the router uses the <b>longest prefix match</b> among all installed routes, regardless of AD.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Route selection pipeline">
<rect x="10" y="20" width="150" height="40" rx="8" fill="#bae6fd"/><text x="85" y="45" text-anchor="middle" class="svg-ink" font-size="13">EIGRP best path</text>
<rect x="10" y="80" width="150" height="40" rx="8" fill="#bbf7d0"/><text x="85" y="105" text-anchor="middle" class="svg-ink" font-size="13">OSPF best path</text>
<rect x="10" y="140" width="150" height="40" rx="8" fill="#fde68a"/><text x="85" y="165" text-anchor="middle" class="svg-ink" font-size="13">static route</text>
<line x1="160" y1="40" x2="240" y2="95" stroke="#64748b" stroke-width="2"/><line x1="160" y1="100" x2="240" y2="100" stroke="#64748b" stroke-width="2"/><line x1="160" y1="160" x2="240" y2="105" stroke="#64748b" stroke-width="2"/>
<rect x="240" y="75" width="150" height="50" rx="8" fill="#ddd6fe"/><text x="315" y="97" text-anchor="middle" class="svg-ink" font-size="13">same prefix?</text><text x="315" y="114" text-anchor="middle" class="svg-accent" font-size="12">lowest AD wins</text>
<line x1="390" y1="100" x2="440" y2="100" stroke="#64748b" stroke-width="2"/>
<rect x="440" y="75" width="80" height="50" rx="8" fill="#e2e8f0"/><text x="480" y="105" text-anchor="middle" class="svg-ink" font-size="13">RIB</text>
<line x1="520" y1="100" x2="550" y2="100" stroke="#64748b" stroke-width="2"/>
<rect x="550" y="75" width="80" height="50" rx="8" fill="#fed7aa"/><text x="590" y="97" text-anchor="middle" class="svg-ink" font-size="13">FIB</text><text x="590" y="114" text-anchor="middle" class="svg-muted" font-size="12">longest match</text>
<text x="320" y="210" text-anchor="middle" class="svg-muted" font-size="12">metric inside a protocol, AD between sources, longest match per packet</text>
</svg><p class="cap">Route selection happens in stages: each protocol picks its best path, AD picks between sources for the same prefix, and forwarding uses the longest match.</p></div>

<h3>The default AD table (Cisco IOS and IOS-XE)</h3>
<table class="cmp"><tr><th>Source</th><th>AD</th><th>Route code</th></tr>
<tr><td>Connected interface</td><td>0</td><td>C</td></tr>
<tr><td>Static route</td><td>1</td><td>S</td></tr>
<tr><td>EIGRP summary route</td><td>5</td><td>D</td></tr>
<tr><td>External BGP (eBGP)</td><td>20</td><td>B</td></tr>
<tr><td>Internal EIGRP</td><td>90</td><td>D</td></tr>
<tr><td>OSPF (intra-area, inter-area and external)</td><td>110</td><td>O, O IA, O E1, O E2</td></tr>
<tr><td>IS-IS</td><td>115</td><td>i L1, i L2</td></tr>
<tr><td>RIP</td><td>120</td><td>R</td></tr>
<tr><td>ODR</td><td>160</td><td>o</td></tr>
<tr><td>External EIGRP</td><td>170</td><td>D EX</td></tr>
<tr><td>Internal BGP (iBGP) and locally originated BGP</td><td>200</td><td>B</td></tr>
<tr><td>Default route learned from DHCP</td><td>254</td><td>S*</td></tr>
<tr><td>Unknown or unreachable (never installed)</td><td>255</td><td>n/a</td></tr></table>
<p>Two design ideas explain the odd-looking numbers. EIGRP gives its <b>external</b> routes (redistributed from somewhere else) a worse AD of 170 so that a real internal path is always preferred over a redistributed copy. BGP trusts <b>eBGP</b> (20) highly because external routes normally come only from the provider, but distrusts <b>iBGP</b> (200) so that an IGP path to an internal prefix wins over BGP.</p>

<h3>Seeing AD in the output</h3>
<p>In <code>show ip route</code> each entry shows <code>[AD/metric]</code>. The detailed view prints it in words.</p>
<pre class="out">BR1#show ip route 192.168.50.0
Routing entry for 192.168.50.0/24
  <span class="hl">Known via "ospf 1", distance 110, metric 20</span>
  <span class="hl">Tag 90, type extern 2, forward metric 2</span>
  Redistributing via eigrp 100
  Last update from 10.2.1.1 on GigabitEthernet0/1, 00:04:12 ago
  Routing Descriptor Blocks:
  * 10.2.1.1, from 2.2.2.2, 00:04:12 ago, via GigabitEthernet0/1
      Route metric is 20, traffic share count is 1
      Route tag 90</pre>

<div class="eg"><p><b>Worked example.</b> In lab 2, BR1 hears 192.168.50.0/24 from two sources. From E1 over EIGRP it is <code>D EX</code> with AD 170 and metric 130816, one hop away. From BR2 through O1 it is <code>O E2</code> with AD 110 and metric 20, three hops away. The router never compares 130816 with 20. It compares 170 with 110, installs the OSPF route, and sends Delhi-bound traffic through Bengaluru and back. The EIGRP copy still sits in <code>show ip eigrp topology</code>, unused. Chapter 10 explains why this happens with two boundary routers and chapter 3 fixes it.</p></div>

<h3>Longest match beats AD</h3>
<p>AD only compares <b>identical</b> prefixes. If OSPF offers 10.200.10.0/25 and EIGRP offers 10.200.10.0/24, both are installed, because they are different routes. A packet to 10.200.10.20 follows the OSPF /25 even though EIGRP's AD is lower; a packet to 10.200.10.200 follows the EIGRP /24.</p>

<h3>Why AD matters for redistribution</h3>
<p>Redistribution takes routes from the <b>routing table</b>, not from the protocol database. A router running <code>redistribute eigrp 100</code> under OSPF only exports prefixes that are currently installed as EIGRP routes (plus connected networks covered by EIGRP). If AD made a prefix install from OSPF instead, that prefix is silently not redistributed from EIGRP. Many "missing route" tickets are really AD tickets.</p>

<h3>Floating static routes</h3>
<p>A <b>floating static route</b> uses AD deliberately. Giving a backup static route an AD higher than the dynamic protocol keeps it out of the RIB until the dynamic route disappears.</p>
<pre class="code"><span class="c">! backup to Bengaluru users, used only if OSPF loses the route</span>
ip route 10.200.10.0 255.255.255.0 192.0.2.1 250</pre>

<div class="warn"><p><b>Common mistake.</b> Choosing a floating static AD that is not higher than every protocol that can supply the prefix. AD 100 floats above EIGRP internal (90) but beats OSPF (110), so over OSPF it becomes the primary route. Pick a value above the worst real source, for example 250.</p></div>

<div class="exam"><p><b>Exam trap.</b> All OSPF route types share AD 110 by default; E1 versus E2 is a metric decision inside OSPF, not an AD decision. EIGRP is the protocol with two defaults: 90 internal, 170 external. And AD is <b>local only</b>: it is never carried in any routing update.</p></div>

<div class="scn"><h4>The backup link that carried everything</h4><p>A branch had OSPF over MPLS and a floating static route over an internet VPN with <code>ip route 0.0.0.0 0.0.0.0 Tunnel10 100</code>. The static route was meant as backup, but the VPN link ran hot and the MPLS link idle. <code>show ip route 0.0.0.0</code> showed "Known via static, distance 100" instead of OSPF. The engineer had copied the value from an EIGRP site where 100 was above 90. Changing the AD to 250 moved traffic back to MPLS.</p><p><b>Lesson:</b> a floating static route must float above every dynamic source for that prefix, not just one.</p></div>

<div class="iv"><p class="q">"A router learns the same prefix from OSPF and EIGRP. How does it decide which one to use?"</p><p>Strong answer: metrics cannot be compared across protocols, so for the identical prefix and length the router installs the source with the lowest administrative distance: EIGRP internal 90 beats OSPF 110, but OSPF 110 beats EIGRP external 170. The loser stays in its protocol database. Then add the two subtleties: longest match still decides forwarding when prefixes differ, and only the installed route can be redistributed.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Metric chooses inside a protocol, AD chooses between sources for the same prefix, longest match chooses per packet.</li>
<li>Remember 0, 1, 5, 20, 90, 110, 115, 120, 170, 200, 255, and that EIGRP external is 170.</li>
<li>AD is local and never advertised.</li>
<li>Redistribution exports only routes installed in the RIB by that source, so AD decides what can be redistributed.</li>
<li>A floating static route needs an AD above every dynamic source for that prefix.</li>
</ul></div>
`,hi:`
<p>Ek newspaper editor ko ek hi story teen sources se milti hai: staff reporter, news agency aur ek anonymous social media post. Woh yeh compare nahi karti ki kaunsa version zyada exciting hai; woh pehle poochti hai <b>kis source par zyada bharosa hai</b>. Router bhi yahi karta hai. Jab kai routing sources same prefix dete hain, woh unke metrics compare nahi karta (EIGRP metric aur OSPF cost alag currencies hain). Woh ek trust score compare karta hai jise <b>administrative distance</b> kehte hain.</p>

<h3>Teen alag decisions</h3>
<p>Beginners aksar teen decisions mix kar dete hain jo alag stages par hote hain. Inhe alag rakho to zyada tar AD questions aasaan ho jaate hain.</p>
<ol>
<li><b>Ek protocol ke andar best path.</b> EIGRP sabse kam composite metric se successor chunta hai; OSPF sabse kam cost se chunta hai, jisme intra-area, inter-area se, inter-area E1 se, aur E1 E2 se preferred hai. Yeh protocol ke apne database mein hota hai.</li>
<li><b>Kaunsa source prefix ko routing table (RIB) mein install karta hai.</b> Agar EIGRP, OSPF aur ek static route teeno <b>bilkul same prefix aur length</b> dete hain, to router <b>sabse kam AD</b> wala install karta hai. Haarne wale apne databases mein rehte hain par use nahi hote.</li>
<li><b>Kaunsi RIB entry packet forward karti hai.</b> Jab packet aata hai, router saare installed routes mein se <b>longest prefix match</b> use karta hai, AD se koi matlab nahi.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Route selection pipeline">
<rect x="10" y="20" width="150" height="40" rx="8" fill="#bae6fd"/><text x="85" y="45" text-anchor="middle" class="svg-ink" font-size="13">EIGRP best path</text>
<rect x="10" y="80" width="150" height="40" rx="8" fill="#bbf7d0"/><text x="85" y="105" text-anchor="middle" class="svg-ink" font-size="13">OSPF best path</text>
<rect x="10" y="140" width="150" height="40" rx="8" fill="#fde68a"/><text x="85" y="165" text-anchor="middle" class="svg-ink" font-size="13">static route</text>
<line x1="160" y1="40" x2="240" y2="95" stroke="#64748b" stroke-width="2"/><line x1="160" y1="100" x2="240" y2="100" stroke="#64748b" stroke-width="2"/><line x1="160" y1="160" x2="240" y2="105" stroke="#64748b" stroke-width="2"/>
<rect x="240" y="75" width="150" height="50" rx="8" fill="#ddd6fe"/><text x="315" y="97" text-anchor="middle" class="svg-ink" font-size="13">same prefix?</text><text x="315" y="114" text-anchor="middle" class="svg-accent" font-size="12">kam AD jeetta hai</text>
<line x1="390" y1="100" x2="440" y2="100" stroke="#64748b" stroke-width="2"/>
<rect x="440" y="75" width="80" height="50" rx="8" fill="#e2e8f0"/><text x="480" y="105" text-anchor="middle" class="svg-ink" font-size="13">RIB</text>
<line x1="520" y1="100" x2="550" y2="100" stroke="#64748b" stroke-width="2"/>
<rect x="550" y="75" width="80" height="50" rx="8" fill="#fed7aa"/><text x="590" y="97" text-anchor="middle" class="svg-ink" font-size="13">FIB</text><text x="590" y="114" text-anchor="middle" class="svg-muted" font-size="12">longest match</text>
<text x="320" y="210" text-anchor="middle" class="svg-muted" font-size="12">protocol ke andar metric, sources ke beech AD, har packet par longest match</text>
</svg><p class="cap">Route selection stages mein hota hai: har protocol apna best path chunta hai, same prefix ke liye AD sources ke beech chunta hai, aur forwarding longest match use karti hai.</p></div>

<h3>Default AD table (Cisco IOS aur IOS-XE)</h3>
<table class="cmp"><tr><th>Source</th><th>AD</th><th>Route code</th></tr>
<tr><td>Connected interface</td><td>0</td><td>C</td></tr>
<tr><td>Static route</td><td>1</td><td>S</td></tr>
<tr><td>EIGRP summary route</td><td>5</td><td>D</td></tr>
<tr><td>External BGP (eBGP)</td><td>20</td><td>B</td></tr>
<tr><td>Internal EIGRP</td><td>90</td><td>D</td></tr>
<tr><td>OSPF (intra-area, inter-area aur external)</td><td>110</td><td>O, O IA, O E1, O E2</td></tr>
<tr><td>IS-IS</td><td>115</td><td>i L1, i L2</td></tr>
<tr><td>RIP</td><td>120</td><td>R</td></tr>
<tr><td>ODR</td><td>160</td><td>o</td></tr>
<tr><td>External EIGRP</td><td>170</td><td>D EX</td></tr>
<tr><td>Internal BGP (iBGP) aur locally originated BGP</td><td>200</td><td>B</td></tr>
<tr><td>DHCP se seekha default route</td><td>254</td><td>S*</td></tr>
<tr><td>Unknown ya unreachable (kabhi install nahi hota)</td><td>255</td><td>n/a</td></tr></table>
<p>Do design ideas in ajeeb dikhne wale numbers ko samjhate hain. EIGRP apne <b>external</b> routes (kahin aur se redistribute kiye hue) ko 170 ka kharab AD deta hai taaki asli internal path hamesha redistributed copy se preferred rahe. BGP <b>eBGP</b> (20) par bahut bharosa karta hai kyunki external routes normally sirf provider se aate hain, lekin <b>iBGP</b> (200) par kam bharosa karta hai taaki internal prefix ke liye IGP path BGP se jeete.</p>

<h3>Output mein AD dekhna</h3>
<p><code>show ip route</code> mein har entry <code>[AD/metric]</code> dikhati hai. Detailed view ise words mein print karta hai.</p>
<pre class="out">BR1#show ip route 192.168.50.0
Routing entry for 192.168.50.0/24
  <span class="hl">Known via "ospf 1", distance 110, metric 20</span>
  <span class="hl">Tag 90, type extern 2, forward metric 2</span>
  Redistributing via eigrp 100
  Last update from 10.2.1.1 on GigabitEthernet0/1, 00:04:12 ago
  Routing Descriptor Blocks:
  * 10.2.1.1, from 2.2.2.2, 00:04:12 ago, via GigabitEthernet0/1
      Route metric is 20, traffic share count is 1
      Route tag 90</pre>

<div class="eg"><p><b>Worked example.</b> Lab 2 mein BR1 192.168.50.0/24 do sources se sunta hai. E1 se EIGRP par yeh <code>D EX</code> hai, AD 170 aur metric 130816, ek hop door. BR2 se O1 ke through yeh <code>O E2</code> hai, AD 110 aur metric 20, teen hops door. Router kabhi 130816 ko 20 se compare nahi karta. Woh 170 ko 110 se compare karta hai, OSPF route install karta hai, aur Delhi ka traffic Bengaluru se ghuma kar wapas bhejta hai. EIGRP copy ab bhi <code>show ip eigrp topology</code> mein padi hai, bina use ke. Chapter 10 samjhata hai ki do boundary routers ke saath aisa kyun hota hai aur chapter 3 ise theek karta hai.</p></div>

<h3>Longest match AD ko harata hai</h3>
<p>AD sirf <b>identical</b> prefixes compare karta hai. Agar OSPF 10.200.10.0/25 deta hai aur EIGRP 10.200.10.0/24, to dono install hote hain, kyunki woh alag routes hain. 10.200.10.20 ka packet OSPF /25 follow karta hai, bhale hi EIGRP ka AD kam hai; 10.200.10.200 ka packet EIGRP /24 follow karta hai.</p>

<h3>Redistribution ke liye AD kyun matter karta hai</h3>
<p>Redistribution routes <b>routing table</b> se leta hai, protocol database se nahi. OSPF ke neeche <code>redistribute eigrp 100</code> chalane wala router sirf woh prefixes export karta hai jo abhi EIGRP routes ki tarah installed hain (plus EIGRP se covered connected networks). Agar AD ki wajah se koi prefix OSPF se install ho gaya, to woh prefix EIGRP se chupchaap redistribute nahi hota. Bahut saare "missing route" tickets asal mein AD tickets hote hain.</p>

<h3>Floating static routes</h3>
<p><b>Floating static route</b> jaan-boojh kar AD use karta hai. Backup static route ko dynamic protocol se zyada AD dene se woh RIB se bahar rehta hai jab tak dynamic route gayab na ho jaaye.</p>
<pre class="code"><span class="c">! Bengaluru users ka backup, sirf tab use hoga jab OSPF route kho de</span>
ip route 10.200.10.0 255.255.255.0 192.0.2.1 250</pre>

<div class="warn"><p><b>Common galti.</b> Floating static ka aisa AD chunna jo prefix de sakne wale har protocol se zyada na ho. AD 100 EIGRP internal (90) se upar float karta hai lekin OSPF (110) ko hara deta hai, isliye OSPF ke upar woh primary route ban jaata hai. Sabse kharab asli source se upar ki value chuno, jaise 250.</p></div>

<div class="exam"><p><b>Exam trap.</b> Default mein saare OSPF route types ka AD 110 hai; E1 vs E2 OSPF ke andar metric decision hai, AD decision nahi. EIGRP woh protocol hai jiske do defaults hain: 90 internal, 170 external. Aur AD <b>sirf local</b> hai: yeh kisi bhi routing update mein nahi jaata.</p></div>

<div class="scn"><h4>Woh backup link jo sab kuch le ja raha tha</h4><p>Ek branch par MPLS ke upar OSPF tha aur internet VPN par <code>ip route 0.0.0.0 0.0.0.0 Tunnel10 100</code> ke saath floating static route. Static route backup ke liye tha, lekin VPN link garam chal raha tha aur MPLS link khaali. <code>show ip route 0.0.0.0</code> OSPF ki jagah "Known via static, distance 100" dikha raha tha. Engineer ne value ek EIGRP site se copy ki thi jahan 100, 90 se upar tha. AD ko 250 karne se traffic wapas MPLS par aa gaya.</p><p><b>Seekh:</b> floating static route ko us prefix ke har dynamic source se upar float karna chahiye, sirf ek se nahi.</p></div>

<div class="iv"><p class="q">"Ek router same prefix OSPF aur EIGRP dono se seekhta hai. Woh kaise decide karta hai kaunsa use kare?"</p><p>Strong answer: protocols ke beech metrics compare nahi ho sakte, isliye identical prefix aur length ke liye router sabse kam administrative distance wala source install karta hai: EIGRP internal 90 OSPF 110 ko harata hai, lekin OSPF 110 EIGRP external 170 ko harata hai. Haarne wala apne protocol database mein rehta hai. Phir do baariki bataao: jab prefixes alag hon to forwarding ab bhi longest match decide karta hai, aur sirf installed route hi redistribute ho sakta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Metric protocol ke andar chunta hai, AD same prefix ke liye sources ke beech chunta hai, longest match har packet ke liye chunta hai.</li>
<li>0, 1, 5, 20, 90, 110, 115, 120, 170, 200, 255 yaad rakho, aur yeh ki EIGRP external 170 hai.</li>
<li>AD local hai aur kabhi advertise nahi hota.</li>
<li>Redistribution sirf us source dwara RIB mein installed routes export karta hai, isliye AD tay karta hai ki kya redistribute ho sakta hai.</li>
<li>Floating static route ko us prefix ke har dynamic source se upar AD chahiye.</li>
</ul></div>
`}};export{e as default};