var e={id:`big-picture`,h:{en:`The big picture: what cloud security really means`,hi:`Big picture: cloud security ka asli matlab`},body:{en:`
<p><b>What you will learn in this module.</b> By the end of these chapters you will be able to explain who secures what in IaaS, PaaS and SaaS, triage cloud security posture findings, fix the classic misconfigurations (public storage, open SSH, over-privileged identities), describe how Cisco Multicloud Defense and Cisco Secure Workload protect cloud and data center workloads, explain DevSecOps from the developer's laptop to Kubernetes, and get cloud audit logs into Splunk so the SOC can hunt. This is domain 3.0 of CCNP Security SCOR 350-701 v2.0, and it is one of the most interview-friendly topics in the whole track.</p>
<p><b>Prerequisites.</b> You should be comfortable with IP addressing, TCP/UDP ports, what a firewall rule is and what stateful inspection means (sec-foundations), and the ideas of zero trust and OWASP risks (sec-concepts). You do not need any cloud account or cloud certification. Everything is explained from zero.</p>

<h3>Start with an analogy: renting a serviced apartment</h3>
<p>Imagine you move from your own house into a serviced apartment. The building owner looks after the foundation, the lift, the electricity, the main gate guard and the water tank. You look after who you give your door key to, whether you lock your own door, and what you leave lying on the balcony for the whole street to see. If you leave the door open and your laptop is stolen, the building guard is not to blame.</p>
<p>Cloud works the same way. The <b>cloud provider</b> secures the building: data centers, hardware, hypervisors, the global network. You, the <b>customer</b>, secure what you put inside: your data, your identities and keys, your configuration, and (depending on the service) your operating systems and applications. Most cloud breaches are not clever attacks on the provider. They are open doors left by customers: a storage bucket readable by the whole internet, SSH open to 0.0.0.0/0, an access key pasted into a public code repository, audit logging switched off.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Cloud security building blocks">
<rect x="10" y="10" width="620" height="40" rx="8" fill="#fde68a"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="14">Logging and monitoring: audit logs, flow logs, SIEM (Splunk)</text>
<rect x="10" y="58" width="200" height="62" rx="8" fill="#bae6fd"/><text x="110" y="84" text-anchor="middle" class="svg-ink" font-size="13">Posture (CSPM)</text><text x="110" y="104" text-anchor="middle" class="svg-muted" font-size="12">IAM, storage, SGs</text>
<rect x="220" y="58" width="200" height="62" rx="8" fill="#bbf7d0"/><text x="320" y="84" text-anchor="middle" class="svg-ink" font-size="13">Workloads (CWPP)</text><text x="320" y="104" text-anchor="middle" class="svg-muted" font-size="12">Secure Workload, eBPF</text>
<rect x="430" y="58" width="200" height="62" rx="8" fill="#ddd6fe"/><text x="530" y="84" text-anchor="middle" class="svg-ink" font-size="13">Network</text><text x="530" y="104" text-anchor="middle" class="svg-muted" font-size="12">Multicloud Defense</text>
<rect x="10" y="128" width="620" height="40" rx="8" fill="#fed7aa"/><text x="320" y="153" text-anchor="middle" class="svg-ink" font-size="14">DevSecOps: code, IaC, images and pipelines scanned before deploy</text>
<rect x="10" y="176" width="620" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="201" text-anchor="middle" class="svg-ink" font-size="14">Shared responsibility: provider secures OF the cloud, you secure IN it</text>
</svg><p class="cap">The five building blocks of this module. The foundation is knowing which layer is yours.</p></div>

<h3>What "cloud" means officially: NIST SP 800-145</h3>
<p>The exam uses the NIST definition. A service is "cloud" when it has five <b>essential characteristics</b>:</p>
<ul>
<li><b>On-demand self-service</b>: you create a server or a database yourself in minutes, without raising a ticket with the provider.</li>
<li><b>Broad network access</b>: you reach it over the network from laptops, phones and APIs.</li>
<li><b>Resource pooling</b>: many customers (tenants) share the same physical hardware, isolated from each other.</li>
<li><b>Rapid elasticity</b>: capacity grows and shrinks quickly, often automatically.</li>
<li><b>Measured service</b>: you pay for what you use, metered per hour, per GB or per request.</li>
</ul>
<p>NIST also defines three <b>service models</b> (IaaS, PaaS, SaaS) and four <b>deployment models</b>: <b>public</b> (shared by anyone who pays), <b>private</b> (for one organisation, on-premises or hosted), <b>community</b> (shared by organisations with common needs, such as government agencies) and <b>hybrid</b> (two or more of these joined together, for example a private data center bursting into public cloud). Most real companies are <b>multicloud</b>: two or more public providers plus their own data center.</p>

<h3>Why cloud security feels different</h3>
<p>In a classic data center, changing a firewall rule needed a change ticket and a network engineer. In the cloud, any developer with the right permission can open a port or make a bucket public with one API call or one line of Terraform. Three things change:</p>
<ul>
<li><b>Identity is the new perimeter.</b> Whoever holds a valid key or role can reach the control plane from anywhere in the world.</li>
<li><b>Configuration is code.</b> Mistakes are copied by automation hundreds of times, so you must catch them in the pipeline.</li>
<li><b>Everything is an API call.</b> That is good news: every action can be logged and reviewed, if you collect the logs.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> A company runs 3 cloud accounts with 40 storage buckets, 120 security groups and 300 IAM identities. A monthly manual audit would check about 460 objects; a single developer can change 20 of them in a day. A posture tool that re-checks all 460 objects every hour catches a public bucket within 60 minutes instead of within 30 days. That difference is the whole argument for CSPM.</p></div>

<h3>The two labs in this module</h3>
<p><b>Lab 1, Cloud posture triage.</b> CSPM raised findings on account <code>nk-prod</code>, and a researcher reports that payroll data downloads from the internet. You confirm from <b>EXT-PC</b>, triage findings in the <b>CLOUD</b> console, fix bucket <code>nk-payroll-exports</code> and security group <code>sg-web</code>, then fix the Terraform so the pipeline stops re-creating the problem. <b>Lab 2, Cloud logs into Splunk.</b> You enable the HTTP Event Collector on <b>SPLUNK</b> (10.50.1.20), create a token, start the forwarder on <b>FWD</b> (10.50.1.30), and hunt the attacker with SPL. Chapters 4, 5 and 9 teach Lab 1; chapter 11 teaches Lab 2; chapter 12 walks both end to end.</p>

<div class="warn"><p><b>Common beginner mistake.</b> Thinking "the provider is ISO certified, so we are secure". The provider's certification covers the provider's layers only. Your public bucket is still your public bucket.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Mandatory encryption" or "multi-tenancy" are not among the five NIST essential characteristics. Resource pooling is the correct term. Also remember there are four deployment models, and "multicloud" is not one of them.</p></div>

<div class="scn"><h4>The bucket that was "only for testing"</h4><p>A fintech team copied a month of customer exports into a storage bucket to test a reporting tool and set it to public so the tool could read it without credentials. Nobody removed the setting. Six weeks later a security researcher found it with a simple bucket-name search and e-mailed the company. The cloud provider had done nothing wrong; the bucket ACL was a customer setting. After the incident the team turned on organisation-wide public access blocking, added CSPM alerts for public buckets and added IaC scanning to the pipeline.</p><p><b>Lesson:</b> in the cloud, a single setting can publish data to the world. Prevent it with guardrails, detect it with posture tools, and log every change.</p></div>

<div class="iv"><p class="q">"In one minute, what is different about securing the cloud compared with a data center?"</p><p>Strong answer: shared responsibility (the provider secures the infrastructure, the customer secures data, identity and configuration), identity becomes the perimeter because the control plane is reachable from anywhere, configuration is code so mistakes scale, and every action is an API call that can be logged. Then name the controls: CSPM for posture, CWPP for workloads, IaC scanning in the pipeline, and audit logs into the SIEM.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NIST SP 800-145: five characteristics, three service models, four deployment models (public, private, community, hybrid).</li>
<li>The provider secures OF the cloud; the customer secures what is IN the cloud.</li>
<li>Most cloud breaches are customer misconfigurations: public storage, open ports, leaked keys, logging off.</li>
<li>Identity is the perimeter, configuration is code, and every action is an API call you can log.</li>
<li>This module covers posture, workloads, network, DevSecOps and logging, with two hands-on labs.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> In chapters ke end tak aap samjha paoge ki IaaS, PaaS aur SaaS mein kaun kya secure karta hai, cloud security posture findings triage kar paoge, classic misconfigurations theek kar paoge (public storage, khula SSH, over-privileged identities), bata paoge ki Cisco Multicloud Defense aur Cisco Secure Workload cloud aur data center workloads ko kaise protect karte hain, developer ke laptop se Kubernetes tak DevSecOps explain kar paoge, aur cloud audit logs ko Splunk mein la paoge taaki SOC hunt kar sake. Yeh CCNP Security SCOR 350-701 v2.0 ka domain 3.0 hai, aur poore track mein sabse zyada interview-friendly topics mein se ek hai.</p>
<p><b>Prerequisites.</b> Aapko IP addressing, TCP/UDP ports, firewall rule kya hota hai aur stateful inspection ka matlab (sec-foundations), aur zero trust aur OWASP risks ke ideas (sec-concepts) aane chahiye. Koi cloud account ya cloud certification nahi chahiye. Sab kuch zero se samjhaya gaya hai.</p>

<h3>Ek analogy se shuru karo: serviced apartment kiraye par lena</h3>
<p>Socho aap apne ghar se ek serviced apartment mein shift hote ho. Building owner foundation, lift, bijli, main gate ka guard aur paani ki tanki sambhalta hai. Aap sambhalte ho ki apne darwaze ki chaabi kisko dete ho, apna darwaza lock karte ho ya nahi, aur balcony par kya chhod dete ho jo poori gali dekh sake. Agar aap darwaza khula chhod do aur laptop chori ho jaaye, to building guard ki galti nahi hai.</p>
<p>Cloud bilkul aise hi kaam karta hai. <b>Cloud provider</b> building secure karta hai: data centers, hardware, hypervisors, global network. Aap, yaani <b>customer</b>, woh secure karte ho jo aap andar rakhte ho: aapka data, aapki identities aur keys, aapka configuration, aur (service ke hisaab se) aapke operating systems aur applications. Zyada tar cloud breaches provider par koi clever attack nahi hote. Woh customers ke chhode hue khule darwaze hote hain: poore internet ke liye readable storage bucket, 0.0.0.0/0 ke liye khula SSH, public code repository mein paste ki hui access key, band audit logging.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Cloud security ke building blocks">
<rect x="10" y="10" width="620" height="40" rx="8" fill="#fde68a"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="14">Logging aur monitoring: audit logs, flow logs, SIEM (Splunk)</text>
<rect x="10" y="58" width="200" height="62" rx="8" fill="#bae6fd"/><text x="110" y="84" text-anchor="middle" class="svg-ink" font-size="13">Posture (CSPM)</text><text x="110" y="104" text-anchor="middle" class="svg-muted" font-size="12">IAM, storage, SGs</text>
<rect x="220" y="58" width="200" height="62" rx="8" fill="#bbf7d0"/><text x="320" y="84" text-anchor="middle" class="svg-ink" font-size="13">Workloads (CWPP)</text><text x="320" y="104" text-anchor="middle" class="svg-muted" font-size="12">Secure Workload, eBPF</text>
<rect x="430" y="58" width="200" height="62" rx="8" fill="#ddd6fe"/><text x="530" y="84" text-anchor="middle" class="svg-ink" font-size="13">Network</text><text x="530" y="104" text-anchor="middle" class="svg-muted" font-size="12">Multicloud Defense</text>
<rect x="10" y="128" width="620" height="40" rx="8" fill="#fed7aa"/><text x="320" y="153" text-anchor="middle" class="svg-ink" font-size="14">DevSecOps: deploy se pehle code, IaC, images aur pipelines scan</text>
<rect x="10" y="176" width="620" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="201" text-anchor="middle" class="svg-ink" font-size="14">Shared responsibility: provider cloud KI security, aap cloud MEIN</text>
</svg><p class="cap">Is module ke paanch building blocks. Foundation yeh jaanna hai ki kaunsi layer aapki hai.</p></div>

<h3>Official taur par "cloud" ka matlab: NIST SP 800-145</h3>
<p>Exam NIST ki definition use karta hai. Koi service tab "cloud" hai jab usmein paanch <b>essential characteristics</b> hon:</p>
<ul>
<li><b>On-demand self-service</b>: aap khud minutes mein server ya database bana lete ho, provider ke paas ticket raise kiye bina.</li>
<li><b>Broad network access</b>: aap ise network par laptops, phones aur APIs se access karte ho.</li>
<li><b>Resource pooling</b>: bahut saare customers (tenants) ek hi physical hardware share karte hain, ek dusre se isolated.</li>
<li><b>Rapid elasticity</b>: capacity jaldi badhti aur ghatti hai, aksar automatically.</li>
<li><b>Measured service</b>: jitna use karo utna pay karo, per hour, per GB ya per request meter hota hai.</li>
</ul>
<p>NIST teen <b>service models</b> (IaaS, PaaS, SaaS) aur chaar <b>deployment models</b> bhi define karta hai: <b>public</b> (jo bhi pay kare uske saath shared), <b>private</b> (ek organisation ke liye, on-premises ya hosted), <b>community</b> (common needs wali organisations ke beech shared, jaise government agencies) aur <b>hybrid</b> (inmein se do ya zyada jude hue, jaise private data center jo public cloud mein burst karta hai). Zyada tar real companies <b>multicloud</b> hoti hain: do ya zyada public providers plus apna data center.</p>

<h3>Cloud security alag kyun lagti hai</h3>
<p>Classic data center mein firewall rule badalne ke liye change ticket aur network engineer chahiye hota tha. Cloud mein sahi permission wala koi bhi developer ek API call ya Terraform ki ek line se port khol sakta hai ya bucket public kar sakta hai. Teen cheezein badalti hain:</p>
<ul>
<li><b>Identity naya perimeter hai.</b> Jiske paas valid key ya role hai woh duniya mein kahin se bhi control plane tak pahunch sakta hai.</li>
<li><b>Configuration code hai.</b> Galtiyan automation se sainkdon baar copy hoti hain, isliye unhe pipeline mein pakadna padta hai.</li>
<li><b>Har cheez ek API call hai.</b> Yeh achhi khabar hai: har action log aur review ho sakta hai, agar aap logs collect karo.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Ek company 3 cloud accounts chalati hai jinmein 40 storage buckets, 120 security groups aur 300 IAM identities hain. Monthly manual audit lagbhag 460 objects check karega; ek developer ek din mein unmein se 20 badal sakta hai. Posture tool jo saare 460 objects har ghante dobara check kare, public bucket ko 30 din ki jagah 60 minute mein pakad leta hai. Yahi farak CSPM ka poora argument hai.</p></div>

<h3>Is module ke do labs</h3>
<p><b>Lab 1, Cloud posture triage.</b> CSPM ne account <code>nk-prod</code> par findings uthaye hain, aur ek researcher batata hai ki payroll data internet se download ho raha hai. Aap <b>EXT-PC</b> se confirm karte ho, <b>CLOUD</b> console mein findings triage karte ho, bucket <code>nk-payroll-exports</code> aur security group <code>sg-web</code> theek karte ho, phir Terraform theek karte ho taaki pipeline problem dobara na banaye. <b>Lab 2, Cloud logs Splunk mein.</b> Aap <b>SPLUNK</b> (10.50.1.20) par HTTP Event Collector enable karte ho, token banate ho, <b>FWD</b> (10.50.1.30) par forwarder start karte ho, aur SPL se attacker ko dhoondhte ho. Chapters 4, 5 aur 9 Lab 1 sikhate hain; chapter 11 Lab 2 sikhata hai; chapter 12 dono ko end to end walk karta hai.</p>

<div class="warn"><p><b>Beginners ki common galti.</b> Yeh sochna ki "provider ISO certified hai, to hum secure hain". Provider ka certification sirf provider ki layers cover karta hai. Aapka public bucket ab bhi aapka public bucket hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Mandatory encryption" ya "multi-tenancy" NIST ki paanch essential characteristics mein nahi hain. Sahi term resource pooling hai. Yeh bhi yaad rakho ki deployment models chaar hain, aur "multicloud" unmein se ek nahi hai.</p></div>

<div class="scn"><h4>Woh bucket jo "sirf testing ke liye" tha</h4><p>Ek fintech team ne ek reporting tool test karne ke liye ek mahine ke customer exports ek storage bucket mein copy kiye aur use public kar diya taaki tool bina credentials ke padh sake. Kisi ne setting hatayi nahi. Chhe hafte baad ek security researcher ne simple bucket-name search se use dhoondh liya aur company ko mail kiya. Cloud provider ne kuch galat nahi kiya tha; bucket ACL customer ki setting thi. Incident ke baad team ne organisation-wide public access blocking on ki, public buckets ke liye CSPM alerts lagaye aur pipeline mein IaC scanning jodi.</p><p><b>Seekh:</b> cloud mein ek setting data ko poori duniya ke liye publish kar sakti hai. Guardrails se roko, posture tools se pakdo, aur har change log karo.</p></div>

<div class="iv"><p class="q">"Ek minute mein batao, data center ke comparison mein cloud secure karna kaise alag hai?"</p><p>Strong answer: shared responsibility (provider infrastructure secure karta hai, customer data, identity aur configuration secure karta hai), identity perimeter ban jaati hai kyunki control plane kahin se bhi reachable hai, configuration code hai isliye galtiyan scale hoti hain, aur har action ek API call hai jo log ho sakta hai. Phir controls ka naam lo: posture ke liye CSPM, workloads ke liye CWPP, pipeline mein IaC scanning, aur SIEM mein audit logs.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NIST SP 800-145: paanch characteristics, teen service models, chaar deployment models (public, private, community, hybrid).</li>
<li>Provider cloud KI security karta hai; customer jo cloud MEIN hai uski.</li>
<li>Zyada tar cloud breaches customer misconfigurations hain: public storage, khule ports, leak hui keys, band logging.</li>
<li>Identity perimeter hai, configuration code hai, aur har action ek API call hai jise aap log kar sakte ho.</li>
<li>Yeh module posture, workloads, network, DevSecOps aur logging cover karta hai, do hands-on labs ke saath.</li>
</ul></div>
`}};export{e as default};