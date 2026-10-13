var e={id:`ospfv3-areas-external`,h:{en:`OSPFv3 areas, inter-area routes and external routes`,hi:`OSPFv3 areas, inter-area routes aur external routes`},body:{en:`
<p>Real networks use more than one area. A backbone area 0 joins non-backbone areas, and an area border router (ABR) sits between them. Routes cross areas as summaries and enter from outside OSPF as externals. This chapter follows a real three-router simulator lab: R1 and R2 in area 0.0.0.0, R2 and R3 in area 0.0.0.1, and a research LAN 2001:db8:77::/64 behind R3.</p>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Two areas joined by an ABR; R3 exports the LAN as an external route."><rect x="20" y="40" width="127" height="64" rx="10" fill="#bbf7d0"/><text x="83.5" y="68" text-anchor="middle" class="svg-ink" font-size="13">R1</text><text x="83.5" y="88" text-anchor="middle" class="svg-muted" font-size="11">area 0</text><line x1="147" y1="72" x2="177.66666666666666" y2="72" stroke="#64748b" stroke-width="2"/><text x="162.33333333333334" y="62" text-anchor="middle" class="svg-accent" font-size="11">ospf3</text><rect x="177.66666666666666" y="40" width="127" height="64" rx="10" fill="#bae6fd"/><text x="241.16666666666666" y="68" text-anchor="middle" class="svg-ink" font-size="13">R2 (ABR)</text><text x="241.16666666666666" y="88" text-anchor="middle" class="svg-muted" font-size="11">0 and 1</text><line x1="304.66666666666663" y1="72" x2="335.3333333333333" y2="72" stroke="#64748b" stroke-width="2"/><text x="319.99999999999994" y="62" text-anchor="middle" class="svg-accent" font-size="11">ospf3</text><rect x="335.3333333333333" y="40" width="127" height="64" rx="10" fill="#ddd6fe"/><text x="398.8333333333333" y="68" text-anchor="middle" class="svg-ink" font-size="13">R3 (ASBR)</text><text x="398.8333333333333" y="88" text-anchor="middle" class="svg-muted" font-size="11">area 1</text><line x1="462.3333333333333" y1="72" x2="493" y2="72" stroke="#64748b" stroke-width="2"/><text x="477.66666666666663" y="62" text-anchor="middle" class="svg-accent" font-size="11">direct</text><rect x="493" y="40" width="127" height="64" rx="10" fill="#fde68a"/><text x="556.5" y="68" text-anchor="middle" class="svg-ink" font-size="13">LAN</text><text x="556.5" y="88" text-anchor="middle" class="svg-muted" font-size="11">2001:db8:77::/64</text></svg><p class="cap">Two areas joined by an ABR; R3 exports the LAN as an external route.</p></div>
<h3>Inter-area and external routes</h3>
<ul><li><b>Inter-Area-Prefix LSA</b>: the ABR summarises prefixes from one area into another. It is the IPv6 counterpart of the OSPFv2 network summary.</li><li><b>AS-External LSA</b>: an ASBR (autonomous system boundary router) injects routes from other sources. External type 1 adds the internal cost to reach the ASBR; type 2 does not.</li><li>Default preferences on Junos: OSPF internal routes 10, OSPF external routes 150.</li></ul>
<p>On R3 the research LAN is exported with a policy: match the direct route, mark it external type 1, metric 50 and tag 77. The tag is a label that other routers can use in policies.</p>
<pre class="code"><span class="c">! R3</span>
set policy-options policy-statement LAB-NETS term lan from protocol direct
set policy-options policy-statement LAB-NETS term lan from route-filter 2001:db8:77::/64 exact
set policy-options policy-statement LAB-NETS term lan then external type 1
set policy-options policy-statement LAB-NETS term lan then metric 50
set policy-options policy-statement LAB-NETS term lan then tag 77
set policy-options policy-statement LAB-NETS term lan then accept
set protocols ospf3 export LAB-NETS</pre>
<p>Real output on R1. The database shows the AS-External LSA with metric 50, type 1. The routing table shows R1's metric as <b>52</b>: the external metric 50 plus R1's cost to reach R3 over two links of cost 1 each. The route has preference <b>150</b> and the tag 77.</p>
<pre class="out">R1&gt; show ospf3 database external detail
    OSPF3 AS SCOPE link state database
 Type       ID               Adv Rtr           Seq         Age  Cksum  Len
Extern      0.0.0.1          10.255.3.3       0x80000001    45  0x1221  36
  Prefix 2001:db8:77::/64
  <span class="hl">Prefix-options 0x0, Metric 50, Type 1</span>

R1&gt; show route 2001:db8:77::/64
inet6.0: 7 destinations, 8 routes (8 active, 0 holddown, 0 hidden)
+ = Active Route, - = Last Active, * = Both

2001:db8:77::/64   *[<span class="hl">OSPF3/150</span>] 00:00:00, <span class="hl">metric 52, tag 77</span>
                    &gt;  to fe80::5054:fff:fe04:5001 via ge-0/0/0.0

R1&gt; ping 2001:db8:77::1 count 3
PING6(104=40+8+56 bytes) :: --&gt; 2001:db8:77::1
64 bytes from 2001:db8:77::1: icmp_seq=0 ttl=63 time=1.700 ms
64 bytes from 2001:db8:77::1: icmp_seq=1 ttl=63 time=2.000 ms
64 bytes from 2001:db8:77::1: icmp_seq=2 ttl=63 time=2.300 ms
--- 2001:db8:77::1 ping6 statistics ---
3 packets transmitted, 3 packets received, 0% packet loss
round-trip min/avg/max/stddev = 1.700/2.000/2.300/0.200 ms</pre>
<p>The same lab is a hands-on exercise in jncip-ospf. Practise it there; this chapter explains what you see.</p>
<div class="eg"><p><b>Worked example.</b> Why 52? The external type 1 metric is 50. R1 reaches the ASBR R3 over R1-R2 (cost 1) and R2-R3 (cost 1), so internal cost is 2. For type 1, 50 + 2 = 52. With type 2 the metric would stay 50 everywhere.</p></div>
<div class="warn"><p><b>Common mistake.</b> Exporting a prefix without a route-filter and matching more than you intended. Always use <code>exact</code> or a precise match type, and test the policy before commit.</p></div>
<div class="exam"><p><b>Exam trap.</b> Type 1 external adds internal cost; type 2 does not. OSPF external preference is 150, internal is 10. The ABR creates Inter-Area-Prefix LSAs; the ASBR creates AS-External LSAs.</p></div>
<div class="scn"><h4>The tag that blocked a test network</h4><p>A team needed to keep a lab prefix out of the head office. They tagged the export with 77 on the ASBR and wrote an import policy at head office that rejects tag 77 for routing-table installation. The prefix stayed in the database but never entered the route table.</p><p><b>Lesson:</b> Tags let you act on routes without hard-coding prefixes.</p></div>
<div class="iv"><p class="q">"External type 1 versus type 2?"</p><p>Type 1 adds the internal cost to the ASBR to the external metric, so the metric changes along the path. Type 2 keeps the external metric constant. Use type 1 when the cost inside OSPF should affect choice. Mention OSPF external preference 150.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>An ABR summarises with Inter-Area-Prefix LSAs; an ASBR injects AS-External LSAs.</li><li>Type 1 external = external metric plus internal cost.</li><li>Preference: internal 10, external 150.</li><li>Tags are carried with external routes and can drive policy.</li></ul></div>
`,hi:`
<p>Real networks mein ek se zyada area hote hain. Backbone area 0 non-backbone areas ko jodta hai aur area border router (ABR) unke beech baithta hai. Routes areas ke beech summaries ki tarah paar karte hain aur OSPF ke bahar se externals ki tarah aate hain. Yeh chapter ek real teen-router simulator lab follow karta hai: R1 aur R2 area 0.0.0.0 mein, R2 aur R3 area 0.0.0.1 mein, aur R3 ke peeche research LAN 2001:db8:77::/64.</p>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Do areas ABR se jude; R3 LAN ko external route ke roop mein export karta hai."><rect x="20" y="40" width="127" height="64" rx="10" fill="#bbf7d0"/><text x="83.5" y="68" text-anchor="middle" class="svg-ink" font-size="13">R1</text><text x="83.5" y="88" text-anchor="middle" class="svg-muted" font-size="11">area 0</text><line x1="147" y1="72" x2="177.66666666666666" y2="72" stroke="#64748b" stroke-width="2"/><text x="162.33333333333334" y="62" text-anchor="middle" class="svg-accent" font-size="11">ospf3</text><rect x="177.66666666666666" y="40" width="127" height="64" rx="10" fill="#bae6fd"/><text x="241.16666666666666" y="68" text-anchor="middle" class="svg-ink" font-size="13">R2 (ABR)</text><text x="241.16666666666666" y="88" text-anchor="middle" class="svg-muted" font-size="11">0 aur 1</text><line x1="304.66666666666663" y1="72" x2="335.3333333333333" y2="72" stroke="#64748b" stroke-width="2"/><text x="319.99999999999994" y="62" text-anchor="middle" class="svg-accent" font-size="11">ospf3</text><rect x="335.3333333333333" y="40" width="127" height="64" rx="10" fill="#ddd6fe"/><text x="398.8333333333333" y="68" text-anchor="middle" class="svg-ink" font-size="13">R3 (ASBR)</text><text x="398.8333333333333" y="88" text-anchor="middle" class="svg-muted" font-size="11">area 1</text><line x1="462.3333333333333" y1="72" x2="493" y2="72" stroke="#64748b" stroke-width="2"/><text x="477.66666666666663" y="62" text-anchor="middle" class="svg-accent" font-size="11">direct</text><rect x="493" y="40" width="127" height="64" rx="10" fill="#fde68a"/><text x="556.5" y="68" text-anchor="middle" class="svg-ink" font-size="13">LAN</text><text x="556.5" y="88" text-anchor="middle" class="svg-muted" font-size="11">2001:db8:77::/64</text></svg><p class="cap">Do areas ABR se jude; R3 LAN ko external route ke roop mein export karta hai.</p></div>
<h3>Inter-area aur external routes</h3>
<ul><li><b>Inter-Area-Prefix LSA</b>: ABR ek area ke prefixes ko doosre area mein summarise karta hai. Yeh OSPFv2 network summary ka IPv6 counterpart hai.</li><li><b>AS-External LSA</b>: ASBR (autonomous system boundary router) doosre sources ke routes inject karta hai. External type 1 ASBR tak internal cost jodta hai; type 2 nahi jodta.</li><li>Junos par default preferences: OSPF internal routes 10, OSPF external routes 150.</li></ul>
<p>R3 par research LAN policy se export hota hai: direct route match karo, use external type 1, metric 50 aur tag 77 do. Tag ek label hai jise doosre routers policies mein use kar sakte hain.</p>
<pre class="code"><span class="c">! R3</span>
set policy-options policy-statement LAB-NETS term lan from protocol direct
set policy-options policy-statement LAB-NETS term lan from route-filter 2001:db8:77::/64 exact
set policy-options policy-statement LAB-NETS term lan then external type 1
set policy-options policy-statement LAB-NETS term lan then metric 50
set policy-options policy-statement LAB-NETS term lan then tag 77
set policy-options policy-statement LAB-NETS term lan then accept
set protocols ospf3 export LAB-NETS</pre>
<p>R1 par real output. Database metric 50, type 1 wala AS-External LSA dikhata hai. Routing table R1 ka metric <b>52</b> dikhata hai: external metric 50 plus R1 ka R3 tak ka cost jo cost 1 ke do links se hai. Route ki preference <b>150</b> aur tag 77 hai.</p>
<pre class="out">R1&gt; show ospf3 database external detail
    OSPF3 AS SCOPE link state database
 Type       ID               Adv Rtr           Seq         Age  Cksum  Len
Extern      0.0.0.1          10.255.3.3       0x80000001    45  0x1221  36
  Prefix 2001:db8:77::/64
  <span class="hl">Prefix-options 0x0, Metric 50, Type 1</span>

R1&gt; show route 2001:db8:77::/64
inet6.0: 7 destinations, 8 routes (8 active, 0 holddown, 0 hidden)
+ = Active Route, - = Last Active, * = Both

2001:db8:77::/64   *[<span class="hl">OSPF3/150</span>] 00:00:00, <span class="hl">metric 52, tag 77</span>
                    &gt;  to fe80::5054:fff:fe04:5001 via ge-0/0/0.0

R1&gt; ping 2001:db8:77::1 count 3
PING6(104=40+8+56 bytes) :: --&gt; 2001:db8:77::1
64 bytes from 2001:db8:77::1: icmp_seq=0 ttl=63 time=1.700 ms
64 bytes from 2001:db8:77::1: icmp_seq=1 ttl=63 time=2.000 ms
64 bytes from 2001:db8:77::1: icmp_seq=2 ttl=63 time=2.300 ms
--- 2001:db8:77::1 ping6 statistics ---
3 packets transmitted, 3 packets received, 0% packet loss
round-trip min/avg/max/stddev = 1.700/2.000/2.300/0.200 ms</pre>
<p>Yahi lab jncip-ospf mein hands-on exercise hai. Practice wahan karo; yeh chapter samjhata hai ki aap kya dekh rahe ho.</p>
<div class="eg"><p><b>Worked example.</b> 52 kyun? External type 1 metric 50 hai. R1 ASBR R3 tak R1-R2 (cost 1) aur R2-R3 (cost 1) se pahunchta hai, isliye internal cost 2 hai. Type 1 ke liye 50 + 2 = 52. Type 2 mein metric har jagah 50 rehta.</p></div>
<div class="warn"><p><b>Common mistake.</b> Route-filter ke bina prefix export karna aur jitna chaaha usse zyada match karna. Hamesha <code>exact</code> ya precise match type use karo aur commit se pehle policy test karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Type 1 external internal cost jodta hai; type 2 nahi. OSPF external preference 150, internal 10. ABR Inter-Area-Prefix LSAs banata hai; ASBR AS-External LSAs.</p></div>
<div class="scn"><h4>Tag jisne test network roka</h4><p>Ek team ko lab prefix head office se door rakhna tha. Unhone ASBR par export ko tag 77 diya aur head office par import policy likhi jo routing-table installation ke liye tag 77 reject karti hai. Prefix database mein raha par route table mein nahi aaya.</p><p><b>Lesson:</b> Tags prefixes hard-code kiye bina routes par action lene dete hain.</p></div>
<div class="iv"><p class="q">"External type 1 aur type 2 mein kya fark?"</p><p>Type 1 external metric mein ASBR tak internal cost jodta hai, isliye metric path ke saath badalta hai. Type 2 external metric constant rakhta hai. Jab OSPF ke andar ka cost choice ko prabhavit karna ho tab type 1 use karo. OSPF external preference 150 batao.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>ABR Inter-Area-Prefix LSAs se summarise karta hai; ASBR AS-External LSAs inject karta hai.</li><li>Type 1 external = external metric plus internal cost.</li><li>Preference: internal 10, external 150.</li><li>Tags external routes ke saath chalte hain aur policy chala sakte hain.</li></ul></div>
`}};export{e as default};