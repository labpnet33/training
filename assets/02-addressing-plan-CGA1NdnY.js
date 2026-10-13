var e={id:`addressing-plan`,h:{en:`The addressing plan: VLSM, IPv6 and naming`,hi:`Addressing plan: VLSM, IPv6 aur naming`},body:{en:`
<p>A city does not name its streets as houses get built. Someone draws the layout first: this block for the market, that block for homes, a numbering scheme every postman understands. An IP plan is that layout. When it is good, a single glance at an address tells you the site, the VLAN and the role. When it is bad, every troubleshooting session starts with "wait, which subnet was this?".</p>

<h3>Start from a site block, then carve</h3>
<p>Give each site one summarisable block, and carve VLANs out of it by a fixed rule. A common CCNA-sized rule is: <b>10.&lt;site&gt;.&lt;VLAN&gt;.0</b>. Pune HQ is site 1, so VLAN 10 is 10.1.10.0, VLAN 20 is 10.1.20.0. Anyone seeing 10.1.20.37 knows it is Pune, VLAN 20. The big benefit comes later: all of Pune is 10.1.0.0/16, one line in an OSPF summary or an ACL.</p>

<h3>VLSM in four moves</h3>
<ol>
<li>Write the host count for every segment, <b>including growth</b> (a common rule is plus 25 to 50 percent).</li>
<li>Find the smallest block that fits: usable hosts are 2<sup>h</sup> minus 2, where h is the host bits.</li>
<li>Allocate from the largest segment to the smallest, so blocks stay aligned.</li>
<li>Record the network, mask, first and last usable, and the gateway.</li>
</ol>
<div class="eg"><p><b>Worked example.</b> Finance has 40 users. With growth, plan for 50 hosts. 2<sup>5</sup> minus 2 is 30, too small. 2<sup>6</sup> minus 2 is 62, enough, so h = 6 and the prefix is 32 minus 6 = <b>/26</b> (mask 255.255.255.192). Network 10.1.20.0/26, usable 10.1.20.1 to 10.1.20.62, broadcast 10.1.20.63. Gateway is the first usable, 10.1.20.1. Guest has 25 users, plan 30: 2<sup>5</sup> minus 2 is 30, exactly enough, so /27. A point-to-point WAN link needs two addresses: /30 (or /31 on supported links).</p></div>

<div class="tbl"><table>
<tr><th>Segment</th><th>Hosts (with growth)</th><th>Network</th><th>Mask</th><th>Gateway</th><th>Notes</th></tr>
<tr><td>VLAN 10 Sales</td><td>150</td><td>10.1.10.0/24</td><td>255.255.255.0</td><td>10.1.10.1</td><td>254 usable</td></tr>
<tr><td>VLAN 20 Finance</td><td>50</td><td>10.1.20.0/26</td><td>255.255.255.192</td><td>10.1.20.1</td><td>62 usable</td></tr>
<tr><td>VLAN 30 Guest</td><td>30</td><td>10.1.30.0/27</td><td>255.255.255.224</td><td>10.1.30.1</td><td>30 usable</td></tr>
<tr><td>VLAN 99 Management</td><td>10</td><td>10.1.99.0/28</td><td>255.255.255.240</td><td>10.1.99.1</td><td>14 usable</td></tr>
<tr><td>WAN HQ to Nashik</td><td>2</td><td>10.1.255.0/30</td><td>255.255.255.252</td><td>.1 and .2</td><td>router ends</td></tr>
<tr><td>Loopbacks</td><td>1 each</td><td>10.255.0.x/32</td><td>255.255.255.255</td><td>none</td><td>router IDs</td></tr>
</table></div>

<h3>The same plan for IPv6</h3>
<p>IPv6 planning is easier because subnets are always /64 and you never count hosts. Take a /48 per site, and use the 16-bit subnet field the same way you used the third octet: VLAN number as the subnet ID. Pune could own 2001:db8:1000::/48, so VLAN 10 becomes 2001:db8:1000:10::/64, VLAN 20 becomes 2001:db8:1000:20::/64. Links get their own /64 (or /127), loopbacks a /128. Use the documentation prefix 2001:db8::/32 in labs and exams.</p>
<div class="tbl"><table>
<tr><th>Segment</th><th>IPv6 prefix</th><th>Router address</th></tr>
<tr><td>VLAN 10 Sales</td><td>2001:db8:1000:10::/64</td><td>2001:db8:1000:10::1/64</td></tr>
<tr><td>VLAN 20 Finance</td><td>2001:db8:1000:20::/64</td><td>2001:db8:1000:20::1/64</td></tr>
<tr><td>WAN link</td><td>2001:db8:1000:ff00::/64</td><td>::1 and ::2</td></tr>
<tr><td>Loopback R1</td><td>2001:db8:1000:ffff::1/128</td><td>router ID reference</td></tr>
</table></div>

<h3>Reserve ranges and name everything</h3>
<p>Inside every subnet, decide the roles of address ranges once: <b>.1</b> default gateway (or the HSRP virtual IP), <b>.2 and .3</b> real router addresses when HSRP is used, <b>.4 to .9</b> spare infrastructure, <b>.10 to .19</b> static devices such as printers, then DHCP for the rest. Keep the static ranges out of the DHCP pool, otherwise two devices fight for one address.</p>
<pre class="code"><span class="c">! keep gateway and static ranges out of the DHCP pool</span>
ip dhcp excluded-address 10.1.10.1 10.1.10.19
ip dhcp pool SALES
 network 10.1.10.0 255.255.255.0
 default-router 10.1.10.1
 dns-server 192.0.2.53</pre>
<p>Names matter just as much. Use hostnames like <code>HQ-R1</code>, <code>HQ-SW1</code>, <code>BR-R1</code> (site, role, number). Put a description on every interface that connects to something, for example <code>description TO-BR-R1 Gi0/1</code>, and name VLANs and ACLs after their purpose. On a device at 3 a.m., <code>show interfaces description</code> becomes a free map.</p>

<div class="warn"><p><b>Common mistakes.</b> Sizing a subnet for exactly today's users, then renumbering after one new hire batch. Starting allocation with the small subnets so large ones cannot align. Overlapping a WAN /30 with a LAN block because both used the same third octet. Giving a host the network or broadcast address. Forgetting to exclude the gateway and static range from DHCP.</p></div>

<div class="exam"><p><b>Exam traps.</b> Usable hosts is 2<sup>h</sup> minus 2, not 2<sup>h</sup>. The question may say "smallest subnet that fits", so a /25 for 50 hosts is a wrong answer even though it works. Count both router ends of a WAN link. The wildcard mask for OSPF network statements is the inverse of the subnet mask. Link-local IPv6 addresses (FE80::/10) are not part of the plan but every interface has one.</p></div>

<div class="scn"><h4>The /24 that ran out on the first Monday</h4><p>A branch in Nashik was given 10.2.10.0/26 for 25 staff. The plan looked right on paper. Then the company moved 30 contract workers there and added IP phones. By Tuesday the DHCP pool was exhausted and half of the new users got 169.254 addresses. The fix needed a new subnet, new DHCP scope, a changed ACL and updated documentation. The extra work would have been avoided with a /25 planned from the start.</p><p><b>Lesson:</b> size from users plus phones plus growth, not from today's headcount.</p></div>

<div class="iv"><p class="q">"How do you design an IP plan for a company with three sites?"</p><p>Strong answer: one summarisable block per site, a fixed rule to derive VLAN subnets from VLAN numbers, VLSM from largest to smallest with growth, /30 for point-to-point links, /32 loopbacks, reserved ranges for gateways and servers, a matching IPv6 /48 per site with /64 per VLAN, and a written table that is kept up to date.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>One summarisable block per site, subnets derived by a fixed rule from VLAN numbers.</li>
<li>VLSM: add growth, pick the smallest block with 2^h minus 2 hosts, allocate largest first.</li>
<li>IPv6 plan is a /48 per site and a /64 per VLAN, using the VLAN number as subnet ID.</li>
<li>Reserve gateway, HSRP and static ranges, and exclude them from DHCP.</li>
<li>Consistent hostnames and interface descriptions are part of the plan.</li>
</ul></div>
`,hi:`
<p>Ek shehar apni galiyon ke naam ghar banne ke baad nahi rakhta. Pehle layout bana hota hai: yeh block market ke liye, woh block gharon ke liye, aur ek numbering scheme jo har postman samajhta hai. IP plan wahi layout hai. Jab yeh achha hota hai, to ek address dekhte hi site, VLAN aur role pata chal jata hai. Jab bura hota hai, to har troubleshooting session "ruko, yeh kaunsa subnet tha?" se shuru hota hai.</p>

<h3>Site block se shuru karo, phir carve karo</h3>
<p>Har site ko ek summarise hone laayak block do, aur usme se VLANs ek fixed rule se carve karo. CCNA-size ka common rule hai: <b>10.&lt;site&gt;.&lt;VLAN&gt;.0</b>. Pune HQ site 1 hai, to VLAN 10 hai 10.1.10.0, VLAN 20 hai 10.1.20.0. 10.1.20.37 dekhne wala jaanta hai ki yeh Pune, VLAN 20 hai. Asli fayda baad mein milta hai: poora Pune 10.1.0.0/16 hai, OSPF summary ya ACL mein sirf ek line.</p>

<h3>VLSM chaar moves mein</h3>
<ol>
<li>Har segment ka host count likho, <b>growth ke saath</b> (common rule: plus 25 se 50 percent).</li>
<li>Sabse chhota block dhundo jo fit ho: usable hosts 2<sup>h</sup> minus 2, jahan h host bits hain.</li>
<li>Sabse bade segment se sabse chhote ki taraf allocate karo, taaki blocks aligned rahein.</li>
<li>Network, mask, first aur last usable, aur gateway record karo.</li>
</ol>
<div class="eg"><p><b>Worked example.</b> Finance mein 40 users hain. Growth ke saath 50 hosts plan karo. 2<sup>5</sup> minus 2 = 30, bahut chhota. 2<sup>6</sup> minus 2 = 62, kaafi, to h = 6 aur prefix 32 minus 6 = <b>/26</b> (mask 255.255.255.192). Network 10.1.20.0/26, usable 10.1.20.1 se 10.1.20.62, broadcast 10.1.20.63. Gateway first usable hai, 10.1.20.1. Guest mein 25 users hain, plan 30: 2<sup>5</sup> minus 2 = 30, bilkul kaafi, to /27. Point-to-point WAN link ko do addresses chahiye: /30 (ya supported links par /31).</p></div>

<div class="tbl"><table>
<tr><th>Segment</th><th>Hosts (growth ke saath)</th><th>Network</th><th>Mask</th><th>Gateway</th><th>Notes</th></tr>
<tr><td>VLAN 10 Sales</td><td>150</td><td>10.1.10.0/24</td><td>255.255.255.0</td><td>10.1.10.1</td><td>254 usable</td></tr>
<tr><td>VLAN 20 Finance</td><td>50</td><td>10.1.20.0/26</td><td>255.255.255.192</td><td>10.1.20.1</td><td>62 usable</td></tr>
<tr><td>VLAN 30 Guest</td><td>30</td><td>10.1.30.0/27</td><td>255.255.255.224</td><td>10.1.30.1</td><td>30 usable</td></tr>
<tr><td>VLAN 99 Management</td><td>10</td><td>10.1.99.0/28</td><td>255.255.255.240</td><td>10.1.99.1</td><td>14 usable</td></tr>
<tr><td>WAN HQ to Nashik</td><td>2</td><td>10.1.255.0/30</td><td>255.255.255.252</td><td>.1 aur .2</td><td>router ends</td></tr>
<tr><td>Loopbacks</td><td>har ek ke liye 1</td><td>10.255.0.x/32</td><td>255.255.255.255</td><td>koi nahi</td><td>router IDs</td></tr>
</table></div>

<h3>Wahi plan IPv6 ke liye</h3>
<p>IPv6 planning aasaan hai kyunki subnets hamesha /64 hote hain aur hosts gino nahi jate. Har site ko ek /48 do, aur 16-bit subnet field ko waise hi use karo jaise teesra octet: VLAN number subnet ID. Pune ke paas 2001:db8:1000::/48 ho sakta hai, to VLAN 10 banta hai 2001:db8:1000:10::/64, VLAN 20 banta hai 2001:db8:1000:20::/64. Links ko apna /64 (ya /127), loopbacks ko /128. Labs aur exams mein documentation prefix 2001:db8::/32 use karo.</p>
<div class="tbl"><table>
<tr><th>Segment</th><th>IPv6 prefix</th><th>Router address</th></tr>
<tr><td>VLAN 10 Sales</td><td>2001:db8:1000:10::/64</td><td>2001:db8:1000:10::1/64</td></tr>
<tr><td>VLAN 20 Finance</td><td>2001:db8:1000:20::/64</td><td>2001:db8:1000:20::1/64</td></tr>
<tr><td>WAN link</td><td>2001:db8:1000:ff00::/64</td><td>::1 aur ::2</td></tr>
<tr><td>Loopback R1</td><td>2001:db8:1000:ffff::1/128</td><td>router ID reference</td></tr>
</table></div>

<h3>Ranges reserve karo aur sabka naam rakho</h3>
<p>Har subnet ke andar address ranges ke roles ek baar decide karo: <b>.1</b> default gateway (ya HSRP virtual IP), <b>.2 aur .3</b> HSRP use hone par real router addresses, <b>.4 se .9</b> spare infrastructure, <b>.10 se .19</b> static devices jaise printers, aur baaki DHCP. Static ranges ko DHCP pool se bahar rakho, warna do devices ek address ke liye ladte hain.</p>
<pre class="code"><span class="c">! gateway aur static range ko DHCP pool se bahar rakho</span>
ip dhcp excluded-address 10.1.10.1 10.1.10.19
ip dhcp pool SALES
 network 10.1.10.0 255.255.255.0
 default-router 10.1.10.1
 dns-server 192.0.2.53</pre>
<p>Naming bhi utni hi zaroori hai. Hostnames <code>HQ-R1</code>, <code>HQ-SW1</code>, <code>BR-R1</code> jaise rakho (site, role, number). Jo interface kisi se jud raha hai uspar description lagao, jaise <code>description TO-BR-R1 Gi0/1</code>, aur VLANs aur ACLs ke naam unke purpose par rakho. Raat ke 3 baje device par <code>show interfaces description</code> free map ban jata hai.</p>

<div class="warn"><p><b>Common mistakes.</b> Subnet ko bilkul aaj ke users ke hisaab se size karna, aur ek naye hiring batch ke baad renumber karna. Allocation chhote subnets se shuru karna taaki bade align hi na ho sakein. WAN /30 ko LAN block se overlap kar dena kyunki dono ne same third octet use kiya. Host ko network ya broadcast address de dena. Gateway aur static range ko DHCP se exclude karna bhool jana.</p></div>

<div class="exam"><p><b>Exam traps.</b> Usable hosts 2<sup>h</sup> minus 2 hota hai, 2<sup>h</sup> nahi. Question "smallest subnet that fits" bol sakta hai, to 50 hosts ke liye /25 galat answer hai chahe woh kaam kare. WAN link ke dono router ends gino. OSPF network statement ka wildcard mask subnet mask ka ulta hota hai. Link-local IPv6 addresses (FE80::/10) plan ka hissa nahi hote lekin har interface par hote hain.</p></div>

<div class="scn"><h4>Woh subnet jo pehle Monday ko hi bhar gaya</h4><p>Nashik branch ko 25 staff ke liye 10.2.10.0/26 mila tha. Kaagaz par plan sahi lag raha tha. Phir company ne 30 contract workers wahan shift kiye aur IP phones lagaye. Tuesday tak DHCP pool khatam ho gaya aur aadhe naye users ko 169.254 addresses mile. Fix ke liye naya subnet, naya DHCP scope, badli hui ACL aur updated documentation chahiye thi. Shuru se /25 plan hota to yeh extra kaam bach jata.</p><p><b>Lesson:</b> size users plus phones plus growth se nikalo, aaj ki headcount se nahi.</p></div>

<div class="iv"><p class="q">"Teen sites wali company ka IP plan kaise design karoge?"</p><p>Strong answer: har site ke liye ek summarisable block, VLAN numbers se VLAN subnets nikalne ka fixed rule, growth ke saath bade se chhote VLSM, point-to-point ke liye /30, loopbacks /32, gateways aur servers ke liye reserved ranges, har site ke liye IPv6 /48 aur har VLAN ke liye /64, aur ek likhi hui table jo updated rehti hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har site ka ek summarisable block, VLAN numbers se fixed rule ke through subnets.</li>
<li>VLSM: growth jodo, 2^h minus 2 hosts wala sabse chhota block chuno, bade se pehle allocate karo.</li>
<li>IPv6 plan: har site /48, har VLAN /64, VLAN number subnet ID.</li>
<li>Gateway, HSRP aur static ranges reserve karo aur DHCP se exclude karo.</li>
<li>Consistent hostnames aur interface descriptions plan ka hissa hain.</li>
</ul></div>
`}};export{e as default};