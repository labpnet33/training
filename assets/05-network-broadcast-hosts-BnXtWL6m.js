var e={id:`net-bcast`,h:{en:`Network, broadcast and usable host range (the binary method)`,hi:`Network, broadcast aur usable host range (binary method)`},body:{en:`
<p>Every subnet question on the exam and every addressing ticket in real life comes down to four numbers: the <b>network address</b>, the <b>broadcast address</b>, the <b>first and last usable host</b>, and the <b>number of usable hosts</b>. This chapter shows where they come from using binary, so that the fast method in the next chapter makes complete sense instead of being a trick you memorise.</p>

<h3>An analogy: a street of houses</h3>
<p>Picture a street with numbered plots. The first plot holds the street's <b>name board</b>: nobody lives there, it identifies the street. The last plot holds the <b>community notice board</b>: anything pinned there is for every resident. The houses in between are where people live. In a subnet, the first address is the <b>network address</b> (the name of the subnet), the last is the <b>broadcast address</b> (to every host), and everything between is <b>usable</b> for hosts, routers, printers and servers.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Layout of 192.168.50.0/26">
<rect x="20" y="40" width="80" height="44" rx="6" fill="#fed7aa"/><text x="60" y="60" text-anchor="middle" class="svg-ink" font-size="13">.0</text><text x="60" y="77" text-anchor="middle" class="svg-muted" font-size="11">network</text>
<rect x="104" y="40" width="432" height="44" rx="6" fill="#bbf7d0"/><text x="320" y="60" text-anchor="middle" class="svg-ink" font-size="13">.1 to .62 usable (62 hosts)</text><text x="320" y="77" text-anchor="middle" class="svg-muted" font-size="11">R1 Gi0/0 = .1   PC-SALES = .62</text>
<rect x="540" y="40" width="80" height="44" rx="6" fill="#fed7aa"/><text x="580" y="60" text-anchor="middle" class="svg-ink" font-size="13">.63</text><text x="580" y="77" text-anchor="middle" class="svg-muted" font-size="11">broadcast</text>
<text x="320" y="118" text-anchor="middle" class="svg-accent" font-size="13">192.168.50.0/26: 64 addresses, 2 reserved, 62 usable</text>
</svg><p class="cap">The Sales subnet from the lab. The two ends are reserved; everything between them can be assigned.</p></div>

<h3>The rule in binary</h3>
<ul>
<li><b>Network address</b>: keep the network bits, set <b>all host bits to 0</b>.</li>
<li><b>Broadcast address</b>: keep the network bits, set <b>all host bits to 1</b>.</li>
<li><b>First usable</b>: network address + 1. <b>Last usable</b>: broadcast address − 1.</li>
<li><b>Usable hosts</b>: 2<sup>h</sup> − 2, where h is the number of host bits (32 − prefix). We subtract 2 for the network and broadcast addresses.</li>
</ul>

<div class="eg"><p><b>Worked example 1: 192.168.50.62/26</b> (PC-SALES). Host bits = 32 − 26 = 6, all in the last octet.<br/>62 = <code>00|111110</code> (the bar separates 2 network bits from 6 host bits).<br/>Host bits to 0 → <code>00|000000</code> = 0 → network <b>192.168.50.0</b>.<br/>Host bits to 1 → <code>00|111111</code> = 63 → broadcast <b>192.168.50.63</b>.<br/>Usable: <b>192.168.50.1 – 192.168.50.62</b>; hosts = 2<sup>6</sup> − 2 = <b>62</b>.</p></div>

<div class="eg"><p><b>Worked example 2: 172.16.45.200/20</b>. Host bits = 12: four in the third octet and all eight in the fourth.<br/>Third octet 45 = <code>0010|1101</code>.<br/>Network: <code>0010|0000</code> = 32, fourth octet 0 → <b>172.16.32.0</b>.<br/>Broadcast: <code>0010|1111</code> = 47, fourth octet 255 → <b>172.16.47.255</b>.<br/>Usable: <b>172.16.32.1 – 172.16.47.254</b>; hosts = 2<sup>12</sup> − 2 = <b>4094</b>.<br/>Notice that 172.16.40.0 and 172.16.47.0 are perfectly usable host addresses here; ".0" is only special when it is the network address.</p></div>

<h3>Quick reference: sizes in the last octet</h3>
<table class="cmp"><tr><th>Prefix</th><th>Host bits</th><th>Addresses</th><th>Usable hosts</th><th>Typical use</th></tr>
<tr><td>/24</td><td>8</td><td>256</td><td>254</td><td>Standard user VLAN</td></tr>
<tr><td>/25</td><td>7</td><td>128</td><td>126</td><td>Large department</td></tr>
<tr><td>/26</td><td>6</td><td>64</td><td>62</td><td>Our lab departments</td></tr>
<tr><td>/27</td><td>5</td><td>32</td><td>30</td><td>Small team, server segment</td></tr>
<tr><td>/28</td><td>4</td><td>16</td><td>14</td><td>Printers, management</td></tr>
<tr><td>/29</td><td>3</td><td>8</td><td>6</td><td>Small DMZ, ISP handoff</td></tr>
<tr><td>/30</td><td>2</td><td>4</td><td>2</td><td>Point-to-point router link</td></tr>
<tr><td>/31</td><td>1</td><td>2</td><td>2 (special case)</td><td>Point-to-point link (RFC 3021)</td></tr>
<tr><td>/32</td><td>0</td><td>1</td><td>1 (host route)</td><td>Loopback interfaces, single-host routes</td></tr>
</table>
<p>The two exceptions: a <b>/31</b> has no network or broadcast address and both addresses are usable on point-to-point links, which saves space on large router backbones. A <b>/32</b> identifies exactly one address; routers use it for loopback interfaces and you see it as the <code>L</code> (local) routes in a Cisco routing table.</p>

<h3>Why the reserved addresses matter on a router</h3>
<p>A Cisco-style router refuses to put the network address on an interface. Typing <code>ip address 192.168.50.64 255.255.255.192</code> on Gi0/1 returns <code>Bad mask /26 for address 192.168.50.64</code>, its way of saying "that is a network address, not a host". Traffic sent from another subnet to a subnet's broadcast address (a <b>directed broadcast</b>) is dropped by default; <code>show ip interface</code> reports "Directed broadcast forwarding is disabled". That default protects against old amplification attacks.</p>

<div class="warn"><p><b>Common mistakes.</b> Using 2<sup>h</sup> instead of 2<sup>h</sup> − 2 when counting hosts, and assuming every address ending in .0 or .255 is unusable. In a /20 or /16, many addresses ending in .0 and .255 are ordinary hosts.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Which address can be assigned to a host in 10.1.1.64/27?" with options .64, .95, .96 and .80. The block runs .64 to .95, so .64 (network) and .95 (broadcast) are out, .96 belongs to the next subnet, and only <b>10.1.1.80</b> is valid.</p></div>

<div class="scn"><h4>The camera nobody could reach</h4><p>A contractor gave a new IP camera the address 192.168.50.127 with mask 255.255.255.192, "because it was the last free number in HR". The camera accepted it, but the recording server in the IT subnet could never connect. The engineer worked it out: 192.168.50.64/26 ends at .127, so the camera had been given the <b>broadcast</b> address. R1 treated packets to .127 as a directed broadcast and dropped them. Moving the camera to 192.168.50.100 fixed it instantly.</p><p><b>Lesson:</b> always compute the broadcast before you hand out "the last address". The last <i>usable</i> is broadcast minus one.</p></div>

<div class="iv"><p class="q">"Why do we subtract two when counting hosts, and is that always true?"</p><p>Strong answer: in a normal subnet the all-zeros host portion is the network address and the all-ones host portion is the broadcast, so neither can be assigned. The exceptions are /31, used on point-to-point links where both addresses are usable per RFC 3021, and /32, which is a single host route such as a loopback. Giving the exceptions shows real-world experience.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Network = host bits all 0; broadcast = host bits all 1; usable = everything between.</li>
<li>Usable hosts = 2<sup>h</sup> − 2 where h = 32 − prefix.</li>
<li>/30 gives 2 hosts; /31 is the point-to-point exception; /32 is a single host route.</li>
<li>Addresses ending in .0 or .255 are only special when they are the subnet's network or broadcast.</li>
<li>Routers reject the network address on an interface and drop directed broadcasts by default.</li>
</ul></div>
`,hi:`
<p>Exam ka har subnet question aur real life ka har addressing ticket chaar numbers par aa kar tikta hai: <b>network address</b>, <b>broadcast address</b>, <b>pehla aur aakhri usable host</b>, aur <b>usable hosts ki ginti</b>. Yeh chapter binary se dikhata hai ki yeh kahan se aate hain, taaki agle chapter ka fast method ratta hua trick na lage balki poori tarah samajh aaye.</p>

<h3>Ek analogy: gharon ki ek gali</h3>
<p>Numbered plots wali ek gali socho. Pehle plot par gali ka <b>naam wala board</b> hai: wahan koi nahi rehta, woh gali ki pehchaan hai. Aakhri plot par <b>community notice board</b> hai: wahan jo lagta hai woh har resident ke liye hai. Beech ke ghar woh hain jahan log rehte hain. Subnet mein pehla address <b>network address</b> (subnet ka naam) hai, aakhri <b>broadcast address</b> (har host ke liye) hai, aur beech ka sab hosts, routers, printers aur servers ke liye <b>usable</b> hai.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="192.168.50.0/26 ka layout">
<rect x="20" y="40" width="80" height="44" rx="6" fill="#fed7aa"/><text x="60" y="60" text-anchor="middle" class="svg-ink" font-size="13">.0</text><text x="60" y="77" text-anchor="middle" class="svg-muted" font-size="11">network</text>
<rect x="104" y="40" width="432" height="44" rx="6" fill="#bbf7d0"/><text x="320" y="60" text-anchor="middle" class="svg-ink" font-size="13">.1 se .62 usable (62 hosts)</text><text x="320" y="77" text-anchor="middle" class="svg-muted" font-size="11">R1 Gi0/0 = .1   PC-SALES = .62</text>
<rect x="540" y="40" width="80" height="44" rx="6" fill="#fed7aa"/><text x="580" y="60" text-anchor="middle" class="svg-ink" font-size="13">.63</text><text x="580" y="77" text-anchor="middle" class="svg-muted" font-size="11">broadcast</text>
<text x="320" y="118" text-anchor="middle" class="svg-accent" font-size="13">192.168.50.0/26: 64 addresses, 2 reserved, 62 usable</text>
</svg><p class="cap">Lab ka Sales subnet. Dono sire reserved hain; unke beech ka sab assign kiya ja sakta hai.</p></div>

<h3>Binary mein rule</h3>
<ul>
<li><b>Network address</b>: network bits wahi rakho, <b>saare host bits 0</b> karo.</li>
<li><b>Broadcast address</b>: network bits wahi rakho, <b>saare host bits 1</b> karo.</li>
<li><b>Pehla usable</b>: network address + 1. <b>Aakhri usable</b>: broadcast address − 1.</li>
<li><b>Usable hosts</b>: 2<sup>h</sup> − 2, jahan h host bits ki ginti hai (32 − prefix). Network aur broadcast addresses ke liye 2 minus karte hain.</li>
</ul>

<div class="eg"><p><b>Worked example 1: 192.168.50.62/26</b> (PC-SALES). Host bits = 32 − 26 = 6, saare aakhri octet mein.<br/>62 = <code>00|111110</code> (bar 2 network bits ko 6 host bits se alag karta hai).<br/>Host bits 0 → <code>00|000000</code> = 0 → network <b>192.168.50.0</b>.<br/>Host bits 1 → <code>00|111111</code> = 63 → broadcast <b>192.168.50.63</b>.<br/>Usable: <b>192.168.50.1 – 192.168.50.62</b>; hosts = 2<sup>6</sup> − 2 = <b>62</b>.</p></div>

<div class="eg"><p><b>Worked example 2: 172.16.45.200/20</b>. Host bits = 12: chaar teesre octet mein aur aathon chauthe mein.<br/>Teesra octet 45 = <code>0010|1101</code>.<br/>Network: <code>0010|0000</code> = 32, chautha octet 0 → <b>172.16.32.0</b>.<br/>Broadcast: <code>0010|1111</code> = 47, chautha octet 255 → <b>172.16.47.255</b>.<br/>Usable: <b>172.16.32.1 – 172.16.47.254</b>; hosts = 2<sup>12</sup> − 2 = <b>4094</b>.<br/>Dhyan do ki yahan 172.16.40.0 aur 172.16.47.0 bilkul usable host addresses hain; ".0" sirf tab special hai jab woh network address ho.</p></div>

<h3>Quick reference: aakhri octet mein sizes</h3>
<table class="cmp"><tr><th>Prefix</th><th>Host bits</th><th>Addresses</th><th>Usable hosts</th><th>Typical use</th></tr>
<tr><td>/24</td><td>8</td><td>256</td><td>254</td><td>Standard user VLAN</td></tr>
<tr><td>/25</td><td>7</td><td>128</td><td>126</td><td>Bada department</td></tr>
<tr><td>/26</td><td>6</td><td>64</td><td>62</td><td>Hamare lab departments</td></tr>
<tr><td>/27</td><td>5</td><td>32</td><td>30</td><td>Chhoti team, server segment</td></tr>
<tr><td>/28</td><td>4</td><td>16</td><td>14</td><td>Printers, management</td></tr>
<tr><td>/29</td><td>3</td><td>8</td><td>6</td><td>Chhota DMZ, ISP handoff</td></tr>
<tr><td>/30</td><td>2</td><td>4</td><td>2</td><td>Point-to-point router link</td></tr>
<tr><td>/31</td><td>1</td><td>2</td><td>2 (special case)</td><td>Point-to-point link (RFC 3021)</td></tr>
<tr><td>/32</td><td>0</td><td>1</td><td>1 (host route)</td><td>Loopback interfaces, single-host routes</td></tr>
</table>
<p>Do exceptions: <b>/31</b> mein koi network ya broadcast address nahi hota aur point-to-point links par dono addresses usable hain, jo bade router backbones par jagah bachata hai. <b>/32</b> bilkul ek address ko identify karta hai; routers ise loopback interfaces ke liye use karte hain aur Cisco routing table mein aap ise <code>L</code> (local) routes ke roop mein dekhte ho.</p>

<h3>Router par reserved addresses kyun matter karte hain</h3>
<p>Cisco-style router interface par network address lagane se mana karta hai. Gi0/1 par <code>ip address 192.168.50.64 255.255.255.192</code> type karne par <code>Bad mask /26 for address 192.168.50.64</code> aata hai, yeh kehne ka uska tareeka ki "yeh network address hai, host nahi". Doosre subnet se kisi subnet ke broadcast address par bheja gaya traffic (<b>directed broadcast</b>) default mein drop hota hai; <code>show ip interface</code> "Directed broadcast forwarding is disabled" report karta hai. Yeh default purane amplification attacks se bachata hai.</p>

<div class="warn"><p><b>Common galtiyan.</b> Hosts ginte waqt 2<sup>h</sup> − 2 ki jagah 2<sup>h</sup> use karna, aur yeh maan lena ki .0 ya .255 par khatam hone wala har address unusable hai. /20 ya /16 mein .0 aur .255 par khatam hone wale bahut saare addresses normal hosts hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> "10.1.1.64/27 mein kaunsa address host ko assign ho sakta hai?" jismein options .64, .95, .96 aur .80 hain. Block .64 se .95 tak hai, to .64 (network) aur .95 (broadcast) bahar, .96 agle subnet ka hai, aur sirf <b>10.1.1.80</b> valid hai.</p></div>

<div class="scn"><h4>Camera jis tak koi nahi pahunch paaya</h4><p>Ek contractor ne naye IP camera ko 192.168.50.127 address aur 255.255.255.192 mask diya, "kyunki HR mein yahi aakhri khaali number tha". Camera ne accept kar liya, lekin IT subnet ka recording server kabhi connect nahi kar paaya. Engineer ne hisaab lagaya: 192.168.50.64/26 .127 par khatam hota hai, yaani camera ko <b>broadcast</b> address de diya gaya tha. R1 ne .127 ke packets ko directed broadcast maan kar drop kiya. Camera ko 192.168.50.100 par shift karte hi sab theek ho gaya.</p><p><b>Seekh:</b> "aakhri address" dene se pehle hamesha broadcast nikaalo. Aakhri <i>usable</i> broadcast minus ek hai.</p></div>

<div class="iv"><p class="q">"Hosts ginte waqt hum do kyun minus karte hain, aur kya yeh hamesha sach hai?"</p><p>Strong answer: normal subnet mein all-zeros host portion network address hai aur all-ones host portion broadcast, isliye dono assign nahi ho sakte. Exceptions hain /31, jo point-to-point links par use hota hai jahan RFC 3021 ke hisaab se dono addresses usable hain, aur /32, jo ek single host route hai jaise loopback. Exceptions batana real-world experience dikhata hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Network = saare host bits 0; broadcast = saare host bits 1; usable = beech ka sab.</li>
<li>Usable hosts = 2<sup>h</sup> − 2 jahan h = 32 − prefix.</li>
<li>/30 2 hosts deta hai; /31 point-to-point exception hai; /32 single host route hai.</li>
<li>.0 ya .255 par khatam hone wale addresses sirf tab special hain jab woh subnet ka network ya broadcast hon.</li>
<li>Routers interface par network address reject karte hain aur default mein directed broadcasts drop karte hain.</li>
</ul></div>
`}};export{e as default};