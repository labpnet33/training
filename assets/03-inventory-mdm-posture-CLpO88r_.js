var e={id:`inventory-mdm-posture`,h:{en:`Asset inventory, MDM, posture, patching and MFA`,hi:`Asset inventory, MDM, posture, patching aur MFA`},body:{en:`
<p>A school cannot keep children safe if it does not know which children are in the building. The register at the gate (inventory), the uniform and ID card rules (MDM baseline), the nurse checking a child with a fever before letting them into class (posture), and the vaccination schedule (patching) all come before any emergency plan. Endpoint security works the same way: before you protect or investigate a device, you must know it exists and whether it is healthy.</p>

<h3>Asset inventory: you cannot protect what you cannot see</h3>
<p>An <b>asset inventory</b> is the list of every device, its owner, operating system, software and location. Unknown devices are the attacker's favourite foothold: the forgotten test server, the contractor's laptop, the camera nobody patched. Inventory comes from several sources that you reconcile: the EDR console (devices with a connector), MDM, Active Directory or Entra ID, DHCP and network access control logs. A device that appears in DHCP but not in the EDR console is a <b>coverage gap</b>: it has no connector.</p>

<h3>MDM and UEM</h3>
<p><b>Mobile Device Management (MDM)</b> enrols phones, tablets and laptops so an administrator can push configuration and enforce a baseline. <b>Unified Endpoint Management (UEM)</b> is the same idea extended to every OS. Typical capabilities:</p>
<ul>
<li>Inventory of hardware, OS version and installed apps.</li>
<li>Enforce a passcode, screen lock and full-disk encryption.</li>
<li>Push Wi-Fi, VPN and certificate profiles, and deploy apps such as the Secure Client.</li>
<li>Separate work and personal data on BYOD devices (containers or work profiles).</li>
<li>Remote lock and selective or full wipe when a device is lost or an employee leaves.</li>
<li>Report compliance state to other systems, for example to ISE or Duo.</li>
</ul>
<p>The value for security is that MDM makes the baseline <b>enforceable and measurable</b>, and it is often the delivery mechanism for the EDR agent itself.</p>

<h3>Posture assessment</h3>
<p><b>Posture</b> asks a device, at the moment it connects: "are you healthy enough to be trusted right now?" Typical checks are OS version and patch level, disk encryption on, host firewall on, screen lock set, and an EDR or AV agent installed and running with current definitions. The result is <b>compliant</b>, <b>non-compliant</b> or <b>unknown</b>, and access follows:</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Posture flow">
<rect x="20" y="85" width="130" height="50" rx="8" fill="#bae6fd"/><text x="85" y="107" text-anchor="middle" class="svg-ink" font-size="13">Laptop connects</text><text x="85" y="125" text-anchor="middle" class="svg-muted" font-size="12">802.1X / VPN / app</text>
<rect x="200" y="85" width="140" height="50" rx="8" fill="#fde68a"/><text x="270" y="107" text-anchor="middle" class="svg-ink" font-size="13">Posture check</text><text x="270" y="125" text-anchor="middle" class="svg-muted" font-size="12">patch, disk, agent</text>
<rect x="400" y="20" width="220" height="44" rx="8" fill="#bbf7d0"/><text x="510" y="47" text-anchor="middle" class="svg-ink" font-size="13">Compliant: full access</text>
<rect x="400" y="88" width="220" height="44" rx="8" fill="#fed7aa"/><text x="510" y="115" text-anchor="middle" class="svg-ink" font-size="13">Non-compliant: remediation only</text>
<rect x="400" y="156" width="220" height="44" rx="8" fill="#e2e8f0"/><text x="510" y="183" text-anchor="middle" class="svg-ink" font-size="13">Unknown: limited or deny</text>
<line x1="150" y1="110" x2="200" y2="110" stroke="#64748b" stroke-width="2"/>
<line x1="340" y1="110" x2="400" y2="42" stroke="#64748b" stroke-width="2"/><line x1="340" y1="110" x2="400" y2="110" stroke="#64748b" stroke-width="2"/><line x1="340" y1="110" x2="400" y2="178" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Posture turns device health into an access decision.</p></div>

<p>In a Cisco network, posture is enforced in three places you will meet: <b>ISE posture</b> with the Secure Client ISE Posture module (the <i>802.1X, MAB and ISE authorization</i> module covers it, including a CoA that moves a non-compliant laptop to a remediation VLAN), <b>Duo device health</b> at application login, and Secure Access zero-trust policies. Secure Endpoint itself can be a posture condition: "is the connector installed and running?"</p>

<h3>Patching strategy</h3>
<p>Most exploited vulnerabilities have had a patch for months. A <b>patching strategy</b> is the process that closes that gap:</p>
<ol>
<li><b>Inventory</b> what you run (OS, browsers, Office, Java, PDF readers, firmware).</li>
<li><b>Prioritise</b> by risk: known-exploited and internet-facing first (the CVSS, EPSS and KEV ideas from <i>Modern threats</i>).</li>
<li><b>Test</b> on a pilot group, then <b>deploy</b> in rings with a maintenance window.</li>
<li><b>Verify</b> through inventory or vulnerability scans, and handle exceptions with compensating controls (isolation, exploit prevention, IPS).</li>
</ol>
<p>Secure Endpoint helps here: its <b>Vulnerable Software</b> view lists applications with known CVEs observed on connectors, and Exploit Prevention adds a layer while the patch is pending.</p>

<h3>MFA: the endpoint's partner</h3>
<p>A stolen password works from any device. <b>Multifactor authentication (MFA)</b> requires two or more factors from different categories: something you know (password), something you have (phone push, hardware token), something you are (biometric). It stops most credential-stuffing and phishing-reuse attacks. Phishing-resistant methods (FIDO2 security keys, platform authenticators) bind the login to the real site. Combined with device health, MFA becomes "the right person on a healthy device". Duo provides both, and you configure it in a later module.</p>

<div class="eg"><p><b>Worked example.</b> Inventory reconciliation: DHCP has 412 active clients on the staff VLAN, the EDR console shows 377 connectors, and MDM shows 398 enrolled laptops. 412 minus 377 = 35 devices with no connector. 21 of them are printers and phones (expected). 14 are laptops: 10 in MDM but the Secure Client deployment failed, 4 not in MDM at all (unmanaged). Fix the deployment for the 10, and use posture to put the 4 in a remediation VLAN until they are enrolled.</p></div>

<div class="warn"><p><b>Common mistake.</b> Enabling posture in enforcement mode on day one. Run it in monitor mode first, read which checks fail and why, fix the baseline, then enforce. Otherwise half the company lands in the remediation VLAN on Monday morning.</p></div>

<div class="exam"><p><b>Exam trap.</b> MDM manages and inventories devices; posture <i>evaluates</i> compliance at access time; MFA verifies the <i>user</i>. Questions mix them. Also: MFA means factors from <b>different</b> categories. A password plus a security question is two things you know, so it is not MFA.</p></div>

<div class="scn"><h4>The ransomware entry nobody owned</h4><p>A logistics company was hit by ransomware. The trajectory showed the first execution on <code>BUILD-07</code>, a server set up two years earlier by a contractor. It had no connector, was not in MDM and ran an RDP service with a weak local password. It had been invisible to every console. After the incident the team reconciled DHCP, AD and EDR inventories weekly, required posture for VPN, and added MFA to RDP access.</p><p><b>Lesson:</b> unmanaged assets are blind spots; inventory reconciliation is a security control, not paperwork.</p></div>

<div class="iv"><p class="q">"What is the value of MDM and posture assessment in endpoint security?"</p><p>Strong answer: MDM gives an inventory and enforces a baseline (encryption, lock, agent deployed, remote wipe). Posture checks that baseline at connection time and turns it into an access decision through ISE, Duo or a ZTNA policy: compliant gets access, non-compliant gets remediation. Add patching as the process that keeps devices compliant, and MFA to verify the user.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Inventory first: reconcile EDR, MDM, directory and DHCP to find devices with no protection.</li>
<li>MDM/UEM enforces and reports a baseline and often deploys the EDR agent.</li>
<li>Posture = compliant, non-compliant or unknown, enforced by ISE, Duo or ZTNA.</li>
<li>Patching: inventory, prioritise by exploitation and exposure, test, deploy in rings, verify.</li>
<li>MFA needs factors from different categories; phishing-resistant methods are strongest.</li>
</ul></div>
`,hi:`
<p>Ek school bachchon ko surakshit nahi rakh sakta agar use pata hi na ho ki building mein kaun kaun se bachche hain. Gate par register (inventory), uniform aur ID card ke rules (MDM baseline), nurse jo bukhaar wale bachche ko class mein bhejne se pehle check karti hai (posture), aur vaccination schedule (patching), yeh sab kisi bhi emergency plan se pehle aate hain. Endpoint security bhi aise hi kaam karti hai: device ko protect ya investigate karne se pehle aapko pata hona chahiye ki woh exist karta hai aur healthy hai ya nahi.</p>

<h3>Asset inventory: jo dikhta nahi use protect nahi kar sakte</h3>
<p><b>Asset inventory</b> har device, uske owner, operating system, software aur location ki list hai. Unknown devices attacker ka favourite foothold hain: bhula hua test server, contractor ka laptop, woh camera jise kisi ne patch nahi kiya. Inventory kai sources se aati hai jinhe aap reconcile karte ho: EDR console (connector wale devices), MDM, Active Directory ya Entra ID, DHCP aur network access control logs. Jo device DHCP mein dikhe par EDR console mein na ho, woh <b>coverage gap</b> hai: uspar connector nahi hai.</p>

<h3>MDM aur UEM</h3>
<p><b>Mobile Device Management (MDM)</b> phones, tablets aur laptops ko enrol karta hai taaki administrator configuration push kar sake aur baseline enforce kar sake. <b>Unified Endpoint Management (UEM)</b> wahi idea har OS tak badhaya hua hai. Typical capabilities:</p>
<ul>
<li>Hardware, OS version aur installed apps ki inventory.</li>
<li>Passcode, screen lock aur full-disk encryption enforce karna.</li>
<li>Wi-Fi, VPN aur certificate profiles push karna, aur Secure Client jaise apps deploy karna.</li>
<li>BYOD devices par work aur personal data alag karna (containers ya work profiles).</li>
<li>Device kho jaaye ya employee chala jaaye to remote lock aur selective ya full wipe.</li>
<li>Compliance state doosre systems ko report karna, jaise ISE ya Duo ko.</li>
</ul>
<p>Security ke liye iski value yeh hai ki MDM baseline ko <b>enforceable aur measurable</b> banata hai, aur aksar khud EDR agent ka delivery mechanism hota hai.</p>

<h3>Posture assessment</h3>
<p><b>Posture</b> device se, connect hote waqt, poochta hai: "kya tum abhi trust ke laayak healthy ho?" Typical checks hain OS version aur patch level, disk encryption on, host firewall on, screen lock set, aur EDR ya AV agent installed aur current definitions ke saath chal raha. Result <b>compliant</b>, <b>non-compliant</b> ya <b>unknown</b> hota hai, aur access uske hisaab se milta hai:</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Posture flow">
<rect x="20" y="85" width="130" height="50" rx="8" fill="#bae6fd"/><text x="85" y="107" text-anchor="middle" class="svg-ink" font-size="13">Laptop connect</text><text x="85" y="125" text-anchor="middle" class="svg-muted" font-size="12">802.1X / VPN / app</text>
<rect x="200" y="85" width="140" height="50" rx="8" fill="#fde68a"/><text x="270" y="107" text-anchor="middle" class="svg-ink" font-size="13">Posture check</text><text x="270" y="125" text-anchor="middle" class="svg-muted" font-size="12">patch, disk, agent</text>
<rect x="400" y="20" width="220" height="44" rx="8" fill="#bbf7d0"/><text x="510" y="47" text-anchor="middle" class="svg-ink" font-size="13">Compliant: full access</text>
<rect x="400" y="88" width="220" height="44" rx="8" fill="#fed7aa"/><text x="510" y="115" text-anchor="middle" class="svg-ink" font-size="13">Non-compliant: sirf remediation</text>
<rect x="400" y="156" width="220" height="44" rx="8" fill="#e2e8f0"/><text x="510" y="183" text-anchor="middle" class="svg-ink" font-size="13">Unknown: limited ya deny</text>
<line x1="150" y1="110" x2="200" y2="110" stroke="#64748b" stroke-width="2"/>
<line x1="340" y1="110" x2="400" y2="42" stroke="#64748b" stroke-width="2"/><line x1="340" y1="110" x2="400" y2="110" stroke="#64748b" stroke-width="2"/><line x1="340" y1="110" x2="400" y2="178" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Posture device health ko access decision mein badal deta hai.</p></div>

<p>Cisco network mein posture teen jagah enforce hota hai jo aap miloge: Secure Client ISE Posture module ke saath <b>ISE posture</b> (<i>802.1X, MAB and ISE authorization</i> module ise cover karta hai, ek CoA ke saath jo non-compliant laptop ko remediation VLAN mein le jaata hai), application login par <b>Duo device health</b>, aur Secure Access zero-trust policies. Secure Endpoint khud ek posture condition ho sakta hai: "kya connector installed aur chal raha hai?"</p>

<h3>Patching strategy</h3>
<p>Zyadatar exploit hone wali vulnerabilities ka patch mahinon se available hota hai. <b>Patching strategy</b> woh process hai jo yeh gap band karta hai:</p>
<ol>
<li>Jo chalate ho uski <b>inventory</b> (OS, browsers, Office, Java, PDF readers, firmware).</li>
<li>Risk ke hisaab se <b>prioritise</b>: known-exploited aur internet-facing pehle (<i>Modern threats</i> se CVSS, EPSS aur KEV ideas).</li>
<li>Pilot group par <b>test</b>, phir maintenance window ke saath rings mein <b>deploy</b>.</li>
<li>Inventory ya vulnerability scans se <b>verify</b>, aur exceptions ko compensating controls (isolation, exploit prevention, IPS) se handle.</li>
</ol>
<p>Secure Endpoint yahan madad karta hai: iska <b>Vulnerable Software</b> view connectors par dekhe gaye known CVEs wale applications list karta hai, aur Exploit Prevention patch pending rehne tak ek layer jodta hai.</p>

<h3>MFA: endpoint ka saathi</h3>
<p>Chori hua password kisi bhi device se kaam karta hai. <b>Multifactor authentication (MFA)</b> alag categories se do ya zyada factors maangta hai: kuch jo aap jaante ho (password), kuch jo aapke paas hai (phone push, hardware token), kuch jo aap ho (biometric). Yeh zyadatar credential-stuffing aur phishing-reuse attacks rok deta hai. Phishing-resistant methods (FIDO2 security keys, platform authenticators) login ko asli site se bind karte hain. Device health ke saath MFA ban jaata hai "sahi insaan healthy device par". Duo dono deta hai, aur aap use baad ke module mein configure karoge.</p>

<div class="eg"><p><b>Worked example.</b> Inventory reconciliation: staff VLAN par DHCP mein 412 active clients hain, EDR console 377 connectors dikhata hai, aur MDM 398 enrolled laptops dikhata hai. 412 minus 377 = 35 devices bina connector ke. Unmein 21 printers aur phones hain (expected). 14 laptops hain: 10 MDM mein hain par Secure Client deployment fail hua, 4 MDM mein hain hi nahi (unmanaged). 10 ka deployment fix karo, aur 4 ko enrol hone tak posture se remediation VLAN mein daalo.</p></div>

<div class="warn"><p><b>Common galti.</b> Pehle hi din posture ko enforcement mode mein on kar dena. Pehle monitor mode mein chalao, padho kaunse checks fail hote hain aur kyun, baseline fix karo, phir enforce karo. Warna aadhi company Monday subah remediation VLAN mein pahunch jaati hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> MDM devices manage aur inventory karta hai; posture access time par compliance <i>evaluate</i> karta hai; MFA <i>user</i> ko verify karta hai. Questions inhe mix karte hain. Aur: MFA ka matlab <b>alag</b> categories ke factors. Password plus security question do "jaante ho" wali cheezein hain, isliye woh MFA nahi hai.</p></div>

<div class="scn"><h4>Ransomware ka entry point jiska koi owner nahi tha</h4><p>Ek logistics company par ransomware hua. Trajectory ne pehla execution <code>BUILD-07</code> par dikhaya, ek server jo do saal pehle ek contractor ne setup kiya tha. Uspar connector nahi tha, MDM mein nahi tha aur kamzor local password ke saath RDP service chala raha tha. Woh har console ke liye invisible tha. Incident ke baad team ne DHCP, AD aur EDR inventories ko har hafte reconcile kiya, VPN ke liye posture zaroori kiya, aur RDP access par MFA joda.</p><p><b>Seekh:</b> unmanaged assets blind spots hain; inventory reconciliation ek security control hai, paperwork nahi.</p></div>

<div class="iv"><p class="q">"Endpoint security mein MDM aur posture assessment ki value kya hai?"</p><p>Strong answer: MDM inventory deta hai aur baseline enforce karta hai (encryption, lock, agent deployed, remote wipe). Posture connection time par us baseline ko check karta hai aur ISE, Duo ya ZTNA policy ke through use access decision mein badalta hai: compliant ko access, non-compliant ko remediation. Patching ko woh process batao jo devices ko compliant rakhta hai, aur MFA ko user verify karne wala.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pehle inventory: bina protection wale devices dhoondhne ke liye EDR, MDM, directory aur DHCP reconcile karo.</li>
<li>MDM/UEM baseline enforce aur report karta hai aur aksar EDR agent deploy karta hai.</li>
<li>Posture = compliant, non-compliant ya unknown, ISE, Duo ya ZTNA se enforce.</li>
<li>Patching: inventory, exploitation aur exposure se prioritise, test, rings mein deploy, verify.</li>
<li>MFA ko alag categories ke factors chahiye; phishing-resistant methods sabse strong hain.</li>
</ul></div>
`}};export{e as default};