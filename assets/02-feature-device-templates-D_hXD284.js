var e={id:`feature-device-templates`,h:{en:`Feature templates and device templates (the legacy model)`,hi:`Feature templates aur device templates (legacy model)`},body:{en:`
<p>Think of building a computer from parts. You do not forge a new motherboard each time. You pick a motherboard, a power supply and a disk from a catalogue, and screw them into a case. In the legacy template model, a <b>feature template</b> is one part (for example "how this router uses NTP"), and a <b>device template</b> is the case that holds the parts you chose for one kind of router.</p>

<h3>Feature templates: one feature, one template</h3>
<p>A <b>feature template</b> configures one feature of the device. It is tied to a device model, so a template for a Catalyst 8200 is created for that model. The templates are grouped into categories in the Manager:</p>
<table class="cmp"><tr><th>Category</th><th>Examples of feature templates</th><th>What it configures</th></tr>
<tr><td>Basic information</td><td>System, Logging, NTP, AAA, BFD, OMP, Security, Banner, SNMP</td><td>Hostname, system IP, site ID, timers, authentication, IPsec settings, timers for tunnels</td></tr>
<tr><td>VPN</td><td>VPN (transport VPN 0, management VPN 512, service VPNs)</td><td>The VPN itself, its routes, DNS, services</td></tr>
<tr><td>VPN interface</td><td>VPN Interface Ethernet, Cellular, DSL, T1/E1</td><td>IP address or DHCP, tunnel interface color, allow-service, NAT, VRRP, ACLs</td></tr>
<tr><td>Other</td><td>Policy, Security Policy, CLI add-on</td><td>Attachments for policy and extra CLI</td></tr></table>
<p>Three of these appear in almost every branch design:</p>
<ul>
<li><b>System</b>: hostname, system IP, site ID, console and location settings, and options such as port hopping and on-demand tunnels. The organization name and Validator address come from the Manager's global settings.</li>
<li><b>VPN</b> and <b>VPN Interface Ethernet</b>: the template for VPN 0 holds the default route; its interface template holds the WAN address and the <b>tunnel interface</b> section (tunnel on, color, restrict, allow-service). The service VPN 10 and its LAN interface are separate templates.</li>
<li><b>BFD</b>, <b>OMP</b>, <b>AAA</b> and <b>Security</b>: BFD timers per color, OMP advertise settings and graceful restart, local users and TACACS or RADIUS, and the IPsec rekey and replay-window settings.</li>
</ul>

<h3>Click path: create a feature template</h3>
<ol>
<li>Open <b>Configuration</b> &gt; <b>Templates</b>.</li>
<li>Select the <b>Feature Templates</b> tab and click <b>Add Template</b>.</li>
<li>Select one or more <b>device models</b>, for example a Catalyst 8200.</li>
<li>Choose the template type in its category, for example <b>System</b>.</li>
<li>Enter a <b>Template Name</b> and <b>Description</b>.</li>
<li>Fill the fields. Next to each field choose the <b>scope</b>: <b>Global</b> (one value for all devices), <b>Device Specific</b> (a variable you fill per device) or <b>Default</b> (the built-in value).</li>
<li>Click <b>Save</b>.</li>
</ol>
<p>The scope is the heart of templates. For the System template you would set the hostname, system IP and site ID as Device Specific, and the other fields as Global.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Device template made of feature templates">
<rect x="180" y="10" width="280" height="240" rx="10" fill="#f1f5f9" stroke="#64748b"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="13">Device template: BR-C8200</text>
<rect x="200" y="45" width="240" height="35" rx="6" fill="#bae6fd"/><text x="320" y="68" text-anchor="middle" class="svg-ink" font-size="12">Basic: System, NTP, AAA, BFD, OMP, Security</text>
<rect x="200" y="88" width="240" height="35" rx="6" fill="#ddd6fe"/><text x="320" y="111" text-anchor="middle" class="svg-ink" font-size="12">Transport: VPN 0 + Ethernet interface (biz-internet)</text>
<rect x="200" y="131" width="240" height="35" rx="6" fill="#fde68a"/><text x="320" y="154" text-anchor="middle" class="svg-ink" font-size="12">Management: VPN 512 (optional)</text>
<rect x="200" y="174" width="240" height="35" rx="6" fill="#bbf7d0"/><text x="320" y="197" text-anchor="middle" class="svg-ink" font-size="12">Service: VPN 10 + LAN interface</text>
<rect x="200" y="217" width="240" height="25" rx="6" fill="#fed7aa"/><text x="320" y="234" text-anchor="middle" class="svg-ink" font-size="12">Additional: Banner, SNMP, CLI add-on</text>
<text x="90" y="130" text-anchor="middle" class="svg-muted" font-size="12">attached to</text><text x="90" y="148" text-anchor="middle" class="svg-ink" font-size="13">E-DEL-1, E-MUM-1,</text><text x="90" y="166" text-anchor="middle" class="svg-ink" font-size="13">E-BLR-1 ...</text>
<line x1="150" y1="140" x2="180" y2="140" stroke="#16a34a" stroke-width="2"/>
</svg><p class="cap">A device template is an ordered list of feature templates, grouped into four sections.</p></div>

<h3>Device templates: the case that holds the parts</h3>
<p>A <b>device template</b> picks one feature template for each part of the router. It is also model specific, so you create one per platform type and role. Click path:</p>
<ol>
<li>Open <b>Configuration</b> &gt; <b>Templates</b> and the <b>Device Templates</b> tab.</li>
<li>Click <b>Create Template</b> &gt; <b>From Feature Template</b>.</li>
<li>Choose the <b>Device Model</b>, the <b>Device Role</b> (SDWAN Edge), a <b>Template Name</b> and a <b>Description</b>.</li>
<li>Pick one feature template for each required section. Required parts have an asterisk. The sections are <b>Basic Information</b>, <b>Transport and Management VPN</b>, <b>Service VPN</b> and <b>Additional Templates</b>.</li>
<li>For the Service VPN you can add several VPNs, each with its own interface templates.</li>
<li>Click <b>Create</b>.</li>
</ol>
<p>A device template holds <i>references</i> to the feature templates. If you later edit the System feature template, every device template and every device that uses it is affected, and the Manager asks you to confirm and shows which devices will be updated.</p>

<h3>Variables</h3>
<p>Every Device Specific field becomes a <b>variable</b>. The name has letters, digits and underscores. You supply the values when you attach a device, either by typing them or by uploading a CSV file with one row per device. Some are built in, such as the hostname, system IP and site ID.</p>
<pre class="out">Device-specific values for E-BLR-1
  hostname      E-BLR-1
  system_ip     10.255.0.13
  site_id       300
  wan_ip        203.0.113.14/30
  wan_gw        203.0.113.13
  lan_ip        10.3.10.1/24</pre>

<h3>What the Manager generates</h3>
<p>From the template and these values the Manager builds the full IOS XE configuration for the device. For E-BLR-1 this part of the result matches what you wrote by hand in the edge module:</p>
<pre class="code">system
 system-ip 10.255.0.13
 site-id 300
 organization-name BHARAT-RETAIL
 vbond 198.51.100.30
!
interface GigabitEthernet1
 ip address 203.0.113.14 255.255.255.252
!
ip route 0.0.0.0 0.0.0.0 203.0.113.13
sdwan
 interface GigabitEthernet1
  tunnel-interface
   encapsulation ipsec
   color biz-internet</pre>

<div class="warn"><p><b>Common mistakes.</b> Making a field Global when it must differ per device (for example the system IP, which then duplicates); creating a feature template for the wrong device model; leaving a required section empty; and editing a shared feature template without noticing how many devices use it.</p></div>
<div class="exam"><p><b>Exam trap.</b> Feature templates are the parts, the device template is the assembly, and the variables are filled at <i>attach</i> time. Scope options are Global, Device Specific and Default.</p></div>

<div class="scn"><h4>Two branches with the same system IP</h4><p>A new engineer built the System template and left <b>system IP</b> as Global with the value 10.255.0.13. Both E-BLR-1 and a second Bengaluru router were attached. The second router connected, but the Controller kept resetting the first one, because system IPs must be unique. The engineer changed the field to Device Specific, entered a unique value for each device and pushed again.</p><p><b>Lesson:</b> anything that identifies a device must be Device Specific.</p></div>

<div class="iv"><p class="q">"What is the relationship between feature templates and device templates?"</p><p>Strong answer: a feature template configures one feature (System, VPN, VPN Interface, BFD, OMP, AAA, Security) for one device model. A device template is built from feature templates in four sections: basic information, transport and management VPN, service VPN and additional templates. Values that differ per device are Device Specific variables filled when the template is attached.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A feature template configures one feature; a device template assembles them.</li>
<li>Templates are model specific; the categories are basic information, VPN, VPN interface and others.</li>
<li>Field scopes are Global, Device Specific and Default.</li>
<li>Variables are filled when you attach a device, manually or by CSV.</li>
<li>Click paths: Configuration &gt; Templates &gt; Feature Templates / Device Templates.</li>
</ul></div>
`,hi:`
<p>Computer ko parts se banane ke baare mein socho. Aap har baar nayi motherboard nahi banate. Aap catalogue se motherboard, power supply aur disk chunte ho aur use case mein lagate ho. Legacy template model mein <b>feature template</b> ek part hai (jaise "yeh router NTP kaise use karta hai"), aur <b>device template</b> woh case hai jo ek tarah ke router ke liye chune gaye parts rakhta hai.</p>

<h3>Feature templates: ek feature, ek template</h3>
<p><b>Feature template</b> device ka ek feature configure karta hai. Yeh device model se bandha hota hai, isliye Catalyst 8200 ka template us model ke liye banta hai. Templates Manager mein categories mein group hote hain:</p>
<table class="cmp"><tr><th>Category</th><th>Feature templates ke examples</th><th>Kya configure karta hai</th></tr>
<tr><td>Basic information</td><td>System, Logging, NTP, AAA, BFD, OMP, Security, Banner, SNMP</td><td>Hostname, system IP, site ID, timers, authentication, IPsec settings, tunnels ke timers</td></tr>
<tr><td>VPN</td><td>VPN (transport VPN 0, management VPN 512, service VPNs)</td><td>VPN khud, uske routes, DNS, services</td></tr>
<tr><td>VPN interface</td><td>VPN Interface Ethernet, Cellular, DSL, T1/E1</td><td>IP address ya DHCP, tunnel interface color, allow-service, NAT, VRRP, ACLs</td></tr>
<tr><td>Other</td><td>Policy, Security Policy, CLI add-on</td><td>Policy aur extra CLI ke attachments</td></tr></table>
<p>Inmein se teen lagbhag har branch design mein aate hain:</p>
<ul>
<li><b>System</b>: hostname, system IP, site ID, console aur location settings, aur port hopping aur on-demand tunnels jaise options. Organization name aur Validator address Manager ki global settings se aate hain.</li>
<li><b>VPN</b> aur <b>VPN Interface Ethernet</b>: VPN 0 ka template default route rakhta hai; uska interface template WAN address aur <b>tunnel interface</b> section rakhta hai (tunnel on, color, restrict, allow-service). Service VPN 10 aur uska LAN interface alag templates hain.</li>
<li><b>BFD</b>, <b>OMP</b>, <b>AAA</b> aur <b>Security</b>: per color BFD timers, OMP advertise settings aur graceful restart, local users aur TACACS ya RADIUS, aur IPsec rekey aur replay-window settings.</li>
</ul>

<h3>Click path: feature template banao</h3>
<ol>
<li><b>Configuration</b> &gt; <b>Templates</b> kholo.</li>
<li><b>Feature Templates</b> tab chuno aur <b>Add Template</b> click karo.</li>
<li>Ek ya zyada <b>device models</b> chuno, jaise Catalyst 8200.</li>
<li>Uski category mein template type chuno, jaise <b>System</b>.</li>
<li><b>Template Name</b> aur <b>Description</b> likho.</li>
<li>Fields bharo. Har field ke saath <b>scope</b> chuno: <b>Global</b> (sab devices ke liye ek value), <b>Device Specific</b> (variable jo per device bharte ho) ya <b>Default</b> (built-in value).</li>
<li><b>Save</b> click karo.</li>
</ol>
<p>Scope templates ka dil hai. System template ke liye hostname, system IP aur site ID ko Device Specific rakhoge, aur baaki fields ko Global.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Feature templates se bana device template">
<rect x="180" y="10" width="280" height="240" rx="10" fill="#f1f5f9" stroke="#64748b"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="13">Device template: BR-C8200</text>
<rect x="200" y="45" width="240" height="35" rx="6" fill="#bae6fd"/><text x="320" y="68" text-anchor="middle" class="svg-ink" font-size="12">Basic: System, NTP, AAA, BFD, OMP, Security</text>
<rect x="200" y="88" width="240" height="35" rx="6" fill="#ddd6fe"/><text x="320" y="111" text-anchor="middle" class="svg-ink" font-size="12">Transport: VPN 0 + Ethernet interface (biz-internet)</text>
<rect x="200" y="131" width="240" height="35" rx="6" fill="#fde68a"/><text x="320" y="154" text-anchor="middle" class="svg-ink" font-size="12">Management: VPN 512 (optional)</text>
<rect x="200" y="174" width="240" height="35" rx="6" fill="#bbf7d0"/><text x="320" y="197" text-anchor="middle" class="svg-ink" font-size="12">Service: VPN 10 + LAN interface</text>
<rect x="200" y="217" width="240" height="25" rx="6" fill="#fed7aa"/><text x="320" y="234" text-anchor="middle" class="svg-ink" font-size="12">Additional: Banner, SNMP, CLI add-on</text>
<text x="90" y="130" text-anchor="middle" class="svg-muted" font-size="12">in par attach hota hai</text><text x="90" y="148" text-anchor="middle" class="svg-ink" font-size="13">E-DEL-1, E-MUM-1,</text><text x="90" y="166" text-anchor="middle" class="svg-ink" font-size="13">E-BLR-1 ...</text>
<line x1="150" y1="140" x2="180" y2="140" stroke="#16a34a" stroke-width="2"/>
</svg><p class="cap">Device template feature templates ki ordered list hai, chaar sections mein group.</p></div>

<h3>Device templates: parts rakhne wala case</h3>
<p><b>Device template</b> router ke har part ke liye ek feature template chunta hai. Yeh bhi model specific hai, isliye aap har platform type aur role ke liye ek banate ho. Click path:</p>
<ol>
<li><b>Configuration</b> &gt; <b>Templates</b> aur <b>Device Templates</b> tab kholo.</li>
<li><b>Create Template</b> &gt; <b>From Feature Template</b> click karo.</li>
<li><b>Device Model</b>, <b>Device Role</b> (SDWAN Edge), <b>Template Name</b> aur <b>Description</b> chuno.</li>
<li>Har required section ke liye ek feature template chuno. Required parts par asterisk hota hai. Sections hain <b>Basic Information</b>, <b>Transport and Management VPN</b>, <b>Service VPN</b> aur <b>Additional Templates</b>.</li>
<li>Service VPN ke liye aap kai VPNs jod sakte ho, har ek ke apne interface templates ke saath.</li>
<li><b>Create</b> click karo.</li>
</ol>
<p>Device template feature templates ke <i>references</i> rakhta hai. Agar aap baad mein System feature template edit karte ho, to use use karne wala har device template aur har device affect hota hai, aur Manager confirm karne ko kehta hai aur dikhata hai ki kaunse devices update honge.</p>

<h3>Variables</h3>
<p>Har Device Specific field ek <b>variable</b> ban jaata hai. Naam mein letters, digits aur underscores hote hain. Values aap device attach karte waqt dete ho, ya type karke ya ek CSV file upload karke jismein har device ki ek row hoti hai. Kuch built-in hote hain, jaise hostname, system IP aur site ID.</p>
<pre class="out">E-BLR-1 ke device-specific values
  hostname      E-BLR-1
  system_ip     10.255.0.13
  site_id       300
  wan_ip        203.0.113.14/30
  wan_gw        203.0.113.13
  lan_ip        10.3.10.1/24</pre>

<h3>Manager kya generate karta hai</h3>
<p>Template aur in values se Manager device ki poori IOS XE configuration banata hai. E-BLR-1 ke liye result ka yeh hissa wahi hai jo aapne edge module mein haath se likha tha:</p>
<pre class="code">system
 system-ip 10.255.0.13
 site-id 300
 organization-name BHARAT-RETAIL
 vbond 198.51.100.30
!
interface GigabitEthernet1
 ip address 203.0.113.14 255.255.255.252
!
ip route 0.0.0.0 0.0.0.0 203.0.113.13
sdwan
 interface GigabitEthernet1
  tunnel-interface
   encapsulation ipsec
   color biz-internet</pre>

<div class="warn"><p><b>Common mistakes.</b> Aisi field ko Global banana jo har device par alag honi chahiye (jaise system IP, jo phir duplicate ho jaata hai); galat device model ke liye feature template banana; required section khaali chhodna; aur shared feature template edit karte waqt yeh na dekhna ki kitne devices use karte hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> Feature templates parts hain, device template assembly hai, aur variables <i>attach</i> time par bharte hain. Scope options Global, Device Specific aur Default hain.</p></div>

<div class="scn"><h4>Do branches, same system IP</h4><p>Ek naye engineer ne System template banaya aur <b>system IP</b> ko Global rakha, value 10.255.0.13. E-BLR-1 aur doosra Bengaluru router dono attach hue. Doosra router connect hua, lekin Controller pehle router ko baar baar reset karta raha, kyunki system IPs unique hone chahiye. Engineer ne field ko Device Specific kiya, har device ke liye unique value daali aur dobara push kiya.</p><p><b>Seekh:</b> jo bhi device ko identify karta hai woh Device Specific hona chahiye.</p></div>

<div class="iv"><p class="q">"Feature templates aur device templates ka kya relationship hai?"</p><p>Strong answer: feature template ek device model ke liye ek feature (System, VPN, VPN Interface, BFD, OMP, AAA, Security) configure karta hai. Device template feature templates se chaar sections mein banta hai: basic information, transport aur management VPN, service VPN aur additional templates. Jo values device se device alag hain woh Device Specific variables hain jo template attach karte waqt bhare jaate hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Feature template ek feature configure karta hai; device template unhe assemble karta hai.</li>
<li>Templates model specific hain; categories basic information, VPN, VPN interface aur others hain.</li>
<li>Field scopes Global, Device Specific aur Default hain.</li>
<li>Variables device attach karte waqt bhare jaate hain, manually ya CSV se.</li>
<li>Click paths: Configuration &gt; Templates &gt; Feature Templates / Device Templates.</li>
</ul></div>
`}};export{e as default};