var e={id:`vrf-concepts`,h:{en:`Network virtualization and the VRF idea`,hi:`Network virtualization aur VRF ka idea`},body:{en:`
<p>Think of a large apartment building where every flat has its own letterbox wall. The postman carries letters for flat 101 in tower A and flat 101 in tower B. The numbers are the same, but the letters never mix, because each tower has its own separate wall of boxes. A <b>VRF</b> gives a router exactly that: several separate "letterbox walls" (routing tables) inside one box, so identical addresses can live side by side without confusion.</p>

<h3>From device virtualization to network virtualization</h3>
<p>In the previous chapter one server became many servers. <b>Network virtualization</b> applies the same idea to the network: one physical infrastructure carries several logically isolated networks, each with its own addressing, routing and policy. At Layer 2 the tool is the <b>VLAN</b>: one switch, many broadcast domains. At Layer 3 the tool is the <b>VRF</b>: one router, many routing tables. Combine VLANs, VRFs and tunnels and you get <b>path isolation</b> from one end of the network to the other.</p>

<h3>What a VRF is</h3>
<p>A <b>VRF (Virtual Routing and Forwarding) instance</b> is an independent routing table (RIB) plus its own forwarding table (CEF FIB) inside one router or Layer 3 switch. Every Layer 3 interface belongs to exactly one VRF. If you do not assign it, it belongs to the <b>global</b> table, which is the default VRF you have used since CCNA.</p>
<ul>
<li>A packet that arrives on an interface in VRF CUST-A is looked up only in the CUST-A table.</li>
<li>It can only leave through interfaces that are also in CUST-A, unless you deliberately leak routes.</li>
<li>Routing protocols run per VRF: an OSPF process or an EIGRP address family is bound to one VRF.</li>
<li>Because tables are separate, CUST-A and CUST-B can both use 10.10.1.0/24.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="One router, three routing tables">
<rect x="200" y="30" width="240" height="190" rx="10" fill="#e2e8f0"/><text x="320" y="52" text-anchor="middle" class="svg-ink" font-size="14">EDGE1</text>
<rect x="220" y="65" width="200" height="40" rx="6" fill="#bae6fd"/><text x="320" y="90" text-anchor="middle" class="svg-ink" font-size="13">VRF CUST-A table</text>
<rect x="220" y="115" width="200" height="40" rx="6" fill="#bbf7d0"/><text x="320" y="140" text-anchor="middle" class="svg-ink" font-size="13">VRF CUST-B table</text>
<rect x="220" y="165" width="200" height="40" rx="6" fill="#fde68a"/><text x="320" y="190" text-anchor="middle" class="svg-ink" font-size="13">Global table</text>
<rect x="20" y="65" width="130" height="40" rx="6" fill="#bae6fd"/><text x="85" y="90" text-anchor="middle" class="svg-ink" font-size="12">A: 10.10.1.0/24</text>
<rect x="20" y="115" width="130" height="40" rx="6" fill="#bbf7d0"/><text x="85" y="140" text-anchor="middle" class="svg-ink" font-size="12">B: 10.10.1.0/24</text>
<line x1="150" y1="85" x2="220" y2="85" stroke="#64748b" stroke-width="2"/><line x1="150" y1="135" x2="220" y2="135" stroke="#64748b" stroke-width="2"/>
<rect x="490" y="95" width="130" height="50" rx="6" fill="#ddd6fe"/><text x="555" y="118" text-anchor="middle" class="svg-ink" font-size="12">CORE1</text><text x="555" y="135" text-anchor="middle" class="svg-muted" font-size="12">Gi0/0.101 / .102</text>
<line x1="420" y1="85" x2="490" y2="110" stroke="#64748b" stroke-width="2"/><line x1="420" y1="135" x2="490" y2="128" stroke="#64748b" stroke-width="2"/>
<text x="320" y="240" text-anchor="middle" class="svg-muted" font-size="12">Same prefix twice, no conflict: each lives in its own table</text>
</svg><p class="cap">Each interface is placed in one VRF; lookups never cross tables unless you leak routes.</p></div>

<h3>VRF-lite versus MPLS L3VPN</h3>
<p><b>VRF-lite</b> means VRFs used without MPLS. To keep CUST-A separate across several routers, every link between them must carry a separate Layer 3 interface per VRF, usually 802.1Q subinterfaces (Gi0/0.101 for CUST-A, Gi0/0.102 for CUST-B), and a routing protocol instance per VRF on each hop. It is simple and perfect for a campus core, a data center border or a firewall handoff, but it does not scale to hundreds of sites because the configuration grows with every VRF on every hop.</p>
<p><b>MPLS Layer 3 VPN</b> uses the same VRFs on provider edge routers, but carries all of them over a shared core using labels and MP-BGP. Two values appear there: the <b>route distinguisher (RD)</b>, a 64-bit value such as 65000:1 prefixed to a route so overlapping prefixes stay unique inside BGP, and the <b>route target (RT)</b>, an extended community that controls which VRFs import which routes. For ENCOR you configure VRF-lite; MPLS VPN is described at concept level.</p>

<table class="cmp"><tr><th>Term</th><th>What it does</th><th>Needed for VRF-lite?</th></tr>
<tr><td>VRF name</td><td>Local name of the routing table, case-sensitive</td><td>Yes</td></tr>
<tr><td>RD</td><td>Makes prefixes unique inside MP-BGP</td><td>No (optional with <code>vrf definition</code>)</td></tr>
<tr><td>RT</td><td>Import and export policy between VRFs in BGP</td><td>No</td></tr>
<tr><td>Address family</td><td>Enables IPv4 and/or IPv6 in the VRF</td><td>Yes, with <code>vrf definition</code></td></tr>
</table>

<h3>Where VRFs are used</h3>
<ul>
<li><b>Multi-tenancy</b>: a provider or data center hosting many customers with overlapping space.</li>
<li><b>Segmentation</b> inside an enterprise: corporate, guest, IoT and PCI payment networks kept apart, with a firewall as the only point where they meet.</li>
<li><b>Management VRF</b>: many IOS XE devices put the dedicated management port in VRF <code>Mgmt-intf</code> (on Catalyst 9000 switches, GigabitEthernet0/0), so management traffic never touches the data plane table.</li>
<li><b>Front-door VRF</b>: putting the internet-facing interface in its own VRF so the tunnel transport and the inside routing are fully separated. You will see this as a fix for recursive routing in chapter 7.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> EDGE1 connects two business units. CUST-A's LAN on Gi0/1 is 10.10.1.0/24 and CUST-B's LAN on Gi0/2 is also 10.10.1.0/24. Both reach CORE1 over one physical cable, Gi0/0, split into subinterface Gi0/0.101 (VLAN 101, 10.255.1.1/30, CUST-A) and Gi0/0.102 (VLAN 102, 10.255.2.1/30, CUST-B). A packet from CUST-A to 10.20.0.5 is looked up in the CUST-A table and leaves on Gi0/0.101; the same destination from CUST-B leaves on Gi0/0.102. The router never gets confused, because the incoming interface decides the table.</p></div>

<div class="warn"><p><b>Common mistake.</b> Thinking a VRF is a security feature on its own. A VRF separates routing, but if someone leaks a default route between VRFs or a shared firewall rule allows everything, the isolation is gone. VRFs give separation; policy at the meeting point gives security.</p></div>

<div class="exam"><p><b>Exam traps.</b> RD does not control route import or export; RT does. RD is optional for VRF-lite with the newer <code>vrf definition</code> syntax. An interface belongs to only one VRF at a time. VRF-lite needs a separate Layer 3 interface per VRF per hop.</p></div>

<div class="scn"><h4>Guest Wi-Fi reaching the ERP server</h4><p>A hospital put guest Wi-Fi in VLAN 300 and corporate users in VLAN 100, both routed on the same core switch. A static route added for a vendor accidentally let guests reach the ERP subnet. The fix was to create VRF GUEST, move SVI Vlan300 into it and give it only a default route towards the internet firewall. Guests could no longer see any corporate prefix, because those prefixes did not exist in their table.</p><p><b>Lesson:</b> ACLs filter what you remember to block; a VRF removes the routes entirely, so forgotten paths cannot exist.</p></div>

<div class="iv"><p class="q">"What is a VRF, and how is VRF-lite different from MPLS VPN?"</p><p>A VRF is a separate routing and forwarding table on the same router; each Layer 3 interface belongs to one VRF, so overlapping addresses can coexist. VRF-lite uses VRFs hop by hop without MPLS, with a subinterface and a routing instance per VRF on each link. MPLS L3VPN keeps VRFs only on the PE routers and carries them across a label-switched core using MP-BGP, with RDs to keep prefixes unique and RTs to control import and export. Mention that VRF-lite is great for a campus or DC edge but does not scale to many sites.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A VRF is a separate RIB and FIB inside one router; each L3 interface belongs to exactly one VRF.</li>
<li>Overlapping addresses are fine across different VRFs.</li>
<li>VRF-lite = VRFs without MPLS, a subinterface and routing instance per VRF per hop.</li>
<li>RD makes routes unique in MP-BGP; RT controls import and export. Neither is required for VRF-lite.</li>
<li>Common uses: multi-tenancy, segmentation, management VRF, front-door VRF for tunnels.</li>
</ul></div>
`,hi:`
<p>Ek bade apartment building ko socho jahan har tower ki apni letterbox wall hai. Postman tower A ke flat 101 aur tower B ke flat 101 dono ki chitthiyan le jaata hai. Numbers same hain, lekin chitthiyan kabhi mix nahi hoti, kyunki har tower ki apni alag boxes wali wall hai. <b>VRF</b> router ko bilkul yahi deta hai: ek box ke andar kai alag "letterbox walls" (routing tables), taaki same addresses bina confusion ke saath-saath reh sakein.</p>

<h3>Device virtualization se network virtualization tak</h3>
<p>Pichhle chapter mein ek server kai servers bana. <b>Network virtualization</b> yahi idea network par lagata hai: ek physical infrastructure kai logically isolated networks le jaata hai, har ek ki apni addressing, routing aur policy ke saath. Layer 2 par tool <b>VLAN</b> hai: ek switch, kai broadcast domains. Layer 3 par tool <b>VRF</b> hai: ek router, kai routing tables. VLANs, VRFs aur tunnels ko milao to network ke ek end se doosre end tak <b>path isolation</b> milta hai.</p>

<h3>VRF kya hai</h3>
<p><b>VRF (Virtual Routing and Forwarding) instance</b> ek router ya Layer 3 switch ke andar ek independent routing table (RIB) aur uski apni forwarding table (CEF FIB) hai. Har Layer 3 interface bilkul ek VRF ka hota hai. Agar aap assign nahi karte, to woh <b>global</b> table ka hota hai, jo default VRF hai jise aap CCNA se use kar rahe ho.</p>
<ul>
<li>VRF CUST-A wale interface par aaya packet sirf CUST-A table mein lookup hota hai.</li>
<li>Woh sirf un interfaces se nikal sakta hai jo CUST-A mein hi hain, jab tak aap jaan-boojh kar routes leak na karo.</li>
<li>Routing protocols per VRF chalte hain: ek OSPF process ya EIGRP address family ek VRF se bandha hota hai.</li>
<li>Kyunki tables alag hain, CUST-A aur CUST-B dono 10.10.1.0/24 use kar sakte hain.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Ek router, teen routing tables">
<rect x="200" y="30" width="240" height="190" rx="10" fill="#e2e8f0"/><text x="320" y="52" text-anchor="middle" class="svg-ink" font-size="14">EDGE1</text>
<rect x="220" y="65" width="200" height="40" rx="6" fill="#bae6fd"/><text x="320" y="90" text-anchor="middle" class="svg-ink" font-size="13">VRF CUST-A table</text>
<rect x="220" y="115" width="200" height="40" rx="6" fill="#bbf7d0"/><text x="320" y="140" text-anchor="middle" class="svg-ink" font-size="13">VRF CUST-B table</text>
<rect x="220" y="165" width="200" height="40" rx="6" fill="#fde68a"/><text x="320" y="190" text-anchor="middle" class="svg-ink" font-size="13">Global table</text>
<rect x="20" y="65" width="130" height="40" rx="6" fill="#bae6fd"/><text x="85" y="90" text-anchor="middle" class="svg-ink" font-size="12">A: 10.10.1.0/24</text>
<rect x="20" y="115" width="130" height="40" rx="6" fill="#bbf7d0"/><text x="85" y="140" text-anchor="middle" class="svg-ink" font-size="12">B: 10.10.1.0/24</text>
<line x1="150" y1="85" x2="220" y2="85" stroke="#64748b" stroke-width="2"/><line x1="150" y1="135" x2="220" y2="135" stroke="#64748b" stroke-width="2"/>
<rect x="490" y="95" width="130" height="50" rx="6" fill="#ddd6fe"/><text x="555" y="118" text-anchor="middle" class="svg-ink" font-size="12">CORE1</text><text x="555" y="135" text-anchor="middle" class="svg-muted" font-size="12">Gi0/0.101 / .102</text>
<line x1="420" y1="85" x2="490" y2="110" stroke="#64748b" stroke-width="2"/><line x1="420" y1="135" x2="490" y2="128" stroke="#64748b" stroke-width="2"/>
<text x="320" y="240" text-anchor="middle" class="svg-muted" font-size="12">Same prefix do baar, koi conflict nahi: har ek apni table mein</text>
</svg><p class="cap">Har interface ek VRF mein rakha jaata hai; jab tak aap routes leak na karo, lookups tables cross nahi karte.</p></div>

<h3>VRF-lite vs MPLS L3VPN</h3>
<p><b>VRF-lite</b> ka matlab hai bina MPLS ke VRFs use karna. Kai routers ke paar CUST-A ko alag rakhne ke liye, unke beech har link par har VRF ke liye alag Layer 3 interface chahiye, aam taur par 802.1Q subinterfaces (CUST-A ke liye Gi0/0.101, CUST-B ke liye Gi0/0.102), aur har hop par har VRF ke liye ek routing protocol instance. Yeh simple hai aur campus core, data center border ya firewall handoff ke liye perfect hai, lekin sainkdon sites tak scale nahi karta kyunki har hop par har VRF ke saath configuration badhti jaati hai.</p>
<p><b>MPLS Layer 3 VPN</b> provider edge routers par wahi VRFs use karta hai, lekin sabko labels aur MP-BGP se ek shared core ke upar le jaata hai. Wahan do values dikhti hain: <b>route distinguisher (RD)</b>, ek 64-bit value jaise 65000:1 jo route ke aage lagti hai taaki BGP ke andar overlapping prefixes unique rahein, aur <b>route target (RT)</b>, ek extended community jo control karti hai kaunsa VRF kaunse routes import kare. ENCOR ke liye aap VRF-lite configure karte ho; MPLS VPN concept level par describe hota hai.</p>

<table class="cmp"><tr><th>Term</th><th>Kya karta hai</th><th>VRF-lite ke liye chahiye?</th></tr>
<tr><td>VRF name</td><td>Routing table ka local naam, case-sensitive</td><td>Haan</td></tr>
<tr><td>RD</td><td>MP-BGP ke andar prefixes ko unique banata hai</td><td>Nahi (<code>vrf definition</code> ke saath optional)</td></tr>
<tr><td>RT</td><td>BGP mein VRFs ke beech import aur export policy</td><td>Nahi</td></tr>
<tr><td>Address family</td><td>VRF mein IPv4 aur/ya IPv6 enable karta hai</td><td>Haan, <code>vrf definition</code> ke saath</td></tr>
</table>

<h3>VRFs kahan use hote hain</h3>
<ul>
<li><b>Multi-tenancy</b>: provider ya data center jo overlapping space wale kai customers host karta hai.</li>
<li>Enterprise ke andar <b>segmentation</b>: corporate, guest, IoT aur PCI payment networks alag rakhe jaate hain, aur firewall hi ekmatra jagah hai jahan woh milte hain.</li>
<li><b>Management VRF</b>: kai IOS XE devices dedicated management port ko VRF <code>Mgmt-intf</code> mein rakhte hain (Catalyst 9000 switches par GigabitEthernet0/0), taaki management traffic kabhi data plane table ko na chhue.</li>
<li><b>Front-door VRF</b>: internet-facing interface ko apne VRF mein rakhna taaki tunnel transport aur andar ki routing poori tarah alag rahein. Chapter 7 mein aap ise recursive routing ke fix ki tarah dekhoge.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> EDGE1 do business units ko jodta hai. Gi0/1 par CUST-A ka LAN 10.10.1.0/24 hai aur Gi0/2 par CUST-B ka LAN bhi 10.10.1.0/24 hai. Dono ek physical cable Gi0/0 se CORE1 tak pahunchte hain, jo subinterface Gi0/0.101 (VLAN 101, 10.255.1.1/30, CUST-A) aur Gi0/0.102 (VLAN 102, 10.255.2.1/30, CUST-B) mein bata hai. CUST-A se 10.20.0.5 ka packet CUST-A table mein lookup hota hai aur Gi0/0.101 se nikalta hai; CUST-B se wahi destination Gi0/0.102 se nikalta hai. Router kabhi confuse nahi hota, kyunki incoming interface table decide karta hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Yeh sochna ki VRF akele ek security feature hai. VRF routing alag karta hai, lekin agar koi VRFs ke beech default route leak kar de ya shared firewall rule sab kuch allow kar de, to isolation khatam. VRFs separation dete hain; milne wali jagah par policy security deti hai.</p></div>

<div class="exam"><p><b>Exam traps.</b> RD route import ya export control nahi karta; RT karta hai. Naye <code>vrf definition</code> syntax ke saath VRF-lite ke liye RD optional hai. Ek interface ek time par sirf ek VRF ka hota hai. VRF-lite ko har hop par har VRF ke liye alag Layer 3 interface chahiye.</p></div>

<div class="scn"><h4>Guest Wi-Fi ERP server tak pahunch gaya</h4><p>Ek hospital ne guest Wi-Fi VLAN 300 mein aur corporate users VLAN 100 mein rakhe, dono same core switch par routed. Ek vendor ke liye add kiye gaye static route ne galti se guests ko ERP subnet tak pahunchne diya. Fix tha VRF GUEST banana, SVI Vlan300 ko usmein move karna aur use sirf internet firewall ki taraf default route dena. Guests ab koi corporate prefix nahi dekh sakte the, kyunki woh prefixes unki table mein the hi nahi.</p><p><b>Seekh:</b> ACLs wahi filter karte hain jo aap block karna yaad rakhte ho; VRF routes ko hi hata deta hai, isliye bhule hue paths exist hi nahi kar sakte.</p></div>

<div class="iv"><p class="q">"VRF kya hai, aur VRF-lite MPLS VPN se kaise alag hai?"</p><p>VRF same router par ek alag routing aur forwarding table hai; har Layer 3 interface ek VRF ka hota hai, isliye overlapping addresses saath reh sakte hain. VRF-lite bina MPLS ke hop by hop VRFs use karta hai, har link par har VRF ke liye ek subinterface aur routing instance ke saath. MPLS L3VPN VRFs sirf PE routers par rakhta hai aur unhe MP-BGP use karke label-switched core ke paar le jaata hai, prefixes unique rakhne ke liye RDs aur import/export control karne ke liye RTs ke saath. Batao ki VRF-lite campus ya DC edge ke liye badhiya hai lekin kai sites tak scale nahi karta.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VRF ek router ke andar alag RIB aur FIB hai; har L3 interface bilkul ek VRF ka hota hai.</li>
<li>Alag VRFs mein overlapping addresses bilkul theek hain.</li>
<li>VRF-lite = bina MPLS ke VRFs, har hop par har VRF ke liye ek subinterface aur routing instance.</li>
<li>RD MP-BGP mein routes unique banata hai; RT import aur export control karta hai. VRF-lite ke liye dono zaroori nahi.</li>
<li>Common uses: multi-tenancy, segmentation, management VRF, tunnels ke liye front-door VRF.</li>
</ul></div>
`}};export{e as default};