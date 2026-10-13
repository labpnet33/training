var e={id:`portfolio`,h:{en:`The Cisco security portfolio map, and how this track's labs work`,hi:`Cisco security portfolio ka map, aur is track ke labs kaise kaam karte hain`},body:{en:`
<p>When you join a new hospital as a doctor, the first week is about learning where everything is: the emergency room, the lab, the pharmacy, the records office, and which machine does what. Cisco security has many products, several of which were renamed in recent years, and exam questions use the current names. This chapter is your floor plan: each product, its old name, the layer it serves (from chapter 6) and the module where you will operate it.</p>

<h3>Firewalls and their managers</h3>
<dl class="terms">
<dt>Cisco Secure Firewall ASA</dt><dd>The Adaptive Security Appliance: stateful firewall, NAT, site-to-site and remote access VPN, failover and clustering. Managed by CLI or the ASDM GUI. Four ASA modules in this track.</dd>
<dt>Cisco Secure Firewall Threat Defense (FTD)</dt><dd>Cisco's NGFW software (formerly Firepower Threat Defense): access control, application and URL control, Snort 3 IPS, file and malware policy, Security Intelligence, decryption, VPN. Runs on Secure Firewall hardware, as a virtual appliance and in public clouds.</dd>
<dt>Secure Firewall Management Center (FMC)</dt><dd>The central manager for many Threat Defense devices (formerly Firepower Management Center): policies, objects, deploy, events and reports. Most SNCF questions happen here.</dd>
<dt>Device Manager (FDM) and Security Cloud Control</dt><dd>FDM is the on-box GUI for a single Threat Defense. Security Cloud Control (formerly CDO) is the cloud management platform, including a cloud-delivered FMC.</dd>
</dl>
<p>You register a Threat Defense device to its manager from the device CLI, then finish in the FMC GUI:</p>
<pre class="code"><span class="c">! On the Threat Defense CLI: point the device at its Management Center</span>
&gt; configure manager add 10.1.99.40 NkSimRegKey1</pre>
<pre class="out">&gt; show managers
Type                      : Manager
Host                      : 10.1.99.40
Display name              : 10.1.99.40
<span class="hl">Registration              : Completed</span>
Management type           : Configuration and analytics</pre>
<p>"Pending" instead of "Completed" usually means the device has not yet been added in FMC with the same registration key, or TCP 8305 between them is blocked.</p>

<h3>Identity, access and endpoints</h3>
<dl class="terms">
<dt>Cisco ISE</dt><dd>Identity Services Engine: RADIUS and TACACS+ server, 802.1X and MAB policy, profiling, posture, guest, TrustSec, and <b>pxGrid</b> to share user and device context with other products.</dd>
<dt>Cisco Duo</dt><dd>MFA, device trust and SSO for applications and VPN.</dd>
<dt>Cisco Secure Client</dt><dd>The endpoint agent formerly called AnyConnect: remote access VPN plus modules for posture, zero trust access, roaming DNS protection and network visibility.</dd>
<dt>Cisco Secure Endpoint</dt><dd>EPP and EDR (formerly AMP for Endpoints): file reputation, behaviour protection, device trajectory, isolation and outbreak control.</dd>
</dl>

<h3>Cloud-delivered security and content</h3>
<dl class="terms">
<dt>Cisco Secure Access</dt><dd>Cisco's SSE: DNS-layer security, secure web gateway, CASB, DLP, ZTNA, firewall as a service and AI guardrails, built on the Umbrella cloud.</dd>
<dt>Cisco Umbrella</dt><dd>DNS-layer security and secure internet gateway; its DNS protection is part of Secure Access today.</dd>
<dt>Secure Email Gateway, Secure Email Threat Defense</dt><dd>On-premises or cloud email security (formerly ESA), and API-based protection for cloud mailboxes.</dd>
<dt>Secure Web Appliance</dt><dd>The web proxy formerly called WSA.</dd>
</dl>

<h3>Visibility, intelligence and response</h3>
<dl class="terms">
<dt>Cisco Talos</dt><dd>One of the largest commercial threat intelligence teams. Talos research feeds the IPS rules, Security Intelligence lists, file reputation and URL categories used by the other products.</dd>
<dt>Cisco XDR</dt><dd>Correlates detections from endpoint, network, email, identity and cloud into incidents, with response actions such as isolate host or block domain.</dd>
<dt>Splunk</dt><dd>SIEM and analytics platform, part of Cisco since 2024; Splunk Enterprise Security for SOC use cases, SOAR for automation.</dd>
<dt>Secure Network Analytics</dt><dd>Flow-based behaviour analytics (formerly Stealthwatch).</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Cisco products mapped to the stack">
<rect x="10" y="10" width="200" height="44" rx="8" fill="#fed7aa"/><text x="110" y="37" text-anchor="middle" class="svg-ink" font-size="13">Edge: ASA, Threat Defense</text>
<rect x="220" y="10" width="200" height="44" rx="8" fill="#bbf7d0"/><text x="320" y="37" text-anchor="middle" class="svg-ink" font-size="13">Cloud: Secure Access</text>
<rect x="430" y="10" width="200" height="44" rx="8" fill="#fde68a"/><text x="530" y="37" text-anchor="middle" class="svg-ink" font-size="13">Email: Secure Email</text>
<rect x="10" y="66" width="200" height="44" rx="8" fill="#ddd6fe"/><text x="110" y="93" text-anchor="middle" class="svg-ink" font-size="13">Access: ISE, 802.1X</text>
<rect x="220" y="66" width="200" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="93" text-anchor="middle" class="svg-ink" font-size="13">Identity: Duo</text>
<rect x="430" y="66" width="200" height="44" rx="8" fill="#bae6fd"/><text x="530" y="93" text-anchor="middle" class="svg-ink" font-size="13">Endpoint: Secure Endpoint</text>
<rect x="10" y="122" width="620" height="44" rx="8" fill="#e2e8f0"/><text x="320" y="149" text-anchor="middle" class="svg-ink" font-size="13">Management: FMC, FDM, Security Cloud Control, ASDM</text>
<rect x="10" y="178" width="400" height="44" rx="8" fill="#fde68a"/><text x="210" y="205" text-anchor="middle" class="svg-ink" font-size="13">SOC: XDR, Splunk, Secure Network Analytics</text>
<rect x="420" y="178" width="210" height="44" rx="8" fill="#bbf7d0"/><text x="525" y="205" text-anchor="middle" class="svg-ink" font-size="13">Talos feeds them all</text>
</svg><p class="cap">The portfolio on one page. pxGrid and APIs connect the boxes so one product can act on another's findings.</p></div>

<h3>Integration is the point</h3>
<p>The products become much stronger together. Examples you will build: ISE shares the user name behind an IP with Threat Defense over <b>pxGrid</b>, so firewall rules can name AD groups; Threat Defense detects malware and asks ISE to quarantine the host (<b>Rapid Threat Containment</b>); Secure Endpoint and Secure Access send detections to XDR, which isolates the host and blocks the domain in one incident; firewall events stream to Splunk. SCOR topic 1.10 also asks you to read simple scripts that call these products' REST APIs.</p>

<h3>How the labs in this track work</h3>
<p>The labs run in your browser on <b>simulated consoles</b>: an ASA and Threat Defense CLI, an FMC-style GUI with policies and a Deploy button, and consoles modelled on ISE, Secure Access, Secure Endpoint, Duo, XDR and Splunk. They behave like the real products for everything the exam and the job need: show commands, packet-tracer, connection tables, deploy workflow, event views and searches. Each lab has a kind: <b>C</b> configure (build something from a task list), <b>T</b> troubleshoot (a ticket with a hidden fault), <b>N</b> NOC ticket (an operations scenario with evidence to read) and <b>P</b> packet capture.</p>
<p>All threats are simulated. Malicious domains use the reserved <code>.example</code> suffix (for example cdn-stats.example), addresses come from the documentation ranges, and fake payloads carry an <code>nk-sim</code> marker such as <code>cdn-stats.example/nk-sim/beacon</code>. Nothing harmful ever runs, which is exactly why you can safely practise blocking, detecting and containing.</p>

<div class="eg"><p><b>Worked example.</b> In the Threat Defense IPS module, the "Security Intelligence and a DNS sinkhole" lab starts with threat intelligence: a C2 server at 192.0.2.66 using update-check.badsite.example, still reachable from PC1. You set the Talos Security Intelligence feeds to Block, add a DNS policy with a sinkhole (192.0.2.254), deploy from the FMC-style GUI, then resolve the domain again from PC1 and see the sinkhole answer. Finally you open Analysis, Security Intelligence and find which inside host contacted the sinkhole. Same steps, same screens as a real deployment.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Using old names in interviews without the new ones (say "Secure Endpoint, formerly AMP"). Thinking FDM and FMC can manage the same device at the same time. Assuming ASA and Threat Defense share a configuration syntax; they share ideas, not commands.</p></div>

<div class="exam"><p><b>Exam trap.</b> Snort 3 is the Threat Defense inspection engine. pxGrid is ISE's context-sharing bus. Talos is intelligence, not a product you deploy. Secure Client is the endpoint agent; Secure Access is the cloud SSE service.</p></div>

<div class="scn"><h4>The quarantine that needed two products</h4><p>A hospital's Threat Defense repeatedly detected malware downloads from one workstation, but the SOC could only block each download. They integrated FMC with ISE through pxGrid and enabled Rapid Threat Containment: the next detection triggered an ISE Adaptive Network Control quarantine, the switch received a Change of Authorization and moved the port into a remediation VLAN, and the host was cleaned before it could reach the patient records system.</p><p><b>Lesson:</b> detection in one product plus enforcement in another beats either one alone.</p></div>

<div class="iv"><p class="q">"Which Cisco security products have you worked with, and how do they fit together?"</p><p>Strong answer: organise by layer, not by list. Edge: ASA and Threat Defense managed by FMC. Cloud: Secure Access for DNS, web and ZTNA. Endpoint: Secure Endpoint and Secure Client. Identity: ISE and Duo. SOC: XDR and Splunk, all fed by Talos. Then give one integration you have configured, such as pxGrid with Rapid Threat Containment, and be honest about lab versus production experience.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ASA (stateful, VPN) and Threat Defense (NGFW with Snort 3) managed by FMC, FDM or Security Cloud Control.</li>
<li>ISE for access and context (pxGrid), Duo for MFA, Secure Client and Secure Endpoint on the host.</li>
<li>Secure Access is Cisco's SSE; Talos intelligence feeds all products; XDR and Splunk serve the SOC.</li>
<li>Integration (pxGrid, Rapid Threat Containment, XDR) is where the value is.</li>
<li>Labs use simulated consoles and harmless nk-sim threats on .example domains; kinds C, T, N, P.</li>
</ul></div>
`,hi:`
<p>Jab aap doctor ke roop mein naye hospital join karte ho, pehla hafta yeh seekhne mein jaata hai ki kya kahan hai: emergency room, lab, pharmacy, records office, aur kaunsi machine kya karti hai. Cisco security ke bahut saare products hain, jinmein se kai ke naam haal ke saalon mein badle, aur exam questions current naam use karte hain. Yeh chapter aapka floor plan hai: har product, uska purana naam, woh kis layer ko serve karta hai (chapter 6 se) aur woh module jahan aap use chalaoge.</p>

<h3>Firewalls aur unke managers</h3>
<dl class="terms">
<dt>Cisco Secure Firewall ASA</dt><dd>Adaptive Security Appliance: stateful firewall, NAT, site-to-site aur remote access VPN, failover aur clustering. CLI ya ASDM GUI se managed. Is track mein chaar ASA modules.</dd>
<dt>Cisco Secure Firewall Threat Defense (FTD)</dt><dd>Cisco ka NGFW software (pehle Firepower Threat Defense): access control, application aur URL control, Snort 3 IPS, file aur malware policy, Security Intelligence, decryption, VPN. Secure Firewall hardware par, virtual appliance ki tarah aur public clouds mein chalta hai.</dd>
<dt>Secure Firewall Management Center (FMC)</dt><dd>Bahut saare Threat Defense devices ka central manager (pehle Firepower Management Center): policies, objects, deploy, events aur reports. Zyada tar SNCF questions yahin hote hain.</dd>
<dt>Device Manager (FDM) aur Security Cloud Control</dt><dd>FDM ek Threat Defense ka on-box GUI hai. Security Cloud Control (pehle CDO) cloud management platform hai, jismein cloud-delivered FMC bhi hai.</dd>
</dl>
<p>Aap Threat Defense device ko uske manager par device CLI se register karte ho, phir FMC GUI mein poora karte ho:</p>
<pre class="code"><span class="c">! Threat Defense CLI par: device ko uske Management Center ki taraf point karo</span>
&gt; configure manager add 10.1.99.40 NkSimRegKey1</pre>
<pre class="out">&gt; show managers
Type                      : Manager
Host                      : 10.1.99.40
Display name              : 10.1.99.40
<span class="hl">Registration              : Completed</span>
Management type           : Configuration and analytics</pre>
<p>"Completed" ki jagah "Pending" ka aam taur par matlab hai ki device ko abhi FMC mein same registration key ke saath add nahi kiya gaya, ya unke beech TCP 8305 blocked hai.</p>

<h3>Identity, access aur endpoints</h3>
<dl class="terms">
<dt>Cisco ISE</dt><dd>Identity Services Engine: RADIUS aur TACACS+ server, 802.1X aur MAB policy, profiling, posture, guest, TrustSec, aur doosre products ke saath user aur device context share karne ke liye <b>pxGrid</b>.</dd>
<dt>Cisco Duo</dt><dd>Applications aur VPN ke liye MFA, device trust aur SSO.</dd>
<dt>Cisco Secure Client</dt><dd>Endpoint agent jise pehle AnyConnect kehte the: remote access VPN plus posture, zero trust access, roaming DNS protection aur network visibility ke modules.</dd>
<dt>Cisco Secure Endpoint</dt><dd>EPP aur EDR (pehle AMP for Endpoints): file reputation, behaviour protection, device trajectory, isolation aur outbreak control.</dd>
</dl>

<h3>Cloud-delivered security aur content</h3>
<dl class="terms">
<dt>Cisco Secure Access</dt><dd>Cisco ka SSE: DNS-layer security, secure web gateway, CASB, DLP, ZTNA, firewall as a service aur AI guardrails, Umbrella cloud par bana.</dd>
<dt>Cisco Umbrella</dt><dd>DNS-layer security aur secure internet gateway; iski DNS protection aaj Secure Access ka hissa hai.</dd>
<dt>Secure Email Gateway, Secure Email Threat Defense</dt><dd>On-premises ya cloud email security (pehle ESA), aur cloud mailboxes ke liye API-based protection.</dd>
<dt>Secure Web Appliance</dt><dd>Web proxy jise pehle WSA kehte the.</dd>
</dl>

<h3>Visibility, intelligence aur response</h3>
<dl class="terms">
<dt>Cisco Talos</dt><dd>Sabse badi commercial threat intelligence teams mein se ek. Talos ki research doosre products ke IPS rules, Security Intelligence lists, file reputation aur URL categories ko feed karti hai.</dd>
<dt>Cisco XDR</dt><dd>Endpoint, network, email, identity aur cloud ke detections ko incidents mein correlate karta hai, response actions ke saath jaise host isolate ya domain block.</dd>
<dt>Splunk</dt><dd>SIEM aur analytics platform, 2024 se Cisco ka hissa; SOC use cases ke liye Splunk Enterprise Security, automation ke liye SOAR.</dd>
<dt>Secure Network Analytics</dt><dd>Flow-based behaviour analytics (pehle Stealthwatch).</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Cisco products stack par mapped">
<rect x="10" y="10" width="200" height="44" rx="8" fill="#fed7aa"/><text x="110" y="37" text-anchor="middle" class="svg-ink" font-size="13">Edge: ASA, Threat Defense</text>
<rect x="220" y="10" width="200" height="44" rx="8" fill="#bbf7d0"/><text x="320" y="37" text-anchor="middle" class="svg-ink" font-size="13">Cloud: Secure Access</text>
<rect x="430" y="10" width="200" height="44" rx="8" fill="#fde68a"/><text x="530" y="37" text-anchor="middle" class="svg-ink" font-size="13">Email: Secure Email</text>
<rect x="10" y="66" width="200" height="44" rx="8" fill="#ddd6fe"/><text x="110" y="93" text-anchor="middle" class="svg-ink" font-size="13">Access: ISE, 802.1X</text>
<rect x="220" y="66" width="200" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="93" text-anchor="middle" class="svg-ink" font-size="13">Identity: Duo</text>
<rect x="430" y="66" width="200" height="44" rx="8" fill="#bae6fd"/><text x="530" y="93" text-anchor="middle" class="svg-ink" font-size="13">Endpoint: Secure Endpoint</text>
<rect x="10" y="122" width="620" height="44" rx="8" fill="#e2e8f0"/><text x="320" y="149" text-anchor="middle" class="svg-ink" font-size="13">Management: FMC, FDM, Security Cloud Control, ASDM</text>
<rect x="10" y="178" width="400" height="44" rx="8" fill="#fde68a"/><text x="210" y="205" text-anchor="middle" class="svg-ink" font-size="13">SOC: XDR, Splunk, Secure Network Analytics</text>
<rect x="420" y="178" width="210" height="44" rx="8" fill="#bbf7d0"/><text x="525" y="205" text-anchor="middle" class="svg-ink" font-size="13">Talos sabko feed karta hai</text>
</svg><p class="cap">Portfolio ek page par. pxGrid aur APIs boxes ko jodte hain taaki ek product doosre ki findings par act kar sake.</p></div>

<h3>Integration hi asli baat hai</h3>
<p>Products saath mein bahut zyada mazboot ho jaate hain. Examples jo aap banaoge: ISE <b>pxGrid</b> par Threat Defense ke saath IP ke peeche ka user name share karta hai, taaki firewall rules AD groups ka naam le sakein; Threat Defense malware detect karta hai aur ISE se host quarantine karne ko kehta hai (<b>Rapid Threat Containment</b>); Secure Endpoint aur Secure Access detections XDR ko bhejte hain, jo ek incident mein host isolate aur domain block karta hai; firewall events Splunk mein stream hote hain. SCOR topic 1.10 aapse in products ke REST APIs call karne wale simple scripts padhne ko bhi kehta hai.</p>

<h3>Is track ke labs kaise kaam karte hain</h3>
<p>Labs aapke browser mein <b>simulated consoles</b> par chalte hain: ASA aur Threat Defense CLI, policies aur Deploy button wala FMC-style GUI, aur ISE, Secure Access, Secure Endpoint, Duo, XDR aur Splunk par modelled consoles. Yeh exam aur job ko jo chahiye un sab ke liye real products ki tarah behave karte hain: show commands, packet-tracer, connection tables, deploy workflow, event views aur searches. Har lab ka ek kind hai: <b>C</b> configure (task list se kuch banao), <b>T</b> troubleshoot (chhupe fault wala ticket), <b>N</b> NOC ticket (padhne ke liye evidence wala operations scenario) aur <b>P</b> packet capture.</p>
<p>Saare threats simulated hain. Malicious domains reserved <code>.example</code> suffix use karte hain (jaise cdn-stats.example), addresses documentation ranges se aate hain, aur fake payloads mein <code>nk-sim</code> marker hota hai jaise <code>cdn-stats.example/nk-sim/beacon</code>. Kuch bhi harmful kabhi nahi chalta, aur isiliye aap safely blocking, detecting aur containing practise kar sakte ho.</p>

<div class="eg"><p><b>Worked example.</b> Threat Defense IPS module mein "Security Intelligence and a DNS sinkhole" lab threat intelligence se shuru hota hai: 192.0.2.66 par ek C2 server jo update-check.badsite.example use karta hai, aur PC1 se abhi bhi reachable hai. Aap Talos Security Intelligence feeds ko Block karte ho, sinkhole (192.0.2.254) wali DNS policy jodte ho, FMC-style GUI se deploy karte ho, phir PC1 se domain dobara resolve karke sinkhole ka jawab dekhte ho. Aakhir mein aap Analysis, Security Intelligence kholte ho aur dhoondte ho ki kis inside host ne sinkhole se contact kiya. Real deployment jaise hi steps, wahi screens.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Interviews mein naye naamon ke bina purane naam use karna (kaho "Secure Endpoint, pehle AMP"). Yeh sochna ki FDM aur FMC ek hi device ko ek saath manage kar sakte hain. Yeh maan lena ki ASA aur Threat Defense ka configuration syntax same hai; woh ideas share karte hain, commands nahi.</p></div>

<div class="exam"><p><b>Exam trap.</b> Snort 3 Threat Defense ka inspection engine hai. pxGrid ISE ka context-sharing bus hai. Talos intelligence hai, deploy karne wala product nahi. Secure Client endpoint agent hai; Secure Access cloud SSE service hai.</p></div>

<div class="scn"><h4>Quarantine jise do products chahiye the</h4><p>Ek hospital ka Threat Defense ek workstation se baar baar malware downloads detect karta tha, lekin SOC sirf har download block kar pata tha. Unhone pxGrid ke through FMC ko ISE se integrate kiya aur Rapid Threat Containment enable kiya: agle detection ne ISE Adaptive Network Control quarantine trigger kiya, switch ko Change of Authorization mila aur port remediation VLAN mein chala gaya, aur host patient records system tak pahunchne se pehle clean ho gaya.</p><p><b>Seekh:</b> ek product mein detection plus doosre mein enforcement, dono mein se kisi akele se behtar hai.</p></div>

<div class="iv"><p class="q">"Aapne kaunse Cisco security products ke saath kaam kiya hai, aur woh aapas mein kaise fit hote hain?"</p><p>Strong answer: list se nahi, layer se organise karo. Edge: FMC se managed ASA aur Threat Defense. Cloud: DNS, web aur ZTNA ke liye Secure Access. Endpoint: Secure Endpoint aur Secure Client. Identity: ISE aur Duo. SOC: XDR aur Splunk, sab Talos se fed. Phir ek integration batao jo aapne configure kiya ho, jaise Rapid Threat Containment ke saath pxGrid, aur lab versus production experience ke baare mein imaandaar raho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ASA (stateful, VPN) aur Threat Defense (Snort 3 wala NGFW) FMC, FDM ya Security Cloud Control se managed.</li>
<li>Access aur context (pxGrid) ke liye ISE, MFA ke liye Duo, host par Secure Client aur Secure Endpoint.</li>
<li>Secure Access Cisco ka SSE hai; Talos intelligence sab products ko feed karti hai; XDR aur Splunk SOC ko serve karte hain.</li>
<li>Value integration (pxGrid, Rapid Threat Containment, XDR) mein hai.</li>
<li>Labs simulated consoles aur .example domains par harmless nk-sim threats use karte hain; kinds C, T, N, P.</li>
</ul></div>
`}};export{e as default};