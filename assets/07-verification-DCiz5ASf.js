var e={id:`verification`,h:{en:`Verifying the tunnel: commands, counters and logs`,hi:`Tunnel verify karna: commands, counters aur logs`},body:{en:`
<p>When a VPN misbehaves, you need to look at it in layers, like checking a pipe from the tap to the tank: is there water at the source, is the pipe joined, is it flowing? On PAN-OS you check the IKE SA (phase 1), the IPsec SA (phase 2), the routes, the policy and the actual sessions and counters. This chapter lists the commands and what each tells you. The simulator has no VPN engine, so no real output is shown. We describe the fields in words, and you read the real output on your device.</p>

<h3>Layer 1: phase 1 (IKE SA)</h3>
<pre class="code">show vpn gateway
show vpn ike-sa gateway NK-GW1
test vpn ike-sa gateway NK-GW1
clear vpn ike-sa gateway NK-GW1</pre>
<p><code>show vpn gateway</code> lists the configured gateways. <code>show vpn ike-sa</code> lists established IKE SAs and the fields that matter: the peer address, the IKE version, the state, the algorithms in use, the lifetime and how long it has left. <code>test vpn ike-sa</code> initiates negotiation now. <code>clear vpn ike-sa</code> removes the SA so it renegotiates, which is useful after a configuration change but disruptive, so do it in a change window.</p>

<h3>Layer 2: phase 2 (IPsec SA)</h3>
<pre class="code">show vpn tunnel
show vpn ipsec-sa tunnel NK-TUN1
show vpn flow
show vpn flow name NK-TUN1
test vpn ipsec-sa tunnel NK-TUN1
clear vpn ipsec-sa tunnel NK-TUN1</pre>
<p><code>show vpn flow</code> is the live view: tunnel state, the tunnel interface, the peer, the encapsulated and decapsulated packet and byte counters, the SPIs for each direction and any anti-replay or authentication failure counters. If packets are encapsulated but the decapsulated counter never moves, the peer is not returning traffic. If neither moves, your own traffic never reaches the tunnel (route, policy or NAT).</p>

<h3>Layer 3: routing, policy and sessions</h3>
<pre class="code">show routing route destination 10.20.1.5
test routing fib-lookup virtual-router default ip 10.20.1.5
show interface tunnel.11
test security-policy-match from trust to VPN source 10.10.4.20 destination 10.20.1.5 protocol 6 destination-port 443
test nat-policy-match from trust to VPN source 10.10.4.20 destination 10.20.1.5 protocol 6 destination-port 443
show session all filter destination 10.20.1.5
ping source 10.255.11.1 host 10.255.11.2</pre>
<p>Use the FIB lookup to prove which interface the destination uses. The security and NAT policy match tests tell you which rule would act on a given flow without sending traffic. Session details show the ingress and egress interface and whether the session is flagged as traversing a tunnel. The ping with a source address tests the tunnel interface addresses end to end.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Layered checks">
<rect x="10" y="30" width="140" height="110" rx="10" fill="#bae6fd"/><text x="80" y="58" text-anchor="middle" class="svg-ink" font-size="13">Phase 1</text><text x="80" y="82" text-anchor="middle" class="svg-muted" font-size="12">show vpn ike-sa</text><text x="80" y="102" text-anchor="middle" class="svg-muted" font-size="12">IKE SA state</text>
<rect x="170" y="30" width="140" height="110" rx="10" fill="#ddd6fe"/><text x="240" y="58" text-anchor="middle" class="svg-ink" font-size="13">Phase 2</text><text x="240" y="82" text-anchor="middle" class="svg-muted" font-size="12">show vpn ipsec-sa</text><text x="240" y="102" text-anchor="middle" class="svg-muted" font-size="12">show vpn flow</text>
<rect x="330" y="30" width="140" height="110" rx="10" fill="#bbf7d0"/><text x="400" y="58" text-anchor="middle" class="svg-ink" font-size="13">Routing + policy</text><text x="400" y="82" text-anchor="middle" class="svg-muted" font-size="12">fib-lookup</text><text x="400" y="102" text-anchor="middle" class="svg-muted" font-size="12">policy-match</text>
<rect x="490" y="30" width="140" height="110" rx="10" fill="#fde68a"/><text x="560" y="58" text-anchor="middle" class="svg-ink" font-size="13">Traffic</text><text x="560" y="82" text-anchor="middle" class="svg-muted" font-size="12">sessions, logs</text><text x="560" y="102" text-anchor="middle" class="svg-muted" font-size="12">counters</text>
</svg><p class="cap">Check from the bottom up: negotiation, protection, forwarding, traffic.</p></div>

<h3>Logs</h3>
<ul>
<li><b>System log</b>: IKE and IPsec negotiation events appear with the VPN subtype, including success, failure reasons and rekeys. Filter by the gateway or tunnel name.</li>
<li><b>Traffic log</b>: shows allow or deny for the flow, and for IKE packets to the firewall itself.</li>
<li><b>Management-plane log files</b>: <code>less mp-log ikemgr.log</code> shows detailed IKE negotiation text, and <code>tail follow yes mp-log ikemgr.log</code> follows it live while you test.</li>
</ul>
<p>Keep debug short and targeted. Heavy debug on a busy firewall can affect performance, and a debug capture may contain sensitive identities, so share excerpts carefully and never post keys.</p>

<div class="eg"><p><b>Worked example.</b> A ticket says HQ cannot reach 10.20.1.5. The engineer runs the IKE SA check: established. The flow check: encapsulated packets rise, decapsulated stay flat. That means HQ sends but nothing returns. She asks the branch to run the policy-match test for the return flow and finds a missing VPN-to-trust rule on BR-FW. After the branch adds it, decapsulated counters move.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Clearing SAs as a first reaction. It discards the evidence in the SA state and causes an outage. Read first, clear only after you know why.</p></div>
<div class="exam"><p><b>Exam trap.</b> Phase 1 is "ike-sa"; phase 2 is "ipsec-sa" and "vpn flow". A tunnel can show up in the GUI as red until traffic starts, because the IPsec SA is only built when needed or when you test it.</p></div>

<div class="scn"><h4>The counter that told the whole story</h4><p>A late-night ticket said the branch had "no VPN". Both IKE and IPsec SAs were established. The flow output showed encapsulated packets climbing on the branch side but no decapsulated packets. HQ's captured logs showed the packets arriving and being dropped by a rule that did not list the VPN zone. After adding the zone, counters moved on both directions within seconds.</p><p><b>Lesson:</b> counters in both directions show which end is dropping.</p></div>

<div class="iv"><p class="q">"How do you verify an IPsec tunnel on PAN-OS?"</p><p>Check the IKE SA with show vpn ike-sa, the IPsec SA and counters with show vpn ipsec-sa and show vpn flow, then prove routing with a FIB lookup and policy with the policy-match tests, and look at the system and traffic logs and the session. I compare encapsulated and decapsulated counters to see which direction fails.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Check in layers: IKE SA, IPsec SA and flow counters, routing, policy, sessions, logs.</li>
<li>Encapsulated up and decapsulated flat means the return path is failing.</li>
<li>test commands start negotiation; clear commands are disruptive.</li>
<li>Use ikemgr.log for detail, and keep debugging brief and private.</li>
<li>Do not trust a GUI colour alone; confirm with counters and a real flow.</li>
</ul></div>
`,hi:`
<p>Jab VPN galat behave kare, use layers mein dekhna padta hai, jaise pipe ko tap se tank tak check karte hain: source par paani hai, pipe jodi hui hai, paani beh raha hai? PAN-OS par aap IKE SA (phase 1), IPsec SA (phase 2), routes, policy aur asli sessions aur counters check karte ho. Yeh chapter commands aur har ek kya batata hai, yeh list karta hai. Simulator mein VPN engine nahi hai, isliye asli output nahi dikhaya gaya. Hum fields ko shabdon mein describe karte hain, aur asli output aap apne device par padhte ho.</p>

<h3>Layer 1: phase 1 (IKE SA)</h3>
<pre class="code">show vpn gateway
show vpn ike-sa gateway NK-GW1
test vpn ike-sa gateway NK-GW1
clear vpn ike-sa gateway NK-GW1</pre>
<p><code>show vpn gateway</code> configured gateways list karta hai. <code>show vpn ike-sa</code> established IKE SAs aur kaam ke fields dikhata hai: peer address, IKE version, state, use ho rahe algorithms, lifetime aur kitna bacha hai. <code>test vpn ike-sa</code> abhi negotiation shuru karta hai. <code>clear vpn ike-sa</code> SA hata deta hai taaki woh dobara negotiate ho, jo configuration change ke baad useful hai lekin disruptive hai, isliye change window mein karo.</p>

<h3>Layer 2: phase 2 (IPsec SA)</h3>
<pre class="code">show vpn tunnel
show vpn ipsec-sa tunnel NK-TUN1
show vpn flow
show vpn flow name NK-TUN1
test vpn ipsec-sa tunnel NK-TUN1
clear vpn ipsec-sa tunnel NK-TUN1</pre>
<p><code>show vpn flow</code> live view hai: tunnel state, tunnel interface, peer, encapsulated aur decapsulated packet aur byte counters, har direction ke SPIs aur anti-replay ya authentication failure counters. Agar packets encapsulated ho rahe hain lekin decapsulated counter kabhi nahi hilta, to peer traffic wapas nahi bhej raha. Agar dono nahi hilte, to aapka apna traffic tunnel tak pahunch hi nahi raha (route, policy ya NAT).</p>

<h3>Layer 3: routing, policy aur sessions</h3>
<pre class="code">show routing route destination 10.20.1.5
test routing fib-lookup virtual-router default ip 10.20.1.5
show interface tunnel.11
test security-policy-match from trust to VPN source 10.10.4.20 destination 10.20.1.5 protocol 6 destination-port 443
test nat-policy-match from trust to VPN source 10.10.4.20 destination 10.20.1.5 protocol 6 destination-port 443
show session all filter destination 10.20.1.5
ping source 10.255.11.1 host 10.255.11.2</pre>
<p>FIB lookup se prove karo ki destination kaun sa interface use karti hai. Security aur NAT policy match tests bina traffic bheje batate hain ki diye gaye flow par kaun sa rule kaam karega. Session details ingress aur egress interface dikhate hain aur yeh ki session tunnel traverse kar raha hai ya nahi. Source address ke saath ping tunnel interface addresses ko end to end test karta hai.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Layered checks">
<rect x="10" y="30" width="140" height="110" rx="10" fill="#bae6fd"/><text x="80" y="58" text-anchor="middle" class="svg-ink" font-size="13">Phase 1</text><text x="80" y="82" text-anchor="middle" class="svg-muted" font-size="12">show vpn ike-sa</text><text x="80" y="102" text-anchor="middle" class="svg-muted" font-size="12">IKE SA state</text>
<rect x="170" y="30" width="140" height="110" rx="10" fill="#ddd6fe"/><text x="240" y="58" text-anchor="middle" class="svg-ink" font-size="13">Phase 2</text><text x="240" y="82" text-anchor="middle" class="svg-muted" font-size="12">show vpn ipsec-sa</text><text x="240" y="102" text-anchor="middle" class="svg-muted" font-size="12">show vpn flow</text>
<rect x="330" y="30" width="140" height="110" rx="10" fill="#bbf7d0"/><text x="400" y="58" text-anchor="middle" class="svg-ink" font-size="13">Routing + policy</text><text x="400" y="82" text-anchor="middle" class="svg-muted" font-size="12">fib-lookup</text><text x="400" y="102" text-anchor="middle" class="svg-muted" font-size="12">policy-match</text>
<rect x="490" y="30" width="140" height="110" rx="10" fill="#fde68a"/><text x="560" y="58" text-anchor="middle" class="svg-ink" font-size="13">Traffic</text><text x="560" y="82" text-anchor="middle" class="svg-muted" font-size="12">sessions, logs</text><text x="560" y="102" text-anchor="middle" class="svg-muted" font-size="12">counters</text>
</svg><p class="cap">Neeche se upar check karo: negotiation, protection, forwarding, traffic.</p></div>

<h3>Logs</h3>
<ul>
<li><b>System log</b>: IKE aur IPsec negotiation events VPN subtype ke saath dikhte hain, success, failure reasons aur rekeys samet. Gateway ya tunnel naam se filter karo.</li>
<li><b>Traffic log</b>: flow ke liye allow ya deny dikhata hai, aur firewall ko hi aane wale IKE packets ke liye bhi.</li>
<li><b>Management-plane log files</b>: <code>less mp-log ikemgr.log</code> detailed IKE negotiation text dikhata hai, aur <code>tail follow yes mp-log ikemgr.log</code> test karte waqt use live follow karta hai.</li>
</ul>
<p>Debug ko chhota aur targeted rakho. Busy firewall par heavy debug performance ko affect kar sakta hai, aur debug capture mein sensitive identities ho sakti hain, isliye excerpts dhyaan se share karo aur keys kabhi post mat karo.</p>

<div class="eg"><p><b>Worked example.</b> Ticket kehta hai ki HQ 10.20.1.5 tak nahi pahunch raha. Engineer IKE SA check chalati hai: established. Flow check: encapsulated packets badh rahe hain, decapsulated flat hain. Matlab HQ bhej raha hai lekin kuch wapas nahi aa raha. Woh branch se return flow ke liye policy-match test chalane ko kehti hai aur BR-FW par VPN-to-trust rule missing paati hai. Branch ke rule jodne ke baad decapsulated counters hilne lagte hain.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Pehli reaction mein SAs clear kar dena. Isse SA state ka evidence mit jaata hai aur outage hota hai. Pehle padho, kaaran jaanne ke baad hi clear karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Phase 1 "ike-sa" hai; phase 2 "ipsec-sa" aur "vpn flow". Tunnel GUI mein tab tak red dikh sakta hai jab tak traffic shuru na ho, kyunki IPsec SA tabhi banta hai jab zaroorat ho ya aap test karo.</p></div>

<div class="scn"><h4>Woh counter jisne poori kahani bata di</h4><p>Raat ke ticket mein kaha gaya ki branch par "VPN nahi hai". IKE aur IPsec dono SAs established the. Flow output mein branch side par encapsulated packets badhte dikhe lekin decapsulated packets nahi. HQ ke captured logs mein packets aate aur ek aise rule se drop hote dikhe jisme VPN zone list nahi tha. Zone jodne ke baad kuch seconds mein dono directions mein counters hilne lage.</p><p><b>Lesson:</b> dono directions ke counters batate hain ki kaun sa end drop kar raha hai.</p></div>

<div class="iv"><p class="q">"PAN-OS par IPsec tunnel kaise verify karte ho?"</p><p>IKE SA show vpn ike-sa se, IPsec SA aur counters show vpn ipsec-sa aur show vpn flow se check karta hoon, phir FIB lookup se routing aur policy-match tests se policy prove karta hoon, aur system aur traffic logs aur session dekhta hoon. Encapsulated aur decapsulated counters compare karta hoon ki kaun si direction fail ho rahi hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Layers mein check karo: IKE SA, IPsec SA aur flow counters, routing, policy, sessions, logs.</li>
<li>Encapsulated up aur decapsulated flat ka matlab return path fail ho raha hai.</li>
<li>test commands negotiation shuru karte hain; clear commands disruptive hain.</li>
<li>Detail ke liye ikemgr.log use karo, aur debugging chhoti aur private rakho.</li>
<li>Sirf GUI colour par bharosa mat karo; counters aur asli flow se confirm karo.</li>
</ul></div>
`}};export{e as default};