var e={id:`first-policy-and-verify`,h:{en:`The first policy and how to verify the bring-up`,hi:`Pehli policy aur bring-up ko verify kaise karein`},body:{en:`
<p>Your firewall now has addresses and a default route, and it can ping 8.8.8.8 from its own CLI. Yet PCs behind it cannot browse, because traffic <i>through</i> a FortiGate needs a policy (the implicit deny, from nse4-start). Writing and tuning policies is the subject of nse4-policy; here you add the single policy a branch needs on day one, so you can finish the bring-up and see the whole path work.</p>
<h3>The day-one policy</h3>
<p>Source interface port2 (LAN), destination interface port1 (WAN), all addresses, all services, schedule always, accept, with NAT enabled so private sources use the WAN address.</p>
<pre class="code">NK-PUNE-FGT # config firewall policy
NK-PUNE-FGT (policy) # edit 1
new entry '1' added
NK-PUNE-FGT (1) # set name "LAN-to-WAN"
NK-PUNE-FGT (1) # set srcintf port2
NK-PUNE-FGT (1) # set dstintf port1
NK-PUNE-FGT (1) # set srcaddr all
NK-PUNE-FGT (1) # set dstaddr all
NK-PUNE-FGT (1) # set action accept
NK-PUNE-FGT (1) # set schedule always
NK-PUNE-FGT (1) # set service ALL
NK-PUNE-FGT (1) # set nat enable
NK-PUNE-FGT (1) # next
NK-PUNE-FGT (policy) # end</pre>
<div class="note"><p>This policy allows every service to every address. It is a bring-up convenience, not a design. In production you narrow service and destination, and add logging and security profiles; nse4-policy teaches how.</p></div>
<h3>The verification ladder</h3>
<p>Verify from the inside out, one rung at a time. Each rung proves one layer, so a failure tells you where to look:</p>
<ol>
<li><b>Layer 1 and 2:</b> <code>get system interface physical</code> shows link up.</li>
<li><b>Layer 3 on the LAN:</b> the PC pings its gateway 10.0.1.1 (needs allowaccess ping on port2).</li>
<li><b>Layer 3 on the WAN:</b> <code>execute ping 203.0.113.1</code> to the ISP.</li>
<li><b>Routing:</b> the default route exists in the table.</li>
<li><b>Policy and NAT:</b> a PC pings 8.8.8.8 and a session appears.</li>
</ol>
<p>Real output of the last rung, from PC1 and then on the firewall:</p>
<pre class="code">PC1> ping 8.8.8.8
NK-PUNE-FGT # diagnose sys session list</pre>
<pre class="out">84 bytes from 8.8.8.8 icmp_seq=1 ttl=62 time=0.500 ms
84 bytes from 8.8.8.8 icmp_seq=2 ttl=62 time=0.600 ms
84 bytes from 8.8.8.8 icmp_seq=3 ttl=62 time=0.700 ms

hook=post dir=org act=snat 10.0.1.10:19499-&gt;8.8.8.8:8(<span class="hl">203.0.113.2</span>:40001)
misc=0 <span class="hl">policy_id=1</span> pol_uuid_idx=15 auth_info=0 chk_client_info=0 vd=0
total session 1</pre>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="The verification ladder"><rect x="10" y="15" width="610" height="28" rx="9" fill="#e2e8f0"/><text x="315" y="34" text-anchor="middle" class="svg-ink" font-size="13">5. policy and NAT: PC pings 8.8.8.8, session shows policy_id=1</text><rect x="10" y="48" width="610" height="28" rx="9" fill="#bbf7d0"/><text x="315" y="67" text-anchor="middle" class="svg-ink" font-size="13">4. route: default route S* in the table</text><rect x="10" y="81" width="610" height="28" rx="9" fill="#bae6fd"/><text x="315" y="100" text-anchor="middle" class="svg-ink" font-size="13">3. WAN layer 3: ping the ISP 203.0.113.1</text><rect x="10" y="114" width="610" height="28" rx="9" fill="#fde68a"/><text x="315" y="133" text-anchor="middle" class="svg-ink" font-size="13">2. LAN layer 3: PC pings the gateway 10.0.1.1</text><text x="320" y="162" text-anchor="middle" class="svg-muted" font-size="11">1. link up on both ports  (start at the bottom, climb one rung at a time)</text></svg><p class="cap">The verification ladder</p></div>
<div class="eg"><p><b>Worked example.</b> The PC pings its gateway fine but not 8.8.8.8. You climb: the firewall pings the ISP (rung 3 ok), the default route is present (rung 4 ok), so the fault is rung 5. The session list is empty, which means no policy matched; <code>show firewall policy</code> reveals the policy has srcintf and dstintf swapped. Four commands, one root cause.</p></div>
<div class="warn"><p><b>Common mistake.</b> Testing only from the PC. A failed PC ping does not say which layer is broken. Test from the firewall too (<code>execute ping</code>, optionally <code>execute ping-options source</code> to use the LAN address) to split the problem in half.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>execute ping</code> uses the egress interface address as source unless you set <code>execute ping-options source</code>. A ping that works from the firewall but fails from a PC points to policy, NAT or the return path, not to the firewall's own routing.</p></div>
<div class="scn"><h4>Works from the firewall, fails from the PC</h4><p>The firewall pinged 8.8.8.8 successfully, so the installer reported the site as done. The first PC could not reach it. There was no policy yet: the firewall's own pings do not need one, but user traffic does. A single LAN-to-WAN policy with NAT enabled finished the job, and the session list proved it with policy_id 1.</p><p><b>Lesson:</b> a working firewall CLI does not prove user traffic works; always test from a client.</p></div>
<div class="iv"><p class="q">"You finished configuring a branch FortiGate. How do you prove it works end to end?"</p><p>I climb the ladder: link status, a ping from a PC to the gateway, a ping from the firewall to the ISP, the routing table for the default route, then a ping or browse from a PC to the internet and a look at the session table for the expected policy_id and source NAT. I also check that WAN management is closed.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Through-traffic needs a policy; the firewall's own pings do not.</li>
<li>The day-one policy is LAN to WAN, accept, NAT enabled; tighten it in nse4-policy.</li>
<li>Verify in rungs: link, LAN L3, WAN L3, route, policy and NAT.</li>
<li>Test from both the firewall and a client.</li>
</ul></div>
`,hi:`
<p>Aapke firewall par ab addresses aur default route hain, aur woh apne CLI se 8.8.8.8 ko ping kar sakta hai. Phir bhi uske peeche ke PCs browse nahi kar paate, kyunki FortiGate ke <i>through</i> traffic ko policy chahiye (implicit deny, nse4-start se). Policies likhna aur tune karna nse4-policy ka vishay hai; yahan aap woh ek policy add karte ho jo branch ko pehle din chahiye, taaki bring-up khatam karke poora path kaam karta dekh sako.</p>
<h3>Pehle din ki policy</h3>
<p>Source interface port2 (LAN), destination interface port1 (WAN), saare addresses, saari services, schedule always, accept, NAT enabled taaki private sources WAN address use karein.</p>
<pre class="code">NK-PUNE-FGT # config firewall policy
NK-PUNE-FGT (policy) # edit 1
new entry '1' added
NK-PUNE-FGT (1) # set name "LAN-to-WAN"
NK-PUNE-FGT (1) # set srcintf port2
NK-PUNE-FGT (1) # set dstintf port1
NK-PUNE-FGT (1) # set srcaddr all
NK-PUNE-FGT (1) # set dstaddr all
NK-PUNE-FGT (1) # set action accept
NK-PUNE-FGT (1) # set schedule always
NK-PUNE-FGT (1) # set service ALL
NK-PUNE-FGT (1) # set nat enable
NK-PUNE-FGT (1) # next
NK-PUNE-FGT (policy) # end</pre>
<div class="note"><p>Yeh policy har service ko har address tak allow karti hai. Yeh bring-up ki suvidha hai, design nahi. Production mein aap service aur destination narrow karte ho, aur logging aur security profiles jodte ho; nse4-policy sikhata hai kaise.</p></div>
<h3>Verification ladder</h3>
<p>Andar se bahar, ek-ek rung verify karo. Har rung ek layer saabit karti hai, isliye failure batata hai kahan dekhna hai:</p>
<ol>
<li><b>Layer 1 aur 2:</b> <code>get system interface physical</code> link up dikhata hai.</li>
<li><b>LAN par Layer 3:</b> PC apne gateway 10.0.1.1 ko ping karta hai (port2 par allowaccess ping chahiye).</li>
<li><b>WAN par Layer 3:</b> ISP ko <code>execute ping 203.0.113.1</code>.</li>
<li><b>Routing:</b> default route table mein hai.</li>
<li><b>Policy aur NAT:</b> PC 8.8.8.8 ko ping karta hai aur session dikhta hai.</li>
</ol>
<p>Aakhri rung ka asli output, PC1 se aur phir firewall par:</p>
<pre class="code">PC1> ping 8.8.8.8
NK-PUNE-FGT # diagnose sys session list</pre>
<pre class="out">84 bytes from 8.8.8.8 icmp_seq=1 ttl=62 time=0.500 ms
84 bytes from 8.8.8.8 icmp_seq=2 ttl=62 time=0.600 ms
84 bytes from 8.8.8.8 icmp_seq=3 ttl=62 time=0.700 ms

hook=post dir=org act=snat 10.0.1.10:19499-&gt;8.8.8.8:8(<span class="hl">203.0.113.2</span>:40001)
misc=0 <span class="hl">policy_id=1</span> pol_uuid_idx=15 auth_info=0 chk_client_info=0 vd=0
total session 1</pre>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Verification ladder"><rect x="10" y="15" width="610" height="28" rx="9" fill="#e2e8f0"/><text x="315" y="34" text-anchor="middle" class="svg-ink" font-size="13">5. policy aur NAT: PC 8.8.8.8 ping, session mein policy_id=1</text><rect x="10" y="48" width="610" height="28" rx="9" fill="#bbf7d0"/><text x="315" y="67" text-anchor="middle" class="svg-ink" font-size="13">4. route: table mein default route S*</text><rect x="10" y="81" width="610" height="28" rx="9" fill="#bae6fd"/><text x="315" y="100" text-anchor="middle" class="svg-ink" font-size="13">3. WAN layer 3: ISP 203.0.113.1 ko ping</text><rect x="10" y="114" width="610" height="28" rx="9" fill="#fde68a"/><text x="315" y="133" text-anchor="middle" class="svg-ink" font-size="13">2. LAN layer 3: PC gateway 10.0.1.1 ko ping</text><text x="320" y="162" text-anchor="middle" class="svg-muted" font-size="11">1. dono ports par link up  (neeche se shuru, ek-ek rung chadho)</text></svg><p class="cap">Verification ladder</p></div>
<div class="eg"><p><b>Worked example.</b> PC apne gateway ko theek ping karta hai par 8.8.8.8 ko nahi. Aap chadhte ho: firewall ISP ko ping karta hai (rung 3 ok), default route maujood hai (rung 4 ok), isliye fault rung 5 hai. Session list khali hai, matlab koi policy match nahi hui; <code>show firewall policy</code> batata hai ki policy mein srcintf aur dstintf swap hain. Chaar commands, ek root cause.</p></div>
<div class="warn"><p><b>Common mistake.</b> Sirf PC se test karna. Failed PC ping yeh nahi batati ki kaunsi layer toot gayi. Firewall se bhi test karo (<code>execute ping</code>, LAN address use karne ke liye optional <code>execute ping-options source</code>) taaki problem ko aadha-aadha baant sako.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>execute ping</code> source ke liye egress interface ka address use karta hai jab tak aap <code>execute ping-options source</code> set na karo. Firewall se chalne wali par PC se fail hone wali ping policy, NAT ya return path ki taraf ishara karti hai, firewall ki apni routing ki taraf nahi.</p></div>
<div class="scn"><h4>Firewall se chalta hai, PC se fail</h4><p>Firewall ne 8.8.8.8 ko successfully ping kiya, isliye installer ne site ko done bata diya. Pehla PC use reach nahi kar paya. Abhi koi policy nahi thi: firewall ki apni pings ko policy nahi chahiye, par user traffic ko chahiye. NAT enabled ke saath ek LAN-to-WAN policy ne kaam khatam kiya, aur session list ne policy_id 1 se saabit kiya.</p><p><b>Lesson:</b> working firewall CLI saabit nahi karta ki user traffic chalta hai; hamesha client se test karo.</p></div>
<div class="iv"><p class="q">"Aapne branch FortiGate configure kar liya. End to end kaam karta hai yeh kaise saabit karte ho?"</p><p>Main ladder chadhta hoon: link status, PC se gateway ko ping, firewall se ISP ko ping, default route ke liye routing table, phir PC se internet ko ping ya browse aur session table mein expected policy_id aur source NAT dekhta hoon. Yeh bhi check karta hoon ki WAN management band hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Through-traffic ko policy chahiye; firewall ki apni pings ko nahi.</li>
<li>Pehle din ki policy LAN se WAN, accept, NAT enabled hai; ise nse4-policy mein tight karo.</li>
<li>Rungs mein verify karo: link, LAN L3, WAN L3, route, policy aur NAT.</li>
<li>Firewall aur client dono se test karo.</li>
</ul></div>
`}};export{e as default};