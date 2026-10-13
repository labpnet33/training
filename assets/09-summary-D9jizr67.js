var e={id:`dia-summary`,h:{en:`Summary, cheat sheet and exam checklist`,hi:`Summary, cheat sheet aur exam checklist`},body:{en:`
<p>You started with a branch that hauled every internet packet to the data center. You now know how to let it leave locally, how to choose between a route and a policy, how to keep it safe, how Cloud OnRamp picks exits and extends the fabric to clouds, and how to troubleshoot it. This last chapter gathers everything into one page you can revise the night before the exam.</p>

<h3>The big picture in six sentences</h3>
<ol>
<li><b>Backhaul</b> sends branch internet traffic through the DC; it is simple and central but adds latency and loads the hub.</li>
<li><b>DIA</b> lets the branch break out through its own transport using NAT (PAT) on the interface.</li>
<li>NAT only <b>prepares the exit</b>. Traffic reaches it through the <b>NAT DIA route</b> (all of a VPN, AD 6, <code>n*Nd</code>) or a <b>data policy</b> with <code>nat use-vpn 0</code> (selective, applied from-service).</li>
<li><b>Fallback</b> and the <b>endpoint tracker</b> protect users when the local exit fails.</li>
<li>DIA moves the security perimeter to the branch: use a zone firewall, IPS, DNS security or a SIG tunnel, and never treat NAT as a firewall.</li>
<li><b>Cloud OnRamp</b> for SaaS picks the best exit per application; for Multicloud it deploys cloud gateways and attaches them to native cloud networks.</li>
</ol>

<h3>Cheat sheet: configuration</h3>
<pre class="code">interface GigabitEthernet1
 ip nat outside
ip nat inside source list nat-dia-vpn-hop-access-list interface GigabitEthernet1 overload
ip nat route vrf 10 0.0.0.0 0.0.0.0 global

data-policy GUEST-DIA
 vpn-list GUEST-VPN
  sequence 5
   match destination-data-prefix-list INTERNAL-NETS
   action accept
  sequence 10
   match source-data-prefix-list GUEST-NETS
   action accept
    nat use-vpn 0 fallback
  default-action accept
apply-policy
 site-list PUNE
  data-policy GUEST-DIA from-service</pre>

<h3>Cheat sheet: verification</h3>
<table class="cmp"><tr><th>Command</th><th>Tells you</th></tr>
<tr><td><code>show ip route vrf 10</code></td><td>Is there an <code>n*Nd</code> default and an OMP default behind it</td></tr>
<tr><td><code>show sdwan nat-dia summary</code></td><td>NAT DIA interfaces and routes; "none" means missing NAT on the transport</td></tr>
<tr><td><code>show ip nat statistics</code> / <code>translations vrf 10</code></td><td>Outside interfaces, active translations, inside global address</td></tr>
<tr><td><code>show sdwan policy from-vsmart</code></td><td>The data policy the edge received</td></tr>
<tr><td><code>show sdwan policy service-path ...</code></td><td>The edge's forwarding decision for a flow: overlay or local NAT</td></tr>
<tr><td><code>show endpoint-tracker</code></td><td>Tracker status: up or down, and round-trip time</td></tr></table>

<h3>Decision table</h3>
<table class="cmp"><tr><th>Requirement</th><th>Use</th></tr>
<tr><td>All internet traffic of a VPN breaks out locally</td><td>NAT DIA route</td></tr>
<tr><td>Only guests, or only a subset of sources, break out</td><td>Data policy with <code>nat use-vpn 0</code></td></tr>
<tr><td>Only trusted SaaS breaks out, the rest is inspected centrally</td><td>Data policy with an app list</td></tr>
<tr><td>Safe behaviour when the local link fails</td><td><code>fallback</code> and an endpoint tracker</td></tr>
<tr><td>Cloud-based inspection without a local firewall</td><td>SIG tunnel</td></tr>
<tr><td>Best exit for Microsoft 365 or Webex</td><td>Cloud OnRamp for SaaS</td></tr>
<tr><td>Branches reach AWS, Azure or Google workloads</td><td>Cloud OnRamp for Multicloud</td></tr></table>

<h3>Glossary</h3>
<ul>
<li><b>Backhaul:</b> carrying branch internet traffic to a central site before it exits.</li>
<li><b>DIA:</b> Direct Internet Access, local breakout at the branch.</li>
<li><b>PAT / overload:</b> many private addresses share one public address using ports.</li>
<li><b>NAT DIA route:</b> VRF default route via NAT to the global table, AD 6.</li>
<li><b>nat use-vpn 0:</b> data-policy action that sends matched traffic to VPN 0 with NAT.</li>
<li><b>Endpoint tracker:</b> probe that removes the DIA exit when the target is unreachable.</li>
<li><b>vQoE:</b> the quality score Cloud OnRamp for SaaS derives from loss and latency.</li>
<li><b>Gateway site:</b> a site that offers its internet exit to client sites.</li>
<li><b>Cloud gateway:</b> a Catalyst 8000V pair deployed by Cloud OnRamp for Multicloud.</li>
<li><b>SIG:</b> secure internet gateway, a cloud security service reached by tunnel.</li>
</ul>

<div class="eg"><p><b>Worked example for revision.</b> Bharat Retail wants Pune guests on local internet, staff on the DC firewall, Microsoft 365 on the best exit, and the ERP in AWS reachable privately. Answer: NAT on Gi1; a data policy for GUEST-NETS with <code>nat use-vpn 0 fallback</code>; no NAT DIA route for VPN 10; Cloud OnRamp for SaaS for Microsoft 365 with Pune as hybrid site; Cloud OnRamp for Multicloud for the ERP; a zone firewall on E-BR1 for guest traffic.</p></div>

<div class="warn"><p><b>Top five mistakes to avoid.</b> NAT without a route or policy; a route for the wrong VRF; a policy that matches source only and sends internal traffic to the internet; DIA without any security control; confusing Cloud OnRamp for SaaS with Multicloud.</p></div>

<div class="exam"><p><b>Exam checklist.</b> Tick each item before the exam:</p><ul>
<li>I can explain backhaul vs DIA with one advantage and one risk of each.</li>
<li>I can write the NAT configuration and name the system access list.</li>
<li>I know AD 6 vs 251 and why longest match keeps overlay traffic in the overlay.</li>
<li>I can build a selective DIA data policy and explain direction from-service.</li>
<li>I know what <code>fallback</code> does and what a tracker does.</li>
<li>I can read <code>show sdwan nat-dia summary</code> including the "none" case.</li>
<li>I can describe NAT is not a firewall and name three security options.</li>
<li>I can explain DNS split and redirect problems.</li>
<li>I can compare Cloud OnRamp for SaaS, Multicloud, IaaS and Interconnect.</li>
<li>I can run the six-step DIA troubleshooting workflow.</li>
</ul></div>

<div class="scn"><h4>The final review</h4><p>A colleague claims "we have DIA because NAT is configured". Using this chapter you ask three questions: what steers traffic to the exit, which VRF does it match, and what protects the branch? Two answers are missing, and you fix them before the audit.</p><p><b>Lesson:</b> DIA is a design with four parts and a security plan, not one command.</p></div>

<div class="iv"><p class="q">"Summarize DIA in SD-WAN in one minute."</p><p>DIA lets a branch send internet traffic out through its own transport instead of backhauling to the DC. You enable NAT on the transport interface, then steer traffic with a NAT DIA route for the whole VPN or a data policy with nat use-vpn 0 for selected traffic, add fallback and an endpoint tracker for resilience, and secure the branch with a zone firewall, IPS, DNS security or SIG. Cloud OnRamp for SaaS then chooses the best exit per application, and Multicloud extends the fabric to AWS, Azure and Google Cloud.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NAT prepares; a route or policy steers; fallback and trackers protect; security must be added.</li>
<li>Route = whole VPN; policy = selective.</li>
<li>Cloud OnRamp for SaaS chooses exits; Multicloud extends the fabric.</li>
<li>Troubleshoot in four parts and prove with a translation.</li>
</ul></div>
`,hi:`
<p>Tumne ek aisi branch se shuru kiya jo har internet packet data center tak le jaati thi. Ab tum jaante ho ki use locally kaise nikalna hai, route aur policy mein se kaise chunna hai, use safe kaise rakhna hai, Cloud OnRamp exits kaise chunta hai aur fabric ko clouds tak kaise badhata hai, aur troubleshoot kaise karna hai. Yeh aakhri chapter sab kuch ek page par jama karta hai jo tum exam se pehle raat ko revise kar sako.</p>

<h3>Chhe sentences mein badi tasveer</h3>
<ol>
<li><b>Backhaul</b> branch ka internet traffic DC ke through bhejta hai; simple aur central hai lekin latency badhata hai aur hub par load daalta hai.</li>
<li><b>DIA</b> branch ko apne transport se NAT (PAT) ke saath breakout karne deta hai.</li>
<li>NAT sirf <b>exit taiyaar karta hai</b>. Traffic wahan <b>NAT DIA route</b> (VPN ka saara, AD 6, <code>n*Nd</code>) ya <code>nat use-vpn 0</code> wali <b>data policy</b> (selective, from-service lagi) se pahunchta hai.</li>
<li><b>Fallback</b> aur <b>endpoint tracker</b> local exit fail hone par users ko bachate hain.</li>
<li>DIA security perimeter ko branch par le aata hai: zone firewall, IPS, DNS security ya SIG tunnel use karo, aur NAT ko kabhi firewall mat samjho.</li>
<li><b>Cloud OnRamp</b> for SaaS per application best exit chunta hai; Multicloud cloud gateways deploy karta hai aur unhe native cloud networks se jodta hai.</li>
</ol>

<h3>Cheat sheet: configuration</h3>
<pre class="code">interface GigabitEthernet1
 ip nat outside
ip nat inside source list nat-dia-vpn-hop-access-list interface GigabitEthernet1 overload
ip nat route vrf 10 0.0.0.0 0.0.0.0 global

data-policy GUEST-DIA
 vpn-list GUEST-VPN
  sequence 5
   match destination-data-prefix-list INTERNAL-NETS
   action accept
  sequence 10
   match source-data-prefix-list GUEST-NETS
   action accept
    nat use-vpn 0 fallback
  default-action accept
apply-policy
 site-list PUNE
  data-policy GUEST-DIA from-service</pre>

<h3>Cheat sheet: verification</h3>
<table class="cmp"><tr><th>Command</th><th>Kya batata hai</th></tr>
<tr><td><code>show ip route vrf 10</code></td><td><code>n*Nd</code> default hai ya nahi aur uske peeche OMP default</td></tr>
<tr><td><code>show sdwan nat-dia summary</code></td><td>NAT DIA interfaces aur routes; "none" matlab transport par NAT missing</td></tr>
<tr><td><code>show ip nat statistics</code> / <code>translations vrf 10</code></td><td>Outside interfaces, active translations, inside global address</td></tr>
<tr><td><code>show sdwan policy from-vsmart</code></td><td>Edge ko mili data policy</td></tr>
<tr><td><code>show sdwan policy service-path ...</code></td><td>Flow ke liye edge ka forwarding decision: overlay ya local NAT</td></tr>
<tr><td><code>show endpoint-tracker</code></td><td>Tracker status: up ya down, aur round-trip time</td></tr></table>

<h3>Decision table</h3>
<table class="cmp"><tr><th>Requirement</th><th>Use</th></tr>
<tr><td>VPN ka saara internet traffic locally nikle</td><td>NAT DIA route</td></tr>
<tr><td>Sirf guests, ya sirf kuch sources breakout karein</td><td><code>nat use-vpn 0</code> wali data policy</td></tr>
<tr><td>Sirf trusted SaaS breakout kare, baaki centrally inspect ho</td><td>App list wali data policy</td></tr>
<tr><td>Local link fail hone par safe behaviour</td><td><code>fallback</code> aur endpoint tracker</td></tr>
<tr><td>Local firewall ke bina cloud-based inspection</td><td>SIG tunnel</td></tr>
<tr><td>Microsoft 365 ya Webex ke liye best exit</td><td>Cloud OnRamp for SaaS</td></tr>
<tr><td>Branches AWS, Azure ya Google workloads tak pahunchein</td><td>Cloud OnRamp for Multicloud</td></tr></table>

<h3>Glossary</h3>
<ul>
<li><b>Backhaul:</b> branch ka internet traffic nikalne se pehle central site tak le jaana.</li>
<li><b>DIA:</b> Direct Internet Access, branch par local breakout.</li>
<li><b>PAT / overload:</b> kai private addresses ports se ek public address share karte hain.</li>
<li><b>NAT DIA route:</b> NAT ke through global table ki taraf VRF default route, AD 6.</li>
<li><b>nat use-vpn 0:</b> data-policy action jo matched traffic ko NAT ke saath VPN 0 bhejta hai.</li>
<li><b>Endpoint tracker:</b> probe jo target unreachable hone par DIA exit hata deta hai.</li>
<li><b>vQoE:</b> loss aur latency se Cloud OnRamp for SaaS ka banaya quality score.</li>
<li><b>Gateway site:</b> woh site jo apna internet exit client sites ko offer karti hai.</li>
<li><b>Cloud gateway:</b> Cloud OnRamp for Multicloud ka deploy kiya Catalyst 8000V pair.</li>
<li><b>SIG:</b> secure internet gateway, tunnel se pahunchi cloud security service.</li>
</ul>

<div class="eg"><p><b>Revision ke liye worked example.</b> Bharat Retail chahta hai ki Pune guests local internet par hon, staff DC firewall par, Microsoft 365 best exit par, aur AWS mein ERP privately reachable ho. Jawab: Gi1 par NAT; GUEST-NETS ke liye <code>nat use-vpn 0 fallback</code> wali data policy; VPN 10 ke liye NAT DIA route nahi; Microsoft 365 ke liye Pune ko hybrid site banakar Cloud OnRamp for SaaS; ERP ke liye Cloud OnRamp for Multicloud; guest traffic ke liye E-BR1 par zone firewall.</p></div>

<div class="warn"><p><b>Bachne wali top paanch galtiyan.</b> Route ya policy ke bina NAT; galat VRF ka route; sirf source match karne wali policy jo internal traffic ko internet bhej deti hai; kisi security control ke bina DIA; Cloud OnRamp for SaaS ko Multicloud se confuse karna.</p></div>

<div class="exam"><p><b>Exam checklist.</b> Exam se pehle har item tick karo:</p><ul>
<li>Main backhaul vs DIA ek advantage aur ek risk ke saath samjha sakta hoon.</li>
<li>Main NAT configuration likh sakta hoon aur system access list ka naam bata sakta hoon.</li>
<li>Main AD 6 vs 251 jaanta hoon aur longest match overlay traffic ko overlay mein kyun rakhta hai.</li>
<li>Main selective DIA data policy bana sakta hoon aur direction from-service samjha sakta hoon.</li>
<li>Main jaanta hoon <code>fallback</code> kya karta hai aur tracker kya karta hai.</li>
<li>Main <code>show sdwan nat-dia summary</code> padh sakta hoon, "none" case ke saath.</li>
<li>Main samjha sakta hoon ki NAT firewall nahi hai aur teen security options bata sakta hoon.</li>
<li>Main DNS split aur redirect problems samjha sakta hoon.</li>
<li>Main Cloud OnRamp for SaaS, Multicloud, IaaS aur Interconnect compare kar sakta hoon.</li>
<li>Main six-step DIA troubleshooting workflow chala sakta hoon.</li>
</ul></div>

<div class="scn"><h4>Aakhri review</h4><p>Ek colleague kehta hai "hamare paas DIA hai kyunki NAT configured hai". Is chapter se tum teen sawaal poochte ho: exit tak traffic kaun steer karta hai, woh kaunsa VRF match karta hai, aur branch ko kya protect karta hai? Do jawab missing hain, aur tum audit se pehle unhe fix kar dete ho.</p><p><b>Lesson:</b> DIA chaar parts aur security plan wala design hai, ek command nahi.</p></div>

<div class="iv"><p class="q">"SD-WAN mein DIA ko ek minute mein summarize karo."</p><p>DIA branch ko DC tak backhaul karne ke bajaye apne transport se internet traffic nikalne deta hai. Tum transport interface par NAT enable karte ho, phir traffic ko poore VPN ke liye NAT DIA route se ya selected traffic ke liye nat use-vpn 0 wali data policy se steer karte ho, resilience ke liye fallback aur endpoint tracker lagate ho, aur branch ko zone firewall, IPS, DNS security ya SIG se secure karte ho. Phir Cloud OnRamp for SaaS per application best exit chunta hai, aur Multicloud fabric ko AWS, Azure aur Google Cloud tak extend karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NAT taiyaar karta hai; route ya policy steer karti hai; fallback aur trackers bachate hain; security alag se jodni padti hai.</li>
<li>Route = poora VPN; policy = selective.</li>
<li>Cloud OnRamp for SaaS exits chunta hai; Multicloud fabric extend karta hai.</li>
<li>Chaar parts mein troubleshoot karo aur translation se saabit karo.</li>
</ul></div>
`}};export{e as default};