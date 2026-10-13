var e={id:`pnp-provision`,h:{en:`Provision part 2: Plug and Play, site provisioning and SWIM`,hi:`Provision part 2: Plug and Play, site provisioning aur SWIM`},body:{en:`
<p>When a new employee joins, HR does not send them a 40-page manual and wish them luck. The badge, laptop and accounts are prepared before day one, and on arrival they plug in and everything works. <b>Plug and Play (PnP)</b> does that for switches and routers: a brand-new box is unpacked at a branch, cabled by someone with no networking skills, powered on, and it configures itself from Catalyst Center.</p>

<h3>Day-0, Day-1, Day-N</h3>
<table class="cmp"><tr><th>Phase</th><th>What happens</th><th>Catalyst Center tool</th></tr>
<tr><td><b>Day-0</b></td><td>Unconfigured device gets its first config and image</td><td>Plug and Play with an onboarding template</td></tr>
<tr><td><b>Day-1</b></td><td>Device joins its site and receives the site standards</td><td>Assign to site, Provision (network settings, profile templates)</td></tr>
<tr><td><b>Day-N</b></td><td>Every later change, upgrade and check</td><td>Day-N templates, SWIM, compliance, Assurance</td></tr></table>

<h3>How PnP finds the controller</h3>
<p>Modern IOS XE devices boot with an embedded <b>PnP agent</b> when there is no startup configuration. The agent gets an address by DHCP on its uplink and then looks for a PnP server in this order of convenience:</p>
<ol><li><b>DHCP option 43</b> — the DHCP server hands out a string containing the controller's IP.</li>
<li><b>DNS</b> — the agent resolves <code>pnpserver.&lt;domain&gt;</code> using the domain name from DHCP (for example <code>pnpserver.campus.example</code>).</li>
<li><b>Cisco Plug and Play Connect</b> — a cloud redirect service; the device's serial number is registered in your Smart Account and pointed at your controller.</li></ol>

<pre class="code"><span class="c">! DSW1 as DHCP server for the management VLAN, pointing new switches at CTRL (10.99.0.10)</span>
ip dhcp excluded-address 10.99.0.1 10.99.0.20
ip dhcp pool PNP-MGMT
 network 10.99.0.0 255.255.255.0
 default-router 10.99.0.1
 domain-name campus.example
 option 43 ascii "5A1N;B2;K4;I10.99.0.10;J80"</pre>
<p>In the option 43 string, <code>5A1N</code> is the PnP version and operation code, <code>B2</code> means an IPv4 address follows, <code>K4</code> selects the plain web transport (<code>K5</code> would be the TLS version), <code>I10.99.0.10</code> is the controller address and <code>J80</code> the port. If the new switch's uplink is in a different VLAN from the DHCP server, the SVI needs an <code>ip helper-address</code>.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="PnP onboarding flow">
<rect x="10" y="70" width="110" height="56" rx="10" fill="#e2e8f0"/><text x="65" y="94" text-anchor="middle" class="svg-ink" font-size="13">New switch</text><text x="65" y="111" text-anchor="middle" class="svg-muted" font-size="12">no config</text>
<rect x="150" y="70" width="110" height="56" rx="10" fill="#bae6fd"/><text x="205" y="94" text-anchor="middle" class="svg-ink" font-size="13">DHCP</text><text x="205" y="111" text-anchor="middle" class="svg-muted" font-size="12">IP + option 43</text>
<rect x="290" y="70" width="130" height="56" rx="10" fill="#bbf7d0"/><text x="355" y="94" text-anchor="middle" class="svg-ink" font-size="13">Contacts CTRL</text><text x="355" y="111" text-anchor="middle" class="svg-muted" font-size="12">Unclaimed</text>
<rect x="450" y="70" width="80" height="56" rx="10" fill="#fde68a"/><text x="490" y="94" text-anchor="middle" class="svg-ink" font-size="13">Claim</text><text x="490" y="111" text-anchor="middle" class="svg-muted" font-size="12">site</text>
<rect x="550" y="70" width="84" height="56" rx="10" fill="#ddd6fe"/><text x="592" y="94" text-anchor="middle" class="svg-ink" font-size="12">Image +</text><text x="592" y="111" text-anchor="middle" class="svg-ink" font-size="12">Day-0 config</text>
<line x1="120" y1="98" x2="150" y2="98" stroke="#64748b" stroke-width="2"/><line x1="260" y1="98" x2="290" y2="98" stroke="#64748b" stroke-width="2"/><line x1="420" y1="98" x2="450" y2="98" stroke="#64748b" stroke-width="2"/><line x1="530" y1="98" x2="550" y2="98" stroke="#64748b" stroke-width="2"/>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">Result: Provisioned, added to inventory, assigned to its site</text>
</svg><p class="cap">The installer only cables and powers the switch; everything else comes from the controller.</p></div>

<h3>Claiming the device</h3>
<p>The new device appears in <b>Provision → Plug and Play</b> as <b>Unclaimed</b>, identified by serial number and product ID. You can also pre-add it as <b>Planned</b> by serial number so it is claimed automatically the moment it calls in. Claiming means choosing its <b>site</b>, the <b>golden image</b> it must run and the <b>onboarding (Day-0) template</b> (hostname, management SVI, credentials). The device downloads and installs the image if needed, applies the Day-0 config, and moves to <b>Provisioned</b>; it now sits in the inventory like a discovered device.</p>
<pre class="out">Provision → Plug and Play (GUI view)
Serial       Product ID         Site                 State
-----------  -----------------  -------------------  -----------
FOC2601X1AB  C9200-24P          Pune / Pune Campus   <span class="hl">Provisioned</span>
FOC2601X1AC  C9200-24P          -                    Unclaimed</pre>

<h3>Assign to site, then Provision</h3>
<p>Whether a device arrived by discovery or PnP, the Day-1 steps are the same. <b>Assign to site</b> places it in the hierarchy; with <b>device controllability</b> enabled, the controller also configures the telemetry it needs for Assurance (syslog and SNMP trap destinations, NETCONF and similar). <b>Provision</b> then pushes the intent for that site: network settings from Design (AAA, NTP, DNS, banner), the templates in the site's network profile (you fill in their variables in the wizard), and for wireless controllers the WLANs. You can deploy now or schedule, and every push creates a task you can track.</p>

<h3>SWIM in practice</h3>
<p>From the inventory you pick devices flagged as not running the golden image and choose <b>Update OS image</b>. The workflow runs the readiness checks, <b>distributes</b> the image (copy to flash, safe during business hours) and <b>activates</b> it (install mode and reload, scheduled in the change window), then post-checks compare interfaces and neighbours before and after. For stacks and HA pairs it handles members in the right order.</p>

<div class="eg"><p><b>Worked example: opening a new branch in one evening.</b> Ten new access switches ship to Nagpur with their serials pre-added as Planned under Nagpur / Branch-1. Local staff cable them and power on. Each gets 10.99.0.x plus option 43 from the distribution switch, calls CTRL, is auto-claimed, upgrades to the golden image (about 15 minutes), applies the Day-0 template, then Provision pushes NTP, AAA and the banner from Design. By the time the engineer finishes dinner, ten switches show Managed and Good health, and a compliance run proves all ten match the standard.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Leaving old config on a "new" switch (PnP only starts with no startup config, so <code>write erase</code> and reload first). Forgetting the helper address when DHCP lives on another subnet. Marking no golden image, so the claim has nothing to upgrade to. Activating images in business hours: activation reloads the device.</p></div>
<div class="exam"><p><b>Exam traps.</b> The three PnP server discovery methods are DHCP option 43, DNS <code>pnpserver</code> lookup and the Cisco cloud PnP Connect redirect. PnP is Day-0; templates can be Day-0 (onboarding) or Day-N. SWIM order: pre-check, distribute, activate, post-check.</p></div>

<div class="scn"><h4>The branch that stayed Unclaimed</h4><p>A new store switch reached the controller but stayed Unclaimed overnight. The engineer had pre-added the serial with a typo (a zero instead of the letter O). Claiming it manually from the Unclaimed list with the right site and template onboarded it in 12 minutes. Later that month another switch never appeared at all: its uplink VLAN had no <code>ip helper-address</code>, so it never got option 43.</p><p><b>Lesson:</b> "never appears" is a DHCP/DNS/path problem; "appears but not claimed" is a serial or claim-rule problem.</p></div>

<div class="iv"><p class="q">"How does a new Catalyst switch find Catalyst Center with zero configuration?"</p><p>Explain the PnP agent: no startup config, DHCP on the uplink, then option 43 with the controller IP, or a DNS lookup of pnpserver in the DHCP domain, or the cloud PnP Connect redirect by serial number. Then the device shows Unclaimed (or matches a Planned entry), is claimed to a site with a golden image and Day-0 template, and becomes Provisioned in the inventory.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Day-0 = PnP onboarding; Day-1 = site assignment and provisioning; Day-N = ongoing changes.</li>
<li>PnP discovery: DHCP option 43, DNS pnpserver, or cloud PnP Connect.</li>
<li>Claim sets site, golden image and onboarding template; result is Provisioned.</li>
<li>Provision pushes Design settings and profile templates to the device.</li>
<li>SWIM: distribute early, activate in the window, with pre- and post-checks.</li>
</ul></div>
`,hi:`
<p>Naya employee join karta hai to HR use 40 page ka manual de kar "best of luck" nahi bolta. Badge, laptop aur accounts pehle din se pehle ready hote hain, aur aate hi woh plug in karta hai aur sab chal jaata hai. <b>Plug and Play (PnP)</b> switches aur routers ke liye yahi karta hai: bilkul naya box branch par unpack hota hai, koi bina networking skills wala use cable karta hai, power on karta hai, aur woh Catalyst Center se khud configure ho jaata hai.</p>

<h3>Day-0, Day-1, Day-N</h3>
<table class="cmp"><tr><th>Phase</th><th>Kya hota hai</th><th>Catalyst Center tool</th></tr>
<tr><td><b>Day-0</b></td><td>Unconfigured device ko pehla config aur image milti hai</td><td>Onboarding template ke saath Plug and Play</td></tr>
<tr><td><b>Day-1</b></td><td>Device apni site join karta hai aur site standards paata hai</td><td>Assign to site, Provision (network settings, profile templates)</td></tr>
<tr><td><b>Day-N</b></td><td>Baad ka har change, upgrade aur check</td><td>Day-N templates, SWIM, compliance, Assurance</td></tr></table>

<h3>PnP controller ko kaise dhoondhta hai</h3>
<p>Modern IOS XE devices jab startup configuration nahi hoti to embedded <b>PnP agent</b> ke saath boot hote hain. Agent apne uplink par DHCP se address leta hai aur phir PnP server dhoondhta hai, is order mein:</p>
<ol><li><b>DHCP option 43</b> — DHCP server ek string deta hai jismein controller ka IP hota hai.</li>
<li><b>DNS</b> — agent DHCP se mile domain name ke saath <code>pnpserver.&lt;domain&gt;</code> resolve karta hai (jaise <code>pnpserver.campus.example</code>).</li>
<li><b>Cisco Plug and Play Connect</b> — ek cloud redirect service; device ka serial number aapke Smart Account mein register hota hai aur aapke controller ki taraf point hota hai.</li></ol>

<pre class="code"><span class="c">! DSW1 management VLAN ka DHCP server, naye switches ko CTRL (10.99.0.10) ki taraf point karta hai</span>
ip dhcp excluded-address 10.99.0.1 10.99.0.20
ip dhcp pool PNP-MGMT
 network 10.99.0.0 255.255.255.0
 default-router 10.99.0.1
 domain-name campus.example
 option 43 ascii "5A1N;B2;K4;I10.99.0.10;J80"</pre>
<p>Option 43 string mein <code>5A1N</code> PnP version aur operation code hai, <code>B2</code> ka matlab IPv4 address aage hai, <code>K4</code> plain web transport chunta hai (<code>K5</code> TLS version hota), <code>I10.99.0.10</code> controller ka address hai aur <code>J80</code> port. Agar naye switch ka uplink DHCP server se alag VLAN mein hai, to SVI par <code>ip helper-address</code> chahiye.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="PnP onboarding flow">
<rect x="10" y="70" width="110" height="56" rx="10" fill="#e2e8f0"/><text x="65" y="94" text-anchor="middle" class="svg-ink" font-size="13">Naya switch</text><text x="65" y="111" text-anchor="middle" class="svg-muted" font-size="12">config nahi</text>
<rect x="150" y="70" width="110" height="56" rx="10" fill="#bae6fd"/><text x="205" y="94" text-anchor="middle" class="svg-ink" font-size="13">DHCP</text><text x="205" y="111" text-anchor="middle" class="svg-muted" font-size="12">IP + option 43</text>
<rect x="290" y="70" width="130" height="56" rx="10" fill="#bbf7d0"/><text x="355" y="94" text-anchor="middle" class="svg-ink" font-size="13">CTRL se contact</text><text x="355" y="111" text-anchor="middle" class="svg-muted" font-size="12">Unclaimed</text>
<rect x="450" y="70" width="80" height="56" rx="10" fill="#fde68a"/><text x="490" y="94" text-anchor="middle" class="svg-ink" font-size="13">Claim</text><text x="490" y="111" text-anchor="middle" class="svg-muted" font-size="12">site</text>
<rect x="550" y="70" width="84" height="56" rx="10" fill="#ddd6fe"/><text x="592" y="94" text-anchor="middle" class="svg-ink" font-size="12">Image +</text><text x="592" y="111" text-anchor="middle" class="svg-ink" font-size="12">Day-0 config</text>
<line x1="120" y1="98" x2="150" y2="98" stroke="#64748b" stroke-width="2"/><line x1="260" y1="98" x2="290" y2="98" stroke="#64748b" stroke-width="2"/><line x1="420" y1="98" x2="450" y2="98" stroke="#64748b" stroke-width="2"/><line x1="530" y1="98" x2="550" y2="98" stroke="#64748b" stroke-width="2"/>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">Result: Provisioned, inventory mein add, apni site ko assigned</text>
</svg><p class="cap">Installer sirf switch cable aur power karta hai; baaki sab controller se aata hai.</p></div>

<h3>Device claim karna</h3>
<p>Naya device <b>Provision → Plug and Play</b> mein <b>Unclaimed</b> ke roop mein dikhta hai, serial number aur product ID se pehchaana hua. Aap use serial number se pehle hi <b>Planned</b> ke roop mein add kar sakte ho taaki call karte hi woh automatically claim ho jaaye. Claim karne ka matlab hai uski <b>site</b>, woh <b>golden image</b> jo use chalani hai aur <b>onboarding (Day-0) template</b> (hostname, management SVI, credentials) chunna. Zaroorat ho to device image download aur install karta hai, Day-0 config apply karta hai, aur <b>Provisioned</b> par chala jaata hai; ab woh discovered device ki tarah inventory mein hai.</p>
<pre class="out">Provision → Plug and Play (GUI view)
Serial       Product ID         Site                 State
-----------  -----------------  -------------------  -----------
FOC2601X1AB  C9200-24P          Pune / Pune Campus   <span class="hl">Provisioned</span>
FOC2601X1AC  C9200-24P          -                    Unclaimed</pre>

<h3>Assign to site, phir Provision</h3>
<p>Device discovery se aaya ho ya PnP se, Day-1 steps same hain. <b>Assign to site</b> use hierarchy mein rakhta hai; <b>device controllability</b> enable ho to controller Assurance ke liye zaroori telemetry bhi configure karta hai (syslog aur SNMP trap destinations, NETCONF waghera). Phir <b>Provision</b> us site ka intent push karta hai: Design se network settings (AAA, NTP, DNS, banner), site ke network profile ke templates (wizard mein aap unke variables bharte ho), aur wireless controllers ke liye WLANs. Aap abhi deploy kar sakte ho ya schedule, aur har push ek task banata hai jise aap track kar sakte ho.</p>

<h3>SWIM practice mein</h3>
<p>Inventory se aap woh devices chunte ho jo golden image nahi chala rahe aur <b>Update OS image</b> choose karte ho. Workflow readiness checks chalata hai, image <b>distribute</b> karta hai (flash mein copy, business hours mein safe) aur <b>activate</b> karta hai (install mode aur reload, change window mein scheduled), phir post-checks pehle aur baad ke interfaces aur neighbours compare karte hain. Stacks aur HA pairs mein woh members ko sahi order mein handle karta hai.</p>

<div class="eg"><p><b>Worked example: ek shaam mein naya branch kholna.</b> Das naye access switches Nagpur bheje jaate hain, unke serials Nagpur / Branch-1 ke neeche Planned ke roop mein pehle se add hain. Local staff unhe cable karke power on karta hai. Har ek distribution switch se 10.99.0.x plus option 43 leta hai, CTRL ko call karta hai, auto-claim hota hai, golden image par upgrade hota hai (lagbhag 15 minute), Day-0 template apply karta hai, phir Provision Design se NTP, AAA aur banner push karta hai. Engineer ka dinner khatam hote-hote das switches Managed aur Good health dikhate hain, aur compliance run prove karta hai ki dasoon standard se match karte hain.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> "Naye" switch par purana config chhod dena (PnP sirf tab shuru hota hai jab startup config nahi hoti, isliye pehle <code>write erase</code> aur reload). DHCP doosre subnet par ho to helper address bhool jaana. Koi golden image mark na karna, to claim ke paas upgrade karne ko kuch nahi. Business hours mein images activate karna: activation device reload karta hai.</p></div>
<div class="exam"><p><b>Exam traps.</b> Teen PnP server discovery methods hain DHCP option 43, DNS <code>pnpserver</code> lookup aur Cisco cloud PnP Connect redirect. PnP Day-0 hai; templates Day-0 (onboarding) ya Day-N ho sakte hain. SWIM order: pre-check, distribute, activate, post-check.</p></div>

<div class="scn"><h4>Woh branch jo Unclaimed hi raha</h4><p>Ek naya store switch controller tak pahuncha lekin raat bhar Unclaimed raha. Engineer ne serial ek typo ke saath pre-add kiya tha (letter O ki jagah zero). Unclaimed list se sahi site aur template ke saath manually claim karne par 12 minute mein onboard ho gaya. Usi mahine ek aur switch kabhi dikha hi nahi: uske uplink VLAN par <code>ip helper-address</code> nahi tha, isliye use kabhi option 43 mila hi nahi.</p><p><b>Lesson:</b> "kabhi dikhta hi nahi" DHCP/DNS/path problem hai; "dikhta hai par claim nahi hota" serial ya claim-rule problem hai.</p></div>

<div class="iv"><p class="q">"Naya Catalyst switch zero configuration ke saath Catalyst Center ko kaise dhoondhta hai?"</p><p>PnP agent samjhao: startup config nahi, uplink par DHCP, phir controller IP wala option 43, ya DHCP domain mein pnpserver ka DNS lookup, ya serial number se cloud PnP Connect redirect. Phir device Unclaimed dikhta hai (ya Planned entry se match karta hai), golden image aur Day-0 template ke saath site par claim hota hai, aur inventory mein Provisioned ban jaata hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Day-0 = PnP onboarding; Day-1 = site assignment aur provisioning; Day-N = aage ke changes.</li>
<li>PnP discovery: DHCP option 43, DNS pnpserver, ya cloud PnP Connect.</li>
<li>Claim site, golden image aur onboarding template set karta hai; result Provisioned hai.</li>
<li>Provision Design settings aur profile templates device par push karta hai.</li>
<li>SWIM: jaldi distribute karo, window mein activate karo, pre- aur post-checks ke saath.</li>
</ul></div>
`}};export{e as default};