var e={id:`landscape`,h:{en:`The modern threat landscape: what attackers do today`,hi:`Modern threat landscape: attackers aaj kya karte hain`},body:{en:`
<p><b>What you will learn in this module.</b> By the end of these chapters you will be able to read a vulnerability report and turn it into a patch priority, calculate a CVSS v3.1 score by hand, explain the OWASP Top 10 for web and for LLM applications, triage a reported phishing e-mail from its headers, describe how threat intelligence is written and shared with STIX and TAXII, explain zero trust and Cisco SAFE to an architect, and read a short Python script that calls a Cisco security API and say exactly what it does. This is domain 1.0 (Security Concepts) of the CCNP Security core exam, SCOR 350-701 v2.0.</p>
<p><b>Prerequisites.</b> You should have finished the earlier modules of this track: <i>Cybersecurity from zero</i> (CIA triad, threat, vulnerability, risk) and <i>Threats, firewalls and stateful inspection</i>. You need basic IP and DNS knowledge. No programming experience is needed; chapter 11 teaches you to <b>read</b> Python, not to write large programs. Cryptography, PKI and post-quantum algorithms get their own module next, so here we only preview them.</p>

<h3>Start with an analogy: the airport, not the castle</h3>
<p>Old network security was a <b>castle</b>: a thick wall (the perimeter firewall), one gate, and everyone inside trusted. Modern security looks more like an <b>airport</b>. Being inside the terminal does not let you board any plane. Your identity is checked at the entrance, your bag is scanned, your boarding pass is checked again at the gate, cameras watch the halls, and staff share alerts about suspicious people with other airports. If one check fails, the next one still has a chance to stop the problem. That idea, many independent checks and no trust based only on location, runs through this whole module.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Module map">
<rect x="10" y="20" width="195" height="56" rx="8" fill="#fed7aa"/><text x="107" y="44" text-anchor="middle" class="svg-ink" font-size="13">Threats</text><text x="107" y="62" text-anchor="middle" class="svg-muted" font-size="12">ch 1, 5, 6, 7</text>
<rect x="222" y="20" width="195" height="56" rx="8" fill="#fde68a"/><text x="319" y="44" text-anchor="middle" class="svg-ink" font-size="13">Weaknesses</text><text x="319" y="62" text-anchor="middle" class="svg-muted" font-size="12">OWASP web and LLM</text>
<rect x="434" y="20" width="195" height="56" rx="8" fill="#bae6fd"/><text x="531" y="44" text-anchor="middle" class="svg-ink" font-size="13">Prioritise</text><text x="531" y="62" text-anchor="middle" class="svg-muted" font-size="12">CVE, CVSS, EPSS, KEV</text>
<rect x="10" y="110" width="195" height="56" rx="8" fill="#ddd6fe"/><text x="107" y="134" text-anchor="middle" class="svg-ink" font-size="13">Intelligence</text><text x="107" y="152" text-anchor="middle" class="svg-muted" font-size="12">STIX, TAXII, Talos</text>
<rect x="222" y="110" width="195" height="56" rx="8" fill="#bbf7d0"/><text x="319" y="134" text-anchor="middle" class="svg-ink" font-size="13">Architecture</text><text x="319" y="152" text-anchor="middle" class="svg-muted" font-size="12">zero trust, SAFE</text>
<rect x="434" y="110" width="195" height="56" rx="8" fill="#e2e8f0"/><text x="531" y="134" text-anchor="middle" class="svg-ink" font-size="13">Automation</text><text x="531" y="152" text-anchor="middle" class="svg-muted" font-size="12">Python and APIs</text>
<line x1="205" y1="48" x2="222" y2="48" stroke="#64748b" stroke-width="2"/><line x1="417" y1="48" x2="434" y2="48" stroke="#64748b" stroke-width="2"/>
<line x1="205" y1="138" x2="222" y2="138" stroke="#64748b" stroke-width="2"/><line x1="417" y1="138" x2="434" y2="138" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="194" width="619" height="44" rx="8" fill="#fde68a"/><text x="320" y="221" text-anchor="middle" class="svg-ink" font-size="13">People and culture: phishing triage, reporting, verification</text>
</svg><p class="cap">The six building blocks of this module. People and culture sit under all of them.</p></div>

<h3>Key terms first</h3>
<dl class="terms">
<dt>Threat</dt><dd>Anything that can cause harm: a criminal group, an insider, malware, even a flood. A <b>threat actor</b> is the person or group behind it.</dd>
<dt>Vulnerability</dt><dd>A weakness that a threat can use, such as an unpatched VPN gateway or a web form that trusts user input.</dd>
<dt>Exploit</dt><dd>The technique or code that takes advantage of a vulnerability.</dd>
<dt>Risk</dt><dd>Likelihood multiplied by impact. A critical flaw on a machine nobody can reach is lower risk than a medium flaw on the internet edge.</dd>
<dt>Attack surface</dt><dd>Everything an attacker could touch: internet-facing services, users' inboxes, APIs, AI assistants, suppliers.</dd>
</dl>

<h3>The threats that dominate today</h3>
<table class="cmp"><tr><th>Threat</th><th>What is new</th><th>Main controls</th></tr>
<tr><td><b>Ransomware and extortion</b></td><td>Double extortion (encrypt and leak), ransomware-as-a-service, attacks on backups and hypervisors</td><td>Immutable offline backups, EDR, segmentation, MFA, fast patching of edge devices</td></tr>
<tr><td><b>Supply chain</b></td><td>Poisoned software updates, malicious open-source packages, compromised CI/CD pipelines and managed service providers</td><td>SBOM, signed builds, least-privilege pipelines, vendor risk management</td></tr>
<tr><td><b>Edge-device exploitation</b></td><td>VPN gateways and firewalls exploited within days of a disclosure</td><td>Patch by KEV, management interfaces off the internet, monitoring</td></tr>
<tr><td><b>Identity attacks</b></td><td>MFA fatigue (push bombing), session-token theft, adversary-in-the-middle (AiTM) phishing kits</td><td>Phishing-resistant MFA (FIDO2), conditional access, short sessions</td></tr>
<tr><td><b>AI-enabled attacks</b></td><td>Fluent phishing in any language, voice and video deepfakes for CEO fraud, faster malware variants</td><td>Out-of-band verification, e-mail and DNS security, training on new pretexts</td></tr>
<tr><td><b>Attacks on AI systems</b></td><td>Prompt injection, data poisoning, model theft, agents with too many permissions</td><td>AI guardrails, least-privilege agents, validation of inputs and outputs (chapters 5 and 6)</td></tr>
<tr><td><b>Quantum: harvest now, decrypt later</b></td><td>Traffic recorded today could be decrypted once a large quantum computer breaks RSA and ECC</td><td>Crypto inventory, migration to post-quantum algorithms (ML-KEM, ML-DSA), covered in the cryptography module</td></tr>
</table>

<p>Notice a pattern: attackers go where defenders are slow. Internet-facing appliances are patched late, so they are exploited early. People answer urgent e-mails, so phishing stays the top way in. New technology such as AI assistants is deployed quickly, before its security model is understood.</p>

<div class="eg"><p><b>Worked example.</b> A company has 2,000 findings from its scanner, 12 reported phishing e-mails a day and a new internal AI chatbot. With four engineers it cannot fix everything. This module gives the method: score each finding with CVSS (chapter 3), add real-world context with EPSS, KEV and exposure (chapter 4), so that perhaps 15 findings become emergency work; triage mail with header analysis (chapter 7); protect the chatbot with the OWASP LLM controls (chapters 5 and 6); and automate the repetitive blocking with APIs (chapter 11).</p></div>

<div class="warn"><p><b>Common mistake.</b> Thinking that a strong perimeter firewall is enough. Most modern breaches start with a stolen identity, a phished user or an exploited edge appliance. After that the attacker is "inside" and a castle model gives them free movement. Layers and least privilege matter more than one strong wall.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Harvest now, decrypt later" threatens <b>confidentiality of data that must stay secret for years</b>, protected today by RSA or ECC key exchange. It is not a threat to integrity of today's hashes, and symmetric AES-256 is considered safe against quantum attack.</p></div>

<div class="scn"><h4>The VPN gateway nobody owned</h4><p>A mid-size company learned from a partner that its data was on a leak site. Investigation showed the entry point: the SSL VPN gateway, two months behind on patches. A critical flaw on it had been listed in the CISA KEV catalog for six weeks. The appliance belonged to "the network team", the patch process belonged to "the server team", and nobody tracked it. The attackers used the gateway to steal credentials, moved to the file servers and encrypted them after copying the data.</p><p><b>Lesson:</b> every internet-facing device needs an owner and a patch SLA driven by exploitation data, not only by the calendar.</p></div>

<div class="iv"><p class="q">"What are the biggest threats to an enterprise network today?"</p><p>A strong candidate does not just list malware names. Group the answer: ransomware with data theft, exploitation of edge devices, identity attacks such as MFA fatigue and AiTM phishing, supply-chain compromise, and the new AI angle (AI-assisted phishing and deepfakes, plus attacks on the company's own AI apps). Then name one control per threat and finish with the principle: layered defence, least privilege and patching driven by real exploitation data.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Threat, vulnerability, exploit and risk are different words; risk = likelihood x impact.</li>
<li>Today's main threats: ransomware with extortion, supply chain, edge-device exploitation, identity attacks, AI-enabled and AI-targeted attacks, and quantum "harvest now, decrypt later".</li>
<li>Attackers exploit slowness: late patching of edge devices, rushed AI deployments, busy users.</li>
<li>The airport model (check at every step) replaces the castle model (trust everything inside).</li>
<li>This module covers SCOR 350-701 v2.0 domain 1.0 end to end, including Python API scripts.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> In chapters ke end tak aap ek vulnerability report padhkar use patch priority mein badal paoge, CVSS v3.1 score haath se calculate kar paoge, web aur LLM applications ke liye OWASP Top 10 samjha paoge, reported phishing e-mail ko uske headers se triage kar paoge, STIX aur TAXII ke saath threat intelligence kaise likhi aur share hoti hai bata paoge, architect ko zero trust aur Cisco SAFE samjha paoge, aur Cisco security API call karne wali chhoti Python script padhkar bilkul sahi bata paoge ki woh kya karti hai. Yeh CCNP Security core exam, SCOR 350-701 v2.0, ka domain 1.0 (Security Concepts) hai.</p>
<p><b>Prerequisites.</b> Aapko is track ke pehle modules khatam kar lene chahiye: <i>Cybersecurity from zero</i> (CIA triad, threat, vulnerability, risk) aur <i>Threats, firewalls and stateful inspection</i>. Basic IP aur DNS ki knowledge chahiye. Programming experience zaroori nahi; chapter 11 aapko Python <b>padhna</b> sikhata hai, bade programs likhna nahi. Cryptography, PKI aur post-quantum algorithms ka agla alag module hai, isliye yahan sirf preview karenge.</p>

<h3>Ek analogy se shuru karo: airport, castle nahi</h3>
<p>Purani network security ek <b>castle</b> thi: moti deewar (perimeter firewall), ek gate, aur andar sab par bharosa. Modern security ek <b>airport</b> jaisi dikhti hai. Terminal ke andar hone se aap koi bhi plane board nahi kar sakte. Entrance par aapki identity check hoti hai, bag scan hota hai, gate par boarding pass phir check hota hai, cameras halls dekhte hain, aur staff suspicious logon ke alerts doosre airports ke saath share karta hai. Agar ek check fail ho, to agle check ke paas problem rokne ka mauka rehta hai. Yahi idea, bahut saare independent checks aur sirf location ke basis par koi trust nahi, poore module mein chalta hai.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Module map">
<rect x="10" y="20" width="195" height="56" rx="8" fill="#fed7aa"/><text x="107" y="44" text-anchor="middle" class="svg-ink" font-size="13">Threats</text><text x="107" y="62" text-anchor="middle" class="svg-muted" font-size="12">ch 1, 5, 6, 7</text>
<rect x="222" y="20" width="195" height="56" rx="8" fill="#fde68a"/><text x="319" y="44" text-anchor="middle" class="svg-ink" font-size="13">Kamzoriyan</text><text x="319" y="62" text-anchor="middle" class="svg-muted" font-size="12">OWASP web aur LLM</text>
<rect x="434" y="20" width="195" height="56" rx="8" fill="#bae6fd"/><text x="531" y="44" text-anchor="middle" class="svg-ink" font-size="13">Prioritise</text><text x="531" y="62" text-anchor="middle" class="svg-muted" font-size="12">CVE, CVSS, EPSS, KEV</text>
<rect x="10" y="110" width="195" height="56" rx="8" fill="#ddd6fe"/><text x="107" y="134" text-anchor="middle" class="svg-ink" font-size="13">Intelligence</text><text x="107" y="152" text-anchor="middle" class="svg-muted" font-size="12">STIX, TAXII, Talos</text>
<rect x="222" y="110" width="195" height="56" rx="8" fill="#bbf7d0"/><text x="319" y="134" text-anchor="middle" class="svg-ink" font-size="13">Architecture</text><text x="319" y="152" text-anchor="middle" class="svg-muted" font-size="12">zero trust, SAFE</text>
<rect x="434" y="110" width="195" height="56" rx="8" fill="#e2e8f0"/><text x="531" y="134" text-anchor="middle" class="svg-ink" font-size="13">Automation</text><text x="531" y="152" text-anchor="middle" class="svg-muted" font-size="12">Python aur APIs</text>
<line x1="205" y1="48" x2="222" y2="48" stroke="#64748b" stroke-width="2"/><line x1="417" y1="48" x2="434" y2="48" stroke="#64748b" stroke-width="2"/>
<line x1="205" y1="138" x2="222" y2="138" stroke="#64748b" stroke-width="2"/><line x1="417" y1="138" x2="434" y2="138" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="194" width="619" height="44" rx="8" fill="#fde68a"/><text x="320" y="221" text-anchor="middle" class="svg-ink" font-size="13">Log aur culture: phishing triage, reporting, verification</text>
</svg><p class="cap">Is module ke chhe building blocks. Log aur culture in sabke neeche baithe hain.</p></div>

<h3>Pehle key terms</h3>
<dl class="terms">
<dt>Threat</dt><dd>Koi bhi cheez jo nuksaan kar sake: criminal group, insider, malware, yahan tak ki baadh bhi. <b>Threat actor</b> uske peeche ka insaan ya group hai.</dd>
<dt>Vulnerability</dt><dd>Ek kamzori jise threat use kar sake, jaise unpatched VPN gateway ya web form jo user input par bharosa karta hai.</dd>
<dt>Exploit</dt><dd>Woh technique ya code jo vulnerability ka fayda uthata hai.</dd>
<dt>Risk</dt><dd>Likelihood guna impact. Jis machine tak koi pahunch hi nahi sakta uspar critical flaw, internet edge par medium flaw se kam risk hai.</dd>
<dt>Attack surface</dt><dd>Sab kuch jise attacker chhoo sake: internet-facing services, users ke inbox, APIs, AI assistants, suppliers.</dd>
</dl>

<h3>Aaj ke haavi threats</h3>
<table class="cmp"><tr><th>Threat</th><th>Naya kya hai</th><th>Main controls</th></tr>
<tr><td><b>Ransomware aur extortion</b></td><td>Double extortion (encrypt aur leak), ransomware-as-a-service, backups aur hypervisors par attacks</td><td>Immutable offline backups, EDR, segmentation, MFA, edge devices ki tez patching</td></tr>
<tr><td><b>Supply chain</b></td><td>Zehreele software updates, malicious open-source packages, compromised CI/CD pipelines aur managed service providers</td><td>SBOM, signed builds, least-privilege pipelines, vendor risk management</td></tr>
<tr><td><b>Edge-device exploitation</b></td><td>VPN gateways aur firewalls disclosure ke kuch hi dino mein exploit</td><td>KEV ke hisaab se patch, management interfaces internet se door, monitoring</td></tr>
<tr><td><b>Identity attacks</b></td><td>MFA fatigue (push bombing), session-token theft, adversary-in-the-middle (AiTM) phishing kits</td><td>Phishing-resistant MFA (FIDO2), conditional access, chhote sessions</td></tr>
<tr><td><b>AI-enabled attacks</b></td><td>Kisi bhi bhasha mein fluent phishing, CEO fraud ke liye voice aur video deepfakes, tez malware variants</td><td>Out-of-band verification, e-mail aur DNS security, naye pretexts par training</td></tr>
<tr><td><b>AI systems par attacks</b></td><td>Prompt injection, data poisoning, model theft, zyada permissions wale agents</td><td>AI guardrails, least-privilege agents, inputs aur outputs ka validation (chapters 5 aur 6)</td></tr>
<tr><td><b>Quantum: harvest now, decrypt later</b></td><td>Aaj record hua traffic tab decrypt ho sakta hai jab bada quantum computer RSA aur ECC tod de</td><td>Crypto inventory, post-quantum algorithms (ML-KEM, ML-DSA) par migration, cryptography module mein</td></tr>
</table>

<p>Ek pattern dekho: attackers wahan jaate hain jahan defenders dheere hain. Internet-facing appliances der se patch hote hain, isliye jaldi exploit hote hain. Log urgent e-mails ka jawab dete hain, isliye phishing andar aane ka sabse bada raasta bana rehta hai. AI assistants jaisi nayi technology jaldi deploy hoti hai, uska security model samajhne se pehle.</p>

<div class="eg"><p><b>Worked example.</b> Ek company ke scanner se 2,000 findings hain, roz 12 reported phishing e-mails, aur ek naya internal AI chatbot. Chaar engineers ke saath woh sab kuch fix nahi kar sakti. Yeh module method deta hai: har finding ko CVSS se score karo (chapter 3), EPSS, KEV aur exposure ke saath real-world context jodo (chapter 4), taaki shayad 15 findings emergency kaam banein; header analysis se mail triage karo (chapter 7); OWASP LLM controls se chatbot ko protect karo (chapters 5 aur 6); aur repetitive blocking ko APIs se automate karo (chapter 11).</p></div>

<div class="warn"><p><b>Common galti.</b> Yeh sochna ki strong perimeter firewall kaafi hai. Zyada tar modern breaches chori ki identity, phished user ya exploited edge appliance se shuru hote hain. Uske baad attacker "andar" hai aur castle model use khuli chhoot deta hai. Ek mazboot deewar se zyada layers aur least privilege matter karte hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Harvest now, decrypt later" <b>us data ki confidentiality</b> ko threat hai jo saalon tak secret rehna chahiye aur aaj RSA ya ECC key exchange se protected hai. Yeh aaj ke hashes ki integrity ke liye threat nahi, aur symmetric AES-256 quantum attack ke khilaaf safe maana jaata hai.</p></div>

<div class="scn"><h4>VPN gateway jiska koi owner nahi tha</h4><p>Ek mid-size company ko ek partner se pata chala ki uska data leak site par hai. Investigation ne entry point dikhaya: SSL VPN gateway, jo patches mein do mahine peeche tha. Uspar ek critical flaw chhe hafte se CISA KEV catalog mein listed tha. Appliance "network team" ka tha, patch process "server team" ka, aur koi use track nahi kar raha tha. Attackers ne gateway se credentials chura liye, file servers tak gaye aur data copy karne ke baad unhe encrypt kar diya.</p><p><b>Seekh:</b> har internet-facing device ka ek owner aur ek patch SLA hona chahiye jo sirf calendar se nahi, exploitation data se chale.</p></div>

<div class="iv"><p class="q">"Aaj enterprise network ke liye sabse bade threats kya hain?"</p><p>Strong candidate sirf malware ke naam list nahi karta. Jawab ko group karo: data theft ke saath ransomware, edge devices ka exploitation, MFA fatigue aur AiTM phishing jaise identity attacks, supply-chain compromise, aur naya AI angle (AI-assisted phishing aur deepfakes, plus company ke apne AI apps par attacks). Phir har threat ke liye ek control batao aur principle ke saath khatam karo: layered defence, least privilege aur real exploitation data se chalne wali patching.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Threat, vulnerability, exploit aur risk alag shabd hain; risk = likelihood x impact.</li>
<li>Aaj ke main threats: extortion ke saath ransomware, supply chain, edge-device exploitation, identity attacks, AI-enabled aur AI-targeted attacks, aur quantum "harvest now, decrypt later".</li>
<li>Attackers dheemepan ka fayda uthate hain: edge devices ki late patching, jaldbaazi mein AI deployments, busy users.</li>
<li>Airport model (har step par check) castle model (andar sab par trust) ki jagah leta hai.</li>
<li>Yeh module SCOR 350-701 v2.0 domain 1.0 ko shuru se aakhir tak cover karta hai, Python API scripts ke saath.</li>
</ul></div>
`}};export{e as default};