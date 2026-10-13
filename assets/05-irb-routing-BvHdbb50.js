var e={id:`irb-routing`,h:{en:`Routing between VLANs with IRB`,hi:`IRB se VLANs ke beech routing`},body:{en:`
<p>VLANs are locked floors. People on the Sales floor cannot walk into Engineering. When they need to talk, they go down to the <b>reception desk</b>, which knows every floor and passes messages between them. On a campus network the reception desk is a Layer 3 interface. On an EX switch, that interface is called <b>IRB</b>: <b>Integrated Routing and Bridging</b>. It lives inside the switch, belongs to a VLAN, and acts as the <b>default gateway</b> for the hosts in that VLAN.</p>

<h3>Why do we need it?</h3>
<p>Two hosts in different VLANs are in different broadcast domains. The switch will never bridge a frame from VLAN 10 into VLAN 20. To connect them, a device must route at Layer 3: receive the frame in VLAN 10, look at the destination IP, and send a new frame into VLAN 20. A separate router connected with one trunk works, but a Layer 3 switch does it internally with IRB and is cheaper and faster.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="IRB inside CORE">
<rect x="180" y="20" width="280" height="110" rx="12" fill="#fde68a"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="14">CORE (Layer 3 switch)</text>
<rect x="200" y="58" width="100" height="40" rx="8" fill="#bae6fd"/><text x="250" y="76" text-anchor="middle" class="svg-ink" font-size="12">irb.10</text><text x="250" y="91" text-anchor="middle" class="svg-muted" font-size="11">10.10.10.1/24</text>
<rect x="340" y="58" width="100" height="40" rx="8" fill="#bbf7d0"/><text x="390" y="76" text-anchor="middle" class="svg-ink" font-size="12">irb.20</text><text x="390" y="91" text-anchor="middle" class="svg-muted" font-size="11">10.10.20.1/24</text>
<rect x="250" y="160" width="140" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="180" text-anchor="middle" class="svg-ink" font-size="13">ACC (L2 only)</text><text x="320" y="196" text-anchor="middle" class="svg-muted" font-size="11">trunk VLAN 10 + 20</text>
<line x1="320" y1="130" x2="320" y2="160" stroke="#64748b" stroke-width="5"/>
<rect x="30" y="170" width="100" height="34" rx="8" fill="#bae6fd"/><text x="80" y="192" text-anchor="middle" class="svg-ink" font-size="12">PC1 .10.11</text>
<rect x="510" y="170" width="100" height="34" rx="8" fill="#bbf7d0"/><text x="560" y="192" text-anchor="middle" class="svg-ink" font-size="12">PC2 .20.12</text>
<line x1="130" y1="187" x2="250" y2="182" stroke="#64748b" stroke-width="2"/><line x1="510" y1="187" x2="390" y2="182" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Hosts in each VLAN use their IRB address as default gateway; CORE routes between irb.10 and irb.20.</p></div>

<h3>Building it (Lab 2)</h3>
<p>You create one <code>irb</code> logical unit per VLAN, give it an IP address, and tie it to the VLAN with <code>l3-interface</code>:</p>
<pre class="code">set interfaces irb unit 10 family inet address 10.10.10.1/24
set interfaces irb unit 20 family inet address 10.10.20.1/24
set vlans SALES l3-interface irb.10
set vlans ENG l3-interface irb.20</pre>
<p>Tip: use the VLAN ID as the unit number. It makes <code>irb.10</code> obviously the gateway of VLAN 10. After <code>commit</code>, verify:</p>
<pre class="out">lab@CORE&gt; show interfaces terse irb
Interface               Admin Link Proto    Local                 Remote
irb                     up    up
irb.10                  up    up   inet     <span class="hl">10.10.10.1/24</span>
irb.20                  up    up   inet     <span class="hl">10.10.20.1/24</span>

lab@CORE&gt; show vlans
Routing instance        VLAN name             Tag          Interfaces
default-switch          ENG                   20
                                                           ge-0/0/0.0*
                                                           (l3-interface irb.20)
default-switch          SALES                 10
                                                           ge-0/0/0.0*
                                                           (l3-interface irb.10)

lab@CORE&gt; show route
inet.0: 4 destinations, 4 routes (4 active, 0 holddown, 0 hidden)
10.10.10.0/24      *[Direct/0] 00:00:00
                    &gt;  via irb.10
10.10.10.1/32      *[Local/0] 00:00:00
                       Local via irb.10
10.10.20.0/24      *[Direct/0] 00:00:00
                    &gt;  via irb.20
10.10.20.1/32      *[Local/0] 00:00:00
                       Local via irb.20</pre>
<p>Notice the two kinds of routes created per IRB address: a <b>Direct</b> route for the subnet and a <b>Local</b> /32 route for the gateway address itself. Now the end-to-end test from PC1 (10.10.10.11, gateway 10.10.10.1):</p>
<pre class="out">PC1&gt; ping 10.10.20.12
84 bytes from 10.10.20.12 icmp_seq=1 <span class="hl">ttl=63</span> time=0.500 ms
84 bytes from 10.10.20.12 icmp_seq=2 ttl=63 time=0.600 ms</pre>
<p>PC2 sent the reply with TTL 64 and one router (CORE) decremented it, so PC1 sees <b>63</b>. A TTL one lower than the sender's initial value is the signature of a single routed hop. A frame that was only switched keeps TTL 64.</p>

<div class="eg"><p><b>Worked example.</b> PC1 wants 10.10.20.12. It sees that the address is outside its own /24, so it ARPs for its gateway 10.10.10.1 and sends the frame to the IRB's MAC address in VLAN 10. CORE strips the Layer 2 header, finds the Direct route 10.10.20.0/24 via irb.20, ARPs for PC2 inside VLAN 20, builds a new frame and forwards it. The IP packet is the same, the Ethernet frame is new, and TTL has dropped by one.</p></div>

<div class="note"><p>An IRB unit comes <b>up</b> only if at least one port in its VLAN is up. If <code>show interfaces terse irb</code> shows it down, check the VLAN's ports first. The hosts must also use the IRB address as default gateway.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Forgetting <code>l3-interface</code> so the IRB exists but is not tied to a VLAN. Giving the hosts the wrong gateway. Putting two IRB units in the same subnet. And forgetting that the access switch ACC does not need an IRB for user traffic: it only needs one if you want to manage it, as in the Lab 3 management VLAN.</p></div>
<div class="exam"><p><b>Exam trap.</b> The keyword is <code>l3-interface</code> under the VLAN (ELS). In older EX syntax it was <code>l3-interface vlan.10</code> with the unit named <code>vlan</code>. IRB on ELS is always called <code>irb</code>.</p></div>

<div class="scn"><h4>Sales cannot reach the engineering build server</h4><p>After a new VLAN was added, sales PCs could ping their gateway but not the server in VLAN 20. The engineer ran <code>show vlans</code> on CORE and saw that ENG had no <code>l3-interface</code> line, so irb.20 was not bound. One <code>set vlans ENG l3-interface irb.20</code> and a commit fixed it.</p><p><b>Lesson:</b> a configured IRB address is not enough; bind it to the VLAN.</p></div>

<div class="iv"><p class="q">"How do you route between VLANs on an EX switch?"</p><p>Create an IRB unit per VLAN with an IP address, bind each with <code>l3-interface</code> under the VLAN, and use the IRB address as the hosts' gateway. The subnet appears as a Direct route and routed traffic has its TTL decremented. Mention the alternative, router on a stick, and why IRB is better.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IRB is the switch's Layer 3 interface inside a VLAN and serves as the hosts' default gateway.</li>
<li>Create <code>irb unit N</code>, add an address, bind with <code>set vlans NAME l3-interface irb.N</code>.</li>
<li>Each IRB address creates a Direct subnet route and a Local /32 route.</li>
<li>Routed traffic has TTL decreased by one (64 becomes 63).</li>
</ul></div>
`,hi:`
<p>VLANs locked floors hain. Sales floor ke log Engineering mein nahi ja sakte. Baat karni ho to woh neeche <b>reception desk</b> par jaate hain, jo har floor ko jaanta hai aur unke beech message pahunchata hai. Campus network mein reception desk ek Layer 3 interface hota hai. EX switch par is interface ko <b>IRB</b> kehte hain: <b>Integrated Routing and Bridging</b>. Yeh switch ke andar rehta hai, ek VLAN ka hota hai, aur us VLAN ke hosts ka <b>default gateway</b> banta hai.</p>

<h3>Iski zaroorat kyun?</h3>
<p>Alag VLANs ke do hosts alag broadcast domains mein hote hain. Switch VLAN 10 ka frame kabhi VLAN 20 mein bridge nahi karega. Unhe jodne ke liye kisi device ko Layer 3 par route karna padta hai: VLAN 10 mein frame receive karo, destination IP dekho, aur naya frame VLAN 20 mein bhejo. Ek trunk se juda alag router bhi chalta hai, lekin Layer 3 switch yeh kaam IRB se andar hi kar leta hai, jo sasta aur tez hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="CORE ke andar IRB">
<rect x="180" y="20" width="280" height="110" rx="12" fill="#fde68a"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="14">CORE (Layer 3 switch)</text>
<rect x="200" y="58" width="100" height="40" rx="8" fill="#bae6fd"/><text x="250" y="76" text-anchor="middle" class="svg-ink" font-size="12">irb.10</text><text x="250" y="91" text-anchor="middle" class="svg-muted" font-size="11">10.10.10.1/24</text>
<rect x="340" y="58" width="100" height="40" rx="8" fill="#bbf7d0"/><text x="390" y="76" text-anchor="middle" class="svg-ink" font-size="12">irb.20</text><text x="390" y="91" text-anchor="middle" class="svg-muted" font-size="11">10.10.20.1/24</text>
<rect x="250" y="160" width="140" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="180" text-anchor="middle" class="svg-ink" font-size="13">ACC (sirf L2)</text><text x="320" y="196" text-anchor="middle" class="svg-muted" font-size="11">trunk VLAN 10 + 20</text>
<line x1="320" y1="130" x2="320" y2="160" stroke="#64748b" stroke-width="5"/>
<rect x="30" y="170" width="100" height="34" rx="8" fill="#bae6fd"/><text x="80" y="192" text-anchor="middle" class="svg-ink" font-size="12">PC1 .10.11</text>
<rect x="510" y="170" width="100" height="34" rx="8" fill="#bbf7d0"/><text x="560" y="192" text-anchor="middle" class="svg-ink" font-size="12">PC2 .20.12</text>
<line x1="130" y1="187" x2="250" y2="182" stroke="#64748b" stroke-width="2"/><line x1="510" y1="187" x2="390" y2="182" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Har VLAN ke hosts apna IRB address default gateway banate hain; CORE irb.10 aur irb.20 ke beech route karta hai.</p></div>

<h3>Banana (Lab 2)</h3>
<p>Har VLAN ke liye ek <code>irb</code> logical unit banao, use IP address do, aur <code>l3-interface</code> se VLAN se jodo:</p>
<pre class="code">set interfaces irb unit 10 family inet address 10.10.10.1/24
set interfaces irb unit 20 family inet address 10.10.20.1/24
set vlans SALES l3-interface irb.10
set vlans ENG l3-interface irb.20</pre>
<p>Tip: unit number ke liye VLAN ID use karo. Isse <code>irb.10</code> turant VLAN 10 ka gateway samajh aata hai. <code>commit</code> ke baad verify karo:</p>
<pre class="out">lab@CORE&gt; show interfaces terse irb
Interface               Admin Link Proto    Local                 Remote
irb                     up    up
irb.10                  up    up   inet     <span class="hl">10.10.10.1/24</span>
irb.20                  up    up   inet     <span class="hl">10.10.20.1/24</span>

lab@CORE&gt; show vlans
Routing instance        VLAN name             Tag          Interfaces
default-switch          ENG                   20
                                                           ge-0/0/0.0*
                                                           (l3-interface irb.20)
default-switch          SALES                 10
                                                           ge-0/0/0.0*
                                                           (l3-interface irb.10)

lab@CORE&gt; show route
inet.0: 4 destinations, 4 routes (4 active, 0 holddown, 0 hidden)
10.10.10.0/24      *[Direct/0] 00:00:00
                    &gt;  via irb.10
10.10.10.1/32      *[Local/0] 00:00:00
                       Local via irb.10
10.10.20.0/24      *[Direct/0] 00:00:00
                    &gt;  via irb.20
10.10.20.1/32      *[Local/0] 00:00:00
                       Local via irb.20</pre>
<p>Dhyan do, har IRB address se do routes bante hain: subnet ka <b>Direct</b> route aur gateway address ka <b>Local</b> /32 route. Ab PC1 (10.10.10.11, gateway 10.10.10.1) se end-to-end test:</p>
<pre class="out">PC1&gt; ping 10.10.20.12
84 bytes from 10.10.20.12 icmp_seq=1 <span class="hl">ttl=63</span> time=0.500 ms
84 bytes from 10.10.20.12 icmp_seq=2 ttl=63 time=0.600 ms</pre>
<p>PC2 ne reply TTL 64 ke saath bheja aur ek router (CORE) ne use ghata diya, isliye PC1 ko <b>63</b> dikhta hai. Sender ki initial value se ek kam TTL ek routed hop ki pehchaan hai. Jo frame sirf switch hua, uska TTL 64 hi rehta hai.</p>

<div class="eg"><p><b>Worked example.</b> PC1 ko 10.10.20.12 chahiye. Use dikhta hai ki address uske /24 ke bahar hai, isliye woh gateway 10.10.10.1 ke liye ARP karta hai aur frame VLAN 10 mein IRB ke MAC address par bhejta hai. CORE Layer 2 header hata deta hai, Direct route 10.10.20.0/24 via irb.20 dhoondhta hai, VLAN 20 ke andar PC2 ke liye ARP karta hai, naya frame banata hai aur forward karta hai. IP packet wahi hai, Ethernet frame naya hai, aur TTL ek kam ho gaya.</p></div>

<div class="note"><p>IRB unit tabhi <b>up</b> hota hai jab uske VLAN ka kam se kam ek port up ho. <code>show interfaces terse irb</code> mein down dikhe to pehle VLAN ke ports dekho. Hosts ka default gateway bhi IRB address hona chahiye.</p></div>

<div class="warn"><p><b>Common mistakes.</b> <code>l3-interface</code> bhool jaana, jisse IRB hai lekin VLAN se juda nahi. Hosts ko galat gateway dena. Ek hi subnet mein do IRB units rakhna. Aur yeh bhool jaana ki access switch ACC ko user traffic ke liye IRB nahi chahiye: use sirf manage karne ke liye chahiye, jaise Lab 3 ke management VLAN mein.</p></div>
<div class="exam"><p><b>Exam trap.</b> Keyword VLAN ke neeche <code>l3-interface</code> hai (ELS). Purane EX syntax mein <code>l3-interface vlan.10</code> hota tha jahan unit ka naam <code>vlan</code> tha. ELS mein IRB hamesha <code>irb</code> kehlata hai.</p></div>

<div class="scn"><h4>Sales engineering build server tak nahi pahunch pa rahi</h4><p>Naya VLAN add hone ke baad sales PCs apne gateway ko ping kar pa rahe the lekin VLAN 20 ke server ko nahi. Engineer ne CORE par <code>show vlans</code> chalaya aur dekha ki ENG mein <code>l3-interface</code> line hi nahi thi, yaani irb.20 bound nahi tha. Ek <code>set vlans ENG l3-interface irb.20</code> aur commit se theek ho gaya.</p><p><b>Lesson:</b> sirf IRB address configure karna kaafi nahi; use VLAN se bind karo.</p></div>

<div class="iv"><p class="q">"EX switch par VLANs ke beech routing kaise karte ho?"</p><p>Har VLAN ke liye IP address wala IRB unit banao, VLAN ke neeche <code>l3-interface</code> se bind karo, aur IRB address hosts ka gateway banao. Subnet Direct route ke roop mein dikhta hai aur routed traffic ka TTL ghat jaata hai. Alternative, router on a stick, ka zikr karo aur batao ki IRB behtar kyun hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IRB VLAN ke andar switch ka Layer 3 interface hai aur hosts ka default gateway hai.</li>
<li><code>irb unit N</code> banao, address do, <code>set vlans NAME l3-interface irb.N</code> se bind karo.</li>
<li>Har IRB address se ek Direct subnet route aur ek Local /32 route banta hai.</li>
<li>Routed traffic ka TTL ek ghat jaata hai (64 se 63).</li>
</ul></div>
`}};export{e as default};