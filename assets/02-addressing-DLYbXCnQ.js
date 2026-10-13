var e={id:`addressing`,h:{en:`IPv6 addressing on Junos interfaces`,hi:`Junos interfaces par IPv6 addressing`},body:{en:`
<p>On Junos an IPv6 address lives under <code>family inet6</code> of an interface unit, exactly like IPv4 lives under <code>family inet</code>. The part that surprises beginners is that you rarely configure the link-local address: Junos creates one for you the moment <code>family inet6</code> exists.</p>
<h3>The three addresses you will see</h3>
<table class="cmp"><tr><th>Type</th><th>Looks like</th><th>Where it comes from</th></tr><tr><td>Global unicast</td><td>2001:db8:12::1/64</td><td>You configure it (or SLAAC)</td></tr><tr><td>Link-local</td><td>fe80::.../64</td><td>Auto-generated from the interface MAC (EUI-64)</td></tr><tr><td>Loopback /128</td><td>2001:db8:ffff::1/128</td><td>You configure it on lo0</td></tr></table>
<p>Link-local addresses are valid on one link only and are never routed. They matter because neighbour discovery, router advertisements and many routing protocols use them. In particular, OSPFv3 neighbours and next hops are link-local, as you will see in the OSPFv3 chapter.</p>
<h3>Configuration</h3>
<pre class="code">configure
set interfaces ge-0/0/0 unit 0 family inet address 10.0.12.1/30
set interfaces ge-0/0/0 unit 0 family inet6 address 2001:db8:12::1/64
set interfaces lo0 unit 0 family inet address 10.0.0.1/32
set interfaces lo0 unit 0 family inet6 address 2001:db8:ffff::1/128
commit and-quit</pre>
<p>You can also ask Junos to build the host part from the interface MAC with <code>eui-64</code>: <code>set interfaces ge-0/0/0 unit 0 family inet6 address 2001:db8:12::/64 eui-64</code>. In a provider core, fixed addresses are normal because they are easier to read and document. EUI-64 is more common for customer LANs.</p>
<p>This is real simulator output for a dual-stack core interface. Notice the IPv4 address, the configured IPv6 address and the automatically created link-local address on the same unit.</p>
<pre class="out">R1&gt; show interfaces terse ge-0/0/0
Interface               Admin Link Proto    Local                 Remote
ge-0/0/0                up    up
ge-0/0/0.0              up    up   inet     10.0.12.1/30
<span class="hl">                                   inet6    2001:db8:12::1/64
                                            fe80::5054:cff:fe04:4b01/64</span>
                                   iso
                                   mpls</pre>
<p>And the IPv6 routing table of that router. The configured /64 is a <b>Direct</b> route, the router's own address is a <b>Local</b> /128 route, and the loopback shows both. Remote routes appear only after a routing protocol runs.</p>
<pre class="out">R1&gt; show route table inet6.0
inet6.0: 4 destinations, 5 routes (5 active, 0 holddown, 0 hidden)
+ = Active Route, - = Last Active, * = Both

2001:db8:12::/64   *[Direct/0] 00:01:30
                    &gt;  via ge-0/0/0.0
2001:db8:12::1/128 *[Local/0] 00:01:30
                       Local via ge-0/0/0.0
2001:db8:ffff::1/128 *[Direct/0] 00:01:30
                    &gt;  via lo0.0
                   *[Local/0] 00:01:30
                       Local via lo0.0
2001:db8:ffff::2/128 *[OSPF3/10] 00:01:30, metric 1
                    &gt;  to fe80::5054:fff:fe04:5001 via ge-0/0/0.0</pre>
<div class="eg"><p><b>Worked example.</b> In the table above the remote loopback 2001:db8:ffff::2/128 is reached via the neighbour's link-local address fe80::5054:fff:fe04:5001 on ge-0/0/0.0, not via its global address. That is normal for IPv6 IGPs.</p></div>
<div class="warn"><p><b>Common mistake.</b> Putting an IPv6 address on a unit and expecting an IPv6 ping to a neighbour to work without a matching address on the other end. Both ends of a link must share the same prefix, normally a /64 on LANs and a /127 on point-to-point provider links.</p></div>
<div class="exam"><p><b>Exam trap.</b> The link-local address is created automatically and is the next hop shown by IPv6 IGPs. The loopback is a /128. Point-to-point links often use a /127.</p></div>
<div class="scn"><h4>The ping that failed one way</h4><p>An engineer configured 2001:db8:12::1/64 on R1 and 2001:db8:13::2/64 on R2 by typo. Pings to the neighbour failed. show interfaces terse on both sides showed different prefixes. Correcting R2 to 2001:db8:12::2/64 fixed the link.</p><p><b>Lesson:</b> Always compare the prefix on both ends of a link.</p></div>
<div class="iv"><p class="q">"Why do IPv6 routers show a link-local address as the next hop?"</p><p>Link-local addresses exist automatically on every IPv6 interface and are unique on the link, so routing protocols use them for neighbour sessions and next hops. Global addresses can change without breaking adjacencies.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>IPv6 lives under family inet6 and Junos auto-creates a link-local address.</li><li>Loopbacks are /128; core links are often /127.</li><li>Direct and Local routes appear in inet6.0 as in inet.0.</li><li>IGP next hops are link-local addresses.</li></ul></div>
`,hi:`
<p>Junos par IPv6 address interface unit ke <code>family inet6</code> ke neeche rehta hai, bilkul jaise IPv4 <code>family inet</code> ke neeche. Beginners ko jo cheez hairan karti hai woh yeh hai ki link-local address aap kam hi configure karte ho: <code>family inet6</code> aate hi Junos khud ek bana deta hai.</p>
<h3>Teen addresses jo dikhenge</h3>
<table class="cmp"><tr><th>Type</th><th>Looks like</th><th>Where it comes from</th></tr><tr><td>Global unicast</td><td>2001:db8:12::1/64</td><td>Aap configure karte ho (ya SLAAC)</td></tr><tr><td>Link-local</td><td>fe80::.../64</td><td>Interface MAC se auto-generate (EUI-64)</td></tr><tr><td>Loopback /128</td><td>2001:db8:ffff::1/128</td><td>Aap lo0 par configure karte ho</td></tr></table>
<p>Link-local addresses sirf ek link par valid hain aur kabhi route nahi hote. Yeh isliye zaroori hain ki neighbour discovery, router advertisements aur bahut se routing protocols unhe use karte hain. Khaas taur par OSPFv3 neighbours aur next hops link-local hote hain, jaisa OSPFv3 chapter mein dikhega.</p>
<h3>Configuration</h3>
<pre class="code">configure
set interfaces ge-0/0/0 unit 0 family inet address 10.0.12.1/30
set interfaces ge-0/0/0 unit 0 family inet6 address 2001:db8:12::1/64
set interfaces lo0 unit 0 family inet address 10.0.0.1/32
set interfaces lo0 unit 0 family inet6 address 2001:db8:ffff::1/128
commit and-quit</pre>
<p>Aap Junos se interface MAC se host part banwa bhi sakte ho <code>eui-64</code> ke saath: <code>set interfaces ge-0/0/0 unit 0 family inet6 address 2001:db8:12::/64 eui-64</code>. Provider core mein fixed addresses normal hain kyunki padhne aur document karne mein aasan hain. EUI-64 customer LANs mein zyada common hai.</p>
<p>Yeh dual-stack core interface ka real simulator output hai. Ek hi unit par IPv4 address, configure kiya IPv6 address aur automatically bana link-local address dekho.</p>
<pre class="out">R1&gt; show interfaces terse ge-0/0/0
Interface               Admin Link Proto    Local                 Remote
ge-0/0/0                up    up
ge-0/0/0.0              up    up   inet     10.0.12.1/30
<span class="hl">                                   inet6    2001:db8:12::1/64
                                            fe80::5054:cff:fe04:4b01/64</span>
                                   iso
                                   mpls</pre>
<p>Aur us router ka IPv6 routing table. Configure kiya /64 ek <b>Direct</b> route hai, router ka apna address <b>Local</b> /128 route hai, aur loopback dono dikhata hai. Remote routes tabhi aate hain jab routing protocol chalta hai.</p>
<pre class="out">R1&gt; show route table inet6.0
inet6.0: 4 destinations, 5 routes (5 active, 0 holddown, 0 hidden)
+ = Active Route, - = Last Active, * = Both

2001:db8:12::/64   *[Direct/0] 00:01:30
                    &gt;  via ge-0/0/0.0
2001:db8:12::1/128 *[Local/0] 00:01:30
                       Local via ge-0/0/0.0
2001:db8:ffff::1/128 *[Direct/0] 00:01:30
                    &gt;  via lo0.0
                   *[Local/0] 00:01:30
                       Local via lo0.0
2001:db8:ffff::2/128 *[OSPF3/10] 00:01:30, metric 1
                    &gt;  to fe80::5054:fff:fe04:5001 via ge-0/0/0.0</pre>
<div class="eg"><p><b>Worked example.</b> Upar ki table mein remote loopback 2001:db8:ffff::2/128 neighbour ke global address se nahi balki uske link-local address fe80::5054:fff:fe04:5001 se ge-0/0/0.0 par pahuncha jaata hai. IPv6 IGPs mein yeh normal hai.</p></div>
<div class="warn"><p><b>Common mistake.</b> Unit par IPv6 address daalkar umeed rakhna ki doosre end par matching address ke bina neighbour ko IPv6 ping chalega. Link ke dono ends ek hi prefix share karte hain, aam taur par LANs par /64 aur point-to-point provider links par /127.</p></div>
<div class="exam"><p><b>Exam trap.</b> Link-local address automatically banta hai aur IPv6 IGPs ka dikhaya next hop hota hai. Loopback /128 hai. Point-to-point links aksar /127 use karte hain.</p></div>
<div class="scn"><h4>Ping jo ek taraf fail hua</h4><p>Engineer ne R1 par 2001:db8:12::1/64 aur R2 par typo se 2001:db8:13::2/64 configure kiya. Neighbour ko ping fail hue. Dono taraf show interfaces terse ne alag prefixes dikhaye. R2 ko 2001:db8:12::2/64 karne se link theek hua.</p><p><b>Lesson:</b> Link ke dono ends ka prefix hamesha compare karo.</p></div>
<div class="iv"><p class="q">"IPv6 routers next hop ke roop mein link-local address kyun dikhate hain?"</p><p>Link-local addresses har IPv6 interface par automatically hote hain aur link par unique hote hain, isliye routing protocols unhe neighbour sessions aur next hops ke liye use karte hain. Global addresses badalne se adjacencies nahi tootti.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>IPv6 family inet6 ke neeche hota hai aur Junos link-local address auto-create karta hai.</li><li>Loopbacks /128 hote hain; core links aksar /127.</li><li>inet6.0 mein Direct aur Local routes inet.0 ki tarah dikhte hain.</li><li>IGP next hops link-local addresses hote hain.</li></ul></div>
`}};export{e as default};