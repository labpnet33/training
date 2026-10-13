var e={id:`ips`,h:{en:`IPS: sensors, signatures, filters and actions`,hi:`IPS: sensors, signatures, filters aur actions`},body:{en:`
<p>An <b>intrusion prevention system (IPS)</b> watches traffic for patterns that match known attack techniques, such as an attempt to exploit a weakness in a web server or a database. Imagine a security guard who has a thick book of known break-in methods and checks every visitor's behaviour against it. If the behaviour matches a page in the book, the guard stops it, and writes a report. In this course all threats are simulated: we talk about <i>signatures that match test markers</i>, never about real exploit code.</p>

<h3>Signatures, sensors and where IPS runs</h3>
<p>FortiGuard publishes thousands of <b>IPS signatures</b>. Each has a name, a <b>severity</b> (info, low, medium, high, critical), a <b>location</b> (server-side or client-side attack), a target <b>protocol</b> and <b>operating system</b>, an <b>application</b> and a default <b>action</b>. The profile that selects which signatures are active and what to do is called an <b>IPS sensor</b>. It is made of numbered <b>entries</b>; each entry is a filter ("all critical and high signatures that target servers") or a single named signature.</p>

<p><b>Reference configuration (not run in the simulator)</b></p>
<pre class="code">config ips sensor
    edit "NK-IPS"
        set comment "Pune LAN-to-WAN: block severe, log the rest"
        set block-malicious-url enable
        config entries
            edit 1
                set location client
                set severity critical high
                set status enable
                set action block
                set log enable
            next
            edit 2
                set severity medium
                set status enable
                set action pass
                set log enable
            next
        end
    next
end</pre>
<p>Entry 1 blocks serious client-side attacks, which is the threat for users browsing out. Entry 2 only monitors medium severity: <code>pass</code> with logging, which is IPS "monitor" mode. For a policy protecting <b>servers</b> in a DMZ you would use <code>location server</code> instead. Built-in sensors exist (<code>default</code>, <code>all_default</code>, <code>all_default_pass</code>, <code>high_security</code>, <code>protect_client</code>, <code>protect_email_server</code>, <code>protect_h&#116;tp_server</code>) and are good starting points; clone one, then adjust.</p>

<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="IPS flow">
<rect x="20" y="25" width="133" height="70" rx="10" fill="#bae6fd"/><text x="86.5" y="54" text-anchor="middle" class="svg-ink" font-size="11.8">Traffic accepted</text><text x="86.5" y="72" text-anchor="middle" class="svg-muted" font-size="10.8">by the policy</text><line x1="153" y1="60" x2="175" y2="60" stroke="#64748b" stroke-width="2"/><path d="M169 55 L175 60 L169 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="175" y="25" width="133" height="70" rx="10" fill="#bbf7d0"/><text x="241.5" y="54" text-anchor="middle" class="svg-ink" font-size="11.8">Pattern match</text><text x="241.5" y="72" text-anchor="middle" class="svg-muted" font-size="10.8">signature database</text><line x1="308" y1="60" x2="330" y2="60" stroke="#64748b" stroke-width="2"/><path d="M324 55 L330 60 L324 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="330" y="25" width="133" height="70" rx="10" fill="#ddd6fe"/><text x="396.5" y="54" text-anchor="middle" class="svg-ink" font-size="11.8">Entry action</text><text x="396.5" y="72" text-anchor="middle" class="svg-muted" font-size="10.8">block, reset, pass</text><line x1="463" y1="60" x2="485" y2="60" stroke="#64748b" stroke-width="2"/><path d="M479 55 L485 60 L479 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="485" y="25" width="133" height="70" rx="10" fill="#fde68a"/><text x="551.5" y="54" text-anchor="middle" class="svg-ink" font-size="11.8">Log</text><text x="551.5" y="72" text-anchor="middle" class="svg-muted" font-size="10.8">attack name, severity</text>
</svg><p class="cap">IPS compares accepted traffic with signatures and applies the action of the matching sensor entry.</p></div>

<h3>Actions</h3>
<ul>
<li><b>pass</b>: allow and log (the monitor mode, ideal for the first days).</li>
<li><b>block</b>: drop the offending packets and the session, and log.</li>
<li><b>reset</b>: send TCP resets to both ends, cleaner for the application than a silent drop.</li>
<li><b>default</b>: use the action FortiGuard recommends for that signature.</li>
</ul>
<p>Additional controls: <b>rate-based</b> signatures that trigger only after a threshold within a time window (useful for brute-force or scan patterns), <b>quarantine</b> of the attacker's address for a period, packet logging (<code>log-packet</code>) to keep the offending packet for analysis, <code>scan-botnet-connections</code> to detect connections to known botnet command servers, and exemptions by source/destination IP for a trusted scanner that would otherwise be blocked.</p>

<h3>IPS is not a DoS policy</h3>
<p>Volume attacks that flood a service are handled by a separate feature, the <b>DoS policy</b> (<code>config firewall DoS-policy</code>) with anomaly checks such as SYN flood or UDP flood thresholds. IPS signatures match content patterns; DoS policies count rates. The exam likes this distinction.</p>

<h3>Performance and false positives</h3>
<p>Every active signature costs CPU. Selecting only signatures relevant to your assets (server or client, your operating systems, your protocols) keeps the sensor lean. A <b>false positive</b> is a legitimate flow that matches a signature; handle it with a narrow exemption for the specific signature and source, not by disabling the whole sensor. Some FortiGate models can offload part of IPS to hardware; the sensor definition stays the same.</p>

<div class="eg"><p><b>Worked example.</b> A developer at <code>10.0.1.50</code> runs a test with the marker <code>nk-sim=sqli</code> in the query string against an internal lab server through the FortiGate. In the IPS log you would see an attack named for the pattern, severity high, action blocked, source 10.0.1.50, destination the lab server, and the policy ID. The marker is harmless; it exists so students can trigger a detection safely.</p></div>

<div class="warn"><p><b>Common mistake.</b> Switching every signature to block on day one. A busy network then fails in strange ways: updates, internal tools and scanners are interrupted. Run entry actions in <code>pass</code> with logging, review which signatures fire for a week, then move proven ones to block.</p></div>
<div class="exam"><p><b>Exam trap.</b> IPS sensor entries filter by severity, location, protocol, OS and application. Actions are pass, block, reset (and default). IPS is not the same as a DoS policy. And IPS needs readable traffic: attacks inside encrypted sessions need deep inspection to be seen.</p></div>

<div class="scn"><h4>Alert fatigue after "block everything"</h4><p>A new administrator enabled the <code>all_default</code> sensor with all actions on block for a branch of 200 users. The next morning the help desk had 40 tickets: a vendor's patch tool matched a signature and was reset every time. The administrator switched the sensor to monitor, collected logs for a week, then moved only high-severity client-side signatures to block and added a narrow exemption for the patch server's address.</p><p><b>Lesson:</b> tune with evidence; keep exemptions narrow and documented.</p></div>

<div class="iv"><p class="q">"How would you roll out IPS on a production firewall?"</p><p>Start from a built-in sensor suited to the protected asset (client or server), set actions to pass with logging, attach it to the right policy, review the logs for patterns and false positives, tune with narrow exemptions, then move critical and high severity signatures to block. Keep signatures updated and check CPU. Mention that encrypted traffic needs deep inspection.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IPS sensor entries select signatures by severity, location, protocol, OS and application.</li>
<li>Actions: pass (monitor), block, reset, default; add rate-based, quarantine and packet logging when needed.</li>
<li>Roll out in monitor first; tune with narrow exemptions.</li>
<li>IPS matches patterns; DoS policy counts rates.</li>
<li>Encrypted attacks are visible only with deep inspection.</li>
</ul></div>
`,hi:`
<p><b>Intrusion prevention system (IPS)</b> traffic mein aise patterns dekhta hai jo known attack techniques se match karte hain, jaise web server ya database ki kamzori exploit karne ki koshish. Socho ek security guard hai jiske paas known break-in methods ki moti kitaab hai aur woh har visitor ke behaviour ko usse match karta hai. Behaviour kitaab ke kisi page se match ho to guard rokta hai aur report likhta hai. Is course mein saare threats simulated hain: hum <i>test markers se match hone wale signatures</i> ki baat karte hain, real exploit code ki kabhi nahi.</p>

<h3>Signatures, sensors aur IPS kahan chalta hai</h3>
<p>FortiGuard hazaaron <b>IPS signatures</b> publish karta hai. Har ek ka naam, <b>severity</b> (info, low, medium, high, critical), <b>location</b> (server-side ya client-side attack), target <b>protocol</b> aur <b>operating system</b>, ek <b>application</b> aur default <b>action</b> hota hai. Jo profile chunta hai ki kaunse signatures active hain aur kya karna hai use <b>IPS sensor</b> kehte hain. Yeh numbered <b>entries</b> se bana hai; har entry ek filter hai ("server ko target karne wale saare critical aur high signatures") ya ek named signature.</p>

<p><b>Reference configuration (not run in the simulator)</b></p>
<pre class="code">config ips sensor
    edit "NK-IPS"
        set comment "Pune LAN-to-WAN: block severe, log the rest"
        set block-malicious-url enable
        config entries
            edit 1
                set location client
                set severity critical high
                set status enable
                set action block
                set log enable
            next
            edit 2
                set severity medium
                set status enable
                set action pass
                set log enable
            next
        end
    next
end</pre>
<p>Entry 1 serious client-side attacks block karti hai, jo browsing karte users ke liye threat hai. Entry 2 sirf medium severity monitor karti hai: logging ke saath <code>pass</code>, yaani IPS "monitor" mode. DMZ ke <b>servers</b> ko protect karne wali policy ke liye aap <code>location server</code> use karoge. Built-in sensors maujood hain (<code>default</code>, <code>all_default</code>, <code>all_default_pass</code>, <code>high_security</code>, <code>protect_client</code>, <code>protect_email_server</code>, <code>protect_h&#116;tp_server</code>) aur acche starting points hain; ek clone karo, phir adjust.</p>

<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="IPS flow">
<rect x="20" y="25" width="133" height="70" rx="10" fill="#bae6fd"/><text x="86.5" y="54" text-anchor="middle" class="svg-ink" font-size="11.8">Traffic accepted</text><text x="86.5" y="72" text-anchor="middle" class="svg-muted" font-size="10.8">policy ne</text><line x1="153" y1="60" x2="175" y2="60" stroke="#64748b" stroke-width="2"/><path d="M169 55 L175 60 L169 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="175" y="25" width="133" height="70" rx="10" fill="#bbf7d0"/><text x="241.5" y="54" text-anchor="middle" class="svg-ink" font-size="11.8">Pattern match</text><text x="241.5" y="72" text-anchor="middle" class="svg-muted" font-size="10.8">signature database</text><line x1="308" y1="60" x2="330" y2="60" stroke="#64748b" stroke-width="2"/><path d="M324 55 L330 60 L324 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="330" y="25" width="133" height="70" rx="10" fill="#ddd6fe"/><text x="396.5" y="54" text-anchor="middle" class="svg-ink" font-size="11.8">Entry action</text><text x="396.5" y="72" text-anchor="middle" class="svg-muted" font-size="10.8">block, reset, pass</text><line x1="463" y1="60" x2="485" y2="60" stroke="#64748b" stroke-width="2"/><path d="M479 55 L485 60 L479 65" fill="none" stroke="#64748b" stroke-width="2"/>
<rect x="485" y="25" width="133" height="70" rx="10" fill="#fde68a"/><text x="551.5" y="54" text-anchor="middle" class="svg-ink" font-size="11.8">Log</text><text x="551.5" y="72" text-anchor="middle" class="svg-muted" font-size="10.8">attack name, severity</text>
</svg><p class="cap">IPS accepted traffic ko signatures se compare karta hai aur matching sensor entry ka action lagata hai.</p></div>

<h3>Actions</h3>
<ul>
<li><b>pass</b>: allow aur log (monitor mode, shuru ke dino ke liye ideal).</li>
<li><b>block</b>: offending packets aur session drop karo, aur log.</li>
<li><b>reset</b>: dono ends ko TCP resets bhejo, silent drop se application ke liye saaf.</li>
<li><b>default</b>: us signature ke liye FortiGuard ka recommended action use karo.</li>
</ul>
<p>Extra controls: <b>rate-based</b> signatures jo time window mein threshold ke baad hi trigger hote hain (brute-force ya scan patterns ke liye), attacker address ka kuch der ke liye <b>quarantine</b>, analysis ke liye offending packet rakhne wala packet logging (<code>log-packet</code>), known botnet command servers se connections detect karne wala <code>scan-botnet-connections</code>, aur trusted scanner ke liye source/destination IP exemptions jo warna block ho jaata.</p>

<h3>IPS DoS policy nahi hai</h3>
<p>Service ko flood karne wale volume attacks alag feature, <b>DoS policy</b> (<code>config firewall DoS-policy</code>), anomaly checks jaise SYN flood ya UDP flood thresholds ke saath handle karti hai. IPS signatures content patterns match karte hain; DoS policies rates count karti hain. Exam is difference ko pasand karta hai.</p>

<h3>Performance aur false positives</h3>
<p>Har active signature CPU leta hai. Sirf apne assets se related signatures chunna (server ya client, aapke operating systems, aapke protocols) sensor ko lean rakhta hai. <b>False positive</b> woh legitimate flow hai jo kisi signature se match ho jaaye; use us specific signature aur source ke narrow exemption se handle karo, poora sensor disable karke nahi. Kuch FortiGate models IPS ka hissa hardware par offload kar sakte hain; sensor definition wahi rehti hai.</p>

<div class="eg"><p><b>Worked example.</b> <code>10.0.1.50</code> par ek developer FortiGate ke through internal lab server ke khilaaf query string mein marker <code>nk-sim=sqli</code> ke saath test chalata hai. IPS log mein pattern ke naam wala attack dikhega, severity high, action blocked, source 10.0.1.50, destination lab server, aur policy ID. Marker harmless hai; students safely detection trigger kar sakein isliye hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> Pehle din hi har signature block par kar dena. Busy network phir ajeeb tareeke se fail hota hai: updates, internal tools aur scanners ruk jaate hain. Entry actions <code>pass</code> with logging par chalao, ek hafta dekho kaun se signatures fire hote hain, phir proven wale block par le jao.</p></div>
<div class="exam"><p><b>Exam trap.</b> IPS sensor entries severity, location, protocol, OS aur application se filter karti hain. Actions pass, block, reset (aur default) hain. IPS aur DoS policy ek nahi hain. Aur IPS ko readable traffic chahiye: encrypted sessions ke andar ke attacks dekhne ke liye deep inspection chahiye.</p></div>

<div class="scn"><h4>"Sab block karo" ke baad alert fatigue</h4><p>Naye administrator ne 200 users ke branch ke liye <code>all_default</code> sensor saare actions block ke saath enable kiya. Agli subah help desk ke paas 40 tickets the: ek vendor ka patch tool signature se match hua aur har baar reset hota raha. Administrator ne sensor monitor par kiya, ek hafta logs jama kiye, phir sirf high-severity client-side signatures block par move kiye aur patch server ke address ke liye narrow exemption jodi.</p><p><b>Lesson:</b> evidence se tune karo; exemptions narrow aur documented rakho.</p></div>

<div class="iv"><p class="q">"Production firewall par IPS ka rollout kaise karoge?"</p><p>Protected asset (client ya server) ke liye suitable built-in sensor se shuru karo, actions pass with logging par set karo, sahi policy se attach karo, patterns aur false positives ke liye logs review karo, narrow exemptions se tune karo, phir critical aur high severity signatures block par le jao. Signatures updated rakho aur CPU check karo. Batao ki encrypted traffic ko deep inspection chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IPS sensor entries severity, location, protocol, OS aur application se signatures select karti hain.</li>
<li>Actions: pass (monitor), block, reset, default; zaroorat par rate-based, quarantine aur packet logging jodo.</li>
<li>Pehle monitor mein rollout; narrow exemptions se tune karo.</li>
<li>IPS patterns match karta hai; DoS policy rates count karti hai.</li>
<li>Encrypted attacks sirf deep inspection se dikhte hain.</li>
</ul></div>
`}};export{e as default};