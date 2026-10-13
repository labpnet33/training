var e={id:`l3-svi`,h:{en:`Layer 3 switches and SVIs`,hi:`Layer 3 switches aur SVIs`},body:{en:`
<p>Router-on-a-stick sends every visitor down to reception in the basement and back up again. A <b>Layer 3 switch</b> is like giving every floor its own reception desk built into the lift itself: the decision is made where the traffic already is, at full speed, with no trip to the basement. This is how almost every enterprise campus routes between VLANs today.</p>

<h3>What a Layer 3 switch is</h3>
<p>A <b>Layer 3 switch</b> (also called a <b>multilayer switch</b>) is a switch whose hardware can also route IP packets. It still does everything a normal switch does: VLANs, access ports, trunks, spanning tree. In addition, it can own IP interfaces and a routing table, and it forwards routed packets in hardware (ASICs, programmed by <b>CEF</b>, Cisco Express Forwarding) at the same speed as switched frames.</p>
<p>The gateway for each VLAN is a <b>Switched Virtual Interface (SVI)</b>: a virtual Layer 3 interface named after the VLAN, for example <code>interface Vlan10</code>. There is no cable and no port behind an SVI; it represents the switch's own presence inside that VLAN. Hosts in VLAN 10 ARP for the SVI's address exactly as they would for a router.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Layer 3 switch with SVIs as gateways and a trunk to an access switch">
<rect x="150" y="10" width="340" height="120" rx="10" fill="#e2e8f0"/>
<text x="170" y="32" class="svg-ink" font-size="14">DSW1 with ip routing</text>
<rect x="250" y="40" width="140" height="30" rx="6" fill="#ddd6fe"/><text x="320" y="60" text-anchor="middle" class="svg-ink" font-size="12">routing engine (CEF)</text>
<rect x="170" y="84" width="140" height="36" rx="6" fill="#bae6fd"/><text x="240" y="100" text-anchor="middle" class="svg-ink" font-size="12">Vlan10</text><text x="240" y="115" text-anchor="middle" class="svg-muted" font-size="12">10.1.10.1/24</text>
<rect x="330" y="84" width="140" height="36" rx="6" fill="#bae6fd"/><text x="400" y="100" text-anchor="middle" class="svg-ink" font-size="12">Vlan20</text><text x="400" y="115" text-anchor="middle" class="svg-muted" font-size="12">10.1.20.1/24</text>
<line x1="320" y1="130" x2="320" y2="170" stroke="#64748b" stroke-width="4"/>
<text x="330" y="155" class="svg-muted" font-size="12">Gi0/1 trunk, VLANs 10 and 20</text>
<rect x="250" y="170" width="140" height="34" rx="6" fill="#bae6fd"/><text x="320" y="192" text-anchor="middle" class="svg-ink" font-size="13">ASW1</text>
<line x1="270" y1="204" x2="180" y2="218" stroke="#64748b" stroke-width="2"/><line x1="370" y1="204" x2="460" y2="218" stroke="#64748b" stroke-width="2"/>
<rect x="80" y="218" width="200" height="34" rx="6" fill="#bbf7d0"/><text x="180" y="240" text-anchor="middle" class="svg-ink" font-size="12">PC1 10.1.10.50 VLAN 10</text>
<rect x="360" y="218" width="200" height="34" rx="6" fill="#fde68a"/><text x="460" y="240" text-anchor="middle" class="svg-ink" font-size="12">PRN1 10.1.20.50 VLAN 20</text>
</svg><p class="cap">The SVI lab: DSW1 routes between VLAN 10 and VLAN 20 internally; ASW1 is a plain Layer 2 access switch.</p></div>

<h3>Why it beats router-on-a-stick</h3>
<ul>
<li><b>No hairpin.</b> Traffic from VLAN 10 to VLAN 20 is routed inside DSW1; it never leaves for an external router.</li>
<li><b>Wire-speed routing</b> in hardware, typically tens or hundreds of gigabits, compared with a branch router's software forwarding.</li>
<li><b>Scale.</b> Adding a VLAN gateway is two lines of configuration, no cabling.</li>
<li><b>Lower latency</b>, fewer devices in the path, fewer things to fail.</li>
</ul>

<h3>The configuration from the SVI lab</h3>
<p>The campus replaced its router-on-a-stick with a distribution switch DSW1. VLAN 10 (USERS) and VLAN 20 (PRINTERS) already exist on DSW1 and ASW1. PC1 is 10.1.10.50 with gateway 10.1.10.1; the printer PRN1 is 10.1.20.50 with gateway 10.1.20.1.</p>
<pre class="code"><span class="c">! 1. Turn on IPv4 routing (global configuration)</span>
DSW1(config)# ip routing

<span class="c">! 2. Trunk down to the access switch (same on ASW1 Gi0/1)</span>
DSW1(config)# interface GigabitEthernet0/1
DSW1(config-if)# switchport mode trunk

<span class="c">! 3. One SVI per VLAN: the default gateways</span>
DSW1(config-if)# interface Vlan10
DSW1(config-if)# description GW-USERS
DSW1(config-if)# ip address 10.1.10.1 255.255.255.0
DSW1(config-if)# no shutdown
DSW1(config-if)# interface Vlan20
DSW1(config-if)# description GW-PRINTERS
DSW1(config-if)# ip address 10.1.20.1 255.255.255.0
DSW1(config-if)# no shutdown</pre>
<p><code>ip routing</code> is the master switch. On most Catalyst switches used in CCNA study it is <b>off by default</b> (a router has it on by default); some newer platforms ship with it on, so always verify. For IPv6 the separate command is <code>ipv6 unicast-routing</code>. Some low-end access switches (for example a Catalyst 2960 with LAN Base software) must first change their <b>SDM template</b> with <code>sdm prefer lanbase-routing</code> and reload before routing is possible. Adding <code>no shutdown</code> on every SVI is a good habit: the Vlan1 SVI is shut by default, and on some platforms new SVIs are too.</p>

<h3>Verification</h3>
<pre class="out">DSW1# show ip interface brief | include Vlan
<span class="hl">Vlan10                 10.1.10.1       YES manual up                    up</span>
<span class="hl">Vlan20                 10.1.20.1       YES manual up                    up</span>

DSW1# show ip route | begin Gateway
Gateway of last resort is not set

      10.0.0.0/8 is variably subnetted, 4 subnets, 2 masks
<span class="hl">C        10.1.10.0/24 is directly connected, Vlan10</span>
L        10.1.10.1/32 is directly connected, Vlan10
<span class="hl">C        10.1.20.0/24 is directly connected, Vlan20</span>
L        10.1.20.1/32 is directly connected, Vlan20</pre>
<p>Now compare what the same command prints if you forgot <code>ip routing</code>. The switch behaves like a host: there is no routing table, only its own default gateway and an ICMP redirect cache.</p>
<pre class="out">DSW1# show ip route
<span class="hl">Default gateway is not set</span>

Host               Gateway           Last Use    Total Uses  Interface
ICMP redirect cache is empty</pre>
<p>That output is the fingerprint of a missing <code>ip routing</code>. In that state hosts can still ping their own SVI (that is only Layer 2 plus the switch answering), but nothing is routed between VLANs.</p>

<div class="eg"><p><b>Worked example.</b> A campus has 14 VLANs across 3 floors. With router-on-a-stick, all inter-VLAN traffic of 900 users shares one 10 Gbps link to a router. On a Layer 3 distribution switch with 14 SVIs, that traffic is routed inside a switch whose forwarding capacity is hundreds of gigabits, and the uplinks carry each flow only once. Adding VLAN 15 later is <code>interface Vlan15</code>, an IP address and <code>no shutdown</code>.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Forgetting <code>ip routing</code>; creating an SVI for a VLAN that does not exist in the switch's VLAN database (creating <code>interface Vlan30</code> does <b>not</b> create VLAN 30); and leaving <code>ip default-gateway</code> as the only "routing" on a Layer 3 switch. Once <code>ip routing</code> is on, <code>ip default-gateway</code> is ignored; use a default route instead (chapter 7).</p></div>

<div class="exam"><p><b>Exam trap.</b> An exhibit shows SVIs up/up and hosts pinging their own gateway, but not the other VLAN. The answer is almost always <b>ip routing</b>, not <code>no shutdown</code> and not a trunk problem.</p></div>

<div class="scn"><h4>The pharma core that would not route</h4><p>A pharmaceutical company replaced its old core router with a Layer 3 switch and pasted the SVI addresses from the old configuration. Users reached their gateways but not the ERP server in VLAN 100. The engineer ran <code>show ip route</code> and got "Default gateway is not set" with a host cache instead of a routing table. The template had never contained <code>ip routing</code> because the old device was a router, where routing is on by default. One command fixed the whole site.</p><p><b>Lesson:</b> when moving gateways from a router to a Layer 3 switch, add <code>ip routing</code> first and check <code>show ip route</code> for C routes.</p></div>

<div class="iv"><p class="q">"What is an SVI, and what do you need for a Layer 3 switch to route between VLANs?"</p><p>Strong answer: an SVI is a virtual Layer 3 interface representing the switch inside a VLAN, <code>interface Vlan N</code>, and its IP is that VLAN's default gateway. You need the VLAN to exist and be active, an SVI with an IP per VLAN, <code>ip routing</code> enabled globally, and at least one active port in each VLAN so the SVI is up. Mention hardware (CEF) routing and no hairpin as the benefit over router-on-a-stick.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A Layer 3 switch routes in hardware; each VLAN's gateway is an SVI, <code>interface Vlan N</code>.</li>
<li><code>ip routing</code> must be enabled; many Catalyst switches ship with it off.</li>
<li>Creating an SVI does not create the VLAN; the VLAN must already exist.</li>
<li>"Default gateway is not set" in <code>show ip route</code> means routing is disabled.</li>
<li>No hairpin, wire-speed forwarding and easy scaling make SVIs the enterprise standard.</li>
</ul></div>
`,hi:`
<p>Router-on-a-stick har visitor ko basement mein reception tak neeche bhejta hai aur phir upar wapas. <b>Layer 3 switch</b> aisa hai jaise har floor ko lift ke andar hi apna reception desk de dena: faisla wahin hota hai jahan traffic pehle se hai, full speed par, basement tak koi chakkar nahi. Aaj lagbhag har enterprise campus VLANs ke beech isi tarah route karta hai.</p>

<h3>Layer 3 switch kya hai</h3>
<p><b>Layer 3 switch</b> (jise <b>multilayer switch</b> bhi kehte hain) aisa switch hai jiska hardware IP packets route bhi kar sakta hai. Yeh normal switch ka sab kuch karta hai: VLANs, access ports, trunks, spanning tree. Iske alawa yeh IP interfaces aur routing table rakh sakta hai, aur routed packets ko hardware mein (ASICs, jinhe <b>CEF</b>, Cisco Express Forwarding, program karta hai) switched frames ki hi speed par forward karta hai.</p>
<p>Har VLAN ka gateway ek <b>Switched Virtual Interface (SVI)</b> hai: VLAN ke naam wala virtual Layer 3 interface, jaise <code>interface Vlan10</code>. SVI ke peeche na koi cable hai na koi port; yeh us VLAN ke andar switch ki apni maujoodgi hai. VLAN 10 ke hosts SVI ke address ke liye bilkul waise hi ARP karte hain jaise router ke liye karte.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Gateways ke roop mein SVIs aur access switch tak trunk wala Layer 3 switch">
<rect x="150" y="10" width="340" height="120" rx="10" fill="#e2e8f0"/>
<text x="170" y="32" class="svg-ink" font-size="14">DSW1, ip routing ke saath</text>
<rect x="250" y="40" width="140" height="30" rx="6" fill="#ddd6fe"/><text x="320" y="60" text-anchor="middle" class="svg-ink" font-size="12">routing engine (CEF)</text>
<rect x="170" y="84" width="140" height="36" rx="6" fill="#bae6fd"/><text x="240" y="100" text-anchor="middle" class="svg-ink" font-size="12">Vlan10</text><text x="240" y="115" text-anchor="middle" class="svg-muted" font-size="12">10.1.10.1/24</text>
<rect x="330" y="84" width="140" height="36" rx="6" fill="#bae6fd"/><text x="400" y="100" text-anchor="middle" class="svg-ink" font-size="12">Vlan20</text><text x="400" y="115" text-anchor="middle" class="svg-muted" font-size="12">10.1.20.1/24</text>
<line x1="320" y1="130" x2="320" y2="170" stroke="#64748b" stroke-width="4"/>
<text x="330" y="155" class="svg-muted" font-size="12">Gi0/1 trunk, VLANs 10 aur 20</text>
<rect x="250" y="170" width="140" height="34" rx="6" fill="#bae6fd"/><text x="320" y="192" text-anchor="middle" class="svg-ink" font-size="13">ASW1</text>
<line x1="270" y1="204" x2="180" y2="218" stroke="#64748b" stroke-width="2"/><line x1="370" y1="204" x2="460" y2="218" stroke="#64748b" stroke-width="2"/>
<rect x="80" y="218" width="200" height="34" rx="6" fill="#bbf7d0"/><text x="180" y="240" text-anchor="middle" class="svg-ink" font-size="12">PC1 10.1.10.50 VLAN 10</text>
<rect x="360" y="218" width="200" height="34" rx="6" fill="#fde68a"/><text x="460" y="240" text-anchor="middle" class="svg-ink" font-size="12">PRN1 10.1.20.50 VLAN 20</text>
</svg><p class="cap">SVI lab: DSW1 VLAN 10 aur VLAN 20 ke beech andar hi route karta hai; ASW1 ek plain Layer 2 access switch hai.</p></div>

<h3>Yeh router-on-a-stick se behtar kyun hai</h3>
<ul>
<li><b>Koi hairpin nahi.</b> VLAN 10 se VLAN 20 ka traffic DSW1 ke andar route hota hai; woh kabhi bahar ke router tak nahi jaata.</li>
<li>Hardware mein <b>wire-speed routing</b>, aam taur par das ya sau gigabits, branch router ki software forwarding ke muqable.</li>
<li><b>Scale.</b> VLAN gateway jodna configuration ki do lines hai, koi cabling nahi.</li>
<li><b>Kam latency</b>, path mein kam devices, fail hone wali kam cheezein.</li>
</ul>

<h3>SVI lab ki configuration</h3>
<p>Campus ne apna router-on-a-stick hata kar distribution switch DSW1 lagaya. VLAN 10 (USERS) aur VLAN 20 (PRINTERS) DSW1 aur ASW1 par pehle se exist karte hain. PC1 10.1.10.50 hai gateway 10.1.10.1 ke saath; printer PRN1 10.1.20.50 hai gateway 10.1.20.1 ke saath.</p>
<pre class="code"><span class="c">! 1. IPv4 routing on karo (global configuration)</span>
DSW1(config)# ip routing

<span class="c">! 2. Access switch tak trunk (ASW1 Gi0/1 par bhi same)</span>
DSW1(config)# interface GigabitEthernet0/1
DSW1(config-if)# switchport mode trunk

<span class="c">! 3. Har VLAN ke liye ek SVI: default gateways</span>
DSW1(config-if)# interface Vlan10
DSW1(config-if)# description GW-USERS
DSW1(config-if)# ip address 10.1.10.1 255.255.255.0
DSW1(config-if)# no shutdown
DSW1(config-if)# interface Vlan20
DSW1(config-if)# description GW-PRINTERS
DSW1(config-if)# ip address 10.1.20.1 255.255.255.0
DSW1(config-if)# no shutdown</pre>
<p><code>ip routing</code> hi master switch hai. CCNA study mein use hone wale zyada tar Catalyst switches par yeh <b>default mein off</b> hota hai (router par default mein on hota hai); kuch naye platforms par yeh on aata hai, isliye hamesha verify karo. IPv6 ke liye alag command <code>ipv6 unicast-routing</code> hai. Kuch low-end access switches (jaise LAN Base software wala Catalyst 2960) ko routing possible hone se pehle <code>sdm prefer lanbase-routing</code> se apna <b>SDM template</b> badalna aur reload karna padta hai. Har SVI par <code>no shutdown</code> lagana achhi aadat hai: Vlan1 SVI default mein shut hota hai, aur kuch platforms par naye SVIs bhi.</p>

<h3>Verification</h3>
<pre class="out">DSW1# show ip interface brief | include Vlan
<span class="hl">Vlan10                 10.1.10.1       YES manual up                    up</span>
<span class="hl">Vlan20                 10.1.20.1       YES manual up                    up</span>

DSW1# show ip route | begin Gateway
Gateway of last resort is not set

      10.0.0.0/8 is variably subnetted, 4 subnets, 2 masks
<span class="hl">C        10.1.10.0/24 is directly connected, Vlan10</span>
L        10.1.10.1/32 is directly connected, Vlan10
<span class="hl">C        10.1.20.0/24 is directly connected, Vlan20</span>
L        10.1.20.1/32 is directly connected, Vlan20</pre>
<p>Ab compare karo ki agar aap <code>ip routing</code> bhool gaye to wahi command kya print karti hai. Switch host jaisa behave karta hai: koi routing table nahi, sirf uska apna default gateway aur ICMP redirect cache.</p>
<pre class="out">DSW1# show ip route
<span class="hl">Default gateway is not set</span>

Host               Gateway           Last Use    Total Uses  Interface
ICMP redirect cache is empty</pre>
<p>Yeh output missing <code>ip routing</code> ka fingerprint hai. Us state mein hosts ab bhi apne SVI ko ping kar lete hain (woh sirf Layer 2 plus switch ka jawab hai), lekin VLANs ke beech kuch route nahi hota.</p>

<div class="eg"><p><b>Worked example.</b> Ek campus mein 3 floors par 14 VLANs hain. Router-on-a-stick ke saath 900 users ka saara inter-VLAN traffic router tak ek 10 Gbps link share karta hai. 14 SVIs wale Layer 3 distribution switch par woh traffic aise switch ke andar route hota hai jiski forwarding capacity sainkdon gigabits hai, aur uplinks har flow ko sirf ek baar le jaate hain. Baad mein VLAN 15 jodna bas <code>interface Vlan15</code>, ek IP address aur <code>no shutdown</code> hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> <code>ip routing</code> bhool jaana; aise VLAN ka SVI banana jo switch ke VLAN database mein exist nahi karta (<code>interface Vlan30</code> banane se VLAN 30 <b>nahi</b> banta); aur Layer 3 switch par <code>ip default-gateway</code> ko hi akela "routing" chhod dena. <code>ip routing</code> on hone ke baad <code>ip default-gateway</code> ignore hota hai; uski jagah default route use karo (chapter 7).</p></div>

<div class="exam"><p><b>Exam trap.</b> Exhibit mein SVIs up/up hain aur hosts apna gateway ping kar rahe hain, lekin dusra VLAN nahi. Jawab lagbhag hamesha <b>ip routing</b> hai, na <code>no shutdown</code> aur na trunk problem.</p></div>

<div class="scn"><h4>Pharma core jo route nahi karta tha</h4><p>Ek pharmaceutical company ne apna purana core router Layer 3 switch se replace kiya aur purani configuration se SVI addresses paste kar diye. Users apne gateways tak pahunch gaye lekin VLAN 100 ke ERP server tak nahi. Engineer ne <code>show ip route</code> chalaya aur routing table ki jagah host cache ke saath "Default gateway is not set" mila. Template mein kabhi <code>ip routing</code> tha hi nahi kyunki purana device router tha, jahan routing default mein on hoti hai. Ek command ne poori site theek kar di.</p><p><b>Seekh:</b> gateways ko router se Layer 3 switch par le jaate waqt pehle <code>ip routing</code> jodo aur <code>show ip route</code> mein C routes check karo.</p></div>

<div class="iv"><p class="q">"SVI kya hai, aur Layer 3 switch ko VLANs ke beech route karne ke liye kya chahiye?"</p><p>Strong answer: SVI ek virtual Layer 3 interface hai jo VLAN ke andar switch ko represent karta hai, <code>interface Vlan N</code>, aur uska IP us VLAN ka default gateway hai. Aapko chahiye ki VLAN exist kare aur active ho, har VLAN ke liye IP wala SVI ho, globally <code>ip routing</code> enabled ho, aur har VLAN mein kam se kam ek active port ho taaki SVI up rahe. Router-on-a-stick ke muqable fayde ke roop mein hardware (CEF) routing aur koi hairpin nahi ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Layer 3 switch hardware mein route karta hai; har VLAN ka gateway ek SVI hai, <code>interface Vlan N</code>.</li>
<li><code>ip routing</code> enable hona chahiye; kai Catalyst switches mein yeh off aata hai.</li>
<li>SVI banane se VLAN nahi banta; VLAN pehle se exist karna chahiye.</li>
<li><code>show ip route</code> mein "Default gateway is not set" ka matlab routing disabled hai.</li>
<li>Koi hairpin nahi, wire-speed forwarding aur aasaan scaling SVIs ko enterprise standard banate hain.</li>
</ul></div>
`}};export{e as default};