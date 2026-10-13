var e={id:`wan-transports`,h:{en:`WAN transports and carriers: Internet, MPLS, LTE/5G`,hi:`WAN transports aur carriers: Internet, MPLS, LTE/5G`},body:{en:`
<p>SD-WAN is only as good as the circuits beneath it. A network engineer who understands what a carrier actually delivers, where responsibility ends and what the numbers in a contract mean will solve tickets faster than one who only knows the controller screens.</p>

<h3>Analogy: roads, railways and flights</h3>
<p>To travel between two cities you can drive on a public highway (cheap, free to enter, travel time varies with traffic), take a reserved railway coach (costs more, runs on a timetable, a seat is guaranteed), or keep a mobile phone hotspot as a last resort. WAN transports are the same: <b>Internet</b> is the public highway, <b>MPLS</b> is the reserved coach, <b>LTE/5G</b> is the backup that works anywhere there is a tower.</p>

<h3>The three transports in this course</h3>
<table class="cmp"><tr><th>Transport</th><th>What the carrier gives you</th><th>Strength</th><th>Weakness</th></tr>
<tr><td><b>Internet</b> (broadband, dedicated Internet access)</td><td>A public IP, a gateway, access to the whole Internet</td><td>Cheap, fast to order, high bandwidth, enables local breakout</td><td>No end-to-end SLA; quality varies with the time of day</td></tr>
<tr><td><b>MPLS</b> (private WAN)</td><td>A private routed network inside the carrier; QoS classes</td><td>Predictable latency and loss, carrier SLA</td><td>Expensive per Mbps, slow to provision, no direct Internet</td></tr>
<tr><td><b>LTE / 5G</b></td><td>Mobile data through a modem or SIM</td><td>Works in minutes, great backup or for remote sites</td><td>Higher latency, jitter and loss; data caps; address often shared (CGNAT)</td></tr>
</table>
<p><b>MPLS</b> (Multiprotocol Label Switching) forwards packets using short labels inside the carrier. As a customer you do not see labels; you see a private IP network. The carrier edge router is the <b>PE</b> (provider edge) and your router is the <b>CE</b> (customer edge). Between PE and CE you usually get a small point-to-point subnet and either a static route or BGP.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Branch with three transports">
<rect x="20" y="85" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="75" y="108" text-anchor="middle" class="svg-ink" font-size="13">Branch1 VOS</text><text x="75" y="125" text-anchor="middle" class="svg-muted" font-size="11">Delhi, site 101</text>
<ellipse cx="320" cy="40" rx="90" ry="24" fill="#ddd6fe"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="13">Internet</text>
<ellipse cx="320" cy="110" rx="90" ry="24" fill="#fed7aa"/><text x="320" y="115" text-anchor="middle" class="svg-ink" font-size="13">MPLS</text>
<ellipse cx="320" cy="180" rx="90" ry="24" fill="#bae6fd"/><text x="320" y="185" text-anchor="middle" class="svg-ink" font-size="13">LTE carrier</text>
<rect x="510" y="85" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="565" y="108" text-anchor="middle" class="svg-ink" font-size="13">Controller</text><text x="565" y="125" text-anchor="middle" class="svg-muted" font-size="11">Mumbai headend</text>
<line x1="130" y1="100" x2="235" y2="45" stroke="#64748b"/><line x1="130" y1="110" x2="230" y2="110" stroke="#64748b"/><line x1="130" y1="120" x2="235" y2="175" stroke="#64748b"/>
<line x1="405" y1="45" x2="510" y2="100" stroke="#64748b"/><line x1="410" y1="110" x2="510" y2="110" stroke="#64748b"/><line x1="405" y1="175" x2="510" y2="120" stroke="#64748b" stroke-dasharray="4"/>
<text x="180" y="62" class="svg-muted" font-size="11">vni-0/0</text><text x="170" y="104" class="svg-muted" font-size="11">vni-0/1</text><text x="180" y="168" class="svg-muted" font-size="11">vni-0/2</text>
</svg><p class="cap">Each transport lands on its own branch interface. LTE reaches the headend via the Internet (dashed), as in the course topology.</p></div>

<h3>Circuit vocabulary you will hear</h3>
<ul>
<li><b>Circuit:</b> one carrier service to one site, with an order number (circuit ID). Quote it in tickets.</li>
<li><b>Handoff:</b> the physical and logical interface where the carrier delivers the service to you. For example "Ethernet handoff, 1 Gbps, single VLAN, /30 subnet".</li>
<li><b>Demarc:</b> the demarcation point where carrier responsibility ends and yours begins. Everything on the carrier side of the handoff is the carrier's to fix.</li>
<li><b>/30 subnet:</b> a four-address block with two usable hosts, ideal for a point-to-point link. In the lab Internet circuit for Delhi is 203.0.113.4/30: carrier .5, branch .6.</li>
<li><b>Last mile:</b> the access link between the carrier building and your office.</li>
<li><b>Dual carrier:</b> two circuits from different providers so a single carrier outage does not cut the site.</li>
</ul>

<h3>SLA numbers: latency, jitter, loss</h3>
<p>A carrier SLA (service level agreement) is a contract with measured promises. SD-WAN uses three path quality metrics, and you must know them cold:</p>
<dl class="terms">
<dt>Latency</dt><dd>One-way or round-trip delay in milliseconds. Voice wants under 150 ms one-way.</dd>
<dt>Jitter</dt><dd>Variation in delay between packets. Voice and video suffer when jitter is high; target under 30 ms.</dd>
<dt>Packet loss</dt><dd>Percentage of packets that never arrive. Real-time traffic degrades above about 1 percent.</dd>
</dl>
<p>The lab model uses these default circuit qualities (latency / jitter / loss): <b>Internet 30 ms / 6 ms / 0.3 %</b>, <b>MPLS 20 / 2 / 0.05</b>, <b>LTE 60 / 15 / 1</b>. Read them as: MPLS is the cleanest, the Internet is good but looser, LTE is the weakest. A later module (policy) builds SLA profiles on top of these numbers.</p>

<div class="eg"><p><b>Worked example.</b> A voice SLA profile allows 150 ms latency, 30 ms jitter and 1 percent loss. Test each circuit: Internet 30/6/0.3 passes. MPLS 20/2/0.05 passes. LTE 60/15/1 passes on latency and jitter and just meets 1 percent loss, so it is borderline. If the Internet circuit degrades to 40 ms and 3 percent loss, it fails the loss limit and traffic moves to MPLS.</p></div>

<div class="note"><p><b>Carrier SLA versus SD-WAN SLA.</b> The carrier SLA covers the carrier's own network and is measured by the carrier, usually as monthly averages. The SD-WAN SLA monitor measures the real path from your branch to the remote site, every few seconds, including everything in between. Both matter, but only the second drives path selection.</p></div>

<h3>Why diversity matters</h3>
<p>Two circuits from one carrier that share the same duct or exchange are only partly redundant. For a branch that must not go offline, choose different technologies (fibre Internet plus LTE) or different carriers, and ask the carrier about physical path diversity.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Reading the carrier handoff sheet wrongly: swapping the branch address and the carrier gateway. In 203.0.113.4/30 the gateway is .5 and your device is .6. (2) Using the carrier's /30 network address (.4) or broadcast (.7) as a host address. (3) Forgetting that the MPLS circuit does not carry Internet traffic, so a default route does not belong in the MPLS router.</p></div>
<div class="exam"><p><b>Exam trap.</b> A "down" circuit and a "high-loss" circuit are different failures. Down: the interface or carrier is dead and the tunnel goes down. High loss: the tunnel stays up but the SLA monitor reports violations. Only policy can react to the second.</p></div>

<div class="scn"><h4>The carrier says it is fine</h4><p>A Bengaluru branch kept losing video calls every evening. The Internet circuit looked up and the carrier's dashboard showed 100 percent availability. The SD-WAN SLA monitor, however, recorded loss rising to 4 percent from 7 pm to 9 pm because the residential-grade broadband was congested. The company added an LTE-based second path and moved voice onto MPLS in the evening.</p><p><b>Lesson:</b> availability is not quality. SD-WAN measures quality per path and acts on it.</p></div>

<div class="iv"><p class="q">"Why would a company keep MPLS if SD-WAN works over broadband?"</p><p>Strong answer: MPLS gives carrier-backed, predictable latency and loss and QoS for critical applications like voice and ERP. Many companies run hybrid: a smaller MPLS for critical traffic, broadband for bulk and cloud, LTE as backup. Add that SD-WAN lets them shrink, not necessarily eliminate, MPLS when the SLA data proves broadband is good enough.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Internet is cheap and flexible without an SLA; MPLS is private with an SLA; LTE/5G is quick backup with weaker quality.</li>
<li>Know the handoff, demarcation point, PE/CE roles and the /30 address plan for each circuit.</li>
<li>Latency, jitter and loss are the three metrics; MPLS is cleanest, LTE weakest.</li>
<li>Carrier availability does not equal application quality.</li>
<li>Design for diversity: different technologies or carriers.</li>
</ul></div>
`,hi:`
<p>SD-WAN utna hi achha hota hai jitne achhe uske neeche ke circuits. Jo network engineer samajhta hai ki carrier actually kya deliver karta hai, responsibility kahan khatam hoti hai aur contract ke numbers ka matlab kya hai, woh sirf controller screens jaanne wale engineer se tickets tez solve karta hai.</p>

<h3>Analogy: sadak, railway aur flight</h3>
<p>Do shehron ke beech jaane ke liye aap public highway par gaadi chala sakte ho (sasta, entry free, travel time traffic ke hisaab se badalta hai), reserved railway coach le sakte ho (zyada paisa, timetable par chalta hai, seat guaranteed), ya last resort ke liye mobile hotspot rakh sakte ho. WAN transports bhi aise hi hain: <b>Internet</b> public highway hai, <b>MPLS</b> reserved coach hai, <b>LTE/5G</b> backup hai jo jahan tower hai wahan kaam karta hai.</p>

<h3>Is course ke teen transports</h3>
<table class="cmp"><tr><th>Transport</th><th>Carrier kya deta hai</th><th>Strength</th><th>Weakness</th></tr>
<tr><td><b>Internet</b> (broadband, dedicated Internet access)</td><td>Public IP, gateway, poore Internet ka access</td><td>Sasta, order jaldi, high bandwidth, local breakout enable karta hai</td><td>End-to-end SLA nahi; quality din ke time ke saath badalti hai</td></tr>
<tr><td><b>MPLS</b> (private WAN)</td><td>Carrier ke andar private routed network; QoS classes</td><td>Predictable latency aur loss, carrier SLA</td><td>Per Mbps mehenga, provision slow, direct Internet nahi</td></tr>
<tr><td><b>LTE / 5G</b></td><td>Modem ya SIM se mobile data</td><td>Minutes mein chalu, backup ya remote sites ke liye great</td><td>Zyada latency, jitter aur loss; data caps; address aksar shared (CGNAT)</td></tr>
</table>
<p><b>MPLS</b> (Multiprotocol Label Switching) carrier ke andar chhote labels se packets forward karta hai. Customer ke roop mein aap labels nahi dekhte; aap private IP network dekhte ho. Carrier ka edge router <b>PE</b> (provider edge) hai aur aapka router <b>CE</b> (customer edge). PE aur CE ke beech aapko aam taur par chhota point-to-point subnet milta hai aur static route ya BGP.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Teen transports wali branch">
<rect x="20" y="85" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="75" y="108" text-anchor="middle" class="svg-ink" font-size="13">Branch1 VOS</text><text x="75" y="125" text-anchor="middle" class="svg-muted" font-size="11">Delhi, site 101</text>
<ellipse cx="320" cy="40" rx="90" ry="24" fill="#ddd6fe"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="13">Internet</text>
<ellipse cx="320" cy="110" rx="90" ry="24" fill="#fed7aa"/><text x="320" y="115" text-anchor="middle" class="svg-ink" font-size="13">MPLS</text>
<ellipse cx="320" cy="180" rx="90" ry="24" fill="#bae6fd"/><text x="320" y="185" text-anchor="middle" class="svg-ink" font-size="13">LTE carrier</text>
<rect x="510" y="85" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="565" y="108" text-anchor="middle" class="svg-ink" font-size="13">Controller</text><text x="565" y="125" text-anchor="middle" class="svg-muted" font-size="11">Mumbai headend</text>
<line x1="130" y1="100" x2="235" y2="45" stroke="#64748b"/><line x1="130" y1="110" x2="230" y2="110" stroke="#64748b"/><line x1="130" y1="120" x2="235" y2="175" stroke="#64748b"/>
<line x1="405" y1="45" x2="510" y2="100" stroke="#64748b"/><line x1="410" y1="110" x2="510" y2="110" stroke="#64748b"/><line x1="405" y1="175" x2="510" y2="120" stroke="#64748b" stroke-dasharray="4"/>
<text x="180" y="62" class="svg-muted" font-size="11">vni-0/0</text><text x="170" y="104" class="svg-muted" font-size="11">vni-0/1</text><text x="180" y="168" class="svg-muted" font-size="11">vni-0/2</text>
</svg><p class="cap">Har transport apne branch interface par land karta hai. LTE headend tak Internet ke raaste pahunchta hai (dashed), jaise course topology mein.</p></div>

<h3>Circuit vocabulary jo aap sunoge</h3>
<ul>
<li><b>Circuit:</b> ek site tak ek carrier service, order number (circuit ID) ke saath. Tickets mein ise quote karo.</li>
<li><b>Handoff:</b> woh physical aur logical interface jahan carrier service aapko deliver karta hai. Jaise "Ethernet handoff, 1 Gbps, single VLAN, /30 subnet".</li>
<li><b>Demarc:</b> demarcation point jahan carrier ki responsibility khatam aur aapki shuru hoti hai. Handoff ke carrier side ki har cheez carrier ko fix karni hai.</li>
<li><b>/30 subnet:</b> chaar addresses ka block jismein do usable hosts hote hain, point-to-point link ke liye ideal. Lab mein Delhi ka Internet circuit 203.0.113.4/30 hai: carrier .5, branch .6.</li>
<li><b>Last mile:</b> carrier building aur aapke office ke beech ka access link.</li>
<li><b>Dual carrier:</b> alag providers ke do circuits, taaki ek carrier outage site ko na kaate.</li>
</ul>

<h3>SLA numbers: latency, jitter, loss</h3>
<p>Carrier SLA (service level agreement) measured promises wala contract hai. SD-WAN teen path quality metrics use karta hai, aur aapko yeh ratte yaad hone chahiye:</p>
<dl class="terms">
<dt>Latency</dt><dd>One-way ya round-trip delay milliseconds mein. Voice ko one-way 150 ms se kam chahiye.</dd>
<dt>Jitter</dt><dd>Packets ke beech delay ka variation. Jitter high ho to voice aur video suffer karte hain; target 30 ms se kam.</dd>
<dt>Packet loss</dt><dd>Un packets ka percentage jo kabhi pahunchte nahi. Real-time traffic lagbhag 1 percent ke upar degrade hota hai.</dd>
</dl>
<p>Lab model in default circuit qualities ko use karta hai (latency / jitter / loss): <b>Internet 30 ms / 6 ms / 0.3 %</b>, <b>MPLS 20 / 2 / 0.05</b>, <b>LTE 60 / 15 / 1</b>. Aise padho: MPLS sabse clean hai, Internet achha lekin loose hai, LTE sabse weak hai. Aage ka module (policy) in numbers ke upar SLA profiles banata hai.</p>

<div class="eg"><p><b>Worked example.</b> Voice SLA profile 150 ms latency, 30 ms jitter aur 1 percent loss allow karta hai. Har circuit test karo: Internet 30/6/0.3 pass. MPLS 20/2/0.05 pass. LTE 60/15/1 latency aur jitter par pass aur 1 percent loss bas meet karta hai, isliye borderline hai. Agar Internet circuit 40 ms aur 3 percent loss par degrade ho jaye, to woh loss limit fail karta hai aur traffic MPLS par chala jaata hai.</p></div>

<div class="note"><p><b>Carrier SLA versus SD-WAN SLA.</b> Carrier SLA carrier ke apne network ko cover karta hai aur carrier measure karta hai, aam taur par monthly averages mein. SD-WAN SLA monitor aapki branch se remote site tak ka real path measure karta hai, har kuch seconds mein, beech ki har cheez ke saath. Dono matter karte hain, lekin sirf doosra path selection chalata hai.</p></div>

<h3>Diversity kyun matter karti hai</h3>
<p>Ek hi carrier ke do circuits jo same duct ya exchange share karte hain sirf partly redundant hote hain. Jis branch ko offline nahi hona, uske liye alag technologies (fibre Internet plus LTE) ya alag carriers choose karo, aur carrier se physical path diversity ke baare mein poochho.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Carrier handoff sheet galat padhna: branch address aur carrier gateway ko ulta kar dena. 203.0.113.4/30 mein gateway .5 hai aur aapka device .6. (2) Carrier ke /30 ka network address (.4) ya broadcast (.7) host address ki tarah use karna. (3) Bhool jaana ki MPLS circuit Internet traffic nahi le jaata, isliye MPLS router mein default route nahi hoti.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Down" circuit aur "high-loss" circuit alag failures hain. Down: interface ya carrier dead hai aur tunnel down ho jaata hai. High loss: tunnel up rehta hai lekin SLA monitor violations report karta hai. Dusre par sirf policy react kar sakti hai.</p></div>

<div class="scn"><h4>Carrier kehta hai sab theek hai</h4><p>Bengaluru ki ek branch ki video calls har shaam toot jaati thi. Internet circuit up dikhta tha aur carrier ka dashboard 100 percent availability dikhata tha. Lekin SD-WAN SLA monitor ne shaam 7 se 9 baje tak loss 4 percent tak badhta record kiya kyunki residential-grade broadband congested tha. Company ne LTE-based doosra path joda aur shaam ko voice ko MPLS par move kar diya.</p><p><b>Seekh:</b> availability quality nahi hai. SD-WAN har path ki quality measure karta hai aur uspar act karta hai.</p></div>

<div class="iv"><p class="q">"Agar SD-WAN broadband par chalta hai to company MPLS kyun rakhegi?"</p><p>Strong answer: MPLS carrier-backed, predictable latency aur loss aur voice aur ERP jaisi critical applications ke liye QoS deta hai. Kai companies hybrid chalati hain: critical traffic ke liye chhota MPLS, bulk aur cloud ke liye broadband, backup ke liye LTE. Jodo ki SD-WAN unhe MPLS shrink karne deta hai, zaroori nahi ki eliminate, jab SLA data prove kare ki broadband kaafi achha hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Internet sasta aur flexible hai bina SLA ke; MPLS private hai SLA ke saath; LTE/5G quick backup hai weaker quality ke saath.</li>
<li>Har circuit ke liye handoff, demarcation point, PE/CE roles aur /30 address plan jaano.</li>
<li>Latency, jitter aur loss teen metrics hain; MPLS sabse clean, LTE sabse weak.</li>
<li>Carrier availability application quality ke barabar nahi hai.</li>
<li>Diversity ke liye design karo: alag technologies ya carriers.</li>
</ul></div>
`}};export{e as default};