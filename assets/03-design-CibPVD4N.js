var e={id:`design`,h:{en:`Design: sites, settings, IP pools, images and profiles`,hi:`Design: sites, settings, IP pools, images aur profiles`},body:{en:`
<p>Before a builder pours concrete, an architect draws the plan: which city, which building, which floor, where the water and power come in, and which materials are approved. <b>Design</b> is that plan for your network. Nothing gets pushed to a device yet; you are describing the network once so every later workflow can reuse it.</p>

<h3>1. The network hierarchy</h3>
<p>Catalyst Center organises everything by <b>site</b>. The hierarchy is:</p>
<ul><li><b>Global</b> — the root, always present.</li>
<li><b>Area</b> — a region, country or city. Areas can be nested (Asia → India → Pune).</li>
<li><b>Building</b> — a real building with an address and coordinates.</li>
<li><b>Floor</b> — inside a building; you upload a floor plan so wireless heatmaps and AP locations make sense.</li></ul>
<p>Devices are <b>assigned to sites</b> (a switch to a building or floor, an AP to a floor). The hierarchy is not just labels: settings, IP pools, profiles, health dashboards and reports all follow it.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Site hierarchy and inheritance">
<rect x="250" y="10" width="140" height="36" rx="8" fill="#fde68a"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="13">Global</text>
<rect x="250" y="66" width="140" height="36" rx="8" fill="#bae6fd"/><text x="320" y="89" text-anchor="middle" class="svg-ink" font-size="13">Area: India / Pune</text>
<rect x="110" y="122" width="170" height="36" rx="8" fill="#bbf7d0"/><text x="195" y="145" text-anchor="middle" class="svg-ink" font-size="13">Building: Pune Campus</text>
<rect x="360" y="122" width="170" height="36" rx="8" fill="#bbf7d0"/><text x="445" y="145" text-anchor="middle" class="svg-ink" font-size="13">Building: Pune DC</text>
<rect x="40" y="178" width="130" height="36" rx="8" fill="#ddd6fe"/><text x="105" y="201" text-anchor="middle" class="svg-ink" font-size="13">Floor 1</text>
<rect x="210" y="178" width="130" height="36" rx="8" fill="#ddd6fe"/><text x="275" y="201" text-anchor="middle" class="svg-ink" font-size="13">Floor 2</text>
<line x1="320" y1="46" x2="320" y2="66" stroke="#64748b"/><line x1="320" y1="102" x2="195" y2="122" stroke="#64748b"/><line x1="320" y1="102" x2="445" y2="122" stroke="#64748b"/>
<line x1="195" y1="158" x2="105" y2="178" stroke="#64748b"/><line x1="195" y1="158" x2="275" y2="178" stroke="#64748b"/>
<text x="560" y="33" text-anchor="middle" class="svg-accent" font-size="12">NTP, DNS, AAA</text>
<text x="560" y="50" text-anchor="middle" class="svg-muted" font-size="12">set here, inherited</text>
<text x="560" y="201" text-anchor="middle" class="svg-muted" font-size="12">override lower if needed</text>
</svg><p class="cap">Settings defined higher up are inherited by every child site unless a child overrides them.</p></div>

<h3>2. Network settings and inheritance</h3>
<p><b>Network Settings</b> hold the common services every device needs: AAA servers (for network devices and for clients), DHCP and DNS servers, NTP server, time zone, syslog and SNMP trap receivers, NetFlow collector, message-of-the-day banner, and <b>device credentials</b> (CLI username/password, SNMPv2c or SNMPv3, NETCONF port, HTTPS). You set them at Global and they <b>inherit</b> down; a site can override one value (for example, Pune uses its local NTP source 10.255.0.1) without copying the rest. When a device is provisioned to a site, these settings are what get pushed.</p>

<h3>3. IP address pools</h3>
<p>Catalyst Center has a built-in IP address manager, or it can integrate with an external IPAM. You create large <b>global pools</b> (for example 10.0.0.0/8), then <b>reserve</b> smaller sub-pools per site, each with a type such as LAN, management or wireless, gateway and DHCP/DNS servers. SD-Access uses these reserved pools to build the fabric's subnets automatically. The design rule: plan pools per site so summarisation stays clean.</p>

<h3>4. Image repository and SWIM</h3>
<p>The <b>Image Repository</b> stores IOS XE and other software images, imported from Cisco online or uploaded. For each device family (and optionally role and site) you mark one image as <b>golden</b>: the approved version. <b>SWIM</b> (Software Image Management) then works in steps: <b>readiness pre-checks</b> (flash space, config saved, reachability), <b>distribute</b> (copy the image to the device's flash, can run ahead of time), <b>activate</b> (install and reload, normally scheduled in a maintenance window) and <b>post-checks</b>. Devices not running the golden image are flagged as outdated and show up in compliance.</p>

<h3>5. Network profiles</h3>
<p>A <b>network profile</b> bundles "how this kind of site is built": for example a switching profile for small branches, or a wireless profile listing SSIDs. You attach <b>templates</b> to a profile (for a device type and role) and assign the profile to sites. When a device in that site is provisioned, the templates in its profile are applied. This is how a new branch gets exactly the same configuration as the last fifty.</p>

<div class="eg"><p><b>Worked example: designing the lab campus.</b></p>
<table class="cmp"><tr><th>Design item</th><th>Value</th></tr>
<tr><td>Hierarchy</td><td>Global / India / Pune / Pune Campus</td></tr>
<tr><td>Device credentials</td><td>CLI netadmin (privilege 15), SNMPv2c read community nkro</td></tr>
<tr><td>NTP (overridden at Pune)</td><td>10.255.0.1 (R1 is the NTP master)</td></tr>
<tr><td>Banner</td><td>Authorised access only - Pune Campus</td></tr>
<tr><td>Reserved pools</td><td>Users 10.10.10.0/24, Staff 10.20.20.0/24, Mgmt 10.99.0.0/24</td></tr>
<tr><td>Golden image</td><td>One approved IOS XE release per switch family</td></tr></table>
<p>In the lab controller the NTP and banner standards are delivered by the <code>NTP-Baseline</code> and <code>Banner-Standard</code> templates with variables <code>ntp_server</code> and <code>site</code>, exactly the values above.</p></div>

<pre class="code"><span class="c">! See the lab's built-in standards and their variables</span>
CTRL&gt; center template list</pre>
<pre class="out">Template         Lines  Variables      Description
---------------  -----  -------------  -----------------------------------------------------------
<span class="hl">NTP-Baseline     1      ntp_server     Point the device at the site NTP source</span>
Banner-Standard  1      site           Legal login banner with the site name
Syslog-Baseline  2      syslog_server  Send logs to the site syslog collector with msec timestamps</pre>

<div class="warn"><p><b>Common mistakes.</b> Putting devices at "Global" and never assigning them to a building: health by site, profiles and site settings then do nothing. And overriding a setting at a child site, forgetting, and later wondering why a Global change "did not apply" there.</p></div>
<div class="exam"><p><b>Exam traps.</b> The hierarchy is Global → Area → Building → Floor (floors only exist inside buildings). Golden image marking and SWIM belong to <b>Design</b> (repository) and <b>Provision</b> (upgrade). Network settings are pushed when a device is <b>provisioned</b> to a site, not when you type them in Design.</p></div>

<div class="scn"><h4>The upgrade that ate the flash</h4><p>A bank scheduled a night-time IOS XE upgrade on 120 access switches through SWIM. Forty failed. The engineer opened the readiness report: those switches had old images still on flash and not enough free space. They skipped pre-checks the first time. The fix was to clean flash, re-run readiness, distribute the image a day earlier and activate only in the window. The second night took 25 minutes with zero failures.</p><p><b>Lesson:</b> distribute early, activate in the window, and never skip readiness checks.</p></div>

<div class="iv"><p class="q">"How would you standardise NTP, DNS and AAA across 300 sites with Catalyst Center?"</p><p>Build the site hierarchy, define the services in Network Settings at Global so every site inherits them, override only where a site genuinely differs, and provision devices to their sites so the settings are pushed. Mention templates in network profiles for anything settings do not cover, and a compliance check afterwards to prove it.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Hierarchy: Global, Area, Building, Floor; devices are assigned to sites.</li>
<li>Network settings and credentials are inherited down the hierarchy and can be overridden.</li>
<li>Global IP pools are reserved per site; SD-Access builds subnets from them.</li>
<li>Golden images plus SWIM: pre-check, distribute, activate, post-check.</li>
<li>Network profiles attach templates to sites so every site is built the same way.</li>
</ul></div>
`,hi:`
<p>Builder concrete daalne se pehle architect plan banata hai: kaunsa shehar, kaunsi building, kaunsa floor, paani aur bijli kahan se aayegi, aur kaunse materials approved hain. <b>Design</b> aapke network ke liye wahi plan hai. Abhi kisi device par kuch push nahi hota; aap network ko ek baar describe karte ho taaki baad ka har workflow use reuse kar sake.</p>

<h3>1. Network hierarchy</h3>
<p>Catalyst Center sab kuch <b>site</b> ke hisaab se organise karta hai. Hierarchy yeh hai:</p>
<ul><li><b>Global</b> — root, hamesha hota hai.</li>
<li><b>Area</b> — region, desh ya shehar. Areas nested ho sakte hain (Asia → India → Pune).</li>
<li><b>Building</b> — asli building, address aur coordinates ke saath.</li>
<li><b>Floor</b> — building ke andar; aap floor plan upload karte ho taaki wireless heatmaps aur AP locations samajh aayein.</li></ul>
<p>Devices <b>sites ko assign</b> hote hain (switch ek building ya floor ko, AP ek floor ko). Hierarchy sirf labels nahi hai: settings, IP pools, profiles, health dashboards aur reports sab isi ko follow karte hain.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Site hierarchy aur inheritance">
<rect x="250" y="10" width="140" height="36" rx="8" fill="#fde68a"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="13">Global</text>
<rect x="250" y="66" width="140" height="36" rx="8" fill="#bae6fd"/><text x="320" y="89" text-anchor="middle" class="svg-ink" font-size="13">Area: India / Pune</text>
<rect x="110" y="122" width="170" height="36" rx="8" fill="#bbf7d0"/><text x="195" y="145" text-anchor="middle" class="svg-ink" font-size="13">Building: Pune Campus</text>
<rect x="360" y="122" width="170" height="36" rx="8" fill="#bbf7d0"/><text x="445" y="145" text-anchor="middle" class="svg-ink" font-size="13">Building: Pune DC</text>
<rect x="40" y="178" width="130" height="36" rx="8" fill="#ddd6fe"/><text x="105" y="201" text-anchor="middle" class="svg-ink" font-size="13">Floor 1</text>
<rect x="210" y="178" width="130" height="36" rx="8" fill="#ddd6fe"/><text x="275" y="201" text-anchor="middle" class="svg-ink" font-size="13">Floor 2</text>
<line x1="320" y1="46" x2="320" y2="66" stroke="#64748b"/><line x1="320" y1="102" x2="195" y2="122" stroke="#64748b"/><line x1="320" y1="102" x2="445" y2="122" stroke="#64748b"/>
<line x1="195" y1="158" x2="105" y2="178" stroke="#64748b"/><line x1="195" y1="158" x2="275" y2="178" stroke="#64748b"/>
<text x="560" y="33" text-anchor="middle" class="svg-accent" font-size="12">NTP, DNS, AAA</text>
<text x="560" y="50" text-anchor="middle" class="svg-muted" font-size="12">yahan set, inherit</text>
<text x="560" y="201" text-anchor="middle" class="svg-muted" font-size="12">zaroorat ho to neeche override</text>
</svg><p class="cap">Upar define ki gayi settings har child site inherit karti hai jab tak child unhe override na kare.</p></div>

<h3>2. Network settings aur inheritance</h3>
<p><b>Network Settings</b> mein woh common services hoti hain jo har device ko chahiye: AAA servers (network devices aur clients dono ke liye), DHCP aur DNS servers, NTP server, time zone, syslog aur SNMP trap receivers, NetFlow collector, message-of-the-day banner, aur <b>device credentials</b> (CLI username/password, SNMPv2c ya SNMPv3, NETCONF port, HTTPS). Aap inhe Global par set karte ho aur yeh neeche <b>inherit</b> hoti hain; koi site ek value override kar sakti hai (jaise Pune apna local NTP source 10.255.0.1 use karta hai) baaki copy kiye bina. Jab device kisi site par provision hota hai, yahi settings push hoti hain.</p>

<h3>3. IP address pools</h3>
<p>Catalyst Center mein built-in IP address manager hai, ya yeh external IPAM se integrate ho sakta hai. Aap bade <b>global pools</b> banate ho (jaise 10.0.0.0/8), phir har site ke liye chhote sub-pools <b>reserve</b> karte ho, har ek ka type jaise LAN, management ya wireless, gateway aur DHCP/DNS servers ke saath. SD-Access in reserved pools se fabric ke subnets automatically banata hai. Design rule: har site ke liye pools plan karo taaki summarisation saaf rahe.</p>

<h3>4. Image repository aur SWIM</h3>
<p><b>Image Repository</b> IOS XE aur dusri software images rakhti hai, Cisco online se import ki hui ya upload ki hui. Har device family (aur optionally role aur site) ke liye aap ek image ko <b>golden</b> mark karte ho: approved version. Phir <b>SWIM</b> (Software Image Management) steps mein kaam karta hai: <b>readiness pre-checks</b> (flash space, config saved, reachability), <b>distribute</b> (image ko device ki flash mein copy karo, pehle se chal sakta hai), <b>activate</b> (install aur reload, aam taur par maintenance window mein schedule) aur <b>post-checks</b>. Jo devices golden image par nahi chal rahe unhe outdated flag kiya jaata hai aur woh compliance mein dikhte hain.</p>

<h3>5. Network profiles</h3>
<p><b>Network profile</b> bundle karta hai ki "is tarah ki site kaise banti hai": jaise chhoti branches ke liye switching profile, ya SSIDs list karne wala wireless profile. Aap profile mein <b>templates</b> attach karte ho (device type aur role ke liye) aur profile ko sites assign karte ho. Jab us site ka device provision hota hai, uske profile ke templates apply hote hain. Isi tarah naya branch bilkul pichhle pachaas jaisi configuration paata hai.</p>

<div class="eg"><p><b>Worked example: lab campus design karna.</b></p>
<table class="cmp"><tr><th>Design item</th><th>Value</th></tr>
<tr><td>Hierarchy</td><td>Global / India / Pune / Pune Campus</td></tr>
<tr><td>Device credentials</td><td>CLI netadmin (privilege 15), SNMPv2c read community nkro</td></tr>
<tr><td>NTP (Pune par overridden)</td><td>10.255.0.1 (R1 NTP master hai)</td></tr>
<tr><td>Banner</td><td>Authorised access only - Pune Campus</td></tr>
<tr><td>Reserved pools</td><td>Users 10.10.10.0/24, Staff 10.20.20.0/24, Mgmt 10.99.0.0/24</td></tr>
<tr><td>Golden image</td><td>Har switch family ke liye ek approved IOS XE release</td></tr></table>
<p>Lab controller mein NTP aur banner standards <code>NTP-Baseline</code> aur <code>Banner-Standard</code> templates deliver karte hain, variables <code>ntp_server</code> aur <code>site</code> ke saath, bilkul upar wali values.</p></div>

<pre class="code"><span class="c">! Lab ke built-in standards aur unke variables dekho</span>
CTRL&gt; center template list</pre>
<pre class="out">Template         Lines  Variables      Description
---------------  -----  -------------  -----------------------------------------------------------
<span class="hl">NTP-Baseline     1      ntp_server     Point the device at the site NTP source</span>
Banner-Standard  1      site           Legal login banner with the site name
Syslog-Baseline  2      syslog_server  Send logs to the site syslog collector with msec timestamps</pre>

<div class="warn"><p><b>Common galtiyan.</b> Devices ko "Global" par chhod dena aur kabhi building assign na karna: tab site ke hisaab se health, profiles aur site settings kuch nahi karte. Aur child site par setting override karke bhool jaana, phir baad mein sochna ki Global change wahan "apply kyun nahi hua".</p></div>
<div class="exam"><p><b>Exam traps.</b> Hierarchy Global → Area → Building → Floor hai (floors sirf buildings ke andar hote hain). Golden image marking aur SWIM <b>Design</b> (repository) aur <b>Provision</b> (upgrade) mein aate hain. Network settings tab push hoti hain jab device site par <b>provision</b> hota hai, Design mein type karte waqt nahi.</p></div>

<div class="scn"><h4>Woh upgrade jo flash kha gaya</h4><p>Ek bank ne SWIM se 120 access switches par raat ka IOS XE upgrade schedule kiya. Chaalis fail hue. Engineer ne readiness report kholi: un switches ki flash par purani images padi thi aur free space kam tha. Pehli baar pre-checks skip kiye gaye the. Fix tha flash saaf karna, readiness dobara chalana, image ek din pehle distribute karna aur sirf window mein activate karna. Doosri raat 25 minute lage aur zero failures.</p><p><b>Lesson:</b> jaldi distribute karo, window mein activate karo, aur readiness checks kabhi skip mat karo.</p></div>

<div class="iv"><p class="q">"Catalyst Center se 300 sites par NTP, DNS aur AAA standardise kaise karoge?"</p><p>Site hierarchy banao, services ko Network Settings mein Global par define karo taaki har site inherit kare, sirf wahan override karo jahan site sach mein alag hai, aur devices ko unki sites par provision karo taaki settings push hon. Jo settings cover nahi karti uske liye network profiles mein templates batao, aur baad mein compliance check se proof.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Hierarchy: Global, Area, Building, Floor; devices sites ko assign hote hain.</li>
<li>Network settings aur credentials hierarchy mein neeche inherit hote hain aur override ho sakte hain.</li>
<li>Global IP pools har site ke liye reserve hote hain; SD-Access unse subnets banata hai.</li>
<li>Golden images plus SWIM: pre-check, distribute, activate, post-check.</li>
<li>Network profiles templates ko sites se jodte hain taaki har site ek jaisi bane.</li>
</ul></div>
`}};export{e as default};