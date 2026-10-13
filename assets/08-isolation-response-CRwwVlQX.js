var e={id:`isolation-response`,h:{en:`Host isolation and the response workflow (Lab b, task 4)`,hi:`Host isolation aur response workflow (Lab b, task 4)`},body:{en:`
<p>When a patient arrives with a contagious disease, the hospital does not send them home and hope. It moves them to an isolation room: they cannot mix with other patients, but the doctors still have a door, a phone line and a window to keep treating and observing them. <b>Endpoint isolation</b> is that room. The infected computer is cut off from the network so it cannot spread or talk to its attacker, yet the security team keeps its connection to the computer to investigate and clean it.</p>

<h3>What isolation does</h3>
<ul>
<li>The connector applies a host-level block: the computer can no longer send or receive normal network traffic, on any interface, wherever it is (office, home or hotel).</li>
<li>Communication with the <b>Secure Endpoint cloud</b> stays open, so events, trajectory, Orbital queries and the "stop isolation" command still work.</li>
<li>An <b>isolation IP allow list</b> in the policy can keep a few destinations reachable, for example DNS and DHCP servers, or the forensic tool server your incident responders use.</li>
<li>The console records <b>Host Isolation Started</b> and later <b>Host Isolation Stopped</b> events. If the computer is offline when you isolate it, isolation applies when it reconnects.</li>
<li>An <b>unlock code</b> shown in the console lets a technician end isolation locally if the cloud cannot be reached.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Isolated host keeps only the cloud channel">
<rect x="250" y="90" width="140" height="56" rx="8" fill="#fed7aa"/><text x="320" y="114" text-anchor="middle" class="svg-ink" font-size="13">PC1 ISOLATED</text><text x="320" y="132" text-anchor="middle" class="svg-muted" font-size="12">10.10.0.11</text>
<rect x="470" y="20" width="150" height="44" rx="8" fill="#ddd6fe"/><text x="545" y="47" text-anchor="middle" class="svg-ink" font-size="13">Secure Endpoint cloud</text>
<rect x="470" y="170" width="150" height="44" rx="8" fill="#e2e8f0"/><text x="545" y="197" text-anchor="middle" class="svg-ink" font-size="13">INET 203.0.113.9</text>
<rect x="20" y="20" width="150" height="44" rx="8" fill="#e2e8f0"/><text x="95" y="47" text-anchor="middle" class="svg-ink" font-size="13">File server</text>
<rect x="20" y="170" width="150" height="44" rx="8" fill="#e2e8f0"/><text x="95" y="197" text-anchor="middle" class="svg-ink" font-size="13">Other PCs</text>
<line x1="390" y1="105" x2="470" y2="45" stroke="#64748b" stroke-width="2"/><text x="455" y="88" class="svg-accent" font-size="12">kept</text>
<line x1="390" y1="135" x2="470" y2="190" stroke="#64748b" stroke-dasharray="4 4"/><text x="420" y="180" class="svg-muted" font-size="12">blocked</text>
<line x1="250" y1="105" x2="170" y2="45" stroke="#64748b" stroke-dasharray="4 4"/><text x="200" y="88" class="svg-muted" font-size="12">blocked</text>
<line x1="250" y1="135" x2="170" y2="190" stroke="#64748b" stroke-dasharray="4 4"/><text x="200" y="180" class="svg-muted" font-size="12">blocked</text>
</svg><p class="cap">An isolated endpoint keeps only its management channel to the cloud (and any allow-listed addresses).</p></div>

<h3>Lab (b) walkthrough, task 4: isolate and verify</h3>
<pre class="code"><span class="c">! Secure Endpoint console on SEC-CLOUD</span>
Computers &gt; PC1 &gt; Isolate
<span class="c">! optional comment: "INC-9312 dropper NK-Dropper, contain for forensics"</span></pre>
<p>Verify from the endpoint side: PC1 can no longer reach the internet host.</p>
<pre class="out">PC1&gt; ping 203.0.113.9
<span class="hl">203.0.113.9 icmp_seq=1 timeout</span>
203.0.113.9 icmp_seq=2 timeout
203.0.113.9 icmp_seq=3 timeout
203.0.113.9 icmp_seq=4 timeout
203.0.113.9 icmp_seq=5 timeout

PC1&gt; secure-endpoint status
Cisco Secure Endpoint Connector 8.4.1
  Computer   : PC1
  Group      : Workstations
  Policy     : Protect (protect)
<span class="hl">  Isolation  : ISOLATED</span>
  Quarantined: 1 file(s)</pre>
<p>The Events tab shows <code>Host Isolation Started — Endpoint isolated from the network</code>. When forensics is finished, <b>Computers &gt; PC1 &gt; Stop Isolation</b> returns it to the network and logs <code>Host Isolation Stopped</code>.</p>

<h3>The response workflow around isolation</h3>
<p>Isolation is one step in an incident response process. A practical endpoint version, following the usual phases (preparation; detection and analysis; containment, eradication and recovery; post-incident activity):</p>
<ol>
<li><b>Detect and scope</b>: read the event, the disposition and the threat name; use file trajectory to see which other computers have the file.</li>
<li><b>Contain</b>: isolate affected hosts; add a Simple Custom Detection and IP block entries so nothing else runs or connects.</li>
<li><b>Investigate</b>: device trajectory on each host; Orbital queries for persistence (scheduled tasks, Run keys, services).</li>
<li><b>Eradicate</b>: confirm quarantines, remove persistence, reset credentials used on the host, or reimage.</li>
<li><b>Recover</b>: stop isolation, monitor closely, move the host back to its normal group if you used a Triage policy.</li>
<li><b>Learn</b>: why was it allowed? Fix the policy, allow list, patch or email rule that let it in.</li>
</ol>
<p>Other response actions you will see in the console: <b>restore from quarantine</b> for a confirmed false positive, moving a computer to a <b>Triage</b> group for stricter policy, and <b>full or flash scans</b>. In larger designs the same containment can be triggered from Cisco XDR automatically, and the network can contain a host too, for example ISE Rapid Threat Containment changing its authorization (covered in the integrations and ISE modules).</p>

<div class="eg"><p><b>Worked example.</b> At 10:14 an analyst sees Quarantine Success for a dropper on PC-HR (10.10.0.12) and a DFC block to 198.51.100.77 two minutes later, which means something is still running. 10:15 isolate PC-HR. 10:16 file trajectory shows the same hash on PC-FIN as Unknown yesterday; add a Simple Custom Detection, retrospection quarantines it. 10:20 Orbital query on PC-HR finds a scheduled task named <code>UpdaterSvc</code> launching the dropper's second stage. 10:40 task removed, user password reset, full scan clean. 11:00 stop isolation. Total exposure after detection: one minute of possible lateral movement.</p></div>

<div class="warn"><p><b>Common mistake.</b> Pulling the network cable or shutting down the infected machine. A shutdown destroys volatile evidence in memory, and a pulled cable also cuts the EDR channel, so you lose live investigation. Use isolation, which contains the host while keeping visibility.</p></div>

<div class="exam"><p><b>Exam trap.</b> Isolation does <b>not</b> remove malware and does not quarantine files; it contains the host. Quarantine acts on a file; isolation acts on the whole computer's network access. Questions that ask "stop the infected host from spreading while keeping the ability to investigate" want isolation.</p></div>

<div class="scn"><h4>Isolated at the airport</h4><p>A director's laptop raised a MAP event (rapid file renames) while she was at an airport lounge. The SOC isolated it from the console within a minute. Because isolation is enforced by the connector, it worked over the lounge Wi-Fi, where no corporate firewall or NAC existed. The connector stayed online to the cloud, the analysts confirmed the ransomware process had been stopped by MAP after renaming only 14 files, and released the laptop after a clean scan an hour later.</p><p><b>Lesson:</b> endpoint isolation works anywhere the endpoint is, unlike network-based containment.</p></div>

<div class="iv"><p class="q">"You confirmed malware on a laptop. Walk me through your first five minutes."</p><p>Strong answer: confirm the event and disposition, isolate the host from the console (not unplug it), check file trajectory for other hosts with the same SHA-256, add a Simple Custom Detection and IP block entries for its IOCs, then open device trajectory to find the parent process and persistence. Mention preserving evidence and that isolation keeps the cloud channel for investigation.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Isolation blocks the host's network traffic but keeps the connector-to-cloud channel.</li>
<li>Policy can allow-list a few addresses during isolation; an unlock code exists for offline release.</li>
<li>Lab (b) task 4: Computers → PC1 → Isolate; <code>ping 203.0.113.9</code> times out; status shows ISOLATED.</li>
<li>Response flow: detect and scope, contain, investigate, eradicate, recover, learn.</li>
<li>Quarantine acts on files; isolation acts on the whole host; neither replaces the other.</li>
</ul></div>
`,hi:`
<p>Jab koi patient contagious bimaari ke saath aata hai, hospital use ghar bhejkar umeed nahi karta. Use isolation room mein le jaata hai: woh doosre patients se mil nahi sakta, par doctors ke paas darwaza, phone line aur khidki rehti hai taaki ilaaj aur observation jaari rahe. <b>Endpoint isolation</b> wahi room hai. Infected computer network se kaat diya jaata hai taaki na phaile na apne attacker se baat kare, phir bhi security team computer se apna connection rakhti hai taaki investigate aur clean kar sake.</p>

<h3>Isolation kya karta hai</h3>
<ul>
<li>Connector host-level block lagata hai: computer kisi bhi interface par, kahin bhi ho (office, ghar ya hotel), normal network traffic na bhej sakta hai na receive kar sakta hai.</li>
<li><b>Secure Endpoint cloud</b> se communication khula rehta hai, isliye events, trajectory, Orbital queries aur "stop isolation" command kaam karte rehte hain.</li>
<li>Policy mein ek <b>isolation IP allow list</b> kuch destinations ko reachable rakh sakti hai, jaise DNS aur DHCP servers, ya woh forensic tool server jo aapke incident responders use karte hain.</li>
<li>Console <b>Host Isolation Started</b> aur baad mein <b>Host Isolation Stopped</b> events record karta hai. Agar isolate karte waqt computer offline hai, to reconnect hone par isolation lagta hai.</li>
<li>Console mein dikhne wala <b>unlock code</b> technician ko cloud reachable na hone par locally isolation khatam karne deta hai.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Isolated host sirf cloud channel rakhta hai">
<rect x="250" y="90" width="140" height="56" rx="8" fill="#fed7aa"/><text x="320" y="114" text-anchor="middle" class="svg-ink" font-size="13">PC1 ISOLATED</text><text x="320" y="132" text-anchor="middle" class="svg-muted" font-size="12">10.10.0.11</text>
<rect x="470" y="20" width="150" height="44" rx="8" fill="#ddd6fe"/><text x="545" y="47" text-anchor="middle" class="svg-ink" font-size="13">Secure Endpoint cloud</text>
<rect x="470" y="170" width="150" height="44" rx="8" fill="#e2e8f0"/><text x="545" y="197" text-anchor="middle" class="svg-ink" font-size="13">INET 203.0.113.9</text>
<rect x="20" y="20" width="150" height="44" rx="8" fill="#e2e8f0"/><text x="95" y="47" text-anchor="middle" class="svg-ink" font-size="13">File server</text>
<rect x="20" y="170" width="150" height="44" rx="8" fill="#e2e8f0"/><text x="95" y="197" text-anchor="middle" class="svg-ink" font-size="13">Doosre PCs</text>
<line x1="390" y1="105" x2="470" y2="45" stroke="#64748b" stroke-width="2"/><text x="455" y="88" class="svg-accent" font-size="12">khula</text>
<line x1="390" y1="135" x2="470" y2="190" stroke="#64748b" stroke-dasharray="4 4"/><text x="420" y="180" class="svg-muted" font-size="12">blocked</text>
<line x1="250" y1="105" x2="170" y2="45" stroke="#64748b" stroke-dasharray="4 4"/><text x="200" y="88" class="svg-muted" font-size="12">blocked</text>
<line x1="250" y1="135" x2="170" y2="190" stroke="#64748b" stroke-dasharray="4 4"/><text x="200" y="180" class="svg-muted" font-size="12">blocked</text>
</svg><p class="cap">Isolated endpoint sirf cloud tak apna management channel rakhta hai (aur koi allow-listed addresses).</p></div>

<h3>Lab (b) walkthrough, task 4: isolate aur verify</h3>
<pre class="code"><span class="c">! SEC-CLOUD par Secure Endpoint console</span>
Computers &gt; PC1 &gt; Isolate
<span class="c">! optional comment: "INC-9312 dropper NK-Dropper, forensics ke liye contain"</span></pre>
<p>Endpoint side se verify karo: PC1 ab internet host tak nahi pahunch sakta.</p>
<pre class="out">PC1&gt; ping 203.0.113.9
<span class="hl">203.0.113.9 icmp_seq=1 timeout</span>
203.0.113.9 icmp_seq=2 timeout
203.0.113.9 icmp_seq=3 timeout
203.0.113.9 icmp_seq=4 timeout
203.0.113.9 icmp_seq=5 timeout

PC1&gt; secure-endpoint status
Cisco Secure Endpoint Connector 8.4.1
  Computer   : PC1
  Group      : Workstations
  Policy     : Protect (protect)
<span class="hl">  Isolation  : ISOLATED</span>
  Quarantined: 1 file(s)</pre>
<p>Events tab <code>Host Isolation Started — Endpoint isolated from the network</code> dikhata hai. Forensics khatam hone par <b>Computers &gt; PC1 &gt; Stop Isolation</b> use network par wapas laata hai aur <code>Host Isolation Stopped</code> log karta hai.</p>

<h3>Isolation ke aas paas response workflow</h3>
<p>Isolation incident response process ka ek step hai. Ek practical endpoint version, usual phases ke hisaab se (preparation; detection aur analysis; containment, eradication aur recovery; post-incident activity):</p>
<ol>
<li><b>Detect aur scope</b>: event, disposition aur threat name padho; file trajectory se dekho ki kin doosre computers par file hai.</li>
<li><b>Contain</b>: affected hosts isolate karo; Simple Custom Detection aur IP block entries add karo taaki aur kuch na chale ya connect na ho.</li>
<li><b>Investigate</b>: har host par device trajectory; persistence ke liye Orbital queries (scheduled tasks, Run keys, services).</li>
<li><b>Eradicate</b>: quarantines confirm karo, persistence hatao, host par use hue credentials reset karo, ya reimage karo.</li>
<li><b>Recover</b>: isolation band karo, kareeb se monitor karo, agar Triage policy use ki thi to host ko uske normal group mein wapas le jao.</li>
<li><b>Learn</b>: yeh allow kyun hua? Woh policy, allow list, patch ya email rule fix karo jisne ise andar aane diya.</li>
</ol>
<p>Console mein dikhne wale doosre response actions: confirmed false positive ke liye <b>restore from quarantine</b>, stricter policy ke liye computer ko <b>Triage</b> group mein move karna, aur <b>full ya flash scans</b>. Bade designs mein yahi containment Cisco XDR se automatically trigger ho sakta hai, aur network bhi host ko contain kar sakta hai, jaise ISE Rapid Threat Containment uska authorization badalkar (integrations aur ISE modules mein cover).</p>

<div class="eg"><p><b>Worked example.</b> 10:14 par analyst PC-HR (10.10.0.12) par dropper ka Quarantine Success dekhta hai aur do minute baad 198.51.100.77 ki taraf DFC block, matlab kuch abhi bhi chal raha hai. 10:15 PC-HR isolate. 10:16 file trajectory dikhati hai ki same hash PC-FIN par kal Unknown tha; Simple Custom Detection add, retrospection use quarantine karta hai. 10:20 PC-HR par Orbital query <code>UpdaterSvc</code> naam ka scheduled task dhoondhti hai jo dropper ka second stage launch karta hai. 10:40 task hataya, user password reset, full scan clean. 11:00 isolation band. Detection ke baad total exposure: possible lateral movement ka ek minute.</p></div>

<div class="warn"><p><b>Common galti.</b> Infected machine ka network cable kheench dena ya use shut down kar dena. Shutdown memory mein volatile evidence mita deta hai, aur cable nikalne se EDR channel bhi kat jaata hai, to live investigation kho jaati hai. Isolation use karo, jo visibility rakhte hue host ko contain karta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Isolation malware <b>nahi</b> hataata aur files quarantine nahi karta; yeh host ko contain karta hai. Quarantine file par act karta hai; isolation poore computer ke network access par. Jo questions poochte hain "infected host ko phailne se roko par investigate karne ki ability rakho", unhe isolation chahiye.</p></div>

<div class="scn"><h4>Airport par isolated</h4><p>Ek director ke laptop ne airport lounge mein MAP event (tez file renames) uthaya. SOC ne ek minute mein console se use isolate kar diya. Kyunki isolation connector enforce karta hai, yeh lounge Wi-Fi par bhi kaam kiya, jahan koi corporate firewall ya NAC nahi tha. Connector cloud se online raha, analysts ne confirm kiya ki MAP ne sirf 14 files rename hone ke baad ransomware process rok diya tha, aur ek ghante baad clean scan ke baad laptop release kiya.</p><p><b>Seekh:</b> endpoint isolation wahan kaam karta hai jahan endpoint ho, network-based containment ke ulat.</p></div>

<div class="iv"><p class="q">"Aapne laptop par malware confirm kiya. Apne pehle paanch minute batao."</p><p>Strong answer: event aur disposition confirm karo, host ko console se isolate karo (unplug nahi), same SHA-256 wale doosre hosts ke liye file trajectory check karo, uske IOCs ke liye Simple Custom Detection aur IP block entries add karo, phir parent process aur persistence dhoondhne ke liye device trajectory kholo. Evidence preserve karna mention karo aur yeh ki isolation investigation ke liye cloud channel rakhta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Isolation host ka network traffic block karta hai par connector-to-cloud channel rakhta hai.</li>
<li>Policy isolation ke dauraan kuch addresses allow-list kar sakti hai; offline release ke liye unlock code hai.</li>
<li>Lab (b) task 4: Computers → PC1 → Isolate; <code>ping 203.0.113.9</code> timeout; status ISOLATED dikhata hai.</li>
<li>Response flow: detect aur scope, contain, investigate, eradicate, recover, learn.</li>
<li>Quarantine files par act karta hai; isolation poore host par; koi ek doosre ki jagah nahi leta.</li>
</ul></div>
`}};export{e as default};