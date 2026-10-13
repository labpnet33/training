var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You can now address Junos interfaces for IPv6, explain neighbour discovery, run and read OSPFv3, explain IS-IS for IPv6, describe BGP address families and 6PE, and troubleshoot a dual-stack core. Use this chapter as your revision sheet.</p>
<h3>Can-do checklist</h3>
<ul><li>Configure family inet6 on interfaces and loopbacks and read show interfaces terse.</li><li>Explain link-local addresses, NS, NA, RS, RA and DAD, and read show ipv6 neighbors.</li><li>Configure OSPFv3 and read show ospf3 neighbor, interface and database.</li><li>Explain Intra-Area-Prefix, Link, Inter-Area-Prefix and AS-External LSAs.</li><li>Explain how IS-IS carries IPv6 and the difference between single and multi topology.</li><li>Configure BGP inet6 unicast and explain 6PE.</li><li>Troubleshoot in order: interface, neighbour, IGP, routes, BGP, end to end.</li></ul>
<h3>Mini glossary</h3>
<table class="cmp"><tr><th>Term</th><th>Meaning</th></tr><tr><td>NDP</td><td>Neighbor Discovery, IPv6 replacement for ARP</td></tr><tr><td>DAD</td><td>Duplicate Address Detection</td></tr><tr><td>OSPFv3</td><td>OSPF for IPv6, protocols ospf3</td></tr><tr><td>MP-BGP</td><td>BGP with multiple address families</td></tr><tr><td>6PE</td><td>IPv6 over an IPv4 MPLS core using labeled-unicast</td></tr></table>
<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Value</th></tr><tr><td>NDP ICMPv6 types</td><td>133 to 137</td></tr><tr><td>OSPFv3 multicast</td><td>ff02::5 and ff02::6</td></tr><tr><td>OSPF preference</td><td>Internal 10, external 150</td></tr><tr><td>IS-IS IPv6</td><td>NLPID 0x8E, TLV 232 and 236</td></tr><tr><td>IPv6 table</td><td>inet6.0</td></tr><tr><td>IPv6 router fragmentation</td><td>Not in transit</td></tr></table>
<h3>Command cheat sheet</h3>
<pre class="code">show interfaces terse
show ipv6 neighbors
show ospf3 neighbor
show ospf3 interface
show ospf3 database
show route table inet6.0
show route 2001:db8:77::/64
ping 2001:db8:ffff::2 count 3
<span class="c">! Reference commands on a real router</span>
show isis adjacency
show bgp summary
show bgp neighbor</pre>
<p>For hands-on practice use np-ipv6 and jncip-ospf for IPv6 and OSPFv3, jncis-isis and jncissp-isis for IS-IS, jncis-bgp for BGP, and spcor-mpls-ldp for MPLS.</p>
<div class="warn"><p><b>Common mistake.</b> Revising IPv6 only by memorising address formats. The exam asks how protocols behave on Junos, so practise reading outputs.</p></div>
<div class="exam"><p><b>Exam trap.</b> Check the exact words: "separate protocol" for OSPFv3, "same process" for IS-IS, "address family" for BGP. These three phrases decide many questions.</p></div>
<div class="scn"><h4>Exam day tie-break</h4><p>A candidate was unsure whether IS-IS needs a second process for IPv6. Recalling the diagram of one process carrying TLV 236 settled it: same process, new TLV.</p><p><b>Lesson:</b> Remember the three-phrase rule.</p></div>
<div class="iv"><p class="q">"Give me a two-minute summary of IPv6 in a provider core."</p><p>Dual stack with family inet6 on every interface, link-local next hops, an IGP (OSPFv3 or IS-IS) for loopbacks, and MP-BGP inet6 unicast between PEs. For an IPv4 MPLS core use 6PE. Watch MTU, keep ICMPv6 working and monitor both families separately.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Know the three IGP phrases: separate protocol, same process, address family.</li><li>Read show ospf3 and show ipv6 neighbors confidently.</li><li>Troubleshoot in layers.</li><li>Use the related modules for hands-on practice.</li></ul></div>
`,hi:`
<p>Ab aap Junos interfaces ko IPv6 ke liye address kar sakte ho, neighbour discovery samjha sakte ho, OSPFv3 chala aur padh sakte ho, IPv6 ke liye IS-IS samjha sakte ho, BGP address families aur 6PE describe kar sakte ho, aur dual-stack core troubleshoot kar sakte ho. Is chapter ko revision sheet ki tarah use karo.</p>
<h3>Can-do checklist</h3>
<ul><li>Interfaces aur loopbacks par family inet6 configure karo aur show interfaces terse padho.</li><li>Link-local addresses, NS, NA, RS, RA aur DAD samjhao, aur show ipv6 neighbors padho.</li><li>OSPFv3 configure karo aur show ospf3 neighbor, interface aur database padho.</li><li>Intra-Area-Prefix, Link, Inter-Area-Prefix aur AS-External LSAs samjhao.</li><li>Samjhao ki IS-IS IPv6 kaise carry karta hai aur single aur multi topology mein kya fark hai.</li><li>BGP inet6 unicast configure karo aur 6PE samjhao.</li><li>Order mein troubleshoot karo: interface, neighbour, IGP, routes, BGP, end to end.</li></ul>
<h3>Mini glossary</h3>
<table class="cmp"><tr><th>Term</th><th>Meaning</th></tr><tr><td>NDP</td><td>Neighbor Discovery, ARP ka IPv6 replacement</td></tr><tr><td>DAD</td><td>Duplicate Address Detection</td></tr><tr><td>OSPFv3</td><td>IPv6 ke liye OSPF, protocols ospf3</td></tr><tr><td>MP-BGP</td><td>Multiple address families wala BGP</td></tr><tr><td>6PE</td><td>IPv4 MPLS core par labeled-unicast se IPv6</td></tr></table>
<h3>Sabse zyada tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Value</th></tr><tr><td>NDP ICMPv6 types</td><td>133 to 137</td></tr><tr><td>OSPFv3 multicast</td><td>ff02::5 and ff02::6</td></tr><tr><td>OSPF preference</td><td>Internal 10, external 150</td></tr><tr><td>IS-IS IPv6</td><td>NLPID 0x8E, TLV 232 and 236</td></tr><tr><td>IPv6 table</td><td>inet6.0</td></tr><tr><td>IPv6 router fragmentation</td><td>Transit mein nahi</td></tr></table>
<h3>Command cheat sheet</h3>
<pre class="code">show interfaces terse
show ipv6 neighbors
show ospf3 neighbor
show ospf3 interface
show ospf3 database
show route table inet6.0
show route 2001:db8:77::/64
ping 2001:db8:ffff::2 count 3
<span class="c">! Reference commands on a real router</span>
show isis adjacency
show bgp summary
show bgp neighbor</pre>
<p>Hands-on practice ke liye IPv6 aur OSPFv3 ke liye np-ipv6 aur jncip-ospf, IS-IS ke liye jncis-isis aur jncissp-isis, BGP ke liye jncis-bgp, aur MPLS ke liye spcor-mpls-ldp use karo.</p>
<div class="warn"><p><b>Common mistake.</b> IPv6 ko sirf address formats ratkar revise karna. Exam poochta hai ki Junos par protocols kaise behave karte hain, isliye outputs padhne ki practice karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Exact words dekho: OSPFv3 ke liye "separate protocol", IS-IS ke liye "same process", BGP ke liye "address family". Yeh teen phrases kai sawal tay karte hain.</p></div>
<div class="scn"><h4>Exam din tie-break</h4><p>Ek candidate ko pakka nahi tha ki IS-IS ko IPv6 ke liye doosra process chahiye ya nahi. Ek process ke TLV 236 carry karne wale diagram ko yaad karne se faisla ho gaya: same process, naya TLV.</p><p><b>Lesson:</b> Teen-phrase rule yaad rakho.</p></div>
<div class="iv"><p class="q">"Mujhe provider core mein IPv6 ka do minute ka summary do."</p><p>Har interface par family inet6 ke saath dual stack, link-local next hops, loopbacks ke liye IGP (OSPFv3 ya IS-IS), aur PEs ke beech MP-BGP inet6 unicast. IPv4 MPLS core ke liye 6PE use karo. MTU dekho, ICMPv6 chalta rakho aur dono families ko alag monitor karo.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Teen IGP phrases jaano: separate protocol, same process, address family.</li><li>show ospf3 aur show ipv6 neighbors confidently padho.</li><li>Layers mein troubleshoot karo.</li><li>Hands-on practice ke liye related modules use karo.</li></ul></div>
`}};export{e as default};