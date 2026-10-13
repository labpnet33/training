var e={id:`overview`,h:{en:`High availability on Junos: what you will learn and the big picture`,hi:`Junos par high availability: kya seekhoge aur big picture`},body:{en:`
<p><b>What you will learn in this module.</b> You will learn how a Junos network keeps forwarding when something breaks: a cable, a gateway router, a Routing Engine or a whole switch. We cover link aggregation with LACP (<code>ae</code> interfaces), VRRP with tracking and failover, graceful restart, graceful Routing Engine switchover (GRES), nonstop routing (NSR) and nonstop bridging (NSB), BFD for fast failure detection, and Virtual Chassis with in-service upgrades. These are the high-availability objectives of JNCIS-ENT (JN0-351 / JN0-352).</p>
<p><b>Prerequisites.</b> You should know the Junos CLI (candidate, commit, <code>show | compare</code>), basic VLANs and trunks on EX switches, static routes, and what an OSPF adjacency is. Earlier modules in this track cover those.</p>

<h3>Analogy: a hospital with spare everything</h3>
<p>A good hospital never depends on a single thing. It has two power feeds, a backup generator, two doctors on call, and more than one door into the emergency room. High availability (HA) in networking is the same discipline: for each part that can fail, a second part is ready and the switch from one to the other is automatic and quick.</p>
<ul>
<li><b>Two doors to the ward</b> is a <b>LAG</b>: several cables act as one wide door, and the ward stays open if one door jams.</li>
<li><b>Two receptionists sharing one desk number</b> is <b>VRRP</b>: patients dial one number, whichever receptionist is on duty answers.</li>
<li><b>A surgeon with a fully briefed understudy</b> is <b>GRES with NSR</b>: if the surgeon collapses mid-operation, the understudy already knows everything.</li>
<li><b>A smoke alarm</b> is <b>BFD</b>: it does not fix anything but it shouts within a fraction of a second.</li>
<li><b>Two buildings run as one hospital</b> is <b>Virtual Chassis</b>.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Layers of high availability">
<rect x="20" y="20" width="600" height="40" rx="8" fill="#bae6fd"/><text x="320" y="46" text-anchor="middle" class="svg-ink" font-size="13">Link level: LAG + LACP (survive a cable or port failure)</text>
<rect x="20" y="70" width="600" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="96" text-anchor="middle" class="svg-ink" font-size="13">Gateway level: VRRP + tracking (survive a router failure)</text>
<rect x="20" y="120" width="600" height="40" rx="8" fill="#ddd6fe"/><text x="320" y="146" text-anchor="middle" class="svg-ink" font-size="13">Control-plane level: GR, GRES, NSR, NSB (survive a Routing Engine failure)</text>
<rect x="20" y="170" width="600" height="40" rx="8" fill="#fde68a"/><text x="320" y="196" text-anchor="middle" class="svg-ink" font-size="13">Device level: BFD detection, Virtual Chassis, ISSU / NSSU upgrades</text>
</svg><p class="cap">Each layer protects against a different failure. A real design uses several layers together.</p></div>

<h3>Two numbers that define HA</h3>
<p><b>Detection time</b> is how long it takes the network to notice a failure. <b>Recovery time</b> is how long until traffic flows again after it noticed. A good design shortens both. LACP fast timers, VRRP advertisements and BFD mostly shorten detection; GRES, NSR and VC mostly shorten recovery.</p>

<h3>The module plan</h3>
<table class="cmp"><tr><th>Chapter</th><th>Topic</th><th>Lab</th></tr>
<tr><td>2</td><td>Building an ae interface</td><td>LACP bundle between two EX switches</td></tr>
<tr><td>3</td><td>LACP in depth</td><td>same lab</td></tr>
<tr><td>4</td><td>VRRP basics</td><td>VRRP with tracking</td></tr>
<tr><td>5</td><td>VRRP tracking and failover</td><td>same lab</td></tr>
<tr><td>6</td><td>GR, GRES, NSR, NSB</td><td>concept and commit rules</td></tr>
<tr><td>7</td><td>BFD, Virtual Chassis, ISSU</td><td>concept and config</td></tr>
<tr><td>8</td><td>Troubleshooting workflow</td><td>the bundle that will not come up</td></tr>
<tr><td>9</td><td>Summary and exam checklist</td><td></td></tr></table>

<div class="eg"><p><b>Worked example.</b> A Nashik office has one floor switch AS1 and one distribution switch DS1. A single cable would be a single point of failure and a 1 Gbps bottleneck. Two cables in an LACP bundle give 2 Gbps and survive the loss of one cable. On top, two routers share the gateway address with VRRP, so the loss of one router costs only a few seconds. That is HA from the bottom up.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Assuming a redundant design is automatically a working one. Redundancy only helps if failures are detected, the standby is configured identically, and you have tested a failover. A second link that is not in the bundle forwards nothing useful.</p></div>
<div class="exam"><p><b>Exam trap.</b> Learn which feature protects against which failure. LACP protects links, VRRP protects the gateway, GRES/NSR protect the Routing Engine, BFD only <i>detects</i> faster.</p></div>

<div class="scn"><h4>The Friday power cut at the branch</h4><p>A clinic lost the power supply in its gateway router at 4 pm. Because VRRP was configured with the second router at priority 100, the second router became master within about three seconds. Doctors saw the electronic records freeze briefly and then continue. Management only learned of the outage from the alert, not from complaints.</p><p><b>Lesson:</b> HA is measured by what users notice, not by what the network engineers know.</p></div>

<div class="iv"><p class="q">"What is high availability and how would you build it for an office network?"</p><p>High availability removes single points of failure and makes failover fast and automatic. I bundle uplinks with LACP, give hosts a redundant gateway with VRRP and tracking, enable graceful restart or NSR where the hardware has two Routing Engines, use BFD for fast detection, and test each failover. I also mention monitoring so a silent failure does not hide.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>HA means a second component plus automatic, fast switchover.</li>
<li>LAG protects links, VRRP the gateway, GRES/NSR the Routing Engine, VC the whole switch.</li>
<li>BFD detects failures quickly but does not recover by itself.</li>
<li>Detection time and recovery time are the two numbers that matter.</li>
<li>Always test the failover; untested redundancy is a hope, not a design.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap seekhoge ki Junos network tab bhi forward karta rehta hai jab kuch toot jaata hai: cable, gateway router, Routing Engine ya poora switch. Hum cover karenge LACP ke saath link aggregation (<code>ae</code> interfaces), tracking aur failover ke saath VRRP, graceful restart, graceful Routing Engine switchover (GRES), nonstop routing (NSR) aur nonstop bridging (NSB), tez failure detection ke liye BFD, aur in-service upgrades ke saath Virtual Chassis. Yeh JNCIS-ENT (JN0-351 / JN0-352) ke high-availability objectives hain.</p>
<p><b>Prerequisites.</b> Aapko Junos CLI (candidate, commit, <code>show | compare</code>), EX switches par basic VLANs aur trunks, static routes, aur OSPF adjacency kya hoti hai yeh aana chahiye. Is track ke pichhle modules yeh cover karte hain.</p>

<h3>Analogy: hospital jisme har cheez ka spare hai</h3>
<p>Achha hospital kisi ek cheez par depend nahi karta. Uske paas do power feeds, backup generator, do on-call doctors, aur emergency room mein jaane ke ek se zyada darwaze hote hain. Networking mein high availability (HA) wahi discipline hai: jo bhi hissa fail ho sakta hai uska doosra hissa tayyar rehta hai aur ek se doosre par switch automatic aur tez hota hai.</p>
<ul>
<li><b>Ward ke do darwaze</b> matlab <b>LAG</b>: kai cables ek chauda darwaza ban jaate hain, aur ek jam ho to ward khula rehta hai.</li>
<li><b>Do receptionists ek hi desk number share karte hain</b> matlab <b>VRRP</b>: patients ek number milate hain, jo receptionist duty par hai woh uthata hai.</li>
<li><b>Surgeon ke saath poori tarah briefed understudy</b> matlab <b>GRES with NSR</b>: surgeon operation ke beech gir jaaye to understudy sab pehle se jaanta hai.</li>
<li><b>Smoke alarm</b> matlab <b>BFD</b>: woh kuch theek nahi karta lekin second ke ek hisse mein chillata hai.</li>
<li><b>Do imaarat ek hospital ki tarah chalti hain</b> matlab <b>Virtual Chassis</b>.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="High availability ki layers">
<rect x="20" y="20" width="600" height="40" rx="8" fill="#bae6fd"/><text x="320" y="46" text-anchor="middle" class="svg-ink" font-size="13">Link level: LAG + LACP (cable ya port failure se bachao)</text>
<rect x="20" y="70" width="600" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="96" text-anchor="middle" class="svg-ink" font-size="13">Gateway level: VRRP + tracking (router failure se bachao)</text>
<rect x="20" y="120" width="600" height="40" rx="8" fill="#ddd6fe"/><text x="320" y="146" text-anchor="middle" class="svg-ink" font-size="13">Control-plane level: GR, GRES, NSR, NSB (Routing Engine failure se bachao)</text>
<rect x="20" y="170" width="600" height="40" rx="8" fill="#fde68a"/><text x="320" y="196" text-anchor="middle" class="svg-ink" font-size="13">Device level: BFD detection, Virtual Chassis, ISSU / NSSU upgrades</text>
</svg><p class="cap">Har layer alag failure se bachati hai. Asli design kai layers ek saath use karta hai.</p></div>

<h3>Do numbers jo HA ko define karte hain</h3>
<p><b>Detection time</b> woh waqt hai jo network ko failure notice karne mein lagta hai. <b>Recovery time</b> woh waqt hai jab notice karne ke baad traffic phir chalne tak lagta hai. Achha design dono chhote karta hai. LACP fast timers, VRRP advertisements aur BFD zyadatar detection chhota karte hain; GRES, NSR aur VC zyadatar recovery chhota karte hain.</p>

<h3>Module ka plan</h3>
<table class="cmp"><tr><th>Chapter</th><th>Topic</th><th>Lab</th></tr>
<tr><td>2</td><td>ae interface banana</td><td>Do EX switches ke beech LACP bundle</td></tr>
<tr><td>3</td><td>LACP detail mein</td><td>wahi lab</td></tr>
<tr><td>4</td><td>VRRP basics</td><td>Tracking ke saath VRRP</td></tr>
<tr><td>5</td><td>VRRP tracking aur failover</td><td>wahi lab</td></tr>
<tr><td>6</td><td>GR, GRES, NSR, NSB</td><td>concept aur commit rules</td></tr>
<tr><td>7</td><td>BFD, Virtual Chassis, ISSU</td><td>concept aur config</td></tr>
<tr><td>8</td><td>Troubleshooting workflow</td><td>woh bundle jo up nahi hota</td></tr>
<tr><td>9</td><td>Summary aur exam checklist</td><td></td></tr></table>

<div class="eg"><p><b>Worked example.</b> Nashik office mein ek floor switch AS1 aur ek distribution switch DS1 hai. Ek cable single point of failure aur 1 Gbps ki bottleneck hota. LACP bundle mein do cables 2 Gbps dete hain aur ek cable girne par bhi chalte hain. Uske upar do routers VRRP se gateway address share karte hain, isliye ek router jaane ki keemat sirf kuch seconds hai. Neeche se upar tak yahi HA hai.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Maan lena ki redundant design apne aap working design hai. Redundancy tabhi kaam aati hai jab failures detect hon, standby identical configured ho, aur aapne failover test kiya ho. Jo doosra link bundle mein nahi hai woh kuch kaam ka forward nahi karta.</p></div>
<div class="exam"><p><b>Exam trap.</b> Seekho kaunsa feature kaunse failure se bachata hai. LACP links ko, VRRP gateway ko, GRES/NSR Routing Engine ko bachate hain, BFD sirf tez <i>detect</i> karta hai.</p></div>

<div class="scn"><h4>Branch par Friday ki bijli katauti</h4><p>Ek clinic ke gateway router ki power supply shaam 4 baje chali gayi. VRRP mein doosra router priority 100 par configured tha, isliye lagbhag teen second mein woh master ban gaya. Doctors ne electronic records ko thodi der freeze hote dekha aur phir chalte. Management ko outage ka pata alert se chala, complaints se nahi.</p><p><b>Lesson:</b> HA is baat se napa jaata hai ki users ko kya dikhta hai, is se nahi ki network engineers ko kya pata hai.</p></div>

<div class="iv"><p class="q">"High availability kya hai aur office network ke liye kaise banaoge?"</p><p>High availability single points of failure hatati hai aur failover ko tez aur automatic banati hai. Main uplinks ko LACP se bundle karta hoon, hosts ko VRRP aur tracking se redundant gateway deta hoon, jahan hardware mein do Routing Engines hon wahan graceful restart ya NSR enable karta hoon, tez detection ke liye BFD use karta hoon, aur har failover test karta hoon. Monitoring ka bhi zikr karta hoon taaki silent failure chhupa na rahe.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>HA ka matlab: doosra component plus automatic, tez switchover.</li>
<li>LAG links ko, VRRP gateway ko, GRES/NSR Routing Engine ko, VC poore switch ko bachata hai.</li>
<li>BFD failures tez detect karta hai lekin khud recover nahi karta.</li>
<li>Detection time aur recovery time do zaroori numbers hain.</li>
<li>Failover hamesha test karo; untested redundancy ummeed hai, design nahi.</li>
</ul></div>
`}};export{e as default};