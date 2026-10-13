var e={id:`vpc-cidr-subnets`,h:{en:`The VPC as your private address space: CIDR, subnets and the five reserved addresses`,hi:`VPC aapka private address space: CIDR, subnets aur paanch reserved addresses`},body:{en:`
<p>A <b>Virtual Private Cloud (VPC)</b> is a logically isolated network that you define inside one Region. Picture a plot of land that you rent for a housing society. The plot has a boundary (the VPC CIDR), you divide it into lanes (subnets), and nobody else's houses can be built on your plot. Two societies can even use the same lane numbers because they are separate plots; the trouble starts only when you want to build a road between them.</p>

<h3>CIDR in one minute</h3>
<p>A CIDR block such as <code>10.0.0.0/16</code> means "the first 16 bits are the network, the remaining 16 bits are for hosts". A <code>/16</code> holds 65,536 addresses, a <code>/24</code> holds 256, a <code>/28</code> holds 16. A VPC accepts a primary IPv4 CIDR between <b>/16 and /28</b>, and you should use private space from RFC 1918: <code>10.0.0.0/8</code>, <code>172.16.0.0/12</code> or <code>192.168.0.0/16</code>.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="A /16 VPC carved into /24 subnets">
<rect x="10" y="10" width="620" height="210" rx="10" fill="#e2e8f0"/><text x="25" y="32" class="svg-ink" font-size="14">VPC 10.0.0.0/16 (65,536 addresses)</text>
<rect x="25" y="50" width="130" height="62" rx="6" fill="#bbf7d0"/><text x="90" y="75" text-anchor="middle" class="svg-ink" font-size="12">public-a</text><text x="90" y="93" text-anchor="middle" class="svg-muted" font-size="12">10.0.1.0/24 (AZ a)</text>
<rect x="170" y="50" width="130" height="62" rx="6" fill="#bbf7d0"/><text x="235" y="75" text-anchor="middle" class="svg-ink" font-size="12">public-b</text><text x="235" y="93" text-anchor="middle" class="svg-muted" font-size="12">10.0.2.0/24 (AZ b)</text>
<rect x="315" y="50" width="130" height="62" rx="6" fill="#fde68a"/><text x="380" y="75" text-anchor="middle" class="svg-ink" font-size="12">private-a</text><text x="380" y="93" text-anchor="middle" class="svg-muted" font-size="12">10.0.11.0/24 (AZ a)</text>
<rect x="460" y="50" width="150" height="62" rx="6" fill="#fde68a"/><text x="535" y="75" text-anchor="middle" class="svg-ink" font-size="12">private-b</text><text x="535" y="93" text-anchor="middle" class="svg-muted" font-size="12">10.0.12.0/24 (AZ b)</text>
<rect x="25" y="135" width="585" height="70" rx="6" fill="none" stroke="#64748b" stroke-dasharray="5 4"/><text x="317" y="165" text-anchor="middle" class="svg-muted" font-size="12">10.0.20.0 - 10.0.255.255 left free for databases, new tiers, a third AZ</text>
<text x="317" y="188" text-anchor="middle" class="svg-accent" font-size="12">Plan for growth: do not use up the whole range</text>
</svg><p class="cap">A sensible plan keeps public and private subnets in each AZ and leaves most of the range unused.</p></div>

<h3>The five reserved addresses in every subnet</h3>
<p>In every subnet AWS keeps five addresses. For <code>10.0.1.0/24</code>:</p>
<table class="cmp">
<tr><th>Address</th><th>Use</th></tr>
<tr><td>10.0.1.0</td><td>Network address</td></tr>
<tr><td>10.0.1.1</td><td>VPC router (the subnet's default gateway)</td></tr>
<tr><td>10.0.1.2</td><td>Amazon DNS resolver (base of the VPC range plus two)</td></tr>
<tr><td>10.0.1.3</td><td>Reserved for future use</td></tr>
<tr><td>10.0.1.255</td><td>Broadcast (not supported, but reserved)</td></tr>
</table>
<p>So a /24 gives 256 - 5 = <b>251</b> usable addresses, a /28 gives only 16 - 5 = <b>11</b>. Remember: the DNS resolver is at the <i>VPC</i> base plus two, and it is also reachable at 169.254.169.253.</p>

<div class="eg"><p><b>Worked example.</b> You need 300 instances and also room for growth. A <code>/24</code> (251 usable) is too small. A <code>/23</code> has 512 - 5 = 507 usable and fits. Another way: cut two /24 subnets. In the 10.0.0.0/16 VPC, 10.0.1.0/24 and 10.0.2.0/24 are different subnets; 10.0.0.0/22 would overlap both, so AWS would reject it if both existed. Always check that subnets inside a VPC do not overlap each other.</p></div>

<h3>Plan so that you can connect later</h3>
<ul>
<li><b>Never overlap</b> ranges you may connect: VPC peering, Transit Gateway, VPN to the office, a second account. Two VPCs that both use <code>10.0.0.0/16</code> cannot be peered.</li>
<li>Keep one company-wide address plan, for example <code>10.10.0.0/16</code> for production, <code>10.20.0.0/16</code> for development and <code>10.30.0.0/16</code> for the lab account.</li>
<li>You can add secondary CIDR blocks to a VPC later, but you cannot resize the primary one, so start with a /16 and subnets of /24 or /20.</li>
<li>Avoid the office LAN range (often <code>192.168.1.0/24</code> or <code>10.0.0.0/24</code>); it will clash with the VPN.</li>
</ul>

<h3>The default VPC</h3>
<p>Every account has a <b>default VPC</b> in each Region, with a CIDR of <code>172.31.0.0/16</code>, one /20 public subnet per AZ, an internet gateway and a route to it. It is convenient for a quick test, but production should use a custom VPC you designed. You can delete the default VPC and recreate it later from the console.</p>
<pre class="code"><span class="c"># List VPCs in the current Region, with their ranges and whether they are the default</span>
aws ec2 describe-vpcs --query 'Vpcs[].[VpcId,CidrBlock,IsDefault]' --output table</pre>
<pre class="out"><span class="c"># Illustrative output</span>
---------------------------------------------------
|                  DescribeVpcs                   |
+------------------------+----------------+-------+
|  vpc-0a1b2c3d4e5f60718 |  10.0.0.0/16   | False |
|  vpc-0f9e8d7c6b5a40312 |  <span class="hl">172.31.0.0/16</span>  | <span class="hl">True</span>  |
+------------------------+----------------+-------+</pre>

<h3>Shared responsibility for the network</h3>
<p>AWS runs the physical network, cables, routers and the hypervisor. You own the VPC design: CIDR, subnets, route tables, security groups, network ACLs, what is exposed to the internet and the operating system patches. If an instance is breached because port 22 was open to the world, that is on you, not on AWS.</p>

<div class="warn"><p><b>Common mistake.</b> Choosing a tiny VPC (/24) "because it is only a test", then needing to grow it. You cannot resize the primary CIDR. Another mistake is counting 254 hosts in a /24; AWS gives 251.</p></div>

<div class="exam"><p><b>Exam trap.</b> The VPC CIDR range allowed is /16 to /28. The five reserved addresses are network, router (.1), DNS (.2), future use (.3) and broadcast (last). VPC peering needs non-overlapping CIDRs.</p></div>

<div class="scn"><h4>The overlapping offices</h4><p>A company built its dev and prod VPCs in two accounts, both as <code>10.0.0.0/16</code>, because "it was the default in the tutorial". Six months later they needed a Transit Gateway between them. The route tables could not tell the two 10.0.x.x networks apart and the attachments were rejected. The fix was to rebuild one VPC with <code>10.20.0.0/16</code> and migrate workloads over a weekend.</p><p><b>Lesson:</b> a one-hour address plan at the start saves a weekend of migration later.</p></div>

<div class="iv"><p class="q">"How many usable IP addresses are in a /24 subnet in AWS, and why?"</p><p>251. A /24 has 256 addresses and AWS reserves the first four and the last one in every subnet: network, VPC router, DNS, future use and broadcast. Mention that the VPC CIDR must be between /16 and /28 and must not overlap anything you will connect later.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A VPC is a regional, isolated network with a primary IPv4 CIDR between /16 and /28.</li>
<li>Use RFC 1918 ranges and one company-wide plan so VPCs can be peered later.</li>
<li>AWS reserves five addresses per subnet: a /24 has 251 usable.</li>
<li>The default VPC (172.31.0.0/16) exists per Region; design a custom one for real workloads.</li>
<li>You design the network and its security; AWS runs the physical layer.</li>
</ul></div>
`,hi:`
<p><b>Virtual Private Cloud (VPC)</b> ek logically isolated network hai jo aap ek Region ke andar define karte ho. Socho ek zameen ka plot jo aap housing society ke liye kiraye par lete ho. Plot ki boundary hai (VPC CIDR), aap use lanes mein baantte ho (subnets), aur kisi aur ke ghar aapke plot par nahi ban sakte. Do societies same lane numbers bhi use kar sakti hain kyunki woh alag plots hain; dikkat tab hoti hai jab aap dono ke beech sadak banana chahte ho.</p>

<h3>CIDR ek minute mein</h3>
<p><code>10.0.0.0/16</code> jaise CIDR block ka matlab: "pehle 16 bits network hain, baaki 16 bits hosts ke liye". <code>/16</code> mein 65,536 addresses, <code>/24</code> mein 256, <code>/28</code> mein 16 hote hain. VPC ek primary IPv4 CIDR <b>/16 se /28</b> ke beech leta hai, aur aapko RFC 1918 private space use karna chahiye: <code>10.0.0.0/8</code>, <code>172.16.0.0/12</code> ya <code>192.168.0.0/16</code>.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="/16 VPC ko /24 subnets mein kaata gaya">
<rect x="10" y="10" width="620" height="210" rx="10" fill="#e2e8f0"/><text x="25" y="32" class="svg-ink" font-size="14">VPC 10.0.0.0/16 (65,536 addresses)</text>
<rect x="25" y="50" width="130" height="62" rx="6" fill="#bbf7d0"/><text x="90" y="75" text-anchor="middle" class="svg-ink" font-size="12">public-a</text><text x="90" y="93" text-anchor="middle" class="svg-muted" font-size="12">10.0.1.0/24 (AZ a)</text>
<rect x="170" y="50" width="130" height="62" rx="6" fill="#bbf7d0"/><text x="235" y="75" text-anchor="middle" class="svg-ink" font-size="12">public-b</text><text x="235" y="93" text-anchor="middle" class="svg-muted" font-size="12">10.0.2.0/24 (AZ b)</text>
<rect x="315" y="50" width="130" height="62" rx="6" fill="#fde68a"/><text x="380" y="75" text-anchor="middle" class="svg-ink" font-size="12">private-a</text><text x="380" y="93" text-anchor="middle" class="svg-muted" font-size="12">10.0.11.0/24 (AZ a)</text>
<rect x="460" y="50" width="150" height="62" rx="6" fill="#fde68a"/><text x="535" y="75" text-anchor="middle" class="svg-ink" font-size="12">private-b</text><text x="535" y="93" text-anchor="middle" class="svg-muted" font-size="12">10.0.12.0/24 (AZ b)</text>
<rect x="25" y="135" width="585" height="70" rx="6" fill="none" stroke="#64748b" stroke-dasharray="5 4"/><text x="317" y="165" text-anchor="middle" class="svg-muted" font-size="12">10.0.20.0 - 10.0.255.255 databases, naye tiers, teesri AZ ke liye khali</text>
<text x="317" y="188" text-anchor="middle" class="svg-accent" font-size="12">Growth ke liye plan karo: poori range use mat karo</text>
</svg><p class="cap">Samajhdaar plan har AZ mein public aur private subnet rakhta hai aur zyadatar range khali chhodta hai.</p></div>

<h3>Har subnet mein paanch reserved addresses</h3>
<p>Har subnet mein AWS paanch addresses apne paas rakhta hai. <code>10.0.1.0/24</code> ke liye:</p>
<table class="cmp">
<tr><th>Address</th><th>Use</th></tr>
<tr><td>10.0.1.0</td><td>Network address</td></tr>
<tr><td>10.0.1.1</td><td>VPC router (subnet ka default gateway)</td></tr>
<tr><td>10.0.1.2</td><td>Amazon DNS resolver (VPC range ka base plus do)</td></tr>
<tr><td>10.0.1.3</td><td>Future use ke liye reserved</td></tr>
<tr><td>10.0.1.255</td><td>Broadcast (supported nahi, par reserved)</td></tr>
</table>
<p>Isliye /24 mein 256 - 5 = <b>251</b> usable addresses milte hain, /28 mein sirf 16 - 5 = <b>11</b>. Yaad rakho: DNS resolver <i>VPC</i> ke base plus do par hota hai, aur 169.254.169.253 par bhi reachable hai.</p>

<div class="eg"><p><b>Worked example.</b> Aapko 300 instances chahiye aur growth ki jagah bhi. <code>/24</code> (251 usable) chhota hai. <code>/23</code> mein 512 - 5 = 507 usable hain aur fit ho jaata hai. Doosra tareeka: do /24 subnets kaato. 10.0.0.0/16 VPC mein 10.0.1.0/24 aur 10.0.2.0/24 alag subnets hain; 10.0.0.0/22 dono ko overlap karta, isliye dono maujood hone par AWS use reject kar dega. Hamesha check karo ki VPC ke andar subnets ek doosre ko overlap na karein.</p></div>

<h3>Aise plan karo ki baad mein connect ho sake</h3>
<ul>
<li>Jin ranges ko aap connect kar sakte ho unhe <b>kabhi overlap mat karo</b>: VPC peering, Transit Gateway, office VPN, doosra account. Do VPC jo dono <code>10.0.0.0/16</code> use karte hain peer nahi ho sakte.</li>
<li>Company-wide ek address plan rakho, jaise production ke liye <code>10.10.0.0/16</code>, development ke liye <code>10.20.0.0/16</code> aur lab account ke liye <code>10.30.0.0/16</code>.</li>
<li>VPC mein baad mein secondary CIDR blocks jod sakte ho, par primary ko resize nahi kar sakte, isliye /16 se shuru karo aur subnets /24 ya /20 rakho.</li>
<li>Office LAN range se bacho (aksar <code>192.168.1.0/24</code> ya <code>10.0.0.0/24</code>); VPN ke saath clash karegi.</li>
</ul>

<h3>Default VPC</h3>
<p>Har account mein har Region mein ek <b>default VPC</b> hota hai, jiski CIDR <code>172.31.0.0/16</code> hoti hai, har AZ mein ek /20 public subnet, ek internet gateway aur uska route hota hai. Quick test ke liye convenient hai, par production ke liye apna design kiya custom VPC use karo. Default VPC delete bhi kar sakte ho aur baad mein console se wapas bana sakte ho.</p>
<pre class="code"><span class="c"># Current Region ke VPCs, unki ranges aur default hai ya nahi</span>
aws ec2 describe-vpcs --query 'Vpcs[].[VpcId,CidrBlock,IsDefault]' --output table</pre>
<pre class="out"><span class="c"># Illustrative output</span>
---------------------------------------------------
|                  DescribeVpcs                   |
+------------------------+----------------+-------+
|  vpc-0a1b2c3d4e5f60718 |  10.0.0.0/16   | False |
|  vpc-0f9e8d7c6b5a40312 |  <span class="hl">172.31.0.0/16</span>  | <span class="hl">True</span>  |
+------------------------+----------------+-------+</pre>

<h3>Network ki shared responsibility</h3>
<p>AWS physical network, cables, routers aur hypervisor chalata hai. VPC design aapka hai: CIDR, subnets, route tables, security groups, network ACLs, internet par kya exposed hai aur operating system ke patches. Agar port 22 poori duniya ke liye khuli hone ki wajah se instance hack hua, to zimmedari aapki hai, AWS ki nahi.</p>

<div class="warn"><p><b>Common mistake.</b> "Sirf test hai" soch kar chhota VPC (/24) lena, phir ise badhane ki zaroorat padna. Primary CIDR resize nahi hota. Ek aur galti: /24 mein 254 hosts ginna; AWS 251 deta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> VPC CIDR range /16 se /28 allowed hai. Paanch reserved addresses: network, router (.1), DNS (.2), future use (.3) aur broadcast (aakhri). VPC peering ke liye non-overlapping CIDRs chahiye.</p></div>

<div class="scn"><h4>Overlapping offices</h4><p>Ek company ne dev aur prod VPC do accounts mein dono <code>10.0.0.0/16</code> se banaye, kyunki "tutorial mein default yahi tha". Chhe mahine baad dono ke beech Transit Gateway chahiye tha. Route tables do 10.0.x.x networks mein farak nahi kar paaye aur attachments reject ho gaye. Fix: ek VPC ko <code>10.20.0.0/16</code> ke saath dobara banana aur ek weekend mein workloads migrate karna.</p><p><b>Lesson:</b> shuru mein ek ghante ka address plan baad ke ek weekend ki migration bacha leta hai.</p></div>

<div class="iv"><p class="q">"AWS mein /24 subnet mein kitne usable IP addresses hote hain, aur kyun?"</p><p>251. /24 mein 256 addresses hain aur AWS har subnet mein pehle chaar aur aakhri ek reserve karta hai: network, VPC router, DNS, future use aur broadcast. Yeh bhi batao ki VPC CIDR /16 se /28 ke beech hona chahiye aur jo baad mein connect hoga usse overlap nahi karna chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VPC regional, isolated network hai jiski primary IPv4 CIDR /16 se /28 hoti hai.</li>
<li>RFC 1918 ranges aur company-wide ek plan use karo taaki VPCs baad mein peer ho sakein.</li>
<li>AWS har subnet mein paanch addresses reserve karta hai: /24 mein 251 usable.</li>
<li>Default VPC (172.31.0.0/16) har Region mein hota hai; real workloads ke liye custom VPC design karo.</li>
<li>Network aur uski security aap design karte ho; physical layer AWS chalata hai.</li>
</ul></div>
`}};export{e as default};