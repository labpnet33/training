var e={id:`dia-troubleshooting`,h:{en:`Troubleshooting DIA: a six-step workflow and Lab 3`,hi:`DIA troubleshooting: six-step workflow aur Lab 3`},body:{en:`
<p>"DIA is configured but the internet is dead" is one of the most common SD-WAN tickets. The fix is almost never magic. DIA has <b>four moving parts</b>, and the fault is in exactly one of them. Work from the packet's point of view: where does it leave the LAN, which table picks the exit, does NAT exist on that exit, and does the return path work?</p>

<h3>The four parts of a working DIA</h3>
<table class="cmp"><tr><th>Part</th><th>Question</th><th>Evidence</th></tr>
<tr><td>1. Steering</td><td>Does something send VPN 10 internet traffic to the transport? (NAT DIA route or <code>nat use-vpn 0</code> policy)</td><td><code>show ip route vrf 10</code> shows <code>n*Nd</code>; or policy counters increase</td></tr>
<tr><td>2. NAT on the transport</td><td>Is <code>ip nat outside</code> on the interface and the overload rule present?</td><td><code>show sdwan nat-dia summary</code>, <code>show ip nat statistics</code></td></tr>
<tr><td>3. Underlay reachability</td><td>Can the transport reach the internet? Default route in VPN 0, ISP up, DNS working?</td><td><code>ping</code> from VPN 0, <code>show ip route</code></td></tr>
<tr><td>4. Return and security</td><td>Does a firewall, ACL or tracker block it?</td><td><code>show ip nat translations</code>, ACL counters, <code>show endpoint-tracker</code></td></tr></table>

<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="Four checkpoints for a DIA packet">
<rect x="10" y="60" width="100" height="56" rx="8" fill="#bae6fd"/><text x="60" y="86" text-anchor="middle" class="svg-ink" font-size="13">STAFF-PC</text><text x="60" y="104" text-anchor="middle" class="svg-muted" font-size="11">VPN 10</text>
<rect x="150" y="60" width="110" height="56" rx="8" fill="#fde68a"/><text x="205" y="84" text-anchor="middle" class="svg-ink" font-size="13">1 Steering</text><text x="205" y="102" text-anchor="middle" class="svg-muted" font-size="11">route or policy</text>
<rect x="290" y="60" width="110" height="56" rx="8" fill="#fde68a"/><text x="345" y="84" text-anchor="middle" class="svg-ink" font-size="13">2 NAT</text><text x="345" y="102" text-anchor="middle" class="svg-muted" font-size="11">outside + PAT</text>
<rect x="430" y="60" width="90" height="56" rx="8" fill="#fde68a"/><text x="475" y="84" text-anchor="middle" class="svg-ink" font-size="13">3 Underlay</text><text x="475" y="102" text-anchor="middle" class="svg-muted" font-size="11">VPN 0</text>
<rect x="550" y="60" width="80" height="56" rx="8" fill="#ddd6fe"/><text x="590" y="92" text-anchor="middle" class="svg-ink" font-size="13">Internet</text>
<line x1="110" y1="88" x2="150" y2="88" stroke="#64748b" stroke-width="2"/><line x1="260" y1="88" x2="290" y2="88" stroke="#64748b" stroke-width="2"/><line x1="400" y1="88" x2="430" y2="88" stroke="#64748b" stroke-width="2"/><line x1="520" y1="88" x2="550" y2="88" stroke="#64748b" stroke-width="2"/>
<text x="320" y="150" text-anchor="middle" class="svg-accent" font-size="12">4 Return path and security checks apply on the way back</text>
</svg><p class="cap">Test the checkpoints in order. The first one that fails is your fault.</p></div>

<h3>The six-step workflow</h3>
<ol>
<li><b>Define the symptom precisely.</b> Which source, which destination, which VPN? Does the DC server work (10.100.10.10) while 8.8.8.8 does not? That already tells you the overlay is fine.</li>
<li><b>Check steering.</b> <code>show ip route vrf 10</code>. Do you see <code>n*Nd 0.0.0.0/0</code>? If instead there is only an OMP default (<code>m*</code>) the traffic still goes to the DC. For a policy: <code>show sdwan policy from-vsmart</code> and the data-policy counters.</li>
<li><b>Check NAT on the transport.</b> <code>show sdwan nat-dia summary</code>. "NAT DIA interfaces : none" means no interface qualifies, so the route is not installed.</li>
<li><b>Check VRF match.</b> The route or policy must name the VRF of the users. A route for VRF 20 does nothing for VRF 10.</li>
<li><b>Check the underlay.</b> From VPN 0 ping the ISP gateway and a public address. Confirm the default route in VPN 0 and that DNS resolves.</li>
<li><b>Prove it with a flow.</b> Generate a ping or a web request from STAFF-PC and look at <code>show ip nat translations vrf 10</code>. A translation to 203.0.113.10 is the final proof. Re-test the DC server to make sure the overlay still works.</li>
</ol>

<h3>Lab 3 walkthrough: Kaveri Health, DIA configured but dead</h3>
<p><b>Scenario.</b> Kaveri Health moved its Pune clinic (E-BR1, site 200) from backhaul to local breakout. The DC no longer offers internet to branches. STAFF-PC (VPN 10) cannot reach 8.8.8.8, although the records server at 10.100.10.10 works. The change ticket says "NAT enabled, DIA route added".</p>
<p><b>Task 1: gather evidence.</b> On E-BR1:</p>
<pre class="code">E-BR1# show ip route vrf 10
E-BR1# show sdwan nat-dia summary
NAT DIA interfaces : none
NAT DIA routes     : vrf 20 0.0.0.0/0
E-BR1# show ip nat statistics
E-BR1# show running-config | include nat route</pre>
<p>Reading it: the records server works, so the overlay and OMP are fine. "NAT DIA interfaces : none" shows the transport is not a NAT interface. The route list shows <b>vrf 20</b>, not the users' VRF 10. That is <b>two faults</b>, and the ticket's statement "NAT enabled" is only half true. The overload rule may exist, but without <code>ip nat outside</code> on GigabitEthernet1 the interface does not qualify.</p>
<p><b>Task 2: fix the VRF.</b> Replace the route:</p>
<pre class="code">E-BR1(config)# no ip nat route vrf 20 0.0.0.0 0.0.0.0 global
E-BR1(config)# ip nat route vrf 10 0.0.0.0 0.0.0.0 global</pre>
<p><b>Task 3: fix the transport.</b></p>
<pre class="code">E-BR1(config)# interface GigabitEthernet1
E-BR1(config-if)# ip nat outside
E-BR1(config-if)# exit
E-BR1(config)# ip nat inside source list nat-dia-vpn-hop-access-list interface GigabitEthernet1 overload</pre>
<p><b>Task 4: verify.</b></p>
<pre class="code">E-BR1# show sdwan nat-dia summary
NAT DIA interfaces : GigabitEthernet1
NAT DIA routes     : vrf 10 0.0.0.0/0
E-BR1# show ip route vrf 10
n*Nd  0.0.0.0/0 ...
E-BR1# show ip nat translations vrf 10</pre>
<p>From STAFF-PC ping 8.8.8.8. The translation shows an inside global address of 203.0.113.10. Ping 10.100.10.10 again; it must still travel through the overlay because the specific OMP prefix wins over the default.</p>

<div class="eg"><p><b>Worked example, same symptom, different cause.</b> If <code>show sdwan nat-dia summary</code> had shown GigabitEthernet1 and vrf 10, and <code>show ip nat translations</code> was empty, you would move to step 5. From VPN 0, <code>ping vrf 0 8.8.8.8</code> failing would point to the ISP default route or the link; that is an underlay fault, and no amount of VRF 10 editing helps.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Changing several things at once, so you do not know which one fixed it. (2) Restarting the interface before reading the evidence. (3) Testing only with ping while the real application needs DNS, which may be blocked or pointed at an unreachable internal server. (4) Forgetting to re-test the overlay after the fix. (5) Calling the ISP when <code>show sdwan nat-dia summary</code> already proves the fault is local.</p></div>

<div class="exam"><p><b>Exam trap.</b> "NAT DIA interfaces : none" with a NAT DIA route listed means <b>the NAT-enabled transport is missing</b>, not that the route is wrong. And a route for the wrong VRF is silent: no error, no effect.</p></div>

<div class="scn"><h4>Clinic offline after a late-night change</h4><p>At 07:00 clinic staff report that no website loads. The engineer on call sees the records system works, checks the DC firewall (healthy), then reads <code>show sdwan nat-dia summary</code> on E-BR1: no NAT interface and a route for VRF 20. Two lines fix it in ten minutes. The post-incident action: the change template now includes the four-part DIA checklist and a post-change test from STAFF-PC.</p><p><b>Lesson:</b> the evidence on the edge points to the fault faster than the firewall logs do.</p></div>

<div class="iv"><p class="q">"DIA is configured but users cannot browse. How do you troubleshoot?"</p><p>I define the symptom and test an overlay destination to separate overlay from internet issues. Then four checks in order: steering (the n*Nd route or the nat use-vpn 0 policy matching the right VRF), NAT on the transport (ip nat outside, overload rule, show sdwan nat-dia summary), underlay reachability from VPN 0, and return path or security such as ACLs, trackers and DNS. I prove the fix with a translation in show ip nat translations and re-test the overlay.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>DIA has four parts: steering, NAT on the transport, underlay, return and security.</li>
<li>"NAT DIA interfaces : none" means missing <code>ip nat outside</code> or the overload rule.</li>
<li>A NAT route for the wrong VRF is silent and useless.</li>
<li>A working overlay (DC server reachable) plus a dead internet narrows the fault to the local breakout.</li>
<li>Prove the fix with a translation to the transport address and re-test the overlay.</li>
</ul></div>
`,hi:`
<p>"DIA configured hai lekin internet band hai" SD-WAN ke sabse common tickets mein se ek hai. Fix lagbhag kabhi magic nahi hota. DIA ke <b>chaar moving parts</b> hain, aur fault theek ek mein hota hai. Packet ke point of view se kaam karo: LAN se kahan nikalta hai, exit kaunsi table chunti hai, us exit par NAT hai ya nahi, aur return path chalta hai ya nahi?</p>

<h3>Kaam karte DIA ke chaar parts</h3>
<table class="cmp"><tr><th>Part</th><th>Sawaal</th><th>Evidence</th></tr>
<tr><td>1. Steering</td><td>Kya kuch VPN 10 ka internet traffic transport ko bhej raha hai? (NAT DIA route ya <code>nat use-vpn 0</code> policy)</td><td><code>show ip route vrf 10</code> mein <code>n*Nd</code>; ya policy counters badhte hain</td></tr>
<tr><td>2. Transport par NAT</td><td>Interface par <code>ip nat outside</code> aur overload rule hai?</td><td><code>show sdwan nat-dia summary</code>, <code>show ip nat statistics</code></td></tr>
<tr><td>3. Underlay reachability</td><td>Transport internet tak pahunch sakta hai? VPN 0 mein default route, ISP up, DNS chal raha?</td><td>VPN 0 se <code>ping</code>, <code>show ip route</code></td></tr>
<tr><td>4. Return aur security</td><td>Kya firewall, ACL ya tracker block kar raha hai?</td><td><code>show ip nat translations</code>, ACL counters, <code>show endpoint-tracker</code></td></tr></table>

<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="DIA packet ke chaar checkpoints">
<rect x="10" y="60" width="100" height="56" rx="8" fill="#bae6fd"/><text x="60" y="86" text-anchor="middle" class="svg-ink" font-size="13">STAFF-PC</text><text x="60" y="104" text-anchor="middle" class="svg-muted" font-size="11">VPN 10</text>
<rect x="150" y="60" width="110" height="56" rx="8" fill="#fde68a"/><text x="205" y="84" text-anchor="middle" class="svg-ink" font-size="13">1 Steering</text><text x="205" y="102" text-anchor="middle" class="svg-muted" font-size="11">route ya policy</text>
<rect x="290" y="60" width="110" height="56" rx="8" fill="#fde68a"/><text x="345" y="84" text-anchor="middle" class="svg-ink" font-size="13">2 NAT</text><text x="345" y="102" text-anchor="middle" class="svg-muted" font-size="11">outside + PAT</text>
<rect x="430" y="60" width="90" height="56" rx="8" fill="#fde68a"/><text x="475" y="84" text-anchor="middle" class="svg-ink" font-size="13">3 Underlay</text><text x="475" y="102" text-anchor="middle" class="svg-muted" font-size="11">VPN 0</text>
<rect x="550" y="60" width="80" height="56" rx="8" fill="#ddd6fe"/><text x="590" y="92" text-anchor="middle" class="svg-ink" font-size="13">Internet</text>
<line x1="110" y1="88" x2="150" y2="88" stroke="#64748b" stroke-width="2"/><line x1="260" y1="88" x2="290" y2="88" stroke="#64748b" stroke-width="2"/><line x1="400" y1="88" x2="430" y2="88" stroke="#64748b" stroke-width="2"/><line x1="520" y1="88" x2="550" y2="88" stroke="#64748b" stroke-width="2"/>
<text x="320" y="150" text-anchor="middle" class="svg-accent" font-size="12">4 Return path aur security checks wapsi mein lagte hain</text>
</svg><p class="cap">Checkpoints ko order mein test karo. Jo pehla fail ho, wahi tumhara fault hai.</p></div>

<h3>Six-step workflow</h3>
<ol>
<li><b>Symptom precisely define karo.</b> Kaunsa source, kaunsa destination, kaunsa VPN? Kya DC server (10.100.10.10) chal raha hai jabki 8.8.8.8 nahi? Yeh pehle hi batata hai ki overlay theek hai.</li>
<li><b>Steering check karo.</b> <code>show ip route vrf 10</code>. Kya <code>n*Nd 0.0.0.0/0</code> dikhta hai? Agar sirf OMP default (<code>m*</code>) hai to traffic ab bhi DC jaata hai. Policy ke liye: <code>show sdwan policy from-vsmart</code> aur data-policy counters.</li>
<li><b>Transport par NAT check karo.</b> <code>show sdwan nat-dia summary</code>. "NAT DIA interfaces : none" ka matlab koi interface qualify nahi karta, isliye route install nahi hota.</li>
<li><b>VRF match check karo.</b> Route ya policy mein users ka VRF hona chahiye. VRF 20 ka route VRF 10 ke liye kuch nahi karta.</li>
<li><b>Underlay check karo.</b> VPN 0 se ISP gateway aur public address ping karo. VPN 0 mein default route aur DNS resolve hona confirm karo.</li>
<li><b>Flow se saabit karo.</b> STAFF-PC se ping ya web request chalao aur <code>show ip nat translations vrf 10</code> dekho. 203.0.113.10 mein translation final proof hai. DC server dobara test karo taaki overlay ab bhi chalta hai yeh pakka ho.</li>
</ol>

<h3>Lab 3 walkthrough: Kaveri Health, DIA configured lekin dead</h3>
<p><b>Scenario.</b> Kaveri Health ne Pune clinic (E-BR1, site 200) ko backhaul se local breakout par shift kiya. DC ab branches ko internet nahi deta. STAFF-PC (VPN 10) 8.8.8.8 tak nahi pahunch pa raha, jabki 10.100.10.10 records server chal raha hai. Change ticket kehta hai "NAT enabled, DIA route added".</p>
<p><b>Task 1: evidence jama karo.</b> E-BR1 par:</p>
<pre class="code">E-BR1# show ip route vrf 10
E-BR1# show sdwan nat-dia summary
NAT DIA interfaces : none
NAT DIA routes     : vrf 20 0.0.0.0/0
E-BR1# show ip nat statistics
E-BR1# show running-config | include nat route</pre>
<p>Padhna: records server chal raha hai, isliye overlay aur OMP theek hain. "NAT DIA interfaces : none" batata hai ki transport NAT interface nahi hai. Route list <b>vrf 20</b> dikhati hai, users ka VRF 10 nahi. Yeh <b>do faults</b> hain, aur ticket ka "NAT enabled" sirf aadha sach hai. Overload rule ho sakta hai, lekin GigabitEthernet1 par <code>ip nat outside</code> ke bina interface qualify nahi karta.</p>
<p><b>Task 2: VRF fix karo.</b> Route replace karo:</p>
<pre class="code">E-BR1(config)# no ip nat route vrf 20 0.0.0.0 0.0.0.0 global
E-BR1(config)# ip nat route vrf 10 0.0.0.0 0.0.0.0 global</pre>
<p><b>Task 3: transport fix karo.</b></p>
<pre class="code">E-BR1(config)# interface GigabitEthernet1
E-BR1(config-if)# ip nat outside
E-BR1(config-if)# exit
E-BR1(config)# ip nat inside source list nat-dia-vpn-hop-access-list interface GigabitEthernet1 overload</pre>
<p><b>Task 4: verify karo.</b></p>
<pre class="code">E-BR1# show sdwan nat-dia summary
NAT DIA interfaces : GigabitEthernet1
NAT DIA routes     : vrf 10 0.0.0.0/0
E-BR1# show ip route vrf 10
n*Nd  0.0.0.0/0 ...
E-BR1# show ip nat translations vrf 10</pre>
<p>STAFF-PC se 8.8.8.8 ping karo. Translation mein inside global address 203.0.113.10 dikhta hai. 10.100.10.10 dobara ping karo; woh ab bhi overlay se jaana chahiye kyunki specific OMP prefix default ko harata hai.</p>

<div class="eg"><p><b>Worked example, wahi symptom, alag cause.</b> Agar <code>show sdwan nat-dia summary</code> mein GigabitEthernet1 aur vrf 10 dikhte, aur <code>show ip nat translations</code> khaali hota, to tum step 5 par jaate. VPN 0 se <code>ping vrf 0 8.8.8.8</code> fail hona ISP default route ya link ki taraf ishara karta; yeh underlay fault hai, aur VRF 10 edit karne se kuch nahi hota.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Ek saath kai cheezein badalna, phir pata nahi chalta kisne fix kiya. (2) Evidence padhne se pehle interface restart karna. (3) Sirf ping se test karna jabki asli application ko DNS chahiye, jo block ho sakta hai ya unreachable internal server par point kar sakta hai. (4) Fix ke baad overlay dobara test karna bhool jaana. (5) ISP ko call karna jabki <code>show sdwan nat-dia summary</code> pehle hi saabit kar chuka hai ki fault local hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> NAT DIA route list mein hone par bhi "NAT DIA interfaces : none" ka matlab <b>NAT-enabled transport missing hai</b>, route galat nahi hai. Aur galat VRF ka route silent hota hai: na error, na asar.</p></div>

<div class="scn"><h4>Raat ke change ke baad clinic offline</h4><p>Subah 07:00 baje clinic staff batata hai ki koi website nahi khulti. On-call engineer dekhta hai ki records system chal raha hai, DC firewall check karta hai (healthy), phir E-BR1 par <code>show sdwan nat-dia summary</code> padhta hai: koi NAT interface nahi aur VRF 20 ka route. Do lines dus minute mein fix kar deti hain. Post-incident action: change template mein ab chaar-part DIA checklist aur STAFF-PC se post-change test shamil hai.</p><p><b>Lesson:</b> edge ka evidence fault tak firewall logs se jaldi pahunchata hai.</p></div>

<div class="iv"><p class="q">"DIA configured hai lekin users browse nahi kar pa rahe. Troubleshoot kaise karoge?"</p><p>Main symptom define karta hoon aur overlay destination test karke overlay aur internet issues alag karta hoon. Phir order mein chaar checks: steering (n*Nd route ya nat use-vpn 0 policy sahi VRF match kar rahi hai), transport par NAT (ip nat outside, overload rule, show sdwan nat-dia summary), VPN 0 se underlay reachability, aur return path ya security jaise ACLs, trackers aur DNS. Fix ko show ip nat translations mein translation se saabit karta hoon aur overlay dobara test karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>DIA ke chaar parts: steering, transport par NAT, underlay, return aur security.</li>
<li>"NAT DIA interfaces : none" ka matlab <code>ip nat outside</code> ya overload rule missing.</li>
<li>Galat VRF ka NAT route silent aur bekaar hota hai.</li>
<li>Overlay chal raha (DC server reachable) aur internet dead ho to fault local breakout mein hai.</li>
<li>Fix ko transport address mein translation se saabit karo aur overlay dobara test karo.</li>
</ul></div>
`}};export{e as default};