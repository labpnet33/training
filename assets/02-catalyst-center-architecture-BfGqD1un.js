var e={id:`catc-architecture`,h:{en:`Catalyst Center: architecture, workflows and readiness`,hi:`Catalyst Center: architecture, workflows aur readiness`},body:{en:`
<p>Imagine an airport control tower. Pilots (devices) fly their own planes, but the tower knows every aircraft, sets the rules for the airspace, and warns about problems before two planes meet. <b>Cisco Catalyst Center</b> (the product formerly called DNA Center) is that tower for a campus network: it is a controller of controllers, an appliance (physical or virtual) that discovers devices, designs the network once, pushes configuration, and watches health. For wireless it manages the Catalyst 9800 controllers and the APs behind them.</p>

<h3>The building blocks</h3>
<dl class="terms">
<dt>Inventory</dt><dd>The list of devices Catalyst Center manages, with software version, serial number, role and reachability.</dd>
<dt>Discovery</dt><dd>A job that finds devices by IP range or by following CDP or LLDP, logging in with credentials you provide (CLI, SNMP, NETCONF).</dd>
<dt>Site hierarchy</dt><dd>The tree Area &gt; Building &gt; Floor. Settings are inherited down the tree; floors also hold the floor maps used for location and heatmaps.</dd>
<dt>Network settings</dt><dd>Shared services defined per site: NTP, DNS, DHCP, syslog, AAA servers, device credentials.</dd>
<dt>Wireless design objects</dt><dd>SSIDs, wireless profiles (which SSID goes to which sites and VLAN or fabric pool), RF profiles and AP profiles. Catalyst Center turns these into the WLAN, policy profile and tags you built by hand earlier.</dd>
<dt>Provisioning</dt><dd>Assign a controller and APs to a site, then push the intended configuration.</dd>
<dt>Assurance</dt><dd>Continuous health data about clients, APs and controllers (chapter 4).</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Catalyst Center workflow">
<rect x="10" y="20" width="110" height="46" rx="8" fill="#bae6fd"/><text x="65" y="48" text-anchor="middle" class="svg-ink" font-size="13">1 Discover</text>
<rect x="140" y="20" width="110" height="46" rx="8" fill="#bae6fd"/><text x="195" y="48" text-anchor="middle" class="svg-ink" font-size="13">2 Site tree</text>
<rect x="270" y="20" width="110" height="46" rx="8" fill="#bbf7d0"/><text x="325" y="48" text-anchor="middle" class="svg-ink" font-size="13">3 Design</text>
<rect x="400" y="20" width="110" height="46" rx="8" fill="#bbf7d0"/><text x="455" y="48" text-anchor="middle" class="svg-ink" font-size="13">4 Provision</text>
<rect x="530" y="20" width="100" height="46" rx="8" fill="#fde68a"/><text x="580" y="48" text-anchor="middle" class="svg-ink" font-size="13">5 Assure</text>
<line x1="120" y1="43" x2="140" y2="43" stroke="#64748b" stroke-width="2"/><line x1="250" y1="43" x2="270" y2="43" stroke="#64748b" stroke-width="2"/><line x1="380" y1="43" x2="400" y2="43" stroke="#64748b" stroke-width="2"/><line x1="510" y1="43" x2="530" y2="43" stroke="#64748b" stroke-width="2"/>
<rect x="230" y="110" width="180" height="46" rx="8" fill="#ddd6fe"/><text x="320" y="138" text-anchor="middle" class="svg-ink" font-size="14">Catalyst Center</text>
<rect x="230" y="180" width="180" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="205" text-anchor="middle" class="svg-ink" font-size="13">WLC1 + AP1, AP2</text>
<line x1="320" y1="156" x2="320" y2="180" stroke="#64748b" stroke-width="2"/>
<text x="450" y="135" class="svg-muted" font-size="12">SSH, SNMP, NETCONF 830, secure web</text>
<text x="450" y="155" class="svg-muted" font-size="12">telemetry back to the appliance</text>
</svg><p class="cap">Catalyst Center works in five steps; it reaches the controller over the management network.</p></div>

<h3>Discovery needs the controller to be ready</h3>
<p>Catalyst Center cannot manage what it cannot log in to. Before discovery, the 9800 needs a short list of prerequisites. Lab 3 (<b>Catalyst Center discovery readiness</b>) turns them into checks. CATC1 (10.10.99.60) stands in for the appliance, and only the checks are modelled: <b>there is no Catalyst Center software, no discovery job and no provisioning in the lab</b>.</p>
<table class="cmp"><tr><th>Prerequisite</th><th>Why</th><th>Lab command</th></tr>
<tr><td>Privilege 15 user</td><td>CLI and API login with full rights</td><td><code>username netops privilege 15 secret NkApi@2026</code></td></tr>
<tr><td>Domain name, RSA key, SSH v2</td><td>Secure CLI access for discovery</td><td><code>ip domain name nk.lab</code>, <code>crypto key generate rsa modulus 2048</code>, <code>ip ssh version 2</code></td></tr>
<tr><td>Secure web server and local authentication</td><td>secure web APIs on TCP 443</td><td><code>ip h&#116;tp secure-server</code>, <code>ip h&#116;tp authentication local</code></td></tr>
<tr><td>netconf-yang</td><td>NETCONF over SSH on TCP 830</td><td><code>netconf-yang</code></td></tr>
<tr><td>NTP</td><td>Certificates and logs need a correct clock</td><td><code>ntp server 10.10.60.20</code></td></tr>
<tr><td>DNS</td><td>Name resolution for cloud and services</td><td><code>ip name-server 10.10.60.20</code></td></tr>
<tr><td>SNMP community</td><td>Inventory polling</td><td><code>snmp-server community nkro RO</code></td></tr>
</table>
<p>Then the path must be open: a ping from CATC1 to 10.10.99.10, and TCP 22, 443 and 830 reachable (no ACL or firewall in between).</p>
<pre class="code"><span class="c">! lab 3 solution on WLC1</span>
username netops privilege 15 secret NkApi@2026
ip domain name nk.lab
crypto key generate rsa modulus 2048
ip ssh version 2
ip h&#116;tp secure-server
ip h&#116;tp authentication local
netconf-yang
ntp server 10.10.60.20
ip name-server 10.10.60.20
snmp-server community nkro RO</pre>
<pre class="out">WLC1# show ip ssh

<span class="hl">SSH Enabled - version 2.0</span>
Authentication timeout: 120 secs; Authentication retries: 3

WLC1# show netconf-yang status

<span class="hl">netconf-yang: enabled</span>
netconf-yang ssh port: 830

WLC1# show ntp status

<span class="hl">Clock is synchronized, stratum 4, reference is 10.10.60.20</span></pre>
<p>In the lab, NTP counts as synchronised when the server answers a ping, which is a simplification of real NTP. The lab output is a reduced form of the real output: the fields shown are real, extra lines are left out. The RSA key needs the domain name first; otherwise the controller answers <code>% Please define a domain-name first.</code></p>

<div class="warn"><p><b>Common mistake.</b> Enabling the secure web server but leaving the default authentication method. The API then answers 401 for every local user (chapter 8 explains why). Also forgetting <code>netconf-yang</code>: discovery of a 9800 then succeeds partially and wireless data is missing.</p></div>

<div class="exam"><p><b>Exam trap.</b> Discovery credentials and the <i>network settings</i> credentials are different things in the GUI: discovery uses credentials to find the device, device credentials per site are what provisioning later pushes. Both must match the controller, otherwise inventory shows "Credential failed" or "Unreachable".</p></div>

<div class="scn"><h4>The controller stayed "Partial Collection Failure"</h4><p>A new 9800 appeared in the inventory but showed a partial collection failure and no AP data. The engineer checked SSH (fine) and SNMP (fine), then ran <code>show netconf-yang status</code>: disabled. Enabling <code>netconf-yang</code> and re-syncing the device fixed it within minutes.</p><p><b>Lesson:</b> a 9800 needs the model-driven interfaces on, not just SSH and SNMP.</p></div>

<div class="iv"><p class="q">"What do you configure on a 9800 before Catalyst Center can manage it?"</p><p>A privilege 15 account, SSH v2 with a domain name and RSA key, the secure web server with local authentication, netconf-yang, NTP, DNS and SNMP, plus a clean path on TCP 22, 443 and 830. Say it from memory and mention you practised the check list in a lab, while Catalyst Center itself was concept only.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Catalyst Center discovers, designs, provisions and assures; the 9800 stays the device that forwards and enforces.</li>
<li>The site hierarchy (Area, Building, Floor) carries inherited settings and floor maps.</li>
<li>Readiness list: user, SSH v2, secure web with local auth, netconf-yang, NTP, DNS, SNMP.</li>
<li>Path checks: ping plus TCP 22, 443 and 830.</li>
<li>The lab models the checks, not the product.</li>
</ul></div>
`,hi:`
<p>Ek airport control tower imagine karo. Pilots (devices) apne jahaz khud udaate hain, lekin tower har aircraft ko jaanta hai, airspace ke rules set karta hai aur do planes milne se pehle problems ki warning deta hai. <b>Cisco Catalyst Center</b> (jise pehle DNA Center kehte the) campus network ke liye wahi tower hai: yeh controller of controllers hai, ek appliance (physical ya virtual) jo devices discover karta hai, network ek baar design karta hai, configuration push karta hai aur health dekhta hai. Wireless ke liye yeh Catalyst 9800 controllers aur unke peeche ke APs ko manage karta hai.</p>

<h3>Building blocks</h3>
<dl class="terms">
<dt>Inventory</dt><dd>Un devices ki list jinhe Catalyst Center manage karta hai, software version, serial number, role aur reachability ke saath.</dd>
<dt>Discovery</dt><dd>Ek job jo IP range se ya CDP ya LLDP follow karke devices dhoondhta hai, aapke diye credentials (CLI, SNMP, NETCONF) se login karke.</dd>
<dt>Site hierarchy</dt><dd>Tree Area &gt; Building &gt; Floor. Settings neeche ki taraf inherit hoti hain; floors par floor maps bhi hote hain jo location aur heatmaps ke liye use hote hain.</dd>
<dt>Network settings</dt><dd>Har site ke liye shared services: NTP, DNS, DHCP, syslog, AAA servers, device credentials.</dd>
<dt>Wireless design objects</dt><dd>SSIDs, wireless profiles (kaun sa SSID kin sites aur VLAN ya fabric pool par jaayega), RF profiles aur AP profiles. Catalyst Center inhe wahi WLAN, policy profile aur tags mein badalta hai jo aapne pehle haath se banaye.</dd>
<dt>Provisioning</dt><dd>Controller aur APs ko site se assign karo, phir intended configuration push karo.</dd>
<dt>Assurance</dt><dd>Clients, APs aur controllers ka continuous health data (chapter 4).</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Catalyst Center workflow">
<rect x="10" y="20" width="110" height="46" rx="8" fill="#bae6fd"/><text x="65" y="48" text-anchor="middle" class="svg-ink" font-size="13">1 Discover</text>
<rect x="140" y="20" width="110" height="46" rx="8" fill="#bae6fd"/><text x="195" y="48" text-anchor="middle" class="svg-ink" font-size="13">2 Site tree</text>
<rect x="270" y="20" width="110" height="46" rx="8" fill="#bbf7d0"/><text x="325" y="48" text-anchor="middle" class="svg-ink" font-size="13">3 Design</text>
<rect x="400" y="20" width="110" height="46" rx="8" fill="#bbf7d0"/><text x="455" y="48" text-anchor="middle" class="svg-ink" font-size="13">4 Provision</text>
<rect x="530" y="20" width="100" height="46" rx="8" fill="#fde68a"/><text x="580" y="48" text-anchor="middle" class="svg-ink" font-size="13">5 Assure</text>
<line x1="120" y1="43" x2="140" y2="43" stroke="#64748b" stroke-width="2"/><line x1="250" y1="43" x2="270" y2="43" stroke="#64748b" stroke-width="2"/><line x1="380" y1="43" x2="400" y2="43" stroke="#64748b" stroke-width="2"/><line x1="510" y1="43" x2="530" y2="43" stroke="#64748b" stroke-width="2"/>
<rect x="230" y="110" width="180" height="46" rx="8" fill="#ddd6fe"/><text x="320" y="138" text-anchor="middle" class="svg-ink" font-size="14">Catalyst Center</text>
<rect x="230" y="180" width="180" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="205" text-anchor="middle" class="svg-ink" font-size="13">WLC1 + AP1, AP2</text>
<line x1="320" y1="156" x2="320" y2="180" stroke="#64748b" stroke-width="2"/>
<text x="450" y="135" class="svg-muted" font-size="12">SSH, SNMP, NETCONF 830, secure web</text>
<text x="450" y="155" class="svg-muted" font-size="12">telemetry wapas appliance ko</text>
</svg><p class="cap">Catalyst Center paanch steps mein kaam karta hai; controller tak management network se pahunchta hai.</p></div>

<h3>Discovery ke liye controller ready hona chahiye</h3>
<p>Catalyst Center jis device mein login nahi kar sakta use manage nahi kar sakta. Discovery se pehle 9800 ko prerequisites ki chhoti list chahiye. Lab 3 (<b>Catalyst Center discovery readiness</b>) unhe checks mein badalta hai. CATC1 (10.10.99.60) appliance ki jagah khada hai, aur sirf checks model kiye gaye hain: <b>lab mein Catalyst Center software, discovery job ya provisioning nahi hai</b>.</p>
<table class="cmp"><tr><th>Prerequisite</th><th>Kyun</th><th>Lab command</th></tr>
<tr><td>Privilege 15 user</td><td>Full rights ke saath CLI aur API login</td><td><code>username netops privilege 15 secret NkApi@2026</code></td></tr>
<tr><td>Domain name, RSA key, SSH v2</td><td>Discovery ke liye secure CLI access</td><td><code>ip domain name nk.lab</code>, <code>crypto key generate rsa modulus 2048</code>, <code>ip ssh version 2</code></td></tr>
<tr><td>Secure web server aur local authentication</td><td>TCP 443 par secure web APIs</td><td><code>ip h&#116;tp secure-server</code>, <code>ip h&#116;tp authentication local</code></td></tr>
<tr><td>netconf-yang</td><td>TCP 830 par SSH ke upar NETCONF</td><td><code>netconf-yang</code></td></tr>
<tr><td>NTP</td><td>Certificates aur logs ko sahi clock chahiye</td><td><code>ntp server 10.10.60.20</code></td></tr>
<tr><td>DNS</td><td>Cloud aur services ke liye name resolution</td><td><code>ip name-server 10.10.60.20</code></td></tr>
<tr><td>SNMP community</td><td>Inventory polling</td><td><code>snmp-server community nkro RO</code></td></tr>
</table>
<p>Phir path khula hona chahiye: CATC1 se 10.10.99.10 ko ping, aur TCP 22, 443 aur 830 reachable (beech mein koi ACL ya firewall nahi).</p>
<pre class="code"><span class="c">! lab 3 solution, WLC1 par</span>
username netops privilege 15 secret NkApi@2026
ip domain name nk.lab
crypto key generate rsa modulus 2048
ip ssh version 2
ip h&#116;tp secure-server
ip h&#116;tp authentication local
netconf-yang
ntp server 10.10.60.20
ip name-server 10.10.60.20
snmp-server community nkro RO</pre>
<pre class="out">WLC1# show ip ssh

<span class="hl">SSH Enabled - version 2.0</span>
Authentication timeout: 120 secs; Authentication retries: 3

WLC1# show netconf-yang status

<span class="hl">netconf-yang: enabled</span>
netconf-yang ssh port: 830

WLC1# show ntp status

<span class="hl">Clock is synchronized, stratum 4, reference is 10.10.60.20</span></pre>
<p>Lab mein NTP tab synchronised maana jaata hai jab server ping ka jawab de, jo real NTP ka simplification hai. Lab output real output ka reduced form hai: dikhaye gaye fields real hain, extra lines hata di gayi hain. RSA key ke liye pehle domain name chahiye; warna controller <code>% Please define a domain-name first.</code> deta hai.</p>

<div class="warn"><p><b>Common mistake.</b> Secure web server enable kar dena lekin default authentication method chhod dena. Tab API har local user ke liye 401 deti hai (chapter 8 batata hai kyun). Aur <code>netconf-yang</code> bhool jaana: tab 9800 ka discovery aadha hi hota hai aur wireless data missing rehta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> GUI mein discovery credentials aur <i>network settings</i> credentials alag cheezein hain: discovery credentials device dhoondhne ke liye hain, har site ke device credentials woh hain jo provisioning baad mein push karti hai. Dono controller se match karne chahiye, warna inventory mein "Credential failed" ya "Unreachable" dikhta hai.</p></div>

<div class="scn"><h4>Controller "Partial Collection Failure" par atka raha</h4><p>Ek naya 9800 inventory mein aaya lekin partial collection failure dikhaya aur koi AP data nahi. Engineer ne SSH (theek) aur SNMP (theek) check kiya, phir <code>show netconf-yang status</code> chalaya: disabled. <code>netconf-yang</code> enable karke device re-sync karne se kuch minute mein fix ho gaya.</p><p><b>Lesson:</b> 9800 ko sirf SSH aur SNMP nahi, model-driven interfaces bhi on chahiye.</p></div>

<div class="iv"><p class="q">"Catalyst Center 9800 ko manage kare, usse pehle aap kya configure karoge?"</p><p>Privilege 15 account, domain name aur RSA key ke saath SSH v2, local authentication wala secure web server, netconf-yang, NTP, DNS aur SNMP, aur TCP 22, 443 aur 830 par saaf path. Yaad se bolo aur batao ki aapne yeh check list lab mein practise ki, jabki Catalyst Center khud concept tha.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Catalyst Center discover, design, provision aur assure karta hai; 9800 forward aur enforce karne wala device rehta hai.</li>
<li>Site hierarchy (Area, Building, Floor) inherited settings aur floor maps rakhti hai.</li>
<li>Readiness list: user, SSH v2, local auth wala secure web, netconf-yang, NTP, DNS, SNMP.</li>
<li>Path checks: ping aur TCP 22, 443 aur 830.</li>
<li>Lab checks model karta hai, product nahi.</li>
</ul></div>
`}};export{e as default};