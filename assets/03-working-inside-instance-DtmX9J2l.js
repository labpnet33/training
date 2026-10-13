var e={id:`working-inside-instance`,h:{en:`Working inside an instance: the guest virtual router lab`,hi:`Instance ke andar kaam: guest virtual router lab`},body:{en:`
<p>Once a virtual router exists, the daily skill is operating it: showing its routes, checking its OSPF neighbours and testing connectivity from inside it. The commands are the ones you already know, with one extra piece of information, the <b>instance name</b>.</p>

<h3>The lab</h3>
<p>R1 connects to CORE (10.10.0.0/30) on ge-0/0/0 and to a staff LAN on ge-0/0/1. Guests sit on ge-0/0/2 (192.168.50.1/24) and the guest gateway GW sits behind ge-0/0/3 (100.64.50.0/30). GW has the guest server network 198.18.0.0/24. The task: put ge-0/0/2.0 and ge-0/0/3.0 into a virtual router GUEST, run OSPF there, and make guests reach 198.18.0.10 but not the staff network.</p>

<div class="dia"><svg viewBox="0 0 660 220" role="img" aria-label="Guest lab topology">
<rect x="20" y="30" width="80" height="40" rx="8" fill="#e2e8f0"/><text x="60" y="55" text-anchor="middle" class="svg-ink" font-size="12">PCC</text>
<rect x="20" y="140" width="80" height="40" rx="8" fill="#e2e8f0"/><text x="60" y="165" text-anchor="middle" class="svg-ink" font-size="12">PCG</text>
<rect x="260" y="70" width="130" height="80" rx="10" fill="#bae6fd"/><text x="325" y="105" text-anchor="middle" class="svg-ink" font-size="14">R1</text><text x="325" y="128" text-anchor="middle" class="svg-muted" font-size="11">master + GUEST</text>
<rect x="150" y="30" width="70" height="40" rx="8" fill="#e2e8f0"/><text x="185" y="55" text-anchor="middle" class="svg-ink" font-size="12">CORE</text>
<rect x="470" y="70" width="80" height="80" rx="10" fill="#fde68a"/><text x="510" y="115" text-anchor="middle" class="svg-ink" font-size="14">GW</text>
<rect x="590" y="90" width="60" height="40" rx="8" fill="#e2e8f0"/><text x="620" y="115" text-anchor="middle" class="svg-ink" font-size="11">GSRV</text>
<line x1="100" y1="50" x2="150" y2="50" stroke="#64748b" stroke-width="2"/><line x1="220" y1="50" x2="290" y2="75" stroke="#64748b" stroke-width="2"/><line x1="100" y1="160" x2="270" y2="140" stroke="#64748b" stroke-width="2"/><line x1="390" y1="110" x2="470" y2="110" stroke="#f59e0b" stroke-width="3"/><line x1="550" y1="110" x2="590" y2="110" stroke="#64748b" stroke-width="2"/>
<text x="430" y="100" text-anchor="middle" class="svg-accent" font-size="11">ge-0/0/3 (GUEST)</text><text x="185" y="150" text-anchor="middle" class="svg-accent" font-size="11">ge-0/0/2 (GUEST)</text>
</svg><p class="cap">Guest LAN and the GW link are in GUEST; the CORE link stays in the master.</p></div>

<h3>Configuration</h3>
<pre class="code">set routing-instances GUEST instance-type virtual-router
set routing-instances GUEST interface ge-0/0/2.0
set routing-instances GUEST interface ge-0/0/3.0
commit
set routing-instances GUEST routing-options router-id 192.168.50.1
set routing-instances GUEST protocols ospf area 0 interface ge-0/0/3.0
set routing-instances GUEST protocols ospf area 0 interface ge-0/0/2.0 passive
commit</pre>
<p>Committing the instance first and the protocol second keeps each step easy to verify.</p>

<h3>Verification</h3>
<p>After about 45 seconds the adjacency forms:</p>
<pre class="out">lab@R1&gt; show ospf neighbor instance GUEST
Address          Interface              State           ID               Pri  Dead
100.64.50.2      ge-0/0/3.0             Full            100.100.100.100  128    35</pre>
<p>The neighbour is GW, ID 100.100.100.100. The guest table now contains the server network learned through OSPF:</p>
<pre class="out">lab@R1&gt; show route table GUEST.inet.0 198.18.0.0/24
GUEST.inet.0: 7 destinations, 7 routes (7 active, 0 holddown, 0 hidden)
+ = Active Route, - = Last Active, * = Both

198.18.0.0/24      *[OSPF/10] 00:00:40, metric 2
                    &gt;  to 100.64.50.2 via ge-0/0/3.0</pre>
<p>Use the instance name in every command that needs it:</p>
<ul>
<li><code>show route table GUEST.inet.0</code></li>
<li><code>show ospf neighbor instance GUEST</code></li>
<li><code>show ospf database instance GUEST</code></li>
<li><code>ping 198.18.0.10 routing-instance GUEST</code></li>
<li><code>traceroute 198.18.0.10 routing-instance GUEST</code></li>
</ul>

<h3>Ping needs the instance too</h3>
<p>A plain <code>ping</code> uses the master table. The guest server is only known to GUEST, so the plain ping fails while the instance ping succeeds:</p>
<pre class="out">lab@R1&gt; ping 198.18.0.10 routing-instance GUEST count 3
3 packets transmitted, 3 packets received, 0% packet loss

lab@R1&gt; ping 198.18.0.10 count 3
3 packets transmitted, 0 packets received, 100% packet loss</pre>
<p>The 100% loss is the expected result: the master table has no route to 198.18.0.0/24. It is not a fault.</p>

<h3>Proving isolation</h3>
<ul>
<li>The master OSPF neighbour 10.10.0.2 (CORE) is still Full, so staff routing is untouched.</li>
<li>PCG (guest) reaches 198.18.0.10 but gets Destination host unreachable to 10.10.10.10, a staff address.</li>
<li>PCC (staff) still reaches 10.20.0.10.</li>
</ul>
<p>That is exactly the goal: guests see only what the GUEST table holds.</p>

<div class="eg"><p><b>Worked example.</b> A guest complains that the Internet gateway does not answer. Steps: <code>show ospf neighbor instance GUEST</code> (Full?), <code>show route table GUEST.inet.0 198.18.0.0/24</code> (route present?), <code>ping 198.18.0.10 routing-instance GUEST</code> (reply?). Each answer narrows the fault to one layer.</p></div>
<div class="warn"><p><b>Common mistake.</b> Testing with a plain ping and concluding the guest network is broken. Always add <code>routing-instance GUEST</code> when you test from the router.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>show route</code> without a table shows the master tables only. A route in an instance is invisible unless you name the table or use <code>show route instance NAME</code>.</p></div>
<div class="scn"><h4>The ping that lied</h4><p>During a hotel upgrade the support team pinged a gateway from the router and saw 100% loss, so they escalated to the ISP. A colleague repeated the test with the instance keyword and got replies. The fault was the test, not the network.</p><p><b>Lesson:</b> a test that uses the wrong table proves nothing.</p></div>
<div class="iv"><p class="q">"How do you check OSPF inside a virtual router?"</p><p>I use <code>show ospf neighbor instance NAME</code> and <code>show ospf database instance NAME</code>. For routes I use <code>show route table NAME.inet.0</code>, and for reachability <code>ping HOST routing-instance NAME</code>.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Move interfaces, then configure protocols under the instance.</li>
<li>Always name the instance in show and ping commands.</li>
<li>A plain ping uses the master table.</li>
<li>Isolation is proven by unreachable staff addresses from the guest side.</li>
</ul></div>
`,hi:`
<p>Virtual router bante ke baad roz ka skill use operate karna hai: uske routes dikhana, uske OSPF neighbours check karna aur uske andar se connectivity test karna. Commands wahi hain jo aap jaante ho, ek extra jaankari ke saath, <b>instance ka naam</b>.</p>

<h3>Lab</h3>
<p>R1 ge-0/0/0 par CORE (10.10.0.0/30) se aur ge-0/0/1 par staff LAN se judta hai. Guests ge-0/0/2 (192.168.50.1/24) par hain aur guest gateway GW ge-0/0/3 (100.64.50.0/30) ke peeche hai. GW ke paas guest server network 198.18.0.0/24 hai. Kaam: ge-0/0/2.0 aur ge-0/0/3.0 ko virtual router GUEST mein daalo, wahan OSPF chalao, aur guests ko 198.18.0.10 tak pahunchao lekin staff network tak nahi.</p>

<div class="dia"><svg viewBox="0 0 660 220" role="img" aria-label="Guest lab topology">
<rect x="20" y="30" width="80" height="40" rx="8" fill="#e2e8f0"/><text x="60" y="55" text-anchor="middle" class="svg-ink" font-size="12">PCC</text>
<rect x="20" y="140" width="80" height="40" rx="8" fill="#e2e8f0"/><text x="60" y="165" text-anchor="middle" class="svg-ink" font-size="12">PCG</text>
<rect x="260" y="70" width="130" height="80" rx="10" fill="#bae6fd"/><text x="325" y="105" text-anchor="middle" class="svg-ink" font-size="14">R1</text><text x="325" y="128" text-anchor="middle" class="svg-muted" font-size="11">master + GUEST</text>
<rect x="150" y="30" width="70" height="40" rx="8" fill="#e2e8f0"/><text x="185" y="55" text-anchor="middle" class="svg-ink" font-size="12">CORE</text>
<rect x="470" y="70" width="80" height="80" rx="10" fill="#fde68a"/><text x="510" y="115" text-anchor="middle" class="svg-ink" font-size="14">GW</text>
<rect x="590" y="90" width="60" height="40" rx="8" fill="#e2e8f0"/><text x="620" y="115" text-anchor="middle" class="svg-ink" font-size="11">GSRV</text>
<line x1="100" y1="50" x2="150" y2="50" stroke="#64748b" stroke-width="2"/><line x1="220" y1="50" x2="290" y2="75" stroke="#64748b" stroke-width="2"/><line x1="100" y1="160" x2="270" y2="140" stroke="#64748b" stroke-width="2"/><line x1="390" y1="110" x2="470" y2="110" stroke="#f59e0b" stroke-width="3"/><line x1="550" y1="110" x2="590" y2="110" stroke="#64748b" stroke-width="2"/>
<text x="430" y="100" text-anchor="middle" class="svg-accent" font-size="11">ge-0/0/3 (GUEST)</text><text x="185" y="150" text-anchor="middle" class="svg-accent" font-size="11">ge-0/0/2 (GUEST)</text>
</svg><p class="cap">Guest LAN aur GW link GUEST mein hain; CORE link master mein rehta hai.</p></div>

<h3>Configuration</h3>
<pre class="code">set routing-instances GUEST instance-type virtual-router
set routing-instances GUEST interface ge-0/0/2.0
set routing-instances GUEST interface ge-0/0/3.0
commit
set routing-instances GUEST routing-options router-id 192.168.50.1
set routing-instances GUEST protocols ospf area 0 interface ge-0/0/3.0
set routing-instances GUEST protocols ospf area 0 interface ge-0/0/2.0 passive
commit</pre>
<p>Pehle instance commit karna aur phir protocol, har step ko verify karna aasan rakhta hai.</p>

<h3>Verification</h3>
<p>Lagbhag 45 second baad adjacency ban jaati hai:</p>
<pre class="out">lab@R1&gt; show ospf neighbor instance GUEST
Address          Interface              State           ID               Pri  Dead
100.64.50.2      ge-0/0/3.0             Full            100.100.100.100  128    35</pre>
<p>Neighbour GW hai, ID 100.100.100.100. Guest table mein ab OSPF se seekha server network hai:</p>
<pre class="out">lab@R1&gt; show route table GUEST.inet.0 198.18.0.0/24
GUEST.inet.0: 7 destinations, 7 routes (7 active, 0 holddown, 0 hidden)
+ = Active Route, - = Last Active, * = Both

198.18.0.0/24      *[OSPF/10] 00:00:40, metric 2
                    &gt;  to 100.64.50.2 via ge-0/0/3.0</pre>
<p>Jahan zaroorat ho wahan har command mein instance ka naam do:</p>
<ul>
<li><code>show route table GUEST.inet.0</code></li>
<li><code>show ospf neighbor instance GUEST</code></li>
<li><code>show ospf database instance GUEST</code></li>
<li><code>ping 198.18.0.10 routing-instance GUEST</code></li>
<li><code>traceroute 198.18.0.10 routing-instance GUEST</code></li>
</ul>

<h3>Ping ko bhi instance chahiye</h3>
<p>Plain <code>ping</code> master table use karta hai. Guest server sirf GUEST ko pata hai, isliye plain ping fail hota hai jabki instance ping safal:</p>
<pre class="out">lab@R1&gt; ping 198.18.0.10 routing-instance GUEST count 3
3 packets transmitted, 3 packets received, 0% packet loss

lab@R1&gt; ping 198.18.0.10 count 3
3 packets transmitted, 0 packets received, 100% packet loss</pre>
<p>100% loss expected result hai: master table mein 198.18.0.0/24 ka route nahi hai. Yeh fault nahi hai.</p>

<h3>Isolation saabit karna</h3>
<ul>
<li>Master OSPF neighbour 10.10.0.2 (CORE) ab bhi Full hai, isliye staff routing untouched hai.</li>
<li>PCG (guest) 198.18.0.10 tak pahunchta hai par staff address 10.10.10.10 par Destination host unreachable milta hai.</li>
<li>PCC (staff) ab bhi 10.20.0.10 tak pahunchta hai.</li>
</ul>
<p>Yahi goal tha: guests wahi dekhte hain jo GUEST table mein hai.</p>

<div class="eg"><p><b>Worked example.</b> Guest shikayat karta hai ki Internet gateway jawab nahi deta. Steps: <code>show ospf neighbor instance GUEST</code> (Full?), <code>show route table GUEST.inet.0 198.18.0.0/24</code> (route hai?), <code>ping 198.18.0.10 routing-instance GUEST</code> (reply?). Har jawab fault ko ek layer tak seemit karta hai.</p></div>
<div class="warn"><p><b>Common mistake.</b> Plain ping se test karke maan lena ki guest network toota hai. Router se test karte waqt hamesha <code>routing-instance GUEST</code> lagao.</p></div>
<div class="exam"><p><b>Exam trap.</b> Bina table ke <code>show route</code> sirf master tables dikhata hai. Instance ka route tab tak nahi dikhta jab tak table ka naam na do ya <code>show route instance NAME</code> use na karo.</p></div>
<div class="scn"><h4>Ping jo jhooth bola</h4><p>Hotel upgrade ke dauraan support team ne router se gateway ping kiya, 100% loss dekha aur ISP ko escalate kar diya. Ek colleague ne instance keyword ke saath test dohraya aur replies mile. Galti test mein thi, network mein nahi.</p><p><b>Lesson:</b> galat table use karne wala test kuch saabit nahi karta.</p></div>
<div class="iv"><p class="q">"Virtual router ke andar OSPF kaise check karte ho?"</p><p>Main <code>show ospf neighbor instance NAME</code> aur <code>show ospf database instance NAME</code> use karta hoon. Routes ke liye <code>show route table NAME.inet.0</code>, aur reachability ke liye <code>ping HOST routing-instance NAME</code>.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Interfaces move karo, phir protocols instance ke andar configure karo.</li>
<li>Show aur ping commands mein hamesha instance ka naam do.</li>
<li>Plain ping master table use karta hai.</li>
<li>Isolation guest side se staff addresses unreachable hone se saabit hoti hai.</li>
</ul></div>
`}};export{e as default};