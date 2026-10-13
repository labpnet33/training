var e={id:`ipv4-binary`,h:{en:`IPv4 addresses and binary made easy`,hi:`IPv4 addresses aur binary aasaan tareeke se`},body:{en:`
<p>Subnetting looks like magic until you see the bits. This chapter teaches IPv4 addressing and binary in small steps, using only the 8-column table you can draw in five seconds.</p>

<h3>An IPv4 address is 32 bits</h3>
<p>The address <code>192.0.2.10</code> is four numbers, called <b>octets</b>, each made of 8 bits (0 or 1). Each bit position has a place value, doubling from right to left:</p>
<table class="cmp"><tr><th>128</th><th>64</th><th>32</th><th>16</th><th>8</th><th>4</th><th>2</th><th>1</th><th>Decimal</th></tr>
<tr><td>1</td><td>1</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>192</td></tr>
<tr><td>0</td><td>0</td><td>0</td><td>0</td><td>1</td><td>0</td><td>1</td><td>0</td><td>10</td></tr>
<tr><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td><td>0</td><td>0</td><td>252</td></tr>
<tr><td>1</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>128</td></tr></table>
<p>To convert, add the place values where the bit is 1: 192 = 128 + 64; 10 = 8 + 2; 252 = 128 + 64 + 32 + 16 + 8 + 4. To go the other way, subtract: 172 minus 128 = 44, minus 32 = 12, minus 8 = 4, minus 4 = 0, so 172 = 10101100.</p>

<h3>Prefix length and mask</h3>
<p>The <b>prefix length</b> (for example /26) says how many leading bits form the <b>network</b> part. The rest are <b>host</b> bits. The same idea is written as a <b>subnet mask</b>: the network bits set to 1.</p>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Mask /26 in binary">
<text x="10" y="25" class="svg-muted" font-size="12">Address</text>
<rect x="80" y="10" width="140" height="26" rx="4" fill="#bae6fd"/><text x="150" y="28" text-anchor="middle" class="svg-ink" font-size="12">10 . 50 . 0 . 140</text>
<text x="10" y="75" class="svg-muted" font-size="12">Mask</text>
<rect x="80" y="55" width="75" height="26" rx="4" fill="#bbf7d0"/><text x="118" y="73" text-anchor="middle" class="svg-ink" font-size="12">11111111</text>
<rect x="160" y="55" width="75" height="26" rx="4" fill="#bbf7d0"/><text x="198" y="73" text-anchor="middle" class="svg-ink" font-size="12">11111111</text>
<rect x="240" y="55" width="75" height="26" rx="4" fill="#bbf7d0"/><text x="278" y="73" text-anchor="middle" class="svg-ink" font-size="12">11111111</text>
<rect x="320" y="55" width="75" height="26" rx="4" fill="#bbf7d0"/><text x="358" y="73" text-anchor="middle" class="svg-ink" font-size="11">11</text><rect x="345" y="55" width="50" height="26" rx="4" fill="#fde68a"/><text x="370" y="73" text-anchor="middle" class="svg-ink" font-size="11">000000</text>
<text x="420" y="73" class="svg-ink" font-size="13">= /26 = 255.255.255.192</text>
<text x="80" y="115" class="svg-ink" font-size="13">26 network bits (green) + 6 host bits (yellow)</text>
<text x="80" y="140" class="svg-muted" font-size="12">Host bits 6 gives 2^6 = 64 addresses; minus network and broadcast = 62 usable</text>
</svg><p class="cap">A /26 keeps 26 bits for the network and leaves 6 bits for hosts.</p></div>
<table class="cmp"><tr><th>Prefix</th><th>Mask</th><th>Block size</th><th>Usable hosts</th></tr>
<tr><td>/24</td><td>255.255.255.0</td><td>256</td><td>254</td></tr>
<tr><td>/25</td><td>255.255.255.128</td><td>128</td><td>126</td></tr>
<tr><td>/26</td><td>255.255.255.192</td><td>64</td><td>62</td></tr>
<tr><td>/27</td><td>255.255.255.224</td><td>32</td><td>30</td></tr>
<tr><td>/28</td><td>255.255.255.240</td><td>16</td><td>14</td></tr>
<tr><td>/30</td><td>255.255.255.252</td><td>4</td><td>2</td></tr>
<tr><td>/32</td><td>255.255.255.255</td><td>1</td><td>one host (loopback)</td></tr></table>
<p>Usable hosts = 2<sup>host bits</sup> minus 2: the all-zeros host is the <b>network address</b> and the all-ones host is the <b>broadcast address</b>. (Point-to-point /31 links, RFC 3021, use both addresses; Junos supports them.)</p>

<h3>Special and private ranges</h3>
<ul><li>Private (RFC 1918): 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16.</li>
<li>Loopback 127.0.0.0/8; link-local 169.254.0.0/16 (self-assigned when DHCP fails).</li>
<li>Documentation: 192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24.</li>
<li>Multicast 224.0.0.0/4; OSPF uses 224.0.0.5 and 224.0.0.6.</li>
<li>Default route 0.0.0.0/0 matches everything.</li></ul>

<h3>Putting addresses on Junos</h3>
<p>An address always sits on a <b>logical unit</b> under <code>family inet</code>, written with a prefix length:</p>
<pre class="code">set interfaces ge-0/0/0 unit 0 family inet address 10.50.0.194/30
set interfaces lo0 unit 0 family inet address 198.51.100.1/32
set interfaces irb unit 10 family inet address 10.50.0.1/25</pre>
<pre class="out">lab@R1&gt; show interfaces terse ge-0/0/0
Interface               Admin Link Proto    Local                 Remote
ge-0/0/0                up    up
<span class="hl">ge-0/0/0.0              up    up   inet     10.50.0.194/30</span></pre>

<div class="eg"><p><b>Worked example.</b> Is 10.50.0.140 inside 10.50.0.128/26? A /26 has block size 64, so subnets start at .0, .64, .128, .192. The address 140 falls between 128 and 191, so yes. Its network address is .128 and its broadcast is .191.</p></div>

<div class="warn"><p><b>Common mistake.</b> Assigning the network or broadcast address to a host, for example 10.50.0.128/26 as a PC address. Another: using a /24 mask on one side and /25 on the other of the same link, so the two sides disagree about what is local.</p></div>

<div class="scn"><h4>The off-by-one address</h4><p>A technician typed 10.50.0.191/26 on a server. The server could ping some hosts but not others, and the switch logged strange ARP behaviour. The engineer converted the address: .191 is the broadcast of 10.50.0.128/26. Changing the server to .150 fixed it.</p><p><b>Lesson:</b> always find the network and broadcast addresses of a subnet before assigning hosts.</p></div>

<div class="iv"><p class="q">"How many usable hosts are in a /27 and why?"</p><p>A /27 leaves 5 host bits: 2^5 = 32 addresses, minus the network and broadcast addresses, gives 30 usable hosts. Mention block size 32 and that the mask is 255.255.255.224.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IPv4 = 32 bits in four octets; place values 128, 64, 32, 16, 8, 4, 2, 1.</li>
<li>Prefix length = number of network bits; the rest are host bits.</li>
<li>Usable hosts = 2^host bits minus 2; block size = 256 minus the mask octet.</li>
<li>Memorise RFC 1918, loopback, link-local and documentation ranges.</li>
<li>On Junos, addresses go on a unit under family inet with a prefix length.</li>
</ul></div>
`,hi:`
<p>Jab tak aap bits nahi dekhte, subnetting jaadu lagti hai. Yeh chapter IPv4 addressing aur binary chhote steps mein sikhata hai, sirf us 8-column table se jo aap paanch second mein bana sakte ho.</p>

<h3>IPv4 address 32 bits ka hota hai</h3>
<p>Address <code>192.0.2.10</code> chaar numbers hain, jinhe <b>octets</b> kehte hain, har ek 8 bits (0 ya 1) ka. Har bit position ki ek place value hoti hai, jo daayen se baayen double hoti hai:</p>
<table class="cmp"><tr><th>128</th><th>64</th><th>32</th><th>16</th><th>8</th><th>4</th><th>2</th><th>1</th><th>Decimal</th></tr>
<tr><td>1</td><td>1</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>192</td></tr>
<tr><td>0</td><td>0</td><td>0</td><td>0</td><td>1</td><td>0</td><td>1</td><td>0</td><td>10</td></tr>
<tr><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td><td>0</td><td>0</td><td>252</td></tr>
<tr><td>1</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>128</td></tr></table>
<p>Convert karne ke liye jahan bit 1 hai wahan ki place values jodo: 192 = 128 + 64; 10 = 8 + 2; 252 = 128 + 64 + 32 + 16 + 8 + 4. Ulta karne ke liye ghatao: 172 minus 128 = 44, minus 32 = 12, minus 8 = 4, minus 4 = 0, to 172 = 10101100.</p>

<h3>Prefix length aur mask</h3>
<p><b>Prefix length</b> (jaise /26) batati hai ki shuru ke kitne bits <b>network</b> part hain. Baaki <b>host</b> bits hain. Wahi idea <b>subnet mask</b> ke roop mein likha jaata hai: network bits 1 set.</p>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Binary mein mask /26">
<text x="10" y="25" class="svg-muted" font-size="12">Address</text>
<rect x="80" y="10" width="140" height="26" rx="4" fill="#bae6fd"/><text x="150" y="28" text-anchor="middle" class="svg-ink" font-size="12">10 . 50 . 0 . 140</text>
<text x="10" y="75" class="svg-muted" font-size="12">Mask</text>
<rect x="80" y="55" width="75" height="26" rx="4" fill="#bbf7d0"/><text x="118" y="73" text-anchor="middle" class="svg-ink" font-size="12">11111111</text>
<rect x="160" y="55" width="75" height="26" rx="4" fill="#bbf7d0"/><text x="198" y="73" text-anchor="middle" class="svg-ink" font-size="12">11111111</text>
<rect x="240" y="55" width="75" height="26" rx="4" fill="#bbf7d0"/><text x="278" y="73" text-anchor="middle" class="svg-ink" font-size="12">11111111</text>
<rect x="320" y="55" width="75" height="26" rx="4" fill="#bbf7d0"/><text x="358" y="73" text-anchor="middle" class="svg-ink" font-size="11">11</text><rect x="345" y="55" width="50" height="26" rx="4" fill="#fde68a"/><text x="370" y="73" text-anchor="middle" class="svg-ink" font-size="11">000000</text>
<text x="420" y="73" class="svg-ink" font-size="13">= /26 = 255.255.255.192</text>
<text x="80" y="115" class="svg-ink" font-size="13">26 network bits (green) + 6 host bits (yellow)</text>
<text x="80" y="140" class="svg-muted" font-size="12">6 host bits = 2^6 = 64 addresses; network aur broadcast hatao = 62 usable</text>
</svg><p class="cap">/26 network ke liye 26 bits rakhta hai aur hosts ke liye 6 bits chhodta hai.</p></div>
<table class="cmp"><tr><th>Prefix</th><th>Mask</th><th>Block size</th><th>Usable hosts</th></tr>
<tr><td>/24</td><td>255.255.255.0</td><td>256</td><td>254</td></tr>
<tr><td>/25</td><td>255.255.255.128</td><td>128</td><td>126</td></tr>
<tr><td>/26</td><td>255.255.255.192</td><td>64</td><td>62</td></tr>
<tr><td>/27</td><td>255.255.255.224</td><td>32</td><td>30</td></tr>
<tr><td>/28</td><td>255.255.255.240</td><td>16</td><td>14</td></tr>
<tr><td>/30</td><td>255.255.255.252</td><td>4</td><td>2</td></tr>
<tr><td>/32</td><td>255.255.255.255</td><td>1</td><td>ek host (loopback)</td></tr></table>
<p>Usable hosts = 2<sup>host bits</sup> minus 2: all-zeros host <b>network address</b> hai aur all-ones host <b>broadcast address</b>. (Point-to-point /31 links, RFC 3021, dono addresses use karte hain; Junos support karta hai.)</p>

<h3>Special aur private ranges</h3>
<ul><li>Private (RFC 1918): 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16.</li>
<li>Loopback 127.0.0.0/8; link-local 169.254.0.0/16 (DHCP fail hone par self-assigned).</li>
<li>Documentation: 192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24.</li>
<li>Multicast 224.0.0.0/4; OSPF 224.0.0.5 aur 224.0.0.6 use karta hai.</li>
<li>Default route 0.0.0.0/0 sab kuch match karta hai.</li></ul>

<h3>Junos par addresses lagana</h3>
<p>Address hamesha <code>family inet</code> ke neeche <b>logical unit</b> par lagta hai, prefix length ke saath:</p>
<pre class="code">set interfaces ge-0/0/0 unit 0 family inet address 10.50.0.194/30
set interfaces lo0 unit 0 family inet address 198.51.100.1/32
set interfaces irb unit 10 family inet address 10.50.0.1/25</pre>
<pre class="out">lab@R1&gt; show interfaces terse ge-0/0/0
Interface               Admin Link Proto    Local                 Remote
ge-0/0/0                up    up
<span class="hl">ge-0/0/0.0              up    up   inet     10.50.0.194/30</span></pre>

<div class="eg"><p><b>Worked example.</b> Kya 10.50.0.140, 10.50.0.128/26 ke andar hai? /26 ka block size 64 hai, to subnets .0, .64, .128, .192 se shuru hote hain. Address 140, 128 aur 191 ke beech aata hai, to haan. Iska network address .128 aur broadcast .191 hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> Network ya broadcast address host ko de dena, jaise 10.50.0.128/26 PC ka address. Ek aur: ek hi link ki ek taraf /24 mask aur doosri taraf /25, to dono taraf alag raay rakhte hain ki kya local hai.</p></div>

<div class="scn"><h4>Off-by-one address</h4><p>Ek technician ne server par 10.50.0.191/26 type kiya. Server kuch hosts ko ping kar pa raha tha lekin kuch ko nahi, aur switch ne ajeeb ARP behaviour log kiya. Engineer ne address convert kiya: .191 10.50.0.128/26 ka broadcast hai. Server ko .150 karne se theek ho gaya.</p><p><b>Lesson:</b> hosts assign karne se pehle subnet ke network aur broadcast addresses nikaalo.</p></div>

<div class="iv"><p class="q">"/27 mein kitne usable hosts hote hain aur kyun?"</p><p>/27 mein 5 host bits bachte hain: 2^5 = 32 addresses, network aur broadcast hatane par 30 usable hosts. Block size 32 aur mask 255.255.255.224 ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IPv4 = 32 bits, chaar octets; place values 128, 64, 32, 16, 8, 4, 2, 1.</li>
<li>Prefix length = network bits ki ginti; baaki host bits.</li>
<li>Usable hosts = 2^host bits minus 2; block size = 256 minus mask octet.</li>
<li>RFC 1918, loopback, link-local aur documentation ranges yaad rakho.</li>
<li>Junos par addresses family inet ke neeche unit par prefix length ke saath lagte hain.</li>
</ul></div>
`}};export{e as default};