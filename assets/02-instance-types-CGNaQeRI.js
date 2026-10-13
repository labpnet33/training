var e={id:`instance-types`,h:{en:`Instance types and their routing tables`,hi:`Instance types aur unke routing tables`},body:{en:`
<p>A <b>routing instance</b> is a collection of interfaces, routing tables and protocol settings that behave like an independent router inside the real one. Every Junos router has at least one instance, the <b>master</b> (also called the default instance), which owns <code>inet.0</code>. You create more with <code>set routing-instances NAME instance-type TYPE</code>.</p>

<h3>The three types you must know</h3>
<table class="cmp"><tr><th>Type</th><th>Runs protocols</th><th>Typical use</th><th>Needs RD/targets</th></tr>
<tr><td><code>virtual-router</code></td><td>Yes (OSPF, static, BGP)</td><td>Separate routing domain on one box, such as guests</td><td>No</td></tr>
<tr><td><code>forwarding</code></td><td>No (static routes only)</td><td>Filter-based forwarding target</td><td>No</td></tr>
<tr><td><code>vrf</code></td><td>Yes</td><td>MPLS Layer 3 VPN</td><td>Yes</td></tr></table>
<p>For JN0-351 the first two matter most. A VRF is shown mainly so you can tell it apart: it adds a route distinguisher and route targets for MPLS VPNs.</p>

<h3>Table naming</h3>
<p>The master instance owns <code>inet.0</code> (unicast IPv4), <code>inet6.0</code>, <code>mpls.0</code> and others. A named instance prefixes its tables with its name: <b>GUEST.inet.0</b>, <b>ISP-B.inet.0</b>. The prefix is the quickest way to know which table a command refers to.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Interfaces belong to one instance">
<rect x="20" y="30" width="270" height="140" rx="10" fill="#bae6fd"/><text x="155" y="55" text-anchor="middle" class="svg-ink" font-size="14">master: inet.0</text>
<rect x="45" y="75" width="95" height="32" rx="6" fill="#fff"/><text x="92" y="96" text-anchor="middle" class="svg-ink" font-size="12">ge-0/0/0.0</text>
<rect x="165" y="75" width="95" height="32" rx="6" fill="#fff"/><text x="212" y="96" text-anchor="middle" class="svg-ink" font-size="12">ge-0/0/1.0</text>
<text x="155" y="140" text-anchor="middle" class="svg-muted" font-size="11">OSPF with CORE</text>
<rect x="350" y="30" width="270" height="140" rx="10" fill="#fde68a"/><text x="485" y="55" text-anchor="middle" class="svg-ink" font-size="14">GUEST: GUEST.inet.0</text>
<rect x="375" y="75" width="95" height="32" rx="6" fill="#fff"/><text x="422" y="96" text-anchor="middle" class="svg-ink" font-size="12">ge-0/0/2.0</text>
<rect x="495" y="75" width="95" height="32" rx="6" fill="#fff"/><text x="542" y="96" text-anchor="middle" class="svg-ink" font-size="12">ge-0/0/3.0</text>
<text x="485" y="140" text-anchor="middle" class="svg-muted" font-size="11">OSPF with GW</text>
</svg><p class="cap">An interface unit belongs to exactly one instance. Routes in one table do not appear in the other.</p></div>

<h3>Creating a virtual router</h3>
<pre class="code">set routing-instances GUEST instance-type virtual-router
set routing-instances GUEST interface ge-0/0/2.0
set routing-instances GUEST interface ge-0/0/3.0
set routing-instances GUEST routing-options router-id 192.168.50.1
set routing-instances GUEST protocols ospf area 0 interface ge-0/0/3.0</pre>
<p>The interface units are <i>moved</i> into the instance. Their connected (Direct and Local) routes now appear in <code>GUEST.inet.0</code> and no longer in <code>inet.0</code>. Protocols are configured under the instance, not under the global <code>protocols</code> hierarchy. The router ID can be set separately per instance.</p>

<h3>Listing instances</h3>
<pre class="out">lab@R1&gt; show route instance
Instance             Type
         Primary RIB                                     Active/holddown/hidden
master               forwarding
         inet.0                                          8/0/0
GUEST                virtual-router
         GUEST.inet.0                                    5/0/0</pre>
<p>Notice that the master instance is listed with the type <code>forwarding</code>, which is a naming quirk of the display and not a type you configure for it. The numbers show active, holddown and hidden route counts per table.</p>

<h3>Rules to remember</h3>
<ul>
<li>One interface unit belongs to one instance only.</li>
<li>Routes in different instances do not mix unless you share them with a RIB group, an export policy or next-table.</li>
<li>Instance names are case sensitive; keep them short and in capitals.</li>
<li>Operational commands that need a non-master table must name it, for example <code>show route table GUEST.inet.0</code>.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> A router has ge-0/0/2.0 with 192.168.50.1/24 for guests. Before the instance, <code>show route 192.168.50.0/24</code> returns it from inet.0. After the interface is moved into GUEST, the same command in the master returns nothing, while <code>show route table GUEST.inet.0</code> shows it as Direct. The route did not vanish; it moved to the instance that now owns the interface.</p></div>
<div class="warn"><p><b>Common mistake.</b> Moving an interface into an instance and then leaving OSPF configured under the global protocols hierarchy. The adjacency is dropped because the interface no longer belongs to the master. Configure OSPF under <code>routing-instances NAME protocols ospf</code>.</p></div>
<div class="exam"><p><b>Exam trap.</b> The question describes a router with an instance that needs to run OSPF, and offers <code>forwarding</code> as an option. A forwarding instance cannot run routing protocols; use virtual-router.</p></div>
<div class="scn"><h4>The vanished subnet</h4><p>A junior engineer moved a LAN port into a new instance and reported that the subnet disappeared from the routing table. In fact it was in the instance table the whole time. The senior engineer ran <code>show route instance</code>, saw the table name, and queried it directly.</p><p><b>Lesson:</b> start every investigation by asking which table owns the interface.</p></div>
<div class="iv"><p class="q">"What is the difference between virtual-router and forwarding instances?"</p><p>A virtual router is a full routing domain: it has its own tables and can run OSPF, BGP or static routes. A forwarding instance only holds forwarding entries, typically static routes, and is used as the destination of a filter-based forwarding action. It cannot run dynamic protocols.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Master instance owns inet.0; others use NAME.inet.0.</li>
<li>virtual-router runs protocols; forwarding is for FBF; vrf is for MPLS VPN.</li>
<li>Interfaces are moved into one instance; their connected routes follow.</li>
<li>Check <code>show route instance</code> first.</li>
</ul></div>
`,hi:`
<p><b>Routing instance</b> interfaces, routing tables aur protocol settings ka collection hai jo asli router ke andar ek swatantra router ki tarah behave karta hai. Har Junos router mein kam se kam ek instance hota hai, <b>master</b> (default instance bhi kehte hain), jiske paas <code>inet.0</code> hai. Aur instances <code>set routing-instances NAME instance-type TYPE</code> se banate hain.</p>

<h3>Teen types jo jaanne hain</h3>
<table class="cmp"><tr><th>Type</th><th>Protocols chalata hai</th><th>Aam use</th><th>RD/targets chahiye</th></tr>
<tr><td><code>virtual-router</code></td><td>Haan (OSPF, static, BGP)</td><td>Ek box par alag routing domain, jaise guests</td><td>Nahi</td></tr>
<tr><td><code>forwarding</code></td><td>Nahi (sirf static routes)</td><td>Filter-based forwarding ka target</td><td>Nahi</td></tr>
<tr><td><code>vrf</code></td><td>Haan</td><td>MPLS Layer 3 VPN</td><td>Haan</td></tr></table>
<p>JN0-351 ke liye pehle do sabse zaroori hain. VRF zyadatar isliye dikhaya jaata hai ki aap use pehchan sako: yeh MPLS VPN ke liye route distinguisher aur route targets jodta hai.</p>

<h3>Table naming</h3>
<p>Master instance <code>inet.0</code> (unicast IPv4), <code>inet6.0</code>, <code>mpls.0</code> aur doosre tables rakhta hai. Named instance apne tables ke aage apna naam lagata hai: <b>GUEST.inet.0</b>, <b>ISP-B.inet.0</b>. Yeh prefix batata hai ki command kaunse table ki baat kar rahi hai.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Interface ek hi instance ka hota hai">
<rect x="20" y="30" width="270" height="140" rx="10" fill="#bae6fd"/><text x="155" y="55" text-anchor="middle" class="svg-ink" font-size="14">master: inet.0</text>
<rect x="45" y="75" width="95" height="32" rx="6" fill="#fff"/><text x="92" y="96" text-anchor="middle" class="svg-ink" font-size="12">ge-0/0/0.0</text>
<rect x="165" y="75" width="95" height="32" rx="6" fill="#fff"/><text x="212" y="96" text-anchor="middle" class="svg-ink" font-size="12">ge-0/0/1.0</text>
<text x="155" y="140" text-anchor="middle" class="svg-muted" font-size="11">CORE ke saath OSPF</text>
<rect x="350" y="30" width="270" height="140" rx="10" fill="#fde68a"/><text x="485" y="55" text-anchor="middle" class="svg-ink" font-size="14">GUEST: GUEST.inet.0</text>
<rect x="375" y="75" width="95" height="32" rx="6" fill="#fff"/><text x="422" y="96" text-anchor="middle" class="svg-ink" font-size="12">ge-0/0/2.0</text>
<rect x="495" y="75" width="95" height="32" rx="6" fill="#fff"/><text x="542" y="96" text-anchor="middle" class="svg-ink" font-size="12">ge-0/0/3.0</text>
<text x="485" y="140" text-anchor="middle" class="svg-muted" font-size="11">GW ke saath OSPF</text>
</svg><p class="cap">Interface unit sirf ek instance ka hota hai. Ek table ke routes doosre mein nahi dikhte.</p></div>

<h3>Virtual router banana</h3>
<pre class="code">set routing-instances GUEST instance-type virtual-router
set routing-instances GUEST interface ge-0/0/2.0
set routing-instances GUEST interface ge-0/0/3.0
set routing-instances GUEST routing-options router-id 192.168.50.1
set routing-instances GUEST protocols ospf area 0 interface ge-0/0/3.0</pre>
<p>Interface units instance mein <i>move</i> ho jaate hain. Unke connected (Direct aur Local) routes ab <code>GUEST.inet.0</code> mein dikhte hain, <code>inet.0</code> mein nahi. Protocols instance ke andar configure hote hain, global <code>protocols</code> hierarchy mein nahi. Router ID har instance ke liye alag set ho sakta hai.</p>

<h3>Instances ki list</h3>
<pre class="out">lab@R1&gt; show route instance
Instance             Type
         Primary RIB                                     Active/holddown/hidden
master               forwarding
         inet.0                                          8/0/0
GUEST                virtual-router
         GUEST.inet.0                                    5/0/0</pre>
<p>Dhyan do ki master instance ka type <code>forwarding</code> dikhta hai, jo display ki ek naming quirk hai, aisa type jo aap master ke liye configure karte ho nahi. Numbers har table ke active, holddown aur hidden route counts batate hain.</p>

<h3>Yaad rakhne wale rules</h3>
<ul>
<li>Ek interface unit sirf ek instance ka hota hai.</li>
<li>Alag instances ke routes tab tak nahi milte jab tak aap RIB group, export policy ya next-table se share na karo.</li>
<li>Instance names case sensitive hain; chhote aur capital rakho.</li>
<li>Non-master table wale operational commands mein naam dena padta hai, jaise <code>show route table GUEST.inet.0</code>.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Router ke ge-0/0/2.0 par guests ke liye 192.168.50.1/24 hai. Instance se pehle <code>show route 192.168.50.0/24</code> use inet.0 se deta hai. Interface GUEST mein jaane ke baad master mein wahi command kuch nahi deta, jabki <code>show route table GUEST.inet.0</code> use Direct dikhata hai. Route gaya nahi; woh us instance mein chala gaya jo ab interface ka maalik hai.</p></div>
<div class="warn"><p><b>Common mistake.</b> Interface ko instance mein daalkar OSPF global protocols hierarchy mein chhod dena. Adjacency gir jaati hai kyunki interface ab master ka nahi. OSPF ko <code>routing-instances NAME protocols ospf</code> mein configure karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Sawal aise instance ka zikr karta hai jo OSPF chalaye aur option mein <code>forwarding</code> deta hai. Forwarding instance routing protocols nahi chala sakta; virtual-router use karo.</p></div>
<div class="scn"><h4>Gayab hua subnet</h4><p>Ek junior engineer ne LAN port naye instance mein daala aur bataya ki subnet routing table se gayab ho gaya. Asal mein woh instance table mein hi tha. Senior engineer ne <code>show route instance</code> chalaya, table ka naam dekha aur seedha usse query kiya.</p><p><b>Lesson:</b> har investigation yeh poochkar shuru karo ki interface ka maalik kaunsa table hai.</p></div>
<div class="iv"><p class="q">"virtual-router aur forwarding instances mein kya fark hai?"</p><p>Virtual router poora routing domain hai: apne tables hain aur OSPF, BGP ya static routes chala sakta hai. Forwarding instance sirf forwarding entries, aam taur par static routes, rakhta hai aur filter-based forwarding action ki destination ke roop mein use hota hai. Woh dynamic protocols nahi chala sakta.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Master instance inet.0 rakhta hai; baaki NAME.inet.0 use karte hain.</li>
<li>virtual-router protocols chalata hai; forwarding FBF ke liye; vrf MPLS VPN ke liye.</li>
<li>Interfaces ek instance mein move hote hain; unke connected routes saath jaate hain.</li>
<li>Pehle <code>show route instance</code> dekho.</li>
</ul></div>
`}};export{e as default};