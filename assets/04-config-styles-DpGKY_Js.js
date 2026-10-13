var e={id:`config-styles`,h:{en:`Traditional vs address-family configuration, and the router ID`,hi:`Traditional vs address-family configuration, aur router ID`},body:{en:`
<p>Think of an old paper tax form and the new online version. Both collect the same information and the tax office treats them the same way. The online form, though, has <b>tabs</b>: one for salary, one for property, one for investments, each with its own fields. OSPFv3 has two configuration styles in the same way. The traditional style (<code>ipv6 router ospf</code>) is the paper form, and the address-family style (<code>router ospfv3</code>) is the tabbed form, with one tab for IPv6 and one for IPv4. On the wire, the packets are identical.</p>

<h3>Style 1: traditional (used in the lab)</h3>
<p>You met this style in CCNA. There is no <code>network</code> command; you enable OSPFv3 on each interface:</p>
<pre class="code"><span class="c">! prerequisite: without it IOS answers "% IPv6 routing not enabled"</span>
ipv6 unicast-routing
<span class="c">! process-level settings</span>
ipv6 router ospf 1
 router-id 1.1.1.1
<span class="c">! enable per interface, with the area</span>
interface GigabitEthernet0/0
 ipv6 address 2001:DB8:ACAD:F12::1/64
 ipv6 ospf 1 area 0
interface GigabitEthernet0/2
 ipv6 address 2001:DB8:ACAD:100::1/64
 ipv6 ospf 1 area 0</pre>
<p>Interface tuning uses the <code>ipv6 ospf</code> prefix: <code>ipv6 ospf network point-to-point</code>, <code>ipv6 ospf cost 20</code>, <code>ipv6 ospf priority 0</code>, <code>ipv6 ospf mtu-ignore</code>. The instance ID is set on the enabling line: <code>ipv6 ospf 1 area 0 instance 1</code>. Verification uses <code>show ipv6 ospf ...</code>.</p>

<h3>Style 2: address families (router ospfv3)</h3>
<p>RFC 5838 extended OSPFv3 so one protocol can carry both IPv6 and IPv4 prefixes, each as a separate <b>address family</b> (AF) with its own instance, neighbours, database and routes. Cisco's configuration mirrors that:</p>
<pre class="code">ipv6 unicast-routing
router ospfv3 1
 router-id 1.1.1.1
 <span class="c">! the IPv6 tab</span>
 address-family ipv6 unicast
  passive-interface GigabitEthernet0/2
 exit-address-family
 <span class="c">! the IPv4 tab: IPv4 routes carried by OSPFv3</span>
 address-family ipv4 unicast
 exit-address-family
interface GigabitEthernet0/0
 ip address 10.1.12.1 255.255.255.0
 ipv6 address 2001:DB8:ACAD:F12::1/64
 ospfv3 1 ipv6 area 0
 ospfv3 1 ipv4 area 0
 ospfv3 network point-to-point</pre>
<p>Where each setting lives matters on the exam:</p>
<table class="cmp"><tr><th>Level</th><th>Examples</th></tr>
<tr><td>Process (<code>router ospfv3 1</code>)</td><td><code>router-id</code>, shared by both AFs</td></tr>
<tr><td>Address family</td><td><code>passive-interface</code>, <code>area range</code>, <code>area X stub</code>, <code>summary-prefix</code>, <code>default-information originate</code>, <code>redistribute</code>, <code>maximum-paths</code></td></tr>
<tr><td>Interface</td><td><code>ospfv3 1 ipv6 area 0</code>, <code>ospfv3 network</code>, <code>ospfv3 cost</code>, <code>ospfv3 priority</code>, <code>ospfv3 mtu-ignore</code>, <code>ospfv3 authentication</code></td></tr>
</table>

<h3>IPv4 over OSPFv3: the three requirements</h3>
<ul>
<li>The interface must have an <b>IPv4 address</b> (the prefixes to advertise).</li>
<li>The interface must be <b>IPv6-enabled</b> (any IPv6 address or <code>ipv6 enable</code>), because OSPFv3 packets are always IPv6 packets from the link-local address, even for the IPv4 AF.</li>
<li><code>ipv6 unicast-routing</code> must be on, and both neighbours must run the IPv4 AF on that link. The IPv4 AF uses instance ID 64 by default, so a neighbour running only the IPv6 AF (instance 0) will never answer.</li>
</ul>
<pre class="out">R2# show ospfv3 neighbor

          <span class="hl">OSPFv3 1 address-family ipv4 (router-id 2.2.2.2)</span>

Neighbor ID     Pri   State           Dead Time   Interface ID    Interface
1.1.1.1           0   FULL/  -        00:00:36    3               GigabitEthernet0/0

          <span class="hl">OSPFv3 1 address-family ipv6 (router-id 2.2.2.2)</span>

Neighbor ID     Pri   State           Dead Time   Interface ID    Interface
1.1.1.1           0   FULL/  -        00:00:33    3               GigabitEthernet0/0</pre>
<p>One neighbour appears <b>twice</b>, once per AF. If a section is missing, that AF is not running on one side.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Address families">
<rect x="220" y="20" width="200" height="46" rx="8" fill="#fde68a"/><text x="320" y="48" text-anchor="middle" class="svg-ink" font-size="14">router ospfv3 1</text>
<rect x="60" y="110" width="220" height="60" rx="8" fill="#bae6fd"/><text x="170" y="134" text-anchor="middle" class="svg-ink" font-size="13">AF ipv6 unicast</text><text x="170" y="154" text-anchor="middle" class="svg-muted" font-size="12">instance 0-31, IPv6 RIB</text>
<rect x="360" y="110" width="220" height="60" rx="8" fill="#bbf7d0"/><text x="470" y="134" text-anchor="middle" class="svg-ink" font-size="13">AF ipv4 unicast</text><text x="470" y="154" text-anchor="middle" class="svg-muted" font-size="12">instance 64-95, IPv4 RIB</text>
<line x1="280" y1="66" x2="170" y2="110" stroke="#64748b" stroke-width="2"/><line x1="360" y1="66" x2="470" y2="110" stroke="#64748b" stroke-width="2"/>
<text x="320" y="205" text-anchor="middle" class="svg-accent" font-size="12">Both AFs: packets sourced from FE80:: link-local</text>
</svg><p class="cap">One OSPFv3 process, two address families, each with its own instance ID, neighbours and database.</p></div>

<h3>The router ID: rules and failure</h3>
<p>OSPFv3 still needs a 32-bit router ID. IOS chooses it in this order:</p>
<ol>
<li>The <code>router-id</code> command.</li>
<li>The highest IPv4 address on an up loopback.</li>
<li>The highest IPv4 address on any other up interface.</li>
</ol>
<p>On an <b>IPv6-only router</b> steps 2 and 3 find nothing, so the process cannot start:</p>
<pre class="out"><span class="hl">%OSPFv3-4-NORTRID: OSPFv3 process 1 could not pick a router-id,</span>
please configure manually
R3# show ipv6 protocols | section ospf
IPv6 Routing Protocol is "ospf 1"
  <span class="hl">Router ID 0.0.0.0</span></pre>
<p>Best practice is to <b>always configure the router ID by hand</b>, unique across the domain. Changing it later needs <code>clear ipv6 ospf process</code> (traditional) or <code>clear ospfv3 process</code> (AF), which resets every adjacency, so plan a window. A duplicate router ID causes adjacency failures between the duplicates and LSAs that keep overwriting each other, visible as sequence numbers climbing fast in the database.</p>

<div class="eg"><p><b>Worked example.</b> R3 has only IPv6 addresses and IPv4 addresses on nothing. You configure <code>ipv6 router ospf 1</code> and <code>ipv6 ospf 1 area 1</code> on Gi0/0, but forget the router ID. Result: NORTRID, Router ID 0.0.0.0, no Hellos sent, R2 sees no neighbour on Gi0/1. Adding <code>router-id 3.3.3.3</code> under the process starts it immediately; no clear is needed because it never had an ID.</p></div>

<div class="warn"><p><b>Common mistake.</b> Configuring <code>ospfv3 1 ipv4 area 0</code> on an interface that has an IPv4 address but no IPv6 at all. The IPv4 AF has nothing to send its packets from. Add <code>ipv6 enable</code>.</p></div>

<div class="exam"><p><b>Exam trap.</b> In AF mode, <code>passive-interface</code> and <code>area range</code> go under the <b>address family</b>, not directly under <code>router ospfv3</code>. And <code>router-id</code> is a process-level command shared by both AFs.</p></div>

<div class="scn"><h4>IPv4 AF that never came up</h4><p>A branch team migrated from OSPFv2 to OSPFv3 with both address families to run one protocol. The IPv6 AF came up on the WAN link, but the IPv4 AF did not, and IPv4 routes vanished. <code>show ospfv3 neighbor</code> on the hub showed only the ipv6 section for that link. On the branch router the WAN interface had <code>ospfv3 1 ipv4 area 0</code>, but the hub's interface had only the ipv6 line. The IPv4 AF Hellos, with instance 64, were ignored. Adding <code>ospfv3 1 ipv4 area 0</code> on the hub fixed it.</p><p><b>Lesson:</b> each address family is its own adjacency; both ends need the same AF enabled on the link.</p></div>

<div class="iv"><p class="q">"How does OSPFv3 carry IPv4 routes, and what does it need?"</p><p>Strong answer: with RFC 5838 address families. Under <code>router ospfv3</code> you enable <code>address-family ipv4 unicast</code> and put <code>ospfv3 1 ipv4 area X</code> on interfaces. The IPv4 AF runs as its own instance (ID 64 to 95) with its own neighbours and database, but its packets are still IPv6 packets from the link-local address, so interfaces need IPv6 enabled and <code>ipv6 unicast-routing</code> must be on.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Traditional: <code>ipv6 router ospf</code>, <code>ipv6 ospf 1 area X</code>, <code>show ipv6 ospf</code>. AF: <code>router ospfv3</code>, <code>ospfv3 1 ipv6 area X</code>, <code>show ospfv3</code>.</li>
<li>Both styles produce the same packets and interoperate.</li>
<li>IPv4 AF needs an IPv4 address, IPv6 enabled on the interface and <code>ipv6 unicast-routing</code>.</li>
<li>No IPv4 address and no <code>router-id</code> means NORTRID and a dead process.</li>
<li>Passive-interface and summarisation are AF-level commands in AF mode.</li>
</ul></div>
`,hi:`
<p>Purana paper tax form aur naya online version socho. Dono same information lete hain aur tax office dono ko same tarah treat karta hai. Lekin online form mein <b>tabs</b> hote hain: ek salary ke liye, ek property ke liye, ek investments ke liye, har ek ke apne fields. OSPFv3 ke bhi isi tarah do configuration styles hain. Traditional style (<code>ipv6 router ospf</code>) paper form hai, aur address-family style (<code>router ospfv3</code>) tabbed form hai, ek tab IPv6 ke liye aur ek IPv4 ke liye. Wire par packets bilkul same hote hain.</p>

<h3>Style 1: traditional (lab mein use hota hai)</h3>
<p>Yeh style aap CCNA mein mil chuke ho. Koi <code>network</code> command nahi hai; aap har interface par OSPFv3 enable karte ho:</p>
<pre class="code"><span class="c">! prerequisite: iske bina IOS jawab deta hai "% IPv6 routing not enabled"</span>
ipv6 unicast-routing
<span class="c">! process-level settings</span>
ipv6 router ospf 1
 router-id 1.1.1.1
<span class="c">! har interface par area ke saath enable</span>
interface GigabitEthernet0/0
 ipv6 address 2001:DB8:ACAD:F12::1/64
 ipv6 ospf 1 area 0
interface GigabitEthernet0/2
 ipv6 address 2001:DB8:ACAD:100::1/64
 ipv6 ospf 1 area 0</pre>
<p>Interface tuning <code>ipv6 ospf</code> prefix use karti hai: <code>ipv6 ospf network point-to-point</code>, <code>ipv6 ospf cost 20</code>, <code>ipv6 ospf priority 0</code>, <code>ipv6 ospf mtu-ignore</code>. Instance ID enable karne wali line par set hota hai: <code>ipv6 ospf 1 area 0 instance 1</code>. Verification <code>show ipv6 ospf ...</code> se hoti hai.</p>

<h3>Style 2: address families (router ospfv3)</h3>
<p>RFC 5838 ne OSPFv3 ko extend kiya taaki ek protocol IPv6 aur IPv4 dono prefixes le ja sake, har ek alag <b>address family</b> (AF) ki tarah apne instance, neighbours, database aur routes ke saath. Cisco ki configuration yahi dikhati hai:</p>
<pre class="code">ipv6 unicast-routing
router ospfv3 1
 router-id 1.1.1.1
 <span class="c">! IPv6 tab</span>
 address-family ipv6 unicast
  passive-interface GigabitEthernet0/2
 exit-address-family
 <span class="c">! IPv4 tab: OSPFv3 dwara le jaaye gaye IPv4 routes</span>
 address-family ipv4 unicast
 exit-address-family
interface GigabitEthernet0/0
 ip address 10.1.12.1 255.255.255.0
 ipv6 address 2001:DB8:ACAD:F12::1/64
 ospfv3 1 ipv6 area 0
 ospfv3 1 ipv4 area 0
 ospfv3 network point-to-point</pre>
<p>Exam mein matter karta hai ki har setting kahan rehti hai:</p>
<table class="cmp"><tr><th>Level</th><th>Examples</th></tr>
<tr><td>Process (<code>router ospfv3 1</code>)</td><td><code>router-id</code>, dono AFs share karte hain</td></tr>
<tr><td>Address family</td><td><code>passive-interface</code>, <code>area range</code>, <code>area X stub</code>, <code>summary-prefix</code>, <code>default-information originate</code>, <code>redistribute</code>, <code>maximum-paths</code></td></tr>
<tr><td>Interface</td><td><code>ospfv3 1 ipv6 area 0</code>, <code>ospfv3 network</code>, <code>ospfv3 cost</code>, <code>ospfv3 priority</code>, <code>ospfv3 mtu-ignore</code>, <code>ospfv3 authentication</code></td></tr>
</table>

<h3>OSPFv3 par IPv4: teen requirements</h3>
<ul>
<li>Interface par <b>IPv4 address</b> hona chahiye (advertise karne wale prefixes).</li>
<li>Interface <b>IPv6-enabled</b> hona chahiye (koi bhi IPv6 address ya <code>ipv6 enable</code>), kyunki OSPFv3 packets hamesha link-local address se IPv6 packets hote hain, IPv4 AF ke liye bhi.</li>
<li><code>ipv6 unicast-routing</code> on hona chahiye, aur dono neighbours us link par IPv4 AF chala rahe hon. IPv4 AF default mein instance ID 64 use karta hai, isliye sirf IPv6 AF (instance 0) chalane wala neighbour kabhi jawab nahi dega.</li>
</ul>
<pre class="out">R2# show ospfv3 neighbor

          <span class="hl">OSPFv3 1 address-family ipv4 (router-id 2.2.2.2)</span>

Neighbor ID     Pri   State           Dead Time   Interface ID    Interface
1.1.1.1           0   FULL/  -        00:00:36    3               GigabitEthernet0/0

          <span class="hl">OSPFv3 1 address-family ipv6 (router-id 2.2.2.2)</span>

Neighbor ID     Pri   State           Dead Time   Interface ID    Interface
1.1.1.1           0   FULL/  -        00:00:33    3               GigabitEthernet0/0</pre>
<p>Ek neighbour <b>do baar</b> dikhta hai, har AF mein ek baar. Agar koi section gayab hai, to woh AF ek side par chal nahi raha.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Address families">
<rect x="220" y="20" width="200" height="46" rx="8" fill="#fde68a"/><text x="320" y="48" text-anchor="middle" class="svg-ink" font-size="14">router ospfv3 1</text>
<rect x="60" y="110" width="220" height="60" rx="8" fill="#bae6fd"/><text x="170" y="134" text-anchor="middle" class="svg-ink" font-size="13">AF ipv6 unicast</text><text x="170" y="154" text-anchor="middle" class="svg-muted" font-size="12">instance 0-31, IPv6 RIB</text>
<rect x="360" y="110" width="220" height="60" rx="8" fill="#bbf7d0"/><text x="470" y="134" text-anchor="middle" class="svg-ink" font-size="13">AF ipv4 unicast</text><text x="470" y="154" text-anchor="middle" class="svg-muted" font-size="12">instance 64-95, IPv4 RIB</text>
<line x1="280" y1="66" x2="170" y2="110" stroke="#64748b" stroke-width="2"/><line x1="360" y1="66" x2="470" y2="110" stroke="#64748b" stroke-width="2"/>
<text x="320" y="205" text-anchor="middle" class="svg-accent" font-size="12">Dono AFs: packets FE80:: link-local se source</text>
</svg><p class="cap">Ek OSPFv3 process, do address families, har ek ka apna instance ID, neighbours aur database.</p></div>

<h3>Router ID: rules aur failure</h3>
<p>OSPFv3 ko abhi bhi 32-bit router ID chahiye. IOS ise is order mein chunta hai:</p>
<ol>
<li><code>router-id</code> command.</li>
<li>Up loopback par highest IPv4 address.</li>
<li>Kisi bhi doosre up interface par highest IPv4 address.</li>
</ol>
<p><b>IPv6-only router</b> par steps 2 aur 3 ko kuch nahi milta, isliye process start nahi ho sakta:</p>
<pre class="out"><span class="hl">%OSPFv3-4-NORTRID: OSPFv3 process 1 could not pick a router-id,</span>
please configure manually
R3# show ipv6 protocols | section ospf
IPv6 Routing Protocol is "ospf 1"
  <span class="hl">Router ID 0.0.0.0</span></pre>
<p>Best practice hai <b>router ID hamesha haath se configure karo</b>, poore domain mein unique. Baad mein badalne ke liye <code>clear ipv6 ospf process</code> (traditional) ya <code>clear ospfv3 process</code> (AF) chahiye, jo har adjacency reset karta hai, isliye window plan karo. Duplicate router ID se duplicates ke beech adjacency failures aur LSAs jo ek doosre ko overwrite karte rehte hain, database mein tezi se badhte sequence numbers ki tarah dikhte hain.</p>

<div class="eg"><p><b>Worked example.</b> R3 par sirf IPv6 addresses hain aur kahin IPv4 address nahi. Aap <code>ipv6 router ospf 1</code> aur Gi0/0 par <code>ipv6 ospf 1 area 1</code> configure karte ho, lekin router ID bhool jaate ho. Result: NORTRID, Router ID 0.0.0.0, koi Hello nahi bheja jaata, R2 ko Gi0/1 par koi neighbour nahi dikhta. Process ke andar <code>router-id 3.3.3.3</code> jodne se yeh turant start hota hai; clear ki zaroorat nahi kyunki iske paas kabhi ID tha hi nahi.</p></div>

<div class="warn"><p><b>Common galti.</b> Aise interface par <code>ospfv3 1 ipv4 area 0</code> configure karna jisme IPv4 address hai lekin IPv6 bilkul nahi. IPv4 AF ke paas packets bhejne ke liye koi source nahi hai. <code>ipv6 enable</code> jodo.</p></div>

<div class="exam"><p><b>Exam trap.</b> AF mode mein <code>passive-interface</code> aur <code>area range</code> <b>address family</b> ke neeche jaate hain, seedhe <code>router ospfv3</code> ke neeche nahi. Aur <code>router-id</code> process-level command hai jo dono AFs share karte hain.</p></div>

<div class="scn"><h4>IPv4 AF jo kabhi up nahi hua</h4><p>Ek branch team ne ek hi protocol chalane ke liye OSPFv2 se dono address families wale OSPFv3 par migrate kiya. WAN link par IPv6 AF up ho gaya, lekin IPv4 AF nahi, aur IPv4 routes gayab ho gaye. Hub par <code>show ospfv3 neighbor</code> us link ke liye sirf ipv6 section dikha raha tha. Branch router ke WAN interface par <code>ospfv3 1 ipv4 area 0</code> tha, lekin hub ke interface par sirf ipv6 line thi. Instance 64 wale IPv4 AF Hellos ignore ho rahe the. Hub par <code>ospfv3 1 ipv4 area 0</code> jodne se fix hua.</p><p><b>Seekh:</b> har address family apni alag adjacency hai; link par dono ends par same AF enabled hona chahiye.</p></div>

<div class="iv"><p class="q">"OSPFv3 IPv4 routes kaise le jaata hai, aur use kya chahiye?"</p><p>Strong answer: RFC 5838 address families ke saath. <code>router ospfv3</code> ke neeche aap <code>address-family ipv4 unicast</code> enable karte ho aur interfaces par <code>ospfv3 1 ipv4 area X</code> lagate ho. IPv4 AF apne instance (ID 64 se 95) ki tarah chalta hai apne neighbours aur database ke saath, lekin uske packets abhi bhi link-local address se IPv6 packets hote hain, isliye interfaces par IPv6 enabled hona chahiye aur <code>ipv6 unicast-routing</code> on hona chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Traditional: <code>ipv6 router ospf</code>, <code>ipv6 ospf 1 area X</code>, <code>show ipv6 ospf</code>. AF: <code>router ospfv3</code>, <code>ospfv3 1 ipv6 area X</code>, <code>show ospfv3</code>.</li>
<li>Dono styles same packets banate hain aur interoperate karte hain.</li>
<li>IPv4 AF ko IPv4 address, interface par IPv6 enabled aur <code>ipv6 unicast-routing</code> chahiye.</li>
<li>Na IPv4 address na <code>router-id</code> matlab NORTRID aur dead process.</li>
<li>AF mode mein passive-interface aur summarisation AF-level commands hain.</li>
</ul></div>
`}};export{e as default};