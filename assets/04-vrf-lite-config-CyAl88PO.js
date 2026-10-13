var e={id:`vrf-lite-config`,h:{en:`Configuring and verifying VRF-lite`,hi:`VRF-lite configure aur verify karna`},body:{en:`
<p>Creating a VRF is like opening a new, empty ledger book in an office. First you print the cover (the VRF name), then you decide which columns it has (the address families), and only then do clerks (interfaces) get assigned to write in it. A clerk moved to a new ledger does not carry old entries across: they start with a blank page. That last point surprises everyone the first time, and it is the most tested VRF behaviour.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="VRF-lite over one trunk">
<rect x="20" y="30" width="140" height="40" rx="6" fill="#bae6fd"/><text x="90" y="55" text-anchor="middle" class="svg-ink" font-size="12">Gi0/1 10.10.1.1 (A)</text>
<rect x="20" y="120" width="140" height="40" rx="6" fill="#bbf7d0"/><text x="90" y="145" text-anchor="middle" class="svg-ink" font-size="12">Gi0/2 10.10.1.1 (B)</text>
<rect x="220" y="50" width="160" height="90" rx="10" fill="#e2e8f0"/><text x="300" y="90" text-anchor="middle" class="svg-ink" font-size="14">EDGE1</text><text x="300" y="110" text-anchor="middle" class="svg-muted" font-size="12">CUST-A, CUST-B</text>
<line x1="160" y1="50" x2="220" y2="75" stroke="#64748b" stroke-width="2"/><line x1="160" y1="140" x2="220" y2="115" stroke="#64748b" stroke-width="2"/>
<line x1="380" y1="95" x2="480" y2="95" stroke="#64748b" stroke-width="5"/>
<text x="430" y="80" text-anchor="middle" class="svg-accent" font-size="12">.101 A / .102 B</text><text x="430" y="120" text-anchor="middle" class="svg-muted" font-size="12">one trunk Gi0/0</text>
<rect x="480" y="70" width="140" height="50" rx="8" fill="#ddd6fe"/><text x="550" y="100" text-anchor="middle" class="svg-ink" font-size="13">CORE1</text>
</svg><p class="cap">The example used in this chapter: two tenants, one router, one trunk with a subinterface per VRF.</p></div>

<h3>Step 1: define the VRF</h3>
<p>Modern IOS XE uses the <b>multiprotocol</b> syntax <code>vrf definition</code>. The older <code>ip vrf</code> syntax is IPv4 only and still appears on older devices and exam exhibits.</p>
<pre class="code"><span class="c">! EDGE1: two tenants with overlapping LANs</span>
vrf definition CUST-A
 rd 65000:1                       <span class="c">! optional for VRF-lite</span>
 address-family ipv4
 exit-address-family
!
vrf definition CUST-B
 address-family ipv4
 exit-address-family</pre>
<p>The <b>address-family</b> line is not optional: a VRF with no IPv4 address family cannot hold IPv4 addresses. Add <code>address-family ipv6</code> as well for dual stack. The RD is only needed if the VRF will later be carried in MP-BGP.</p>

<h3>Step 2: put interfaces into the VRF, and watch the IP disappear</h3>
<pre class="code">interface GigabitEthernet0/1
 vrf forwarding CUST-A
<span class="c">! IOS prints:</span>
<span class="c">! % Interface GigabitEthernet0/1 IPv4 disabled and address(es) removed due to enabling VRF CUST-A</span>
 ip address 10.10.1.1 255.255.255.0
!
interface GigabitEthernet0/2
 vrf forwarding CUST-B
 ip address 10.10.1.1 255.255.255.0
!
interface GigabitEthernet0/0.101
 encapsulation dot1Q 101
 vrf forwarding CUST-A
 ip address 10.255.1.1 255.255.255.252
!
interface GigabitEthernet0/0.102
 encapsulation dot1Q 102
 vrf forwarding CUST-B
 ip address 10.255.2.1 255.255.255.252</pre>
<p>Why does the address vanish? An IP address is not just a setting on an interface; it creates connected and local routes in a routing table. Moving the interface to another VRF means those routes must move to another table, so IOS removes the address and makes you enter it again inside the new context. The rule to remember: <b>vrf forwarding first, ip address second</b>. If you paste configuration in the wrong order, the interface silently ends up with no address. Notice also that 10.10.1.1/24 appears twice on the same router with no "overlaps with" error, because the two copies live in different tables.</p>

<h3>Step 3: routing inside each VRF</h3>
<pre class="code"><span class="c">! static default route per VRF</span>
ip route vrf CUST-A 0.0.0.0 0.0.0.0 10.255.1.2
ip route vrf CUST-B 0.0.0.0 0.0.0.0 10.255.2.2
<span class="c">! or a dynamic protocol bound to the VRF</span>
router ospf 11 vrf CUST-A
 network 10.10.1.0 0.0.0.255 area 0
 network 10.255.1.0 0.0.0.3 area 0</pre>
<p>Each OSPF process belongs to one VRF, so you need a process per VRF. EIGRP named mode and BGP use <code>address-family ipv4 vrf NAME</code> instead.</p>

<h3>Step 4: verification</h3>
<pre class="out">EDGE1# show vrf
  Name                             Default RD            Protocols   Interfaces
  <span class="hl">CUST-A                           65000:1               ipv4        Gi0/1</span>
                                                                     Gi0/0.101
  CUST-B                           &lt;not set&gt;             ipv4        Gi0/2
                                                                     Gi0/0.102

EDGE1# show ip route vrf CUST-A

Routing Table: CUST-A
Gateway of last resort is 10.255.1.2 to network 0.0.0.0

<span class="hl">S*    0.0.0.0/0 [1/0] via 10.255.1.2</span>
      10.0.0.0/8 is variably subnetted, 4 subnets, 3 masks
C        10.10.1.0/24 is directly connected, GigabitEthernet0/1
L        10.10.1.1/32 is directly connected, GigabitEthernet0/1
C        10.255.1.0/30 is directly connected, GigabitEthernet0/0.101
L        10.255.1.1/32 is directly connected, GigabitEthernet0/0.101

EDGE1# ping 10.255.1.2
.....
Success rate is 0 percent (0/5)
EDGE1# ping vrf CUST-A 10.255.1.2
!!!!!
<span class="hl">Success rate is 100 percent (5/5)</span></pre>
<p>A plain <code>ping</code> uses the global table, which knows nothing about CUST-A, so it fails. Every tool from the router needs the VRF keyword: <code>ping vrf</code>, <code>traceroute vrf</code>, <code>show ip route vrf</code>, <code>show ip arp vrf</code>, <code>show ip protocols vrf</code>. <code>show ip vrf interfaces</code> lists each interface with its VRF and address. Note that <code>show ip interface brief</code> does not show the VRF at all.</p>

<h3>Route leaking, at concept level</h3>
<p>Sometimes tenants must share one service, such as DNS or an internet firewall. Moving routes between VRFs is called <b>route leaking</b>. The options, from simplest to most scalable:</p>
<ul>
<li><b>Static routes across VRFs</b>: <code>ip route vrf CUST-A 192.0.2.0 255.255.255.0 198.51.100.1 global</code> resolves the next hop in the global table.</li>
<li><b>MP-BGP with route targets</b>: export from one VRF, import into another. This is how MPLS VPNs build shared-services and extranet designs.</li>
<li><b>An external device</b> such as a firewall with one interface per VRF, which adds inspection at the meeting point.</li>
</ul>
<p>Overlapping prefixes cannot be leaked into the same table; you would need NAT in between.</p>

<div class="warn"><p><b>Common mistakes.</b> Entering <code>vrf forwarding</code> after the IP address and not noticing the address was removed. Forgetting <code>address-family ipv4</code> under <code>vrf definition</code>. Testing with a plain ping and concluding the VRF is broken. Misspelling the VRF name: names are case-sensitive, so cust-a and CUST-A are two VRFs.</p></div>

<div class="exam"><p><b>Exam traps.</b> <code>ip vrf forwarding</code> belongs to the old <code>ip vrf</code> syntax; <code>vrf forwarding</code> belongs to <code>vrf definition</code>. A static route inside a VRF needs <code>ip route vrf NAME</code>. Expect a question asking why an interface lost its IP address after being placed in a VRF.</p></div>

<div class="scn"><h4>The migration that went dark</h4><p>An engineer pushed a change script that moved branch SVIs into VRF CORP. The script listed <code>ip address</code> first and <code>vrf forwarding CORP</code> second. After the change every SVI was up/up with no IP address, and 400 users lost their gateway. <code>show ip vrf interfaces</code> showed the SVIs in CORP with blank addresses. Reordering the script and re-applying the addresses restored service within minutes.</p><p><b>Lesson:</b> always place the interface in the VRF first, then assign addresses, and verify with a VRF-aware command.</p></div>

<div class="iv"><p class="q">"You put an interface in a VRF and it lost its IP. Why, and how do you verify the VRF works?"</p><p>Changing VRF moves the connected and local routes to a different table, so IOS removes the IPv4 address and you must re-enter it after <code>vrf forwarding</code>. Verify with <code>show vrf</code>, <code>show ip vrf interfaces</code>, <code>show ip route vrf NAME</code> and <code>ping vrf NAME</code>. Mention that a normal ping uses the global table and will fail even when the VRF is healthy.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>vrf definition NAME</code> plus <code>address-family ipv4</code>; RD optional for VRF-lite.</li>
<li><code>vrf forwarding</code> removes the interface IP: always configure it before <code>ip address</code>.</li>
<li>Routing per VRF: <code>ip route vrf</code>, <code>router ospf N vrf</code>, BGP or EIGRP address families.</li>
<li>Verify with <code>show vrf</code>, <code>show ip route vrf</code>, <code>ping vrf</code>; plain ping uses the global table.</li>
<li>Route leaking uses static routes with <code>global</code>, MP-BGP route targets, or a firewall between VRFs.</li>
</ul></div>
`,hi:`
<p>VRF banana office mein ek naya, khaali ledger book kholne jaisa hai. Pehle aap cover print karte ho (VRF name), phir decide karte ho usmein kaunse columns honge (address families), aur tabhi clerks (interfaces) ko usmein likhne ke liye assign kiya jaata hai. Naye ledger mein bheja gaya clerk purani entries saath nahi le jaata: woh khaali page se shuru karta hai. Yeh aakhri baat pehli baar sabko hairaan karti hai, aur yahi sabse zyada tested VRF behaviour hai.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Ek trunk par VRF-lite">
<rect x="20" y="30" width="140" height="40" rx="6" fill="#bae6fd"/><text x="90" y="55" text-anchor="middle" class="svg-ink" font-size="12">Gi0/1 10.10.1.1 (A)</text>
<rect x="20" y="120" width="140" height="40" rx="6" fill="#bbf7d0"/><text x="90" y="145" text-anchor="middle" class="svg-ink" font-size="12">Gi0/2 10.10.1.1 (B)</text>
<rect x="220" y="50" width="160" height="90" rx="10" fill="#e2e8f0"/><text x="300" y="90" text-anchor="middle" class="svg-ink" font-size="14">EDGE1</text><text x="300" y="110" text-anchor="middle" class="svg-muted" font-size="12">CUST-A, CUST-B</text>
<line x1="160" y1="50" x2="220" y2="75" stroke="#64748b" stroke-width="2"/><line x1="160" y1="140" x2="220" y2="115" stroke="#64748b" stroke-width="2"/>
<line x1="380" y1="95" x2="480" y2="95" stroke="#64748b" stroke-width="5"/>
<text x="430" y="80" text-anchor="middle" class="svg-accent" font-size="12">.101 A / .102 B</text><text x="430" y="120" text-anchor="middle" class="svg-muted" font-size="12">ek trunk Gi0/0</text>
<rect x="480" y="70" width="140" height="50" rx="8" fill="#ddd6fe"/><text x="550" y="100" text-anchor="middle" class="svg-ink" font-size="13">CORE1</text>
</svg><p class="cap">Is chapter ka example: do tenants, ek router, ek trunk jismein har VRF ke liye ek subinterface.</p></div>

<h3>Step 1: VRF define karo</h3>
<p>Modern IOS XE <b>multiprotocol</b> syntax <code>vrf definition</code> use karta hai. Purana <code>ip vrf</code> syntax sirf IPv4 hai aur ab bhi purane devices aur exam exhibits mein dikhta hai.</p>
<pre class="code"><span class="c">! EDGE1: overlapping LANs wale do tenants</span>
vrf definition CUST-A
 rd 65000:1                       <span class="c">! VRF-lite ke liye optional</span>
 address-family ipv4
 exit-address-family
!
vrf definition CUST-B
 address-family ipv4
 exit-address-family</pre>
<p><b>Address-family</b> line optional nahi hai: bina IPv4 address family wala VRF IPv4 addresses hold nahi kar sakta. Dual stack ke liye <code>address-family ipv6</code> bhi jodo. RD sirf tab chahiye jab VRF baad mein MP-BGP mein carry hona ho.</p>

<h3>Step 2: interfaces ko VRF mein daalo, aur IP gayab hote dekho</h3>
<pre class="code">interface GigabitEthernet0/1
 vrf forwarding CUST-A
<span class="c">! IOS print karta hai:</span>
<span class="c">! % Interface GigabitEthernet0/1 IPv4 disabled and address(es) removed due to enabling VRF CUST-A</span>
 ip address 10.10.1.1 255.255.255.0
!
interface GigabitEthernet0/2
 vrf forwarding CUST-B
 ip address 10.10.1.1 255.255.255.0
!
interface GigabitEthernet0/0.101
 encapsulation dot1Q 101
 vrf forwarding CUST-A
 ip address 10.255.1.1 255.255.255.252
!
interface GigabitEthernet0/0.102
 encapsulation dot1Q 102
 vrf forwarding CUST-B
 ip address 10.255.2.1 255.255.255.252</pre>
<p>Address gayab kyun hota hai? IP address interface par sirf ek setting nahi hai; yeh routing table mein connected aur local routes banata hai. Interface ko doosre VRF mein move karne ka matlab hai un routes ko doosri table mein jaana padega, isliye IOS address hata deta hai aur aapse naye context mein dobara daalne ko kehta hai. Yaad rakhne wala rule: <b>pehle vrf forwarding, phir ip address</b>. Agar aap configuration galat order mein paste karte ho, to interface chupchaap bina address ke reh jaata hai. Yeh bhi dekho ki 10.10.1.1/24 same router par do baar dikhta hai bina "overlaps with" error ke, kyunki dono copies alag tables mein rehti hain.</p>

<h3>Step 3: har VRF ke andar routing</h3>
<pre class="code"><span class="c">! har VRF ka static default route</span>
ip route vrf CUST-A 0.0.0.0 0.0.0.0 10.255.1.2
ip route vrf CUST-B 0.0.0.0 0.0.0.0 10.255.2.2
<span class="c">! ya VRF se bandha dynamic protocol</span>
router ospf 11 vrf CUST-A
 network 10.10.1.0 0.0.0.255 area 0
 network 10.255.1.0 0.0.0.3 area 0</pre>
<p>Har OSPF process ek VRF ka hota hai, isliye har VRF ke liye ek process chahiye. EIGRP named mode aur BGP iski jagah <code>address-family ipv4 vrf NAME</code> use karte hain.</p>

<h3>Step 4: verification</h3>
<pre class="out">EDGE1# show vrf
  Name                             Default RD            Protocols   Interfaces
  <span class="hl">CUST-A                           65000:1               ipv4        Gi0/1</span>
                                                                     Gi0/0.101
  CUST-B                           &lt;not set&gt;             ipv4        Gi0/2
                                                                     Gi0/0.102

EDGE1# show ip route vrf CUST-A

Routing Table: CUST-A
Gateway of last resort is 10.255.1.2 to network 0.0.0.0

<span class="hl">S*    0.0.0.0/0 [1/0] via 10.255.1.2</span>
      10.0.0.0/8 is variably subnetted, 4 subnets, 3 masks
C        10.10.1.0/24 is directly connected, GigabitEthernet0/1
L        10.10.1.1/32 is directly connected, GigabitEthernet0/1
C        10.255.1.0/30 is directly connected, GigabitEthernet0/0.101
L        10.255.1.1/32 is directly connected, GigabitEthernet0/0.101

EDGE1# ping 10.255.1.2
.....
Success rate is 0 percent (0/5)
EDGE1# ping vrf CUST-A 10.255.1.2
!!!!!
<span class="hl">Success rate is 100 percent (5/5)</span></pre>
<p>Plain <code>ping</code> global table use karta hai, jise CUST-A ke baare mein kuch pata nahi, isliye woh fail hota hai. Router se har tool ko VRF keyword chahiye: <code>ping vrf</code>, <code>traceroute vrf</code>, <code>show ip route vrf</code>, <code>show ip arp vrf</code>, <code>show ip protocols vrf</code>. <code>show ip vrf interfaces</code> har interface ko uske VRF aur address ke saath list karta hai. Dhyan do ki <code>show ip interface brief</code> VRF bilkul nahi dikhata.</p>

<h3>Route leaking, concept level par</h3>
<p>Kabhi-kabhi tenants ko ek service share karni hoti hai, jaise DNS ya internet firewall. VRFs ke beech routes move karna <b>route leaking</b> kehlata hai. Options, sabse simple se sabse scalable tak:</p>
<ul>
<li><b>VRFs ke paar static routes</b>: <code>ip route vrf CUST-A 192.0.2.0 255.255.255.0 198.51.100.1 global</code> next hop ko global table mein resolve karta hai.</li>
<li><b>Route targets ke saath MP-BGP</b>: ek VRF se export, doosre mein import. MPLS VPNs isi tarah shared-services aur extranet designs banate hain.</li>
<li><b>Ek external device</b> jaise har VRF ke liye ek interface wala firewall, jo milne wali jagah par inspection jodta hai.</li>
</ul>
<p>Overlapping prefixes ko same table mein leak nahi kiya ja sakta; beech mein NAT chahiye hoga.</p>

<div class="warn"><p><b>Common galtiyan.</b> IP address ke baad <code>vrf forwarding</code> daalna aur dhyan na dena ki address hat gaya. <code>vrf definition</code> ke neeche <code>address-family ipv4</code> bhoolna. Plain ping se test karna aur maan lena ki VRF toota hai. VRF name ki spelling galat karna: names case-sensitive hain, isliye cust-a aur CUST-A do alag VRFs hain.</p></div>

<div class="exam"><p><b>Exam traps.</b> <code>ip vrf forwarding</code> purane <code>ip vrf</code> syntax ka hai; <code>vrf forwarding</code> <code>vrf definition</code> ka hai. VRF ke andar static route ko <code>ip route vrf NAME</code> chahiye. Aisa question expect karo jo poochhe ki VRF mein daalne ke baad interface ne apna IP address kyun kho diya.</p></div>

<div class="scn"><h4>Migration jo andhera kar gaya</h4><p>Ek engineer ne change script push ki jo branch SVIs ko VRF CORP mein move karti thi. Script mein <code>ip address</code> pehle aur <code>vrf forwarding CORP</code> baad mein tha. Change ke baad har SVI up/up tha lekin bina IP address ke, aur 400 users ka gateway chala gaya. <code>show ip vrf interfaces</code> ne SVIs ko CORP mein khaali addresses ke saath dikhaya. Script ka order theek karke aur addresses dobara lagane se minuton mein service wapas aa gayi.</p><p><b>Seekh:</b> hamesha pehle interface ko VRF mein daalo, phir addresses assign karo, aur VRF-aware command se verify karo.</p></div>

<div class="iv"><p class="q">"Aapne interface ko VRF mein daala aur uska IP chala gaya. Kyun, aur aap kaise verify karoge ki VRF chal raha hai?"</p><p>VRF badalne se connected aur local routes doosri table mein chale jaate hain, isliye IOS IPv4 address hata deta hai aur aapko <code>vrf forwarding</code> ke baad use dobara daalna padta hai. <code>show vrf</code>, <code>show ip vrf interfaces</code>, <code>show ip route vrf NAME</code> aur <code>ping vrf NAME</code> se verify karo. Batao ki normal ping global table use karta hai aur VRF healthy hone par bhi fail hoga.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>vrf definition NAME</code> plus <code>address-family ipv4</code>; VRF-lite ke liye RD optional.</li>
<li><code>vrf forwarding</code> interface ka IP hata deta hai: ise hamesha <code>ip address</code> se pehle configure karo.</li>
<li>Per VRF routing: <code>ip route vrf</code>, <code>router ospf N vrf</code>, BGP ya EIGRP address families.</li>
<li><code>show vrf</code>, <code>show ip route vrf</code>, <code>ping vrf</code> se verify karo; plain ping global table use karta hai.</li>
<li>Route leaking <code>global</code> ke saath static routes, MP-BGP route targets, ya VRFs ke beech firewall se hota hai.</li>
</ul></div>
`}};export{e as default};