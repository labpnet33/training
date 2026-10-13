var e={id:`goals`,h:{en:`What you will learn, and why data centers automate`,hi:`Aap kya seekhoge, aur data centers automate kyun karte hain`},body:{en:`
<p><b>What you will learn in this module.</b> This module covers the automation, operations and security parts of the CCNP Data Center core exam (350-601 DCCOR). By the end you will be able to read and write JSON, XML and YAML; pull structured data from NX-OS with <code>| json</code> and NX-API; understand how Python, Ansible and Terraform drive Nexus and ACI; explain what Nexus Dashboard Fabric Controller (NDFC) and POAP do; choose between SNMP, syslog and streaming telemetry; make changes safely with checkpoints and rollback; capture traffic with SPAN and ERSPAN; plan upgrades; and secure the network, compute and storage layers with AAA, RBAC, CoPP, first-hop security, zoning and ACI contracts.</p>
<p><b>Prerequisites.</b> You should be comfortable on the NX-OS CLI (show commands, configuration mode, VLANs, interfaces, OSPF basics) and know what a spine-leaf fabric is. You do <b>not</b> need to be a programmer. Every piece of code in this module is short and explained line by line. The four hands-on labs use the same commands you will read here: structured output and NX-API, checkpoint and rollback, SPAN, and an RBAC security ticket.</p>

<h3>Start with an analogy: the handwritten letter and the printing press</h3>
<p>Imagine a school that must send the same exam timetable to 2,000 students. One teacher could write 2,000 letters by hand. It would take weeks, every letter would look slightly different, and a few would have the wrong date. Or the school could write the timetable once, check it once, and print it 2,000 times. Every copy is identical, it is done in an hour, and if a date changes you fix the master and print again.</p>
<p>Configuring switches by typing commands one by one is the handwritten letter. <b>Network automation</b> is the printing press: you describe what the network should look like once, test it once, and let software apply it to every device in exactly the same way.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Manual versus automated change">
<text x="160" y="22" text-anchor="middle" class="svg-accent" font-size="14">Manual (CLI, one by one)</text>
<text x="480" y="22" text-anchor="middle" class="svg-accent" font-size="14">Automated (source of truth)</text>
<rect x="20" y="40" width="80" height="34" rx="6" fill="#fed7aa"/><text x="60" y="62" text-anchor="middle" class="svg-ink" font-size="12">Engineer</text>
<rect x="140" y="36" width="160" height="26" rx="6" fill="#e2e8f0"/><text x="220" y="54" text-anchor="middle" class="svg-ink" font-size="12">LEAF-01 typed</text>
<rect x="140" y="70" width="160" height="26" rx="6" fill="#e2e8f0"/><text x="220" y="88" text-anchor="middle" class="svg-ink" font-size="12">LEAF-02 typo</text>
<rect x="140" y="104" width="160" height="26" rx="6" fill="#e2e8f0"/><text x="220" y="122" text-anchor="middle" class="svg-ink" font-size="12">LEAF-03 forgotten</text>
<line x1="100" y1="57" x2="140" y2="49" stroke="#64748b" stroke-width="2"/><line x1="100" y1="57" x2="140" y2="83" stroke="#64748b" stroke-width="2"/><line x1="100" y1="57" x2="140" y2="117" stroke="#64748b" stroke-width="2"/>
<rect x="340" y="40" width="120" height="34" rx="6" fill="#ddd6fe"/><text x="400" y="62" text-anchor="middle" class="svg-ink" font-size="12">Git: intent</text>
<rect x="340" y="100" width="120" height="34" rx="6" fill="#fde68a"/><text x="400" y="122" text-anchor="middle" class="svg-ink" font-size="12">Tool: Ansible</text>
<line x1="400" y1="74" x2="400" y2="100" stroke="#64748b" stroke-width="2"/>
<rect x="490" y="80" width="130" height="26" rx="6" fill="#bbf7d0"/><text x="555" y="98" text-anchor="middle" class="svg-ink" font-size="12">200 leaves, same</text>
<line x1="460" y1="117" x2="490" y2="93" stroke="#64748b" stroke-width="2"/>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="13">Manual: time grows with every device. Automated: write once, apply everywhere.</text>
<text x="320" y="192" text-anchor="middle" class="svg-muted" font-size="13">The CLI is still used, but for checking, not for bulk typing.</text>
</svg><p class="cap">Automation moves the work from typing on devices to describing intent in one place.</p></div>

<h3>Why data centers automate: four reasons</h3>
<ul>
<li><b>Scale.</b> A modern fabric can have 2 spines and 40 leaves today and 400 leaves in three years. Every new VLAN or VRF touches many of them. Human typing does not scale; software does.</li>
<li><b>Consistency.</b> Two leaves that should be identical drift apart over time: one has an extra ACL line, another a different MTU. Automation renders every device from the same template, so the fabric stays uniform and easy to troubleshoot.</li>
<li><b>Speed.</b> An application team asking for a new network segment should not wait two weeks for a change window and a manual build. With automation, a validated request can be deployed in minutes.</li>
<li><b>Fewer outages.</b> Industry post-mortems keep showing that human error during changes is one of the biggest causes of outages. A tested playbook does not mistype an IP address at 2 a.m., and a pre-change check can stop a bad change before it is pushed.</li>
</ul>

<h3>Key words you will meet in every chapter</h3>
<dl class="terms">
<dt>API</dt><dd>Application programming interface: a defined way for one program to ask another for data or to change something. On NX-OS the main API is <b>NX-API</b>.</dd>
<dt>Structured data</dt><dd>Data arranged with named fields (keys and values), such as JSON or XML, so a program can read a value by its name instead of guessing its column position on the screen.</dd>
<dt>Idempotent</dt><dd>Running the same automation twice gives the same end result; the second run changes nothing because the device is already correct.</dd>
<dt>Source of truth</dt><dd>The one place (often a Git repository or an IPAM/inventory database) that says what the network should look like. Devices are made to match it.</dd>
<dt>Controller</dt><dd>Software that manages many devices as one system, such as NDFC for NX-OS fabrics or the APIC for ACI.</dd>
</dl>

<div class="eg"><p><b>Worked example: a before and after story.</b> A company adds a new application that needs VLAN 30 on 48 leaf switches. <b>Before automation:</b> two engineers log in to each leaf, create the VLAN, name it and add it to two trunk ports. At about 4 minutes per switch that is 192 minutes of typing, plus checking. Afterwards an audit finds that LEAF-17 has the VLAN named "APP " with a trailing space and LEAF-33 is missing it on one trunk, so half of a server cluster cannot reach its storage. <b>After automation:</b> one engineer adds three lines to a YAML file in Git, a colleague reviews the pull request, and an Ansible playbook runs against all 48 leaves in under 3 minutes. The playbook reports <code>changed=48</code>; a second run reports <code>changed=0</code>, which proves every leaf already matches the intent.</p></div>

<h3>How this module is organised</h3>
<table class="cmp"><tr><th>Part</th><th>Chapters</th><th>Exam area</th></tr>
<tr><td>Data and APIs</td><td>Data formats, structured output, NX-API</td><td>Automation and programmability</td></tr>
<tr><td>Tools</td><td>Python, Ansible, Terraform, NDFC, Nexus Dashboard, POAP</td><td>Automation and orchestration</td></tr>
<tr><td>Operations</td><td>Telemetry, safe changes, SPAN, upgrades</td><td>Network operations and troubleshooting</td></tr>
<tr><td>Security</td><td>AAA, RBAC, CoPP, first-hop security, UCS and SAN security, ACI contracts</td><td>Security</td></tr>
</table>

<div class="warn"><p><b>Common beginner mistake.</b> Thinking automation means "no more CLI". You will still use show commands every day to verify, troubleshoot and understand what the tools did. Another mistake is automating a messy process as it is: if the manual process has no standards, the script will simply produce mistakes faster. Standardise first, then automate.</p></div>
<div class="exam"><p><b>Exam trap.</b> The exam tests concepts and exact tool behaviour, not programming skill. Know which tool is agentless (Ansible), which is declarative with a state file (Terraform), which feature exposes the NX-OS API (<code>feature nxapi</code>), and which process provisions a new switch at first boot (POAP).</p></div>

<div class="scn"><h4>The VLAN that was "added everywhere"</h4><p>A bank's DC team received a request to extend VLAN 214 to all 36 leaves for a new payment cluster. The change was done by hand over two nights. A week later, one node in the cluster kept losing its heartbeat. The engineer on call compared <code>show vlan brief</code> across the leaves and found the VLAN missing on one vPC peer, so traffic that hashed to that peer was dropped. The fix took two minutes; finding it took six hours. The team then wrote a small script that pulled <code>show vlan brief | json</code> from all leaves and compared them to the intended list, and later moved VLAN changes into Ansible.</p><p><b>Lesson:</b> automation is as much about <b>checking</b> the network against its intent as it is about pushing configuration.</p></div>

<div class="iv"><p class="q">"Why would a data center team invest in automation? Give a concrete example."</p><p>A strong candidate names scale, consistency, speed and reduced human error, then gives numbers: for example, extending a VLAN to 48 leaves by hand versus one reviewed change in Git applied by a playbook in minutes, with a second run showing no changes (idempotency). Mention that automation also verifies state, and that you would still use the CLI to confirm the result.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Automation means describing intent once and letting software apply it the same way to every device.</li>
<li>The four reasons: scale, consistency, speed and fewer outages caused by human error.</li>
<li>Structured data and APIs are the foundation; tools such as Python, Ansible, Terraform and controllers sit on top.</li>
<li>Idempotency and a single source of truth are what make automation safe to run again and again.</li>
<li>The CLI stays essential for verification; standardise the process before you automate it.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Yeh module CCNP Data Center core exam (350-601 DCCOR) ke automation, operations aur security wale hisse cover karta hai. End tak aap JSON, XML aur YAML padh aur likh paoge; <code>| json</code> aur NX-API se NX-OS ka structured data nikaal paoge; samjhoge ki Python, Ansible aur Terraform Nexus aur ACI ko kaise chalate hain; bata paoge ki Nexus Dashboard Fabric Controller (NDFC) aur POAP kya karte hain; SNMP, syslog aur streaming telemetry mein se sahi choose kar paoge; checkpoints aur rollback ke saath safe changes kar paoge; SPAN aur ERSPAN se traffic capture kar paoge; upgrades plan kar paoge; aur AAA, RBAC, CoPP, first-hop security, zoning aur ACI contracts se network, compute aur storage layers secure kar paoge.</p>
<p><b>Prerequisites.</b> Aapko NX-OS CLI par comfortable hona chahiye (show commands, configuration mode, VLANs, interfaces, OSPF basics) aur pata hona chahiye ki spine-leaf fabric kya hota hai. Aapko programmer hone ki <b>zaroorat nahi</b> hai. Is module ka har code chhota hai aur line by line samjhaya gaya hai. Chaar hands-on labs wahi commands use karte hain jo aap yahan padhoge: structured output aur NX-API, checkpoint aur rollback, SPAN, aur ek RBAC security ticket.</p>

<h3>Ek analogy se shuru karo: haath se likha letter aur printing press</h3>
<p>Socho ek school ko 2,000 students ko ek hi exam timetable bhejna hai. Ek teacher 2,000 letters haath se likh sakta hai. Hafte lagenge, har letter thoda alag dikhega, aur kuch mein date galat hogi. Ya school timetable ek baar likhe, ek baar check kare, aur 2,000 baar print kare. Har copy bilkul same, ek ghante mein kaam khatam, aur agar date badle to master theek karo aur phir print karo.</p>
<p>Switches ko ek ek command type karke configure karna haath se likha letter hai. <b>Network automation</b> printing press hai: aap ek baar batate ho ki network kaisa dikhna chahiye, ek baar test karte ho, aur software use har device par bilkul same tarah laga deta hai.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Manual aur automated change">
<text x="160" y="22" text-anchor="middle" class="svg-accent" font-size="14">Manual (CLI, ek ek karke)</text>
<text x="480" y="22" text-anchor="middle" class="svg-accent" font-size="14">Automated (source of truth)</text>
<rect x="20" y="40" width="80" height="34" rx="6" fill="#fed7aa"/><text x="60" y="62" text-anchor="middle" class="svg-ink" font-size="12">Engineer</text>
<rect x="140" y="36" width="160" height="26" rx="6" fill="#e2e8f0"/><text x="220" y="54" text-anchor="middle" class="svg-ink" font-size="12">LEAF-01 type hua</text>
<rect x="140" y="70" width="160" height="26" rx="6" fill="#e2e8f0"/><text x="220" y="88" text-anchor="middle" class="svg-ink" font-size="12">LEAF-02 typo</text>
<rect x="140" y="104" width="160" height="26" rx="6" fill="#e2e8f0"/><text x="220" y="122" text-anchor="middle" class="svg-ink" font-size="12">LEAF-03 bhool gaye</text>
<line x1="100" y1="57" x2="140" y2="49" stroke="#64748b" stroke-width="2"/><line x1="100" y1="57" x2="140" y2="83" stroke="#64748b" stroke-width="2"/><line x1="100" y1="57" x2="140" y2="117" stroke="#64748b" stroke-width="2"/>
<rect x="340" y="40" width="120" height="34" rx="6" fill="#ddd6fe"/><text x="400" y="62" text-anchor="middle" class="svg-ink" font-size="12">Git: intent</text>
<rect x="340" y="100" width="120" height="34" rx="6" fill="#fde68a"/><text x="400" y="122" text-anchor="middle" class="svg-ink" font-size="12">Tool: Ansible</text>
<line x1="400" y1="74" x2="400" y2="100" stroke="#64748b" stroke-width="2"/>
<rect x="490" y="80" width="130" height="26" rx="6" fill="#bbf7d0"/><text x="555" y="98" text-anchor="middle" class="svg-ink" font-size="12">200 leaves, same</text>
<line x1="460" y1="117" x2="490" y2="93" stroke="#64748b" stroke-width="2"/>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="13">Manual: har device ke saath time badhta hai. Automated: ek baar likho, har jagah lagao.</text>
<text x="320" y="192" text-anchor="middle" class="svg-muted" font-size="13">CLI ab bhi use hota hai, lekin checking ke liye, bulk typing ke liye nahi.</text>
</svg><p class="cap">Automation kaam ko devices par typing se hata kar ek jagah intent likhne par le aata hai.</p></div>

<h3>Data centers automate kyun karte hain: chaar wajah</h3>
<ul>
<li><b>Scale.</b> Aaj ek modern fabric mein 2 spines aur 40 leaves ho sakte hain aur teen saal mein 400 leaves. Har naya VLAN ya VRF unmein se bahut saaron ko chhoota hai. Insaan ki typing scale nahi hoti; software hota hai.</li>
<li><b>Consistency.</b> Do leaves jo same hone chahiye, time ke saath alag ho jaate hain: ek mein extra ACL line, dusre mein alag MTU. Automation har device ko same template se render karta hai, isliye fabric uniform rehta hai aur troubleshoot karna aasaan hota hai.</li>
<li><b>Speed.</b> Application team ko naya network segment chahiye to use change window aur manual build ke liye do hafte wait nahi karna chahiye. Automation ke saath validated request minutes mein deploy ho sakti hai.</li>
<li><b>Kam outages.</b> Industry post-mortems baar baar dikhate hain ki changes ke dauraan human error outages ki sabse badi wajahon mein se ek hai. Tested playbook raat 2 baje IP address galat type nahi karta, aur pre-change check bura change push hone se pehle rok sakta hai.</li>
</ul>

<h3>Key words jo har chapter mein milenge</h3>
<dl class="terms">
<dt>API</dt><dd>Application programming interface: ek tay tareeka jisse ek program dusre se data maang sakta hai ya kuch badal sakta hai. NX-OS par main API <b>NX-API</b> hai.</dd>
<dt>Structured data</dt><dd>Named fields (keys aur values) mein arranged data, jaise JSON ya XML, taaki program screen par column position guess karne ki jagah value ko uske naam se padh sake.</dd>
<dt>Idempotent</dt><dd>Same automation do baar chalane par end result same rehta hai; dusri run kuch nahi badalti kyunki device pehle se sahi hai.</dd>
<dt>Source of truth</dt><dd>Woh ek jagah (aksar Git repository ya IPAM/inventory database) jo batati hai ki network kaisa dikhna chahiye. Devices ko usse match karaya jaata hai.</dd>
<dt>Controller</dt><dd>Software jo bahut saare devices ko ek system ki tarah manage karta hai, jaise NX-OS fabrics ke liye NDFC ya ACI ke liye APIC.</dd>
</dl>

<div class="eg"><p><b>Worked example: pehle aur baad ki kahani.</b> Ek company naya application laa rahi hai jise 48 leaf switches par VLAN 30 chahiye. <b>Automation se pehle:</b> do engineers har leaf par login karte hain, VLAN banate hain, naam dete hain aur do trunk ports par add karte hain. Lagbhag 4 minute per switch ke hisaab se 192 minute typing, plus checking. Baad mein audit mein milta hai ki LEAF-17 par VLAN ka naam "APP " hai (end mein space ke saath) aur LEAF-33 par ek trunk par VLAN missing hai, isliye server cluster ka aadha hissa apne storage tak nahi pahunch pata. <b>Automation ke baad:</b> ek engineer Git mein YAML file mein teen lines jodta hai, colleague pull request review karta hai, aur ek Ansible playbook 3 minute se kam mein saare 48 leaves par chalti hai. Playbook <code>changed=48</code> report karti hai; dusri run <code>changed=0</code> report karti hai, jo saabit karta hai ki har leaf pehle se intent se match karta hai.</p></div>

<h3>Yeh module kaise organised hai</h3>
<table class="cmp"><tr><th>Part</th><th>Chapters</th><th>Exam area</th></tr>
<tr><td>Data aur APIs</td><td>Data formats, structured output, NX-API</td><td>Automation aur programmability</td></tr>
<tr><td>Tools</td><td>Python, Ansible, Terraform, NDFC, Nexus Dashboard, POAP</td><td>Automation aur orchestration</td></tr>
<tr><td>Operations</td><td>Telemetry, safe changes, SPAN, upgrades</td><td>Network operations aur troubleshooting</td></tr>
<tr><td>Security</td><td>AAA, RBAC, CoPP, first-hop security, UCS aur SAN security, ACI contracts</td><td>Security</td></tr>
</table>

<div class="warn"><p><b>Beginners ki common galti.</b> Yeh sochna ki automation ka matlab hai "ab CLI nahi". Aap roz show commands use karoge verify karne, troubleshoot karne aur yeh samajhne ke liye ki tools ne kya kiya. Dusri galti hai gande process ko waisa hi automate kar dena: agar manual process ke koi standards nahi hain, to script bas galtiyan tezi se banayegi. Pehle standardise karo, phir automate karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Exam concepts aur tools ka exact behaviour test karta hai, programming skill nahi. Yaad rakho kaunsa tool agentless hai (Ansible), kaunsa state file ke saath declarative hai (Terraform), kaunsa feature NX-OS API expose karta hai (<code>feature nxapi</code>), aur kaunsa process naye switch ko first boot par provision karta hai (POAP).</p></div>

<div class="scn"><h4>Woh VLAN jo "har jagah add" hua tha</h4><p>Ek bank ki DC team ko naye payment cluster ke liye VLAN 214 ko saare 36 leaves tak extend karne ki request mili. Change do raaton mein haath se kiya gaya. Ek hafte baad cluster ka ek node baar baar apna heartbeat kho raha tha. On-call engineer ne leaves par <code>show vlan brief</code> compare kiya aur paaya ki ek vPC peer par VLAN missing tha, isliye jo traffic us peer par hash hota tha woh drop ho jaata tha. Fix mein do minute lage; dhoondhne mein chhe ghante. Phir team ne ek chhoti script likhi jo saare leaves se <code>show vlan brief | json</code> kheenchti thi aur intended list se compare karti thi, aur baad mein VLAN changes Ansible mein le gayi.</p><p><b>Seekh:</b> automation jitna configuration push karne ke baare mein hai, utna hi network ko uske intent ke against <b>check</b> karne ke baare mein hai.</p></div>

<div class="iv"><p class="q">"Data center team automation mein invest kyun karegi? Ek concrete example do."</p><p>Strong candidate scale, consistency, speed aur kam human error ka naam leta hai, phir numbers deta hai: jaise 48 leaves par VLAN haath se extend karna versus Git mein ek reviewed change jo playbook minutes mein lagati hai, aur dusri run koi change nahi dikhati (idempotency). Yeh bhi batao ki automation state verify bhi karta hai, aur result confirm karne ke liye aap ab bhi CLI use karoge.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Automation ka matlab hai intent ek baar describe karna aur software se use har device par same tarah lagwana.</li>
<li>Chaar wajah: scale, consistency, speed aur human error se hone wale kam outages.</li>
<li>Structured data aur APIs neev hain; Python, Ansible, Terraform aur controllers jaise tools unke upar baithte hain.</li>
<li>Idempotency aur single source of truth hi automation ko baar baar chalane ke liye safe banate hain.</li>
<li>Verification ke liye CLI zaroori rehta hai; automate karne se pehle process standardise karo.</li>
</ul></div>
`}};export{e as default};