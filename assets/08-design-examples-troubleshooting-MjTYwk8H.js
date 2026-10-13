var e={id:`design-examples-troubleshooting`,h:{en:`Design examples, verification and the policy troubleshooting workflow`,hi:`Design examples, verification aur policy troubleshooting workflow`},body:{en:`
<p>This chapter joins the five policy types into complete designs for four traffic classes: <b>voice</b>, <b>video</b>, <b>SaaS</b> and <b>bulk</b>. It also shows how to verify the result and gives a troubleshooting workflow for the question "why does this flow behave like that?". The same order of checks is used again in the troubleshooting module of the track.</p>
<h3>Analogy: one recipe, four dishes</h3>
<p>A kitchen has the same pantry (circuits), the same stove (ION) and the same cooks (policies), but a soup needs different handling from a soufflé. A good policy design writes one clear recipe card per traffic class and checks the dish before it leaves the kitchen.</p>
<h3>The Harbor Foods design</h3>
<p>Circuits at STORE-007: Internet-A 500 Mbps, Internet-B 300 Mbps, MPLS 100 Mbps. Applications and requirements: voice (6 Mbps peak), video meetings (20 Mbps), SaaS (80 Mbps), payments (2 Mbps), backups (up to 150 Mbps, can wait).</p>
<table class="cmp"><tr><th>Class</th><th>Path policy</th><th>Performance policy</th><th>QoS</th><th>Security and NAT</th></tr>
<tr><td><b>Voice</b></td><td>Active: VPN on MPLS and Internet-A; backup: VPN on Internet-B; SLA compliant path</td><td>Latency 150 ms, jitter 30 ms, loss 1 percent; Move Flows, Create Incident; adaptive FEC</td><td>Platinum, real-time audio</td><td>Corporate zone to WAN, allow voice apps; NAT: No NAT to the PBX, ALG Disable to the UCaaS prefix</td></tr>
<tr><td><b>Video</b></td><td>Active: VPN on Internet-A and Internet-B (load shared); backup: MPLS</td><td>Latency 150 ms, jitter 40 ms, loss 2 percent; Move Flows</td><td>Gold, real-time video</td><td>Allow meeting apps to outside; Source NAT</td></tr>
<tr><td><b>SaaS</b></td><td>Active: Direct on Internet-A and Internet-B; backup: VPN on Internet-B to the data center</td><td>Default SLA for transactional; App acceleration if used</td><td>Silver, transactional</td><td>Allow SaaS category from corporate to outside; Source NAT</td></tr>
<tr><td><b>Bulk</b></td><td>Active: Internet-B only; no 5G; no backup</td><td>Visibility only</td><td>Bronze, bulk</td><td>Allow backup servers; Source NAT or No NAT by destination</td></tr>
<tr><td><b>Payments</b></td><td>Active: VPN on MPLS; backup: VPN on Internet-A; Layer 3 failure: VPN on 5G</td><td>Loss 1 percent; FEC always on; Move Flows</td><td>Platinum, transactional</td><td>Payment zone to WAN, only the gateway prefix; No NAT</td></tr></table>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Traffic classes mapped to circuits">
<rect x="10" y="20" width="150" height="40" rx="8" fill="#bbf7d0"/><text x="85" y="45" text-anchor="middle" class="svg-ink" font-size="13">Voice</text>
<rect x="10" y="70" width="150" height="40" rx="8" fill="#bae6fd"/><text x="85" y="95" text-anchor="middle" class="svg-ink" font-size="13">Video</text>
<rect x="10" y="120" width="150" height="40" rx="8" fill="#ddd6fe"/><text x="85" y="145" text-anchor="middle" class="svg-ink" font-size="13">SaaS</text>
<rect x="10" y="170" width="150" height="40" rx="8" fill="#fed7aa"/><text x="85" y="195" text-anchor="middle" class="svg-ink" font-size="13">Bulk</text>
<rect x="480" y="20" width="150" height="50" rx="8" fill="#fde68a"/><text x="555" y="50" text-anchor="middle" class="svg-ink" font-size="13">MPLS 100M</text>
<rect x="480" y="95" width="150" height="50" rx="8" fill="#fde68a"/><text x="555" y="125" text-anchor="middle" class="svg-ink" font-size="13">Internet-A 500M</text>
<rect x="480" y="170" width="150" height="50" rx="8" fill="#fde68a"/><text x="555" y="200" text-anchor="middle" class="svg-ink" font-size="13">Internet-B 300M</text>
<line x1="160" y1="40" x2="480" y2="45" stroke="#16a34a" stroke-width="2"/><line x1="160" y1="40" x2="480" y2="110" stroke="#16a34a" stroke-width="2"/>
<line x1="160" y1="90" x2="480" y2="115" stroke="#2563eb" stroke-width="2"/><line x1="160" y1="90" x2="480" y2="185" stroke="#2563eb" stroke-width="2"/>
<line x1="160" y1="140" x2="480" y2="125" stroke="#7c3aed" stroke-width="2"/><line x1="160" y1="140" x2="480" y2="190" stroke="#7c3aed" stroke-width="2"/>
<line x1="160" y1="190" x2="480" y2="195" stroke="#ea580c" stroke-width="2"/>
</svg><p class="cap">Primary mapping of the four classes to the three circuits at STORE-007. Voice favours MPLS and Internet-A, bulk is confined to Internet-B.</p></div>
<h3>Capacity check with numbers</h3>
<p>Peak demand on Internet-B (300 Mbps): bulk 150 plus video share 10 plus SaaS share 40 equals 200 Mbps, 67 percent. If Internet-A fails, video 20, SaaS 80 and bulk 150 land on B: 250 Mbps, 83 percent, still within the circuit, and QoS makes sure voice and payments stay Platinum. If both internets fail, only MPLS (100 Mbps) remains: voice 6, payments 2 and video 20 fit at 28 percent; bulk waits. That is the failure case the design must show.</p>
<h3>Verification in monitoring</h3>
<p>After binding the stacks, check these things (the Operations module covers the tools in depth):</p>
<ul>
<li><b>Fabric link graphs</b> show the performance SLA indicator when the Visibility action is on, so you can see whether paths stay above the threshold lines.</li>
<li><b>Incidents and alerts</b> appear when a performance rule with Create Incident is violated; a quiet incident list during a known degradation means the rule is not matching.</li>
<li><b>Application views</b> show which circuit each application used, to confirm path policy.</li>
<li>On the ION, the documented command <code>dump priority-policy config policy-sets all</code> shows the QoS policy sets on the device, including the priority weights.</li>
</ul>
<h3>Reference configuration (not run in the simulator)</h3>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
<span class="c">! ION CLI command named in the documentation. No sample output is shown</span>
<span class="c">! because the exact device output is not reproduced here.</span>
dump priority-policy config policy-sets all</pre>
<h3>Troubleshooting workflow: why does this flow behave like that?</h3>
<ol>
<li><b>Bound?</b> Is the stack for this policy type bound to the site (path, QoS, performance, security, NAT each separately)?</li>
<li><b>Classified?</b> Is the application recognised? If it fell into a generic bucket, an app-def or system override is missing.</li>
<li><b>Which rule?</b> Walk the order numbers; the first match wins. Check network context, prefixes (local prefixes attached?) and application match.</li>
<li><b>Which path?</b> Does the rule list active, backup and Layer 3 failure paths on the circuits you expect? Is the active path currently qualifying?</li>
<li><b>Performance?</b> Is a performance rule matching and did it fire (incident, move)? Are the thresholds realistic?</li>
<li><b>QoS?</b> Which class and transfer type did the flow receive? Is the circuit capacity set correctly?</li>
<li><b>Security?</b> Zones bound, rule order, default-deny reached?</li>
<li><b>NAT?</b> Is the flow translated as intended, and does No NAT precede Source NAT?</li>
</ol>
<div class="eg"><p><b>Worked trace: video freezes at 15:00.</b> (1) Stacks bound: yes. (2) Application recognised as video: yes. (3) Rule match: path rule 120 "Video" matches. (4) Active paths Internet-A and Internet-B qualify. (5) Performance: no incident raised although users complain, so the SLA is too lax (loss 5 percent). Tighten to 2 percent. (6) QoS: Gold, real-time video, as designed. (7) and (8) fine. The root cause was the SLA, found at step 5.</p></div>
<div class="warn"><p><b>Common mistakes.</b> Debugging QoS when the flow is in the wrong path rule. Changing several policies at once so the effect cannot be attributed. Declaring success from a lab while the real flows match a different rule. Not documenting why each rule exists.</p></div>
<div class="exam"><p><b>Exam trap.</b> Questions often hide one wrong element in a long policy description: a missing binding, an unattached local prefix, a rule order that shadows another, an SLA that never triggers or a circuit capacity that is wrong. Apply the eight-step order and look for the single break.</p></div>
<div class="scn"><h4>Voice breaks only at the lunchtime peak</h4><p>Calls at a regional office dropped quality between 12:00 and 13:00. The path rule was right and the SLA moved flows, but the move took several seconds. The QoS rule placed voice in Gold because a broad rule above it matched all UDP. Moving the voice rule above the broad rule put voice in Platinum audio; combined with adaptive FEC the quality stayed clean through the peak.</p><p><b>Lesson:</b> check rule order in every policy type, not only in path.</p></div>
<div class="iv"><p class="q">"A user says a SaaS application is slow at one site only. How do you approach it?"</p><p>I follow the policy chain: stacks bound at that site, the application recognised, the path rule that matched, the circuit it used and whether it qualified, the performance rule and its thresholds, the QoS class and the circuit capacity, then security and NAT. I compare with a healthy site, because the difference (a local prefix, a different circuit, a stack not bound) usually shows the cause.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Design one recipe per traffic class: path, performance, QoS, security and NAT together.</li>
<li>Check capacity in normal and failure cases with numbers.</li>
<li>Verify with fabric link graphs, incidents, application views and the QoS policy set command.</li>
<li>Troubleshoot in order: bound, classified, rule, path, performance, QoS, security, NAT.</li>
<li>Change one thing at a time and compare with a healthy site.</li>
</ul></div>
`,hi:`
<p>Yeh chapter paanch policy types ko chaar traffic classes ke poore designs mein jodta hai: <b>voice</b>, <b>video</b>, <b>SaaS</b> aur <b>bulk</b>. Yeh result verify karna bhi dikhata hai aur "yeh flow aisa behave kyun kar raha hai?" sawal ke liye troubleshooting workflow deta hai. Wahi checks ka order track ke troubleshooting module mein dobara use hota hai.</p>
<h3>Analogy: ek recipe, chaar dishes</h3>
<p>Kitchen mein wahi pantry (circuits), wahi stove (ION) aur wahi cooks (policies) hote hain, par soup ko soufflé se alag handling chahiye. Achha policy design har traffic class ke liye ek saaf recipe card likhta hai aur dish kitchen se nikalne se pehle use check karta hai.</p>
<h3>Harbor Foods design</h3>
<p>STORE-007 par circuits: Internet-A 500 Mbps, Internet-B 300 Mbps, MPLS 100 Mbps. Applications aur requirements: voice (6 Mbps peak), video meetings (20 Mbps), SaaS (80 Mbps), payments (2 Mbps), backups (150 Mbps tak, ruk sakte hain).</p>
<table class="cmp"><tr><th>Class</th><th>Path policy</th><th>Performance policy</th><th>QoS</th><th>Security aur NAT</th></tr>
<tr><td><b>Voice</b></td><td>Active: MPLS aur Internet-A par VPN; backup: Internet-B par VPN; SLA compliant path</td><td>Latency 150 ms, jitter 30 ms, loss 1 percent; Move Flows, Create Incident; adaptive FEC</td><td>Platinum, real-time audio</td><td>Corporate zone se WAN, voice apps allow; NAT: PBX ke liye No NAT, UCaaS prefix ke liye ALG Disable</td></tr>
<tr><td><b>Video</b></td><td>Active: Internet-A aur Internet-B par VPN (load shared); backup: MPLS</td><td>Latency 150 ms, jitter 40 ms, loss 2 percent; Move Flows</td><td>Gold, real-time video</td><td>Meeting apps outside ko allow; Source NAT</td></tr>
<tr><td><b>SaaS</b></td><td>Active: Internet-A aur Internet-B par Direct; backup: data center tak Internet-B par VPN</td><td>Transactional ke liye default SLA; use ho to App acceleration</td><td>Silver, transactional</td><td>Corporate se outside tak SaaS category allow; Source NAT</td></tr>
<tr><td><b>Bulk</b></td><td>Active: sirf Internet-B; 5G nahi; backup nahi</td><td>Sirf Visibility</td><td>Bronze, bulk</td><td>Backup servers allow; destination ke hisaab se Source NAT ya No NAT</td></tr>
<tr><td><b>Payments</b></td><td>Active: MPLS par VPN; backup: Internet-A par VPN; Layer 3 failure: 5G par VPN</td><td>Loss 1 percent; FEC always on; Move Flows</td><td>Platinum, transactional</td><td>Payment zone se WAN, sirf gateway prefix; No NAT</td></tr></table>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Traffic classes mapped to circuits">
<rect x="10" y="20" width="150" height="40" rx="8" fill="#bbf7d0"/><text x="85" y="45" text-anchor="middle" class="svg-ink" font-size="13">Voice</text>
<rect x="10" y="70" width="150" height="40" rx="8" fill="#bae6fd"/><text x="85" y="95" text-anchor="middle" class="svg-ink" font-size="13">Video</text>
<rect x="10" y="120" width="150" height="40" rx="8" fill="#ddd6fe"/><text x="85" y="145" text-anchor="middle" class="svg-ink" font-size="13">SaaS</text>
<rect x="10" y="170" width="150" height="40" rx="8" fill="#fed7aa"/><text x="85" y="195" text-anchor="middle" class="svg-ink" font-size="13">Bulk</text>
<rect x="480" y="20" width="150" height="50" rx="8" fill="#fde68a"/><text x="555" y="50" text-anchor="middle" class="svg-ink" font-size="13">MPLS 100M</text>
<rect x="480" y="95" width="150" height="50" rx="8" fill="#fde68a"/><text x="555" y="125" text-anchor="middle" class="svg-ink" font-size="13">Internet-A 500M</text>
<rect x="480" y="170" width="150" height="50" rx="8" fill="#fde68a"/><text x="555" y="200" text-anchor="middle" class="svg-ink" font-size="13">Internet-B 300M</text>
<line x1="160" y1="40" x2="480" y2="45" stroke="#16a34a" stroke-width="2"/><line x1="160" y1="40" x2="480" y2="110" stroke="#16a34a" stroke-width="2"/>
<line x1="160" y1="90" x2="480" y2="115" stroke="#2563eb" stroke-width="2"/><line x1="160" y1="90" x2="480" y2="185" stroke="#2563eb" stroke-width="2"/>
<line x1="160" y1="140" x2="480" y2="125" stroke="#7c3aed" stroke-width="2"/><line x1="160" y1="140" x2="480" y2="190" stroke="#7c3aed" stroke-width="2"/>
<line x1="160" y1="190" x2="480" y2="195" stroke="#ea580c" stroke-width="2"/>
</svg><p class="cap">STORE-007 par chaar classes ka teen circuits se primary mapping. Voice MPLS aur Internet-A pasand karti hai, bulk Internet-B tak seemit hai.</p></div>
<h3>Numbers ke saath capacity check</h3>
<p>Internet-B (300 Mbps) par peak demand: bulk 150 plus video ka share 10 plus SaaS ka share 40 = 200 Mbps, 67 percent. Agar Internet-A fail ho, video 20, SaaS 80 aur bulk 150 B par aate hain: 250 Mbps, 83 percent, circuit ke andar, aur QoS pakka karti hai ki voice aur payments Platinum rahein. Agar dono internets fail hon to sirf MPLS (100 Mbps) bachta hai: voice 6, payments 2 aur video 20, yani 28 percent mein fit; bulk wait karta hai. Yahi failure case hai jo design ko dikhana hota hai.</p>
<h3>Monitoring mein verification</h3>
<p>Stacks bind karne ke baad yeh check karo (Operations module tools ko gehrai se cover karta hai):</p>
<ul>
<li>Jab Visibility action on ho to <b>fabric link graphs</b> performance SLA indicator dikhate hain, taaki dekh sako ki paths threshold lines ke upar rehte hain ya nahi.</li>
<li>Create Incident wale performance rule ke violate hone par <b>incidents aur alerts</b> aate hain; jaane-pehchane degradation ke dauraan khaali incident list ka matlab hai ki rule match nahi kar raha.</li>
<li><b>Application views</b> dikhate hain ki har application ne kaunsa circuit use kiya, path policy confirm karne ke liye.</li>
<li>ION par documented command <code>dump priority-policy config policy-sets all</code> device ke QoS policy sets dikhata hai, priority weights sahit.</li>
</ul>
<h3>Reference configuration (not run in the simulator)</h3>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
<span class="c">! Documentation mein naam diya gaya ION CLI command. Sample output nahi</span>
<span class="c">! dikhaya kyunki exact device output yahan reproduce nahi kiya gaya.</span>
dump priority-policy config policy-sets all</pre>
<h3>Troubleshooting workflow: yeh flow aisa kyun behave kar raha hai?</h3>
<ol>
<li><b>Bound?</b> Kya is policy type ka stack site se bound hai (path, QoS, performance, security, NAT har ek alag)?</li>
<li><b>Classified?</b> Kya application pehchani gayi? Agar generic bucket mein gayi, to app-def ya system override missing hai.</li>
<li><b>Kaunsa rule?</b> Order numbers dekho; pehla match jeetta hai. Network context, prefixes (local prefixes attached?) aur application match check karo.</li>
<li><b>Kaunsa path?</b> Kya rule mein active, backup aur Layer 3 failure paths un circuits par hain jo aap expect karte ho? Kya active path abhi qualify kar raha hai?</li>
<li><b>Performance?</b> Kya performance rule match kar raha hai aur fire hua (incident, move)? Kya thresholds realistic hain?</li>
<li><b>QoS?</b> Flow ko kaunsi class aur transfer type mili? Kya circuit capacity sahi set hai?</li>
<li><b>Security?</b> Zones bound, rule order, default-deny tak pahunch gaya?</li>
<li><b>NAT?</b> Kya flow intended tareeke se translate ho raha hai, aur kya No NAT Source NAT se pehle hai?</li>
</ol>
<div class="eg"><p><b>Worked trace: 15:00 par video freeze.</b> (1) Stacks bound: haan. (2) Application video ke roop mein recognised: haan. (3) Rule match: path rule 120 "Video" match karta hai. (4) Active paths Internet-A aur Internet-B qualify karte hain. (5) Performance: users ki shikayat ke bawajood koi incident raise nahi hua, isliye SLA bahut dheela hai (loss 5 percent). Use 2 percent par tight karo. (6) QoS: Gold, real-time video, jaisa design kiya. (7) aur (8) theek. Root cause SLA tha, step 5 par mila.</p></div>
<div class="warn"><p><b>Common galtiyan.</b> Jab flow galat path rule mein hai tab QoS debug karna. Ek saath kai policies badalna taaki effect attribute na ho sake. Lab se success declare karna jabki real flows alag rule se match karte hain. Yeh document na karna ki har rule kyun hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Sawal aksar lambi policy description mein ek galat element chhupa dete hain: missing binding, unattached local prefix, doosre ko shadow karne wala rule order, SLA jo kabhi trigger nahi hota ya galat circuit capacity. Aath-step order lagao aur ek break dhoondho.</p></div>
<div class="scn"><h4>Voice sirf lunchtime peak par tootti hai</h4><p>Regional office par 12:00 se 13:00 ke beech calls ki quality gir gayi. Path rule sahi tha aur SLA ne flows move kiye, par move mein kuch second lage. QoS rule ne voice ko Gold mein rakha kyunki uske upar ka broad rule saare UDP ko match karta tha. Voice rule ko broad rule ke upar le jaane se voice Platinum audio mein aayi; adaptive FEC ke saath peak ke dauraan quality saaf rahi.</p><p><b>Seekh:</b> rule order har policy type mein check karo, sirf path mein nahi.</p></div>
<div class="iv"><p class="q">"User kehta hai ki SaaS application sirf ek site par slow hai. Kaise approach karoge?"</p><p>Main policy chain follow karta hoon: us site par stacks bound, application recognised, kaunsa path rule match hua, kaunsa circuit use hua aur kya woh qualify karta tha, performance rule aur uske thresholds, QoS class aur circuit capacity, phir security aur NAT. Main healthy site se compare karta hoon, kyunki farak (local prefix, alag circuit, bound na hua stack) aksar karan dikha deta hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har traffic class ke liye ek recipe design karo: path, performance, QoS, security aur NAT saath mein.</li>
<li>Normal aur failure cases mein capacity numbers ke saath check karo.</li>
<li>Fabric link graphs, incidents, application views aur QoS policy set command se verify karo.</li>
<li>Order mein troubleshoot karo: bound, classified, rule, path, performance, QoS, security, NAT.</li>
<li>Ek samay mein ek cheez badlo aur healthy site se compare karo.</li>
</ul></div>
`}};export{e as default};