var e={id:`verification`,h:{en:`Verifying the overlay: IKE, tunnel, routing and SD-WAN`,hi:`Overlay verify karna: IKE, tunnel, routing aur SD-WAN`},body:{en:`
<p>A healthy overlay is four things in a row: the IKE gateway is established, the IPsec tunnel passes traffic, the routing sessions are up with the right routes, and SD-WAN shows the members alive and in SLA. Check them in that order, because each layer depends on the one before it.</p>
<div class="note"><p>The command names below are the ones documented for FortiOS 7.x. The outputs on a real device are long and their exact layout depends on the version and the tunnel type; I describe what to look for instead of printing a made-up screen. The one short line shown for the tunnel summary is illustrative of the general format.</p></div>
<h3>Layer 1: IKE (phase 1)</h3>
<pre class="code"><span class="c">Reference configuration (not run in the simulator)</span>
diagnose vpn ike gateway list
diagnose vpn ike gateway list name HUB1-VPN1</pre>
<p>What to read in each gateway entry:</p>
<ul><li><b>Name and remote address.</b> Is this the gateway you expect (HUB1-VPN1 and the hub address 203.0.113.10)?</li><li><b>IKE version.</b> Same on both sides.</li><li><b>Status.</b> The established state and how long ago it was established. A short age that keeps resetting means flapping.</li><li><b>Peer ID and local ID.</b> They should match your plan.</li><li><b>NAT-T.</b> Whether NAT was detected on either side; if you expected no NAT and it says yes, an upstream device is translating.</li><li><b>Lifetimes and the time to the next rekey.</b> Check against the keylife you set.</li><li><b>Number of IPsec SAs.</b> Phase 2 tunnels under this gateway.</li></ul>
<h3>Layer 2: the IPsec tunnel (phase 2)</h3>
<pre class="code"><span class="c">Reference configuration (not run in the simulator)</span>
get vpn ipsec tunnel summary
diagnose vpn tunnel list name HUB1-VPN1
get vpn ipsec tunnel details</pre>
<p>The summary gives one line per tunnel with the selectors that are up and the packet counters in each direction. A very simple illustrative line looks like this:</p>
<pre class="out"><span class="c">Reference configuration (not run in the simulator). Illustrative format only.</span>
'HUB1-VPN1' 203.0.113.10:0  selectors(total,up): 1/1  rx(pkt,err): 1520/0  tx(pkt,err): 1498/0</pre>
<p>In the detailed tunnel list, look at the following:</p>
<ul><li><b>Selectors.</b> Source and destination of each phase 2 (wide, 0.0.0.0/0, in our design).</li><li><b>SPIs and algorithms.</b> The negotiated encryption and integrity match your proposals.</li><li><b>Counters.</b> Packets and bytes encrypted and decrypted should both grow. Only encrypted growing means traffic goes out but nothing comes back; only decrypted growing means the return path is broken.</li><li><b>Errors.</b> Encryption or decryption errors and replay errors point to a mismatch or to packet loss.</li><li><b>NAT-T and ports.</b> UDP 4500 in use when NAT is present.</li></ul>
<h3>Layer 3: addressing and routing over the tunnel</h3>
<pre class="code"><span class="c">Reference configuration (not run in the simulator)</span>
get system interface physical
diagnose ip address list
execute ping-options source 169.254.16.10
execute ping 169.254.16.1
get router info bgp summary
get router info routing-table all</pre>
<ul><li>Does the spoke tunnel interface have the address from mode-config, and is it in the range of the plan? (diagnose ip address list or the interface page.)</li><li>Does a ping from the spoke tunnel address to the hub tunnel address work?</li><li>Is the BGP session established, and how many prefixes are received? (fsd-routing chapter 8.)</li><li>Does the routing table have the hub subnets through the tunnel interfaces, with the right distance and priority?</li></ul>
<h3>Layer 4: SD-WAN</h3>
<pre class="code"><span class="c">Reference configuration (not run in the simulator)</span>
diagnose sys sdwan member
diagnose sys sdwan health-check
diagnose sys sdwan service4</pre>
<ul><li>Are both tunnel members listed and alive?</li><li>Does the health check show latency, jitter and loss for each member, and the SLA state?</li><li>In the service output, are the tunnels in the order and state that your rules expect?</li></ul>
<h3>Quick table: symptom to layer</h3>
<table class="cmp"><tr><th>What you see</th><th>Layer</th><th>First idea</th></tr><tr><td>No IKE gateway in the list</td><td>1</td><td>Spoke cannot reach the hub address, or phase 1 mismatch (chapter 8)</td></tr><tr><td>Gateway established, no tunnel or selectors down</td><td>2</td><td>Phase 2 proposal or selector mismatch</td></tr><tr><td>Tunnel up, counters grow one way only</td><td>2</td><td>Return route or firewall policy</td></tr><tr><td>Tunnel up, ping to hub tunnel IP fails</td><td>3</td><td>Mode-config address missing, wrong range, or policy</td></tr><tr><td>Ping works, BGP in Active</td><td>3</td><td>fsd-routing chapter 8</td></tr><tr><td>BGP up, member shows dead</td><td>4</td><td>Health check target or return route</td></tr></table>
<h3>Where to look at the hub</h3>
<p>On the hub, the same commands list all spokes. The IKE gateway list shows one entry per connected spoke, so use a filter or the name to stay readable. For counts, the tunnel summary lines are the quick overview of how many spokes are up on each tunnel; compare it with the number of branches you expect. A hub with fewer tunnels than branches tells you where to start.</p>
<div class="warn"><p><b>Common mistake.</b> Looking only at the GUI colour of the tunnel. A green tunnel only means IKE and phase 2 are established. It says nothing about the address, the routing session or the SLA. Walk the four layers.</p></div>
<div class="exam"><p><b>Exam trap.</b> The order is IKE, tunnel, addressing and routing, SD-WAN. One-way counters point to the return path, not to crypto. Know which command shows each layer.</p></div>
<div class="scn"><h4>Green tunnel, no traffic</h4><p>After a hub upgrade the tunnels of 12 branches showed up, but users could not reach the data centre. The tunnel details showed that the encrypted packet counter grew while the decrypted counter stayed at zero. The hub firewall policy for the overlay zone had been removed in an install, so replies were dropped on the hub.</p><p><b>Lesson:</b> One-way counters mean the other side is not returning the traffic. Check the policy and the route.</p></div>
<div class="iv"><p class="q">"How do you verify an SD-WAN overlay tunnel?"</p><p>In four steps: the IKE gateway is established with the right IDs, the IPsec tunnel has selectors up and counters growing both ways, the tunnel address and BGP session work, and SD-WAN shows the member alive with the SLA met. I use the gateway list, the tunnel list and summary, the BGP and routing commands and the SD-WAN member and health-check commands.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Check in order: IKE gateway, tunnel, address and routing, SD-WAN.</li><li>Read counters in both directions.</li><li>A green tunnel is not a healthy overlay.</li><li>On the hub, compare the number of tunnels with the number of branches.</li></ul></div>
`,hi:`
<p>Healthy overlay ek ke baad ek chaar cheezein hai: IKE gateway established hai, IPsec tunnel traffic paas karta hai, routing sessions sahi routes ke saath up hain, aur SD-WAN members ko alive aur SLA mein dikhata hai. Unhe isi order mein check karo, kyunki har layer pichhli layer par depend karti hai.</p>
<div class="note"><p>Neeche ke command names FortiOS 7.x ke liye documented hain. Asli device par outputs lambe hote hain aur unka exact layout version aur tunnel type par depend karta hai; main banaya hua screen print karne ki jagah batata hoon ki kya dekhna hai. Tunnel summary ki jo ek chhoti line dikhayi gayi hai woh aam format ke liye illustrative hai.</p></div>
<h3>Layer 1: IKE (phase 1)</h3>
<pre class="code"><span class="c">Reference configuration (not run in the simulator)</span>
diagnose vpn ike gateway list
diagnose vpn ike gateway list name HUB1-VPN1</pre>
<p>Har gateway entry mein kya padhna hai:</p>
<ul><li><b>Name aur remote address.</b> Kya yeh wahi gateway hai jo aap ummeed karte ho (HUB1-VPN1 aur hub address 203.0.113.10)?</li><li><b>IKE version.</b> Dono sides par same.</li><li><b>Status.</b> Established state aur kitni der pehle establish hua. Chhoti age jo baar baar reset hoti hai matlab flapping.</li><li><b>Peer ID aur local ID.</b> Aapke plan se match karni chahiye.</li><li><b>NAT-T.</b> Kisi sire par NAT detect hua ya nahi; ummeed NAT ki nahi thi aur yes dikhe to upstream device translate kar raha hai.</li><li><b>Lifetimes aur agle rekey tak ka time.</b> Aapke set kiye keylife se check karo.</li><li><b>IPsec SAs ki sankhya.</b> Is gateway ke neeche phase 2 tunnels.</li></ul>
<h3>Layer 2: IPsec tunnel (phase 2)</h3>
<pre class="code"><span class="c">Reference configuration (not run in the simulator)</span>
get vpn ipsec tunnel summary
diagnose vpn tunnel list name HUB1-VPN1
get vpn ipsec tunnel details</pre>
<p>Summary har tunnel ke liye ek line deti hai, up selectors aur har direction ke packet counters ke saath. Ek bahut saral illustrative line aisi dikhti hai:</p>
<pre class="out"><span class="c">Reference configuration (not run in the simulator). Illustrative format only.</span>
'HUB1-VPN1' 203.0.113.10:0  selectors(total,up): 1/1  rx(pkt,err): 1520/0  tx(pkt,err): 1498/0</pre>
<p>Detailed tunnel list mein yeh dekho:</p>
<ul><li><b>Selectors.</b> Har phase 2 ka source aur destination (hamare design mein wide, 0.0.0.0/0).</li><li><b>SPIs aur algorithms.</b> Negotiate hui encryption aur integrity aapke proposals se match karti hai.</li><li><b>Counters.</b> Encrypted aur decrypted packets aur bytes dono badhne chahiye. Sirf encrypted badhe to traffic jaa raha hai par kuch wapas nahi aa raha; sirf decrypted badhe to return path toota hai.</li><li><b>Errors.</b> Encryption ya decryption errors aur replay errors mismatch ya packet loss ki taraf ishara karte hain.</li><li><b>NAT-T aur ports.</b> NAT hone par UDP 4500 use mein.</li></ul>
<h3>Layer 3: tunnel par addressing aur routing</h3>
<pre class="code"><span class="c">Reference configuration (not run in the simulator)</span>
get system interface physical
diagnose ip address list
execute ping-options source 169.254.16.10
execute ping 169.254.16.1
get router info bgp summary
get router info routing-table all</pre>
<ul><li>Kya spoke tunnel interface ke paas mode-config ka address hai, aur woh plan ki range mein hai? (diagnose ip address list ya interface page.)</li><li>Kya spoke tunnel address se hub tunnel address tak ping chalta hai?</li><li>Kya BGP session established hai, aur kitne prefixes receive hue? (fsd-routing chapter 8.)</li><li>Kya routing table mein hub subnets tunnel interfaces ke through sahi distance aur priority ke saath hain?</li></ul>
<h3>Layer 4: SD-WAN</h3>
<pre class="code"><span class="c">Reference configuration (not run in the simulator)</span>
diagnose sys sdwan member
diagnose sys sdwan health-check
diagnose sys sdwan service4</pre>
<ul><li>Kya dono tunnel members listed aur alive hain?</li><li>Kya health check har member ke liye latency, jitter aur loss, aur SLA state dikhata hai?</li><li>Service output mein kya tunnels us order aur state mein hain jo aapke rules ummeed karte hain?</li></ul>
<h3>Quick table: symptom se layer</h3>
<table class="cmp"><tr><th>Kya dikhta hai</th><th>Layer</th><th>Pehla idea</th></tr><tr><td>List mein koi IKE gateway nahi</td><td>1</td><td>Spoke hub address tak nahi pahunch sakta, ya phase 1 mismatch (chapter 8)</td></tr><tr><td>Gateway established, tunnel nahi ya selectors down</td><td>2</td><td>Phase 2 proposal ya selector mismatch</td></tr><tr><td>Tunnel up, counters sirf ek taraf badhte hain</td><td>2</td><td>Return route ya firewall policy</td></tr><tr><td>Tunnel up, hub tunnel IP ko ping fail</td><td>3</td><td>Mode-config address missing, galat range, ya policy</td></tr><tr><td>Ping chalta hai, BGP Active mein</td><td>3</td><td>fsd-routing chapter 8</td></tr><tr><td>BGP up, member dead dikhta hai</td><td>4</td><td>Health check target ya return route</td></tr></table>
<h3>Hub par kahan dekhein</h3>
<p>Hub par wahi commands saare spokes list karte hain. IKE gateway list har connected spoke ke liye ek entry dikhati hai, isliye padhne layak rakhne ke liye filter ya name use karo. Counts ke liye tunnel summary lines yeh quick overview deti hain ki har tunnel par kitne spokes up hain; use apne ummeed ke branches ki sankhya se compare karo. Branches se kam tunnels wala hub batata hai ki kahan se shuru karna hai.</p>
<div class="warn"><p><b>Common galti.</b> Sirf tunnel ke GUI colour ko dekhna. Hara tunnel sirf itna batata hai ki IKE aur phase 2 established hain. Woh address, routing session ya SLA ke baare mein kuch nahi kehta. Chaaron layers chalo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Order hai IKE, tunnel, addressing aur routing, SD-WAN. One-way counters return path ki taraf ishara karte hain, crypto ki nahi. Jaano ki kaun sa command kaun si layer dikhata hai.</p></div>
<div class="scn"><h4>Hara tunnel, traffic nahi</h4><p>Hub upgrade ke baad 12 branches ke tunnels up dikhe, par users data centre tak nahi pahunch paaye. Tunnel details ne dikhaya ki encrypted packet counter badhta raha jabki decrypted counter zero par raha. Overlay zone ki hub firewall policy ek install mein hat gayi thi, isliye hub par replies drop ho rahe the.</p><p><b>Seekh:</b> One-way counters ka matlab doosri taraf traffic wapas nahi aa raha. Policy aur route check karo.</p></div>
<div class="iv"><p class="q">"SD-WAN overlay tunnel ko kaise verify karte ho?"</p><p>Chaar steps mein: IKE gateway sahi IDs ke saath established hai, IPsec tunnel ke selectors up hain aur counters dono taraf badh rahe hain, tunnel address aur BGP session kaam karte hain, aur SD-WAN member ko alive aur SLA met ke saath dikhata hai. Main gateway list, tunnel list aur summary, BGP aur routing commands aur SD-WAN member aur health-check commands use karta hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Order mein check karo: IKE gateway, tunnel, address aur routing, SD-WAN.</li><li>Counters dono directions mein padho.</li><li>Hara tunnel healthy overlay nahi hai.</li><li>Hub par tunnels ki sankhya ko branches ki sankhya se compare karo.</li></ul></div>
`}};export{e as default};