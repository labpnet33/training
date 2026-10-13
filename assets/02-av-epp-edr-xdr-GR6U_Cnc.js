var e={id:`av-epp-edr-xdr`,h:{en:`From antivirus to EPP, EDR and XDR`,hi:`Antivirus se EPP, EDR aur XDR tak`},body:{en:`
<p>Think of a building's security over the years. First there was a guard with a book of wanted-criminal photos (antivirus signatures). Then the guard also watched for suspicious behaviour, checked bags and locked some doors (EPP). Then CCTV recorded every corridor, so after a break-in you could rewind and see who went where (EDR). Finally the CCTV, the door badges, the car park cameras and the reception log were joined into one control room (XDR). Each step solved a problem the previous one could not.</p>

<h3>Antivirus: matching known bad</h3>
<p>Classic <b>antivirus (AV)</b> compares files against a database of <b>signatures</b>: byte patterns or hashes of known malware. It is fast and precise for known threats, but it has two weaknesses. It is blind to anything new (a <b>zero-day</b> or freshly built sample), and attackers defeat it by changing a few bytes, because a one-bit change produces a completely different hash. Malware that changes itself on every copy is called <b>polymorphic</b>.</p>

<h3>The antimalware techniques you must know</h3>
<table class="cmp"><tr><th>Technique</th><th>How it works</th><th>Strength / weakness</th></tr>
<tr><td><b>Signature / hash</b></td><td>Exact match on a hash or byte pattern</td><td>Near-zero false positives; misses new and modified files</td></tr>
<tr><td><b>Heuristics</b></td><td>Rules about suspicious structure, such as packed code or odd imports</td><td>Catches variants; can flag legitimate tools</td></tr>
<tr><td><b>Machine learning</b></td><td>A model trained on millions of good and bad files scores file features</td><td>Catches never-seen files; needs tuning for false positives</td></tr>
<tr><td><b>Behavioural analysis</b></td><td>Watches what a process does: mass file renames, deleting shadow copies, injecting into other processes</td><td>Catches fileless and script attacks; acts after the process starts</td></tr>
<tr><td><b>Sandboxing</b></td><td>Detonates the file in an isolated VM and records behaviour</td><td>Deep verdict; takes minutes, so it is used for unknown files</td></tr>
<tr><td><b>Reputation / cloud lookup</b></td><td>Sends a hash to a cloud service that knows global prevalence and verdicts</td><td>Always current; needs connectivity (offline engines fill the gap)</td></tr>
</table>

<h3>EPP: prevention as a platform</h3>
<p>An <b>Endpoint Protection Platform (EPP)</b> bundles prevention controls into one agent: antimalware with several of the techniques above, exploit prevention, a host firewall, device control (for example blocking USB storage) and application control. EPP's goal is to stop the attack <b>before or as</b> it executes. Its gap: if something gets past it, an EPP alone leaves you with little record of what happened.</p>

<h3>EDR: record, detect, investigate, respond</h3>
<p><b>Endpoint Detection and Response (EDR)</b> assumes prevention will sometimes fail. It continuously records endpoint telemetry (process starts, file writes, network connections, parent-child relationships) and sends it to a console where you can:</p>
<ul>
<li><b>Detect</b> suspicious chains, such as Office spawning PowerShell that downloads a file.</li>
<li><b>Investigate</b> with timelines (Secure Endpoint calls them device and file trajectory).</li>
<li><b>Hunt</b> proactively for indicators across all endpoints.</li>
<li><b>Respond</b>: quarantine files, block applications, isolate a host, and act retrospectively when a verdict changes.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="AV EPP EDR XDR layers">
<rect x="20" y="170" width="600" height="44" rx="8" fill="#e2e8f0"/><text x="320" y="197" text-anchor="middle" class="svg-ink" font-size="13">AV: signatures and hashes of known malware</text>
<rect x="60" y="120" width="520" height="44" rx="8" fill="#bae6fd"/><text x="320" y="147" text-anchor="middle" class="svg-ink" font-size="13">EPP: + ML, behaviour, exploit prevention, device and app control</text>
<rect x="100" y="70" width="440" height="44" rx="8" fill="#bbf7d0"/><text x="320" y="97" text-anchor="middle" class="svg-ink" font-size="13">EDR: + recording, trajectory, hunting, isolation</text>
<rect x="140" y="20" width="360" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="47" text-anchor="middle" class="svg-ink" font-size="13">XDR: + email, network, cloud correlation</text>
</svg><p class="cap">Each generation includes the one below it and adds a new capability.</p></div>

<h3>XDR: beyond the endpoint</h3>
<p>EDR only sees the endpoint. It cannot see the email that delivered the file or the firewall the malware beaconed through. <b>Extended Detection and Response (XDR)</b> collects telemetry from endpoint, email, network, identity and cloud, correlates it into one <b>incident</b>, and offers response actions across all of them from one place. Cisco XDR does this for Secure Endpoint, Secure Email, Secure Firewall, Umbrella and many third-party sources. You will drive it in the <i>Duo, exfiltration, XDR and Splunk</i> module; here you only need the concept and the difference from EDR.</p>

<table class="cmp"><tr><th></th><th>EPP</th><th>EDR</th><th>XDR</th></tr>
<tr><td>Main goal</td><td>Prevent</td><td>Detect and respond on endpoints</td><td>Detect and respond across the estate</td></tr>
<tr><td>Data source</td><td>The file or process now</td><td>Continuous endpoint telemetry</td><td>Endpoint + email + network + cloud + identity</td></tr>
<tr><td>Typical action</td><td>Block, quarantine</td><td>Isolate host, retrospective quarantine</td><td>Isolate host and block domain and remediate mail in one playbook</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> An attacker builds a new ransomware variant. Its hash has never been seen, so the signature engine is silent. The ML engine scores the file 0.91 (suspicious). EPP in protect mode blocks it. A second sample is a PowerShell one-liner with no file at all, so only behavioural and script protection can see it. If it still runs, EDR shows the chain <code>winword.exe → powershell.exe → rundll32.exe</code>, and XDR links it to the phishing email and to a DNS query for a known C2 domain in the firewall logs.</p></div>

<p>Cisco Secure Endpoint is both EPP and EDR in one connector. Its prevention engines are the EPP part (next chapters); trajectory, retrospection, isolation and Orbital queries are the EDR part.</p>

<div class="warn"><p><b>Common mistake.</b> Saying EDR "replaces" EPP. EDR depends on prevention to handle the bulk of known threats, otherwise analysts drown in alerts. Modern products combine both.</p></div>

<div class="exam"><p><b>Exam trap.</b> SCOR asks you to "compare EPP and EDR". Key words: EPP = prevention at the point of entry (signatures, ML, exploit prevention, firewall, device control). EDR = continuous monitoring, detection, investigation, threat hunting and response after a compromise. If an answer mentions "historical telemetry" or "isolation", it is EDR.</p></div>

<div class="scn"><h4>Clean scan, compromised server</h4><p>A file server passed every nightly AV scan, yet data was leaving the company. The AV only had signatures, and the attacker used built-in Windows tools (living off the land) with no malicious file on disk. After an EDR rollout, the trajectory of the server showed <code>wmiprvse.exe</code> launching <code>powershell.exe</code> with an encoded command every night at 02:00, then an outbound connection to 198.51.100.77. The SOC isolated the server, removed the scheduled task and reset the stolen credentials.</p><p><b>Lesson:</b> signatures find known files; behaviour and telemetry find attackers who use no files at all.</p></div>

<div class="iv"><p class="q">"Explain the difference between EPP, EDR and XDR to a manager."</p><p>Strong answer: EPP is the lock on the door, it prevents known and likely-bad things from running. EDR is the CCTV inside, it records activity so we can detect what slipped through, investigate and isolate. XDR joins the CCTV with the reception desk, the email system and the firewall so one incident shows the full story and one click responds everywhere. Give a Cisco example of each: Secure Endpoint protection engines, Secure Endpoint trajectory and isolation, Cisco XDR.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>AV matches signatures; it misses zero-day and polymorphic malware.</li>
<li>Know the techniques: signature, heuristics, ML, behaviour, sandbox, cloud reputation.</li>
<li>EPP prevents; EDR records, detects, investigates and responds; XDR correlates across products.</li>
<li>Secure Endpoint is EPP + EDR in one connector; Cisco XDR is the correlation layer.</li>
<li>Fileless attacks are caught by behaviour and script protection, not by hashes.</li>
</ul></div>
`,hi:`
<p>Kisi building ki security ko saalon mein badalte socho. Pehle ek guard tha jiske paas wanted criminals ki photos ki kitaab thi (antivirus signatures). Phir guard suspicious behaviour bhi dekhne laga, bags check karne laga aur kuch darwaze lock karne laga (EPP). Phir CCTV ne har corridor record kiya, taaki break-in ke baad rewind karke dekh sako kaun kahan gaya (EDR). Aakhir mein CCTV, door badges, parking cameras aur reception log ko ek control room mein jod diya gaya (XDR). Har step ne woh problem solve ki jo pichla nahi kar paaya.</p>

<h3>Antivirus: known bad ko match karna</h3>
<p>Classic <b>antivirus (AV)</b> files ko <b>signatures</b> ke database se compare karta hai: known malware ke byte patterns ya hashes. Known threats ke liye yeh tez aur precise hai, par iski do kamzoriyan hain. Yeh kisi bhi nayi cheez (<b>zero-day</b> ya taaza bana sample) ke liye blind hai, aur attackers kuch bytes badalkar ise hara dete hain, kyunki ek bit ka change bhi bilkul alag hash bana deta hai. Jo malware har copy par khud ko badalta hai use <b>polymorphic</b> kehte hain.</p>

<h3>Antimalware techniques jo aapko pata honi chahiye</h3>
<table class="cmp"><tr><th>Technique</th><th>Kaise kaam karti hai</th><th>Strength / weakness</th></tr>
<tr><td><b>Signature / hash</b></td><td>Hash ya byte pattern par exact match</td><td>Lagbhag zero false positives; nayi aur modified files miss</td></tr>
<tr><td><b>Heuristics</b></td><td>Suspicious structure ke rules, jaise packed code ya ajeeb imports</td><td>Variants pakadti hai; legitimate tools ko flag kar sakti hai</td></tr>
<tr><td><b>Machine learning</b></td><td>Laakhon good aur bad files par trained model file features ko score karta hai</td><td>Kabhi na dekhi files pakadta hai; false positives ke liye tuning chahiye</td></tr>
<tr><td><b>Behavioural analysis</b></td><td>Process kya karta hai dekhta hai: mass file renames, shadow copies delete karna, doosre processes mein inject karna</td><td>Fileless aur script attacks pakadta hai; process start hone ke baad act karta hai</td></tr>
<tr><td><b>Sandboxing</b></td><td>File ko isolated VM mein detonate karke behaviour record karta hai</td><td>Gehra verdict; minutes lagte hain, isliye unknown files ke liye use hota hai</td></tr>
<tr><td><b>Reputation / cloud lookup</b></td><td>Hash ko cloud service ko bhejta hai jo global prevalence aur verdicts jaanti hai</td><td>Hamesha current; connectivity chahiye (offline engines gap bharte hain)</td></tr>
</table>

<h3>EPP: prevention ek platform ke roop mein</h3>
<p><b>Endpoint Protection Platform (EPP)</b> prevention controls ko ek agent mein bundle karta hai: upar ki kai techniques wala antimalware, exploit prevention, host firewall, device control (jaise USB storage block karna) aur application control. EPP ka goal attack ko execute hone se <b>pehle ya usi waqt</b> rokna hai. Iska gap: agar kuch iske paar nikal gaya, to akela EPP aapko lagbhag koi record nahi deta ki kya hua.</p>

<h3>EDR: record, detect, investigate, respond</h3>
<p><b>Endpoint Detection and Response (EDR)</b> maanta hai ki prevention kabhi kabhi fail hoga. Yeh lagataar endpoint telemetry record karta hai (process starts, file writes, network connections, parent-child relationships) aur use ek console ko bhejta hai jahan aap:</p>
<ul>
<li>Suspicious chains <b>detect</b> kar sakte ho, jaise Office se PowerShell spawn hona jo file download kare.</li>
<li>Timelines se <b>investigate</b> kar sakte ho (Secure Endpoint inhe device aur file trajectory kehta hai).</li>
<li>Saare endpoints par indicators ke liye proactively <b>hunt</b> kar sakte ho.</li>
<li><b>Respond</b> kar sakte ho: files quarantine, applications block, host isolate, aur verdict badalne par retrospectively act.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="AV EPP EDR XDR layers">
<rect x="20" y="170" width="600" height="44" rx="8" fill="#e2e8f0"/><text x="320" y="197" text-anchor="middle" class="svg-ink" font-size="13">AV: known malware ke signatures aur hashes</text>
<rect x="60" y="120" width="520" height="44" rx="8" fill="#bae6fd"/><text x="320" y="147" text-anchor="middle" class="svg-ink" font-size="13">EPP: + ML, behaviour, exploit prevention, device aur app control</text>
<rect x="100" y="70" width="440" height="44" rx="8" fill="#bbf7d0"/><text x="320" y="97" text-anchor="middle" class="svg-ink" font-size="13">EDR: + recording, trajectory, hunting, isolation</text>
<rect x="140" y="20" width="360" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="47" text-anchor="middle" class="svg-ink" font-size="13">XDR: + email, network, cloud correlation</text>
</svg><p class="cap">Har generation apne neeche wali ko shaamil karti hai aur ek nayi capability jodti hai.</p></div>

<h3>XDR: endpoint se aage</h3>
<p>EDR sirf endpoint dekhta hai. Woh na woh email dekh sakta hai jo file laayi, na woh firewall jiske through malware ne beacon kiya. <b>Extended Detection and Response (XDR)</b> endpoint, email, network, identity aur cloud se telemetry collect karta hai, use ek <b>incident</b> mein correlate karta hai, aur ek jagah se sab par response actions deta hai. Cisco XDR yeh Secure Endpoint, Secure Email, Secure Firewall, Umbrella aur kai third-party sources ke liye karta hai. Ise aap <i>Duo, exfiltration, XDR and Splunk</i> module mein chalaoge; yahan sirf concept aur EDR se fark chahiye.</p>

<table class="cmp"><tr><th></th><th>EPP</th><th>EDR</th><th>XDR</th></tr>
<tr><td>Main goal</td><td>Prevent</td><td>Endpoints par detect aur respond</td><td>Poore estate mein detect aur respond</td></tr>
<tr><td>Data source</td><td>Abhi wali file ya process</td><td>Lagataar endpoint telemetry</td><td>Endpoint + email + network + cloud + identity</td></tr>
<tr><td>Typical action</td><td>Block, quarantine</td><td>Host isolate, retrospective quarantine</td><td>Ek playbook mein host isolate, domain block aur mail remediate</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> Attacker ek naya ransomware variant banata hai. Uska hash kabhi dekha nahi gaya, isliye signature engine chup hai. ML engine file ko 0.91 (suspicious) score karta hai. Protect mode mein EPP use block kar deta hai. Doosra sample ek PowerShell one-liner hai jismein file hai hi nahi, isliye sirf behavioural aur script protection use dekh sakte hain. Agar phir bhi chal jaaye, to EDR chain <code>winword.exe → powershell.exe → rundll32.exe</code> dikhata hai, aur XDR use phishing email aur firewall logs mein known C2 domain ki DNS query se jodta hai.</p></div>

<p>Cisco Secure Endpoint ek hi connector mein EPP aur EDR dono hai. Iske prevention engines EPP wala hissa hain (agle chapters); trajectory, retrospection, isolation aur Orbital queries EDR wala hissa hain.</p>

<div class="warn"><p><b>Common galti.</b> Yeh kehna ki EDR EPP ko "replace" karta hai. EDR known threats ke bade hisse ko sambhalne ke liye prevention par nirbhar hai, warna analysts alerts mein doob jaate hain. Modern products dono ko combine karte hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> SCOR aapse "EPP aur EDR compare karo" poochta hai. Key words: EPP = point of entry par prevention (signatures, ML, exploit prevention, firewall, device control). EDR = compromise ke baad continuous monitoring, detection, investigation, threat hunting aur response. Agar answer mein "historical telemetry" ya "isolation" ho, to woh EDR hai.</p></div>

<div class="scn"><h4>Clean scan, compromised server</h4><p>Ek file server har raat ka AV scan pass karta tha, phir bhi data company se bahar jaa raha tha. AV ke paas sirf signatures the, aur attacker ne built-in Windows tools (living off the land) use kiye jismein disk par koi malicious file nahi thi. EDR rollout ke baad server ki trajectory ne dikhaya ki har raat 02:00 baje <code>wmiprvse.exe</code> encoded command ke saath <code>powershell.exe</code> launch karta tha, phir 198.51.100.77 ki taraf outbound connection. SOC ne server isolate kiya, scheduled task hataya aur chori hue credentials reset kiye.</p><p><b>Seekh:</b> signatures known files dhoondhte hain; behaviour aur telemetry un attackers ko dhoondhte hain jo koi file use hi nahi karte.</p></div>

<div class="iv"><p class="q">"Manager ko EPP, EDR aur XDR ka fark samjhao."</p><p>Strong answer: EPP darwaze ka lock hai, yeh known aur likely-bad cheezon ko chalne se rokta hai. EDR andar ka CCTV hai, yeh activity record karta hai taaki jo nikal gaya use detect, investigate aur isolate kar sakein. XDR CCTV ko reception desk, email system aur firewall se jodta hai taaki ek incident poori kahani dikhaye aur ek click har jagah respond kare. Har ek ka Cisco example do: Secure Endpoint protection engines, Secure Endpoint trajectory aur isolation, Cisco XDR.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>AV signatures match karta hai; zero-day aur polymorphic malware miss karta hai.</li>
<li>Techniques yaad rakho: signature, heuristics, ML, behaviour, sandbox, cloud reputation.</li>
<li>EPP rokta hai; EDR record, detect, investigate aur respond karta hai; XDR products ke beech correlate karta hai.</li>
<li>Secure Endpoint ek connector mein EPP + EDR hai; Cisco XDR correlation layer hai.</li>
<li>Fileless attacks behaviour aur script protection se pakde jaate hain, hashes se nahi.</li>
</ul></div>
`}};export{e as default};