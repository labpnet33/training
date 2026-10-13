var e={id:`troubleshooting`,h:{en:`Troubleshooting Panorama: connection, commit and push problems`,hi:`Panorama troubleshooting: connection, commit aur push problems`},body:{en:`
<p>Panorama problems fall into a small number of groups. Work through them in order and write down what you see.</p>
<div class="note"><p><b>Note.</b> No Panorama lab exists in the simulator yet. The commands below are real PAN-OS commands; the cases are reference descriptions (not run in the simulator).</p></div>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Check in order: connection, assignment, validation, push job, then sync state."><rect x="20" y="40" width="100" height="80" rx="10" fill="#bae6fd"/><text x="70" y="86" text-anchor="middle" class="svg-ink" font-size="14">Connected?</text><line x1="120" y1="80" x2="144" y2="80" stroke="#64748b" stroke-width="2"/><rect x="144" y="40" width="100" height="80" rx="10" fill="#bbf7d0"/><text x="194" y="86" text-anchor="middle" class="svg-ink" font-size="14">Licensed + in DG?</text><line x1="244" y1="80" x2="268" y2="80" stroke="#64748b" stroke-width="2"/><rect x="268" y="40" width="100" height="80" rx="10" fill="#ddd6fe"/><text x="318" y="86" text-anchor="middle" class="svg-ink" font-size="14">Commit valid?</text><line x1="368" y1="80" x2="392" y2="80" stroke="#64748b" stroke-width="2"/><rect x="392" y="40" width="100" height="80" rx="10" fill="#fde68a"/><text x="442" y="86" text-anchor="middle" class="svg-ink" font-size="14">Push job ok?</text><line x1="492" y1="80" x2="516" y2="80" stroke="#64748b" stroke-width="2"/><rect x="516" y="40" width="100" height="80" rx="10" fill="#fed7aa"/><text x="566" y="86" text-anchor="middle" class="svg-ink" font-size="14">In sync?</text></svg><p class="cap">Check in order: connection, assignment, validation, push job, then sync state.</p></div>
<h3>Group 1: the firewall does not connect</h3>
<p>Symptoms: the device shows Disconnected in Managed Devices, or never appears as Connected.</p>
<pre class="code">show panorama-status
show devices connected
show system info</pre>
<p>On the firewall <code>show panorama-status</code> shows the Panorama address and the connection state. Check in order:</p>
<ul>
<li><b>Address</b>: the Panorama server is set on the firewall and is reachable (ping from the management interface or the interface used for the service route).</li>
<li><b>TCP 3978</b>: allowed in both directions on every device in the path; the firewall initiates it.</li>
<li><b>Registration</b>: the serial is added on Panorama, or a valid, unexpired registration key was used.</li>
<li><b>Time</b>: both sides use NTP; large clock differences break certificate validation.</li>
<li><b>Certificates</b>: a custom certificate profile or an expired device certificate can stop the secure channel.</li>
<li><b>Licensing</b>: the device must be known and allowed under the Panorama management licence.</li>
</ul>
<h3>Group 2: the commit fails validation</h3>
<p>Typical messages name an object or a reference. Read them literally.</p>
<ul>
<li><b>Object not found</b>: a rule refers to an address or profile that is not visible in that device group, often because the object sits in a sibling group, not in Shared or an ancestor. Move the object up or define it in the right place.</li>
<li><b>Zone not found</b>: a device group rule uses a zone that the firewall's template stack does not define. Add the zone to the template or fix the name.</li>
<li><b>Interface or virtual router missing</b>: a template refers to an interface the device does not have (the model differs). Use a model-specific template or a variable of type interface.</li>
<li><b>Variable has no value</b>: set the variable for that device.</li>
<li><b>Duplicate name or conflict</b>: two objects with the same name at conflicting scopes.</li>
</ul>
<p>Use <b>Validate Commit</b> and read the warnings too; a warning may be the first sign of a rule that will never match.</p>
<h3>Group 3: the push job fails or partly fails</h3>
<pre class="code">show jobs all</pre>
<p>Open the job and read the detail for each device. Common causes are a local configuration conflict, a commit lock held on the firewall, a firewall that is busy with another commit, and a failed local validation. One failing device does not stop the others. Fix and push again to that device only.</p>
<h3>Group 4: Out of Sync after a push</h3>
<ul>
<li>A local administrator changed the firewall. Compare, decide whether the change is legitimate, and either move it to Panorama or push with Force Template Values after approval.</li>
<li>A new commit on Panorama has not been pushed yet. That is a pending push, not a fault.</li>
<li>A firewall was offline during the push. Check its connection and push again.</li>
</ul>
<h3>Group 5: policy does not behave as expected</h3>
<p>The rule order is shared pre, device group pre, local, device group post, shared post, defaults. Verify from the firewall:</p>
<pre class="code">show config pushed-shared-policy
show config pushed-template</pre>
<p>Check hit counts for the rule, tags, targets (a rule might exclude this device), and zones. Use the security-policy match test on the firewall to see the rule that wins.</p>
<h3>Logs on the management plane</h3>
<p>For deep troubleshooting, Palo Alto support asks for management-plane logs. On the CLI you can read the management server log, for example with <code>less mp-log ms.log</code>, and the configuration daemon log with <code>less mp-log configd.log</code>. Export a technical support file when you open a case, and remove anything sensitive you do not want to share.</p>
<div class="eg"><p><b>Worked example.</b> A new branch firewall shows Disconnected. show panorama-status on the firewall shows the correct Panorama address but no connection. A router ACL on the path blocks TCP 3978 outbound. After adding the permit, the status turns Connected and the first push succeeds.</p></div>
<div class="warn"><p><b>Common mistake.</b> Forcing a push repeatedly while a commit is failing validation. Read the first error; it is usually a single missing object or zone.</p></div>
<div class="exam"><p><b>Exam trap.</b> The firewall initiates the connection on TCP 3978. Most commit validation errors are missing objects (device group scope) or missing zones (template stack). Check job details for each device.</p></div>
<div class="scn"><h4>Commit failed: zone not found</h4><p>After adding a rule for a new DMZ zone, the commit failed with a message that the zone was not found for several firewalls. The device group rule named DMZ, but the template stack for those firewalls had not received the template where DMZ was defined. The engineer added the template to the stack, validated, and pushed.</p><p><b>Lesson:</b> the device group and the template stack must agree about names.</p></div>
<div class="iv"><p class="q">"A commit and push from Panorama failed. How do you investigate?"</p><p>Run Validate Commit and read the exact error, then open the push job details per device. The common causes are objects not visible in the device group, zones missing from the template stack, a variable with no value, a lock, or a firewall that is disconnected. Fix, validate again, and push only to the failed devices.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Check connection first: address, TCP 3978, registration, time, certificates.</li><li>Validation errors usually name a missing object or zone.</li><li>Read push job details per device; one failure does not block others.</li><li>Out of Sync means drift or a pending push; investigate before forcing values.</li><li>Use show panorama-status and show jobs all as first commands.</li></ul></div>
`,hi:`
<p>Panorama problems kam groups mein aati hain. Unhe kram se dekho aur jo dikhe woh likhte jao.</p>
<div class="note"><p><b>Note.</b> Simulator mein abhi Panorama lab nahi hai. Neeche ke commands real PAN-OS commands hain; cases reference descriptions hain (simulator mein nahi chalte).</p></div>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Kram se check karo: connection, assignment, validation, push job, phir sync state."><rect x="20" y="40" width="100" height="80" rx="10" fill="#bae6fd"/><text x="70" y="86" text-anchor="middle" class="svg-ink" font-size="14">Connected?</text><line x1="120" y1="80" x2="144" y2="80" stroke="#64748b" stroke-width="2"/><rect x="144" y="40" width="100" height="80" rx="10" fill="#bbf7d0"/><text x="194" y="86" text-anchor="middle" class="svg-ink" font-size="14">Licensed + DG mein?</text><line x1="244" y1="80" x2="268" y2="80" stroke="#64748b" stroke-width="2"/><rect x="268" y="40" width="100" height="80" rx="10" fill="#ddd6fe"/><text x="318" y="86" text-anchor="middle" class="svg-ink" font-size="14">Commit valid?</text><line x1="368" y1="80" x2="392" y2="80" stroke="#64748b" stroke-width="2"/><rect x="392" y="40" width="100" height="80" rx="10" fill="#fde68a"/><text x="442" y="86" text-anchor="middle" class="svg-ink" font-size="14">Push job ok?</text><line x1="492" y1="80" x2="516" y2="80" stroke="#64748b" stroke-width="2"/><rect x="516" y="40" width="100" height="80" rx="10" fill="#fed7aa"/><text x="566" y="86" text-anchor="middle" class="svg-ink" font-size="14">In sync?</text></svg><p class="cap">Kram se check karo: connection, assignment, validation, push job, phir sync state.</p></div>
<h3>Group 1: firewall connect nahi hota</h3>
<p>Symptoms: Managed Devices mein device Disconnected dikhta hai, ya kabhi Connected nahi dikhta.</p>
<pre class="code">show panorama-status
show devices connected
show system info</pre>
<p>Firewall par <code>show panorama-status</code> Panorama address aur connection state dikhata hai. Kram se check karo:</p>
<ul>
<li><b>Address</b>: firewall par Panorama server set hai aur reachable hai (management interface ya service route wale interface se ping karo).</li>
<li><b>TCP 3978</b>: raaste ke har device par dono directions mein allowed; firewall isse initiate karta hai.</li>
<li><b>Registration</b>: Panorama par serial add hai, ya valid, unexpired registration key use hui.</li>
<li><b>Time</b>: dono sides NTP use karein; bade clock difference certificate validation tod dete hain.</li>
<li><b>Certificates</b>: custom certificate profile ya expired device certificate secure channel rok sakte hain.</li>
<li><b>Licensing</b>: device Panorama management licence ke under known aur allowed hona chahiye.</li>
</ul>
<h3>Group 2: commit validation fail hota hai</h3>
<p>Typical messages kisi object ya reference ka naam batate hain. Unhe literally padho.</p>
<ul>
<li><b>Object not found</b>: rule aisa address ya profile refer karti hai jo us device group mein visible nahi, aksar kyunki object sibling group mein hai, Shared ya ancestor mein nahi. Object ko upar le jao ya sahi jagah define karo.</li>
<li><b>Zone not found</b>: device group rule aisi zone use karti hai jo firewall ka template stack define nahi karta. Template mein zone jodo ya naam theek karo.</li>
<li><b>Interface ya virtual router missing</b>: template aisa interface refer karta hai jo device ke paas nahi hai (model alag hai). Model-specific template ya interface type ka variable use karo.</li>
<li><b>Variable has no value</b>: us device ke liye variable set karo.</li>
<li><b>Duplicate name ya conflict</b>: do objects same naam ke conflicting scopes mein.</li>
</ul>
<p><b>Validate Commit</b> use karo aur warnings bhi padho; warning us rule ka pehla sanket ho sakti hai jo kabhi match nahi karegi.</p>
<h3>Group 3: push job fail ya partly fail</h3>
<pre class="code">show jobs all</pre>
<p>Job kholkar har device ka detail padho. Common causes: local configuration conflict, firewall par commit lock, firewall kisi aur commit mein busy, aur failed local validation. Ek failing device baaki ko nahi rokta. Fix karo aur sirf us device par dobara push karo.</p>
<h3>Group 4: Push ke baad Out of Sync</h3>
<ul>
<li>Local administrator ne firewall badla. Compare karo, decide karo ki change legitimate hai ya nahi, aur ya to use Panorama mein move karo ya approval ke baad Force Template Values se push karo.</li>
<li>Panorama par naya commit abhi push nahi hua. Yeh pending push hai, fault nahi.</li>
<li>Push ke dauran firewall offline tha. Connection check karo aur dobara push karo.</li>
</ul>
<h3>Group 5: policy expected behave nahi karti</h3>
<p>Rule order hai shared pre, device group pre, local, device group post, shared post, defaults. Firewall se verify karo:</p>
<pre class="code">show config pushed-shared-policy
show config pushed-template</pre>
<p>Rule ke hit counts, tags, targets (ho sakta hai rule is device ko exclude karti ho) aur zones check karo. Firewall par security-policy match test se dekho kaunsi rule jeet rahi hai.</p>
<h3>Management plane ke logs</h3>
<p>Deep troubleshooting ke liye Palo Alto support management-plane logs maangta hai. CLI par management server log aise padh sakte ho: <code>less mp-log ms.log</code>, aur configuration daemon log <code>less mp-log configd.log</code>. Case kholte waqt technical support file export karo, aur jo sensitive share nahi karna use hata do.</p>
<div class="eg"><p><b>Worked example.</b> Naya branch firewall Disconnected dikhata hai. Firewall par show panorama-status sahi Panorama address dikhata hai par connection nahi. Raaste ka router ACL TCP 3978 outbound block karta hai. Permit jodne ke baad status Connected ho jaata hai aur pehla push succeed hota hai.</p></div>
<div class="warn"><p><b>Common mistake.</b> Commit validation fail ho raha ho tab baar-baar push force karna. Pehla error padho; yeh aksar ek missing object ya zone hota hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Firewall TCP 3978 par connection initiate karta hai. Zyadatar commit validation errors missing objects (device group scope) ya missing zones (template stack) hote hain. Har device ke job details check karo.</p></div>
<div class="scn"><h4>Commit failed: zone not found</h4><p>Naye DMZ zone ke liye rule jodne ke baad kai firewalls ke liye commit fail hua aur message aaya ki zone nahi mili. Device group rule DMZ naam leti thi, par un firewalls ke template stack ko woh template nahi mila tha jisme DMZ define tha. Engineer ne template stack mein jodi, validate kiya, aur push kiya.</p><p><b>Lesson:</b> device group aur template stack ko names par agree hona padta hai.</p></div>
<div class="iv"><p class="q">"Panorama se commit aur push fail hua. Kaise investigate karoge?"</p><p>Validate Commit chalao aur exact error padho, phir har device ka push job detail kholo. Common causes: device group mein visible nahi objects, template stack mein missing zones, bina value ka variable, lock, ya disconnected firewall. Fix karo, dobara validate karo, aur sirf failed devices par push karo.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Pehle connection check karo: address, TCP 3978, registration, time, certificates.</li><li>Validation errors aksar missing object ya zone ka naam batate hain.</li><li>Har device ka push job detail padho; ek failure baaki ko nahi rokta.</li><li>Out of Sync matlab drift ya pending push; values force karne se pehle investigate karo.</li><li>show panorama-status aur show jobs all pehle commands hain.</li></ul></div>
`}};export{e as default};