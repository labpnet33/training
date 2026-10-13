var e={id:`utd-ips-url-amp`,h:{en:`Threat defense on the edge: IPS/IDS, URL filtering and AMP with UTD`,hi:`Edge par threat defense: UTD se IPS/IDS, URL filtering aur AMP`},body:{en:`
<p>A firewall decides which conversations are allowed. It does not decide whether an allowed conversation is <i>harmful</i>. A permitted web session can still carry an exploit, a visit to a phishing site or a malicious file. The <b>Unified Threat Defense (UTD)</b> security virtual image adds deeper inspection on the WAN Edge itself, so branches that use DIA do not depend on a central security stack.</p>

<h3>Analogy: airport security beyond the ticket check</h3>
<p>The firewall is the ticket check: does this passenger have a boarding pass? UTD is the X-ray and the sniffer dog. It looks inside the bag (<b>IPS and IDS</b>), checks whether the destination is on a banned list (<b>URL filtering</b>) and checks whether a parcel matches a known dangerous item (<b>AMP file reputation</b>).</p>

<h3>What UTD is</h3>
<p>UTD runs as a <b>Linux container</b> (an application hosted on the router) next to the forwarding engine. Traffic selected by a security policy is handed to the container for inspection, then returned and forwarded. You install the UTD security virtual image through SD-WAN Manager (it must match the software release), and the platform needs enough resources: current guidance asks for a minimum of 8 GB DRAM for the UTD container. Check the platform data sheet before you promise the feature to a small branch router.</p>
<table class="cmp"><tr><th>Feature</th><th>What it does</th><th>Where it protects</th></tr>
<tr><td><b>IPS / IDS</b></td><td>Compares traffic with threat signatures (Snort engine) and blocks or alerts</td><td>Exploits, scans, malware command traffic</td></tr>
<tr><td><b>URL filtering</b></td><td>Classifies web addresses by category and reputation; allows, blocks or warns</td><td>Phishing, adult, malware and unwanted categories</td></tr>
<tr><td><b>AMP</b> (Advanced Malware Protection)</td><td>Checks the reputation of files by hash and can send unknown files for analysis</td><td>Malicious downloads</td></tr></table>

<h3>IPS versus IDS</h3>
<p>Both use the same signatures. In <b>IPS (prevention)</b> mode, the engine sits in the traffic path and can drop a packet or reset the session. In <b>IDS (detection)</b> mode it only raises an alert. Start in detection to learn the false positives for the branch, then move to prevention. Signature sets (for example connectivity, balanced, security) trade protection against false positives: a more aggressive set blocks more but can break legitimate applications. Signatures are updated from the cloud through Manager; keep updates enabled and watch the version.</p>

<h3>URL filtering</h3>
<p>The policy lists <b>web categories</b> to block, a <b>reputation threshold</b>, and optional allow and block lists of your own domains. A blocked user sees a block page. For encrypted sessions, the engine can use the server name in the handshake and, in releases that support TLS decryption, optionally decrypt for deeper inspection. Decryption has privacy and performance implications, so apply it only where policy allows.</p>

<h3>AMP</h3>
<p>For files that cross the edge, the engine calculates a hash and asks the AMP cloud for its reputation. Known bad files are blocked; unknown files can be sent for analysis in a sandbox according to the profile. The edge needs access to the cloud service and the correct DNS.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="UTD inspection in the edge forwarding path">
<rect x="10" y="70" width="100" height="60" rx="8" fill="#bae6fd"/><text x="60" y="97" text-anchor="middle" class="svg-ink" font-size="13">STAFF-PC</text><text x="60" y="115" text-anchor="middle" class="svg-muted" font-size="11">VPN 10</text>
<rect x="150" y="70" width="110" height="60" rx="8" fill="#fde68a"/><text x="205" y="97" text-anchor="middle" class="svg-ink" font-size="13">Zone firewall</text><text x="205" y="115" text-anchor="middle" class="svg-muted" font-size="11">is it allowed?</text>
<rect x="300" y="40" width="180" height="120" rx="10" fill="#ddd6fe"/><text x="390" y="64" text-anchor="middle" class="svg-ink" font-size="13">UTD container</text>
<text x="390" y="88" text-anchor="middle" class="svg-muted" font-size="12">IPS or IDS</text><text x="390" y="108" text-anchor="middle" class="svg-muted" font-size="12">URL filtering</text><text x="390" y="128" text-anchor="middle" class="svg-muted" font-size="12">AMP file reputation</text>
<rect x="520" y="70" width="100" height="60" rx="8" fill="#bbf7d0"/><text x="570" y="97" text-anchor="middle" class="svg-ink" font-size="13">Internet</text><text x="570" y="115" text-anchor="middle" class="svg-muted" font-size="11">via DIA</text>
<line x1="110" y1="100" x2="150" y2="100" stroke="#64748b" stroke-width="2"/><line x1="260" y1="100" x2="300" y2="100" stroke="#64748b" stroke-width="2"/><line x1="480" y1="100" x2="520" y2="100" stroke="#64748b" stroke-width="2"/>
<text x="320" y="190" text-anchor="middle" class="svg-accent" font-size="12">Allowed by the firewall, then inspected for harm</text>
</svg><p class="cap">The firewall first checks permission; the UTD container then looks for threats before the packet leaves.</p></div>

<h3>Operating it defensively</h3>
<ul>
<li><b>Size and plan.</b> Confirm DRAM and CPU headroom, because inspection reduces throughput.</li>
<li><b>Staged rollout.</b> Pilot at one branch, use IDS first, review alerts, then enable prevention.</li>
<li><b>Exceptions with care.</b> Whitelist a signature only after you understand the false positive, and record who approved it.</li>
<li><b>Monitor.</b> Use Manager's security dashboard to see blocked threats, categories and top sources. Check the container with <code>show utd engine standard status</code>; it should report the engine as running and healthy.</li>
<li><b>Keep it current.</b> Signature, URL and AMP data go stale if the cloud path is blocked or DNS fails.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Pune moves guests to DIA. The team enables the zone firewall for GUEST, then UTD with IDS, a URL filter that blocks malware and phishing categories, and AMP. Over a week the alerts show a few scans from guest devices and no false positives on the POS application. They switch GUEST to prevention. Staff traffic stays on the DC firewall and does not use the UTD license on the branch.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Enabling prevention on day one and blocking a business application. (2) Deploying UTD on a router without enough memory. (3) Forgetting to match the UTD image version to the software release. (4) Expecting URL filtering to work on encrypted traffic exactly as on plain traffic. (5) Disabling signature updates to avoid change.</p></div>

<div class="exam"><p><b>Exam trap.</b> IDS alerts, IPS blocks; same signatures. UTD is a container and needs memory (8 GB DRAM minimum). The firewall and UTD do different jobs: permit or deny conversations versus detect harmful content in allowed ones.</p></div>

<div class="scn"><h4>UTD will not start on a small branch router</h4><p>After a policy push, the Nashik kiosk router shows UTD not running. The platform has 4 GB of DRAM, below the requirement. The team keeps the firewall and DNS security at Nashik and uses a SIG tunnel for deeper inspection instead.</p><p><b>Lesson:</b> match the feature to the platform, and have a fallback design.</p></div>

<div class="iv"><p class="q">"What is UTD and how do IPS, URL filtering and AMP differ?"</p><p>UTD is a security virtual image running as a container on the WAN Edge. IPS or IDS matches traffic with signatures and blocks or alerts; URL filtering decides by web category and reputation; AMP checks file reputation by hash and can analyze unknown files. They complement the zone firewall, which only decides whether a conversation is allowed. I pilot in detection mode, size the platform for the 8 GB DRAM requirement and monitor in Manager.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>UTD = container on the edge for IPS or IDS, URL filtering and AMP.</li>
<li>Detection (IDS) alerts; prevention (IPS) blocks; start with detection.</li>
<li>Needs resources, with a minimum of 8 GB DRAM, and the matching image.</li>
<li>Keep signatures and cloud lookups healthy; check <code>show utd engine standard status</code>.</li>
<li>Firewall first, UTD second; both are needed for DIA.</li>
</ul></div>
`,hi:`
<p>Firewall tay karta hai ki kaunsi conversations allowed hain. Woh yeh tay nahi karta ki allowed conversation <i>harmful</i> hai ya nahi. Permitted web session bhi exploit, phishing site ka visit ya malicious file le jaa sakta hai. <b>Unified Threat Defense (UTD)</b> security virtual image WAN Edge par hi gehri inspection jodta hai, taaki jo branches DIA use karti hain woh central security stack par nirbhar na rahein.</p>

<h3>Analogy: ticket check se aage airport security</h3>
<p>Firewall ticket check hai: kya is passenger ke paas boarding pass hai? UTD X-ray aur sniffer dog hai. Woh bag ke andar dekhta hai (<b>IPS aur IDS</b>), check karta hai ki destination banned list mein hai ya nahi (<b>URL filtering</b>) aur check karta hai ki parcel kisi jaane-pehchane khatarnaak item se match karta hai ya nahi (<b>AMP file reputation</b>).</p>

<h3>UTD kya hai</h3>
<p>UTD forwarding engine ke paas <b>Linux container</b> (router par hosted application) ke roop mein chalta hai. Security policy se chuna gaya traffic inspection ke liye container ko diya jaata hai, phir wapas aakar forward hota hai. UTD security virtual image SD-WAN Manager se install karte ho (software release se match karni chahiye), aur platform ko kaafi resources chahiye: current guidance UTD container ke liye minimum 8 GB DRAM maangti hai. Chhote branch router ke liye feature ka vaada karne se pehle platform data sheet check karo.</p>
<table class="cmp"><tr><th>Feature</th><th>Kya karta hai</th><th>Kahan protect karta hai</th></tr>
<tr><td><b>IPS / IDS</b></td><td>Traffic ko threat signatures (Snort engine) se compare karta hai aur block ya alert karta hai</td><td>Exploits, scans, malware command traffic</td></tr>
<tr><td><b>URL filtering</b></td><td>Web addresses ko category aur reputation se classify karta hai; allow, block ya warn</td><td>Phishing, adult, malware aur unwanted categories</td></tr>
<tr><td><b>AMP</b> (Advanced Malware Protection)</td><td>Files ki reputation hash se check karta hai aur unknown files analysis ke liye bhej sakta hai</td><td>Malicious downloads</td></tr></table>

<h3>IPS versus IDS</h3>
<p>Dono wahi signatures use karte hain. <b>IPS (prevention)</b> mode mein engine traffic path mein baithta hai aur packet drop ya session reset kar sakta hai. <b>IDS (detection)</b> mode mein woh sirf alert deta hai. Pehle detection se shuru karo taaki branch ke false positives pata chalein, phir prevention mein jao. Signature sets (jaise connectivity, balanced, security) protection aur false positives ke beech trade-off karte hain: zyada aggressive set zyada block karta hai lekin legitimate applications tod sakta hai. Signatures cloud se Manager ke through update hote hain; updates enabled rakho aur version dekhte raho.</p>

<h3>URL filtering</h3>
<p>Policy mein block karne wali <b>web categories</b>, ek <b>reputation threshold</b>, aur apne domains ki optional allow aur block lists hoti hain. Blocked user ko block page dikhta hai. Encrypted sessions ke liye engine handshake mein server name use kar sakta hai aur, jin releases mein TLS decryption support hai, deeper inspection ke liye optionally decrypt kar sakta hai. Decryption ke privacy aur performance implications hain, isliye use sirf wahan lagao jahan policy allow kare.</p>

<h3>AMP</h3>
<p>Edge se guzarne wali files ke liye engine hash nikalta hai aur AMP cloud se uski reputation poochta hai. Known bad files block hoti hain; unknown files profile ke hisaab se sandbox analysis ke liye bheji ja sakti hain. Edge ko cloud service tak access aur sahi DNS chahiye.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Edge forwarding path mein UTD inspection">
<rect x="10" y="70" width="100" height="60" rx="8" fill="#bae6fd"/><text x="60" y="97" text-anchor="middle" class="svg-ink" font-size="13">STAFF-PC</text><text x="60" y="115" text-anchor="middle" class="svg-muted" font-size="11">VPN 10</text>
<rect x="150" y="70" width="110" height="60" rx="8" fill="#fde68a"/><text x="205" y="97" text-anchor="middle" class="svg-ink" font-size="13">Zone firewall</text><text x="205" y="115" text-anchor="middle" class="svg-muted" font-size="11">allowed hai?</text>
<rect x="300" y="40" width="180" height="120" rx="10" fill="#ddd6fe"/><text x="390" y="64" text-anchor="middle" class="svg-ink" font-size="13">UTD container</text>
<text x="390" y="88" text-anchor="middle" class="svg-muted" font-size="12">IPS ya IDS</text><text x="390" y="108" text-anchor="middle" class="svg-muted" font-size="12">URL filtering</text><text x="390" y="128" text-anchor="middle" class="svg-muted" font-size="12">AMP file reputation</text>
<rect x="520" y="70" width="100" height="60" rx="8" fill="#bbf7d0"/><text x="570" y="97" text-anchor="middle" class="svg-ink" font-size="13">Internet</text><text x="570" y="115" text-anchor="middle" class="svg-muted" font-size="11">DIA se</text>
<line x1="110" y1="100" x2="150" y2="100" stroke="#64748b" stroke-width="2"/><line x1="260" y1="100" x2="300" y2="100" stroke="#64748b" stroke-width="2"/><line x1="480" y1="100" x2="520" y2="100" stroke="#64748b" stroke-width="2"/>
<text x="320" y="190" text-anchor="middle" class="svg-accent" font-size="12">Firewall se allowed, phir harm ke liye inspected</text>
</svg><p class="cap">Firewall pehle permission check karta hai; packet nikalne se pehle UTD container threats dhoondta hai.</p></div>

<h3>Ise defensive tarike se chalana</h3>
<ul>
<li><b>Size aur plan.</b> DRAM aur CPU headroom confirm karo, kyunki inspection throughput kam karti hai.</li>
<li><b>Staged rollout.</b> Ek branch par pilot, pehle IDS, alerts review, phir prevention enable.</li>
<li><b>Exceptions dhyan se.</b> Signature ko whitelist tabhi karo jab false positive samajh lo, aur record rakho ki kisne approve kiya.</li>
<li><b>Monitor.</b> Manager ke security dashboard se blocked threats, categories aur top sources dekho. Container ko <code>show utd engine standard status</code> se check karo; engine running aur healthy report karna chahiye.</li>
<li><b>Current rakho.</b> Cloud path block ho ya DNS fail ho to signature, URL aur AMP data purana ho jaata hai.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Pune guests ko DIA par le jaata hai. Team GUEST ke liye zone firewall enable karti hai, phir IDS ke saath UTD, malware aur phishing categories block karne wala URL filter, aur AMP. Ek hafte mein alerts guest devices se kuch scans dikhate hain aur POS application par koi false positive nahi. Woh GUEST ko prevention par switch karte hain. Staff traffic DC firewall par rehta hai aur branch par UTD license use nahi karta.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Pehle din hi prevention enable karke business application block kar dena. (2) Kam memory wale router par UTD deploy karna. (3) UTD image version ko software release se match karna bhool jaana. (4) URL filtering se encrypted traffic par bilkul plain traffic jaisa kaam ki ummeed. (5) Change se bachne ke liye signature updates band kar dena.</p></div>

<div class="exam"><p><b>Exam trap.</b> IDS alert karta hai, IPS block karta hai; signatures wahi. UTD container hai aur memory chahiye (minimum 8 GB DRAM). Firewall aur UTD alag kaam karte hain: conversations ko permit ya deny karna versus allowed conversations mein harmful content detect karna.</p></div>

<div class="scn"><h4>Chhote branch router par UTD start nahi hota</h4><p>Policy push ke baad Nashik kiosk router UTD not running dikhata hai. Platform ke paas 4 GB DRAM hai, jo requirement se kam hai. Team Nashik par firewall aur DNS security rakhti hai aur deeper inspection ke liye SIG tunnel use karti hai.</p><p><b>Lesson:</b> feature ko platform se match karo, aur fallback design rakho.</p></div>

<div class="iv"><p class="q">"UTD kya hai aur IPS, URL filtering aur AMP kaise alag hain?"</p><p>UTD WAN Edge par container ke roop mein chalne wali security virtual image hai. IPS ya IDS traffic ko signatures se match karke block ya alert karta hai; URL filtering web category aur reputation se decide karta hai; AMP files ki reputation hash se check karta hai aur unknown files analyze kar sakta hai. Yeh zone firewall ke complement hain, jo sirf tay karta hai ki conversation allowed hai ya nahi. Main detection mode mein pilot karta hoon, 8 GB DRAM requirement ke liye platform size karta hoon aur Manager mein monitor karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>UTD = IPS ya IDS, URL filtering aur AMP ke liye edge par container.</li>
<li>Detection (IDS) alert karta hai; prevention (IPS) block karta hai; detection se shuru karo.</li>
<li>Resources chahiye, minimum 8 GB DRAM, aur matching image.</li>
<li>Signatures aur cloud lookups healthy rakho; <code>show utd engine standard status</code> check karo.</li>
<li>Pehle firewall, phir UTD; DIA ke liye dono chahiye.</li>
</ul></div>
`}};export{e as default};