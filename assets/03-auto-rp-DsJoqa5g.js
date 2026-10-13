var e={id:`auto-rp`,h:{en:`Auto-RP: candidate RPs, the mapping agent and the listener`,hi:`Auto-RP: candidate RPs, mapping agent aur listener`},body:{en:`
<p>Typing the RP on every router does not scale. <b>Auto-RP</b> is the dynamic method that Cisco created before the standard BSR existed. Routers learn the RP by listening to two special multicast groups. It still runs in many enterprise networks, so you must understand it and its famous trap.</p>

<h3>Two roles and two groups</h3>
<p>Think of an election in a housing society. Candidates put up posters saying "I want to be the committee head". One neutral officer collects the posters, decides, and prints one notice for the whole society. In Auto-RP:</p>
<ul>
<li>A <b>candidate RP</b> announces "I am willing to be the RP for these groups" to the group <code>224.0.1.39</code> (the announce group), every 60 seconds by default.</li>
<li>The <b>mapping agent</b> listens to 224.0.1.39, picks one RP per group range (the one with the <b>highest IP address</b> if several offer the same range), and tells everybody the result on <code>224.0.1.40</code> (the discovery group), every 60 seconds.</li>
<li>Every ordinary router listens to 224.0.1.40 and installs the mapping.</li>
</ul>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Auto-RP message flow">
<rect x="20" y="70" width="130" height="60" rx="8" fill="#fde68a"/><text x="85" y="95" text-anchor="middle" class="svg-ink" font-size="13">R2 candidate RP</text><text x="85" y="114" text-anchor="middle" class="svg-muted" font-size="12">Loopback0 2.2.2.2</text>
<rect x="255" y="70" width="130" height="60" rx="8" fill="#ddd6fe"/><text x="320" y="95" text-anchor="middle" class="svg-ink" font-size="13">R3 mapping agent</text><text x="320" y="114" text-anchor="middle" class="svg-muted" font-size="12">Loopback0 3.3.3.3</text>
<rect x="490" y="70" width="130" height="60" rx="8" fill="#bae6fd"/><text x="555" y="95" text-anchor="middle" class="svg-ink" font-size="13">R4, R5 ... others</text><text x="555" y="114" text-anchor="middle" class="svg-muted" font-size="12">learn the mapping</text>
<line x1="150" y1="100" x2="255" y2="100" stroke="#64748b" stroke-width="2"/><text x="202" y="90" text-anchor="middle" class="svg-accent" font-size="12">224.0.1.39</text><text x="202" y="120" text-anchor="middle" class="svg-muted" font-size="12">announce</text>
<line x1="385" y1="100" x2="490" y2="100" stroke="#64748b" stroke-width="2"/><text x="437" y="90" text-anchor="middle" class="svg-accent" font-size="12">224.0.1.40</text><text x="437" y="120" text-anchor="middle" class="svg-muted" font-size="12">discovery</text>
<text x="320" y="180" text-anchor="middle" class="svg-ink" font-size="13">The candidate RP and the mapping agent can be the same router or different ones.</text>
</svg><p class="cap">Announce goes to the agent, discovery goes from the agent to everyone.</p></div>

<h3>The chicken-and-egg problem</h3>
<p>Here is the trap. In sparse mode, a router can forward multicast only when it knows the RP for the group. But 224.0.1.39 and 224.0.1.40 are themselves multicast groups, and the router learns the RP <i>from them</i>. To get the RP it needs the RP. Auto-RP solves this by sending these two groups in <b>dense mode</b>: flood everywhere, no RP needed.</p>
<p>Modern designs run sparse mode only, so a router must be told to carry the two dense groups:</p>
<pre class="code"><span class="c">! on every router in the path (not only at the ends)</span>
ip pim autorp listener</pre>
<p>The old alternative is <code>ip pim sparse-dense-mode</code> on the interfaces, which uses dense mode for any group without an RP. Most engineers avoid that because a failed RP then makes <i>all</i> traffic flood. In the simulator, a router that has neither a listener nor a dense interface does not forward the two groups, so everything behind it never learns an RP.</p>

<h3>Configuration</h3>
<pre class="code"><span class="c">! R2: candidate RP</span>
ip pim send-rp-announce Loopback0 scope 8
<span class="c">! R3: mapping agent</span>
ip pim send-rp-discovery Loopback0 scope 8
<span class="c">! every router, including R2 and R3</span>
ip pim autorp listener</pre>
<p>The <b>scope</b> is a TTL for the messages. Scope 8 means the message may travel eight PIM hops. A scope that is too small means the announcement never reaches the agent or the discovery never reaches the far routers. To limit an RP to one range, add <code>group-list</code> with an ACL:</p>
<pre class="code">access-list 10 permit 239.20.0.0 0.0.255.255
ip pim send-rp-announce Loopback0 scope 8 group-list 10</pre>
<p>Without <code>group-list</code> the candidate offers <code>224.0.0.0/4</code>. If you give the interface address of the agent, use a loopback with PIM sparse mode; the address you announce must be reachable by every router.</p>

<h3>Verify</h3>
<pre class="out">R3#show ip pim rp mapping
PIM Group-to-RP Mappings
<span class="hl">This system is an RP-mapping agent (Loopback0)</span>

Group(s) 239.20.0.0/16
  RP 2.2.2.2 (?), v2v1
    Info source: 3.3.3.3 (?), elected via Auto-RP
         Uptime: 00:00:30, expires: 00:02:30

R5#show ip pim rp mapping
PIM Group-to-RP Mappings

Group(s) 239.20.0.0/16
  RP 2.2.2.2 (?), v2v1
    <span class="hl">Info source: 3.3.3.3 (?), elected via Auto-RP</span>
         Uptime: 00:00:30, expires: 00:02:30</pre>
<p>"Info source" on a normal router is the mapping agent. If two agents exist, routers use the one with the highest address. If the mapping agent dies, the mappings expire after a few minutes and then all routers lose the RP (a single agent is a single point of failure, so production networks run two).</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Listener on the agent and on the ends but not on the middle router. (2) Scope too small. (3) Announcing a loopback that has no <code>ip pim sparse-mode</code>. (4) Trying to make the candidate RP and the agent different but forgetting that both still need the listener.</p></div>
<div class="exam"><p><b>Exam trap.</b> Auto-RP is Cisco-specific and uses <b>224.0.1.39</b> (announce, RP to agent) and <b>224.0.1.40</b> (discovery, agent to all). Do not mix them up. If a candidate RP and a static RP both exist, the learned Auto-RP mapping wins unless the static line uses <code>override</code>.</p></div>

<div class="scn"><h4>Lab 2 walk-through: the chain that stopped at R3</h4><p>In <b>mq-rp-autorp</b> five routers sit in a chain. You configure R2 as the candidate RP and R3 as the agent. R3 learns the RP at once, but R4 and R5 show an empty mapping. Why? Their neighbour R3 forwards the discovery group only where a listener exists. After <code>ip pim autorp listener</code> on every router the mapping appears on R4 and R5 and the stream flows from STUDIO to CLASSROOM. The final task restricts R2 to 239.20.0.0/16; afterwards 239.99.9.9 has no RP anywhere, and that is the correct result.</p><p><b>Lesson:</b> when the far end has no RP but the agent has, find the first router without a listener.</p></div>

<div class="iv"><p class="q">"Explain the Auto-RP chicken-and-egg problem and how you fix it."</p><p>Strong answer: Auto-RP distributes the RP mapping using multicast groups 224.0.1.39 and 224.0.1.40, but in sparse mode a router needs an RP to forward multicast, so it cannot receive the groups that tell it the RP. Fix with <code>ip pim autorp listener</code> on every router in the path (preferred) or sparse-dense mode. Add that the mapping agent should be redundant.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Candidate RPs announce on 224.0.1.39; the mapping agent floods the result on 224.0.1.40.</li>
<li>The agent picks the highest-address RP per range; routers use the agent with the highest address.</li>
<li>Both groups are dense; use <code>ip pim autorp listener</code> on every router in the path.</li>
<li><code>scope</code> is a TTL; too small and the messages stop early.</li>
<li><code>group-list</code> restricts the ranges a candidate offers.</li>
</ul></div>
`,hi:`
<p>Har router par RP type karna scale nahi karta. <b>Auto-RP</b> woh dynamic method hai jo Cisco ne standard BSR ke aane se pehle banaya tha. Routers do special multicast groups sunkar RP seekhte hain. Yeh abhi bhi bahut enterprise networks mein chalta hai, isliye aapko ise aur iske famous trap ko samajhna chahiye.</p>

<h3>Do roles aur do groups</h3>
<p>Housing society ke election ki kalpana karo. Candidates poster lagate hain "main committee head banna chahta hoon". Ek neutral officer posters collect karta hai, decide karta hai, aur poori society ke liye ek notice chhapta hai. Auto-RP mein:</p>
<ul>
<li><b>Candidate RP</b> group <code>224.0.1.39</code> (announce group) par announce karta hai "main in groups ka RP banne ko taiyaar hoon", default mein har 60 seconds mein.</li>
<li><b>Mapping agent</b> 224.0.1.39 sunta hai, har group range ke liye ek RP chunta hai (agar kai RPs same range offer karein to <b>sabse high IP address</b> wala), aur result sabko <code>224.0.1.40</code> (discovery group) par batata hai, har 60 seconds mein.</li>
<li>Har aam router 224.0.1.40 sunta hai aur mapping install kar leta hai.</li>
</ul>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Auto-RP message flow">
<rect x="20" y="70" width="130" height="60" rx="8" fill="#fde68a"/><text x="85" y="95" text-anchor="middle" class="svg-ink" font-size="13">R2 candidate RP</text><text x="85" y="114" text-anchor="middle" class="svg-muted" font-size="12">Loopback0 2.2.2.2</text>
<rect x="255" y="70" width="130" height="60" rx="8" fill="#ddd6fe"/><text x="320" y="95" text-anchor="middle" class="svg-ink" font-size="13">R3 mapping agent</text><text x="320" y="114" text-anchor="middle" class="svg-muted" font-size="12">Loopback0 3.3.3.3</text>
<rect x="490" y="70" width="130" height="60" rx="8" fill="#bae6fd"/><text x="555" y="95" text-anchor="middle" class="svg-ink" font-size="13">R4, R5 ... baaki</text><text x="555" y="114" text-anchor="middle" class="svg-muted" font-size="12">mapping seekhte hain</text>
<line x1="150" y1="100" x2="255" y2="100" stroke="#64748b" stroke-width="2"/><text x="202" y="90" text-anchor="middle" class="svg-accent" font-size="12">224.0.1.39</text><text x="202" y="120" text-anchor="middle" class="svg-muted" font-size="12">announce</text>
<line x1="385" y1="100" x2="490" y2="100" stroke="#64748b" stroke-width="2"/><text x="437" y="90" text-anchor="middle" class="svg-accent" font-size="12">224.0.1.40</text><text x="437" y="120" text-anchor="middle" class="svg-muted" font-size="12">discovery</text>
<text x="320" y="180" text-anchor="middle" class="svg-ink" font-size="13">Candidate RP aur mapping agent same router ya alag routers ho sakte hain.</text>
</svg><p class="cap">Announce agent ke paas jaata hai, discovery agent se sabke paas jaata hai.</p></div>

<h3>Chicken-and-egg problem</h3>
<p>Yeh hai trap. Sparse mode mein router multicast tabhi forward kar sakta hai jab use group ka RP pata ho. Lekin 224.0.1.39 aur 224.0.1.40 khud multicast groups hain, aur router RP <i>unhi se</i> seekhta hai. RP paane ke liye RP chahiye. Auto-RP ise in dono groups ko <b>dense mode</b> mein bhej kar solve karta hai: har jagah flood, RP ki zaroorat nahi.</p>
<p>Modern designs sirf sparse mode chalate hain, isliye router ko batana padta hai ki dono dense groups carry kare:</p>
<pre class="code"><span class="c">! path ke har router par (sirf ends par nahi)</span>
ip pim autorp listener</pre>
<p>Purana alternative interfaces par <code>ip pim sparse-dense-mode</code> hai, jo bina RP wale group ke liye dense mode use karta hai. Zyada tar engineers ise avoid karte hain kyunki RP fail hone par <i>saara</i> traffic flood hone lagta hai. Simulator mein jis router ke paas na listener hai na dense interface, woh dono groups forward nahi karta, isliye uske peeche koi bhi RP nahi seekhta.</p>

<h3>Configuration</h3>
<pre class="code"><span class="c">! R2: candidate RP</span>
ip pim send-rp-announce Loopback0 scope 8
<span class="c">! R3: mapping agent</span>
ip pim send-rp-discovery Loopback0 scope 8
<span class="c">! har router, R2 aur R3 samet</span>
ip pim autorp listener</pre>
<p><b>Scope</b> messages ka TTL hai. Scope 8 ka matlab message aath PIM hops tak ja sakta hai. Bahut chhota scope matlab announcement agent tak nahi pahunchta ya discovery door ke routers tak nahi pahunchta. RP ko ek range tak limit karne ke liye ACL ke saath <code>group-list</code> jodo:</p>
<pre class="code">access-list 10 permit 239.20.0.0 0.0.255.255
ip pim send-rp-announce Loopback0 scope 8 group-list 10</pre>
<p><code>group-list</code> ke bina candidate <code>224.0.0.0/4</code> offer karta hai. Jo address announce karte ho woh loopback ho jis par PIM sparse mode hai; woh address har router se reachable hona chahiye.</p>

<h3>Verify</h3>
<pre class="out">R3#show ip pim rp mapping
PIM Group-to-RP Mappings
<span class="hl">This system is an RP-mapping agent (Loopback0)</span>

Group(s) 239.20.0.0/16
  RP 2.2.2.2 (?), v2v1
    Info source: 3.3.3.3 (?), elected via Auto-RP
         Uptime: 00:00:30, expires: 00:02:30

R5#show ip pim rp mapping
PIM Group-to-RP Mappings

Group(s) 239.20.0.0/16
  RP 2.2.2.2 (?), v2v1
    <span class="hl">Info source: 3.3.3.3 (?), elected via Auto-RP</span>
         Uptime: 00:00:30, expires: 00:02:30</pre>
<p>Aam router par "Info source" mapping agent hota hai. Agar do agents hon, to routers sabse high address wale agent ko use karte hain. Agar mapping agent mar jaye, mappings kuch minutes baad expire ho jaate hain aur phir saare routers RP kho dete hain (ek agent single point of failure hai, isliye production networks do chalate hain).</p>

<div class="warn"><p><b>Common galtiyan.</b> (1) Listener agent par aur ends par hai par beech ke router par nahi. (2) Scope bahut chhota. (3) Aisa loopback announce karna jis par <code>ip pim sparse-mode</code> nahi. (4) Candidate RP aur agent alag banana par yeh bhool jaana ki dono ko phir bhi listener chahiye.</p></div>
<div class="exam"><p><b>Exam trap.</b> Auto-RP Cisco-specific hai aur <b>224.0.1.39</b> (announce, RP se agent) aur <b>224.0.1.40</b> (discovery, agent se sabko) use karta hai. Dono ko mix mat karo. Agar candidate RP aur static RP dono hon, to learned Auto-RP mapping jeetta hai jab tak static line <code>override</code> na use kare.</p></div>

<div class="scn"><h4>Lab 2 walk-through: woh chain jo R3 par ruk gayi</h4><p><b>mq-rp-autorp</b> mein paanch routers chain mein hain. Aap R2 ko candidate RP aur R3 ko agent configure karte ho. R3 turant RP seekh leta hai, lekin R4 aur R5 khaali mapping dikhate hain. Kyun? Unka neighbour R3 discovery group wahin forward karta hai jahan listener ho. Har router par <code>ip pim autorp listener</code> ke baad R4 aur R5 par mapping aa jaati hai aur stream STUDIO se CLASSROOM tak chalti hai. Aakhri task R2 ko 239.20.0.0/16 tak restrict karta hai; uske baad 239.99.9.9 ka kahin koi RP nahi, aur yahi sahi result hai.</p><p><b>Seekh:</b> jab door ke end par RP nahi hai par agent ke paas hai, to pehla woh router dhoondho jisme listener nahi.</p></div>

<div class="iv"><p class="q">"Auto-RP ka chicken-and-egg problem samjhao aur kaise fix karte ho."</p><p>Strong answer: Auto-RP RP mapping multicast groups 224.0.1.39 aur 224.0.1.40 se distribute karta hai, lekin sparse mode mein router ko multicast forward karne ke liye RP chahiye, isliye woh un groups ko receive nahi kar sakta jo use RP batate hain. Fix: path ke har router par <code>ip pim autorp listener</code> (preferred) ya sparse-dense mode. Yeh bhi jodo ki mapping agent redundant hona chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Candidate RPs 224.0.1.39 par announce karte hain; mapping agent result 224.0.1.40 par flood karta hai.</li>
<li>Agent har range ke liye sabse high address wala RP chunta hai; routers sabse high address wale agent ko use karte hain.</li>
<li>Dono groups dense hain; path ke har router par <code>ip pim autorp listener</code> use karo.</li>
<li><code>scope</code> TTL hai; bahut chhota ho to messages beech mein ruk jaate hain.</li>
<li><code>group-list</code> candidate ki offered ranges ko restrict karta hai.</li>
</ul></div>
`}};export{e as default};