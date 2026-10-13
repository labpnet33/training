var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You started this module afraid of subnetting and you finish it with two reliable methods, a design process and a troubleshooting workflow. Think of this chapter as the pilot's checklist before take-off: read it the night before the exam and again before any change window that touches addressing.</p>

<h3>Can-do checklist</h3>
<ul>
<li>Convert any octet between decimal and binary, and any mask between dotted, prefix and hex forms.</li>
<li>Name the classes by first octet, the three RFC 1918 blocks, and the special ranges: 127/8, 169.254/16, 224/4, 255.255.255.255, 100.64/10, the documentation ranges.</li>
<li>For any address and mask, give network, first usable, last usable, broadcast and host count in about 20 seconds.</li>
<li>Choose the prefix for a number of hosts or a number of subnets, including two-constraint questions.</li>
<li>Split a network into N equal subnets and name the N-th subnet directly.</li>
<li>Build a VLSM plan, largest first, with no overlaps, and list the free space.</li>
<li>Find the best summary for a set of networks and recognise over-summarisation.</li>
<li>Configure and verify addresses on IOS routers and switches, and read Windows, macOS and Linux output.</li>
<li>Troubleshoot wrong masks, wrong gateways, duplicates and overlapping subnets with a fixed workflow.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="The block size method on one card">
<rect x="20" y="20" width="600" height="160" rx="10" fill="#e2e8f0"/>
<text x="320" y="46" text-anchor="middle" class="svg-ink" font-size="14">The one-card method</text>
<text x="40" y="76" class="svg-ink" font-size="13">1. interesting octet = where the mask is not 255 or 0</text>
<text x="40" y="100" class="svg-ink" font-size="13">2. block = 256 − mask octet</text>
<text x="40" y="124" class="svg-ink" font-size="13">3. network = largest multiple of block at or below the address</text>
<text x="40" y="148" class="svg-ink" font-size="13">4. broadcast = next multiple − 1 (octets to the right = 255)</text>
<text x="40" y="170" class="svg-accent" font-size="13">5. hosts = 2^h − 2 (except /31 = 2 and /32 = 1)</text>
</svg><p class="cap">Everything in chapters 5 to 8 compressed into five lines.</p></div>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Octet</dt><dd>8 bits of an IPv4 address, 0 to 255.</dd>
<dt>Subnet mask / prefix</dt><dd>Contiguous 1s marking the network part; the prefix counts them.</dd>
<dt>Interesting octet</dt><dd>The octet where the mask boundary falls.</dd>
<dt>Block size (magic number)</dt><dd>256 minus the interesting mask octet; subnets start on its multiples.</dd>
<dt>Network / broadcast address</dt><dd>Host bits all 0 / all 1; neither can be assigned.</dd>
<dt>CIDR</dt><dd>Classless addressing: masks on any bit, prefixes written /n, routes can be aggregated.</dd>
<dt>VLSM</dt><dd>Different prefix lengths inside one block, allocated largest first.</dd>
<dt>Summarisation (supernetting)</dt><dd>One shorter prefix covering many routes.</dd>
<dt>RFC 1918</dt><dd>Private ranges 10/8, 172.16/12, 192.168/16.</dd>
<dt>APIPA</dt><dd>169.254.0.0/16 self-assigned address after DHCP failure.</dd>
<dt>Longest prefix match</dt><dd>Routers forward using the most specific matching route.</dd>
</dl>

<h3>Most-tested facts</h3>
<table class="cmp"><tr><th>Prefix</th><th>Mask</th><th>Block</th><th>Hosts</th></tr>
<tr><td>/24</td><td>255.255.255.0</td><td>256</td><td>254</td></tr>
<tr><td>/25</td><td>255.255.255.128</td><td>128</td><td>126</td></tr>
<tr><td>/26</td><td>255.255.255.192</td><td>64</td><td>62</td></tr>
<tr><td>/27</td><td>255.255.255.224</td><td>32</td><td>30</td></tr>
<tr><td>/28</td><td>255.255.255.240</td><td>16</td><td>14</td></tr>
<tr><td>/29</td><td>255.255.255.248</td><td>8</td><td>6</td></tr>
<tr><td>/30</td><td>255.255.255.252</td><td>4</td><td>2</td></tr>
<tr><td>/31</td><td>255.255.255.254</td><td>2</td><td>2 (point-to-point)</td></tr>
<tr><td>/32</td><td>255.255.255.255</td><td>1</td><td>1 (host route)</td></tr></table>
<ul>
<li>Classes: A 1-126, B 128-191, C 192-223, D 224-239, E 240-255. 127 is loopback.</li>
<li>172.16.0.0/12 ends at 172.31.255.255; 100.64.0.0/10 is not RFC 1918.</li>
<li>Third-octet prefixes: /23 block 2 (510 hosts), /22 block 4 (1,022), /21 block 8 (2,046), /20 block 16 (4,094).</li>
<li>Best summary = longest prefix covering all networks.</li>
<li>IOS <code>ip address</code> uses a dotted mask and replaces the previous primary address.</li>
</ul>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! Cisco IOS</span>
interface GigabitEthernet0/1
 ip address 192.168.50.1 255.255.255.128
 no shutdown
show ip interface brief            <span class="c">! status, no mask</span>
show ip interface GigabitEthernet0/1   <span class="c">! address with /prefix</span>
show ip route connected            <span class="c">! C and L routes</span>
show ip arp
<span class="c">! Lab PCs</span>
PCA&gt; ip 192.168.50.126/25 192.168.50.1
<span class="c">! Windows: ipconfig /all, route print</span>
<span class="c">! macOS:   ifconfig en0, netstat -rn -f inet, networksetup -getinfo "Wi-Fi"</span>
<span class="c">! Linux:   ip addr, ip route, resolvectl status</span></pre>

<h3>Final mixed drill (answers below)</h3>
<p><b>a)</b> Broadcast of 172.16.45.77/27? <b>b)</b> Mask for 60 hosts with least waste? <b>c)</b> Is 10.1.10.0 a valid host in 10.1.8.0/22? <b>d)</b> How many /28s fit in a /24? <b>e)</b> Best summary of 10.10.32.0/24 to 10.10.35.0/24?</p>
<div class="tip"><p><b>Answers.</b> a) block 32, 64 to 95 → 172.16.45.95. b) /26, 255.255.255.192 (62 hosts). c) yes: the subnet runs 10.1.8.0 to 10.1.11.255, and 10.1.10.0 is neither end. d) 2<sup>4</sup> = 16. e) 10.10.32.0/22.</p></div>

<div class="warn"><p><b>Last-minute mistakes to avoid.</b> Forgetting the −2 for hosts, forgetting to set octets to the right of the interesting octet to 255 for a broadcast, using the wrong octet for the block size, and trusting <code>show ip interface brief</code> to prove a mask.</p></div>

<div class="exam"><p><b>Exam strategy.</b> Write the prefix, mask, block and host table on your note board at the start. Convert the mask form first, then calculate. For "valid host" questions compute network and broadcast for every option. Budget about 20 seconds per calculation so you have time for the simulations.</p></div>

<div class="scn"><h4>The change review that paid for itself</h4><p>A network team adopted one rule after a year of addressing incidents: every change that adds or modifies an IPv4 subnet must include a table with network, mask, gateway, broadcast and the free space left in the parent block, checked by a second engineer using the block size method. In the following year the team recorded zero overlap or wrong-mask incidents, and reviews took under five minutes each.</p><p><b>Lesson:</b> the maths in this module is simple; making it a habit, written down and checked, is what keeps networks clean.</p></div>

<div class="iv"><p class="q">"Rate your subnetting skills. Can you show me quickly?"</p><p>Strong answer: do not just say "good". Offer to solve one on the spot, for example 10.20.30.50/26: block 64, network 10.20.30.0, broadcast .63, 62 hosts, gateway usually .1. Then add one design sentence (VLSM largest first, summarisable site blocks) and one operational sentence (you verify masks with <code>show ip interface</code>, not the brief output). Next in this track: IPv6 addressing, where the same ideas apply to 128 bits and /64 subnets.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Block size method for speed, binary method for proof; both give the same answer.</li>
<li>Hosts = 2<sup>h</sup> − 2, subnets = 2<sup>s</sup>; /31 and /32 are the exceptions.</li>
<li>VLSM largest first; summarise on aligned boundaries with the longest covering prefix.</li>
<li>Verify every host's address, mask, gateway and DNS, and every router interface's mask.</li>
<li>Troubleshoot with the fixed seven-step workflow and verify both directions.</li>
</ul></div>
`,hi:`
<p>Aapne yeh module subnetting se darte hue shuru kiya tha aur ab aap ise do reliable methods, ek design process aur ek troubleshooting workflow ke saath khatam kar rahe ho. Is chapter ko take-off se pehle pilot ki checklist samjho: exam se pehle raat ko padho aur addressing ko chhoone wale kisi bhi change window se pehle phir padho.</p>

<h3>Can-do checklist</h3>
<ul>
<li>Kisi bhi octet ko decimal aur binary ke beech, aur kisi bhi mask ko dotted, prefix aur hex forms ke beech convert karo.</li>
<li>First octet se classes, teeno RFC 1918 blocks, aur special ranges batao: 127/8, 169.254/16, 224/4, 255.255.255.255, 100.64/10, documentation ranges.</li>
<li>Kisi bhi address aur mask ke liye lagbhag 20 seconds mein network, first usable, last usable, broadcast aur host count do.</li>
<li>Hosts ki sankhya ya subnets ki sankhya ke liye prefix chuno, two-constraint sawaalon samet.</li>
<li>Network ko N barabar subnets mein baanto aur N-th subnet seedha batao.</li>
<li>Sabse bada pehle, bina overlap ke VLSM plan banao, aur free space list karo.</li>
<li>Networks ke set ke liye best summary dhoondo aur over-summarisation pehchano.</li>
<li>IOS routers aur switches par addresses configure aur verify karo, aur Windows, macOS aur Linux output padho.</li>
<li>Fixed workflow se galat masks, galat gateways, duplicates aur overlapping subnets troubleshoot karo.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Ek card par block size method">
<rect x="20" y="20" width="600" height="160" rx="10" fill="#e2e8f0"/>
<text x="320" y="46" text-anchor="middle" class="svg-ink" font-size="14">Ek-card method</text>
<text x="40" y="76" class="svg-ink" font-size="13">1. interesting octet = jahan mask 255 ya 0 nahi hai</text>
<text x="40" y="100" class="svg-ink" font-size="13">2. block = 256 − mask octet</text>
<text x="40" y="124" class="svg-ink" font-size="13">3. network = address ke barabar ya neeche block ka sabse bada multiple</text>
<text x="40" y="148" class="svg-ink" font-size="13">4. broadcast = agla multiple − 1 (right ke octets = 255)</text>
<text x="40" y="170" class="svg-accent" font-size="13">5. hosts = 2^h − 2 (sirf /31 = 2 aur /32 = 1 chhodkar)</text>
</svg><p class="cap">Chapters 5 se 8 ka sab kuch paanch lines mein.</p></div>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Octet</dt><dd>IPv4 address ke 8 bits, 0 se 255.</dd>
<dt>Subnet mask / prefix</dt><dd>Network part mark karne wale lagataar 1s; prefix unhe ginta hai.</dd>
<dt>Interesting octet</dt><dd>Woh octet jahan mask ki boundary padti hai.</dd>
<dt>Block size (magic number)</dt><dd>256 minus interesting mask octet; subnets iske multiples par shuru hote hain.</dd>
<dt>Network / broadcast address</dt><dd>Host bits sab 0 / sab 1; dono assign nahi ho sakte.</dd>
<dt>CIDR</dt><dd>Classless addressing: kisi bhi bit par masks, prefixes /n ki tarah likhe, routes aggregate ho sakte hain.</dd>
<dt>VLSM</dt><dd>Ek block ke andar alag prefix lengths, sabse bada pehle allocate.</dd>
<dt>Summarisation (supernetting)</dt><dd>Kai routes ko cover karne wala ek chhota prefix.</dd>
<dt>RFC 1918</dt><dd>Private ranges 10/8, 172.16/12, 192.168/16.</dd>
<dt>APIPA</dt><dd>DHCP failure ke baad khud assign hua 169.254.0.0/16 address.</dd>
<dt>Longest prefix match</dt><dd>Routers sabse specific matching route se forward karte hain.</dd>
</dl>

<h3>Sabse zyada test hone wale facts</h3>
<table class="cmp"><tr><th>Prefix</th><th>Mask</th><th>Block</th><th>Hosts</th></tr>
<tr><td>/24</td><td>255.255.255.0</td><td>256</td><td>254</td></tr>
<tr><td>/25</td><td>255.255.255.128</td><td>128</td><td>126</td></tr>
<tr><td>/26</td><td>255.255.255.192</td><td>64</td><td>62</td></tr>
<tr><td>/27</td><td>255.255.255.224</td><td>32</td><td>30</td></tr>
<tr><td>/28</td><td>255.255.255.240</td><td>16</td><td>14</td></tr>
<tr><td>/29</td><td>255.255.255.248</td><td>8</td><td>6</td></tr>
<tr><td>/30</td><td>255.255.255.252</td><td>4</td><td>2</td></tr>
<tr><td>/31</td><td>255.255.255.254</td><td>2</td><td>2 (point-to-point)</td></tr>
<tr><td>/32</td><td>255.255.255.255</td><td>1</td><td>1 (host route)</td></tr></table>
<ul>
<li>Classes: A 1-126, B 128-191, C 192-223, D 224-239, E 240-255. 127 loopback hai.</li>
<li>172.16.0.0/12, 172.31.255.255 par khatam hota hai; 100.64.0.0/10 RFC 1918 nahi hai.</li>
<li>Third-octet prefixes: /23 block 2 (510 hosts), /22 block 4 (1,022), /21 block 8 (2,046), /20 block 16 (4,094).</li>
<li>Best summary = saare networks cover karne wala sabse lamba prefix.</li>
<li>IOS <code>ip address</code> dotted mask use karta hai aur pichhle primary address ko replace karta hai.</li>
</ul>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! Cisco IOS</span>
interface GigabitEthernet0/1
 ip address 192.168.50.1 255.255.255.128
 no shutdown
show ip interface brief            <span class="c">! status, mask nahi</span>
show ip interface GigabitEthernet0/1   <span class="c">! /prefix ke saath address</span>
show ip route connected            <span class="c">! C aur L routes</span>
show ip arp
<span class="c">! Lab PCs</span>
PCA&gt; ip 192.168.50.126/25 192.168.50.1
<span class="c">! Windows: ipconfig /all, route print</span>
<span class="c">! macOS:   ifconfig en0, netstat -rn -f inet, networksetup -getinfo "Wi-Fi"</span>
<span class="c">! Linux:   ip addr, ip route, resolvectl status</span></pre>

<h3>Final mixed drill (answers neeche)</h3>
<p><b>a)</b> 172.16.45.77/27 ka broadcast? <b>b)</b> 60 hosts ke liye sabse kam waste wala mask? <b>c)</b> Kya 10.1.8.0/22 mein 10.1.10.0 valid host hai? <b>d)</b> Ek /24 mein kitne /28 fit hote hain? <b>e)</b> 10.10.32.0/24 se 10.10.35.0/24 ki best summary?</p>
<div class="tip"><p><b>Answers.</b> a) block 32, 64 se 95 → 172.16.45.95. b) /26, 255.255.255.192 (62 hosts). c) haan: subnet 10.1.8.0 se 10.1.11.255 tak chalta hai, aur 10.1.10.0 dono mein se koi end nahi. d) 2<sup>4</sup> = 16. e) 10.10.32.0/22.</p></div>

<div class="warn"><p><b>Last-minute galtiyan jinse bachna hai.</b> Hosts ke liye −2 bhoolna, broadcast ke liye interesting octet ke right ke octets ko 255 karna bhoolna, block size ke liye galat octet use karna, aur mask prove karne ke liye <code>show ip interface brief</code> par bharosa karna.</p></div>

<div class="exam"><p><b>Exam strategy.</b> Shuruaat mein apne note board par prefix, mask, block aur host table likh lo. Pehle mask ka form convert karo, phir calculate karo. "Valid host" sawaalon mein har option ke liye network aur broadcast nikalo. Har calculation ke liye lagbhag 20 seconds rakho taaki simulations ke liye time bache.</p></div>

<div class="scn"><h4>Woh change review jisne apni keemat wasool ki</h4><p>Ek saal ke addressing incidents ke baad ek network team ne ek rule apnaya: har change jo IPv4 subnet jodta ya badalta hai, usmein network, mask, gateway, broadcast aur parent block mein bache free space ki table honi chahiye, jise doosra engineer block size method se check kare. Agle saal team ne zero overlap ya wrong-mask incidents record kiye, aur har review paanch minute se kam mein hua.</p><p><b>Seekh:</b> is module ka maths simple hai; ise aadat banana, likh kar aur check karke, hi networks ko saaf rakhta hai.</p></div>

<div class="iv"><p class="q">"Apni subnetting skills ko rate karo. Kya jaldi se dikha sakte ho?"</p><p>Strong answer: sirf "achhi hai" mat bolo. Wahin ek solve karne ki offer karo, jaise 10.20.30.50/26: block 64, network 10.20.30.0, broadcast .63, 62 hosts, gateway aam taur par .1. Phir ek design sentence jodo (VLSM sabse bada pehle, summarise hone layak site blocks) aur ek operational sentence (aap masks <code>show ip interface</code> se verify karte ho, brief output se nahi). Is track mein aage: IPv6 addressing, jahan yahi ideas 128 bits aur /64 subnets par lagte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Speed ke liye block size method, proof ke liye binary method; dono same answer dete hain.</li>
<li>Hosts = 2<sup>h</sup> − 2, subnets = 2<sup>s</sup>; /31 aur /32 exceptions hain.</li>
<li>VLSM sabse bada pehle; aligned boundaries par sabse lambe covering prefix se summarise karo.</li>
<li>Har host ka address, mask, gateway aur DNS, aur har router interface ka mask verify karo.</li>
<li>Fixed saat-step workflow se troubleshoot karo aur dono directions verify karo.</li>
</ul></div>
`}};export{e as default};