var e={id:`overview`,h:{en:`Deployment and integration: the big picture`,hi:`Deployment aur integration: bada picture`},body:{en:`
<p><b>What you will learn in this module.</b> In the earlier modules you built policy: services, role mappings, enforcement profiles and roles. All of that is useless if the switch and ClearPass do not trust each other, if the RADIUS packets never arrive, or if a port cannot handle both a laptop and a printer. This module is about the plumbing around the policy: <b>onboarding network devices (NADs)</b>, <b>shared secrets</b>, the <b>source IP address</b> of RADIUS requests, <b>mixed-mode ports</b> (802.1X first, MAC authentication as fallback), and, as concepts, <b>clustering</b>, <b>Active Directory</b>, <b>certificates</b>, <b>TACACS+</b> and <b>wireless controllers</b>. By the end you will be able to onboard a switch correctly, read the evidence when a new device is silently ignored, and explain every integration piece in an interview.</p>
<p><b>Prerequisites.</b> You should have finished the first four modules of this track: you know what 802.1X, RADIUS, a supplicant, an authenticator and an authentication server are, and you can build a service with a role mapping, an enforcement profile and an enforcement policy. We do not re-teach those here; we refer back to them.</p>

<h3>Analogy: a new branch office and the head-office security desk</h3>
<p>Imagine head office has a very smart security desk (ClearPass) that decides who may enter any building of the company. A new branch office (a new switch) opens. Before the desk will answer a single question from that branch, three simple things must be true. The desk must have the branch in its <b>register</b> (the network device entry). The branch must phone from a <b>number the register knows</b> (the source IP). And both must use the same <b>password phrase</b> on the phone line (the shared secret). If any one is wrong, the desk does not argue or send an error. It simply puts the phone down. The branch then waits, times out and declares the desk dead.</p>
<p>That silent behaviour is the single most important idea in this module. Policy errors in ClearPass are loud: you get an alert in the Access Tracker. Plumbing errors are quiet: you get a line in the Event Viewer, or nothing at all, and the switch complains.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Deployment checkpoints between switch and ClearPass">
<rect x="20" y="70" width="150" height="70" rx="8" fill="#bae6fd"/><text x="95" y="100" text-anchor="middle" class="svg-ink" font-size="14">ACCESS switch</text><text x="95" y="120" text-anchor="middle" class="svg-muted" font-size="12">AOS-CX style</text>
<rect x="470" y="70" width="150" height="70" rx="8" fill="#bbf7d0"/><text x="545" y="100" text-anchor="middle" class="svg-ink" font-size="14">CPPM</text><text x="545" y="120" text-anchor="middle" class="svg-muted" font-size="12">10.20.60.10</text>
<line x1="170" y1="105" x2="470" y2="105" stroke="#64748b" stroke-width="3"/>
<rect x="215" y="20" width="90" height="34" rx="6" fill="#fde68a"/><text x="260" y="42" text-anchor="middle" class="svg-ink" font-size="12">1 source IP</text>
<rect x="320" y="20" width="110" height="34" rx="6" fill="#fde68a"/><text x="375" y="42" text-anchor="middle" class="svg-ink" font-size="12">2 shared secret</text>
<rect x="195" y="160" width="130" height="34" rx="6" fill="#ddd6fe"/><text x="260" y="182" text-anchor="middle" class="svg-ink" font-size="12">3 service match</text>
<rect x="340" y="160" width="130" height="34" rx="6" fill="#ddd6fe"/><text x="405" y="182" text-anchor="middle" class="svg-ink" font-size="12">4 policy chain</text>
<line x1="260" y1="54" x2="260" y2="100" stroke="#64748b" stroke-dasharray="3 3"/><line x1="375" y1="54" x2="375" y2="100" stroke="#64748b" stroke-dasharray="3 3"/>
<text x="320" y="218" text-anchor="middle" class="svg-muted" font-size="12">Checkpoints 1 and 2 fail silently; 3 and 4 fail with alerts</text>
</svg><p class="cap">Four checkpoints on the way from a client to a role. Checkpoints 1 and 2 are this module; 3 and 4 were the earlier modules.</p></div>

<h3>The chapters ahead</h3>
<ul>
<li><b>NAD onboarding</b> (chapter 2): what a network device entry is and which fields matter.</li>
<li><b>Shared secrets</b> (chapter 3): how the secret is checked and how a mismatch looks. Lab: <code>cp-secret-mismatch</code>.</li>
<li><b>Source IP</b> (chapter 4): why ClearPass identifies a NAD by address. Lab: <code>cp-nad-ip</code>.</li>
<li><b>Mixed-mode ports</b> (chapter 5): laptops and printers on one port design. Lab: <code>cp-mixed-port</code>.</li>
<li><b>Cluster, Active Directory, certificates, TACACS+ and wireless</b> (chapters 6 to 9): real concepts, taught honestly.</li>
<li><b>Troubleshooting workflow</b> (chapter 10) and <b>summary</b> (chapter 11).</li>
</ul>

<div class="note"><p><b>Lab versus real product.</b> The labs run on an original learning model of a ClearPass-style policy server and an AOS-CX-style switch. They are not HPE Aruba software. The real ClearPass Policy Manager is configured in a web GUI under Configuration. The lab uses a text shell whose commands mirror the GUI menu path. In this module we always show the real GUI path and values first, then the lab command labelled <b>Lab shell</b>. Anything the lab does not model is labelled <b>not simulated in the lab</b>.</p></div>

<h3>The lab topology you will use</h3>
<p>ACCESS is a 12-port switch (ports 1/1/1 to 1/1/12). Port 1/1/1 is a trunk to router R1. ClearPass (CPPM, 10.20.60.10) and the application server APP1 (10.20.70.20) sit behind R1. LAPTOP1 (user alice) is on 1/1/3, LAPTOP2 (user bob) on 1/1/4 and the printer PRN1 on 1/1/5. VLANs: 10 EMPLOYEE, 20 CONTRACTOR, 30 IOT, 40 GUEST, 50 QUARANTINE, 99 INFRA. The switch management address in VLAN 99 is 10.20.99.2, and that is the address its RADIUS requests come from. The shared secret everywhere is ArubaNK1.</p>

<div class="eg"><p><b>Worked example.</b> A packet leaves ACCESS toward 10.20.60.10. R1 routes it between VLAN 99 (10.20.99.0/24) and the server network (10.20.60.0/24). ClearPass receives the packet with source address 10.20.99.2. If a network device with the address 10.20.99.2 exists, ClearPass uses its secret to verify the packet. If not, the packet is dropped. The hostname ACCESS never appears in the check.</p></div>

<div class="warn"><p><b>Common mistake.</b> Starting policy work before trust works. If a new switch cannot authenticate anybody, do not touch roles or profiles first. Check the Event Viewer and the switch RADIUS server status. Fixing a perfect policy does nothing when the packet never reaches it.</p></div>

<div class="exam"><p><b>Exam trap.</b> "ClearPass returned Access-Reject" and "ClearPass dropped the request" are different. A reject is a reply (a policy decision, visible in the Access Tracker). A drop is silence (a plumbing fault, visible in the Event Viewer and as a dead server on the switch).</p></div>

<div class="scn"><h4>The Friday switch</h4><p>A contractor installed a new access switch on Friday evening. By Monday every user on it complained. The policy team spent two hours reading enforcement policies; all were fine. A junior engineer finally opened the Event Viewer and found repeated messages that requests came from an unregistered device. The switch had been registered under its management address, but it sourced RADIUS from a different interface. Registering the correct address fixed everything in a minute.</p><p><b>Lesson:</b> work from the outside in: reachability, device identity, secret, service, policy. Never start at the innermost layer.</p></div>

<div class="iv"><p class="q">"A new switch cannot authenticate anyone. Where do you start?"</p><p>Strong answer: first prove the packet arrives and is trusted. Check the switch RADIUS server status, then the ClearPass Event Viewer for an unknown device or a secret problem, and only then the Access Tracker. Mention that unknown device and wrong secret produce silence, while policy failures produce alerts, so the logs you read tell you which layer is broken.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>This module covers the plumbing around policy: NADs, secrets, source IP, mixed-mode ports and integration concepts.</li>
<li>ClearPass checks the packet source IP against its network devices, then the shared secret of that device.</li>
<li>Unknown device and wrong secret give a silent drop; the switch marks the server dead.</li>
<li>Policy failures are loud (Access Tracker alerts); plumbing failures are quiet (Event Viewer).</li>
<li>Cluster, AD, certificates, TACACS+ and wireless are taught as real concepts and are not simulated in the lab.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Pichhle modules mein aapne policy banayi: services, role mappings, enforcement profiles aur roles. Yeh sab bekaar hai agar switch aur ClearPass ek doosre par trust nahi karte, agar RADIUS packets kabhi pahunchte hi nahi, ya agar ek port laptop aur printer dono handle nahi kar paata. Yeh module policy ke aas-paas ki plumbing ke baare mein hai: <b>network devices (NADs) onboard karna</b>, <b>shared secrets</b>, RADIUS requests ka <b>source IP address</b>, <b>mixed-mode ports</b> (pehle 802.1X, fallback mein MAC authentication), aur concepts ke roop mein <b>clustering</b>, <b>Active Directory</b>, <b>certificates</b>, <b>TACACS+</b> aur <b>wireless controllers</b>. Module ke end tak aap switch ko sahi se onboard kar paoge, jab koi naya device chupchaap ignore ho to evidence padh paoge, aur har integration piece interview mein explain kar paoge.</p>
<p><b>Prerequisites.</b> Aapne is track ke pehle chaar modules complete kiye hone chahiye: aap jaante ho ki 802.1X, RADIUS, supplicant, authenticator aur authentication server kya hote hain, aur aap role mapping, enforcement profile aur enforcement policy ke saath service bana sakte ho. Yahan hum yeh dobara nahi padhaate; bas refer karte hain.</p>

<h3>Analogy: naya branch office aur head-office ka security desk</h3>
<p>Socho head office ka ek bahut smart security desk (ClearPass) hai jo company ki har building mein entry decide karta hai. Ek naya branch office (naya switch) khulta hai. Desk us branch ke ek bhi sawaal ka jawab dene se pehle teen simple cheezein sach honi chahiye. Desk ke paas branch <b>register</b> mein hona chahiye (network device entry). Branch ko aise <b>number se call karna chahiye jo register jaanta ho</b> (source IP). Aur dono ko phone line par same <b>password phrase</b> use karna chahiye (shared secret). Agar inmein se koi ek bhi galat ho, desk bahes nahi karta aur error bhi nahi bhejta. Woh bas phone rakh deta hai. Branch phir intezaar karta hai, timeout hota hai aur desk ko dead declare kar deta hai.</p>
<p>Yeh chupchaap behaviour is module ka sabse important idea hai. ClearPass mein policy errors loud hote hain: Access Tracker mein alert milta hai. Plumbing errors quiet hote hain: Event Viewer mein ek line milti hai, ya kuch nahi milta, aur switch shikayat karta hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Switch aur ClearPass ke beech deployment checkpoints">
<rect x="20" y="70" width="150" height="70" rx="8" fill="#bae6fd"/><text x="95" y="100" text-anchor="middle" class="svg-ink" font-size="14">ACCESS switch</text><text x="95" y="120" text-anchor="middle" class="svg-muted" font-size="12">AOS-CX style</text>
<rect x="470" y="70" width="150" height="70" rx="8" fill="#bbf7d0"/><text x="545" y="100" text-anchor="middle" class="svg-ink" font-size="14">CPPM</text><text x="545" y="120" text-anchor="middle" class="svg-muted" font-size="12">10.20.60.10</text>
<line x1="170" y1="105" x2="470" y2="105" stroke="#64748b" stroke-width="3"/>
<rect x="215" y="20" width="90" height="34" rx="6" fill="#fde68a"/><text x="260" y="42" text-anchor="middle" class="svg-ink" font-size="12">1 source IP</text>
<rect x="320" y="20" width="110" height="34" rx="6" fill="#fde68a"/><text x="375" y="42" text-anchor="middle" class="svg-ink" font-size="12">2 shared secret</text>
<rect x="195" y="160" width="130" height="34" rx="6" fill="#ddd6fe"/><text x="260" y="182" text-anchor="middle" class="svg-ink" font-size="12">3 service match</text>
<rect x="340" y="160" width="130" height="34" rx="6" fill="#ddd6fe"/><text x="405" y="182" text-anchor="middle" class="svg-ink" font-size="12">4 policy chain</text>
<line x1="260" y1="54" x2="260" y2="100" stroke="#64748b" stroke-dasharray="3 3"/><line x1="375" y1="54" x2="375" y2="100" stroke="#64748b" stroke-dasharray="3 3"/>
<text x="320" y="218" text-anchor="middle" class="svg-muted" font-size="12">Checkpoint 1 aur 2 chupchaap fail; 3 aur 4 alerts ke saath fail</text>
</svg><p class="cap">Client se role tak ke raste mein chaar checkpoints. Checkpoint 1 aur 2 is module mein hain; 3 aur 4 pichhle modules mein the.</p></div>

<h3>Aage ke chapters</h3>
<ul>
<li><b>NAD onboarding</b> (chapter 2): network device entry kya hai aur kaunse fields matter karte hain.</li>
<li><b>Shared secrets</b> (chapter 3): secret kaise check hota hai aur mismatch kaisa dikhta hai. Lab: <code>cp-secret-mismatch</code>.</li>
<li><b>Source IP</b> (chapter 4): ClearPass NAD ko address se kyun pehchanta hai. Lab: <code>cp-nad-ip</code>.</li>
<li><b>Mixed-mode ports</b> (chapter 5): ek port design par laptops aur printers. Lab: <code>cp-mixed-port</code>.</li>
<li><b>Cluster, Active Directory, certificates, TACACS+ aur wireless</b> (chapters 6 se 9): real concepts, imaandaari se padhaaye gaye.</li>
<li><b>Troubleshooting workflow</b> (chapter 10) aur <b>summary</b> (chapter 11).</li>
</ul>

<div class="note"><p><b>Lab versus real product.</b> Labs ek original learning model par chalte hain, jo ClearPass-style policy server aur AOS-CX-style switch ka model hai. Yeh HPE Aruba software nahi hai. Real ClearPass Policy Manager web GUI mein Configuration ke neeche configure hota hai. Lab ek text shell use karta hai jiske commands GUI menu path ko mirror karte hain. Is module mein hum hamesha pehle real GUI path aur values dikhate hain, phir lab command ko <b>Lab shell</b> label ke saath. Jo cheez lab model nahi karta, uspar <b>not simulated in the lab</b> likha hai.</p></div>

<h3>Lab topology jo aap use karoge</h3>
<p>ACCESS 12-port switch hai (ports 1/1/1 se 1/1/12). Port 1/1/1 router R1 ka trunk hai. ClearPass (CPPM, 10.20.60.10) aur application server APP1 (10.20.70.20) R1 ke peeche hain. LAPTOP1 (user alice) 1/1/3 par, LAPTOP2 (user bob) 1/1/4 par aur printer PRN1 1/1/5 par hai. VLANs: 10 EMPLOYEE, 20 CONTRACTOR, 30 IOT, 40 GUEST, 50 QUARANTINE, 99 INFRA. VLAN 99 mein switch ka management address 10.20.99.2 hai, aur uski RADIUS requests isi address se aati hain. Har jagah shared secret ArubaNK1 hai.</p>

<div class="eg"><p><b>Worked example.</b> ACCESS se ek packet 10.20.60.10 ki taraf nikalta hai. R1 use VLAN 99 (10.20.99.0/24) aur server network (10.20.60.0/24) ke beech route karta hai. ClearPass ko packet source address 10.20.99.2 ke saath milta hai. Agar address 10.20.99.2 wala network device exist karta hai, to ClearPass uska secret use karke packet verify karta hai. Nahi hai to packet drop ho jaata hai. Hostname ACCESS is check mein kahin aata hi nahi.</p></div>

<div class="warn"><p><b>Common galti.</b> Trust kaam karne se pehle policy ka kaam shuru kar dena. Agar naya switch kisi ko authenticate nahi kar paata, to pehle roles ya profiles ko haath mat lagao. Event Viewer aur switch ka RADIUS server status check karo. Perfect policy theek karne se kuch nahi hota jab packet us tak pahunchta hi nahi.</p></div>

<div class="exam"><p><b>Exam trap.</b> "ClearPass ne Access-Reject return kiya" aur "ClearPass ne request drop kar di" alag hain. Reject ek reply hai (policy decision, Access Tracker mein dikhta hai). Drop khamoshi hai (plumbing fault, Event Viewer mein dikhta hai aur switch par dead server ki tarah).</p></div>

<div class="scn"><h4>Friday wala switch</h4><p>Ek contractor ne Friday shaam ko naya access switch lagaya. Monday tak us switch ke saare users ne shikayat ki. Policy team ne do ghante enforcement policies padhi; sab theek thi. Ek junior engineer ne aakhir mein Event Viewer kholkar dekha to baar baar messages the ki requests unregistered device se aa rahi hain. Switch management address ke naam se register tha, par RADIUS kisi doosre interface se source kar raha tha. Sahi address register karte hi ek minute mein sab theek ho gaya.</p><p><b>Seekh:</b> bahar se andar ki taraf kaam karo: reachability, device identity, secret, service, policy. Sabse andar wali layer se kabhi shuru mat karo.</p></div>

<div class="iv"><p class="q">"Ek naya switch kisi ko authenticate nahi kar paa raha. Aap kahan se shuru karoge?"</p><p>Strong answer: pehle prove karo ki packet pahunchta hai aur trusted hai. Switch ka RADIUS server status dekho, phir ClearPass Event Viewer mein unknown device ya secret problem dekho, aur uske baad hi Access Tracker. Batao ki unknown device aur wrong secret chupchaap silence dete hain jabki policy failures alerts dete hain, isliye jo log aap padhte ho woh batata hai ki kaunsi layer toot gayi hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Yeh module policy ke aas-paas ki plumbing cover karta hai: NADs, secrets, source IP, mixed-mode ports aur integration concepts.</li>
<li>ClearPass pehle packet ka source IP apne network devices se match karta hai, phir us device ka shared secret check karta hai.</li>
<li>Unknown device aur wrong secret par silent drop hota hai; switch server ko dead mark kar deta hai.</li>
<li>Policy failures loud hote hain (Access Tracker alerts); plumbing failures quiet (Event Viewer).</li>
<li>Cluster, AD, certificates, TACACS+ aur wireless real concepts ki tarah padhaaye gaye hain aur lab mein simulate nahi hote.</li>
</ul></div>
`}};export{e as default};