var e={id:`configuration`,h:{en:`Configuring eBGP: customer to ISP, step by step`,hi:`eBGP configure karna: customer se ISP, step by step`},body:{en:`
<p>Opening a bank account needs three things: your identity, the branch you are dealing with, and what you want to deposit. BGP configuration is the same three things: <b>who am I</b> (<code>router bgp</code> with my ASN and a router ID), <b>who is my peer</b> (<code>neighbor ... remote-as</code>), and <b>what do I announce</b> (<code>network</code> or <code>redistribute</code>). This chapter walks lab 1 line by line.</p>

<h3>The lab 1 topology</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Lab 1 customer to ISP">
<rect x="10" y="120" width="120" height="50" rx="8" fill="#e2e8f0"/><text x="70" y="142" text-anchor="middle" class="svg-ink" font-size="13">PC1</text><text x="70" y="160" text-anchor="middle" class="svg-muted" font-size="12">192.168.50.10</text>
<rect x="190" y="40" width="150" height="56" rx="8" fill="#bae6fd"/><text x="265" y="64" text-anchor="middle" class="svg-ink" font-size="13">CUST-EDGE</text><text x="265" y="82" text-anchor="middle" class="svg-muted" font-size="12">AS 65010, RID 10.10.10.10</text>
<rect x="450" y="40" width="170" height="56" rx="8" fill="#bbf7d0"/><text x="535" y="64" text-anchor="middle" class="svg-ink" font-size="13">ISP</text><text x="535" y="82" text-anchor="middle" class="svg-muted" font-size="12">AS 64500, RID 64.50.0.1</text>
<line x1="130" y1="140" x2="210" y2="96" stroke="#64748b" stroke-width="2"/><text x="120" y="110" class="svg-muted" font-size="12">g0/1 .1</text>
<line x1="340" y1="68" x2="450" y2="68" stroke="#64748b" stroke-width="3"/><text x="395" y="60" text-anchor="middle" class="svg-accent" font-size="12">100.64.10.0/30</text><text x="395" y="88" text-anchor="middle" class="svg-muted" font-size="12">.2   g0/0   .1</text>
<text x="535" y="130" text-anchor="middle" class="svg-muted" font-size="12">Lo0 203.0.113.1/24</text><text x="535" y="150" text-anchor="middle" class="svg-muted" font-size="12">Lo1 198.51.100.1/24</text>
<text x="265" y="130" text-anchor="middle" class="svg-muted" font-size="12">LAN 192.168.50.0/24</text>
</svg><p class="cap">Kaveri Textiles (AS 65010) buys transit from Skyline Net (AS 64500). The ISP side is already configured.</p></div>

<h3>Step 1: identity and neighbor</h3>
<pre class="code">CUST-EDGE(config)# router bgp 65010
<span class="c">! one BGP process per router; the number is your ASN</span>
CUST-EDGE(config-router)# bgp router-id 10.10.10.10
<span class="c">! fixed router ID, never changes after reload</span>
CUST-EDGE(config-router)# neighbor 100.64.10.1 remote-as 64500
<span class="c">! 64500 differs from 65010, so this is an eBGP peer</span>
CUST-EDGE(config-router)# neighbor 100.64.10.1 description Skyline-Net</pre>
<p>Within seconds, the log shows <code>%BGP-5-ADJCHANGE: neighbor 100.64.10.1 Up</code>. That log line exists because <code>bgp log-neighbor-changes</code> is on by default. The ISP's configuration mirrors yours: <code>router bgp 64500</code> and <code>neighbor 100.64.10.2 remote-as 65010</code>. Both sides must name each other's <b>interface address that the session actually uses</b> and each other's correct ASN.</p>

<h3>Step 2: advertise the LAN with network ... mask</h3>
<p>In OSPF, <code>network</code> enables the protocol on interfaces. In BGP it means something completely different: <b>"if this exact prefix with this exact mask is in my routing table, put it in the BGP table and advertise it"</b>. It does not enable anything on an interface.</p>
<pre class="code">CUST-EDGE(config-router)# network 192.168.50.0 mask 255.255.255.0
<span class="c">! must match show ip route exactly: 192.168.50.0/24 connected on g0/1</span></pre>
<ul>
<li>The prefix <b>and</b> mask must match a route in <code>show ip route</code> exactly (connected, static or IGP). <code>network 192.168.0.0 mask 255.255.0.0</code> advertises nothing if only 192.168.50.0/24 exists.</li>
<li>Without <code>mask</code>, IOS assumes the classful mask (/8, /16 or /24). Because 192.168.50.0/24 is a classful Class C network, <code>show running-config</code> may display the line as just <code>network 192.168.50.0</code>, and <code>show ip bgp</code> shows the prefix without "/24".</li>
<li>If the route later disappears from the RIB (the interface goes down), BGP withdraws the prefix automatically.</li>
</ul>

<h3>Address families</h3>
<p>Modern BGP (multiprotocol BGP) carries many kinds of routes, each in an <b>address family</b>: IPv4 unicast, IPv6 unicast, VPNv4 and more. On IOS, neighbors are activated for IPv4 unicast automatically, so the simple configuration above works. IOS XE then shows it in the running configuration like this:</p>
<pre class="out">router bgp 65010
 bgp router-id 10.10.10.10
 bgp log-neighbor-changes
 neighbor 100.64.10.1 remote-as 64500
 neighbor 100.64.10.1 description Skyline-Net
 !
<span class="hl"> address-family ipv4</span>
  network 192.168.50.0
<span class="hl">  neighbor 100.64.10.1 activate</span>
 exit-address-family</pre>
<p>Many operators disable the automatic behaviour with <code>no bgp default ipv4-unicast</code> and activate each neighbor explicitly inside <code>address-family ipv4</code>. If you do that and forget <code>activate</code>, the session comes up but <b>no IPv4 prefixes</b> are exchanged.</p>

<h3>The other way in: redistribution</h3>
<p><code>redistribute connected</code>, <code>redistribute static</code> or <code>redistribute ospf 1</code> injects routes from another source into BGP. Such routes get origin code <b>?</b> (incomplete) instead of <b>i</b>, and without a route-map you may leak far more than intended. For an internet edge, explicit <code>network</code> statements are the safer, cleaner choice. Note that redistributing OSPF into BGP takes only OSPF internal routes by default; external ones need <code>match internal external</code>.</p>

<h3>Step 3: verify</h3>
<pre class="out">CUST-EDGE# show ip bgp summary
BGP router identifier 10.10.10.10, local AS number 65010
BGP table version is 4, main routing table version 4
3 network entries using 744 bytes of memory
3 path entries using 408 bytes of memory

Neighbor        V           AS MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd
<span class="hl">100.64.10.1     4        64500       9       8        4    0    0 00:05:12        2</span>

CUST-EDGE# show ip route bgp
<span class="hl">B     198.51.100.0/24 [20/0] via 100.64.10.1, 00:05:12</span>
<span class="hl">B     203.0.113.0/24 [20/0] via 100.64.10.1, 00:05:12</span></pre>
<p>The number <b>2</b> in State/PfxRcd means Established with two prefixes received. <code>[20/0]</code> is AD 20 (eBGP) and metric 0 (the MED). On the ISP router, <code>show ip bgp</code> now lists 192.168.50.0 with next hop 100.64.10.2 and path <code>65010 i</code>, which is exactly what lab task 2 checks. Finally, PC1 can ping 203.0.113.1, because the forward path uses the BGP route on CUST-EDGE and the return path uses the ISP's BGP route to 192.168.50.0/24.</p>

<div class="eg"><p><b>Worked example.</b> A colleague types <code>network 192.168.50.0 mask 255.255.254.0</code>. The RIB has 192.168.50.0/24 only, so nothing is advertised, and the ISP's table has no 192.168.50.0. The PC can still send pings out (CUST-EDGE has the ISP routes) but replies never return, because the ISP has no route back. Fixing the mask to 255.255.255.0 makes the prefix appear within seconds.</p></div>

<div class="warn"><p><b>Common mistake.</b> Treating <code>network</code> like OSPF and typing a wildcard mask or an interface address. BGP's <code>network</code> needs the network address and a <b>subnet</b> mask matching the RIB entry exactly.</p></div>

<div class="exam"><p><b>Exam trap.</b> Locally originated routes show next hop <code>0.0.0.0</code> and weight <b>32768</b> in <code>show ip bgp</code>. Routes learned from peers have weight 0 by default. A network statement with no matching RIB route produces no error message at all: the prefix simply never appears.</p></div>

<div class="scn"><h4>One-way internet after a cut-over</h4><p>A company moved its office LAN from 192.168.50.0/24 to 192.168.52.0/23 on a weekend. On Monday nothing on the internet worked, though <code>show ip route bgp</code> on the edge still showed all ISP prefixes. <code>show ip bgp</code> showed no locally originated route at all: the <code>network</code> statement still said 192.168.50.0/24, which no longer existed in the RIB. Updating it to <code>network 192.168.52.0 mask 255.255.254.0</code> restored service.</p><p><b>Lesson:</b> every addressing change must include the BGP network statements; the RIB-match rule is strict and silent.</p></div>

<div class="iv"><p class="q">"What is the difference between the network command in OSPF and in BGP?"</p><p>Strong answer: in OSPF it matches interfaces and enables OSPF on them. In BGP it does not touch interfaces; it tells BGP to originate a prefix, and only if that exact prefix and mask exist in the routing table. Mention the classful default without <code>mask</code>, weight 32768 and next hop 0.0.0.0 for local routes, and <code>redistribute</code> as the alternative that gives origin <code>?</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Minimum eBGP config: <code>router bgp ASN</code>, <code>bgp router-id</code>, <code>neighbor IP remote-as ASN</code>.</li>
<li>BGP <code>network</code> originates a prefix only if the exact prefix and mask are in the RIB.</li>
<li>IPv4 unicast is activated by default on IOS; with <code>no bgp default ipv4-unicast</code> you must <code>activate</code> each neighbor.</li>
<li>Redistributed routes have origin <code>?</code>; network-statement routes have origin <code>i</code>.</li>
<li>Verify with <code>show ip bgp summary</code>, <code>show ip bgp</code> and <code>show ip route bgp</code>, then test end to end.</li>
</ul></div>
`,hi:`
<p>Bank account kholne ke liye teen cheezein chahiye: aapki pehchaan, woh branch jisse aap deal kar rahe ho, aur aap kya jama karna chahte ho. BGP configuration bhi yahi teen cheezein hai: <b>main kaun hoon</b> (mere ASN aur router ID ke saath <code>router bgp</code>), <b>mera peer kaun hai</b> (<code>neighbor ... remote-as</code>), aur <b>main kya announce karta hoon</b> (<code>network</code> ya <code>redistribute</code>). Yeh chapter lab 1 ko line by line chalata hai.</p>

<h3>Lab 1 topology</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Lab 1 customer se ISP">
<rect x="10" y="120" width="120" height="50" rx="8" fill="#e2e8f0"/><text x="70" y="142" text-anchor="middle" class="svg-ink" font-size="13">PC1</text><text x="70" y="160" text-anchor="middle" class="svg-muted" font-size="12">192.168.50.10</text>
<rect x="190" y="40" width="150" height="56" rx="8" fill="#bae6fd"/><text x="265" y="64" text-anchor="middle" class="svg-ink" font-size="13">CUST-EDGE</text><text x="265" y="82" text-anchor="middle" class="svg-muted" font-size="12">AS 65010, RID 10.10.10.10</text>
<rect x="450" y="40" width="170" height="56" rx="8" fill="#bbf7d0"/><text x="535" y="64" text-anchor="middle" class="svg-ink" font-size="13">ISP</text><text x="535" y="82" text-anchor="middle" class="svg-muted" font-size="12">AS 64500, RID 64.50.0.1</text>
<line x1="130" y1="140" x2="210" y2="96" stroke="#64748b" stroke-width="2"/><text x="120" y="110" class="svg-muted" font-size="12">g0/1 .1</text>
<line x1="340" y1="68" x2="450" y2="68" stroke="#64748b" stroke-width="3"/><text x="395" y="60" text-anchor="middle" class="svg-accent" font-size="12">100.64.10.0/30</text><text x="395" y="88" text-anchor="middle" class="svg-muted" font-size="12">.2   g0/0   .1</text>
<text x="535" y="130" text-anchor="middle" class="svg-muted" font-size="12">Lo0 203.0.113.1/24</text><text x="535" y="150" text-anchor="middle" class="svg-muted" font-size="12">Lo1 198.51.100.1/24</text>
<text x="265" y="130" text-anchor="middle" class="svg-muted" font-size="12">LAN 192.168.50.0/24</text>
</svg><p class="cap">Kaveri Textiles (AS 65010) Skyline Net (AS 64500) se transit khareedti hai. ISP side pehle se configured hai.</p></div>

<h3>Step 1: pehchaan aur neighbor</h3>
<pre class="code">CUST-EDGE(config)# router bgp 65010
<span class="c">! har router par ek BGP process; number aapka ASN hai</span>
CUST-EDGE(config-router)# bgp router-id 10.10.10.10
<span class="c">! fixed router ID, reload ke baad kabhi nahi badalta</span>
CUST-EDGE(config-router)# neighbor 100.64.10.1 remote-as 64500
<span class="c">! 64500 aur 65010 alag hain, isliye yeh eBGP peer hai</span>
CUST-EDGE(config-router)# neighbor 100.64.10.1 description Skyline-Net</pre>
<p>Kuch seconds mein log mein <code>%BGP-5-ADJCHANGE: neighbor 100.64.10.1 Up</code> dikhta hai. Yeh log line isliye aati hai kyunki <code>bgp log-neighbor-changes</code> default mein on hai. ISP ki configuration aapki mirror hai: <code>router bgp 64500</code> aur <code>neighbor 100.64.10.2 remote-as 65010</code>. Dono sides ko ek doosre ka <b>woh interface address jo session sach mein use karta hai</b> aur ek doosre ka sahi ASN likhna hoga.</p>

<h3>Step 2: network ... mask se LAN advertise karo</h3>
<p>OSPF mein <code>network</code> interfaces par protocol enable karta hai. BGP mein iska matlab bilkul alag hai: <b>"agar yeh exact prefix is exact mask ke saath meri routing table mein hai, to use BGP table mein daalo aur advertise karo"</b>. Yeh kisi interface par kuch enable nahi karta.</p>
<pre class="code">CUST-EDGE(config-router)# network 192.168.50.0 mask 255.255.255.0
<span class="c">! show ip route se exact match chahiye: g0/1 par connected 192.168.50.0/24</span></pre>
<ul>
<li>Prefix <b>aur</b> mask dono <code>show ip route</code> ke kisi route se exactly match hone chahiye (connected, static ya IGP). Agar sirf 192.168.50.0/24 hai to <code>network 192.168.0.0 mask 255.255.0.0</code> kuch advertise nahi karega.</li>
<li><code>mask</code> ke bina IOS classful mask (/8, /16 ya /24) maanta hai. Kyunki 192.168.50.0/24 ek classful Class C network hai, <code>show running-config</code> line ko sirf <code>network 192.168.50.0</code> dikha sakta hai, aur <code>show ip bgp</code> prefix ko bina "/24" dikhata hai.</li>
<li>Agar route baad mein RIB se gayab ho jaaye (interface down ho), to BGP prefix automatically withdraw kar deta hai.</li>
</ul>

<h3>Address families</h3>
<p>Modern BGP (multiprotocol BGP) kai tarah ke routes le jaata hai, har ek ek <b>address family</b> mein: IPv4 unicast, IPv6 unicast, VPNv4 aur aur bhi. IOS par neighbors IPv4 unicast ke liye automatically activate hote hain, isliye upar ki simple configuration chal jaati hai. IOS XE phir running configuration mein ise aise dikhata hai:</p>
<pre class="out">router bgp 65010
 bgp router-id 10.10.10.10
 bgp log-neighbor-changes
 neighbor 100.64.10.1 remote-as 64500
 neighbor 100.64.10.1 description Skyline-Net
 !
<span class="hl"> address-family ipv4</span>
  network 192.168.50.0
<span class="hl">  neighbor 100.64.10.1 activate</span>
 exit-address-family</pre>
<p>Kai operators <code>no bgp default ipv4-unicast</code> se automatic behaviour band kar dete hain aur <code>address-family ipv4</code> ke andar har neighbor ko explicitly activate karte hain. Agar aap aisa karo aur <code>activate</code> bhool jao, to session up ho jaata hai par <b>koi IPv4 prefix</b> exchange nahi hota.</p>

<h3>Doosra raasta: redistribution</h3>
<p><code>redistribute connected</code>, <code>redistribute static</code> ya <code>redistribute ospf 1</code> kisi doosre source ke routes BGP mein daalta hai. Aise routes ko origin code <b>i</b> ki jagah <b>?</b> (incomplete) milta hai, aur route-map ke bina aap iraade se kahin zyada leak kar sakte ho. Internet edge ke liye explicit <code>network</code> statements zyada safe aur saaf choice hain. Dhyan do ki OSPF ko BGP mein redistribute karne par default mein sirf OSPF internal routes aate hain; external ke liye <code>match internal external</code> chahiye.</p>

<h3>Step 3: verify karo</h3>
<pre class="out">CUST-EDGE# show ip bgp summary
BGP router identifier 10.10.10.10, local AS number 65010
BGP table version is 4, main routing table version 4
3 network entries using 744 bytes of memory
3 path entries using 408 bytes of memory

Neighbor        V           AS MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd
<span class="hl">100.64.10.1     4        64500       9       8        4    0    0 00:05:12        2</span>

CUST-EDGE# show ip route bgp
<span class="hl">B     198.51.100.0/24 [20/0] via 100.64.10.1, 00:05:12</span>
<span class="hl">B     203.0.113.0/24 [20/0] via 100.64.10.1, 00:05:12</span></pre>
<p>State/PfxRcd mein number <b>2</b> ka matlab Established aur do prefixes received. <code>[20/0]</code> matlab AD 20 (eBGP) aur metric 0 (MED). ISP router par <code>show ip bgp</code> ab 192.168.50.0 ko next hop 100.64.10.2 aur path <code>65010 i</code> ke saath dikhata hai, jo bilkul lab task 2 check karta hai. Aakhir mein PC1 203.0.113.1 ko ping kar sakta hai, kyunki forward path CUST-EDGE par BGP route use karta hai aur return path ISP ka 192.168.50.0/24 wala BGP route.</p>

<div class="eg"><p><b>Worked example.</b> Ek colleague <code>network 192.168.50.0 mask 255.255.254.0</code> type karta hai. RIB mein sirf 192.168.50.0/24 hai, isliye kuch advertise nahi hota, aur ISP ki table mein 192.168.50.0 nahi hai. PC ab bhi pings bahar bhej sakta hai (CUST-EDGE ke paas ISP routes hain) par replies kabhi wapas nahi aate, kyunki ISP ke paas wapas ka route nahi hai. Mask ko 255.255.255.0 karne se prefix kuch seconds mein dikh jaata hai.</p></div>

<div class="warn"><p><b>Common galti.</b> <code>network</code> ko OSPF jaisa maan kar wildcard mask ya interface address type karna. BGP ke <code>network</code> ko network address aur RIB entry se exactly match karta <b>subnet</b> mask chahiye.</p></div>

<div class="exam"><p><b>Exam trap.</b> Locally originated routes <code>show ip bgp</code> mein next hop <code>0.0.0.0</code> aur weight <b>32768</b> dikhate hain. Peers se seekhe routes ka default weight 0 hota hai. Jis network statement ka RIB mein matching route na ho, woh koi error message nahi deta: prefix bas kabhi dikhta hi nahi.</p></div>

<div class="scn"><h4>Cut-over ke baad one-way internet</h4><p>Ek company ne weekend par apna office LAN 192.168.50.0/24 se 192.168.52.0/23 par shift kiya. Monday ko internet par kuch nahi chala, jabki edge par <code>show ip route bgp</code> ab bhi saare ISP prefixes dikha raha tha. <code>show ip bgp</code> mein koi locally originated route tha hi nahi: <code>network</code> statement ab bhi 192.168.50.0/24 keh raha tha, jo RIB mein ab exist nahi karta tha. Use <code>network 192.168.52.0 mask 255.255.254.0</code> karne se service wapas aayi.</p><p><b>Seekh:</b> har addressing change mein BGP network statements shaamil hone chahiye; RIB-match rule strict aur silent hai.</p></div>

<div class="iv"><p class="q">"OSPF aur BGP ke network command mein kya fark hai?"</p><p>Strong answer: OSPF mein yeh interfaces match karta hai aur un par OSPF enable karta hai. BGP mein yeh interfaces ko chhoota nahi; yeh BGP ko prefix originate karne ko kehta hai, aur sirf tab jab woh exact prefix aur mask routing table mein ho. <code>mask</code> ke bina classful default, local routes ke liye weight 32768 aur next hop 0.0.0.0, aur alternative ke roop mein <code>redistribute</code> jo origin <code>?</code> deta hai, yeh sab batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Minimum eBGP config: <code>router bgp ASN</code>, <code>bgp router-id</code>, <code>neighbor IP remote-as ASN</code>.</li>
<li>BGP <code>network</code> prefix tabhi originate karta hai jab exact prefix aur mask RIB mein ho.</li>
<li>IOS par IPv4 unicast default mein activate hota hai; <code>no bgp default ipv4-unicast</code> ke saath har neighbor ko <code>activate</code> karna padta hai.</li>
<li>Redistributed routes ka origin <code>?</code> hai; network-statement routes ka origin <code>i</code>.</li>
<li><code>show ip bgp summary</code>, <code>show ip bgp</code> aur <code>show ip route bgp</code> se verify karo, phir end to end test karo.</li>
</ul></div>
`}};export{e as default};