var e={id:`protection-engines`,h:{en:`The protection engines: cloud lookups, TETRA, exploit, behaviour, script`,hi:`Protection engines: cloud lookups, TETRA, exploit, behaviour, script`},body:{en:`
<p>An airport does not rely on one check. Your passport is compared with a watch list (hash lookup), your bag goes through an X-ray that recognises shapes (machine learning), officers watch how people behave in the queue (behaviour), the cockpit door is reinforced in case someone gets through anyway (exploit prevention), and the control tower watches where every plane flies (network flow). Secure Endpoint layers its engines the same way, so one missed check is caught by the next.</p>

<h3>Engines that judge files</h3>
<dl class="terms">
<dt>File scan with cloud lookup</dt><dd>The core engine. The connector computes the SHA-256 of files that are copied, moved or executed and asks the cloud for the disposition. One-to-one: one hash, one verdict, backed by Talos intelligence and the global install base.</dd>
<dt>Spero (machine learning)</dt><dd>A cloud machine-learning engine that looks at structural features of Windows executables (headers, sections, imports) and can convict a never-seen file whose hash has no verdict yet.</dd>
<dt>Ethos (fuzzy fingerprinting)</dt><dd>Groups polymorphic variants that are "almost the same" so one conviction covers the family. Mainly relevant to Private Cloud deployments.</dd>
<dt>TETRA</dt><dd>A full <b>offline</b> signature antivirus engine on the Windows connector. It downloads definition updates to the endpoint and protects when there is no cloud connectivity, and powers on-demand scans. On macOS and Linux the equivalent offline engine is <b>ClamAV</b>.</dd>
</dl>

<h3>Engines that watch behaviour and memory</h3>
<dl class="terms">
<dt>Exploit Prevention</dt><dd>Protects the memory of commonly attacked applications (browsers, Office, PDF readers, Java and others) against memory-injection techniques used by exploits, such as code running from places it should never run from. It works without knowing the specific vulnerability, which is why it helps on unpatched systems.</dd>
<dt>System Process Protection</dt><dd>Guards critical Windows processes (for example the one that holds credentials in memory) from being read or tampered with by other processes.</dd>
<dt>Malicious Activity Protection (MAP)</dt><dd>Watches running processes for sequences of actions typical of ransomware and other malicious activity, such as rapidly rewriting many user files, and stops the process.</dd>
<dt>Behavioral Protection</dt><dd>Matches streams of system activity (process, file, registry, network) against behavioural signatures, catching living-off-the-land techniques that use only legitimate tools.</dd>
<dt>Script Protection</dt><dd>Inspects scripts such as PowerShell, VBScript, JScript and Office macros through the Windows Antimalware Scan Interface, after de-obfuscation, to stop fileless and script-based attacks.</dd>
</dl>

<h3>Engines that watch the network and the cloud</h3>
<dl class="terms">
<dt>Device Flow Correlation (DFC)</dt><dd>The connector's network engine. It monitors connections leaving the endpoint and compares the destination with Talos intelligence and your custom <b>IP block lists</b>, then logs or blocks the connection. It ties the flow to the process that made it.</dd>
<dt>Cloud IOCs</dt><dd>Indicators of compromise evaluated in the cloud from connector telemetry: suspicious patterns such as a low-prevalence executable, an Office document spawning a shell, or a process deleting shadow copies. They raise events even when no single file is convicted.</dd>
<dt>Orbital Advanced Search</dt><dd>An EDR hunting tool that runs live queries on endpoints (for example "which hosts have this scheduled task?") and returns results to the console.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Engines across the attack timeline">
<line x1="30" y1="40" x2="610" y2="40" stroke="#64748b" stroke-width="2"/>
<text x="120" y="28" text-anchor="middle" class="svg-accent" font-size="13">Before execution</text>
<text x="320" y="28" text-anchor="middle" class="svg-accent" font-size="13">During execution</text>
<text x="520" y="28" text-anchor="middle" class="svg-accent" font-size="13">After execution</text>
<rect x="30" y="60" width="180" height="34" rx="6" fill="#bae6fd"/><text x="120" y="82" text-anchor="middle" class="svg-ink" font-size="12">File scan / cloud lookup</text>
<rect x="30" y="102" width="180" height="34" rx="6" fill="#bae6fd"/><text x="120" y="124" text-anchor="middle" class="svg-ink" font-size="12">Spero ML, TETRA, ClamAV</text>
<rect x="230" y="60" width="180" height="34" rx="6" fill="#bbf7d0"/><text x="320" y="82" text-anchor="middle" class="svg-ink" font-size="12">Exploit Prevention</text>
<rect x="230" y="102" width="180" height="34" rx="6" fill="#bbf7d0"/><text x="320" y="124" text-anchor="middle" class="svg-ink" font-size="12">Script Protection</text>
<rect x="230" y="144" width="180" height="34" rx="6" fill="#bbf7d0"/><text x="320" y="166" text-anchor="middle" class="svg-ink" font-size="12">System Process Protection</text>
<rect x="430" y="60" width="180" height="34" rx="6" fill="#fde68a"/><text x="520" y="82" text-anchor="middle" class="svg-ink" font-size="12">MAP, Behavioral Protection</text>
<rect x="430" y="102" width="180" height="34" rx="6" fill="#fde68a"/><text x="520" y="124" text-anchor="middle" class="svg-ink" font-size="12">DFC network blocking</text>
<rect x="430" y="144" width="180" height="34" rx="6" fill="#fde68a"/><text x="520" y="166" text-anchor="middle" class="svg-ink" font-size="12">Cloud IOCs, retrospection</text>
<text x="320" y="212" text-anchor="middle" class="svg-muted" font-size="12">Before = judge the file; during = guard memory and scripts; after = watch actions and flows</text>
</svg><p class="cap">The engines cover the whole life of an attack, not just the moment a file lands.</p></div>

<h3>In the lab policy</h3>
<p>The lab console groups the engines into five switches per policy: <b>File</b>, <b>Network</b> (DFC), <b>Malicious Activity Protection</b>, <b>Exploit Prevention</b> and <b>Script Protection</b>. In lab (a) the NK-Standard policy has all five on, yet the sample still runs at first, because the policy <b>mode</b> is audit. Engines decide <i>what</i> is detected; the mode decides <i>what happens next</i>. That is the next chapter.</p>

<div class="eg"><p><b>Worked example.</b> Three samples on one Windows laptop. (1) <code>invoice_2026.exe</code>, hash already known Malicious: convicted by the file scan before it runs. (2) A brand-new executable with no hash verdict but packed code and suspicious imports: Spero scores it malicious. (3) A macro in a spreadsheet that launches an obfuscated PowerShell download: no new file is written first, so Script Protection inspects the de-obfuscated script and stops it. If the downloaded payload started encrypting files, MAP would stop the process; if it tried to reach 198.51.100.77 on a block list, DFC would block the connection.</p></div>

<div class="warn"><p><b>Common mistake.</b> Turning off Exploit Prevention or Script Protection after one false positive. Add a precise exclusion for the specific application or process instead, and keep the engine on for everything else.</p></div>

<div class="exam"><p><b>Exam trap.</b> TETRA is the <b>offline signature</b> engine on Windows, not a sandbox and not machine learning. Spero is ML. Secure Malware Analytics is the sandbox. DFC is the network engine. Questions often swap these names.</p></div>

<div class="scn"><h4>The laptop on the plane</h4><p>A consultant opened a USB drive from a client during a flight with no internet. The cloud lookup could not run, but the drive held an old worm. TETRA, with definitions updated the night before, convicted it locally and quarantined it. When the laptop reconnected, the event synced to the console. A second laptop on the same trip had TETRA disabled in its policy to save disk space and was infected.</p><p><b>Lesson:</b> offline engines matter for roaming users; do not disable them on laptops.</p></div>

<div class="iv"><p class="q">"Name the Secure Endpoint engines and what each protects against."</p><p>Strong answer: file scan with cloud lookups and Spero ML for known and new files; TETRA or ClamAV for offline signatures; Exploit Prevention for memory attacks against applications; System Process Protection for critical processes; MAP and Behavioral Protection for ransomware and living-off-the-land behaviour; Script Protection for PowerShell and macros; DFC for connections to malicious IPs; Cloud IOCs for suspicious patterns. Stress that layering covers before, during and after execution.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>File engines: cloud lookup (hash), Spero (ML), Ethos (fuzzy), TETRA/ClamAV (offline signatures).</li>
<li>Memory and behaviour: Exploit Prevention, System Process Protection, MAP, Behavioral Protection, Script Protection.</li>
<li>Network: Device Flow Correlation blocks connections to bad addresses and ties them to a process.</li>
<li>Cloud IOCs and Orbital give EDR visibility beyond single-file verdicts.</li>
<li>Engines decide what is detected; the policy mode decides whether it is stopped.</li>
</ul></div>
`,hi:`
<p>Airport ek check par bharosa nahi karta. Aapka passport watch list se compare hota hai (hash lookup), aapka bag X-ray se guzarta hai jo shapes pehchanta hai (machine learning), officers dekhte hain ki queue mein log kaise behave karte hain (behaviour), cockpit ka darwaza mazboot kiya jaata hai agar phir bhi koi andar aa jaaye (exploit prevention), aur control tower dekhta hai ki har plane kahan udta hai (network flow). Secure Endpoint apne engines ko aise hi layer karta hai, taaki ek check miss ho to agla pakad le.</p>

<h3>Files ko judge karne wale engines</h3>
<dl class="terms">
<dt>File scan with cloud lookup</dt><dd>Core engine. Connector copy, move ya execute hone wali files ka SHA-256 nikaalta hai aur cloud se disposition poochta hai. One-to-one: ek hash, ek verdict, Talos intelligence aur global install base ke support ke saath.</dd>
<dt>Spero (machine learning)</dt><dd>Cloud machine-learning engine jo Windows executables ke structural features (headers, sections, imports) dekhta hai aur aisi kabhi na dekhi file ko convict kar sakta hai jiske hash ka abhi verdict nahi hai.</dd>
<dt>Ethos (fuzzy fingerprinting)</dt><dd>"Lagbhag same" polymorphic variants ko group karta hai taaki ek conviction poori family cover kare. Mainly Private Cloud deployments ke liye relevant.</dd>
<dt>TETRA</dt><dd>Windows connector par poora <b>offline</b> signature antivirus engine. Yeh endpoint par definition updates download karta hai aur cloud connectivity na hone par protect karta hai, aur on-demand scans chalata hai. macOS aur Linux par iska equivalent offline engine <b>ClamAV</b> hai.</dd>
</dl>

<h3>Behaviour aur memory dekhne wale engines</h3>
<dl class="terms">
<dt>Exploit Prevention</dt><dd>Aam taur par attack hone wale applications (browsers, Office, PDF readers, Java aur doosre) ki memory ko exploits ki memory-injection techniques se bachata hai, jaise code ka aisi jagah se chalna jahan se kabhi nahi chalna chahiye. Yeh specific vulnerability jaane bina kaam karta hai, isiliye unpatched systems par madad karta hai.</dd>
<dt>System Process Protection</dt><dd>Critical Windows processes (jaise woh jo memory mein credentials rakhta hai) ko doosre processes dwara padhe jaane ya chhede jaane se bachata hai.</dd>
<dt>Malicious Activity Protection (MAP)</dt><dd>Chal rahe processes mein ransomware aur doosri malicious activity ke typical actions ke sequence dekhta hai, jaise bahut saari user files ko tezi se rewrite karna, aur process ko rok deta hai.</dd>
<dt>Behavioral Protection</dt><dd>System activity ki streams (process, file, registry, network) ko behavioural signatures se match karta hai, aur woh living-off-the-land techniques pakadta hai jo sirf legitimate tools use karti hain.</dd>
<dt>Script Protection</dt><dd>PowerShell, VBScript, JScript aur Office macros jaise scripts ko Windows Antimalware Scan Interface ke through, de-obfuscation ke baad, inspect karta hai taaki fileless aur script-based attacks ruk jaayein.</dd>
</dl>

<h3>Network aur cloud dekhne wale engines</h3>
<dl class="terms">
<dt>Device Flow Correlation (DFC)</dt><dd>Connector ka network engine. Yeh endpoint se nikalne wale connections monitor karta hai aur destination ko Talos intelligence aur aapki custom <b>IP block lists</b> se compare karta hai, phir connection log ya block karta hai. Yeh flow ko us process se jodta hai jisne use banaya.</dd>
<dt>Cloud IOCs</dt><dd>Connector telemetry se cloud mein evaluate hone wale indicators of compromise: suspicious patterns jaise low-prevalence executable, Office document ka shell spawn karna, ya process ka shadow copies delete karna. Yeh tab bhi events uthate hain jab koi single file convict na ho.</dd>
<dt>Orbital Advanced Search</dt><dd>EDR hunting tool jo endpoints par live queries chalata hai (jaise "kaunse hosts par yeh scheduled task hai?") aur results console ko lautata hai.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Attack timeline par engines">
<line x1="30" y1="40" x2="610" y2="40" stroke="#64748b" stroke-width="2"/>
<text x="120" y="28" text-anchor="middle" class="svg-accent" font-size="13">Execution se pehle</text>
<text x="320" y="28" text-anchor="middle" class="svg-accent" font-size="13">Execution ke dauraan</text>
<text x="520" y="28" text-anchor="middle" class="svg-accent" font-size="13">Execution ke baad</text>
<rect x="30" y="60" width="180" height="34" rx="6" fill="#bae6fd"/><text x="120" y="82" text-anchor="middle" class="svg-ink" font-size="12">File scan / cloud lookup</text>
<rect x="30" y="102" width="180" height="34" rx="6" fill="#bae6fd"/><text x="120" y="124" text-anchor="middle" class="svg-ink" font-size="12">Spero ML, TETRA, ClamAV</text>
<rect x="230" y="60" width="180" height="34" rx="6" fill="#bbf7d0"/><text x="320" y="82" text-anchor="middle" class="svg-ink" font-size="12">Exploit Prevention</text>
<rect x="230" y="102" width="180" height="34" rx="6" fill="#bbf7d0"/><text x="320" y="124" text-anchor="middle" class="svg-ink" font-size="12">Script Protection</text>
<rect x="230" y="144" width="180" height="34" rx="6" fill="#bbf7d0"/><text x="320" y="166" text-anchor="middle" class="svg-ink" font-size="12">System Process Protection</text>
<rect x="430" y="60" width="180" height="34" rx="6" fill="#fde68a"/><text x="520" y="82" text-anchor="middle" class="svg-ink" font-size="12">MAP, Behavioral Protection</text>
<rect x="430" y="102" width="180" height="34" rx="6" fill="#fde68a"/><text x="520" y="124" text-anchor="middle" class="svg-ink" font-size="12">DFC network blocking</text>
<rect x="430" y="144" width="180" height="34" rx="6" fill="#fde68a"/><text x="520" y="166" text-anchor="middle" class="svg-ink" font-size="12">Cloud IOCs, retrospection</text>
<text x="320" y="212" text-anchor="middle" class="svg-muted" font-size="12">Pehle = file judge karo; dauraan = memory aur scripts guard karo; baad = actions aur flows dekho</text>
</svg><p class="cap">Engines attack ki poori life cover karte hain, sirf file aane ka pal nahi.</p></div>

<h3>Lab policy mein</h3>
<p>Lab console engines ko har policy mein paanch switches mein group karta hai: <b>File</b>, <b>Network</b> (DFC), <b>Malicious Activity Protection</b>, <b>Exploit Prevention</b> aur <b>Script Protection</b>. Lab (a) mein NK-Standard policy mein paanchon on hain, phir bhi sample shuru mein chalta hai, kyunki policy ka <b>mode</b> audit hai. Engines tay karte hain <i>kya</i> detect hota hai; mode tay karta hai <i>aage kya hota hai</i>. Yahi agla chapter hai.</p>

<div class="eg"><p><b>Worked example.</b> Ek Windows laptop par teen samples. (1) <code>invoice_2026.exe</code>, hash pehle se Malicious known: chalne se pehle file scan se convict. (2) Bilkul nayi executable jiske hash ka verdict nahi par packed code aur suspicious imports hain: Spero use malicious score karta hai. (3) Spreadsheet mein macro jo obfuscated PowerShell download launch karta hai: pehle koi nayi file nahi likhi jaati, isliye Script Protection de-obfuscated script inspect karke use rok deta hai. Agar download hua payload files encrypt karna shuru karta, to MAP process rok deta; agar woh block list par 198.51.100.77 tak pahunchne ki koshish karta, to DFC connection block kar deta.</p></div>

<div class="warn"><p><b>Common galti.</b> Ek false positive ke baad Exploit Prevention ya Script Protection band kar dena. Iski jagah specific application ya process ke liye precise exclusion add karo, aur baaki sab ke liye engine on rakho.</p></div>

<div class="exam"><p><b>Exam trap.</b> TETRA Windows par <b>offline signature</b> engine hai, sandbox nahi aur machine learning nahi. Spero ML hai. Secure Malware Analytics sandbox hai. DFC network engine hai. Questions aksar yeh naam ulat dete hain.</p></div>

<div class="scn"><h4>Plane wala laptop</h4><p>Ek consultant ne bina internet wali flight mein client ki USB drive kholi. Cloud lookup nahi chal saka, par drive mein ek purana worm tha. TETRA ne, pichli raat update hui definitions ke saath, use locally convict karke quarantine kar diya. Laptop reconnect hone par event console tak sync ho gaya. Usi trip ke doosre laptop ki policy mein disk space bachane ke liye TETRA disabled tha, aur woh infect ho gaya.</p><p><b>Seekh:</b> roaming users ke liye offline engines matter karte hain; laptops par unhe disable mat karo.</p></div>

<div class="iv"><p class="q">"Secure Endpoint ke engines ke naam batao aur har ek kis cheez se bachata hai."</p><p>Strong answer: known aur nayi files ke liye cloud lookups ke saath file scan aur Spero ML; offline signatures ke liye TETRA ya ClamAV; applications par memory attacks ke liye Exploit Prevention; critical processes ke liye System Process Protection; ransomware aur living-off-the-land behaviour ke liye MAP aur Behavioral Protection; PowerShell aur macros ke liye Script Protection; malicious IPs ke connections ke liye DFC; suspicious patterns ke liye Cloud IOCs. Zor do ki layering execution se pehle, dauraan aur baad sab cover karti hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>File engines: cloud lookup (hash), Spero (ML), Ethos (fuzzy), TETRA/ClamAV (offline signatures).</li>
<li>Memory aur behaviour: Exploit Prevention, System Process Protection, MAP, Behavioral Protection, Script Protection.</li>
<li>Network: Device Flow Correlation bad addresses ke connections block karta hai aur unhe process se jodta hai.</li>
<li>Cloud IOCs aur Orbital single-file verdicts se aage EDR visibility dete hain.</li>
<li>Engines tay karte hain kya detect hota hai; policy mode tay karta hai ki woh rukta hai ya nahi.</li>
</ul></div>
`}};export{e as default};