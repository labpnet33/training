var e={id:`overload-virtual-links`,h:{en:`Overload and virtual links: draining a router and repairing the backbone`,hi:`Overload aur virtual links: router drain karna aur backbone repair karna`},body:{en:`
<p>Two features solve two very practical problems. <b>Overload</b> lets you take a router out of the transit path without losing access to it, which is how you prepare for maintenance. A <b>virtual link</b> lets an area that cannot reach area 0 physically still join the backbone logically. Both appear in labs and exam tasks.</p>

<h3>Part 1: OSPF overload</h3>
<p>With <code>set protocols ospf overload</code>, the router advertises all of its <b>transit links</b> with the maximum metric, 65535. Other routers run SPF and, if there is any other path, they avoid this router. The router's own prefixes, such as its loopback (a stub link with metric 0), stay reachable, so you can still log in and the router can still be a destination. It is like closing a road to through traffic while leaving local access open.</p>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Overload steers traffic away">
<circle cx="90" cy="115" r="26" fill="#bae6fd" stroke="#64748b"/><text x="90" y="119" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<circle cx="320" cy="50" r="26" fill="#fed7aa" stroke="#64748b"/><text x="320" y="54" text-anchor="middle" class="svg-ink" font-size="13">R2</text>
<circle cx="320" cy="180" r="26" fill="#bbf7d0" stroke="#64748b"/><text x="320" y="184" text-anchor="middle" class="svg-ink" font-size="13">R3</text>
<circle cx="550" cy="115" r="26" fill="#ddd6fe" stroke="#64748b"/><text x="550" y="119" text-anchor="middle" class="svg-ink" font-size="13">R4</text>
<line x1="112" y1="102" x2="298" y2="62" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><line x1="342" y1="62" x2="528" y2="102" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<line x1="112" y1="128" x2="298" y2="168" stroke="#16a34a" stroke-width="3"/><line x1="342" y1="168" x2="528" y2="128" stroke="#16a34a" stroke-width="3"/>
<text x="320" y="16" text-anchor="middle" class="svg-accent" font-size="12">R2: overload, transit metric 65535</text>
<text x="320" y="222" text-anchor="middle" class="svg-muted" font-size="12">Traffic from R1 to R4 now uses R3</text>
</svg><p class="cap">Dashed links carry 65535 from R2; the solid path through R3 wins.</p></div>
<pre class="code"><span class="c">! R2: maintenance window that clears itself after 900 seconds</span>
set protocols ospf overload timeout 900</pre>
<p>Before overload R1 sees two equal-cost next hops to the server LAN. After the change R1 sees one, and R2's own loopback still answers:</p>
<pre class="out">lab@R1-CHENNAI&gt; show route 172.16.4.0/24
172.16.4.0/24      *[OSPF/10] 00:00:11, metric 3
                    &gt;  to <span class="hl">10.4.13.2</span> via ge-0/0/1.0

lab@R1-CHENNAI&gt; show ospf database router lsa-id 10.255.4.2 detail
  id 10.4.12.2, data 10.4.12.2, Type Transit (2)
    Topology count: 0, <span class="hl">Default metric: 65535</span>
  id 10.4.24.2, data 10.4.24.1, Type Transit (2)
    Topology count: 0, Default metric: 65535
  id 10.255.4.2, data 255.255.255.255, Type Stub (3)
    Topology count: 0, Default metric: 0

lab@R2-CHENNAI&gt; show ospf overview
  <span class="hl">Configured overload, expires in 900 seconds</span>

lab@R1-CHENNAI&gt; traceroute 172.16.4.10 no-resolve
 1  10.4.13.2 (10.4.13.2)  2.900 ms  1.300 ms  2.000 ms
 2  10.4.34.2 (10.4.34.2)  1.900 ms  2.600 ms  1.000 ms
 3  172.16.4.10 (172.16.4.10)  0.900 ms  1.600 ms  2.300 ms</pre>
<p>The timeout form is useful after a reboot. The router stays out of the transit path for a set time while BGP and other protocols converge, then rejoins by itself. Without a timeout, overload stays until you delete it.</p>

<h3>Part 2: virtual links</h3>
<p>Every area must touch area 0. A <b>virtual link</b> is a logical tunnel through a <b>transit area</b> that connects an ABR in a detached area to the backbone. In the Hubli lab R4's area 0.0.0.2 hangs behind R3, which is only in area 0.0.0.1. R2 touches area 0, so R2 and R3 form a virtual link through area 0.0.0.1.</p>
<pre class="code"><span class="c">! Both ABRs, under area 0: neighbor-id is the OTHER side's router ID</span>
R2# set protocols ospf area 0.0.0.0 virtual-link neighbor-id 10.255.5.3 transit-area 0.0.0.1
R3# set protocols ospf area 0.0.0.0 virtual-link neighbor-id 10.255.5.2 transit-area 0.0.0.1</pre>
<p>Rules to remember:</p>
<ul>
<li>It is configured on <b>both</b> ABRs, under area 0.0.0.0.</li>
<li>neighbor-id is the <b>router ID</b> of the far ABR, not an interface address.</li>
<li>The transit area must be a normal area: not stub, not NSSA.</li>
<li>The virtual link is a point-to-point interface in area 0, named vl- plus the neighbour router ID.</li>
<li>It is a repair tool. The permanent fix is to attach the area to area 0 or renumber.</li>
</ul>
<pre class="out">lab@R2-HO&gt; show ospf neighbor
Address          Interface              State           ID               Pri  Dead
10.5.12.1        ge-0/0/0.0             Full            10.255.5.1       128    40
10.5.23.2        ge-0/0/1.0             Full            10.255.5.3       128    34
10.5.23.2        <span class="hl">vl-10.255.5.3</span>          Full            10.255.5.3         0    33

lab@R2-HO&gt; show ospf interface
vl-10.255.5.3       <span class="hl">PtToPt</span>  0.0.0.0         0.0.0.0         0.0.0.0            1</pre>
<p>Notice the virtual link has priority 0 (no DR on a point-to-point link) and the neighbour address is the same address as the real link in area 0.0.0.1: the virtual link rides over that physical path. After the repair R1 learns the Hubli LAN with metric 4 and PC1 can ping the server.</p>

<div class="eg"><p><b>Worked example.</b> Plan: R2 must be taken out of service at 22:00 but must come back automatically if the engineer forgets. Commands on R2: <code>set protocols ospf overload timeout 900</code>, commit. Verify on R1: one next hop in <code>show route 172.16.4.0/24</code>, loopback of R2 reachable, <code>show ospf overview</code> on R2 counting down. After 900 seconds the second path returns.</p></div>

<div class="warn"><p><b>Common mistake.</b> Putting an interface address in <code>neighbor-id</code>. The configuration commits cleanly, the virtual-link interface exists, but it stays Down because the router ID does not match. Always compare against <code>show ospf overview</code> on the far ABR.</p></div>
<div class="exam"><p><b>Exam trap.</b> Overload does not stop the router from being reachable and does not affect its stub networks. Also: a virtual link through a stub transit area will not work, because stub areas cannot carry it.</p></div>

<div class="scn"><h4>Overload with no alternate path</h4><p>An engineer put a single-homed router into overload during a window. Neighbours kept routing through it because it was the only path, so users still saw the outage when the router was upgraded. Overload steers traffic only when an alternate path exists.</p><p><b>Lesson:</b> check that a second path exists, with <code>show route</code> on a neighbour, before relying on overload.</p></div>

<div class="iv"><p class="q">"How do you take a core router out of service gracefully in OSPF?"</p><p>Set overload, optionally with a timeout. The router advertises transit links with metric 65535, so neighbours reroute if an alternate path exists, but the router remains reachable by loopback. Verify with show route on neighbours, then do the work and delete overload or let the timer end.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Overload advertises transit links at 65535 and keeps the router reachable.</li>
<li>overload timeout N clears itself after N seconds.</li>
<li>Overload only helps if an alternate path exists.</li>
<li>Virtual links are configured under area 0 on both ABRs using router IDs and a transit area.</li>
<li>The transit area cannot be stub or NSSA; the vl- interface shows PtToPt when working.</li>
</ul></div>
`,hi:`
<p>Do features do bahut practical problems solve karte hain. <b>Overload</b> aapko router ko transit path se hatane deta hai bina uska access khoye, jo maintenance ki taiyari ka tareeka hai. <b>Virtual link</b> aise area ko, jo area 0 tak physically nahi pahunch sakta, logically backbone se judne deta hai. Dono labs aur exam tasks mein aate hain.</p>

<h3>Part 1: OSPF overload</h3>
<p><code>set protocols ospf overload</code> ke saath router apne saare <b>transit links</b> maximum metric 65535 ke saath advertise karta hai. Doosre routers SPF chalate hain aur koi aur path ho to is router se bachte hain. Router ke apne prefixes, jaise uska loopback (metric 0 wala stub link), reachable rehte hain, isliye aap login kar sakte ho aur router destination ban sakta hai. Yeh road ko through traffic ke liye band karne jaisa hai jabki local access khula hai.</p>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Overload traffic ko door karta hai">
<circle cx="90" cy="115" r="26" fill="#bae6fd" stroke="#64748b"/><text x="90" y="119" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<circle cx="320" cy="50" r="26" fill="#fed7aa" stroke="#64748b"/><text x="320" y="54" text-anchor="middle" class="svg-ink" font-size="13">R2</text>
<circle cx="320" cy="180" r="26" fill="#bbf7d0" stroke="#64748b"/><text x="320" y="184" text-anchor="middle" class="svg-ink" font-size="13">R3</text>
<circle cx="550" cy="115" r="26" fill="#ddd6fe" stroke="#64748b"/><text x="550" y="119" text-anchor="middle" class="svg-ink" font-size="13">R4</text>
<line x1="112" y1="102" x2="298" y2="62" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><line x1="342" y1="62" x2="528" y2="102" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<line x1="112" y1="128" x2="298" y2="168" stroke="#16a34a" stroke-width="3"/><line x1="342" y1="168" x2="528" y2="128" stroke="#16a34a" stroke-width="3"/>
<text x="320" y="16" text-anchor="middle" class="svg-accent" font-size="12">R2: overload, transit metric 65535</text>
<text x="320" y="222" text-anchor="middle" class="svg-muted" font-size="12">R1 se R4 ka traffic ab R3 use karta hai</text>
</svg><p class="cap">Dashed links R2 se 65535 carry karte hain; R3 wala solid path jeetta hai.</p></div>
<pre class="code"><span class="c">! R2: maintenance window jo 900 seconds baad khud clear ho</span>
set protocols ospf overload timeout 900</pre>
<p>Overload se pehle R1 server LAN ke liye do equal-cost next hops dekhta hai. Change ke baad ek dekhta hai, aur R2 ka apna loopback ab bhi jawab deta hai:</p>
<pre class="out">lab@R1-CHENNAI&gt; show route 172.16.4.0/24
172.16.4.0/24      *[OSPF/10] 00:00:11, metric 3
                    &gt;  to <span class="hl">10.4.13.2</span> via ge-0/0/1.0

lab@R1-CHENNAI&gt; show ospf database router lsa-id 10.255.4.2 detail
  id 10.4.12.2, data 10.4.12.2, Type Transit (2)
    Topology count: 0, <span class="hl">Default metric: 65535</span>
  id 10.4.24.2, data 10.4.24.1, Type Transit (2)
    Topology count: 0, Default metric: 65535
  id 10.255.4.2, data 255.255.255.255, Type Stub (3)
    Topology count: 0, Default metric: 0

lab@R2-CHENNAI&gt; show ospf overview
  <span class="hl">Configured overload, expires in 900 seconds</span>

lab@R1-CHENNAI&gt; traceroute 172.16.4.10 no-resolve
 1  10.4.13.2 (10.4.13.2)  2.900 ms  1.300 ms  2.000 ms
 2  10.4.34.2 (10.4.34.2)  1.900 ms  2.600 ms  1.000 ms
 3  172.16.4.10 (172.16.4.10)  0.900 ms  1.600 ms  2.300 ms</pre>
<p>Timeout form reboot ke baad kaam aata hai. Router tay samay tak transit path se bahar rehta hai jab BGP aur doosre protocols converge ho rahe hon, phir khud wapas aa jaata hai. Timeout ke bina overload tab tak rehta hai jab tak aap use delete na karo.</p>

<h3>Part 2: virtual links</h3>
<p>Har area ko area 0 chhoona chahiye. <b>Virtual link</b> ek <b>transit area</b> ke through logical tunnel hai jo alag pade area ke ABR ko backbone se jodta hai. Hubli lab mein R4 ka area 0.0.0.2 R3 ke peeche hai, jo sirf area 0.0.0.1 mein hai. R2 area 0 ko chhoota hai, isliye R2 aur R3 area 0.0.0.1 ke through virtual link banate hain.</p>
<pre class="code"><span class="c">! Dono ABRs, area 0 ke neeche: neighbor-id DOOSRI side ka router ID hai</span>
R2# set protocols ospf area 0.0.0.0 virtual-link neighbor-id 10.255.5.3 transit-area 0.0.0.1
R3# set protocols ospf area 0.0.0.0 virtual-link neighbor-id 10.255.5.2 transit-area 0.0.0.1</pre>
<p>Yaad rakhne ke rules:</p>
<ul>
<li>Yeh <b>dono</b> ABRs par, area 0.0.0.0 ke neeche configure hota hai.</li>
<li>neighbor-id door wale ABR ka <b>router ID</b> hai, interface address nahi.</li>
<li>Transit area normal area honi chahiye: stub nahi, NSSA nahi.</li>
<li>Virtual link area 0 mein point-to-point interface hai, naam vl- plus neighbour router ID.</li>
<li>Yeh repair tool hai. Permanent fix area ko area 0 se jodna ya renumber karna hai.</li>
</ul>
<pre class="out">lab@R2-HO&gt; show ospf neighbor
Address          Interface              State           ID               Pri  Dead
10.5.12.1        ge-0/0/0.0             Full            10.255.5.1       128    40
10.5.23.2        ge-0/0/1.0             Full            10.255.5.3       128    34
10.5.23.2        <span class="hl">vl-10.255.5.3</span>          Full            10.255.5.3         0    33

lab@R2-HO&gt; show ospf interface
vl-10.255.5.3       <span class="hl">PtToPt</span>  0.0.0.0         0.0.0.0         0.0.0.0            1</pre>
<p>Dekho ki virtual link ki priority 0 hai (point-to-point link par DR nahi) aur neighbour address area 0.0.0.1 ke asli link ka hi address hai: virtual link usi physical path par chalta hai. Repair ke baad R1 Hubli LAN ko metric 4 ke saath seekhta hai aur PC1 server ko ping kar sakta hai.</p>

<div class="eg"><p><b>Worked example.</b> Plan: R2 ko 22:00 baje service se hatana hai par engineer bhool jaye to apne aap wapas aana chahiye. R2 par commands: <code>set protocols ospf overload timeout 900</code>, commit. R1 par verify: <code>show route 172.16.4.0/24</code> mein ek next hop, R2 ka loopback reachable, R2 par <code>show ospf overview</code> countdown dikhata hua. 900 seconds baad doosra path wapas aata hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> <code>neighbor-id</code> mein interface address daalna. Configuration saaf commit hoti hai, virtual-link interface ban jaata hai, par Down rehta hai kyunki router ID match nahi karta. Hamesha door wale ABR par <code>show ospf overview</code> se compare karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Overload router ko unreachable nahi banata aur uske stub networks ko asar nahi karta. Yeh bhi: stub transit area ke through virtual link kaam nahi karega, kyunki stub areas use carry nahi kar sakte.</p></div>

<div class="scn"><h4>Overload jahan alternate path nahi tha</h4><p>Ek engineer ne single-homed router ko window mein overload kiya. Neighbours usi ke through route karte rahe kyunki wohi ek path tha, isliye router upgrade hone par users ne outage dekha. Overload sirf tab traffic steer karta hai jab alternate path ho.</p><p><b>Lesson:</b> overload par bharosa karne se pehle neighbour par <code>show route</code> se check karo ki doosra path hai.</p></div>

<div class="iv"><p class="q">"OSPF mein core router ko gracefully service se kaise hataoge?"</p><p>Overload set karo, chahe timeout ke saath. Router transit links metric 65535 se advertise karta hai, isliye alternate path ho to neighbours reroute karte hain, par router loopback se reachable rehta hai. Neighbours par show route se verify karo, phir kaam karo aur overload delete karo ya timer khatam hone do.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Overload transit links 65535 par advertise karta hai aur router reachable rakhta hai.</li>
<li>overload timeout N, N seconds baad khud clear hota hai.</li>
<li>Overload tabhi madad karta hai jab alternate path ho.</li>
<li>Virtual links area 0 ke neeche dono ABRs par router IDs aur transit area ke saath configure hote hain.</li>
<li>Transit area stub ya NSSA nahi ho sakti; chalta vl- interface PtToPt dikhata hai.</li>
</ul></div>
`}};export{e as default};