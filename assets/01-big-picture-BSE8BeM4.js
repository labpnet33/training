var e={id:`big-picture`,h:{en:`The big picture: verify every login, see every leak, act on one incident`,hi:`Big picture: har login verify karo, har leak dekho, ek incident par act karo`},body:{en:`
<p>Think about a modern office tower. At every important door there is a badge reader that also checks your face, and the door to the finance floor opens only if your badge is valid <b>and</b> you are wearing the company ID <b>and</b> it is a working day. On the loading dock there is a weighing scale and a camera, because the real danger is not only someone walking in, it is someone walking <b>out</b> with boxes of files. Somewhere in the basement there is a control room where one guard watches every camera, every door log and every alarm on one wall, and a thick binder on the desk says exactly what to do when an alarm rings. This module is about building that tower for a network: <b>Duo</b> is the smart door, <b>exfiltration detection and telemetry</b> are the scale and the camera on the dock, <b>Cisco XDR</b> is the control room wall, <b>Splunk</b> is the searchable archive of every recording, and <b>SOAR playbooks</b> are the binder.</p>

<h3>What you will learn</h3>
<ul>
<li>Zero trust for the <b>workforce</b>: why a password plus a network location is no longer enough, and how identity, device and context are checked on every access.</li>
<li><b>Duo</b>: MFA methods and their strength, enrollment and the new-user policy, Adaptive Access policies with device health and trusted endpoints, Duo SSO, Device Insight, Trust Monitor and the authentication log.</li>
<li><b>Data exfiltration</b> explained the way a defender needs it: DNS tunnelling, HTTPS uploads, cloud storage, email, file-transfer protocols and ICMP, with the indicators that give each one away and the controls that stop it.</li>
<li><b>Telemetry-based detection</b>: NetFlow and IPFIX, and how Cisco Secure Network Analytics turns flows into behavioural alarms such as data hoarding and suspect data loss.</li>
<li><b>Cisco XDR</b>: incidents, observables, investigations and one-click response actions, plus automation.</li>
<li><b>Splunk</b>: the SIEM architecture, SPL basics (<code>search</code>, <code>stats</code>, <code>timechart</code>, <code>table</code>, <code>where</code>, lookups), detections, dashboards and SOAR.</li>
<li>The <b>SOC workflow</b> that ties it together, and a troubleshooting method for identity and detection problems.</li>
</ul>

<h3>Prerequisites</h3>
<p>You should already be comfortable with the earlier security modules: threats and the defender mindset (the security start module), zero trust and NIST SP 800-207 (the modern threats module), Secure Endpoint and host isolation (the endpoint module), Secure Access and ZTNA (the SSE module) and 802.1X with ISE. You also need basic DNS (A, TXT, subdomains) and an idea of what HTTPS and TLS do. We refer back to those modules instead of teaching them again.</p>

<h3>Why visibility and enforcement belong together</h3>
<p>Prevention is never perfect. A password gets phished, a laptop misses three months of patches, a developer installs a tool that phones home. A mature defence therefore has two halves. <b>Enforcement</b> decides, at the moment of access, whether this user on this device should reach this application. <b>Visibility</b> watches what actually happens afterwards on the network, the endpoint and in the cloud, so that the attacks enforcement missed are found quickly. Each half feeds the other: a suspicious login seen by Duo becomes evidence in an XDR incident, and an incident in XDR can lead to a stricter Duo policy.</p>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Lab topology">
<rect x="20" y="20" width="250" height="74" rx="8" fill="#ddd6fe"/><text x="145" y="44" text-anchor="middle" class="svg-ink" font-size="14">SEC-CLOUD console</text><text x="145" y="64" text-anchor="middle" class="svg-muted" font-size="12">Duo, XDR, Splunk,</text><text x="145" y="82" text-anchor="middle" class="svg-muted" font-size="12">Secure Endpoint, email</text>
<rect x="230" y="140" width="120" height="44" rx="8" fill="#e2e8f0"/><text x="290" y="167" text-anchor="middle" class="svg-ink" font-size="13">SW</text>
<rect x="400" y="140" width="120" height="44" rx="8" fill="#bae6fd"/><text x="460" y="160" text-anchor="middle" class="svg-ink" font-size="13">GW</text><text x="460" y="176" text-anchor="middle" class="svg-muted" font-size="12">10.10.0.1</text>
<rect x="540" y="60" width="90" height="44" rx="8" fill="#fed7aa"/><text x="585" y="80" text-anchor="middle" class="svg-ink" font-size="13">INET</text><text x="585" y="96" text-anchor="middle" class="svg-muted" font-size="11">203.0.113.9</text>
<line x1="350" y1="162" x2="400" y2="162" stroke="#64748b" stroke-width="2"/><line x1="520" y1="150" x2="570" y2="104" stroke="#64748b" stroke-width="2"/>
<rect x="60" y="240" width="110" height="44" rx="8" fill="#bbf7d0"/><text x="115" y="260" text-anchor="middle" class="svg-ink" font-size="12">PC1 / PC-DEV</text><text x="115" y="276" text-anchor="middle" class="svg-muted" font-size="11">10.10.0.x</text>
<rect x="230" y="240" width="110" height="44" rx="8" fill="#bbf7d0"/><text x="285" y="260" text-anchor="middle" class="svg-ink" font-size="12">PC-HR</text><text x="285" y="276" text-anchor="middle" class="svg-muted" font-size="11">10.10.0.11</text>
<rect x="400" y="240" width="110" height="44" rx="8" fill="#bbf7d0"/><text x="455" y="260" text-anchor="middle" class="svg-ink" font-size="12">PC-FIN</text><text x="455" y="276" text-anchor="middle" class="svg-muted" font-size="11">10.10.0.12</text>
<line x1="115" y1="240" x2="270" y2="184" stroke="#64748b" stroke-width="2"/><line x1="285" y1="240" x2="290" y2="184" stroke="#64748b" stroke-width="2"/><line x1="455" y1="240" x2="310" y2="184" stroke="#64748b" stroke-width="2"/>
<line x1="145" y1="94" x2="270" y2="140" stroke="#64748b" stroke-width="1.5" stroke-dasharray="5 4"/><text x="150" y="125" class="svg-accent" font-size="12">telemetry + actions</text>
</svg><p class="cap">The lab topology: one cloud console acts on real simulated hosts behind SW and GW; INET stands for the internet.</p></div>

<h3>The four labs and where this text walks them</h3>
<table class="cmp"><tr><th>Lab</th><th>What you do</th><th>Walked in</th></tr>
<tr><td>Duo: MFA + device-health policy</td><td>Build the Zero-Trust policy, attach it to app.nwk.lab, push for alice, deny bob</td><td>Chapter 4</td></tr>
<tr><td>Splunk: hunt DNS-tunnelling exfiltration</td><td>SPL on index=dns, find PC-DEV and the tunnel domain, isolate the host</td><td>Chapter 11</td></tr>
<tr><td>Cisco XDR: investigate and contain</td><td>Open INC-2001, read the observables, isolate PC-WS1, block the C2 domain</td><td>Chapter 9</td></tr>
<tr><td>Ticket: new hire locked out after a Duo change</td><td>Reproduce carol's denial, find the new-user rule, enroll her correctly</td><td>Chapter 12</td></tr></table>
<p>All consoles are simulated, and every threat in them is fictional: the domains such as <code>badexfil.top</code> and <code>nwk.lab</code> exist only inside the lab, and addresses come from private and documentation ranges.</p>

<div class="eg"><p><b>Worked example: the detection funnel.</b> A 2,000-person company collects about 40 million events a day: firewall logs, DNS queries, Duo authentications, endpoint events and NetFlow records. Correlation searches and analytics reduce that to around 300 alerts. XDR and the SIEM group related alerts, for example a malware conviction on a laptop plus a firewall beacon from the same laptop, into about 6 incidents. Two analysts can investigate 6 incidents properly; nobody can read 40 million events. Everything in this module is about moving efficiently down that funnel without losing the one event that matters.</p></div>

<div class="warn"><p><b>Common mistake.</b> Buying visibility tools and never acting on them. Logs that nobody searches, alarms that nobody triages and a playbook that is switched off give a false sense of safety. Visibility only counts when it ends in a decision: contain, block, enroll, patch or close as benign.</p></div>

<div class="exam"><p><b>Exam trap.</b> Keep the roles separate. Duo enforces <b>access</b> (identity, device, context). NetFlow-based analytics gives <b>network behaviour</b> visibility. A <b>SIEM</b> collects and searches logs; <b>SOAR</b> automates the response; <b>XDR</b> correlates detections from several security products into incidents and launches response actions. Questions often describe one and name another.</p></div>

<div class="scn"><h4>The login was fine, the laptop was not</h4><p>A sales manager's password was reused on a breached shopping site. The attacker tried it against the company's web mail, which was protected by Duo. The password was correct, but the attacker's device was unknown, in another country, and could not answer the push. Duo denied it and Trust Monitor flagged the attempt. The SOC reset the password the same morning and searched Splunk for other logins from that source address. They found one more account and reset it too.</p><p><b>Lesson:</b> enforcement stopped the attack, and visibility turned one blocked login into a company-wide check.</p></div>

<div class="iv"><p class="q">"How would you explain the difference between enforcement and visibility in a security architecture?"</p><p>Strong answer: enforcement is the decision point at access time, such as Duo Adaptive Access, a firewall rule or ISE authorization. Visibility is the telemetry and analytics that show what really happened afterwards, such as NetFlow analytics, DNS logs in a SIEM and EDR events correlated in XDR. Mention that each feeds the other, and that the goal is shorter time to detect and time to contain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Duo enforces zero trust access for the workforce: identity, device health and context on every login.</li>
<li>Exfiltration hides in allowed traffic, so detection relies on telemetry and behaviour, not only on blocking.</li>
<li>Cisco XDR correlates detections into incidents; Splunk indexes and searches everything; SOAR automates the response.</li>
<li>The labs cover Duo policy, a Splunk hunt, an XDR containment and a Duo lockout ticket.</li>
<li>The aim is to move from millions of events to a handful of incidents, and from detection to containment, fast.</li>
</ul></div>
`,hi:`
<p>Ek modern office tower socho. Har zaroori darwaze par ek badge reader hai jo aapka chehra bhi check karta hai, aur finance floor ka darwaza tabhi khulta hai jab aapka badge valid ho <b>aur</b> aapne company ID pehna ho <b>aur</b> working day ho. Loading dock par ek weighing scale aur camera hai, kyunki asli khatra sirf kisi ka andar aana nahi hai, kisi ka files ke dabbe lekar <b>bahar</b> jaana bhi hai. Basement mein kahin ek control room hai jahan ek guard ek hi deewar par har camera, har door log aur har alarm dekhta hai, aur desk par ek moti binder likhti hai ki alarm bajne par exactly kya karna hai. Yeh module network ke liye wahi tower banane ke baare mein hai: <b>Duo</b> smart darwaza hai, <b>exfiltration detection aur telemetry</b> dock ka scale aur camera hain, <b>Cisco XDR</b> control room ki deewar hai, <b>Splunk</b> har recording ka searchable archive hai, aur <b>SOAR playbooks</b> woh binder hain.</p>

<h3>Aap kya seekhoge</h3>
<ul>
<li><b>Workforce</b> ke liye zero trust: kyun password plus network location ab kaafi nahi hai, aur har access par identity, device aur context kaise check hote hain.</li>
<li><b>Duo</b>: MFA methods aur unki strength, enrollment aur new-user policy, device health aur trusted endpoints wali Adaptive Access policies, Duo SSO, Device Insight, Trust Monitor aur authentication log.</li>
<li><b>Data exfiltration</b> waise samjhaya jaise defender ko chahiye: DNS tunnelling, HTTPS uploads, cloud storage, email, file-transfer protocols aur ICMP, har ek ko pakadne wale indicators aur rokne wale controls ke saath.</li>
<li><b>Telemetry-based detection</b>: NetFlow aur IPFIX, aur Cisco Secure Network Analytics flows ko data hoarding aur suspect data loss jaise behavioural alarms mein kaise badalta hai.</li>
<li><b>Cisco XDR</b>: incidents, observables, investigations aur one-click response actions, plus automation.</li>
<li><b>Splunk</b>: SIEM architecture, SPL basics (<code>search</code>, <code>stats</code>, <code>timechart</code>, <code>table</code>, <code>where</code>, lookups), detections, dashboards aur SOAR.</li>
<li><b>SOC workflow</b> jo sab ko jodta hai, aur identity aur detection problems ke liye ek troubleshooting method.</li>
</ul>

<h3>Prerequisites</h3>
<p>Aapko pehle ke security modules mein comfortable hona chahiye: threats aur defender mindset (security start module), zero trust aur NIST SP 800-207 (modern threats module), Secure Endpoint aur host isolation (endpoint module), Secure Access aur ZTNA (SSE module) aur ISE ke saath 802.1X. Aapko basic DNS (A, TXT, subdomains) aur HTTPS aur TLS kya karte hain iska idea bhi chahiye. Hum un modules ko dobara padhane ki jagah unka reference denge.</p>

<h3>Visibility aur enforcement saath kyun chalte hain</h3>
<p>Prevention kabhi perfect nahi hota. Password phish ho jaata hai, laptop teen mahine ke patches miss kar deta hai, developer koi tool install kar deta hai jo bahar phone karta hai. Isliye mature defence ke do hisse hote hain. <b>Enforcement</b> access ke pal mein tay karta hai ki is device par yeh user is application tak pahunche ya nahi. <b>Visibility</b> dekhti hai ki uske baad network, endpoint aur cloud mein asal mein kya hota hai, taaki jo attacks enforcement se chhoot gaye woh jaldi mil jaayein. Har hissa doosre ko feed karta hai: Duo ko dikha suspicious login XDR incident mein evidence ban jaata hai, aur XDR ka incident Duo policy ko aur strict karwa sakta hai.</p>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Lab topology">
<rect x="20" y="20" width="250" height="74" rx="8" fill="#ddd6fe"/><text x="145" y="44" text-anchor="middle" class="svg-ink" font-size="14">SEC-CLOUD console</text><text x="145" y="64" text-anchor="middle" class="svg-muted" font-size="12">Duo, XDR, Splunk,</text><text x="145" y="82" text-anchor="middle" class="svg-muted" font-size="12">Secure Endpoint, email</text>
<rect x="230" y="140" width="120" height="44" rx="8" fill="#e2e8f0"/><text x="290" y="167" text-anchor="middle" class="svg-ink" font-size="13">SW</text>
<rect x="400" y="140" width="120" height="44" rx="8" fill="#bae6fd"/><text x="460" y="160" text-anchor="middle" class="svg-ink" font-size="13">GW</text><text x="460" y="176" text-anchor="middle" class="svg-muted" font-size="12">10.10.0.1</text>
<rect x="540" y="60" width="90" height="44" rx="8" fill="#fed7aa"/><text x="585" y="80" text-anchor="middle" class="svg-ink" font-size="13">INET</text><text x="585" y="96" text-anchor="middle" class="svg-muted" font-size="11">203.0.113.9</text>
<line x1="350" y1="162" x2="400" y2="162" stroke="#64748b" stroke-width="2"/><line x1="520" y1="150" x2="570" y2="104" stroke="#64748b" stroke-width="2"/>
<rect x="60" y="240" width="110" height="44" rx="8" fill="#bbf7d0"/><text x="115" y="260" text-anchor="middle" class="svg-ink" font-size="12">PC1 / PC-DEV</text><text x="115" y="276" text-anchor="middle" class="svg-muted" font-size="11">10.10.0.x</text>
<rect x="230" y="240" width="110" height="44" rx="8" fill="#bbf7d0"/><text x="285" y="260" text-anchor="middle" class="svg-ink" font-size="12">PC-HR</text><text x="285" y="276" text-anchor="middle" class="svg-muted" font-size="11">10.10.0.11</text>
<rect x="400" y="240" width="110" height="44" rx="8" fill="#bbf7d0"/><text x="455" y="260" text-anchor="middle" class="svg-ink" font-size="12">PC-FIN</text><text x="455" y="276" text-anchor="middle" class="svg-muted" font-size="11">10.10.0.12</text>
<line x1="115" y1="240" x2="270" y2="184" stroke="#64748b" stroke-width="2"/><line x1="285" y1="240" x2="290" y2="184" stroke="#64748b" stroke-width="2"/><line x1="455" y1="240" x2="310" y2="184" stroke="#64748b" stroke-width="2"/>
<line x1="145" y1="94" x2="270" y2="140" stroke="#64748b" stroke-width="1.5" stroke-dasharray="5 4"/><text x="150" y="125" class="svg-accent" font-size="12">telemetry + actions</text>
</svg><p class="cap">Lab topology: ek cloud console SW aur GW ke peeche real simulated hosts par act karta hai; INET internet ki jagah hai.</p></div>

<h3>Chaar labs aur yeh text unhe kahan walk karta hai</h3>
<table class="cmp"><tr><th>Lab</th><th>Aap kya karte ho</th><th>Kahan walk hua</th></tr>
<tr><td>Duo: MFA + device-health policy</td><td>Zero-Trust policy banao, app.nwk.lab se jodo, alice ko push, bob ko deny</td><td>Chapter 4</td></tr>
<tr><td>Splunk: DNS-tunnelling exfiltration hunt</td><td>index=dns par SPL, PC-DEV aur tunnel domain dhoondo, host isolate karo</td><td>Chapter 11</td></tr>
<tr><td>Cisco XDR: investigate aur contain</td><td>INC-2001 kholo, observables padho, PC-WS1 isolate karo, C2 domain block karo</td><td>Chapter 9</td></tr>
<tr><td>Ticket: Duo change ke baad naya hire lock out</td><td>carol ka denial reproduce karo, new-user rule dhoondo, use sahi tarike se enroll karo</td><td>Chapter 12</td></tr></table>
<p>Saare consoles simulated hain, aur unmein har threat fictional hai: <code>badexfil.top</code> aur <code>nwk.lab</code> jaise domains sirf lab ke andar exist karte hain, aur addresses private aur documentation ranges se aate hain.</p>

<div class="eg"><p><b>Worked example: detection funnel.</b> 2,000 logon ki company roz lagbhag 40 million events collect karti hai: firewall logs, DNS queries, Duo authentications, endpoint events aur NetFlow records. Correlation searches aur analytics ise lagbhag 300 alerts tak ghata dete hain. XDR aur SIEM related alerts ko group karte hain, jaise ek laptop par malware conviction plus usi laptop se firewall beacon, aur lagbhag 6 incidents bante hain. Do analysts 6 incidents ko theek se investigate kar sakte hain; 40 million events koi nahi padh sakta. Is module mein sab kuch is funnel mein efficiently neeche jaane ke baare mein hai, us ek event ko khoye bina jo matter karta hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Visibility tools khareedna aur un par kabhi act na karna. Logs jinhe koi search nahi karta, alarms jinhe koi triage nahi karta aur switched-off playbook safety ka jhootha ehsaas dete hain. Visibility tabhi count hoti hai jab woh ek decision par khatam ho: contain, block, enroll, patch ya benign maan kar close.</p></div>

<div class="exam"><p><b>Exam trap.</b> Roles alag rakho. Duo <b>access</b> enforce karta hai (identity, device, context). NetFlow-based analytics <b>network behaviour</b> ki visibility deta hai. <b>SIEM</b> logs collect aur search karta hai; <b>SOAR</b> response automate karta hai; <b>XDR</b> kai security products ki detections ko incidents mein correlate karke response actions launch karta hai. Questions aksar ek ko describe karke doosre ka naam lete hain.</p></div>

<div class="scn"><h4>Login theek tha, laptop nahi</h4><p>Ek sales manager ka password ek breached shopping site par reuse hua tha. Attacker ne use company ke web mail par try kiya, jo Duo se protected tha. Password sahi tha, par attacker ka device unknown tha, doosre desh mein tha, aur push ka jawab nahi de sakta tha. Duo ne deny kiya aur Trust Monitor ne attempt flag kiya. SOC ne usi subah password reset kiya aur Splunk mein us source address se aur logins search kiye. Unhe ek aur account mila aur use bhi reset kiya.</p><p><b>Seekh:</b> enforcement ne attack roka, aur visibility ne ek blocked login ko company-wide check mein badal diya.</p></div>

<div class="iv"><p class="q">"Security architecture mein enforcement aur visibility ka fark aap kaise samjhaoge?"</p><p>Strong answer: enforcement access time par decision point hai, jaise Duo Adaptive Access, firewall rule ya ISE authorization. Visibility woh telemetry aur analytics hai jo dikhati hai ki baad mein asal mein kya hua, jaise NetFlow analytics, SIEM mein DNS logs aur XDR mein correlated EDR events. Batao ki dono ek doosre ko feed karte hain, aur goal time to detect aur time to contain ko chhota karna hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Duo workforce ke liye zero trust access enforce karta hai: har login par identity, device health aur context.</li>
<li>Exfiltration allowed traffic mein chhupta hai, isliye detection sirf blocking par nahi, telemetry aur behaviour par tikti hai.</li>
<li>Cisco XDR detections ko incidents mein correlate karta hai; Splunk sab kuch index aur search karta hai; SOAR response automate karta hai.</li>
<li>Labs Duo policy, Splunk hunt, XDR containment aur Duo lockout ticket cover karte hain.</li>
<li>Maqsad hai millions of events se mutthi bhar incidents tak, aur detection se containment tak, tezi se pahunchna.</li>
</ul></div>
`}};export{e as default};