var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You have now covered the plumbing around ClearPass policy: how a switch earns trust, why the source IP and the shared secret matter, how one port design serves laptops and printers, and how clusters, directories, certificates, TACACS+ and wireless fit around it. This chapter gathers everything for revision.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Module summary map">
<rect x="20" y="20" width="180" height="60" rx="8" fill="#bae6fd"/><text x="110" y="46" text-anchor="middle" class="svg-ink" font-size="13">Trust (lab)</text><text x="110" y="64" text-anchor="middle" class="svg-muted" font-size="12">NAD, IP, secret</text>
<rect x="230" y="20" width="180" height="60" rx="8" fill="#bbf7d0"/><text x="320" y="46" text-anchor="middle" class="svg-ink" font-size="13">Port design (lab)</text><text x="320" y="64" text-anchor="middle" class="svg-muted" font-size="12">802.1X then MAC auth</text>
<rect x="440" y="20" width="180" height="60" rx="8" fill="#fde68a"/><text x="530" y="46" text-anchor="middle" class="svg-ink" font-size="13">Troubleshoot (lab)</text><text x="530" y="64" text-anchor="middle" class="svg-muted" font-size="12">outside in</text>
<rect x="20" y="110" width="140" height="60" rx="8" fill="#ddd6fe"/><text x="90" y="136" text-anchor="middle" class="svg-ink" font-size="13">Cluster</text><text x="90" y="154" text-anchor="middle" class="svg-muted" font-size="12">concept</text>
<rect x="175" y="110" width="140" height="60" rx="8" fill="#ddd6fe"/><text x="245" y="136" text-anchor="middle" class="svg-ink" font-size="13">AD / LDAP</text><text x="245" y="154" text-anchor="middle" class="svg-muted" font-size="12">concept</text>
<rect x="330" y="110" width="140" height="60" rx="8" fill="#ddd6fe"/><text x="400" y="136" text-anchor="middle" class="svg-ink" font-size="13">Certificates</text><text x="400" y="154" text-anchor="middle" class="svg-muted" font-size="12">concept</text>
<rect x="485" y="110" width="140" height="60" rx="8" fill="#ddd6fe"/><text x="555" y="136" text-anchor="middle" class="svg-ink" font-size="13">TACACS+, Wi-Fi</text><text x="555" y="154" text-anchor="middle" class="svg-muted" font-size="12">concept</text>
</svg><p class="cap">Top row: skills you practised in the lab. Bottom row: real features taught as concepts, not simulated.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>I can explain the order ClearPass uses: NAD check, service classification, authentication, role mapping, enforcement, response.</li>
<li>I can register a network device with the correct source IP and secret (Configuration &gt; Network &gt; Devices; lab: configuration network device add).</li>
<li>I can configure the switch side: RADIUS host with key, server group, global dot1x authenticator, port-level enable.</li>
<li>I can tell a secret mismatch from an unknown device using the switch counters and the Event Viewer.</li>
<li>I can find the real RADIUS source address with show ip interface brief and correct the NAD entry.</li>
<li>I can build a mixed-mode port design with an interface range and explain the 10-second fallback.</li>
<li>I can recover a disabled endpoint and prove the method in show port-access clients.</li>
<li>I can describe the publisher/subscriber model, AD join, EAP-TLS and Onboard, TACACS+ and wireless NADs, and say which ones the lab does not simulate.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>NAD</dt><dd>Network access device; the authenticator (switch, controller, AP) that sends RADIUS requests.</dd>
<dt>Shared secret</dt><dd>Per-device string that authenticates RADIUS packets; never sent on the wire.</dd>
<dt>Source IP</dt><dd>Address in the packet header that ClearPass matches to a network device.</dd>
<dt>Mixed mode</dt><dd>802.1X first, MAC authentication fallback on the same port.</dd>
<dt>Endpoint</dt><dd>A device record in the Endpoints Repository, with a status (Known, Unknown, Disabled) and attributes.</dd>
<dt>Publisher / subscriber</dt><dd>Master of the configuration and the nodes that replicate from it.</dd>
<dt>Domain join</dt><dd>Making ClearPass a computer account in AD, needed for MSCHAPv2.</dd>
<dt>EAP-TLS</dt><dd>802.1X method with certificates on both sides.</dd>
<dt>TACACS+</dt><dd>TCP 49 device administration protocol with per-command control.</dd>
<dt>CoA</dt><dd>Change of Authorization (RFC 5176), UDP 3799, needs the NAD CoA setting and radius dyn-authorization on the switch.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Remember</th></tr>
<tr><td>Device lookup key</td><td>Packet source IP, not hostname</td></tr>
<tr><td>Wrong secret or unknown device</td><td>Silent drop, Event Viewer entry, switch shows server dead</td></tr>
<tr><td>Policy failures</td><td>Visible in the Access Tracker (alerts 215, 216, 217, 9002, 9011)</td></tr>
<tr><td>Fallback order</td><td>802.1X first, MAC auth after about 10 seconds</td></tr>
<tr><td>Method enabled</td><td>Globally with an existing server group and on the port</td></tr>
<tr><td>Role names</td><td>Compared exactly, case-sensitive</td></tr>
<tr><td>Wired / wireless NAS-Port-Type</td><td>15 / 19</td></tr>
<tr><td>RADIUS / TACACS+ ports</td><td>UDP 1812 and 1813 / TCP 49; CoA UDP 3799</td></tr>
<tr><td>Cluster configuration</td><td>Edited on the publisher only</td></tr></table>

<h3>Command cheat-sheet (lab)</h3>
<pre class="code"><span class="c">! ClearPass (Lab shell)</span>
configuration network device add ACCESS ip 10.20.99.2 secret ArubaNK1 vendor Aruba coa off
configuration network device ACCESS secret ArubaNK1
configuration network device ACCESS ip 10.20.99.2
configuration identity endpoint 00:50:67:fb:67:01 status known
monitoring event-viewer
monitoring access-tracker detail latest alerts
<span class="c">! Switch</span>
radius-server host 10.20.60.10 key plaintext ArubaNK1
interface 1/1/3-1/1/5
show radius-server
show ip interface brief
show port-access clients detail</pre>

<div class="warn"><p><b>Final reminders.</b> Do not call a concept configured when the lab only describes it. Cluster, AD, EAP-TLS and Onboard, TACACS+ and wireless are not simulated in the lab, and when you speak about them in an interview, say they are real platform features you studied as concepts.</p></div>

<div class="exam"><p><b>Exam trap recap.</b> Name is cosmetic, IP is the key. A reject is a reply; a drop is silence. Cluster health is not NAD failover. MAC authentication is device identity, not user identity.</p></div>

<div class="scn"><h4>Handover checklist for a new site</h4><p>A team onboarding a new branch used a one-page checklist: NAD registered with the verified source IP; unique secret stored in the vault; two RADIUS servers on different nodes; method enabled globally and on the ports; one interface range design; test laptop and test printer; Event Viewer clean; critical-role defined. The branch went live without a ticket.</p><p><b>Lesson:</b> a short checklist turns the plumbing into a routine.</p></div>

<div class="iv"><p class="q">"What would you verify before declaring a new site ready?"</p><p>Strong answer: NAD IP and secret on every node, two reachable servers with failover tested, the port design on all access ports, one 802.1X test and one MAC authentication test with the right role and VLAN, the switch roles and VLAN trunk, clean Event Viewer, certificate and time health, and a documented rollback.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Trust first: NAD IP, secret and switch configuration, then policy.</li>
<li>Silence means plumbing; alerts mean policy.</li>
<li>One port design with 802.1X then MAC auth serves mixed devices.</li>
<li>Cluster, AD, certificates, TACACS+ and wireless are concepts here, not simulated.</li>
<li>Prove every fix with a fresh authentication.</li>
</ul></div>
`,hi:`
<p>Ab aapne ClearPass policy ke aas-paas ki plumbing cover kar li hai: switch trust kaise kamata hai, source IP aur shared secret kyun matter karte hain, ek port design laptops aur printers dono ko kaise serve karta hai, aur cluster, directories, certificates, TACACS+ aur wireless uske aas-paas kaise fit hote hain. Yeh chapter revision ke liye sab ek jagah jodta hai.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Module summary map">
<rect x="20" y="20" width="180" height="60" rx="8" fill="#bae6fd"/><text x="110" y="46" text-anchor="middle" class="svg-ink" font-size="13">Trust (lab)</text><text x="110" y="64" text-anchor="middle" class="svg-muted" font-size="12">NAD, IP, secret</text>
<rect x="230" y="20" width="180" height="60" rx="8" fill="#bbf7d0"/><text x="320" y="46" text-anchor="middle" class="svg-ink" font-size="13">Port design (lab)</text><text x="320" y="64" text-anchor="middle" class="svg-muted" font-size="12">802.1X phir MAC auth</text>
<rect x="440" y="20" width="180" height="60" rx="8" fill="#fde68a"/><text x="530" y="46" text-anchor="middle" class="svg-ink" font-size="13">Troubleshoot (lab)</text><text x="530" y="64" text-anchor="middle" class="svg-muted" font-size="12">outside in</text>
<rect x="20" y="110" width="140" height="60" rx="8" fill="#ddd6fe"/><text x="90" y="136" text-anchor="middle" class="svg-ink" font-size="13">Cluster</text><text x="90" y="154" text-anchor="middle" class="svg-muted" font-size="12">concept</text>
<rect x="175" y="110" width="140" height="60" rx="8" fill="#ddd6fe"/><text x="245" y="136" text-anchor="middle" class="svg-ink" font-size="13">AD / LDAP</text><text x="245" y="154" text-anchor="middle" class="svg-muted" font-size="12">concept</text>
<rect x="330" y="110" width="140" height="60" rx="8" fill="#ddd6fe"/><text x="400" y="136" text-anchor="middle" class="svg-ink" font-size="13">Certificates</text><text x="400" y="154" text-anchor="middle" class="svg-muted" font-size="12">concept</text>
<rect x="485" y="110" width="140" height="60" rx="8" fill="#ddd6fe"/><text x="555" y="136" text-anchor="middle" class="svg-ink" font-size="13">TACACS+, Wi-Fi</text><text x="555" y="154" text-anchor="middle" class="svg-muted" font-size="12">concept</text>
</svg><p class="cap">Upar ki row: lab mein practise kiye skills. Neeche ki row: real features jo concepts ki tarah padhaaye gaye, simulate nahi hote.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Main ClearPass ka order explain kar sakta hoon: NAD check, service classification, authentication, role mapping, enforcement, response.</li>
<li>Main sahi source IP aur secret ke saath network device register kar sakta hoon (Configuration &gt; Network &gt; Devices; lab: configuration network device add).</li>
<li>Main switch side configure kar sakta hoon: key ke saath RADIUS host, server group, global dot1x authenticator, port-level enable.</li>
<li>Main switch counters aur Event Viewer se secret mismatch ko unknown device se alag pehchan sakta hoon.</li>
<li>Main show ip interface brief se real RADIUS source address dhoondh kar NAD entry sahi kar sakta hoon.</li>
<li>Main interface range se mixed-mode port design bana sakta hoon aur 10-second fallback explain kar sakta hoon.</li>
<li>Main disabled endpoint recover kar sakta hoon aur show port-access clients mein method prove kar sakta hoon.</li>
<li>Main publisher/subscriber model, AD join, EAP-TLS aur Onboard, TACACS+ aur wireless NADs describe kar sakta hoon, aur bata sakta hoon ki lab kaunse simulate nahi karta.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>NAD</dt><dd>Network access device; authenticator (switch, controller, AP) jo RADIUS requests bhejta hai.</dd>
<dt>Shared secret</dt><dd>Per-device string jo RADIUS packets ko authenticate karti hai; wire par kabhi nahi jaati.</dd>
<dt>Source IP</dt><dd>Packet header ka address jise ClearPass network device se match karta hai.</dd>
<dt>Mixed mode</dt><dd>Ek hi port par pehle 802.1X, fallback mein MAC authentication.</dd>
<dt>Endpoint</dt><dd>Endpoints Repository mein device record, status (Known, Unknown, Disabled) aur attributes ke saath.</dd>
<dt>Publisher / subscriber</dt><dd>Configuration ka master aur woh nodes jo usse replicate karte hain.</dd>
<dt>Domain join</dt><dd>ClearPass ko AD mein computer account banana, MSCHAPv2 ke liye zaroori.</dd>
<dt>EAP-TLS</dt><dd>Dono sides par certificates wala 802.1X method.</dd>
<dt>TACACS+</dt><dd>TCP 49 device administration protocol, per-command control ke saath.</dd>
<dt>CoA</dt><dd>Change of Authorization (RFC 5176), UDP 3799, NAD CoA setting aur switch par radius dyn-authorization chahiye.</dd>
</dl>

<h3>Sabse zyada pooche jaane wale facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Yaad rakho</th></tr>
<tr><td>Device lookup key</td><td>Packet source IP, hostname nahi</td></tr>
<tr><td>Wrong secret ya unknown device</td><td>Silent drop, Event Viewer entry, switch server ko dead dikhata hai</td></tr>
<tr><td>Policy failures</td><td>Access Tracker mein dikhte hain (alerts 215, 216, 217, 9002, 9011)</td></tr>
<tr><td>Fallback order</td><td>Pehle 802.1X, lagbhag 10 seconds baad MAC auth</td></tr>
<tr><td>Method enabled</td><td>Globally maujood server group ke saath aur port par</td></tr>
<tr><td>Role names</td><td>Exact compare, case-sensitive</td></tr>
<tr><td>Wired / wireless NAS-Port-Type</td><td>15 / 19</td></tr>
<tr><td>RADIUS / TACACS+ ports</td><td>UDP 1812 aur 1813 / TCP 49; CoA UDP 3799</td></tr>
<tr><td>Cluster configuration</td><td>Sirf publisher par edit hoti hai</td></tr></table>

<h3>Command cheat-sheet (lab)</h3>
<pre class="code"><span class="c">! ClearPass (Lab shell)</span>
configuration network device add ACCESS ip 10.20.99.2 secret ArubaNK1 vendor Aruba coa off
configuration network device ACCESS secret ArubaNK1
configuration network device ACCESS ip 10.20.99.2
configuration identity endpoint 00:50:67:fb:67:01 status known
monitoring event-viewer
monitoring access-tracker detail latest alerts
<span class="c">! Switch</span>
radius-server host 10.20.60.10 key plaintext ArubaNK1
interface 1/1/3-1/1/5
show radius-server
show ip interface brief
show port-access clients detail</pre>

<div class="warn"><p><b>Aakhri yaad-dihani.</b> Jis concept ko lab sirf describe karta hai use configured mat kaho. Cluster, AD, EAP-TLS aur Onboard, TACACS+ aur wireless lab mein simulate nahi hote, aur interview mein inke baare mein bolte waqt kaho ki yeh real platform features hain jo aapne concepts ki tarah padhe.</p></div>

<div class="exam"><p><b>Exam trap recap.</b> Naam cosmetic hai, IP key hai. Reject ek reply hai; drop khamoshi hai. Cluster health NAD failover nahi hai. MAC authentication device identity hai, user identity nahi.</p></div>

<div class="scn"><h4>Naye site ke liye handover checklist</h4><p>Naye branch ko onboard karne wali team ne ek page ki checklist use ki: NAD verified source IP ke saath registered; unique secret vault mein; alag nodes par do RADIUS servers; method globally aur ports par enabled; ek interface range design; test laptop aur test printer; Event Viewer clean; critical-role defined. Branch bina ticket ke live hui.</p><p><b>Seekh:</b> chhoti checklist plumbing ko routine bana deti hai.</p></div>

<div class="iv"><p class="q">"Naye site ko ready declare karne se pehle aap kya verify karoge?"</p><p>Strong answer: har node par NAD IP aur secret, do reachable servers failover tested ke saath, saare access ports par port design, ek 802.1X test aur ek MAC authentication test sahi role aur VLAN ke saath, switch roles aur VLAN trunk, clean Event Viewer, certificate aur time health, aur documented rollback.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pehle trust: NAD IP, secret aur switch configuration, phir policy.</li>
<li>Khamoshi matlab plumbing; alerts matlab policy.</li>
<li>802.1X phir MAC auth wala ek port design mixed devices ko serve karta hai.</li>
<li>Cluster, AD, certificates, TACACS+ aur wireless yahan concepts hain, simulate nahi hote.</li>
<li>Har fix ko fresh authentication se prove karo.</li>
</ul></div>
`}};export{e as default};