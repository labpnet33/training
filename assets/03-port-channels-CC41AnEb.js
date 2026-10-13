var e={id:`port-channels`,h:{en:`Port-channels and LACP on NX-OS`,hi:`NX-OS par port-channels aur LACP`},body:{en:`
<p>Think of a highway with four lanes. Drivers do not think of "lane 1" or "lane 3"; they think of "the highway". Each car stays in its lane for the whole trip, so cars never overtake each other inside a lane, but together the four lanes carry four times the traffic. A <b>port-channel</b> is that highway: several physical links that the switch treats as <b>one logical interface</b>.</p>

<h3>What a port-channel is</h3>
<p>A <b>port-channel</b> (also called EtherChannel, link aggregation group or LAG) bundles physical ports, called <b>members</b>, into one logical interface named <code>port-channelN</code> (shown as <code>PoN</code>). On most Nexus 9000 platforms a port-channel can have up to 32 members. To the rest of the switch, including spanning tree and the MAC table, there is only one port. STP therefore has nothing to block, and if one member fails, the port-channel stays up on the others with no STP event.</p>

<h3>How traffic is spread: hashing per flow</h3>
<p>A switch does not send frame 1 on member 1 and frame 2 on member 2; that would re-order packets. It computes a <b>hash</b> over header fields (MAC addresses, IP addresses, and optionally Layer 4 ports) and uses the result to pick a member. All frames of one <b>flow</b> produce the same hash and so use the same member, which keeps them in order. Many different flows spread across all members.</p>
<p>On NX-OS the hash inputs are set globally:</p>
<pre class="code"><span class="c">! Include L4 ports so that many TCP sessions between the same two hosts spread out</span>
port-channel load-balance src-dst ip-l4port

NX1# show port-channel load-balance
System config:
    Non-IP: src-dst mac
    <span class="hl">IP: src-dst ip-l4port rotate 0</span></pre>
<p>The hash is <b>local to each sender</b>: the switch decides how it sends toward the server, and the server's bonding driver (<code>xmit_hash_policy</code>) decides how the server sends toward the switch. The two sides do not need the same policy.</p>

<div class="eg"><p><b>Worked example.</b> A backup server has a 2 × 25G port-channel and runs one huge backup stream to a single storage array. With <code>src-dst ip</code> hashing, that one flow always lands on one member and tops out at 25G, even though the bundle is 50G. Changing the server's policy to <code>layer3+4</code> and running four parallel streams (four different TCP source ports) lets the hash spread them over both members, and the job reaches about 45G. One flow never exceeds one member's speed; that is the most misunderstood fact about port-channels.</p></div>

<h3>LACP: the protocol that negotiates the bundle</h3>
<p><b>LACP</b> (Link Aggregation Control Protocol, IEEE 802.3ad, now 802.1AX) sends small frames called <b>LACPDUs</b> on every member. Each LACPDU carries the sender's <b>system ID</b> (a system priority plus a MAC address), a <b>key</b> that identifies which bundle the port wants to join, a port priority and number, and a <b>state</b> byte (active or passive, fast or slow timers, in sync, collecting, distributing). A port joins the bundle only when both sides agree. The rule to remember: <b>all members of one bundle must see the same partner system ID</b>. Keep that in mind; it is the whole reason vPC exists.</p>

<table class="cmp"><tr><th>NX-OS mode</th><th>Behaviour</th><th>Forms a bundle with</th></tr>
<tr><td><code>active</code></td><td>LACP, sends LACPDUs on its own</td><td>active or passive</td></tr>
<tr><td><code>passive</code></td><td>LACP, only answers LACPDUs</td><td>active only (passive plus passive never forms)</td></tr>
<tr><td><code>on</code></td><td>Static bundle, no protocol at all</td><td>on only; mistakes are not detected</td></tr>
</table>
<p>NX-OS does not support PAgP; the IOS modes <code>desirable</code> and <code>auto</code> do not exist. Prefer <code>active</code> everywhere, because LACP detects mis-cabling (a member plugged into the wrong device shows a different partner and is suspended), whereas <code>on</code> will happily forward into the wrong box.</p>

<h3>Configuration on NX-OS</h3>
<pre class="code">feature lacp
<span class="c">! Members: set the channel-group; the port-channel interface is created automatically</span>
interface ethernet1/1-2
  switchport mode trunk
  channel-group 1 mode active
  lacp rate fast
<span class="c">! Configure the logical interface; members inherit compatible settings</span>
interface port-channel1
  switchport mode trunk
  lacp min-links 2</pre>
<ul>
<li><b>lacp rate fast</b> sends LACPDUs every second instead of every 30 seconds, so a silent partner is detected in about 3 seconds instead of 90. Set it on the member interfaces. Cisco does not recommend it on the vPC peer-link, and it can interfere with ISSU on some platforms, so use it where fast detection matters (typically server links).</li>
<li><b>lacp min-links 2</b> keeps the port-channel down unless at least 2 members are bundled. Useful on routed uplinks so that a half-dead bundle does not attract traffic it cannot carry. The flag <b>M</b> in <code>show port-channel summary</code> means min-links is not met.</li>
<li><b>lacp suspend-individual</b> is on by default on NX-OS: a member that receives no LACPDUs is <b>suspended</b> (flag <b>s</b>). With <code>no lacp suspend-individual</code> on the port-channel, such a port runs as an <b>individual</b> link (flag <b>I</b>). This helps servers that PXE-boot before their OS has started LACP, but use it with care because an individual port behaves like a normal access or trunk port.</li>
</ul>

<h3>Verification</h3>
<pre class="out">NX1# show port-channel summary
Flags:  D - Down        P - Up in port-channel (members)
        I - Individual  H - Hot-standby (LACP only)
        s - Suspended   r - Module-removed
        S - Switched    R - Routed
        U - Up (port-channel)
        M - Not in use. Min-links not met
--------------------------------------------------------------------------------
Group Port-       Type     Protocol  Member Ports
      Channel
--------------------------------------------------------------------------------
<span class="hl">1     Po1(SU)     Eth      LACP      Eth1/1(P)    Eth1/2(P)</span></pre>
<p>Read it left to right: group 1, port-channel1 is <b>S</b>witched and <b>U</b>p, it runs LACP, and both members are <b>P</b> (bundled). To see who is on the other end, use <code>show lacp neighbor</code>; the Partner System ID column must be identical for every member.</p>
<pre class="out">NX1# show lacp neighbor
port-channel1 neighbors
Partner's information
            Partner                Partner                     Partner
Port        System ID              Port Number     Age         Flags
<span class="hl">Eth1/1      32768,5254.0012.3402   0x101           4           FA
Eth1/2      32768,5254.0012.3402   0x102           4           FA</span></pre>
<p>On a Linux server the same bundle is the <b>bonding</b> driver in mode <code>802.3ad</code>. Its status file lists the partner MAC and how many ports are in the active aggregator:</p>
<pre class="out">SRV1$ cat /proc/net/bonding/bond0
Bonding Mode: IEEE 802.3ad Dynamic link aggregation
Transmit Hash Policy: layer2 (0)
802.3ad info
LACP rate: fast
Active Aggregator Info:
	Aggregator ID: 1
	<span class="hl">Number of ports: 2</span>
	Partner Mac Address: 52:54:00:12:34:01</pre>

<div class="warn"><p><b>Common mistakes.</b> (1) Configuring VLANs or speed on only one member: members must be compatible (speed, duplex, switchport mode, allowed VLANs), and on NX-OS you should configure the <b>port-channel</b> interface and let members inherit. (2) Using <code>mode on</code> on one side and LACP on the other: the LACP side suspends its ports. (3) Expecting one flow to go faster than one member.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Passive on both ends" never forms a bundle. And <code>desirable</code> is PAgP, which NX-OS does not support. If a question lists desirable as an NX-OS LACP option, it is a distractor.</p></div>

<div class="scn"><h4>The bundle with a stranger in it</h4><p>A technician recabled a rack at night. The next morning one of four members of a server port-channel showed flag <b>s</b> (suspended) on the leaf. <code>show lacp neighbor</code> showed three members with the server's system ID and the fourth with a completely different one: the cable had been plugged into the neighbouring server. Because the bundle ran LACP <code>active</code>, the switch refused to add the wrong port and nothing broke. With <code>mode on</code> the leaf would have hashed a quarter of the flows to the wrong server.</p><p><b>Lesson:</b> LACP's partner check is a free cabling audit; always prefer active mode.</p></div>

<div class="iv"><p class="q">"How does a port-channel load-balance, and can one TCP session use the full bundle bandwidth?"</p><p>Strong answer: each sender hashes header fields (MAC, IP and optionally L4 ports, set with <code>port-channel load-balance</code>) to choose a member per flow, so frames of a flow stay in order. One flow always uses one member, so a single TCP session is limited to one link's speed; the bundle helps many flows. Mention that the hash is decided independently on each side, and that adding L4 ports helps when a few hosts carry many sessions.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A port-channel makes many links one logical interface; STP sees one port and a member failure causes no STP event.</li>
<li>Load sharing is per flow by hash; one flow never exceeds one member's speed.</li>
<li>LACP modes: active, passive, on; passive plus passive never forms; NX-OS has no PAgP.</li>
<li>All members must see the same partner system ID; this rule is the foundation of vPC.</li>
<li>Know <code>lacp rate fast</code>, <code>lacp min-links</code>, <code>lacp suspend-individual</code> and the flags P, s, I, D, M, SU.</li>
</ul></div>
`,hi:`
<p>Chaar lane wala highway socho. Drivers "lane 1" ya "lane 3" ke baare mein nahi sochte; woh "highway" ke baare mein sochte hain. Har car poori trip apni lane mein rehti hai, isliye lane ke andar cars ek doosre ko overtake nahi karti, par milkar chaar lanes chaar guna traffic le jaati hain. <b>Port-channel</b> wahi highway hai: kai physical links jinhe switch <b>ek logical interface</b> maanta hai.</p>

<h3>Port-channel kya hai</h3>
<p><b>Port-channel</b> (jise EtherChannel, link aggregation group ya LAG bhi kehte hain) physical ports ko, jinhe <b>members</b> kehte hain, ek logical interface <code>port-channelN</code> (dikhta hai <code>PoN</code>) mein bundle karta hai. Zyada tar Nexus 9000 platforms par ek port-channel mein 32 tak members ho sakte hain. Baaki switch ke liye, spanning tree aur MAC table samet, sirf ek port hai. Isliye STP ke paas block karne ko kuch nahi, aur agar ek member fail ho to port-channel baaki members par bina STP event ke up rehta hai.</p>

<h3>Traffic kaise baanta jaata hai: per flow hashing</h3>
<p>Switch frame 1 member 1 par aur frame 2 member 2 par nahi bhejta; isse packets ka order bigad jaata. Woh header fields (MAC addresses, IP addresses, aur optionally Layer 4 ports) par <b>hash</b> nikalta hai aur result se member chunta hai. Ek <b>flow</b> ke saare frames same hash dete hain aur same member use karte hain, jisse order bana rehta hai. Bahut saare alag flows saare members par fail jaate hain.</p>
<p>NX-OS par hash inputs globally set hote hain:</p>
<pre class="code"><span class="c">! L4 ports shamil karo taaki same do hosts ke beech kai TCP sessions fail sakein</span>
port-channel load-balance src-dst ip-l4port

NX1# show port-channel load-balance
System config:
    Non-IP: src-dst mac
    <span class="hl">IP: src-dst ip-l4port rotate 0</span></pre>
<p>Hash <b>har sender ka apna</b> hota hai: switch decide karta hai ki server ki taraf kaise bheje, aur server ka bonding driver (<code>xmit_hash_policy</code>) decide karta hai ki server switch ki taraf kaise bheje. Dono sides ki policy same hona zaroori nahi.</p>

<div class="eg"><p><b>Worked example.</b> Ek backup server ka 2 × 25G port-channel hai aur woh ek hi storage array tak ek bahut bada backup stream chalata hai. <code>src-dst ip</code> hashing ke saath woh ek flow hamesha ek member par aata hai aur 25G par ruk jaata hai, bhale bundle 50G ka ho. Server ki policy <code>layer3+4</code> karke aur chaar parallel streams (chaar alag TCP source ports) chala kar hash unhe dono members par baant deta hai, aur job lagbhag 45G tak pahunchta hai. Ek flow kabhi ek member ki speed se aage nahi jaata; port-channels ke baare mein yahi sabse zyada galat samjha jaane wala fact hai.</p></div>

<h3>LACP: woh protocol jo bundle negotiate karta hai</h3>
<p><b>LACP</b> (Link Aggregation Control Protocol, IEEE 802.3ad, ab 802.1AX) har member par chhote frames bhejta hai jinhe <b>LACPDUs</b> kehte hain. Har LACPDU mein sender ka <b>system ID</b> (system priority plus MAC address), ek <b>key</b> jo batati hai port kis bundle mein judna chahta hai, port priority aur number, aur ek <b>state</b> byte (active ya passive, fast ya slow timers, in sync, collecting, distributing) hota hai. Port bundle mein tabhi judta hai jab dono sides sehmat hon. Yaad rakhne wala rule: <b>ek bundle ke saare members ko same partner system ID dikhna chahiye</b>. Ise dhyan mein rakho; vPC ke hone ki poori wajah yahi hai.</p>

<table class="cmp"><tr><th>NX-OS mode</th><th>Behaviour</th><th>Kiske saath bundle banta hai</th></tr>
<tr><td><code>active</code></td><td>LACP, khud LACPDUs bhejta hai</td><td>active ya passive</td></tr>
<tr><td><code>passive</code></td><td>LACP, sirf LACPDUs ka jawab deta hai</td><td>sirf active (passive plus passive kabhi nahi banta)</td></tr>
<tr><td><code>on</code></td><td>Static bundle, koi protocol nahi</td><td>sirf on; galtiyan pakdi nahi jaati</td></tr>
</table>
<p>NX-OS PAgP support nahi karta; IOS ke modes <code>desirable</code> aur <code>auto</code> exist nahi karte. Har jagah <code>active</code> prefer karo, kyunki LACP mis-cabling pakadta hai (galat device mein laga member alag partner dikhata hai aur suspend ho jaata hai), jabki <code>on</code> khushi khushi galat box mein forward karega.</p>

<h3>NX-OS par configuration</h3>
<pre class="code">feature lacp
<span class="c">! Members: channel-group set karo; port-channel interface apne aap ban jaata hai</span>
interface ethernet1/1-2
  switchport mode trunk
  channel-group 1 mode active
  lacp rate fast
<span class="c">! Logical interface configure karo; members compatible settings inherit karte hain</span>
interface port-channel1
  switchport mode trunk
  lacp min-links 2</pre>
<ul>
<li><b>lacp rate fast</b> LACPDUs har 30 second ki jagah har second bhejta hai, isliye chup partner 90 ki jagah lagbhag 3 second mein pakda jaata hai. Ise member interfaces par set karo. Cisco ise vPC peer-link par recommend nahi karta, aur kuch platforms par yeh ISSU mein dikkat kar sakta hai, isliye ise wahan use karo jahan fast detection zaroori ho (aam taur par server links).</li>
<li><b>lacp min-links 2</b> port-channel ko tab tak down rakhta hai jab tak kam se kam 2 members bundled na hon. Routed uplinks par useful hai taaki aadha mara bundle woh traffic na kheeche jo woh utha nahi sakta. <code>show port-channel summary</code> mein flag <b>M</b> ka matlab hai min-links poora nahi hua.</li>
<li><b>lacp suspend-individual</b> NX-OS par default on hai: jis member ko koi LACPDU nahi milta woh <b>suspend</b> ho jaata hai (flag <b>s</b>). Port-channel par <code>no lacp suspend-individual</code> ke saath aisa port <b>individual</b> link ki tarah chalta hai (flag <b>I</b>). Yeh un servers ki madad karta hai jo OS ke LACP shuru karne se pehle PXE-boot karte hain, par ise dhyan se use karo kyunki individual port normal access ya trunk port jaisa behave karta hai.</li>
</ul>

<h3>Verification</h3>
<pre class="out">NX1# show port-channel summary
Flags:  D - Down        P - Up in port-channel (members)
        I - Individual  H - Hot-standby (LACP only)
        s - Suspended   r - Module-removed
        S - Switched    R - Routed
        U - Up (port-channel)
        M - Not in use. Min-links not met
--------------------------------------------------------------------------------
Group Port-       Type     Protocol  Member Ports
      Channel
--------------------------------------------------------------------------------
<span class="hl">1     Po1(SU)     Eth      LACP      Eth1/1(P)    Eth1/2(P)</span></pre>
<p>Ise left se right padho: group 1, port-channel1 <b>S</b>witched aur <b>U</b>p hai, LACP chala raha hai, aur dono members <b>P</b> (bundled) hain. Doosre end par kaun hai yeh dekhne ke liye <code>show lacp neighbor</code> use karo; Partner System ID column har member ke liye identical hona chahiye.</p>
<pre class="out">NX1# show lacp neighbor
port-channel1 neighbors
Partner's information
            Partner                Partner                     Partner
Port        System ID              Port Number     Age         Flags
<span class="hl">Eth1/1      32768,5254.0012.3402   0x101           4           FA
Eth1/2      32768,5254.0012.3402   0x102           4           FA</span></pre>
<p>Linux server par yahi bundle <code>802.3ad</code> mode mein <b>bonding</b> driver hai. Uski status file partner MAC aur active aggregator mein kitne ports hain, yeh dikhati hai:</p>
<pre class="out">SRV1$ cat /proc/net/bonding/bond0
Bonding Mode: IEEE 802.3ad Dynamic link aggregation
Transmit Hash Policy: layer2 (0)
802.3ad info
LACP rate: fast
Active Aggregator Info:
	Aggregator ID: 1
	<span class="hl">Number of ports: 2</span>
	Partner Mac Address: 52:54:00:12:34:01</pre>

<div class="warn"><p><b>Common galtiyan.</b> (1) VLANs ya speed sirf ek member par configure karna: members compatible hone chahiye (speed, duplex, switchport mode, allowed VLANs), aur NX-OS par aapko <b>port-channel</b> interface configure karna chahiye aur members ko inherit karne dena chahiye. (2) Ek side <code>mode on</code> aur doosri side LACP: LACP wali side apne ports suspend kar deti hai. (3) Yeh umeed karna ki ek flow ek member se tez chalega.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Dono ends par passive" kabhi bundle nahi banata. Aur <code>desirable</code> PAgP hai, jo NX-OS support nahi karta. Agar question desirable ko NX-OS LACP option ki tarah list kare, to woh distractor hai.</p></div>

<div class="scn"><h4>Bundle jismein ek ajnabi ghus gaya</h4><p>Ek technician ne raat ko rack ki recabling ki. Agli subah server port-channel ke chaar members mein se ek leaf par flag <b>s</b> (suspended) dikha raha tha. <code>show lacp neighbor</code> ne teen members par server ka system ID aur chauthe par bilkul alag ID dikhaya: cable padosi server mein lag gayi thi. Kyunki bundle LACP <code>active</code> par chal raha tha, switch ne galat port jodne se mana kar diya aur kuch nahi toota. <code>mode on</code> ke saath leaf ek chauthai flows galat server ko hash kar deta.</p><p><b>Seekh:</b> LACP ka partner check free cabling audit hai; hamesha active mode prefer karo.</p></div>

<div class="iv"><p class="q">"Port-channel load-balance kaise karta hai, aur kya ek TCP session poori bundle bandwidth use kar sakta hai?"</p><p>Strong answer: har sender header fields (MAC, IP aur optionally L4 ports, jo <code>port-channel load-balance</code> se set hote hain) ka hash nikal kar har flow ke liye member chunta hai, isliye flow ke frames order mein rehte hain. Ek flow hamesha ek member use karta hai, isliye ek TCP session ek link ki speed tak limited hai; bundle bahut saare flows ki madad karta hai. Yeh bhi batao ki hash har side par alag se decide hota hai, aur L4 ports jodna tab madad karta hai jab kuch hosts bahut saare sessions le jaate hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Port-channel kai links ko ek logical interface banata hai; STP ko ek port dikhta hai aur member failure se STP event nahi hota.</li>
<li>Load sharing hash se per flow hoti hai; ek flow kabhi ek member ki speed se aage nahi jaata.</li>
<li>LACP modes: active, passive, on; passive plus passive kabhi nahi banta; NX-OS mein PAgP nahi hai.</li>
<li>Saare members ko same partner system ID dikhna chahiye; yahi rule vPC ki neenv hai.</li>
<li><code>lacp rate fast</code>, <code>lacp min-links</code>, <code>lacp suspend-individual</code> aur flags P, s, I, D, M, SU jaano.</li>
</ul></div>
`}};export{e as default};