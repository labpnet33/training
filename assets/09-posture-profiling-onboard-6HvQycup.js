var e={id:`posture-profiling-onboard`,h:{en:`Posture, profiling and Onboard: the concepts around CoA`,hi:`Posture, profiling aur Onboard: CoA ke aas-paas ke concepts`},body:{en:`
<p><b>Not simulated in the lab.</b> OnGuard posture, device profiling and Onboard are explained here as real product concepts. The lab does not install agents, collect health data, fingerprint devices or issue certificates. The part the lab does simulate is the end of the story: a role such as QUARANTINE and a CoA that moves a client into it.</p>

<h3>Start with an analogy: three different questions at the building gate</h3>
<p>A secure building asks three separate questions. <b>Who are you?</b> (the badge, which is authentication). <b>What are you carrying?</b> (a bag check, which is posture or health). <b>What kind of thing is this?</b> (a person, a delivery robot, a vehicle, which is profiling). A fourth, <b>how do I give you a lasting pass?</b>, is enrolment (Onboard). ClearPass can answer all of them, but they are different questions and the answers can disagree. A trusted employee can carry a dangerous bag; a healthy laptop can belong to the wrong person.</p>

<h3>Posture with OnGuard</h3>
<p><b>OnGuard</b> is the ClearPass health-check function. An agent on the endpoint (a persistent agent, or a temporary one delivered through a web page) collects health information such as operating system patch level, antivirus presence and state, firewall state and similar checks, and sends it to ClearPass. ClearPass evaluates it against the rules you wrote and assigns a <b>system posture token</b>. You have already met the default in the Access Tracker Summary: <code>System Posture Status : UNKNOWN (100)</code>. The common tokens are:</p>
<table class="cmp"><tr><th>Token</th><th>Value</th><th>Meaning</th></tr>
<tr><td>HEALTHY</td><td>0</td><td>All checks pass.</td></tr>
<tr><td>CHECKUP</td><td>10</td><td>Passes, but improvements are advised.</td></tr>
<tr><td>TRANSITION</td><td>15</td><td>Temporary state while the device is being fixed.</td></tr>
<tr><td>QUARANTINE</td><td>20</td><td>Failed a required check; remediation needed.</td></tr>
<tr><td>INFECTED</td><td>25</td><td>Evidence of malware.</td></tr>
<tr><td>UNKNOWN</td><td>100</td><td>No posture information available.</td></tr></table>
<p>The enforcement policy can then use the posture in a rule, for example "if the posture is not healthy, return EP-QUARANTINE". That is the same enforcement profile, role and VLAN you configured in the lab.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Posture loop">
<rect x="10" y="20" width="140" height="56" rx="8" fill="#e2e8f0"/><text x="80" y="44" text-anchor="middle" class="svg-ink" font-size="13">Endpoint + agent</text><text x="80" y="62" text-anchor="middle" class="svg-muted" font-size="12">health data</text>
<rect x="250" y="20" width="140" height="56" rx="8" fill="#bbf7d0"/><text x="320" y="44" text-anchor="middle" class="svg-ink" font-size="13">ClearPass</text><text x="320" y="62" text-anchor="middle" class="svg-muted" font-size="12">posture token</text>
<rect x="490" y="20" width="140" height="56" rx="8" fill="#bae6fd"/><text x="560" y="44" text-anchor="middle" class="svg-ink" font-size="13">Switch</text><text x="560" y="62" text-anchor="middle" class="svg-muted" font-size="12">role by CoA</text>
<line x1="150" y1="48" x2="250" y2="48" stroke="#64748b"/><line x1="390" y1="48" x2="490" y2="48" stroke="#64748b"/>
<text x="200" y="40" text-anchor="middle" class="svg-muted" font-size="12">report</text><text x="440" y="40" text-anchor="middle" class="svg-muted" font-size="12">CoA</text>
<text x="320" y="120" text-anchor="middle" class="svg-ink" font-size="13">Unhealthy: CoA to QUARANTINE (VLAN 50, remediation only)</text>
<text x="320" y="146" text-anchor="middle" class="svg-ink" font-size="13">Fixed: new report, CoA back to EMPLOYEE (VLAN 10)</text>
<text x="320" y="174" text-anchor="middle" class="svg-muted" font-size="12">Not simulated in the lab: the agent and the checks. Simulated: role and CoA.</text>
</svg><p class="cap">Posture is a loop: check, decide, change the live session, check again.</p></div>

<p>Two design points matter. First, <b>unknown is not healthy</b>. If the agent did not run, the posture is UNKNOWN. Decide whether UNKNOWN gets limited access, and test healthy, unhealthy and unknown separately. Second, quarantine must still allow <b>remediation</b>: patch servers, antivirus updates and the ClearPass page itself. In the lab the QUAR-IN list on R1 permits 10.20.60.0/24, so the device can still reach ClearPass.</p>

<h3>Device profiling</h3>
<p>Many devices cannot run 802.1X or an agent: printers, cameras, badge readers, medical devices. <b>Profiling</b> lets ClearPass guess what a device is without credentials. It collects clues, for example DHCP options and the DHCP fingerprint, HTTP user-agent strings from the network, SNMP or network scans, and the MAC vendor prefix, and assigns a category and family such as Printer or Camera. In the lab we set the category by hand (Category=Printer on the endpoint). In the real product profiling can fill these attributes automatically, and a role-mapping rule on <code>Endpoint:Category</code> then turns them into roles, exactly as in the capstone lab of the next modules.</p>
<p>Profiling is a hint, not a proof. A MAC address can be copied. A profile that says "printer" is much weaker evidence than a certificate. That is why profile-based access should land in a restricted IoT role, as in the lab (VLAN 30) rather than the employee network. If a device's category changes after profiling updates, ClearPass can use CoA to move the session.</p>

<h3>Onboard</h3>
<p><b>Onboard</b> is the enrolment function. A user signs in on an onboarding page, and ClearPass helps the device receive a certificate and the wireless or wired network settings. Later the device authenticates with that certificate (EAP-TLS), which does not depend on a password the user can type wrongly. Onboard also supports revocation: revoke a lost laptop's certificate and it can no longer connect. Onboard uses a certificate authority and is a different product area from guest registration. A guest account is a temporary visitor identity; Onboard is a managed device credential. Certificates and EAP-TLS are concepts in this course and are not simulated.</p>

<div class="warn"><p><b>Common mistake.</b> Treating these functions as interchangeable. A guest account does not prove the device is managed. An Onboard certificate does not prove the device is healthy today. A passing posture check does not prove the user is allowed. Each answers its own question.</p></div>

<div class="exam"><p><b>Exam trap.</b> UNKNOWN (100) is the default posture value when no posture data exists; it is not a failure and it is not a pass. Also, posture, profiling and Onboard decide what the role should be; the actual change to a live session is done by CoA.</p></div>

<div class="scn"><h4>The laptop that stopped updating</h4><p>A bank used posture checks with an antivirus rule. A laptop's antivirus service stopped overnight. On its next check the agent reported the problem, ClearPass set the token to QUARANTINE and sent a CoA. The laptop landed in the quarantine VLAN with only the update servers reachable. The user restarted the service, the next check passed, and a second CoA returned the laptop to the employee role. The helpdesk had no ticket to take.</p><p><b>Lesson:</b> posture works because CoA lets the role change while the user is logged in.</p></div>

<div class="iv"><p class="q">"What is the difference between posture, profiling and onboarding?"</p><p>Strong answer: posture asks whether an endpoint is healthy (agent-collected data and a posture token), profiling asks what kind of device it is (DHCP, HTTP and other fingerprints), onboarding provisions a managed credential and network settings so the device can use certificate-based access. Add that a CoA is how a result is applied to a live session, and that unknown posture should not be treated as healthy.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>OnGuard posture assigns a token; UNKNOWN (100) means no data, and is not healthy.</li>
<li>Quarantine must still allow remediation access.</li>
<li>Profiling guesses a device type without credentials; treat it as a hint and restrict the role.</li>
<li>Onboard enrols devices with certificates; it is different from guest registration.</li>
<li>These are concepts here and not simulated; the role and the CoA are simulated.</li>
</ul></div>
`,hi:`
<p><b>Not simulated in the lab.</b> OnGuard posture, device profiling aur Onboard yahan real product concepts ke roop mein samjhaye gaye hain. Lab agents install nahi karta, health data collect nahi karta, devices fingerprint nahi karta aur certificates issue nahi karta. Lab jo hissa simulate karta hai woh kahani ka end hai: QUARANTINE jaisa role aur CoA jo client ko usme move karta hai.</p>

<h3>Ek analogy se shuru karo: building gate par teen alag sawaal</h3>
<p>Secure building teen alag sawaal poochti hai. <b>Aap kaun ho?</b> (badge, yaani authentication). <b>Aap kya le kar aaye ho?</b> (bag check, yaani posture ya health). <b>Yeh cheez kis kism ki hai?</b> (insaan, delivery robot, gaadi, yaani profiling). Chautha, <b>main aapko lasting pass kaise doon?</b>, enrolment hai (Onboard). ClearPass sab ka jawab de sakta hai, lekin yeh alag sawaal hain aur jawab ek dusre se alag ho sakte hain. Trusted employee khatarnaak bag le aa sakta hai; healthy laptop galat insaan ka ho sakta hai.</p>

<h3>OnGuard ke saath posture</h3>
<p><b>OnGuard</b> ClearPass ka health-check function hai. Endpoint par ek agent (persistent agent, ya web page se aaya temporary agent) operating system patch level, antivirus presence aur state, firewall state jaise health checks collect karta hai aur ClearPass ko bhejta hai. ClearPass use aapke likhe rules ke against evaluate karta hai aur ek <b>system posture token</b> assign karta hai. Default aap Access Tracker Summary mein dekh chuke ho: <code>System Posture Status : UNKNOWN (100)</code>. Common tokens:</p>
<table class="cmp"><tr><th>Token</th><th>Value</th><th>Matlab</th></tr>
<tr><td>HEALTHY</td><td>0</td><td>Saare checks pass.</td></tr>
<tr><td>CHECKUP</td><td>10</td><td>Pass, lekin improvements advised.</td></tr>
<tr><td>TRANSITION</td><td>15</td><td>Device fix ho raha hai, temporary state.</td></tr>
<tr><td>QUARANTINE</td><td>20</td><td>Required check fail; remediation chahiye.</td></tr>
<tr><td>INFECTED</td><td>25</td><td>Malware ka evidence.</td></tr>
<tr><td>UNKNOWN</td><td>100</td><td>Posture information available nahi.</td></tr></table>
<p>Enforcement policy phir rule mein posture use kar sakti hai, jaise "agar posture healthy nahi hai to EP-QUARANTINE return karo". Yeh wahi enforcement profile, role aur VLAN hai jo aapne lab mein configure kiye.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Posture loop">
<rect x="10" y="20" width="140" height="56" rx="8" fill="#e2e8f0"/><text x="80" y="44" text-anchor="middle" class="svg-ink" font-size="13">Endpoint + agent</text><text x="80" y="62" text-anchor="middle" class="svg-muted" font-size="12">health data</text>
<rect x="250" y="20" width="140" height="56" rx="8" fill="#bbf7d0"/><text x="320" y="44" text-anchor="middle" class="svg-ink" font-size="13">ClearPass</text><text x="320" y="62" text-anchor="middle" class="svg-muted" font-size="12">posture token</text>
<rect x="490" y="20" width="140" height="56" rx="8" fill="#bae6fd"/><text x="560" y="44" text-anchor="middle" class="svg-ink" font-size="13">Switch</text><text x="560" y="62" text-anchor="middle" class="svg-muted" font-size="12">CoA se role</text>
<line x1="150" y1="48" x2="250" y2="48" stroke="#64748b"/><line x1="390" y1="48" x2="490" y2="48" stroke="#64748b"/>
<text x="200" y="40" text-anchor="middle" class="svg-muted" font-size="12">report</text><text x="440" y="40" text-anchor="middle" class="svg-muted" font-size="12">CoA</text>
<text x="320" y="120" text-anchor="middle" class="svg-ink" font-size="13">Unhealthy: CoA se QUARANTINE (VLAN 50, sirf remediation)</text>
<text x="320" y="146" text-anchor="middle" class="svg-ink" font-size="13">Fixed: naya report, CoA se wapas EMPLOYEE (VLAN 10)</text>
<text x="320" y="174" text-anchor="middle" class="svg-muted" font-size="12">Lab mein simulated nahi: agent aur checks. Simulated: role aur CoA.</text>
</svg><p class="cap">Posture ek loop hai: check, decide, live session badlo, phir check.</p></div>

<p>Do design points matter. Pehla, <b>unknown healthy nahi hota</b>. Agar agent chala hi nahi to posture UNKNOWN hai. Decide karo ki UNKNOWN ko limited access milega ya nahi, aur healthy, unhealthy aur unknown ko alag test karo. Doosra, quarantine mein bhi <b>remediation</b> allowed hona chahiye: patch servers, antivirus updates aur ClearPass ka apna page. Lab mein R1 ki QUAR-IN list 10.20.60.0/24 permit karti hai, isliye device ClearPass tak phir bhi pahunch sakta hai.</p>

<h3>Device profiling</h3>
<p>Bahut se devices 802.1X ya agent nahi chala sakte: printers, cameras, badge readers, medical devices. <b>Profiling</b> ClearPass ko credentials ke bina andaza lagane deti hai ki device kya hai. Woh clues collect karta hai, jaise DHCP options aur DHCP fingerprint, network se HTTP user-agent strings, SNMP ya network scans, aur MAC vendor prefix, aur Printer ya Camera jaisi category aur family assign karta hai. Lab mein hum category haath se set karte hain (endpoint par Category=Printer). Real product mein profiling yeh attributes automatically bhar sakti hai, aur <code>Endpoint:Category</code> par role-mapping rule unhe roles mein badal deta hai, bilkul agle modules ke capstone lab ki tarah.</p>
<p>Profiling hint hai, proof nahi. MAC address copy ho sakta hai. "Printer" kehne wala profile certificate se kaafi kamzor evidence hai. Isliye profile-based access restricted IoT role mein land hona chahiye, jaise lab mein (VLAN 30), employee network mein nahi. Profiling updates se device ki category badle to ClearPass session ko move karne ke liye CoA use kar sakta hai.</p>

<h3>Onboard</h3>
<p><b>Onboard</b> enrolment function hai. User onboarding page par sign in karta hai, aur ClearPass device ko certificate aur wireless ya wired network settings dilwane mein madad karta hai. Baad mein device us certificate (EAP-TLS) se authenticate karta hai, jo aise password par depend nahi karta jo user galat type kar sake. Onboard revocation bhi support karta hai: khoye hue laptop ka certificate revoke karo aur woh connect nahi kar sakta. Onboard certificate authority use karta hai aur guest registration se alag product area hai. Guest account temporary visitor identity hai; Onboard managed device credential hai. Certificates aur EAP-TLS is course mein concepts hain aur simulated nahi.</p>

<div class="warn"><p><b>Common mistake.</b> In functions ko interchangeable samajhna. Guest account prove nahi karta ki device managed hai. Onboard certificate prove nahi karta ki device aaj healthy hai. Passing posture check prove nahi karta ki user allowed hai. Har ek apne sawaal ka jawab deta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> UNKNOWN (100) woh default posture value hai jab posture data exist nahi karta; yeh na failure hai na pass. Yeh bhi: posture, profiling aur Onboard decide karte hain ki role kya hona chahiye; live session mein asli change CoA karta hai.</p></div>

<div class="scn"><h4>Laptop jo update hona band ho gaya</h4><p>Ek bank ne antivirus rule ke saath posture checks use kiye. Ek laptop ki antivirus service raat bhar band ho gayi. Agle check par agent ne problem report ki, ClearPass ne token QUARANTINE kiya aur CoA bheja. Laptop quarantine VLAN mein land hua jahan sirf update servers reachable the. User ne service restart ki, agla check pass hua, aur doosre CoA ne laptop ko employee role par wapas bheja. Helpdesk ke paas lene ko ticket hi nahi tha.</p><p><b>Seekh:</b> posture isliye kaam karta hai kyunki CoA user ke logged in rehte hue role badalne deta hai.</p></div>

<div class="iv"><p class="q">"Posture, profiling aur onboarding mein kya difference hai?"</p><p>Strong answer: posture poochta hai ki endpoint healthy hai ya nahi (agent-collected data aur posture token), profiling poochta hai ki device kis kism ka hai (DHCP, HTTP aur doosre fingerprints), onboarding managed credential aur network settings provision karta hai taaki device certificate-based access use kar sake. Add karo ki result ko live session par CoA apply karta hai, aur ki unknown posture ko healthy treat nahi karna chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>OnGuard posture token assign karta hai; UNKNOWN (100) ka matlab data nahi, aur woh healthy nahi hai.</li>
<li>Quarantine mein bhi remediation access allowed hona chahiye.</li>
<li>Profiling credentials ke bina device type ka andaza lagati hai; use hint maano aur role restrict rakho.</li>
<li>Onboard certificates se devices enrol karta hai; yeh guest registration se alag hai.</li>
<li>Yahan yeh concepts hain, simulated nahi; role aur CoA simulated hain.</li>
</ul></div>
`}};export{e as default};