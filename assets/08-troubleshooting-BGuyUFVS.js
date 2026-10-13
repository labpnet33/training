var e={id:`troubleshooting`,h:{en:`Troubleshooting routing on PAN-OS: a repeatable workflow`,hi:`PAN-OS par routing troubleshooting: repeatable workflow`},body:{en:`
<p>Routing problems feel mysterious until you work in a fixed order. The workflow below is the one used for support tickets, and it works for static, OSPF and BGP.</p>
<div class="note"><p><b>Note.</b> No lab for OSPF or BGP exists in the simulator yet. Practise the static-route part in pan-setup and pan-nat, and practise reading neighbour and route problems in enarsi-ospf, enarsi-bgp and nse4-dynamic. The commands here are the real PAN-OS commands.</p></div>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Work from the bottom up and stop at the first step that fails."><rect x="20" y="40" width="100" height="80" rx="10" fill="#bae6fd"/><text x="70" y="86" text-anchor="middle" class="svg-ink" font-size="14">Interface up?</text><line x1="120" y1="80" x2="144" y2="80" stroke="#64748b" stroke-width="2"/><rect x="144" y="40" width="100" height="80" rx="10" fill="#bbf7d0"/><text x="194" y="86" text-anchor="middle" class="svg-ink" font-size="14">Neighbour up?</text><line x1="244" y1="80" x2="268" y2="80" stroke="#64748b" stroke-width="2"/><rect x="268" y="40" width="100" height="80" rx="10" fill="#ddd6fe"/><text x="318" y="86" text-anchor="middle" class="svg-ink" font-size="14">Route learned?</text><line x1="368" y1="80" x2="392" y2="80" stroke="#64748b" stroke-width="2"/><rect x="392" y="40" width="100" height="80" rx="10" fill="#fde68a"/><text x="442" y="86" text-anchor="middle" class="svg-ink" font-size="14">Route active?</text><line x1="492" y1="80" x2="516" y2="80" stroke="#64748b" stroke-width="2"/><rect x="516" y="40" width="100" height="80" rx="10" fill="#fed7aa"/><text x="566" y="86" text-anchor="middle" class="svg-ink" font-size="14">Policy and zone?</text></svg><p class="cap">Work from the bottom up and stop at the first step that fails.</p></div>
<h3>Step 1: is the interface up and in the right place?</h3>
<pre class="code">show interface all
show routing interface</pre>
<p>Check the link state, the IP address, the zone and that the interface is in the virtual router you are working on. An interface left out of the virtual router is the classic cause of "OSPF does not start".</p>
<h3>Step 2: is the neighbour or peer up?</h3>
<pre class="code">show routing protocol ospf neighbor
show routing protocol bgp peer
ping source 10.20.1.1 host 10.20.1.2</pre>
<p>Use the ping with the interface address as source. If the ping fails, solve Layer 2 and 3 first. If it works but the protocol is down, check these in order: area ID, timers, authentication, MTU for OSPF; AS numbers, peer and local addresses, passwords and TCP 179 for BGP. Then check security policy and the zone protection profile.</p>
<h3>Step 3: is the route learned?</h3>
<pre class="code">show routing protocol ospf lsdb
show routing protocol bgp loc-rib
show routing protocol bgp rib-out</pre>
<p>If the neighbour is up but the prefix is missing, ask the neighbour whether it advertises it: it may be filtered by the neighbour's export policy, a redistribution profile, an area type (stub blocks external) or your own import rule.</p>
<h3>Step 4: is the route active and which one wins?</h3>
<pre class="code">show routing route
show routing route type bgp
show routing fib</pre>
<p>Look at the flags. A route learned but not active lost to a lower administrative distance or has an unreachable next hop. Compare the distances from the first chapter. For a default route, check which source owns it.</p>
<h3>Step 5: does the packet follow it, and does policy allow it?</h3>
<pre class="code">test routing fib-lookup virtual-router default ip 203.0.113.50
test security-policy-match source 10.10.1.20 destination 203.0.113.50 destination-port 443 protocol 6
show session all filter destination 203.0.113.50
show counter global filter delta yes severity drop</pre>
<p>Check that the egress interface gives the expected zone, that the rule exists for that zone pair and that no PBF rule steers the traffic elsewhere. Remember that existing sessions follow the old path until they end.</p>
<h3>Step 6: is it asymmetric?</h3>
<p>If sessions start but stall, compare the paths in each direction, and look for drops of non-SYN packets. Fix the routing, ECMP hashing or the second firewall. Disabling checks is a last resort and weakens protection.</p>
<h3>Writing it down</h3>
<p>Write each step's result in the ticket: command, result, conclusion. A reader can then follow your reasoning, and the incident review has real evidence.</p>
<div class="eg"><p><b>Worked example.</b> Ticket: branch to data centre traffic stopped after a change. Interface up (step 1), OSPF neighbour Full (step 2), the data centre prefix is in the database (step 3), but the route table shows it inactive. A static route with distance 10 to the same prefix was added during the change, so it beats OSPF (30), and its next hop is wrong. Removing the static route fixed it.</p></div>
<div class="warn"><p><b>Common mistake.</b> Jumping to the security policy because the logs are empty. Empty logs often mean no session was created because there was no route.</p></div>
<div class="exam"><p><b>Exam trap.</b> The order is interface, neighbour, learned route, active route, forwarding and policy. Know the three commands that prove each layer: neighbour, loc-rib or lsdb, and the route table.</p></div>
<div class="scn"><h4>OSPF neighbour Full, still no traffic</h4><p>After a firewall change the OSPF neighbour was Full and routes were present, but servers in the new subnet were unreachable. The engineer used the fib lookup and found the egress interface was in an unexpected zone because a new static route to a lab network was more specific. The route was corrected and traffic returned.</p><p><b>Lesson:</b> a healthy neighbour does not prove the right route wins; check the winning route and its zone.</p></div>
<div class="iv"><p class="q">"A BGP session is not coming up. How do you troubleshoot?"</p><p>Start with reachability by pinging the peer from the right source. Check the peer address, AS numbers, authentication and that TCP 179 is allowed by the security policy and zone protection. Then look at the session state: Active or Connect points to TCP, Idle often to configuration, and Established with no routes points to policy. Check logs on both sides.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Work in order: interface, neighbour, learned route, active route, forwarding, policy.</li><li>Empty traffic logs often mean there was no route.</li><li>A route can be learned but inactive because of distance or next hop.</li><li>test routing fib-lookup and test security-policy-match prove the path and the rule.</li><li>Write every step into the ticket as evidence.</li></ul></div>
`,hi:`
<p>Routing problems tab tak mysterious lagti hain jab tak fixed order mein kaam na karo. Neeche ka workflow support tickets mein use hota hai, aur static, OSPF aur BGP sab par chalta hai.</p>
<div class="note"><p><b>Note.</b> Simulator mein OSPF ya BGP ka abhi koi lab nahi hai. Static-route wala hissa pan-setup aur pan-nat mein practise karo, aur neighbour aur route problems padhna enarsi-ospf, enarsi-bgp aur nse4-dynamic mein practise karo. Yahan ke commands real PAN-OS commands hain.</p></div>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Neeche se upar kaam karo aur pehle fail hone wale step par ruk jao."><rect x="20" y="40" width="100" height="80" rx="10" fill="#bae6fd"/><text x="70" y="86" text-anchor="middle" class="svg-ink" font-size="14">Interface up?</text><line x1="120" y1="80" x2="144" y2="80" stroke="#64748b" stroke-width="2"/><rect x="144" y="40" width="100" height="80" rx="10" fill="#bbf7d0"/><text x="194" y="86" text-anchor="middle" class="svg-ink" font-size="14">Neighbour up?</text><line x1="244" y1="80" x2="268" y2="80" stroke="#64748b" stroke-width="2"/><rect x="268" y="40" width="100" height="80" rx="10" fill="#ddd6fe"/><text x="318" y="86" text-anchor="middle" class="svg-ink" font-size="14">Route learned?</text><line x1="368" y1="80" x2="392" y2="80" stroke="#64748b" stroke-width="2"/><rect x="392" y="40" width="100" height="80" rx="10" fill="#fde68a"/><text x="442" y="86" text-anchor="middle" class="svg-ink" font-size="14">Route active?</text><line x1="492" y1="80" x2="516" y2="80" stroke="#64748b" stroke-width="2"/><rect x="516" y="40" width="100" height="80" rx="10" fill="#fed7aa"/><text x="566" y="86" text-anchor="middle" class="svg-ink" font-size="14">Policy aur zone?</text></svg><p class="cap">Neeche se upar kaam karo aur pehle fail hone wale step par ruk jao.</p></div>
<h3>Step 1: interface up hai aur sahi jagah par hai?</h3>
<pre class="code">show interface all
show routing interface</pre>
<p>Link state, IP address, zone dekho aur yeh ki interface us virtual router mein hai jis par aap kaam kar rahe ho. Virtual router se bahar chhoda interface "OSPF start nahi hota" ki classic wajah hai.</p>
<h3>Step 2: neighbour ya peer up hai?</h3>
<pre class="code">show routing protocol ospf neighbor
show routing protocol bgp peer
ping source 10.20.1.1 host 10.20.1.2</pre>
<p>Ping source mein interface address use karo. Ping fail ho to pehle Layer 2 aur 3 theek karo. Ping chale par protocol down ho to kram se dekho: OSPF ke liye area ID, timers, authentication, MTU; BGP ke liye AS numbers, peer aur local addresses, passwords aur TCP 179. Phir security policy aur zone protection profile check karo.</p>
<h3>Step 3: route seekha gaya?</h3>
<pre class="code">show routing protocol ospf lsdb
show routing protocol bgp loc-rib
show routing protocol bgp rib-out</pre>
<p>Neighbour up hai par prefix gayab hai to neighbour se poochho ki woh advertise karta hai ya nahi: neighbour ki export policy, redistribution profile, area type (stub external block karta hai) ya aapka apna import rule use filter kar sakta hai.</p>
<h3>Step 4: route active hai aur kaun jeet raha hai?</h3>
<pre class="code">show routing route
show routing route type bgp
show routing fib</pre>
<p>Flags dekho. Seekha hua par active na hone wala route kam administrative distance se haara ya uska next hop unreachable hai. Pehle chapter ki distances compare karo. Default route ke liye dekho kaunsa source uska malik hai.</p>
<h3>Step 5: packet use follow karta hai aur policy allow karti hai?</h3>
<pre class="code">test routing fib-lookup virtual-router default ip 203.0.113.50
test security-policy-match source 10.10.1.20 destination 203.0.113.50 destination-port 443 protocol 6
show session all filter destination 203.0.113.50
show counter global filter delta yes severity drop</pre>
<p>Check karo ki egress interface expected zone deta hai, us zone pair ke liye rule hai, aur koi PBF rule traffic ko kahin aur nahi bhej raha. Yaad rakho existing sessions khatam hone tak purana path follow karte hain.</p>
<h3>Step 6: asymmetric to nahi?</h3>
<p>Sessions shuru hon par ruk jaayein to dono directions ke paths compare karo aur non-SYN packets ke drops dekho. Routing, ECMP hashing ya doosra firewall theek karo. Checks disable karna aakhri option hai aur protection kamzor karta hai.</p>
<h3>Likh kar rakho</h3>
<p>Har step ka result ticket mein likho: command, result, conclusion. Padhne wala aapki reasoning follow kar sakta hai, aur incident review ke paas real evidence hota hai.</p>
<div class="eg"><p><b>Worked example.</b> Ticket: change ke baad branch se data centre ka traffic ruk gaya. Interface up (step 1), OSPF neighbour Full (step 2), data centre prefix database mein hai (step 3), lekin route table mein woh inactive hai. Change ke dauran usi prefix ka distance 10 wala static route jod diya gaya, jo OSPF (30) se jeet jaata hai, aur uska next hop galat hai. Static route hatane se theek hua.</p></div>
<div class="warn"><p><b>Common mistake.</b> Logs khaali hain isliye seedha security policy par kood jaana. Khaali logs aksar matlab hota hai route na hone ki wajah se session bana hi nahi.</p></div>
<div class="exam"><p><b>Exam trap.</b> Order hai interface, neighbour, learned route, active route, forwarding aur policy. Har layer ko prove karne wale teen commands jaano: neighbour, loc-rib ya lsdb, aur route table.</p></div>
<div class="scn"><h4>OSPF neighbour Full, phir bhi traffic nahi</h4><p>Firewall change ke baad OSPF neighbour Full tha aur routes maujood the, lekin naye subnet ke servers unreachable the. Engineer ne fib lookup chalaya aur dekha ki egress interface unexpected zone mein tha kyunki lab network ka naya static route zyada specific tha. Route theek kiya gaya aur traffic wapas aaya.</p><p><b>Lesson:</b> healthy neighbour yeh prove nahi karta ki sahi route jeet raha hai; jeetne wala route aur uska zone check karo.</p></div>
<div class="iv"><p class="q">"BGP session up nahi aa raha. Kaise troubleshoot karoge?"</p><p>Reachability se shuru karo, sahi source se peer ko ping karke. Peer address, AS numbers, authentication check karo aur yeh ki TCP 179 security policy aur zone protection se allowed hai. Phir session state dekho: Active ya Connect TCP ki taraf, Idle aksar configuration ki taraf, aur routes ke bina Established policy ki taraf ishara karta hai. Dono sides ke logs check karo.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Kram se kaam karo: interface, neighbour, learned route, active route, forwarding, policy.</li><li>Traffic logs khaali hon to aksar route nahi tha.</li><li>Route learned ho sakta hai par distance ya next hop ki wajah se inactive.</li><li>test routing fib-lookup aur test security-policy-match path aur rule prove karte hain.</li><li>Har step ticket mein evidence ki tarah likho.</li></ul></div>
`}};export{e as default};