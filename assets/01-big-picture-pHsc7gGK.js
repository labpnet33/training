var e={id:`big-picture`,h:{en:`What you will learn: how a router decides where packets go`,hi:`Aap kya seekhoge: router kaise decide karta hai packets kahan jaayein`},body:{en:`
<p><b>What you will learn in this module.</b> Routing is the heart of every IP network. By the end of these chapters you will explain how a Junos router forwards a packet, read the routing table and the forwarding table, predict which route wins when several exist, and build static, default, discard, reject, floating and IPv6 static routes. These topics belong to the Routing Fundamentals section of the JNCIA-Junos exam (JN0-106) and are the base for everything that follows, including OSPF in the next module.</p>
<p><b>Prerequisites.</b> You should understand IPv4 addresses and subnet masks (for example that 10.1.12.0/30 has two usable addresses), be able to configure an interface address on Junos, and move between operational and configuration mode. Chapter 3 of the earlier module on operational monitoring showed how to read <code>show interfaces terse</code>; we use it here without re-teaching it.</p>

<h3>Analogy: the post office sorting room</h3>
<p>Imagine a post office sorting room. A letter arrives and the clerk reads only the address. He has a book of rules: "anything for Pune goes on truck 3", "anything for Mumbai goes on truck 5", "anything else goes to the central sorting hub". If two rules fit, he uses the more specific one: a rule for "Pune, Kothrud" beats "Pune". If no rule fits and there is no "anything else" rule, the letter is returned or thrown away.</p>
<p>A router is that clerk. The book of rules is the <b>routing table</b>. "Anything else" is the <b>default route</b>. The clerk never phones the sender; he decides on the address alone, and every post office on the way repeats the same decision on its own.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Packet through three routers">
<rect x="10" y="60" width="90" height="50" rx="8" fill="#e2e8f0"/><text x="55" y="82" text-anchor="middle" class="svg-ink" font-size="13">PC1</text><text x="55" y="99" text-anchor="middle" class="svg-muted" font-size="11">192.168.10.10</text>
<rect x="150" y="60" width="90" height="50" rx="8" fill="#bae6fd"/><text x="195" y="82" text-anchor="middle" class="svg-ink" font-size="13">R1</text><text x="195" y="99" text-anchor="middle" class="svg-muted" font-size="11">default route</text>
<rect x="290" y="60" width="90" height="50" rx="8" fill="#ddd6fe"/><text x="335" y="82" text-anchor="middle" class="svg-ink" font-size="13">R2 core</text><text x="335" y="99" text-anchor="middle" class="svg-muted" font-size="11">specific routes</text>
<rect x="430" y="60" width="90" height="50" rx="8" fill="#bbf7d0"/><text x="475" y="82" text-anchor="middle" class="svg-ink" font-size="13">R3</text><text x="475" y="99" text-anchor="middle" class="svg-muted" font-size="11">default route</text>
<rect x="560" y="60" width="75" height="50" rx="8" fill="#e2e8f0"/><text x="597" y="82" text-anchor="middle" class="svg-ink" font-size="13">SRV</text><text x="597" y="99" text-anchor="middle" class="svg-muted" font-size="11">172.16.30.10</text>
<line x1="100" y1="85" x2="150" y2="85" stroke="#64748b" stroke-width="2"/><line x1="240" y1="85" x2="290" y2="85" stroke="#64748b" stroke-width="2"/><line x1="380" y1="85" x2="430" y2="85" stroke="#64748b" stroke-width="2"/><line x1="520" y1="85" x2="560" y2="85" stroke="#64748b" stroke-width="2"/>
<text x="320" y="150" text-anchor="middle" class="svg-accent" font-size="13">Each router decides alone. The reply needs routes too.</text>
<path d="M560 125 Q320 175 100 125" fill="none" stroke="#64748b" stroke-width="1.5" stroke-dasharray="5 4"/>
</svg><p class="cap">The Nagpur static routing lab: PC1 to SRV across R1, R2 and R3, with routes in both directions.</p></div>

<h3>The three labs</h3>
<ul>
<li><b>Static routing across three sites (Nagpur).</b> R1 (branch) and R3 (data centre) get default routes towards the core router R2; R2 gets specific routes to both LANs, plus a safety black hole for 192.168.0.0/16. PC1 (192.168.10.10) must reach SRV (172.16.30.10) and back.</li>
<li><b>Floating static (Surat).</b> R1 reaches the payroll server 172.16.40.10 over a fibre to R3, with a slower backup through R2. You use a qualified next hop so the backup takes over by itself, then cut the fibre to prove it.</li>
<li><b>Preference decides (Kochi).</b> OSPF carries traffic on the fast path, but a forgotten static route to 172.16.60.0/24 with a slow radio link wins because static has preference 5 and OSPF has 10. You fix it with a higher preference so the static becomes a backup.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> PC1 (192.168.10.10) pings SRV (172.16.30.10). PC1 sends to its gateway R1. R1 has no specific route, so it uses 0.0.0.0/0 via 10.1.12.2. R2 has 172.16.30.0/24 via 10.1.23.2 and forwards. R3 owns 172.16.30.0/24 as a directly connected subnet and delivers it. The reply travels back: R3 uses its default route to R2, R2 has 192.168.10.0/24 via 10.1.12.1, R1 delivers. Six routing decisions, each made independently.</p></div>

<div class="note"><p><b>Where to look.</b> The lab devices are Junos routers named R1 to R3, a PC1 and a server SRV. Everything you configure goes under <code>routing-options</code>. Verification is always <code>show route</code> and a ping.</p></div>
<div class="warn"><p><b>Common mistake.</b> Configuring routes in one direction only. The ping goes out, the reply is dropped for lack of a route, and the engineer blames the first router. Always think "forward and return".</p></div>

<div class="scn"><h4>The one-way ping</h4><p>A new branch router was connected and the engineer added a default route on it. Pings from the branch to the head office worked, but nobody at head office could reach the branch printers. The head office router had no route to the branch subnet; replies from head office were being sent to the internet default instead. One static route for the branch LAN on the head-office router fixed everything.</p><p><b>Lesson:</b> a path needs routes in both directions, and every router decides alone.</p></div>

<div class="iv"><p class="q">"What does a router do when it receives a packet?"</p><p>Strong answer: it reads the destination IP, finds all routes whose prefix contains it, picks the longest (most specific) match, then forwards out of that route's interface towards its next hop, decrementing the TTL. No match means the packet is dropped and an ICMP unreachable may be returned. Add that each router repeats this independently.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A router decides on the destination IP alone, using the longest matching route.</li>
<li>The routing table is the rule book; the default route is "anything else".</li>
<li>A working path needs routes in both directions.</li>
<li>Junos static routes live under routing-options; verify with show route and ping.</li>
<li>The labs: static routes, a floating static with qualified-next-hop, and route preference.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Routing har IP network ka dil hai. In chapters ke end tak aap samjha paoge ki Junos router packet ko kaise forward karta hai, routing table aur forwarding table padh paoge, predict kar paoge ki kai routes hon to kaunsa jeetega, aur static, default, discard, reject, floating aur IPv6 static routes bana paoge. Yeh topics JNCIA-Junos exam (JN0-106) ke Routing Fundamentals section ke hain aur aage ki har cheez ka base hain, agle module ke OSPF samet.</p>
<p><b>Prerequisites.</b> Aapko IPv4 addresses aur subnet masks aane chahiye (jaise 10.1.12.0/30 mein do usable addresses hote hain), Junos par interface address configure karna aana chahiye, aur operational aur configuration mode ke beech jaana aana chahiye. Operational monitoring wale pichle module ne <code>show interfaces terse</code> padhna sikhaya tha; yahan hum use dobara nahi sikhate.</p>

<h3>Analogy: post office ka sorting room</h3>
<p>Ek post office ka sorting room socho. Chitthi aati hai aur clerk sirf address padhta hai. Uske paas rules ki kitaab hai: "Pune ka sab truck 3 par", "Mumbai ka sab truck 5 par", "baaki sab central sorting hub ko". Do rules fit hon to woh zyada specific rule use karta hai: "Pune, Kothrud" ka rule "Pune" se jeetega. Koi rule fit na ho aur "baaki sab" wala rule bhi na ho to chitthi wapas ya phek di jaati hai.</p>
<p>Router wahi clerk hai. Rules ki kitaab <b>routing table</b> hai. "Baaki sab" <b>default route</b> hai. Clerk kabhi sender ko phone nahi karta; woh sirf address se faisla leta hai, aur raaste ka har post office wahi faisla apne aap dohrata hai.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Packet through three routers">
<rect x="10" y="60" width="90" height="50" rx="8" fill="#e2e8f0"/><text x="55" y="82" text-anchor="middle" class="svg-ink" font-size="13">PC1</text><text x="55" y="99" text-anchor="middle" class="svg-muted" font-size="11">192.168.10.10</text>
<rect x="150" y="60" width="90" height="50" rx="8" fill="#bae6fd"/><text x="195" y="82" text-anchor="middle" class="svg-ink" font-size="13">R1</text><text x="195" y="99" text-anchor="middle" class="svg-muted" font-size="11">default route</text>
<rect x="290" y="60" width="90" height="50" rx="8" fill="#ddd6fe"/><text x="335" y="82" text-anchor="middle" class="svg-ink" font-size="13">R2 core</text><text x="335" y="99" text-anchor="middle" class="svg-muted" font-size="11">specific routes</text>
<rect x="430" y="60" width="90" height="50" rx="8" fill="#bbf7d0"/><text x="475" y="82" text-anchor="middle" class="svg-ink" font-size="13">R3</text><text x="475" y="99" text-anchor="middle" class="svg-muted" font-size="11">default route</text>
<rect x="560" y="60" width="75" height="50" rx="8" fill="#e2e8f0"/><text x="597" y="82" text-anchor="middle" class="svg-ink" font-size="13">SRV</text><text x="597" y="99" text-anchor="middle" class="svg-muted" font-size="11">172.16.30.10</text>
<line x1="100" y1="85" x2="150" y2="85" stroke="#64748b" stroke-width="2"/><line x1="240" y1="85" x2="290" y2="85" stroke="#64748b" stroke-width="2"/><line x1="380" y1="85" x2="430" y2="85" stroke="#64748b" stroke-width="2"/><line x1="520" y1="85" x2="560" y2="85" stroke="#64748b" stroke-width="2"/>
<text x="320" y="150" text-anchor="middle" class="svg-accent" font-size="13">Har router akela faisla karta hai. Reply ko bhi routes chahiye.</text>
<path d="M560 125 Q320 175 100 125" fill="none" stroke="#64748b" stroke-width="1.5" stroke-dasharray="5 4"/>
</svg><p class="cap">Nagpur static routing lab: PC1 se SRV tak R1, R2 aur R3 ke paar, dono directions mein routes ke saath.</p></div>

<h3>Teen labs</h3>
<ul>
<li><b>Teen sites ke beech static routing (Nagpur).</b> R1 (branch) aur R3 (data centre) ko core router R2 ki taraf default routes milte hain; R2 ko dono LANs ke specific routes aur 192.168.0.0/16 ke liye safety black hole milta hai. PC1 (192.168.10.10) ko SRV (172.16.30.10) tak aur wapas pahunchna hai.</li>
<li><b>Floating static (Surat).</b> R1 payroll server 172.16.40.10 tak R3 ke fibre se pahunchta hai, R2 ke through dheema backup hai. Aap qualified next hop use karte ho taaki backup khud le le, phir fibre kaat kar saabit karte ho.</li>
<li><b>Preference faisla karti hai (Kochi).</b> OSPF tez path par traffic le jaata hai, lekin 172.16.60.0/24 ka bhoola hua static route slow radio link ke saath jeet jaata hai kyunki static ki preference 5 hai aur OSPF ki 10. Aap ise zyada preference dekar theek karte ho taaki static backup bane.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> PC1 (192.168.10.10) SRV (172.16.30.10) ko ping karta hai. PC1 apne gateway R1 ko bhejta hai. R1 ke paas specific route nahi, to woh 10.1.12.2 ke through 0.0.0.0/0 use karta hai. R2 ke paas 172.16.30.0/24 via 10.1.23.2 hai aur woh forward karta hai. R3 ke paas 172.16.30.0/24 directly connected subnet hai aur woh deliver karta hai. Reply wapas aata hai: R3 apna default route R2 ke liye use karta hai, R2 ke paas 192.168.10.0/24 via 10.1.12.1 hai, R1 deliver karta hai. Chhe routing decisions, har ek independently.</p></div>

<div class="note"><p><b>Kahan dekhna hai.</b> Lab devices Junos routers R1 se R3, ek PC1 aur ek server SRV hain. Jo bhi configure karte ho woh <code>routing-options</code> ke neeche jaata hai. Verification hamesha <code>show route</code> aur ping hai.</p></div>
<div class="warn"><p><b>Common mistake.</b> Routes sirf ek direction mein configure karna. Ping jaati hai, reply route na hone se drop ho jaata hai, aur engineer pehle router ko doshi maanta hai. Hamesha "forward aur return" socho.</p></div>

<div class="scn"><h4>Ek taraf ki ping</h4><p>Ek naya branch router lagaya gaya aur engineer ne us par default route daala. Branch se head office ki pings chali, lekin head office se koi branch ke printers tak nahi pahunch paya. Head office router ke paas branch subnet ka route nahi tha; replies internet default ki taraf ja rahe the. Head-office router par branch LAN ka ek static route sab theek kar gaya.</p><p><b>Lesson:</b> path ko dono directions mein routes chahiye, aur har router akela decide karta hai.</p></div>

<div class="iv"><p class="q">"Router ko packet milta hai to woh kya karta hai?"</p><p>Strong answer: woh destination IP padhta hai, woh saare routes dhoondhta hai jinke prefix mein woh aata hai, sabse lamba (most specific) match chunta hai, phir us route ke interface se next hop ki taraf forward karta hai aur TTL ghatata hai. Match na ho to packet drop hota hai aur ICMP unreachable lautaya ja sakta hai. Jodo ki har router yeh independently dohrata hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Router sirf destination IP par, longest matching route se faisla karta hai.</li>
<li>Routing table rules ki kitaab hai; default route "baaki sab" hai.</li>
<li>Kaam karne wale path ko dono directions mein routes chahiye.</li>
<li>Junos static routes routing-options ke neeche rehte hain; show route aur ping se verify karo.</li>
<li>Labs: static routes, qualified-next-hop wala floating static, aur route preference.</li>
</ul></div>
`}};export{e as default};