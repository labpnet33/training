var e={id:`privacy-legal-performance`,h:{en:`Privacy, legal and performance trade-offs`,hi:`Privacy, legal aur performance trade-offs`},body:{en:`
<p>Technically, deep inspection is a few lines of configuration. Organisationally, it is a decision about trust. This chapter covers what a responsible administrator must settle <b>before</b> the first packet is decrypted, and what it costs afterwards.</p>

<h3>Consent and legal basis</h3>
<p>Decrypting staff traffic means the company can read personal communications that happen to cross a work network. Laws differ between countries and sectors, and this module is not legal advice, so involve your legal and HR teams. The questions to answer are consistent:</p>
<ul>
<li><b>Notice and consent.</b> Is there a written acceptable-use policy that says encrypted traffic is inspected on company networks and devices, and have employees acknowledged it? Is there a login banner or onboarding notice?</li>
<li><b>Purpose limitation.</b> Inspection is for security (malware, data-leak prevention, policy), not for reading private life or monitoring individuals without a separate, authorised process.</li>
<li><b>Data protection law.</b> Where laws such as India's Digital Personal Data Protection Act or the EU's GDPR apply, define the lawful basis, retention and who may access logs.</li>
<li><b>Sensitive categories.</b> Exempt banking, healthcare, and similar categories (chapter 6), and in some places also union, legal-advice or personal-communication categories.</li>
<li><b>Guests and personal devices.</b> Do not deep inspect devices you do not manage and whose owners have not agreed; use certificate inspection and a clear guest notice.</li>
<li><b>Regulated sectors.</b> Finance, health and government networks may have specific rules about interception and logging.</li>
</ul>

<h3>Governance of the decrypted data</h3>
<ul>
<li>Restrict who can read UTM logs that contain URLs, file names and user identities. Use role-based admin accounts.</li>
<li>Set retention periods and delete on schedule.</li>
<li>Do not store decrypted payloads; most logs hold metadata, not content. Think before enabling packet capture features.</li>
<li>Protect the inspection CA key and configuration backups (chapter 5).</li>
<li>Audit changes to the SSL/SSH profile and exemptions; compare against an approved baseline.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Governance chain">
<rect x="20" y="25" width="102" height="70" rx="10" fill="#bae6fd"/><text x="71" y="54" text-anchor="middle" class="svg-ink" font-size="10.5">Policy</text><text x="71" y="72" text-anchor="middle" class="svg-muted" font-size="9.5">written and signed</text><line x1="122" y1="60" x2="144" y2="60" stroke="#64748b" stroke-width="2"/><path d="M138 55 L144 60 L138 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="144" y="25" width="102" height="70" rx="10" fill="#bbf7d0"/><text x="195" y="54" text-anchor="middle" class="svg-ink" font-size="10.5">Notice</text><text x="195" y="72" text-anchor="middle" class="svg-muted" font-size="9.5">users informed</text><line x1="246" y1="60" x2="268" y2="60" stroke="#64748b" stroke-width="2"/><path d="M262 55 L268 60 L262 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="268" y="25" width="102" height="70" rx="10" fill="#ddd6fe"/><text x="319" y="54" text-anchor="middle" class="svg-ink" font-size="10.5">Scope</text><text x="319" y="72" text-anchor="middle" class="svg-muted" font-size="9.5">exempt sensitive</text><line x1="370" y1="60" x2="392" y2="60" stroke="#64748b" stroke-width="2"/><path d="M386 55 L392 60 L386 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="392" y="25" width="102" height="70" rx="10" fill="#fde68a"/><text x="443" y="54" text-anchor="middle" class="svg-ink" font-size="10.5">Controls</text><text x="443" y="72" text-anchor="middle" class="svg-muted" font-size="9.5">access, retention</text><line x1="494" y1="60" x2="516" y2="60" stroke="#64748b" stroke-width="2"/><path d="M510 55 L516 60 L510 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="516" y="25" width="102" height="70" rx="10" fill="#fed7aa"/><text x="567" y="54" text-anchor="middle" class="svg-ink" font-size="10.5">Review</text><text x="567" y="72" text-anchor="middle" class="svg-muted" font-size="9.5">audit regularly</text>
</svg><p class="cap">Responsible deep inspection is a governance chain, not just a profile.</p></div>

<h3>Performance: what decrypting costs</h3>
<p>Deep inspection makes the FortiGate do public-key cryptography, symmetric encryption twice and full content inspection. Throughput numbers on datasheets are usually quoted separately for firewall-only, IPS, threat protection and <b>SSL inspection</b> workloads; the SSL inspection figure is the one to size against. Factors that raise cost:</p>
<ul>
<li>Many short TLS sessions (every new session needs a handshake).</li>
<li>TLS 1.3 and strong ciphers, especially without hardware acceleration.</li>
<li>Large downloads that must be scanned.</li>
<li>Proxy-based inspection, which buffers more data.</li>
<li>Many security engines running on the same decrypted flow.</li>
</ul>
<p>Mitigations: inspect only what you need (policies by user group, exemptions for bulk low-risk categories such as video streaming), use certificate inspection for guests, pick hardware with crypto offload, size with the SSL inspection throughput, and monitor CPU, memory and session setup rate before and after.</p>

<table class="cmp"><tr><th>Concern</th><th>Typical control</th></tr>
<tr><td>Privacy</td><td>Exempt sensitive categories; log access to logs</td></tr>
<tr><td>Legal</td><td>Policy, notice, consent, counsel review</td></tr>
<tr><td>Security of the CA</td><td>Subordinate CA, access control, expiry tracking</td></tr>
<tr><td>Compatibility</td><td>Pilot, exemptions for pinned apps</td></tr>
<tr><td>Performance</td><td>Scope, hardware sizing, monitoring</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Network Kings Pune has 120 staff and 40 Mbit/s typical web traffic at peak, but a FortiGate rated for far more firewall throughput than SSL inspection throughput. The team decides: deep inspection for the staff policy only, certificate inspection for guests, exemption for streaming video and for banking and health, a documented policy approved by HR and legal, and a quarterly review. CPU is monitored for two weeks after go-live.</p></div>

<div class="warn"><p><b>Common mistake.</b> Treating deep inspection as a purely technical project and asking legal only after the first complaint. By then you may have inspected personal data with no documented basis.</p></div>
<div class="exam"><p><b>Exam trap.</b> Datasheet SSL inspection throughput is lower than firewall throughput; size to the figure for the features you will actually enable. Exempt categories reduce privacy risk and CPU load together.</p></div>

<div class="scn"><h4>The complaint that started in the canteen</h4><p>Staff discovered, from a certificate warning on a personal phone, that the company could read secure browsing. Trust dropped until management explained in a town hall: managed laptops only, banking and health excluded, access to logs limited to the security team, and the policy was in the employment handbook. The warning on the phone came from a guest policy mistake that the team then fixed.</p><p><b>Lesson:</b> transparency and scope limits are what make deep inspection acceptable.</p></div>

<div class="iv"><p class="q">"What are the risks of enabling SSL deep inspection?"</p><p>Privacy and legal exposure if consent and exemptions are not in place; a powerful CA key that must be protected; application breakage from certificate pinning and client certificates; and CPU cost that needs sizing. I mitigate with written policy and notice, exemptions for banking and health, careful CA distribution, a pilot, and monitoring.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Get policy, notice and legal review before decrypting anything.</li>
<li>Exempt sensitive categories; limit who can read logs and for how long.</li>
<li>Do not deep inspect unmanaged or guest devices.</li>
<li>Size hardware to the SSL inspection throughput figure.</li>
<li>Scope inspection to reduce risk, load and complaints together.</li>
</ul></div>
`,hi:`
<p>Technically deep inspection kuch lines ki configuration hai. Organisation ke level par yeh trust ka decision hai. Yeh chapter batata hai ki responsible administrator ko pehla packet decrypt hone se <b>pehle</b> kya tay karna chahiye, aur baad mein iski kya keemat hai.</p>

<h3>Consent aur legal basis</h3>
<p>Staff traffic decrypt karne ka matlab hai ki company un personal communications ko padh sakti hai jo work network se guzarte hain. Law desh aur sector ke hisaab se alag hote hain, aur yeh module legal advice nahi hai, isliye legal aur HR teams ko involve karo. Jin sawaalon ke jawab chahiye woh consistent hain:</p>
<ul>
<li><b>Notice aur consent.</b> Kya written acceptable-use policy hai jo kehti hai ki company networks aur devices par encrypted traffic inspect hota hai, aur kya employees ne acknowledge kiya? Login banner ya onboarding notice hai?</li>
<li><b>Purpose limitation.</b> Inspection security ke liye hai (malware, data-leak prevention, policy), private life padhne ya alag authorised process ke bina individuals monitor karne ke liye nahi.</li>
<li><b>Data protection law.</b> Jahan India ka Digital Personal Data Protection Act ya EU ka GDPR jaise law lagu hon, lawful basis, retention aur logs kaun access kare yeh define karo.</li>
<li><b>Sensitive categories.</b> Banking, healthcare aur aisi categories exempt karo (chapter 6), aur kuch jagah union, legal-advice ya personal-communication categories bhi.</li>
<li><b>Guests aur personal devices.</b> Jo devices aap manage nahi karte aur jinke owners ne agree nahi kiya unhe deep inspect mat karo; certificate inspection aur clear guest notice use karo.</li>
<li><b>Regulated sectors.</b> Finance, health aur government networks mein interception aur logging ke specific rules ho sakte hain.</li>
</ul>

<h3>Decrypted data ki governance</h3>
<ul>
<li>URLs, file names aur user identities wale UTM logs kaun padh sakta hai restrict karo. Role-based admin accounts use karo.</li>
<li>Retention periods set karo aur schedule par delete karo.</li>
<li>Decrypted payloads store mat karo; zyadatar logs metadata rakhte hain, content nahi. Packet capture features enable karne se pehle socho.</li>
<li>Inspection CA key aur configuration backups protect karo (chapter 5).</li>
<li>SSL/SSH profile aur exemptions ke changes audit karo; approved baseline se compare karo.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Governance chain">
<rect x="20" y="25" width="102" height="70" rx="10" fill="#bae6fd"/><text x="71" y="54" text-anchor="middle" class="svg-ink" font-size="11.1">Policy</text><text x="71" y="72" text-anchor="middle" class="svg-muted" font-size="10.1">likhi aur signed</text><line x1="122" y1="60" x2="144" y2="60" stroke="#64748b" stroke-width="2"/><path d="M138 55 L144 60 L138 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="144" y="25" width="102" height="70" rx="10" fill="#bbf7d0"/><text x="195" y="54" text-anchor="middle" class="svg-ink" font-size="11.1">Notice</text><text x="195" y="72" text-anchor="middle" class="svg-muted" font-size="10.1">users ko bataya</text><line x1="246" y1="60" x2="268" y2="60" stroke="#64748b" stroke-width="2"/><path d="M262 55 L268 60 L262 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="268" y="25" width="102" height="70" rx="10" fill="#ddd6fe"/><text x="319" y="54" text-anchor="middle" class="svg-ink" font-size="11.1">Scope</text><text x="319" y="72" text-anchor="middle" class="svg-muted" font-size="10.1">sensitive exempt</text><line x1="370" y1="60" x2="392" y2="60" stroke="#64748b" stroke-width="2"/><path d="M386 55 L392 60 L386 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="392" y="25" width="102" height="70" rx="10" fill="#fde68a"/><text x="443" y="54" text-anchor="middle" class="svg-ink" font-size="11.1">Controls</text><text x="443" y="72" text-anchor="middle" class="svg-muted" font-size="10.1">access, retention</text><line x1="494" y1="60" x2="516" y2="60" stroke="#64748b" stroke-width="2"/><path d="M510 55 L516 60 L510 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="516" y="25" width="102" height="70" rx="10" fill="#fed7aa"/><text x="567" y="54" text-anchor="middle" class="svg-ink" font-size="11.1">Review</text><text x="567" y="72" text-anchor="middle" class="svg-muted" font-size="10.1">regular audit</text>
</svg><p class="cap">Responsible deep inspection governance ki chain hai, sirf profile nahi.</p></div>

<h3>Performance: decrypt karne ki keemat</h3>
<p>Deep inspection FortiGate se public-key cryptography, do baar symmetric encryption aur poora content inspection karwata hai. Datasheet throughput numbers aam taur par firewall-only, IPS, threat protection aur <b>SSL inspection</b> workloads ke liye alag diye jaate hain; sizing SSL inspection figure se karo. Cost badhane wale factors:</p>
<ul>
<li>Bahut saare chhote TLS sessions (har naye session ko handshake chahiye).</li>
<li>TLS 1.3 aur strong ciphers, khaaskar hardware acceleration ke bina.</li>
<li>Badi downloads jinhe scan karna hai.</li>
<li>Proxy-based inspection, jo zyada data buffer karta hai.</li>
<li>Ek hi decrypted flow par chalte kai security engines.</li>
</ul>
<p>Mitigations: sirf wahi inspect karo jo chahiye (user group ke hisaab se policies, bulk low-risk categories jaise video streaming ke liye exemptions), guests ke liye certificate inspection, crypto offload wala hardware chuno, SSL inspection throughput se size karo, aur pehle aur baad mein CPU, memory aur session setup rate monitor karo.</p>

<table class="cmp"><tr><th>Concern</th><th>Typical control</th></tr>
<tr><td>Privacy</td><td>Sensitive categories exempt; logs ka access log karo</td></tr>
<tr><td>Legal</td><td>Policy, notice, consent, counsel review</td></tr>
<tr><td>CA ki security</td><td>Subordinate CA, access control, expiry tracking</td></tr>
<tr><td>Compatibility</td><td>Pilot, pinned apps ke liye exemptions</td></tr>
<tr><td>Performance</td><td>Scope, hardware sizing, monitoring</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Network Kings Pune ke 120 staff hain aur peak par 40 Mbit/s web traffic, lekin FortiGate ki firewall throughput SSL inspection throughput se kaafi zyada rated hai. Team tay karti hai: sirf staff policy par deep inspection, guests ke liye certificate inspection, streaming video aur banking tatha health ke liye exemption, HR aur legal se approved documented policy, aur quarterly review. Go-live ke baad do hafte CPU monitor hota hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> Deep inspection ko sirf technical project maanna aur pehli complaint ke baad legal se poochna. Tab tak aap bina documented basis ke personal data inspect kar chuke ho sakte ho.</p></div>
<div class="exam"><p><b>Exam trap.</b> Datasheet SSL inspection throughput firewall throughput se kam hoti hai; jo features asal mein enable karoge unki figure se size karo. Exempt categories privacy risk aur CPU load dono kam karti hain.</p></div>

<div class="scn"><h4>Complaint jo canteen mein shuru hui</h4><p>Staff ko personal phone ke certificate warning se pata chala ki company secure browsing padh sakti hai. Trust gira jab tak management ne town hall mein samjhaya: sirf managed laptops, banking aur health excluded, logs ka access sirf security team ko, aur policy employment handbook mein. Phone ki warning guest policy ki galti se aayi thi jise team ne phir theek kiya.</p><p><b>Lesson:</b> transparency aur scope limits deep inspection ko acceptable banate hain.</p></div>

<div class="iv"><p class="q">"SSL deep inspection enable karne ke risks kya hain?"</p><p>Consent aur exemptions na ho to privacy aur legal exposure; ek powerful CA key jise protect karna hai; certificate pinning aur client certificates se application breakage; aur CPU cost jise sizing chahiye. Main written policy aur notice, banking aur health ke exemptions, careful CA distribution, pilot aur monitoring se mitigate karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Kuch bhi decrypt karne se pehle policy, notice aur legal review lo.</li>
<li>Sensitive categories exempt karo; logs kaun padhe aur kitne time tak yeh limit karo.</li>
<li>Unmanaged ya guest devices ko deep inspect mat karo.</li>
<li>Hardware SSL inspection throughput figure se size karo.</li>
<li>Scope se risk, load aur complaints ek saath kam hote hain.</li>
</ul></div>
`}};export{e as default};