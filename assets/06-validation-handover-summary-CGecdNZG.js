var e={id:`validation-handover-summary`,h:{en:`Summary and exam checklist: assurance, validation and handover`,hi:`Summary aur exam checklist: assurance, validation aur handover`},body:{en:`
<h3>The case: Vantage Convention Centre</h3>
<p>Vantage Convention Centre finished a new Wi-Fi 6E network for its main hall. The installer said "it works" and asked for a signature. A week later, during the first trade show, the SSO pair failed over and 40 percent of exhibitor devices needed a manual reconnect. Nobody had ever tested a failover. There was no list of what the design promised, no baseline of normal behaviour, and no handover document telling the in-house team what to do. The design was not bad. It was <b>unproven</b>.</p>

<h3>Requirements and constraints</h3>
<ul>
<li>Prove before sign-off that every high-availability promise in the design actually works.</li>
<li>Give operations a baseline, so they can tell normal from broken.</li>
<li>Hand over documents that a new engineer can use at 3 a.m.</li>
<li>Testing windows are short, and the hall is booked for events.</li>
</ul>

<h3>Assurance and monitoring</h3>
<p><b>Catalyst Center Assurance</b> shows AP and client health, onboarding failures and issue trends, so you can set a baseline before go-live and compare after. <b>Controller telemetry</b>, which the 9800 can stream in a model-driven way, gives frequent counters to your own tools. For deep troubleshooting you capture packets: an <b>embedded packet capture</b> on the controller, <b>intelligent capture</b> from supported APs through Catalyst Center, or an <b>over-the-air</b> capture with a sniffer. Per-client <b>radioactive tracing</b> on the 9800 collects logs for one MAC address without flooding the controller. Choose the lightest tool that answers the question.</p>

<h3>Design validation and acceptance testing</h3>
<p>Validation has two halves. A <b>post-deployment survey</b> proves coverage and capacity (signal level, SNR, channel utilisation, roaming). A <b>failure test plan</b> proves availability. Each test has an expected result and a pass mark written before the test starts.</p>
<table class="cmp"><tr><th>Test</th><th>Action</th><th>Expected result</th></tr>
<tr><td>Controller failover</td><td>Power off the active unit</td><td>Standby takes over; APs stay joined; a test call survives</td></tr>
<tr><td>Uplink failure</td><td>Unplug one LAG member and one core switch</td><td>No client impact beyond reduced bandwidth</td></tr>
<tr><td>AP loss</td><td>Remove power from one AP in a voice area</td><td>Neighbours keep about -67 dBm; calls continue</td></tr>
<tr><td>WAN failure (Flex sites)</td><td>Pull the WAN link</td><td>Local-switched WLANs work; new 802.1X logins succeed via backup</td></tr>
<tr><td>Service failure</td><td>Stop one RADIUS and one DHCP server</td><td>Second server takes over within the timers</td></tr>
<tr><td>Roaming</td><td>Walk a call between floors</td><td>No audible gap</td></tr>
<tr><td>Capacity</td><td>Run throughput tests with a client load</td><td>Meets the agreed numbers</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="From design to handover">
<rect x="20" y="30" width="130" height="60" rx="10" fill="#bae6fd"/><text x="85" y="66" text-anchor="middle" class="svg-ink" font-size="13">Design (HLD)</text>
<rect x="175" y="30" width="130" height="60" rx="10" fill="#ddd6fe"/><text x="240" y="66" text-anchor="middle" class="svg-ink" font-size="13">Build (LLD)</text>
<rect x="330" y="30" width="130" height="60" rx="10" fill="#fde68a"/><text x="395" y="66" text-anchor="middle" class="svg-ink" font-size="13">Test + survey</text>
<rect x="485" y="30" width="135" height="60" rx="10" fill="#bbf7d0"/><text x="552" y="66" text-anchor="middle" class="svg-ink" font-size="13">Handover</text>
<line x1="150" y1="60" x2="175" y2="60" stroke="#64748b" stroke-width="2"/><line x1="305" y1="60" x2="330" y2="60" stroke="#64748b" stroke-width="2"/><line x1="460" y1="60" x2="485" y2="60" stroke="#64748b" stroke-width="2"/>
<rect x="20" y="115" width="130" height="40" rx="8" fill="#e2e8f0"/><text x="85" y="140" text-anchor="middle" class="svg-ink" font-size="12">Goals, risks</text>
<rect x="175" y="115" width="130" height="40" rx="8" fill="#e2e8f0"/><text x="240" y="140" text-anchor="middle" class="svg-ink" font-size="12">IPs, tags, BoM</text>
<rect x="330" y="115" width="130" height="40" rx="8" fill="#e2e8f0"/><text x="395" y="140" text-anchor="middle" class="svg-ink" font-size="12">Pass or fail log</text>
<rect x="485" y="115" width="135" height="40" rx="8" fill="#e2e8f0"/><text x="552" y="140" text-anchor="middle" class="svg-ink" font-size="12">Runbook, as-built</text>
<rect x="20" y="195" width="14" height="14" fill="#bae6fd"/><text x="40" y="207" class="svg-muted" font-size="12">Plan</text>
<rect x="100" y="195" width="14" height="14" fill="#ddd6fe"/><text x="120" y="207" class="svg-muted" font-size="12">Detail</text>
<rect x="190" y="195" width="14" height="14" fill="#fde68a"/><text x="210" y="207" class="svg-muted" font-size="12">Proof</text>
<rect x="270" y="195" width="14" height="14" fill="#bbf7d0"/><text x="290" y="207" class="svg-muted" font-size="12">Operate</text>
<rect x="360" y="195" width="14" height="14" fill="#e2e8f0"/><text x="380" y="207" class="svg-muted" font-size="12">Document</text>
</svg><p class="cap">Every stage produces a document. The test log is what turns a promise into proof.</p></div>

<h3>Documenting the design</h3>
<p>A <b>high-level design (HLD)</b> records the business goals, requirements, architecture, key decisions with their reasons, and risks. A <b>low-level design (LLD)</b> records the details to build and operate: VLANs and addressing, policy, site and RF tags, SSID settings, AP names and switch ports, RADIUS and DHCP settings, HA settings and timers. A <b>bill of materials (BoM)</b> lists hardware, AP counts, licences with terms, and support contracts. The <b>handover pack</b> adds the test results, an as-built diagram, a runbook for the common failures, and contacts.</p>
<div class="eg"><p><b>Worked example.</b> Vantage's HLD says: "Recover from a controller loss in under 10 seconds, no client reconnects." The LLD names the pair, the RP link and RMI addressing. The test plan has one line: power off the active unit during a test call. The handover pack stores the result. Anyone can now trace goal, setting and proof.</p></div>

<div class="warn"><p><b>Post-mortem.</b> Vantage skipped the failure tests because "the vendor confirmed SSO". The first real failover revealed that the standby gateway check was misconfigured. A ten-minute test would have found it before the show.</p></div>
<div class="exam"><p><b>Exam traps.</b> A survey proves coverage, not availability. HLD is goals and decisions; LLD is settings. Acceptance criteria are agreed before testing, not after.</p></div>

<div class="scn"><h4>The test that saved the launch</h4><p>On a university deployment, the acceptance test included killing one RADIUS server. Authentication hung for 90 seconds because the timeouts were too long. The team tuned the dead-server timers on the spot and re-ran the test. The same flaw had caused a campus-wide login failure at a previous customer.</p><p><b>Lesson:</b> test the failure, not the feature.</p></div>

<div class="iv"><p class="q">"How do you prove that a wireless design is highly available?"</p><p>Strong answer: write acceptance criteria from the requirements, then run planned failure tests (controller, uplink, AP, WAN, RADIUS, DHCP), measure the result, run a post-deployment survey, and document everything in the handover pack. Baseline with Assurance so operations can spot drift.</p></div>

<h3>Exam checklist</h3>
<ul>
<li>Choose SSO, N+1, N+N or geographic redundancy for a given case and justify it.</li>
<li>State the AP join order and how failover priority works.</li>
<li>Describe FlexConnect standalone behaviour for central and local WLANs.</li>
<li>Design controller LAG, AP switch redundancy and PoE for a failure.</li>
<li>Analyse DHCP, DNS, AAA and Spaces failures for existing and new clients.</li>
<li>Pick an upgrade strategy and size capacity and licences.</li>
<li>Plan an AireOS to 9800 migration with tags, mobility and a rollback.</li>
<li>Write acceptance tests and describe HLD, LLD, BoM and handover.</li>
</ul>
<dl class="terms"><dt>SSO</dt><dd>Stateful Switchover: hot standby controller with synchronised state.</dd>
<dt>RP and RMI</dt><dd>Redundancy port for state sync; redundancy management interface for keep-alive and gateway checks.</dd>
<dt>N+1</dt><dd>One backup controller shared by several primaries.</dd>
<dt>Standalone mode</dt><dd>Flex AP serving clients without a controller.</dd>
<dt>HLD / LLD</dt><dd>High-level design / low-level design.</dd></dl>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Availability is proven by failure tests, not by feature lists.</li>
<li>Baseline with Assurance and telemetry; capture packets only when needed.</li>
<li>HLD gives goals and decisions; LLD gives settings; BoM gives parts and licences.</li>
<li>Handover includes test results, as-built diagrams and a runbook.</li>
<li>Always reason in this order: requirement, constraint, options, trade-off, design, proof.</li>
</ul></div>
`,hi:`
<h3>Case: Vantage Convention Centre</h3>
<p>Vantage Convention Centre ne apne main hall ke liye naya Wi-Fi 6E network banaya. Installer ne kaha "it works" aur signature maanga. Ek hafte baad, pehle trade show ke dauran SSO pair failover hua aur 40 percent exhibitor devices ko manually reconnect karna pada. Kisi ne kabhi failover test nahi kiya tha. Design kya promise karta hai uski koi list nahi thi, normal behaviour ka koi baseline nahi tha, aur in-house team ko batane wala koi handover document nahi tha. Design kharab nahi tha. Woh <b>unproven</b> tha.</p>

<h3>Requirements aur constraints</h3>
<ul>
<li>Sign-off se pehle prove karo ki design ka har high-availability promise sach mein kaam karta hai.</li>
<li>Operations ko baseline do taaki woh normal aur broken mein farak kar sakein.</li>
<li>Aise documents handover karo jo naya engineer raat 3 baje use kar sake.</li>
<li>Testing windows chhoti hain, aur hall events ke liye booked hai.</li>
</ul>

<h3>Assurance aur monitoring</h3>
<p><b>Catalyst Center Assurance</b> AP aur client health, onboarding failures aur issue trends dikhata hai, taaki go-live se pehle baseline set karo aur baad mein compare karo. <b>Controller telemetry</b>, jo 9800 model-driven tareeke se stream kar sakta hai, aapke apne tools ko frequent counters deti hai. Deep troubleshooting ke liye packets capture karte hain: controller par <b>embedded packet capture</b>, Catalyst Center ke through supported APs se <b>intelligent capture</b>, ya sniffer se <b>over-the-air</b> capture. 9800 par per-client <b>radioactive tracing</b> ek MAC address ke logs controller ko flood kiye bina collect karti hai. Wahi tool chuno jo sawaal ka jawab sabse halke mein de.</p>

<h3>Design validation aur acceptance testing</h3>
<p>Validation ke do hisse hain. <b>Post-deployment survey</b> coverage aur capacity prove karta hai (signal level, SNR, channel utilisation, roaming). <b>Failure test plan</b> availability prove karta hai. Har test ka expected result aur pass mark test shuru hone se pehle likha hota hai.</p>
<table class="cmp"><tr><th>Test</th><th>Action</th><th>Expected result</th></tr>
<tr><td>Controller failover</td><td>Active unit ko power off karo</td><td>Standby takeover karta hai; APs joined rehte hain; test call bachti hai</td></tr>
<tr><td>Uplink failure</td><td>Ek LAG member aur ek core switch unplug karo</td><td>Kam bandwidth ke alawa koi client impact nahi</td></tr>
<tr><td>AP loss</td><td>Voice area ke ek AP ki power hatao</td><td>Neighbours lagbhag -67 dBm rakhte hain; calls chalti hain</td></tr>
<tr><td>WAN failure (Flex sites)</td><td>WAN link pull karo</td><td>Local-switched WLANs chalte hain; naye 802.1X logins backup se succeed</td></tr>
<tr><td>Service failure</td><td>Ek RADIUS aur ek DHCP server band karo</td><td>Doosra server timers ke andar takeover karta hai</td></tr>
<tr><td>Roaming</td><td>Call ke saath floors ke beech chalo</td><td>Koi sunai dene wala gap nahi</td></tr>
<tr><td>Capacity</td><td>Client load ke saath throughput tests chalao</td><td>Agreed numbers meet hote hain</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Design se handover tak">
<rect x="20" y="30" width="130" height="60" rx="10" fill="#bae6fd"/><text x="85" y="66" text-anchor="middle" class="svg-ink" font-size="13">Design (HLD)</text>
<rect x="175" y="30" width="130" height="60" rx="10" fill="#ddd6fe"/><text x="240" y="66" text-anchor="middle" class="svg-ink" font-size="13">Build (LLD)</text>
<rect x="330" y="30" width="130" height="60" rx="10" fill="#fde68a"/><text x="395" y="66" text-anchor="middle" class="svg-ink" font-size="13">Test + survey</text>
<rect x="485" y="30" width="135" height="60" rx="10" fill="#bbf7d0"/><text x="552" y="66" text-anchor="middle" class="svg-ink" font-size="13">Handover</text>
<line x1="150" y1="60" x2="175" y2="60" stroke="#64748b" stroke-width="2"/><line x1="305" y1="60" x2="330" y2="60" stroke="#64748b" stroke-width="2"/><line x1="460" y1="60" x2="485" y2="60" stroke="#64748b" stroke-width="2"/>
<rect x="20" y="115" width="130" height="40" rx="8" fill="#e2e8f0"/><text x="85" y="140" text-anchor="middle" class="svg-ink" font-size="12">Goals, risks</text>
<rect x="175" y="115" width="130" height="40" rx="8" fill="#e2e8f0"/><text x="240" y="140" text-anchor="middle" class="svg-ink" font-size="12">IPs, tags, BoM</text>
<rect x="330" y="115" width="130" height="40" rx="8" fill="#e2e8f0"/><text x="395" y="140" text-anchor="middle" class="svg-ink" font-size="12">Pass ya fail log</text>
<rect x="485" y="115" width="135" height="40" rx="8" fill="#e2e8f0"/><text x="552" y="140" text-anchor="middle" class="svg-ink" font-size="12">Runbook, as-built</text>
<rect x="20" y="195" width="14" height="14" fill="#bae6fd"/><text x="40" y="207" class="svg-muted" font-size="12">Plan</text>
<rect x="100" y="195" width="14" height="14" fill="#ddd6fe"/><text x="120" y="207" class="svg-muted" font-size="12">Detail</text>
<rect x="190" y="195" width="14" height="14" fill="#fde68a"/><text x="210" y="207" class="svg-muted" font-size="12">Saboot</text>
<rect x="270" y="195" width="14" height="14" fill="#bbf7d0"/><text x="290" y="207" class="svg-muted" font-size="12">Operate</text>
<rect x="360" y="195" width="14" height="14" fill="#e2e8f0"/><text x="380" y="207" class="svg-muted" font-size="12">Document</text>
</svg><p class="cap">Har stage ek document banata hai. Test log promise ko saboot mein badalta hai.</p></div>

<h3>Design ko document karna</h3>
<p><b>High-level design (HLD)</b> business goals, requirements, architecture, key decisions unke reasons ke saath, aur risks record karta hai. <b>Low-level design (LLD)</b> build aur operate karne ki details record karta hai: VLANs aur addressing, policy, site aur RF tags, SSID settings, AP names aur switch ports, RADIUS aur DHCP settings, HA settings aur timers. <b>Bill of materials (BoM)</b> hardware, AP counts, terms ke saath licences, aur support contracts list karta hai. <b>Handover pack</b> mein test results, as-built diagram, common failures ka runbook aur contacts judte hain.</p>
<div class="eg"><p><b>Worked example.</b> Vantage ka HLD kehta hai: "Controller loss se 10 seconds se kam mein recover karo, koi client reconnect nahi." LLD pair, RP link aur RMI addressing ka naam likhta hai. Test plan ki ek line hai: test call ke dauran active unit power off karo. Handover pack result store karta hai. Ab koi bhi goal, setting aur proof trace kar sakta hai.</p></div>

<div class="warn"><p><b>Post-mortem.</b> Vantage ne failure tests yeh kehke chhod diye ki "vendor ne SSO confirm kiya". Pehle asli failover mein pata chala ki standby gateway check galat configure tha. Das minute ka test show se pehle isse pakad leta.</p></div>
<div class="exam"><p><b>Exam traps.</b> Survey coverage prove karta hai, availability nahi. HLD goals aur decisions hai; LLD settings hai. Acceptance criteria testing se pehle agree hote hain, baad mein nahi.</p></div>

<div class="scn"><h4>Test jisne launch bachaya</h4><p>Ek university deployment mein acceptance test mein ek RADIUS server band karna shamil tha. Authentication 90 seconds atka raha kyunki timeouts bahut lambe the. Team ne wahin dead-server timers tune kiye aur test dobara chalaya. Yahi flaw pichhle customer par campus-wide login failure kara chuka tha.</p><p><b>Seekh:</b> feature nahi, failure test karo.</p></div>

<div class="iv"><p class="q">"Kaise prove karoge ki wireless design highly available hai?"</p><p>Strong answer: requirements se acceptance criteria likho, phir planned failure tests chalao (controller, uplink, AP, WAN, RADIUS, DHCP), result measure karo, post-deployment survey karo, aur sab kuch handover pack mein document karo. Assurance se baseline lo taaki operations drift pakad sake.</p></div>

<h3>Exam checklist</h3>
<ul>
<li>Diye gaye case ke liye SSO, N+1, N+N ya geographic redundancy chuno aur justify karo.</li>
<li>AP join order aur failover priority kaise kaam karti hai batao.</li>
<li>Central aur local WLANs ke liye FlexConnect standalone behaviour describe karo.</li>
<li>Failure ke liye controller LAG, AP switch redundancy aur PoE design karo.</li>
<li>Existing aur new clients ke liye DHCP, DNS, AAA aur Spaces failures analyse karo.</li>
<li>Upgrade strategy chuno aur capacity aur licences size karo.</li>
<li>Tags, mobility aur rollback ke saath AireOS se 9800 migration plan karo.</li>
<li>Acceptance tests likho aur HLD, LLD, BoM aur handover describe karo.</li>
</ul>
<dl class="terms"><dt>SSO</dt><dd>Stateful Switchover: synchronised state wala hot standby controller.</dd>
<dt>RP aur RMI</dt><dd>State sync ke liye redundancy port; keep-alive aur gateway checks ke liye redundancy management interface.</dd>
<dt>N+1</dt><dd>Kai primaries ke liye ek shared backup controller.</dd>
<dt>Standalone mode</dt><dd>Controller ke bina clients ko serve karta Flex AP.</dd>
<dt>HLD / LLD</dt><dd>High-level design / low-level design.</dd></dl>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Availability failure tests se prove hoti hai, feature lists se nahi.</li>
<li>Assurance aur telemetry se baseline lo; packets tabhi capture karo jab zaroorat ho.</li>
<li>HLD goals aur decisions deta hai; LLD settings; BoM parts aur licences.</li>
<li>Handover mein test results, as-built diagrams aur runbook hote hain.</li>
<li>Hamesha is order mein socho: requirement, constraint, options, trade-off, design, proof.</li>
</ul></div>
`}};export{e as default};