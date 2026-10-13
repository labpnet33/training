var e={id:`layered-method`,h:{en:`A layered troubleshooting method`,hi:`Layered troubleshooting method`},body:{en:`
<p>When a house has no running water, a plumber does not start by replacing the tap. He checks the street valve, then the meter, then the main pipe, then the branch pipe, and only then the tap. He moves from the source towards the user, one stage at a time, and stops at the first stage that is broken. SD-WAN troubleshooting is the same. The network is a stack of layers where each layer depends on the one below. If you test in order, the first failure you meet is almost always the real cause, and everything above it is just a consequence.</p>

<h3>The seven layers and the question for each</h3>
<div class="dia"><svg viewBox="0 0 640 400" role="img" aria-label="Troubleshooting decision tree">
<rect x="170" y="8" width="300" height="38" rx="8" fill="#e2e8f0"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="13">Problem reported: scope it first</text>
<rect x="30" y="62" width="260" height="38" rx="8" fill="#bae6fd"/><text x="160" y="86" text-anchor="middle" class="svg-ink" font-size="13">1 Underlay: can I ping the carrier and the Controller?</text>
<rect x="30" y="112" width="260" height="38" rx="8" fill="#bae6fd"/><text x="160" y="136" text-anchor="middle" class="svg-ink" font-size="13">2 Interface: up, addressed, right VR?</text>
<rect x="30" y="162" width="260" height="38" rx="8" fill="#bae6fd"/><text x="160" y="186" text-anchor="middle" class="svg-ink" font-size="13">3 Tunnel: up per transport, reason?</text>
<rect x="30" y="212" width="260" height="38" rx="8" fill="#ddd6fe"/><text x="160" y="236" text-anchor="middle" class="svg-ink" font-size="13">4 Control plane: MP-BGP Established?</text>
<rect x="30" y="262" width="260" height="38" rx="8" fill="#bbf7d0"/><text x="160" y="286" text-anchor="middle" class="svg-ink" font-size="13">5 LAN routes: remote prefix learned?</text>
<rect x="30" y="312" width="260" height="38" rx="8" fill="#fde68a"/><text x="160" y="336" text-anchor="middle" class="svg-ink" font-size="13">6 Policy: rule matched, path chosen?</text>
<rect x="30" y="362" width="260" height="32" rx="8" fill="#fed7aa"/><text x="160" y="383" text-anchor="middle" class="svg-ink" font-size="13">7 Application: works from the PC?</text>
<text x="310" y="86" class="svg-muted" font-size="12">no: carrier or route to carrier</text>
<text x="310" y="136" class="svg-muted" font-size="12">no: enable, address, default route</text>
<text x="310" y="186" class="svg-muted" font-size="12">no: transport binding, circuit, domain</text>
<text x="310" y="236" class="svg-muted" font-size="12">no: site-id, Controller, tenant</text>
<text x="310" y="286" class="svg-muted" font-size="12">no: LAN interface, tenant, origin</text>
<text x="310" y="336" class="svg-muted" font-size="12">no: match, FP, SLA, fallback</text>
<text x="310" y="383" class="svg-muted" font-size="12">no: server, firewall, DNS (outside SD-WAN)</text>
<text x="470" y="30" class="svg-accent" font-size="12">Stop at the first NO.</text>
</svg><p class="cap">Work from top to bottom. The first layer that fails is your suspect; fix it, then re-run the layers below it.</p></div>

<h3>Layer by layer, with the course commands</h3>
<dl class="terms">
<dt>1 Underlay</dt><dd>Can the branch reach its carrier gateway and the Controller address over the transport? <code>ping 203.0.113.5</code> (carrier gateway for Delhi Internet) and <code>ping 198.51.100.20</code>. A failure here means interface, route or carrier.</dd>
<dt>2 Interface</dt><dd><code>show interfaces brief</code>: admin up, oper up, correct address and prefix. Then <code>show route</code>: each transport VR needs its route (default route in <code>Internet-Transport-VR</code>, 172.31.0.0/16 in <code>MPLS-Transport-VR</code>). A wrong next hop here is invisible in the tunnel table except as "unreachable".</dd>
<dt>3 Tunnel</dt><dd><code>show orgs org Acme sd-wan brief</code>. One row per bound transport. The reason column tells you why: interface down, no IP, circuit down (provider fault), Controller has no such WAN interface, transport domain missing, Controller address unreachable. <b>A transport that is not bound has no row at all.</b></dd>
<dt>4 Control plane</dt><dd>The MP-BGP session to the Controller is Established when at least one tunnel is up and tenant, site-id and Controller address are consistent. <code>show bgp neighbor brief</code>. Idle with tunnels up points at identity: site-id, organization, Controller address.</dd>
<dt>5 LAN routes</dt><dd><code>show orgs org Acme sd-wan sites</code> lists remote LAN prefixes learned over MP-BGP. A missing prefix means the remote site did not advertise it, is in another tenant, or its overlay is down.</dd>
<dt>6 Policy</dt><dd><code>show orgs org-services Acme sd-wan policies</code>, then the path helper. First matching rule wins; its forwarding profile picks the first transport that is up and meets the SLA; if none meets it, fallback allow uses the best available path and fallback drop discards. No rule match means load balancing across every tunnel that is up.</dd>
<dt>7 Application</dt><dd>Ping or open the application from the PC. If layers 1 to 6 are healthy and it still fails, the cause is outside SD-WAN: server, host firewall, DNS, security policy.</dd>
</dl>

<h3>Smallest change, one at a time</h3>
<p>After you find the failing layer, change <b>only that</b>. If you fix three things at once and the site recovers, you do not know which fix mattered and you may leave harmful extra changes behind. Use the candidate configuration: <code>configure</code>, make the change, <code>show | compare</code> to read exactly what will change, <code>commit</code>, then <code>exit</code> and verify. If the compare shows more than you intended, <code>rollback</code> discards the candidate.</p>
<pre class="code"><span class="c">! smallest change: replace one wrong next hop, nothing else</span>
admin@Branch2-cli% delete routing-instances Internet-Transport-VR routing-options static route 0.0.0.0/0 next-hop 203.0.113.13
admin@Branch2-cli% set routing-instances Internet-Transport-VR routing-options static route 0.0.0.0/0 next-hop 203.0.113.9
admin@Branch2-cli% show | compare
admin@Branch2-cli% commit
admin@Branch2-cli% exit</pre>

<div class="eg"><p><b>Worked example.</b> Symptom: PC2 in Bengaluru cannot ping PC1 in Delhi. Layer 7 fails, so go down. Layer 6 not testable because the overlay is down, layer 4 shows Idle, layer 3 shows Internet down with reason "Controller Internet address 198.51.100.20 is unreachable", layer 1 ping to the Controller fails. The first failing layer from the bottom is the underlay route. Fix the default route, and layers 3, 4 and 5 recover by themselves. Then test layer 6 and 7 again.</p></div>

<h3>Two ways to walk the stack</h3>
<p><b>Top-down</b> starts at the application and works down; it is fast when you suspect policy. <b>Bottom-up</b> starts at the underlay and works up; it is slower but never misses a base fault. For unknown faults use bottom-up. In a multi-fault incident (as in the capstone) you will find one fault, fix it, and then the next layer shows its own fault that was hidden before. Expect that. Keep walking until every layer is green.</p>

<div class="warn"><p><b>Common mistakes.</b> Jumping to policy when the tunnel is down; testing only ping and calling it done; fixing a symptom (adding a static route on the LAN) instead of the cause; rebooting to "see if it helps"; stopping after the first fix in a multi-fault incident.</p></div>
<div class="exam"><p><b>Exam trap.</b> The MP-BGP session being Established only proves that at least one tunnel is up, not that all circuits are healthy and not that the policy is right. Also note that "no row in the tunnel table" and "row with tunnel down" are different faults: the first is a missing binding, the second a failing path.</p></div>

<div class="scn"><h4>Three faults, one hour, one engineer</h4><p>After a rushed evening change a branch lost overlay. The engineer walked bottom-up. The underlay default route pointed at a wrong next hop. After fixing it the Internet tunnel came up but the MPLS transport had no row, so the interface binding was missing. After binding it, voice was still load-balanced because a rule matched the wrong application. Three layers, three one-line fixes, each proved before moving on. A colleague who had started with the policy would have spent the hour in the wrong place.</p><p><b>Lesson:</b> one layer at a time, from the bottom, with proof at each step.</p></div>

<div class="iv"><p class="q">"How do you troubleshoot an SD-WAN site that cannot reach HQ?"</p><p>Scope it, then walk the layers: underlay, interface and routes, tunnel table with reasons, control plane, learned LAN routes, policy path, application. Stop at the first failure, make the smallest change, verify, and continue because hidden faults may remain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Seven layers: underlay, interface, tunnel, control plane, LAN routes, policy, application.</li>
<li>The first failing layer from the bottom is the suspect; later failures are often consequences.</li>
<li>Use the reason column in the tunnel table; no row means a missing binding.</li>
<li>One smallest change at a time, checked with show | compare and verified.</li>
<li>Multi-fault incidents hide later faults behind earlier ones.</li>
</ul></div>
`,hi:`
<p>Ghar mein paani na aa raha ho to plumber tap badalne se shuru nahi karta. Wo pehle street valve, phir meter, phir main pipe, phir branch pipe aur sabse aakhir mein tap check karta hai. Wo source se user ki taraf, ek stage ek baar, chalta hai aur pehle toote hue stage par ruk jata hai. SD-WAN troubleshooting bhi aisi hi hai. Network layers ka stack hai jahan har layer neeche wali par depend karti hai. Order mein test karoge to pehli failure jo milegi wahi lagbhag hamesha asli cause hogi, aur uske upar sab uska consequence hai.</p>

<h3>Saat layers aur har ek ka sawal</h3>
<div class="dia"><svg viewBox="0 0 640 400" role="img" aria-label="Troubleshooting decision tree">
<rect x="170" y="8" width="300" height="38" rx="8" fill="#e2e8f0"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="13">Problem report: pehle scope karo</text>
<rect x="30" y="62" width="260" height="38" rx="8" fill="#bae6fd"/><text x="160" y="86" text-anchor="middle" class="svg-ink" font-size="13">1 Underlay: carrier aur Controller ping hota hai?</text>
<rect x="30" y="112" width="260" height="38" rx="8" fill="#bae6fd"/><text x="160" y="136" text-anchor="middle" class="svg-ink" font-size="13">2 Interface: up, addressed, sahi VR?</text>
<rect x="30" y="162" width="260" height="38" rx="8" fill="#bae6fd"/><text x="160" y="186" text-anchor="middle" class="svg-ink" font-size="13">3 Tunnel: har transport up, reason?</text>
<rect x="30" y="212" width="260" height="38" rx="8" fill="#ddd6fe"/><text x="160" y="236" text-anchor="middle" class="svg-ink" font-size="13">4 Control plane: MP-BGP Established?</text>
<rect x="30" y="262" width="260" height="38" rx="8" fill="#bbf7d0"/><text x="160" y="286" text-anchor="middle" class="svg-ink" font-size="13">5 LAN routes: remote prefix seekha?</text>
<rect x="30" y="312" width="260" height="38" rx="8" fill="#fde68a"/><text x="160" y="336" text-anchor="middle" class="svg-ink" font-size="13">6 Policy: rule match, path chuna?</text>
<rect x="30" y="362" width="260" height="32" rx="8" fill="#fed7aa"/><text x="160" y="383" text-anchor="middle" class="svg-ink" font-size="13">7 Application: PC se chalti hai?</text>
<text x="310" y="86" class="svg-muted" font-size="12">no: carrier ya carrier tak route</text>
<text x="310" y="136" class="svg-muted" font-size="12">no: enable, address, default route</text>
<text x="310" y="186" class="svg-muted" font-size="12">no: transport binding, circuit, domain</text>
<text x="310" y="236" class="svg-muted" font-size="12">no: site-id, Controller, tenant</text>
<text x="310" y="286" class="svg-muted" font-size="12">no: LAN interface, tenant, origin</text>
<text x="310" y="336" class="svg-muted" font-size="12">no: match, FP, SLA, fallback</text>
<text x="310" y="383" class="svg-muted" font-size="12">no: server, firewall, DNS (SD-WAN se bahar)</text>
<text x="470" y="30" class="svg-accent" font-size="12">Pehle NO par ruk jao.</text>
</svg><p class="cap">Upar se neeche chalo. Jo pehli layer fail ho wahi suspect hai; use fix karo, phir uske neeche wali layers dobara chalao.</p></div>

<h3>Layer by layer, course commands ke saath</h3>
<dl class="terms">
<dt>1 Underlay</dt><dd>Kya branch transport par apne carrier gateway aur Controller address tak pahunch sakta hai? <code>ping 203.0.113.5</code> (Delhi Internet ka carrier gateway) aur <code>ping 198.51.100.20</code>. Yahan failure matlab interface, route ya carrier.</dd>
<dt>2 Interface</dt><dd><code>show interfaces brief</code>: admin up, oper up, sahi address aur prefix. Phir <code>show route</code>: har transport VR ko apni route chahiye (<code>Internet-Transport-VR</code> mein default route, <code>MPLS-Transport-VR</code> mein 172.31.0.0/16). Yahan galat next hop tunnel table mein sirf "unreachable" ke roop mein dikhta hai.</dd>
<dt>3 Tunnel</dt><dd><code>show orgs org Acme sd-wan brief</code>. Har bound transport ki ek row. Reason column batata hai kyun: interface down, no IP, circuit down (provider fault), Controller has no such WAN interface, transport domain missing, Controller address unreachable. <b>Jo transport bound nahi hai uski row hi nahi hoti.</b></dd>
<dt>4 Control plane</dt><dd>MP-BGP session tab Established hota hai jab kam se kam ek tunnel up ho aur tenant, site-id aur Controller address consistent hon. <code>show bgp neighbor brief</code>. Tunnels up hone par bhi Idle ho to identity dekho: site-id, organization, Controller address.</dd>
<dt>5 LAN routes</dt><dd><code>show orgs org Acme sd-wan sites</code> MP-BGP se seekhe remote LAN prefixes dikhata hai. Prefix missing ho to remote site ne advertise nahi kiya, wo doosre tenant mein hai, ya uska overlay down hai.</dd>
<dt>6 Policy</dt><dd><code>show orgs org-services Acme sd-wan policies</code>, phir path helper. Pehla matching rule jeetta hai; uska forwarding profile pehla wo transport chunta hai jo up ho aur SLA meet kare; koi na kare to fallback allow best available path use karta hai aur fallback drop discard karta hai. Rule match na ho to jitne tunnels up hain unme load balancing hoti hai.</dd>
<dt>7 Application</dt><dd>PC se ping karo ya application kholo. Layers 1 se 6 healthy hain phir bhi fail ho to cause SD-WAN ke bahar hai: server, host firewall, DNS, security policy.</dd>
</dl>

<h3>Smallest change, ek ek karke</h3>
<p>Failing layer milne ke baad <b>sirf wahi</b> badlo. Teen cheezein ek saath fix karo aur site recover ho jaye to pata nahi chalta kaunsi fix kaam ki aur extra harmful changes peeche reh sakte hain. Candidate configuration use karo: <code>configure</code>, change karo, <code>show | compare</code> se padho exactly kya badlega, <code>commit</code>, phir <code>exit</code> karke verify. Compare intended se zyada dikhaye to <code>rollback</code> candidate discard kar deta hai.</p>
<pre class="code"><span class="c">! smallest change: ek galat next hop badlo, aur kuch nahi</span>
admin@Branch2-cli% delete routing-instances Internet-Transport-VR routing-options static route 0.0.0.0/0 next-hop 203.0.113.13
admin@Branch2-cli% set routing-instances Internet-Transport-VR routing-options static route 0.0.0.0/0 next-hop 203.0.113.9
admin@Branch2-cli% show | compare
admin@Branch2-cli% commit
admin@Branch2-cli% exit</pre>

<div class="eg"><p><b>Worked example.</b> Symptom: Bengaluru ka PC2 Delhi ke PC1 ko ping nahi kar pa raha. Layer 7 fail, to neeche jao. Overlay down hone se layer 6 testable nahi, layer 4 Idle dikhata hai, layer 3 Internet down dikhata hai reason "Controller Internet address 198.51.100.20 is unreachable" ke saath, layer 1 ka Controller ping fail. Neeche se pehli failing layer underlay route hai. Default route fix karo, aur layers 3, 4 aur 5 khud recover ho jati hain. Phir layer 6 aur 7 dobara test karo.</p></div>

<h3>Stack chalne ke do tareeke</h3>
<p><b>Top-down</b> application se shuru hoke neeche jata hai; policy par shak ho to fast hai. <b>Bottom-up</b> underlay se upar jata hai; slow hai par base fault kabhi miss nahi hota. Unknown fault ke liye bottom-up use karo. Multi-fault incident (jaise capstone mein) mein ek fault milega, fix karoge, phir agli layer apna fault dikhayegi jo pehle chhupa tha. Isse expect karo. Jab tak har layer green na ho chalte raho.</p>

<div class="warn"><p><b>Common mistakes.</b> Tunnel down hone par policy par kood jana; sirf ping test karke done keh dena; cause ke bajay symptom fix karna (LAN par static route jodna); "dekhein shayad help ho" kehkar reboot karna; multi-fault incident mein pehli fix ke baad ruk jana.</p></div>
<div class="exam"><p><b>Exam trap.</b> MP-BGP session ka Established hona sirf itna prove karta hai ki kam se kam ek tunnel up hai, ye nahi ki saare circuits healthy hain aur policy sahi hai. Ye bhi dhyan rakho ki "tunnel table mein row nahi" aur "row hai par tunnel down" alag faults hain: pehla missing binding hai, doosra failing path.</p></div>

<div class="scn"><h4>Teen faults, ek ghanta, ek engineer</h4><p>Raat ke rushed change ke baad ek branch ka overlay chala gaya. Engineer ne bottom-up walk kiya. Underlay default route galat next hop par thi. Fix ke baad Internet tunnel aaya lekin MPLS transport ki row hi nahi thi, yani interface binding missing thi. Binding ke baad bhi voice load-balanced thi kyunki ek rule galat application match kar raha tha. Teen layers, teen ek-line fixes, har ek aage badhne se pehle prove. Jis colleague ne policy se shuru kiya hota wo ghanta galat jagah bitata.</p><p><b>Lesson:</b> ek time par ek layer, neeche se, har step par proof ke saath.</p></div>

<div class="iv"><p class="q">"HQ tak na pahunchne wali SD-WAN site ko aap kaise troubleshoot karoge?"</p><p>Scope karo, phir layers chalo: underlay, interface aur routes, reason ke saath tunnel table, control plane, seekhe hue LAN routes, policy path, application. Pehli failure par ruko, smallest change karo, verify karo, aur aage badhte raho kyunki hidden faults bache ho sakte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Saat layers: underlay, interface, tunnel, control plane, LAN routes, policy, application.</li>
<li>Neeche se pehli failing layer suspect hai; baad ki failures aksar consequences hoti hain.</li>
<li>Tunnel table ka reason column use karo; row nahi to binding missing.</li>
<li>Ek time par ek smallest change, show | compare se check aur verify.</li>
<li>Multi-fault incidents mein baad ke faults pehle ke peeche chhupe hote hain.</li>
</ul></div>
`}};export{e as default};