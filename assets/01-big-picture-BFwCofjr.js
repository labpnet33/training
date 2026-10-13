var e={id:`big-picture`,h:{en:`The NGFW detective: what you will learn`,hi:`NGFW detective: aap kya seekhoge`},body:{en:`
<p><b>What you will learn in this module.</b> By the end of these twelve chapters you will be able to take any "it does not work through the firewall" ticket on Cisco Secure Firewall Threat Defense (FTD) and close it with evidence. You will follow a packet through the two engines inside FTD (LINA and Snort), run <code>packet-tracer</code> and <code>capture ... trace</code> from the device CLI, read <code>show conn</code> and <code>show asp drop</code>, watch Snort decide with <code>system support firewall-engine-debug</code> and <code>system support trace</code>, read unified and connection events in the Management Center, and solve the management-plane problems too: failed deployments, health alerts, registration that never completes, and the troubleshoot files TAC asks for. This maps to the troubleshooting items of the CCNP Security SNCF 300-710 exam.</p>

<p><b>Prerequisites.</b> You should have finished the ASA troubleshooting module (packet-tracer, capture, <code>show conn</code>, syslog IDs) and the previous module, <i>Threat Defense and Management Center</i>, where you built zones, access control rules, auto NAT and pressed Deploy. We refer back to those instead of re-teaching them. The next module, <i>NGFW policies</i>, goes deep into Security Intelligence, intrusion, file and URL policies; here you only learn how to recognise when one of them is the reason traffic stops.</p>

<h3>An analogy: an airport with two checkpoints and a head office</h3>
<p>Think of an international airport. Every passenger first meets <b>passport control</b>: is your ticket valid, is your gate open, which terminal do you go to? That is <b>LINA</b>, the ASA-heritage data plane: interfaces, routing, NAT, the connection table and the layer-3/4 part of the access control policy. Then the passenger walks through the <b>security scanner</b>, which looks inside the bags: is that an allowed application, a known bad destination, a dangerous file, an attack pattern? That is <b>Snort 3</b>, the inspection engine. Both checkpoints follow rules written at <b>head office</b>, the <b>Secure Firewall Management Center</b> (FMC). If head office writes a new rule but never sends it to the airport (no Deploy), the officers keep using yesterday's book.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="LINA, Snort and the Management Center">
<rect x="10" y="80" width="110" height="50" rx="8" fill="#e2e8f0"/><text x="65" y="102" text-anchor="middle" class="svg-ink" font-size="13">PARTNER</text><text x="65" y="120" text-anchor="middle" class="svg-muted" font-size="12">198.51.100.10</text>
<rect x="160" y="70" width="140" height="70" rx="8" fill="#bae6fd"/><text x="230" y="98" text-anchor="middle" class="svg-ink" font-size="14">LINA</text><text x="230" y="118" text-anchor="middle" class="svg-muted" font-size="12">NAT, route, L3/L4</text>
<rect x="330" y="70" width="140" height="70" rx="8" fill="#ddd6fe"/><text x="400" y="98" text-anchor="middle" class="svg-ink" font-size="14">Snort 3</text><text x="400" y="118" text-anchor="middle" class="svg-muted" font-size="12">SI, app, IPS, file</text>
<rect x="510" y="80" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="570" y="102" text-anchor="middle" class="svg-ink" font-size="13">WEB</text><text x="570" y="120" text-anchor="middle" class="svg-muted" font-size="12">10.0.2.10</text>
<rect x="240" y="170" width="160" height="40" rx="8" fill="#fde68a"/><text x="320" y="195" text-anchor="middle" class="svg-ink" font-size="13">Management Center</text>
<line x1="120" y1="105" x2="160" y2="105" stroke="#64748b" stroke-width="2"/><line x1="300" y1="105" x2="330" y2="105" stroke="#64748b" stroke-width="2"/><line x1="470" y1="105" x2="510" y2="105" stroke="#64748b" stroke-width="2"/>
<line x1="320" y1="170" x2="320" y2="140" stroke="#64748b" stroke-width="2" stroke-dasharray="4 3"/>
<text x="320" y="40" text-anchor="middle" class="svg-accent" font-size="13">NK-FTD (FTD1): one box, two engines</text>
<text x="420" y="160" class="svg-muted" font-size="12">Deploy = policy push</text>
</svg><p class="cap">Every packet meets LINA first; allowed flows are handed to Snort for a final verdict. Policy comes from the Management Center only after Deploy.</p></div>

<h3>The four questions that solve almost every ticket</h3>
<ol>
<li><b>Does the traffic arrive?</b> A capture on the ingress interface answers it. No packets means the problem is upstream (routing, ARP, the client) and the firewall is innocent.</li>
<li><b>What does LINA decide?</b> <code>packet-tracer</code> shows each phase: UN-NAT, route lookup, the access list (with a rule-id you can map to a rule name), NAT, and the drop reason.</li>
<li><b>What does Snort decide?</b> The SNORT phase in packet-tracer, <code>system support trace</code>, connection events and the <b>Reason</b> column (IP Block, Intrusion Block, File Block) answer it.</li>
<li><b>Is the device running what I think it runs?</b> Deployment status, deployment history, health alerts and registration status answer it. A perfect rule that was never deployed fixes nothing.</li>
</ol>
<p>The golden habit from the previous module stays: <b>diagnose on the device, fix in the Management Center, Deploy, verify</b>. The FTD CLI is for evidence. It is not where you change policy.</p>

<h3>The lab you will solve</h3>
<p>This module's lab is a NOC ticket. <b>INC-8177 (P1)</b>: "The partner portal on 203.0.113.3 (WEB, 10.0.2.10) has not worked since the firewall migration." The partner, PARTNER at 198.51.100.10, opens the portal over HTTPS. NK-FTD has outside 203.0.113.2/29, inside 10.0.1.1/24 and dmz 10.0.2.1/24, with a default route to 203.0.113.1. Two faults were introduced during the migration, and you will find both with the tools in this module. Chapter 11 walks the whole lab step by step.</p>

<div class="eg"><p><b>Worked example.</b> A user says "the portal is down". Translate it into a flow before you touch anything: source 198.51.100.10, any source port, destination 203.0.113.3, TCP 443, ingress interface outside. That one line is the input for capture filters, packet-tracer and event searches. Engineers who skip this step test the wrong thing.</p></div>

<div class="warn"><p><b>Common mistake.</b> Jumping straight into the Management Center and editing rules because "it is probably the ACL". You may change something that was never the cause, deploy it, and now you have two problems. Collect evidence first; change one thing; verify.</p></div>

<div class="exam"><p><b>Exam trap.</b> Questions often describe a symptom and ask for the <i>first</i> or <i>best</i> tool. "Does the packet reach the firewall?" is a capture question. "Which rule and phase drops it?" is packet-tracer. "Which rule blocked it yesterday at 10:14?" is connection events. "The rule exists in FMC but not on the device" is deployment.</p></div>

<div class="scn"><h4>The migration weekend</h4><p>A retailer replaced its old ASA with Threat Defense over a weekend. On Monday, three tickets arrived: the VPN partner could not reach an API, a payment site was blocked, and the backup job was slow. The on-call engineer did not guess. She wrote each ticket as a flow, ran packet-tracer for each, and found three different causes: a static NAT with a typo in the mapped address, a Security Intelligence block on a shared hosting IP, and a backup rule using Allow instead of Trust so Snort inspected terabytes. Three evidence-based fixes, one deploy, closed by noon.</p><p><b>Lesson:</b> the same symptom ("does not work") hides very different causes. The four questions route you to the right one quickly.</p></div>

<div class="iv"><p class="q">"How do you troubleshoot traffic that is not passing through an FTD?"</p><p>Strong answer: define the flow (source, destination, port, ingress interface); capture on ingress to prove arrival; run packet-tracer to see which LINA phase or Snort verdict drops it and the rule-id; confirm with connection events in the FMC; check that the device is in sync with the deployed policy; fix in the FMC, deploy, and verify with the same tools. Mention LINA versus Snort explicitly; interviewers want to hear that you know there are two engines.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>FTD has two engines: LINA (routing, NAT, connections, L3/L4 policy) and Snort 3 (SI, applications, intrusion, files).</li>
<li>Policy lives in the Management Center and reaches the device only through Deploy.</li>
<li>Four questions: does it arrive, what does LINA decide, what does Snort decide, is the device in sync.</li>
<li>Diagnose on the device, fix in the manager, deploy, verify.</li>
<li>Always write the ticket as a flow before running any command.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> In barah chapters ke end tak aap Cisco Secure Firewall Threat Defense (FTD) par koi bhi "firewall ke through kaam nahi karta" ticket uthakar evidence ke saath close kar paoge. Aap FTD ke andar ke do engines (LINA aur Snort) ke through ek packet follow karoge, device CLI se <code>packet-tracer</code> aur <code>capture ... trace</code> chalaoge, <code>show conn</code> aur <code>show asp drop</code> padhoge, <code>system support firewall-engine-debug</code> aur <code>system support trace</code> se Snort ko decide karte dekhoge, Management Center mein unified aur connection events padhoge, aur management-plane problems bhi solve karoge: failed deployments, health alerts, registration jo kabhi complete nahi hota, aur woh troubleshoot files jo TAC maangta hai. Yeh CCNP Security SNCF 300-710 exam ke troubleshooting items se map hota hai.</p>

<p><b>Prerequisites.</b> Aapne ASA troubleshooting module (packet-tracer, capture, <code>show conn</code>, syslog IDs) aur pichla module, <i>Threat Defense aur Management Center</i>, khatam kiya hona chahiye, jahan aapne zones, access control rules, auto NAT banaye aur Deploy dabaya. Hum unhe dobara padhane ke bajaye unka reference denge. Agla module, <i>NGFW policies</i>, Security Intelligence, intrusion, file aur URL policies mein gehraai se jaata hai; yahan aap sirf yeh seekhoge ki jab inmein se koi traffic rok rahi ho to use pehchaano kaise.</p>

<h3>Ek analogy: do checkpoints aur ek head office wala airport</h3>
<p>Ek international airport socho. Har passenger pehle <b>passport control</b> se milta hai: kya aapka ticket valid hai, kya aapka gate khula hai, kaunse terminal jaana hai? Yeh <b>LINA</b> hai, ASA wala data plane: interfaces, routing, NAT, connection table aur access control policy ka layer-3/4 hissa. Phir passenger <b>security scanner</b> se guzarta hai, jo bags ke andar dekhta hai: kya yeh allowed application hai, koi known bad destination, khatarnaak file, attack pattern? Yeh <b>Snort 3</b> hai, inspection engine. Dono checkpoints <b>head office</b> ke likhe rules follow karte hain, yaani <b>Secure Firewall Management Center</b> (FMC). Agar head office naya rule likhe par airport tak bheje hi nahi (Deploy nahi), to officers kal wali kitaab hi use karte rehte hain.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="LINA, Snort aur Management Center">
<rect x="10" y="80" width="110" height="50" rx="8" fill="#e2e8f0"/><text x="65" y="102" text-anchor="middle" class="svg-ink" font-size="13">PARTNER</text><text x="65" y="120" text-anchor="middle" class="svg-muted" font-size="12">198.51.100.10</text>
<rect x="160" y="70" width="140" height="70" rx="8" fill="#bae6fd"/><text x="230" y="98" text-anchor="middle" class="svg-ink" font-size="14">LINA</text><text x="230" y="118" text-anchor="middle" class="svg-muted" font-size="12">NAT, route, L3/L4</text>
<rect x="330" y="70" width="140" height="70" rx="8" fill="#ddd6fe"/><text x="400" y="98" text-anchor="middle" class="svg-ink" font-size="14">Snort 3</text><text x="400" y="118" text-anchor="middle" class="svg-muted" font-size="12">SI, app, IPS, file</text>
<rect x="510" y="80" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="570" y="102" text-anchor="middle" class="svg-ink" font-size="13">WEB</text><text x="570" y="120" text-anchor="middle" class="svg-muted" font-size="12">10.0.2.10</text>
<rect x="240" y="170" width="160" height="40" rx="8" fill="#fde68a"/><text x="320" y="195" text-anchor="middle" class="svg-ink" font-size="13">Management Center</text>
<line x1="120" y1="105" x2="160" y2="105" stroke="#64748b" stroke-width="2"/><line x1="300" y1="105" x2="330" y2="105" stroke="#64748b" stroke-width="2"/><line x1="470" y1="105" x2="510" y2="105" stroke="#64748b" stroke-width="2"/>
<line x1="320" y1="170" x2="320" y2="140" stroke="#64748b" stroke-width="2" stroke-dasharray="4 3"/>
<text x="320" y="40" text-anchor="middle" class="svg-accent" font-size="13">NK-FTD (FTD1): ek box, do engines</text>
<text x="420" y="160" class="svg-muted" font-size="12">Deploy = policy push</text>
</svg><p class="cap">Har packet pehle LINA se milta hai; allowed flows final verdict ke liye Snort ko diye jaate hain. Policy Management Center se sirf Deploy ke baad aati hai.</p></div>

<h3>Woh chaar sawaal jo lagbhag har ticket solve karte hain</h3>
<ol>
<li><b>Kya traffic aa raha hai?</b> Ingress interface par capture iska jawab deta hai. Packets nahi = problem upstream hai (routing, ARP, client) aur firewall begunah hai.</li>
<li><b>LINA kya decide karta hai?</b> <code>packet-tracer</code> har phase dikhata hai: UN-NAT, route lookup, access list (ek rule-id ke saath jise aap rule name se map kar sakte ho), NAT, aur drop reason.</li>
<li><b>Snort kya decide karta hai?</b> packet-tracer ka SNORT phase, <code>system support trace</code>, connection events aur <b>Reason</b> column (IP Block, Intrusion Block, File Block) iska jawab dete hain.</li>
<li><b>Kya device wahi chala raha hai jo main sochta hoon?</b> Deployment status, deployment history, health alerts aur registration status iska jawab dete hain. Ek perfect rule jo kabhi deploy nahi hui, kuch theek nahi karti.</li>
</ol>
<p>Pichle module ki golden habit wahi rehti hai: <b>device par diagnose karo, Management Center mein fix karo, Deploy karo, verify karo</b>. FTD CLI evidence ke liye hai. Policy wahan nahi badalti.</p>

<h3>Woh lab jo aap solve karoge</h3>
<p>Is module ki lab ek NOC ticket hai. <b>INC-8177 (P1)</b>: "Firewall migration ke baad se 203.0.113.3 (WEB, 10.0.2.10) par partner portal nahi chala." Partner, PARTNER 198.51.100.10 par, portal HTTPS par kholta hai. NK-FTD ka outside 203.0.113.2/29, inside 10.0.1.1/24 aur dmz 10.0.2.1/24 hai, aur default route 203.0.113.1 ki taraf hai. Migration ke dauraan do faults aaye the, aur aap dono ko is module ke tools se dhoondhoge. Chapter 11 poori lab step by step walk karta hai.</p>

<div class="eg"><p><b>Worked example.</b> User kehta hai "portal down hai". Kuch bhi chhoone se pehle ise ek flow mein badlo: source 198.51.100.10, koi bhi source port, destination 203.0.113.3, TCP 443, ingress interface outside. Yahi ek line capture filters, packet-tracer aur event searches ka input hai. Jo engineers yeh step chhodte hain, woh galat cheez test karte hain.</p></div>

<div class="warn"><p><b>Common galti.</b> Seedha Management Center mein jaakar rules edit karna kyunki "shayad ACL hi hai". Aap kuch aisa badal sakte ho jo kabhi wajah tha hi nahi, use deploy kar doge, aur ab aapke paas do problems hain. Pehle evidence lo; ek cheez badlo; verify karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Questions aksar symptom batakar <i>pehla</i> ya <i>best</i> tool poochte hain. "Kya packet firewall tak pahunchta hai?" capture ka sawaal hai. "Kaunsa rule aur phase use drop karta hai?" packet-tracer hai. "Kal 10:14 par kis rule ne block kiya?" connection events hai. "Rule FMC mein hai par device par nahi" deployment hai.</p></div>

<div class="scn"><h4>Migration wala weekend</h4><p>Ek retailer ne weekend par apna purana ASA Threat Defense se replace kiya. Monday ko teen tickets aaye: VPN partner ek API tak nahi pahunch paa raha tha, ek payment site block thi, aur backup job slow tha. On-call engineer ne guess nahi kiya. Usne har ticket ko flow ke roop mein likha, har ek ke liye packet-tracer chalaya, aur teen alag wajahein mili: mapped address mein typo wala static NAT, shared hosting IP par Security Intelligence block, aur backup rule jo Trust ki jagah Allow use kar rahi thi jisse Snort terabytes inspect kar raha tha. Teen evidence-based fixes, ek deploy, dopahar tak close.</p><p><b>Seekh:</b> ek hi symptom ("kaam nahi karta") ke peeche bahut alag wajahein chhupi hoti hain. Chaar sawaal aapko jaldi sahi wajah tak le jaate hain.</p></div>

<div class="iv"><p class="q">"FTD ke through pass na hone wale traffic ko aap kaise troubleshoot karte ho?"</p><p>Strong answer: flow define karo (source, destination, port, ingress interface); arrival prove karne ke liye ingress par capture karo; packet-tracer chalao yeh dekhne ke liye ki kaunsa LINA phase ya Snort verdict drop karta hai aur rule-id kya hai; FMC mein connection events se confirm karo; check karo ki device deployed policy ke saath sync mein hai; FMC mein fix karo, deploy karo, aur unhi tools se verify karo. LINA aur Snort ko clearly mention karo; interviewers sunna chahte hain ki aapko pata hai do engines hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>FTD mein do engines hain: LINA (routing, NAT, connections, L3/L4 policy) aur Snort 3 (SI, applications, intrusion, files).</li>
<li>Policy Management Center mein rehti hai aur device tak sirf Deploy se pahunchti hai.</li>
<li>Chaar sawaal: kya aata hai, LINA kya decide karta hai, Snort kya decide karta hai, kya device sync mein hai.</li>
<li>Device par diagnose, manager mein fix, deploy, verify.</li>
<li>Koi bhi command chalane se pehle ticket ko hamesha flow ke roop mein likho.</li>
</ul></div>
`}};export{e as default};