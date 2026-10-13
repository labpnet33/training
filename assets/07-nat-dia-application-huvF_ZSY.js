var e={id:`nat-dia-application`,h:{en:`Layers 7 and 8: DIA and NAT faults, and the "application is slow" ticket`,hi:`Layers 7 aur 8: DIA aur NAT faults, aur "application slow hai" ticket`},body:{en:`
<p>A courier delivers a parcel to your building, but it has to go out again through the main gate to reach the shop across the road. For that trip somebody must open the gate (a route), write the building's public address on the parcel (NAT) and know where the shop is (DNS). If the parcel never arrives, the fault is in one of those three. Direct Internet Access (DIA) from a branch is exactly this trip, and "the application is slow" is the other half of the story: the parcel arrives, but late.</p>

<h3>DIA: the five conditions</h3>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="DIA path from LAN to internet">
<rect x="10" y="60" width="100" height="70" rx="8" fill="#bbf7d0"/><text x="60" y="88" text-anchor="middle" class="svg-ink" font-size="13">Host</text><text x="60" y="106" text-anchor="middle" class="svg-muted" font-size="11">10.3.10.10</text>
<rect x="150" y="40" width="190" height="110" rx="8" fill="#bae6fd"/><text x="245" y="64" text-anchor="middle" class="svg-ink" font-size="13">E-BLR-1</text><text x="245" y="88" text-anchor="middle" class="svg-muted" font-size="11">1 route in VPN 10 to the internet</text><text x="245" y="106" text-anchor="middle" class="svg-muted" font-size="11">2 policy allows or sends it local</text><text x="245" y="124" text-anchor="middle" class="svg-muted" font-size="11">3 NAT on the VPN 0 interface</text>
<rect x="380" y="60" width="100" height="70" rx="8" fill="#fde68a"/><text x="430" y="88" text-anchor="middle" class="svg-ink" font-size="13">ISP</text><text x="430" y="106" text-anchor="middle" class="svg-muted" font-size="11">4 return path</text>
<rect x="520" y="60" width="110" height="70" rx="8" fill="#ddd6fe"/><text x="575" y="88" text-anchor="middle" class="svg-ink" font-size="13">Internet</text><text x="575" y="106" text-anchor="middle" class="svg-muted" font-size="11">5 DNS answers</text>
<line x1="110" y1="95" x2="150" y2="95" stroke="#64748b" stroke-width="2"/><line x1="340" y1="95" x2="380" y2="95" stroke="#64748b" stroke-width="2"/><line x1="480" y1="95" x2="520" y2="95" stroke="#64748b" stroke-width="2"/>
<text x="320" y="178" text-anchor="middle" class="svg-accent" font-size="12">Five conditions: route, policy, NAT, return path, DNS</text>
</svg><p class="cap">Every DIA ticket is one of these five.</p></div>
<p>The design side of DIA belongs to the sdw-dia module; here we only check it. Work through the five conditions in this order.</p>
<ol>
<li><b>Route.</b> The service VPN needs a path to the internet: either a default route that leads out through VPN 0 on this edge, or an OMP default route learned from a hub (backhaul). <code>show ip route vrf 10 0.0.0.0</code> tells you which one is in use. If the OMP default from the data centre wins, traffic goes to the hub, not out of the branch, even if the NAT is perfect.</li>
<li><b>Policy.</b> A data policy may send chosen applications to the local internet and the rest to the hub. Check that the policy matches the traffic (chapter 6) and that the action is "local" with the right colour.</li>
<li><b>NAT.</b> NAT must be enabled on the VPN 0 interface that goes to the internet. <code>show ip nat translations</code> and <code>show ip nat statistics</code> show whether translations are created.</li>
<li><b>Return path.</b> The reply must come back to the same edge. A second router at the branch, an upstream firewall or an asymmetrical route can break it.</li>
<li><b>DNS.</b> Hosts must resolve names. Test with a name and with an address: if the address works and the name does not, it is DNS (including DNS security from sdw-sec, which may block by policy).</li>
</ol>
<pre class="code">E-BLR-1# show ip route vrf 10 0.0.0.0
E-BLR-1# ping vrf 10 192.0.2.80 source GigabitEthernet2
E-BLR-1# show ip nat translations
E-BLR-1# show ip nat statistics
E-BLR-1# traceroute vrf 10 192.0.2.80</pre>
<pre class="out">E-BLR-1# show ip nat translations
Pro  Inside global      Inside local       Outside local      Outside global
icmp 203.0.113.14:1     10.3.10.10:1       192.0.2.80:1       192.0.2.80:1
tcp  203.0.113.14:50211 10.3.10.10:50211   192.0.2.80:443     192.0.2.80:443

E-BLR-1# show ip nat statistics
Total active translations: 2
Hits: 318  Misses: 4</pre>
<p>If translations are being created and the counters grow but users still fail, the fault is further out: the return path or DNS. If there are <b>no translations at all</b>, the traffic never reached the NAT: check the route and the policy. If there are translations and a rising <b>Misses</b> count, packets arrive that the NAT cannot match, which suggests asymmetric routing or an incorrect inside interface.</p>

<h3>Order of the checks, and what each result tells you</h3>
<table class="cmp"><tr><th>Evidence</th><th>Meaning</th><th>Next step</th></tr>
<tr><td>Default route in VPN 10 is learned from OMP</td><td>Traffic uses the hub, not local DIA</td><td>Check the policy or the route preference</td></tr>
<tr><td>Ping to an internet address fails from the router with the LAN source</td><td>Route, NAT or ISP problem</td><td>Check NAT translations and the ISP</td></tr>
<tr><td>Ping to the address works, name fails</td><td>DNS</td><td>Name servers, DNS security policy</td></tr>
<tr><td>Everything works for some sites only</td><td>Certificate inspection, URL filtering or firewall rule</td><td>sdw-sec policy logs</td></tr>
<tr><td>Works for a few seconds then stops</td><td>NAT table exhaustion, timeout or failover</td><td>NAT statistics, BFD events</td></tr></table>

<h3>Layer 8: "the application is slow"</h3>
<p>This is the most common and least precise ticket. The cure is to turn it into measurements. Ask: which application, from which site, since when, and how slow (a number). Then separate three suspects: the <b>path</b> (our network), the <b>device</b> (the edge itself) and the <b>end</b> (client or server, which we do not own).</p>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Slow application suspects">
<rect x="10" y="40" width="190" height="90" rx="10" fill="#bae6fd"/><text x="105" y="66" text-anchor="middle" class="svg-ink" font-size="14">The path</text><text x="105" y="88" text-anchor="middle" class="svg-muted" font-size="11">loss, latency, jitter</text><text x="105" y="104" text-anchor="middle" class="svg-muted" font-size="11">which tunnel, SLA, MTU</text>
<rect x="225" y="40" width="190" height="90" rx="10" fill="#fde68a"/><text x="320" y="66" text-anchor="middle" class="svg-ink" font-size="14">The edge</text><text x="320" y="88" text-anchor="middle" class="svg-muted" font-size="11">queue drops, CPU</text><text x="320" y="104" text-anchor="middle" class="svg-muted" font-size="11">interface errors, throughput</text>
<rect x="440" y="40" width="190" height="90" rx="10" fill="#fbcfe8"/><text x="535" y="66" text-anchor="middle" class="svg-ink" font-size="14">The ends</text><text x="535" y="88" text-anchor="middle" class="svg-muted" font-size="11">server load, DNS</text><text x="535" y="104" text-anchor="middle" class="svg-muted" font-size="11">client, application</text>
</svg><p class="cap">Prove which of the three, then fix; do not start with the network by default.</p></div>

<h4>The path</h4>
<pre class="out">E-BLR-1# show sdwan app-route stats
app-route statistics 203.0.113.14 203.0.113.6 ipsec 12346 12346
 remote-system-ip         10.255.0.11
 local-color              biz-internet
 remote-color             biz-internet
 mean-loss                <span class="hl">3</span>
 mean-latency             <span class="hl">68</span>
 mean-jitter              <span class="hl">12</span></pre>
<p>Loss in percent, latency and jitter in milliseconds. Compare them with the SLA class that the application-aware policy uses (sdw-aar). If the numbers exceed the SLA, the policy should move the traffic to another tunnel; if it did not, check that the policy matched the application and that the other tunnel was inside the SLA. If the numbers are good, the network path is not the cause. In the Manager, the tunnel and application views plot the same values over time, and a flow-simulation tool in the device troubleshooting section (where your release offers it) tells you which path a given flow would take.</p>

<h4>The edge</h4>
<pre class="code">E-BLR-1# show policy-map interface GigabitEthernet1 | include Class-map|drops|packets
E-BLR-1# show interfaces GigabitEthernet1 | include error|drops|rate
E-BLR-1# show processes cpu sorted | exclude 0.00</pre>
<p>Queue drops mean the circuit is saturated or the shaper is too tight (sdw-qos). Interface errors mean a cable, duplex or SFP problem. High CPU, or traffic near the licensed throughput of the platform, slows everything. Compare with the baseline you recorded earlier (sdw-ops chapter 8).</p>

<h4>The ends</h4>
<p>If path and edge are healthy, test the other parts: does the server respond quickly from another site? Does DNS answer fast (<code>nslookup</code> time from the host)? Is the problem one client only? The Manager cannot fix a slow database, but it can prove that the network is clean, which ends the argument quickly.</p>

<h4>Typical causes, with the proof you need</h4>
<table class="cmp"><tr><th>Cause</th><th>Proof</th></tr>
<tr><td>Backhaul instead of DIA, adding latency</td><td>Traceroute and route table show the hub; the same app via local DIA is faster</td></tr>
<tr><td>Loss on one transport</td><td>app-route stats loss; BFD flaps; provider path</td></tr>
<tr><td>Congestion with no QoS</td><td>Queue drops in the default class; voice and backup share a queue</td></tr>
<tr><td>MTU or MSS problem</td><td>Large DF pings fail; transfers stall (chapter 5)</td></tr>
<tr><td>DNS resolution delay</td><td>Name lookups take seconds; address access is fast</td></tr>
<tr><td>Policy sends traffic the long way</td><td>Counters and flow simulation show a different path than intended</td></tr></table>

<div class="eg"><p><b>Worked example.</b> The Pune branch complains that Microsoft 365 is slow. Traceroute from VPN 10 passes the hub in Delhi before going out: 70 ms. The data policy for Microsoft 365 uses an application list, but <code>show sdwan policy from-vsmart</code> on E-BLR-1 is empty (site 300 is not in the site list). Fixing the site list sends the traffic through local DIA at 18 ms. The saving: 70 minus 18 is 52 ms for every round trip, which is why page loads that need dozens of round trips feel instant again.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Accepting "slow" without numbers. (2) Blaming the network before checking the server and DNS. (3) Testing the internet from VPN 0 and calling DIA fine. (4) Ignoring a default route learned from OMP. (5) Forgetting that NAT tables and CPU have limits.</p></div>

<div class="exam"><p><b>Exam trap.</b> DIA needs NAT on the WAN interface in VPN 0 and a way for VPN 10 to reach it: a route to VPN 0 or a data policy with local action. An OMP default route may take precedence. The app-route statistics report loss, latency and jitter for the SLA decision.</p></div>

<div class="scn"><h4>The slow ERP at 3 p.m.</h4><p>Every afternoon at 15:00 the ERP at Mumbai is slow for ten minutes. The app-route stats show healthy tunnels. The queue statistics on the Mumbai WAN interface show drops in the default class at those times, when a nightly backup, which had been moved to the afternoon, runs. The ERP traffic was not in a protected class. Moving the ERP to a business-critical class (sdw-qos) solved it; the backup was shaped.</p><p><b>Lesson:</b> a regular time of day usually means a regular job.</p></div>

<div class="iv"><p class="q">"Users say Office 365 is slow at one branch. What do you do?"</p><p>I ask for numbers and the start time, then check the path: which route and tunnel it takes, whether DIA is used, and the loss, latency and jitter. Then the edge: queue drops, interface errors and CPU. Then the ends: DNS and the service. I compare with another branch, and only then change a policy or QoS setting.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>DIA needs five things: route, policy, NAT, return path and DNS.</li>
<li>No NAT translations means traffic did not reach NAT; check route and policy first.</li>
<li>An OMP default route can silently send traffic to the hub.</li>
<li>For "slow", split into path, edge and ends, and collect numbers.</li>
<li>Regular timing points to a regular cause such as a backup job.</li>
</ul></div>
`,hi:`
<p>Courier aapki building tak parcel laata hai, lekin sadak ke paar dukaan tak jaane ke liye use main gate se wapas bahar nikalna padta hai. Us safar ke liye kisi ko gate kholna hoga (route), parcel par building ka public address likhna hoga (NAT) aur dukaan kahan hai yeh pata hona chahiye (DNS). Parcel na pahunche to fault in teen mein se kisi ek mein hai. Branch se Direct Internet Access (DIA) bilkul yahi safar hai, aur "application slow hai" kahani ka doosra aadha hissa hai: parcel pahunchta hai, lekin der se.</p>

<h3>DIA: paanch conditions</h3>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="DIA path from LAN to internet">
<rect x="10" y="60" width="100" height="70" rx="8" fill="#bbf7d0"/><text x="60" y="88" text-anchor="middle" class="svg-ink" font-size="13">Host</text><text x="60" y="106" text-anchor="middle" class="svg-muted" font-size="11">10.3.10.10</text>
<rect x="150" y="40" width="190" height="110" rx="8" fill="#bae6fd"/><text x="245" y="64" text-anchor="middle" class="svg-ink" font-size="13">E-BLR-1</text><text x="245" y="88" text-anchor="middle" class="svg-muted" font-size="11">1 VPN 10 mein internet ka route</text><text x="245" y="106" text-anchor="middle" class="svg-muted" font-size="11">2 policy allow ya local bheje</text><text x="245" y="124" text-anchor="middle" class="svg-muted" font-size="11">3 VPN 0 interface par NAT</text>
<rect x="380" y="60" width="100" height="70" rx="8" fill="#fde68a"/><text x="430" y="88" text-anchor="middle" class="svg-ink" font-size="13">ISP</text><text x="430" y="106" text-anchor="middle" class="svg-muted" font-size="11">4 return path</text>
<rect x="520" y="60" width="110" height="70" rx="8" fill="#ddd6fe"/><text x="575" y="88" text-anchor="middle" class="svg-ink" font-size="13">Internet</text><text x="575" y="106" text-anchor="middle" class="svg-muted" font-size="11">5 DNS jawab de</text>
<line x1="110" y1="95" x2="150" y2="95" stroke="#64748b" stroke-width="2"/><line x1="340" y1="95" x2="380" y2="95" stroke="#64748b" stroke-width="2"/><line x1="480" y1="95" x2="520" y2="95" stroke="#64748b" stroke-width="2"/>
<text x="320" y="178" text-anchor="middle" class="svg-accent" font-size="12">Paanch conditions: route, policy, NAT, return path, DNS</text>
</svg><p class="cap">Har DIA ticket inmein se ek hai.</p></div>
<p>DIA ka design hissa sdw-dia module ka hai; yahan hum sirf use check karte hain. Paanch conditions is order mein dekho.</p>
<ol>
<li><b>Route.</b> Service VPN ko internet ka path chahiye: ya to default route jo is edge par VPN 0 se bahar jaata hai, ya hub se seekha OMP default route (backhaul). <code>show ip route vrf 10 0.0.0.0</code> batata hai kaunsa use ho raha hai. Agar data centre ka OMP default jeetta hai to traffic hub jaata hai, branch se bahar nahi, chahe NAT perfect ho.</li>
<li><b>Policy.</b> Data policy chuni hui applications ko local internet par aur baaki ko hub par bhej sakti hai. Check karo ki policy traffic se match karti hai (chapter 6) aur action sahi colour ke saath "local" hai.</li>
<li><b>NAT.</b> NAT internet ki taraf jaane wale VPN 0 interface par enabled hona chahiye. <code>show ip nat translations</code> aur <code>show ip nat statistics</code> dikhate hain ki translations ban rahe hain ya nahi.</li>
<li><b>Return path.</b> Reply usi edge par wapas aana chahiye. Branch par doosra router, upstream firewall ya asymmetrical route ise tod sakta hai.</li>
<li><b>DNS.</b> Hosts ko names resolve karne chahiye. Naam se aur address se test karo: address chale aur naam nahi to DNS hai (sdw-sec ki DNS security samet, jo policy se block kar sakti hai).</li>
</ol>
<pre class="code">E-BLR-1# show ip route vrf 10 0.0.0.0
E-BLR-1# ping vrf 10 192.0.2.80 source GigabitEthernet2
E-BLR-1# show ip nat translations
E-BLR-1# show ip nat statistics
E-BLR-1# traceroute vrf 10 192.0.2.80</pre>
<pre class="out">E-BLR-1# show ip nat translations
Pro  Inside global      Inside local       Outside local      Outside global
icmp 203.0.113.14:1     10.3.10.10:1       192.0.2.80:1       192.0.2.80:1
tcp  203.0.113.14:50211 10.3.10.10:50211   192.0.2.80:443     192.0.2.80:443

E-BLR-1# show ip nat statistics
Total active translations: 2
Hits: 318  Misses: 4</pre>
<p>Agar translations ban rahe hain aur counters badh rahe hain lekin users phir bhi fail hain, to fault aage hai: return path ya DNS. Agar <b>koi translation hi nahi</b> hai, to traffic NAT tak pahuncha hi nahi: route aur policy dekho. Agar translations hain aur <b>Misses</b> badh raha hai, to aise packets aa rahe hain jinhe NAT match nahi kar sakta, jo asymmetric routing ya galat inside interface ki taraf ishara karta hai.</p>

<h3>Checks ka order, aur har result kya batata hai</h3>
<table class="cmp"><tr><th>Evidence</th><th>Matlab</th><th>Agla step</th></tr>
<tr><td>VPN 10 ka default route OMP se seekha hua hai</td><td>Traffic hub use karta hai, local DIA nahi</td><td>Policy ya route preference dekho</td></tr>
<tr><td>Router se LAN source ke saath internet address ping fail</td><td>Route, NAT ya ISP problem</td><td>NAT translations aur ISP dekho</td></tr>
<tr><td>Address ka ping chalta hai, naam fail</td><td>DNS</td><td>Name servers, DNS security policy</td></tr>
<tr><td>Sab kuch sirf kuch sites ke liye chalta hai</td><td>Certificate inspection, URL filtering ya firewall rule</td><td>sdw-sec policy logs</td></tr>
<tr><td>Kuch second chalta hai phir ruk jaata hai</td><td>NAT table exhaustion, timeout ya failover</td><td>NAT statistics, BFD events</td></tr></table>

<h3>Layer 8: "application slow hai"</h3>
<p>Yeh sabse aam aur sabse kam precise ticket hai. Ilaaj hai ise measurements mein badalna. Poochho: kaunsi application, kis site se, kab se, aur kitni slow (ek number). Phir teen shak alag karo: <b>path</b> (hamara network), <b>device</b> (edge khud) aur <b>ends</b> (client ya server, jo hamare nahi).</p>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Slow application suspects">
<rect x="10" y="40" width="190" height="90" rx="10" fill="#bae6fd"/><text x="105" y="66" text-anchor="middle" class="svg-ink" font-size="14">Path</text><text x="105" y="88" text-anchor="middle" class="svg-muted" font-size="11">loss, latency, jitter</text><text x="105" y="104" text-anchor="middle" class="svg-muted" font-size="11">kaunsa tunnel, SLA, MTU</text>
<rect x="225" y="40" width="190" height="90" rx="10" fill="#fde68a"/><text x="320" y="66" text-anchor="middle" class="svg-ink" font-size="14">Edge</text><text x="320" y="88" text-anchor="middle" class="svg-muted" font-size="11">queue drops, CPU</text><text x="320" y="104" text-anchor="middle" class="svg-muted" font-size="11">interface errors, throughput</text>
<rect x="440" y="40" width="190" height="90" rx="10" fill="#fbcfe8"/><text x="535" y="66" text-anchor="middle" class="svg-ink" font-size="14">Ends</text><text x="535" y="88" text-anchor="middle" class="svg-muted" font-size="11">server load, DNS</text><text x="535" y="104" text-anchor="middle" class="svg-muted" font-size="11">client, application</text>
</svg><p class="cap">Sabit karo teen mein se kaunsa, phir fix karo; default mein network se shuru mat karo.</p></div>

<h4>Path</h4>
<pre class="out">E-BLR-1# show sdwan app-route stats
app-route statistics 203.0.113.14 203.0.113.6 ipsec 12346 12346
 remote-system-ip         10.255.0.11
 local-color              biz-internet
 remote-color             biz-internet
 mean-loss                <span class="hl">3</span>
 mean-latency             <span class="hl">68</span>
 mean-jitter              <span class="hl">12</span></pre>
<p>Loss percent mein, latency aur jitter milliseconds mein. Unhe application-aware policy ki SLA class se compare karo (sdw-aar). Numbers SLA se bahar hon to policy ko traffic doosre tunnel par le jaana chahiye; na le gayi ho to check karo ki policy ne application match ki aur doosra tunnel SLA ke andar tha. Numbers achhe hon to network path wajah nahi. Manager mein tunnel aur application views wahi values samay ke saath plot karte hain, aur device troubleshooting section ka flow-simulation tool (jahan aapka release deta hai) batata hai ki di gayi flow kaunsa path legi.</p>

<h4>Edge</h4>
<pre class="code">E-BLR-1# show policy-map interface GigabitEthernet1 | include Class-map|drops|packets
E-BLR-1# show interfaces GigabitEthernet1 | include error|drops|rate
E-BLR-1# show processes cpu sorted | exclude 0.00</pre>
<p>Queue drops matlab circuit saturated hai ya shaper bahut tight hai (sdw-qos). Interface errors matlab cable, duplex ya SFP problem. High CPU, ya platform ke licensed throughput ke paas ka traffic sab kuch slow kar deta hai. Pehle record ki hui baseline se compare karo (sdw-ops chapter 8).</p>

<h4>Ends</h4>
<p>Path aur edge theek hon to baaki hisse test karo: kya server doosri site se tezi se jawab deta hai? DNS tezi se jawab deta hai (host se <code>nslookup</code> ka time)? Problem sirf ek client ki hai? Manager slow database theek nahi kar sakta, lekin yeh sabit kar sakta hai ki network saaf hai, jo behes jaldi khatam karta hai.</p>

<h4>Aam wajahein, zaroori saboot ke saath</h4>
<table class="cmp"><tr><th>Wajah</th><th>Saboot</th></tr>
<tr><td>DIA ki jagah backhaul, latency badhti hai</td><td>Traceroute aur route table hub dikhate hain; wahi app local DIA se tez hai</td></tr>
<tr><td>Ek transport par loss</td><td>app-route stats loss; BFD flaps; provider path</td></tr>
<tr><td>QoS ke bina congestion</td><td>Default class mein queue drops; voice aur backup ek queue mein</td></tr>
<tr><td>MTU ya MSS problem</td><td>Bade DF pings fail; transfers atakte hain (chapter 5)</td></tr>
<tr><td>DNS resolution delay</td><td>Name lookups mein seconds lagte hain; address se access tez hai</td></tr>
<tr><td>Policy traffic ko lamba raasta de rahi hai</td><td>Counters aur flow simulation iraade se alag path dikhate hain</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Pune branch shikayat karti hai ki Microsoft 365 slow hai. VPN 10 se traceroute bahar jaane se pehle Delhi ke hub se guzarta hai: 70 ms. Microsoft 365 ki data policy application list use karti hai, lekin E-BLR-1 par <code>show sdwan policy from-vsmart</code> khaali hai (site 300 site list mein nahi). Site list theek karne se traffic local DIA se 18 ms par jaata hai. Bachat: 70 minus 18 yaani har round trip par 52 ms, isliye woh page loads jinhe darjano round trips chahiye phir turant lagte hain.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Numbers ke bina "slow" maan lena. (2) Server aur DNS dekhne se pehle network ko doshi thehrana. (3) VPN 0 se internet test karke DIA ko theek kehna. (4) OMP se seekha default route ignore karna. (5) Yeh bhoolna ki NAT tables aur CPU ki limits hoti hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> DIA ko VPN 0 ki WAN interface par NAT chahiye aur VPN 10 ke liye use pahunchne ka tareeka: VPN 0 ka route ya local action wali data policy. OMP default route precedence le sakta hai. app-route statistics SLA decision ke liye loss, latency aur jitter batati hain.</p></div>

<div class="scn"><h4>Dopahar 3 baje slow ERP</h4><p>Roz 15:00 par Mumbai ka ERP das minute ke liye slow hota hai. App-route stats mein tunnels healthy hain. Mumbai WAN interface ke queue statistics un waqton default class mein drops dikhate hain, jab nightly backup, jo dopahar mein shift ho gaya tha, chalta hai. ERP traffic protected class mein nahi tha. ERP ko business-critical class mein le jaane (sdw-qos) se theek hua; backup shape kiya gaya.</p><p><b>Lesson:</b> din ka regular waqt aksar regular job hota hai.</p></div>

<div class="iv"><p class="q">"Users kehte hain ek branch par Office 365 slow hai. Kya karoge?"</p><p>Main numbers aur shuru hone ka waqt maangta hoon, phir path dekhta hoon: kaunsa route aur tunnel, DIA use ho raha hai, aur loss, latency aur jitter. Phir edge: queue drops, interface errors aur CPU. Phir ends: DNS aur service. Doosri branch se compare karta hoon, aur tabhi policy ya QoS setting badalta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>DIA ko paanch cheezein chahiye: route, policy, NAT, return path aur DNS.</li>
<li>NAT translations nahi to traffic NAT tak nahi pahuncha; pehle route aur policy dekho.</li>
<li>OMP default route chupke se traffic hub ko bhej sakta hai.</li>
<li>"Slow" ke liye path, edge aur ends mein baantkar numbers ikatthe karo.</li>
<li>Regular timing regular wajah ki taraf ishara karti hai jaise backup job.</li>
</ul></div>
`}};export{e as default};