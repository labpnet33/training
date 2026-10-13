var e={id:`client-vs-cli-and-summary`,h:{en:`Management Client vs engine command line, and the module summary`,hi:`Management Client vs engine command line, aur module summary`},body:{en:`
<p>A car has a dashboard and a mechanic's toolbox. You drive with the dashboard: steering, pedals, indicators. You open the toolbox only when the car will not start. The <b>Management Client</b> is the dashboard of an NGFW. The <b>engine command line</b> is the toolbox. Almost all daily work is done in the Management Client; the command line is for first contact, reconfiguration and troubleshooting.</p>

<h3>What each one is for</h3>
<table class="cmp"><tr><th></th><th>Management Client (SMC)</th><th>Engine command line</th></tr>
<tr><td>Used for</td><td>Elements, policies, engine settings, install, logs, monitoring</td><td>Initial contact, reconfiguration, local checks</td></tr>
<tr><td>Scope</td><td>Many engines from one place</td><td>One node</td></tr>
<tr><td>Changes are</td><td>Stored in the SMC and installed</td><td>Local and limited; not the place to edit rules</td></tr>
<tr><td>Simulator page</td><td>Engines, Elements, Policies, Inspection, VPN, Logs, Monitoring and alerts, Tools</td><td>The FW1 terminal and its simulator forms</td></tr>
</table>

<h3>The documented engine tools</h3>
<dl class="terms">
<dt>sg-status</dt><dd>Shows the status of the node and its configuration state. With <code>-l</code> a longer listing.</dd>
<dt>sg-version</dt><dd>Shows the engine software version.</dd>
<dt>sg-contact-mgmt</dt><dd>Contacts the Management Server and establishes trust, using the one-time password from the engine's initial configuration.</dd>
<dt>sg-reconfigure</dt><dd>Starts the NGFW Configuration Wizard to change local settings such as the control interface; with <code>--no-shutdown</code> the node is not shut down first. Check the documentation for your NGFW version before using it on a live node.</dd>
</dl>
<p>Other tools exist (for example sg-clear-all, sg-cluster, sginfo) and ordinary Linux tools such as ip, ping, traceroute and tcpdump; later modules use some. In the simulator, the terminal accepts <b>forms</b> of these commands that are enough for the labs. Everything that you run in the simulator is simulated. Anything else shown here is labelled <i>Reference configuration (not run in the simulator)</i>.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Where to do what">
<rect x="20" y="20" width="270" height="170" rx="12" fill="#ddd6fe"/><text x="155" y="46" text-anchor="middle" class="svg-ink" font-size="14">Management Client</text>
<text x="155" y="78" text-anchor="middle" class="svg-ink" font-size="12">create engine element</text><text x="155" y="100" text-anchor="middle" class="svg-ink" font-size="12">elements and rules</text><text x="155" y="122" text-anchor="middle" class="svg-ink" font-size="12">Install policy</text><text x="155" y="144" text-anchor="middle" class="svg-ink" font-size="12">logs and monitoring</text><text x="155" y="172" text-anchor="middle" class="svg-muted" font-size="11">daily work</text>
<rect x="350" y="20" width="270" height="170" rx="12" fill="#bbf7d0"/><text x="485" y="46" text-anchor="middle" class="svg-ink" font-size="14">Engine command line</text>
<text x="485" y="78" text-anchor="middle" class="svg-ink" font-size="12">sg-contact-mgmt (first contact)</text><text x="485" y="100" text-anchor="middle" class="svg-ink" font-size="12">sg-status, sg-version (check)</text><text x="485" y="122" text-anchor="middle" class="svg-ink" font-size="12">sg-reconfigure (local setup)</text><text x="485" y="144" text-anchor="middle" class="svg-ink" font-size="12">ping, tcpdump (troubleshoot)</text><text x="485" y="172" text-anchor="middle" class="svg-muted" font-size="11">first contact and fault finding</text>
</svg><p class="cap">Rules are never typed on the engine. They are written in the SMC and installed.</p></div>

<h3>Troubleshooting first contact</h3>
<p>If the engine does not leave Unknown or does not become Online, work down this list:</p>
<ol>
<li>Is the control IP in the engine element equal to the real control address (10.0.0.1)? Is the SMC address in the command correct (10.0.0.10)?</li>
<li>Can the engine ping the SMC, and the SMC reach the engine? Check routing and any firewall or NAT in between, TCP 8902 included.</li>
<li>Was the one-time password typed exactly and is it the current one? Create a new one if unsure.</li>
<li>Does the status say No Policy Installed? Then contact is fine; install the Initial Policy.</li>
<li>Installed, but contact lost again? The installed policy may not allow SMC contact. Reinstall a policy that does.</li>
</ol>
<pre class="out">FW1# sg-status
Node: NK-PUNE-FW  node 1
Configuration state: <span class="hl">Online</span>
Policy: <span class="hl">Initial Policy</span>
Contact with Management Server: OK  (10.0.0.10)</pre>
<p>The layout above is the simulator's teaching form; real output differs by release, so check the documentation for your NGFW version.</p>

<h3>Summary and exam checklist</h3>
<h4>Can-do checklist</h4>
<ul>
<li>Explain source, destination, service, action, first match and stateful return traffic.</li>
<li>Name the SMC components and the engine roles, and say where policy lives and where traffic is processed.</li>
<li>Create hosts, networks and services with a clear naming style, and explain aliases.</li>
<li>Explain template rules (T1), policy rules and Jump to a sub-policy (3.1).</li>
<li>Create an engine element, take the one-time password, run sg-contact-mgmt, and read the status changes.</li>
<li>Run the install workflow and distinguish errors from warnings.</li>
<li>Choose between Management Client and the engine command line for a given task.</li>
</ul>
<h4>Mini glossary</h4>
<dl class="terms">
<dt>SMC</dt><dd>Security Management Center: Management Server, Log Server, Web Portal Server.</dd>
<dt>Engine</dt><dd>The component that processes traffic using the installed policy.</dd>
<dt>Element</dt><dd>A named object (host, network, service, alias) used in rules.</dd>
<dt>Template</dt><dd>A policy whose rules are inherited at the top of other policies.</dd>
<dt>Sub-policy</dt><dd>A rule list entered with Jump.</dd>
<dt>Contact address</dt><dd>A translated address for an SMC component seen from another Location.</dd>
<dt>Pending changes</dt><dd>Edits in the SMC that are not yet installed on the engine.</dd>
</dl>
<h4>Most tested facts</h4>
<ul>
<li>First contact creates trust with a one-time password; status goes Unknown, No Policy Installed, Online.</li>
<li>Errors block an install, warnings do not; a failed install changes nothing.</li>
<li>A missing element or alias value is an error. Rule order decides; shadowed rules warn.</li>
<li>Lab 1 passes when the engine is Online with the Initial Policy installed. Lab 2 needs elements used in a rule and then Install policy.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Trying to fix a rule problem on the engine command line. Rules come from the SMC. Fix them there and install.</p></div>
<div class="exam"><p><b>Exam trap.</b> Do not mix up the tools: sg-contact-mgmt is for first contact, sg-status shows state, sg-reconfigure changes local setup. This track is independent of any certification; check Forcepoint's current training and certification pages before you book an exam.</p></div>

<div class="scn"><h4>The 2 am call from Pune</h4><p>The Pune branch lost its link to the SMC after a power cut, and the on-call engineer could not use the Management Client for the engine. Using the FW1 terminal, they ran sg-status, saw no contact with the Management Server, and pinged 10.0.0.10 which failed. The switch on the management network had not come back up. After the switch was power-cycled, contact returned without any rule change.</p><p><b>Lesson:</b> check reachability before touching policy.</p></div>

<div class="iv"><p class="q">"When would you use the engine command line instead of the Management Client?"</p><p>Strong answer: for initial contact with sg-contact-mgmt, for local reconfiguration with sg-reconfigure, and for troubleshooting with sg-status, ping and tcpdump. Rules and elements are managed in the Management Client and installed from the SMC.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The Management Client is for daily work; the engine command line is for first contact and fault finding.</li>
<li>Documented tools: sg-status, sg-version, sg-contact-mgmt, sg-reconfigure.</li>
<li>First-contact faults are usually addresses, reachability or the one-time password.</li>
<li>No Policy Installed means contact works.</li>
<li>Rules are written in the SMC and installed, never typed on the engine.</li>
</ul></div>
`,hi:`
<p>Gaadi mein dashboard hota hai aur mechanic ka toolbox. Aap dashboard se chalate ho: steering, pedals, indicators. Toolbox tabhi kholte ho jab gaadi start nahi hoti. <b>Management Client</b> NGFW ka dashboard hai. <b>Engine command line</b> toolbox hai. Roz ka lagbhag saara kaam Management Client mein hota hai; command line first contact, reconfiguration aur troubleshooting ke liye hai.</p>

<h3>Har ek kis kaam ka hai</h3>
<table class="cmp"><tr><th></th><th>Management Client (SMC)</th><th>Engine command line</th></tr>
<tr><td>Use</td><td>Elements, policies, engine settings, install, logs, monitoring</td><td>Initial contact, reconfiguration, local checks</td></tr>
<tr><td>Scope</td><td>Ek jagah se kai engines</td><td>Ek node</td></tr>
<tr><td>Changes</td><td>SMC mein store hote hain aur install hote hain</td><td>Local aur limited; rules edit karne ki jagah nahi</td></tr>
<tr><td>Simulator page</td><td>Engines, Elements, Policies, Inspection, VPN, Logs, Monitoring and alerts, Tools</td><td>FW1 terminal aur uske simulator forms</td></tr>
</table>

<h3>Documented engine tools</h3>
<dl class="terms">
<dt>sg-status</dt><dd>Node ka status aur configuration state dikhata hai. <code>-l</code> ke saath lambi listing.</dd>
<dt>sg-version</dt><dd>Engine software version dikhata hai.</dd>
<dt>sg-contact-mgmt</dt><dd>Management Server se contact karta hai aur engine ki initial configuration ke one-time password se trust establish karta hai.</dd>
<dt>sg-reconfigure</dt><dd>NGFW Configuration Wizard shuru karta hai taki local settings (jaise control interface) badal sako; <code>--no-shutdown</code> ke saath node pehle shut down nahi hota. Live node par use karne se pehle apne NGFW version ki documentation check karo.</dd>
</dl>
<p>Aur tools bhi hain (jaise sg-clear-all, sg-cluster, sginfo) aur ordinary Linux tools jaise ip, ping, traceroute aur tcpdump; kuch aage ke modules mein use honge. Simulator mein terminal in commands ke <b>forms</b> accept karta hai jo labs ke liye kaafi hain. Simulator mein jo bhi chalate ho woh simulated hai. Yahan jo bhi aur dikhaya gaya hai use <i>Reference configuration (not run in the simulator)</i> label kiya gaya hai.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Kya kahan karna hai">
<rect x="20" y="20" width="270" height="170" rx="12" fill="#ddd6fe"/><text x="155" y="46" text-anchor="middle" class="svg-ink" font-size="14">Management Client</text>
<text x="155" y="78" text-anchor="middle" class="svg-ink" font-size="12">engine element banao</text><text x="155" y="100" text-anchor="middle" class="svg-ink" font-size="12">elements aur rules</text><text x="155" y="122" text-anchor="middle" class="svg-ink" font-size="12">Install policy</text><text x="155" y="144" text-anchor="middle" class="svg-ink" font-size="12">logs aur monitoring</text><text x="155" y="172" text-anchor="middle" class="svg-muted" font-size="11">roz ka kaam</text>
<rect x="350" y="20" width="270" height="170" rx="12" fill="#bbf7d0"/><text x="485" y="46" text-anchor="middle" class="svg-ink" font-size="14">Engine command line</text>
<text x="485" y="78" text-anchor="middle" class="svg-ink" font-size="12">sg-contact-mgmt (first contact)</text><text x="485" y="100" text-anchor="middle" class="svg-ink" font-size="12">sg-status, sg-version (check)</text><text x="485" y="122" text-anchor="middle" class="svg-ink" font-size="12">sg-reconfigure (local setup)</text><text x="485" y="144" text-anchor="middle" class="svg-ink" font-size="12">ping, tcpdump (troubleshoot)</text><text x="485" y="172" text-anchor="middle" class="svg-muted" font-size="11">first contact aur fault finding</text>
</svg><p class="cap">Rules engine par kabhi type nahi karte. Woh SMC mein likhe jaate hain aur install hote hain.</p></div>

<h3>First contact troubleshooting</h3>
<p>Engine Unknown se aage na badhe ya Online na ho to is list par neeche chalo:</p>
<ol>
<li>Kya engine element ka control IP asli control address (10.0.0.1) ke barabar hai? Command mein SMC address sahi hai (10.0.0.10)?</li>
<li>Kya engine SMC ko ping kar sakta hai, aur SMC engine tak pahunch sakta hai? Beech ki routing aur koi firewall ya NAT dekho, TCP 8902 samet.</li>
<li>Kya one-time password bilkul sahi type hua aur current hai? Shak ho to naya banao.</li>
<li>Status No Policy Installed hai? To contact theek hai; Initial Policy install karo.</li>
<li>Install ke baad phir contact toot gaya? Installed policy shayad SMC contact allow nahi karti. Aisi policy dobara install karo jo karti ho.</li>
</ol>
<pre class="out">FW1# sg-status
Node: NK-PUNE-FW  node 1
Configuration state: <span class="hl">Online</span>
Policy: <span class="hl">Initial Policy</span>
Contact with Management Server: OK  (10.0.0.10)</pre>
<p>Upar ka layout simulator ka teaching form hai; real output release ke hisaab se alag hota hai, isliye apne NGFW version ki documentation check karo.</p>

<h3>Summary aur exam checklist</h3>
<h4>Can-do checklist</h4>
<ul>
<li>Source, destination, service, action, first match aur stateful return traffic samjha sako.</li>
<li>SMC components aur engine roles ke naam batao, aur bolo policy kahan rehti hai aur traffic kahan process hota hai.</li>
<li>Clear naming style ke saath hosts, networks aur services banao, aur aliases samjhao.</li>
<li>Template rules (T1), policy rules aur sub-policy ko Jump (3.1) samjhao.</li>
<li>Engine element banao, one-time password lo, sg-contact-mgmt chalao, aur status changes padho.</li>
<li>Install workflow chalao aur errors ko warnings se alag pehchano.</li>
<li>Kisi task ke liye Management Client aur engine command line mein se chuno.</li>
</ul>
<h4>Mini glossary</h4>
<dl class="terms">
<dt>SMC</dt><dd>Security Management Center: Management Server, Log Server, Web Portal Server.</dd>
<dt>Engine</dt><dd>Woh component jo installed policy se traffic process karta hai.</dd>
<dt>Element</dt><dd>Rules mein use hone wala named object (host, network, service, alias).</dd>
<dt>Template</dt><dd>Policy jiske rules doosri policies ke top par inherit hote hain.</dd>
<dt>Sub-policy</dt><dd>Rule list jisme Jump se enter karte hain.</dd>
<dt>Contact address</dt><dd>Doosri Location se dikhne wale SMC component ka translated address.</dd>
<dt>Pending changes</dt><dd>SMC ke woh edits jo abhi engine par install nahi hue.</dd>
</dl>
<h4>Most tested facts</h4>
<ul>
<li>First contact one-time password se trust banata hai; status Unknown, No Policy Installed, Online.</li>
<li>Errors install block karte hain, warnings nahi; failed install kuch nahi badalta.</li>
<li>Missing element ya alias value error hai. Rule order decide karta hai; shadowed rules warn karte hain.</li>
<li>Lab 1 tab pass hota hai jab engine Online ho aur Initial Policy installed ho. Lab 2 mein elements rule mein use hone chahiye aur phir Install policy.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Rule problem ko engine command line par fix karne ki koshish. Rules SMC se aate hain. Wahin fix karo aur install karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Tools mat mix karo: sg-contact-mgmt first contact ke liye hai, sg-status state dikhata hai, sg-reconfigure local setup badalta hai. Yeh track kisi certification se independent hai; exam book karne se pehle Forcepoint ke current training aur certification pages check karo.</p></div>

<div class="scn"><h4>Pune se raat 2 baje ka call</h4><p>Power cut ke baad Pune branch ka SMC se link toot gaya, aur on-call engineer us engine ke liye Management Client use nahi kar paya. FW1 terminal se unhone sg-status chalaya, Management Server se contact nahi dikha, aur 10.0.0.10 ping fail hua. Management network ka switch wapas up nahi hua tha. Switch power-cycle karne ke baad bina kisi rule change ke contact wapas aa gaya.</p><p><b>Lesson:</b> policy chhune se pehle reachability check karo.</p></div>

<div class="iv"><p class="q">"Engine command line kab use karoge, Management Client ke bajaye?"</p><p>Strong answer: sg-contact-mgmt se initial contact ke liye, sg-reconfigure se local reconfiguration ke liye, aur sg-status, ping aur tcpdump se troubleshooting ke liye. Rules aur elements Management Client mein manage hote hain aur SMC se install hote hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Management Client roz ke kaam ke liye hai; engine command line first contact aur fault finding ke liye.</li>
<li>Documented tools: sg-status, sg-version, sg-contact-mgmt, sg-reconfigure.</li>
<li>First-contact faults aam taur par addresses, reachability ya one-time password hote hain.</li>
<li>No Policy Installed matlab contact kaam kar raha hai.</li>
<li>Rules SMC mein likhe aur install kiye jaate hain, engine par type nahi hote.</li>
</ul></div>
`}};export{e as default};