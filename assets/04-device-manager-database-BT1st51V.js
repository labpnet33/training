var e={id:`device-manager-database`,h:{en:`The device manager and the device database`,hi:`Device manager aur device database`},body:{en:`
<p>A school keeps a register: one line per student with an admission number, a class and a phone number. The register is not the student, and it is not the student's exercise book. It is a record that says who exists, where they belong and how to reach them. The FortiManager <b>device database</b> is that register for FortiGates, and the <b>device manager</b> is the part of FortiManager where you read and edit it.</p>

<h3>What one row holds</h3>
<p>Each managed device is one row of the table <code>dvmdb device</code>. In the simulator you can print the table the way any configuration table is printed:</p>
<pre class="out">FMG-1 # show dvmdb device
config dvmdb device
    edit "HQ-FGT"
        set sn "FGVMEV1RGF38I000"
        set adom "Corporate"
        set ip 192.0.2.11
    next
end</pre>
<table class="cmp"><tr><th>Field</th><th>Meaning</th><th>Why it matters</th></tr>
<tr><td>name</td><td>The label you choose (HQ-FGT)</td><td>Used in every command</td></tr>
<tr><td>sn</td><td>Serial number of the FortiGate</td><td>The real identity of the device</td></tr>
<tr><td>adom</td><td>The ADOM that owns the device</td><td>Decides which packages and objects apply</td></tr>
<tr><td>ip</td><td>Management address</td><td>Where FortiManager reaches the device</td></tr>
<tr><td>firmware</td><td>Release the device reports</td><td>Must equal the ADOM version</td></tr></table>
<p>The serial number is the identity. The name is a label, and the IP can change if the device moves. When a FortiGate calls in over FGFM, FortiManager recognises it by its serial number. The same row can also carry the names of assigned templates (<code>template</code>, <code>ipsec-template</code>, <code>cli-template</code>); module fmg-templates uses those.</p>

<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="Device database row and what it points to">
<rect x="20" y="20" width="200" height="140" rx="8" fill="#bae6fd"/><text x="120" y="44" text-anchor="middle" class="svg-ink" font-size="13">Device database row</text><text x="120" y="74" text-anchor="middle" class="svg-ink" font-size="12">name: HQ-FGT</text><text x="120" y="94" text-anchor="middle" class="svg-ink" font-size="12">sn: FGVMEV1RGF38I000</text><text x="120" y="114" text-anchor="middle" class="svg-ink" font-size="12">adom: Corporate</text><text x="120" y="134" text-anchor="middle" class="svg-ink" font-size="12">ip: 192.0.2.11</text>
<rect x="330" y="20" width="140" height="56" rx="8" fill="#ddd6fe"/><text x="400" y="52" text-anchor="middle" class="svg-ink" font-size="12">ADOM Corporate</text>
<rect x="330" y="104" width="140" height="56" rx="8" fill="#bbf7d0"/><text x="400" y="136" text-anchor="middle" class="svg-ink" font-size="12">Real HQ-FGT</text>
<rect x="520" y="62" width="100" height="56" rx="8" fill="#fde68a"/><text x="570" y="86" text-anchor="middle" class="svg-ink" font-size="12">Last known</text><text x="570" y="102" text-anchor="middle" class="svg-ink" font-size="12">config copy</text>
<line x1="220" y1="48" x2="330" y2="48" stroke="#64748b" stroke-width="2"/><line x1="220" y1="132" x2="330" y2="132" stroke="#64748b" stroke-width="2"/><line x1="470" y1="132" x2="520" y2="100" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The row points to an ADOM and to the real device; FortiManager keeps its own last copy of the configuration.</p></div>

<h3>The device list, column by column</h3>
<p>The tool you will use most is <code>diagnose dvm device list</code>. Real output of a healthy device:</p>
<pre class="out">TYPE          OID  SN                IP          NAME    ADOM   FIRMWARE
fmgfaz-managed 678  FGVMEV1RGF38I000  192.0.2.11  HQ-FGT  Kaveri 7.6 MR0 (3401)
   |- STATUS: dev-db: not modified; conf: in sync; cond: OK; dm: retrieved; conn: up; source: FMG
   |- vdom:[3]root flags:0 adom:Kaveri <span class="hl">pkg:[unknown]null</span></pre>
<p>This is shortened from the real layout. The top line is the register entry: the type, an internal object id (OID), the serial number, the IP, the name, the ADOM and the firmware. Line two is the health status, which chapter 5 explains in detail. Line three says which VDOM and ADOM, and which policy package the device uses. Here pkg shows unknown null because no package has been imported or installed yet. You can also ask for one device: <code>diagnose dvm device list MDU-FGT</code>.</p>

<div class="eg"><p><b>Worked example.</b> Kaveri authorizes HQ-FGT into Corporate. The device database gains one row with the sn FGVMEV1RGF38I000 and the adom Corporate. FortiManager retrieves the configuration as revision 1. A command <code>execute fmpolicy print-device-database HQ-FGT</code> shows the last copy the manager holds; right after the retrieve of a fresh lab device it prints "# (no managed objects)", because the FortiGate has no DNS, address, policy or IPsec settings that FortiManager manages. Managed scope in the simulator: system dns, firewall address, firewall policy, vpn ipsec.</p></div>

<h3>Device database versus device configuration</h3>
<p>Do not confuse three things. The <b>device database row</b> is the register entry. The <b>device configuration</b> is the live configuration running on the FortiGate. The <b>last copy</b> is what FortiManager believes the FortiGate holds, refreshed by retrieve, install and auto update. When someone edits the FortiGate directly, the live configuration and the last copy differ, and FortiManager reports it in the status line (chapter 5).</p>
<p>In the real product, authorize, add-device and import are GUI or API actions; here they are <code>execute fmgui</code> commands, and the table can be edited like any other configuration table.</p>

<div class="warn"><p><b>Common mistakes.</b> Looking at the name instead of the serial number when two devices seem the same. Expecting the IP column to stay filled when the tunnel is down: in the lab a device whose FGFM tunnel is down shows a dash in the IP column. Editing the adom value by hand to move a device; use the authorize flow instead.</p></div>

<div class="exam"><p><b>Exam traps.</b> The serial number identifies the device, not the IP or the name. A device belongs to exactly one ADOM. The device database stores the device row, while policy packages live in the policy database of the ADOM.</p></div>

<div class="scn"><h4>Same name, different box</h4><p>A Kaveri engineer swapped a failed Madurai FortiGate for a new unit and kept the name MDU-FGT. FortiManager still listed the old serial number, and the new box did not match the row. The device database made the cause obvious: the sn column showed the retired unit. The engineer removed the old row and authorized the new unit.</p><p><b>Lesson:</b> trust the serial number, then fix the name.</p></div>

<div class="iv"><p class="q">"What is stored in the device database and how does it differ from a policy package?"</p><p>The device database holds the device rows: name, serial number, ADOM, IP, firmware and assigned templates. A policy package holds rules and is a separate object in the ADOM that is installed onto devices. The first says what exists, the second says what to configure.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Each managed FortiGate is one row of <code>dvmdb device</code> with name, sn, adom and ip.</li>
<li>The serial number is the identity of the device.</li>
<li><code>diagnose dvm device list</code> prints the register entry, the status line and the pkg field.</li>
<li>Row, live configuration and last copy are three different things.</li>
<li>pkg shows unknown null until a package is imported or installed.</li>
</ul></div>
`,hi:`
<p>School ek register rakhta hai: har student ki ek line, admission number, class aur phone number ke saath. Register student nahi hai, aur student ki copy bhi nahi. Wo ek record hai jo batata hai kaun exist karta hai, kahan belong karta hai aur kaise contact karna hai. FortiManager ka <b>device database</b> FortiGates ka wahi register hai, aur <b>device manager</b> FortiManager ka wo hissa hai jahan aap use padhte aur edit karte ho.</p>

<h3>Ek row mein kya hota hai</h3>
<p>Har managed device table <code>dvmdb device</code> ki ek row hai. Simulator mein aap table ko waise hi print kar sakte ho jaise koi bhi configuration table print hoti hai:</p>
<pre class="out">FMG-1 # show dvmdb device
config dvmdb device
    edit "HQ-FGT"
        set sn "FGVMEV1RGF38I000"
        set adom "Corporate"
        set ip 192.0.2.11
    next
end</pre>
<table class="cmp"><tr><th>Field</th><th>Matlab</th><th>Kyun zaroori</th></tr>
<tr><td>name</td><td>Label jo aap chunte ho (HQ-FGT)</td><td>Har command mein use hota hai</td></tr>
<tr><td>sn</td><td>FortiGate ka serial number</td><td>Device ki asli pehchaan</td></tr>
<tr><td>adom</td><td>Device ka malik ADOM</td><td>Tay karta hai ki kaun se packages aur objects lagu honge</td></tr>
<tr><td>ip</td><td>Management address</td><td>Jahan FortiManager device tak pahunchta hai</td></tr>
<tr><td>firmware</td><td>Device jo release report karta hai</td><td>ADOM version ke barabar hona chahiye</td></tr></table>
<p>Serial number hi identity hai. Naam sirf label hai, aur device move kare to IP badal sakta hai. FortiGate FGFM se call in kare to FortiManager use serial number se pehchanta hai. Wahi row assigned templates ke naam bhi rakh sakti hai (<code>template</code>, <code>ipsec-template</code>, <code>cli-template</code>); module fmg-templates unhe use karta hai.</p>

<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="Device database row aur wo kis ko point karti hai">
<rect x="20" y="20" width="200" height="140" rx="8" fill="#bae6fd"/><text x="120" y="44" text-anchor="middle" class="svg-ink" font-size="13">Device database row</text><text x="120" y="74" text-anchor="middle" class="svg-ink" font-size="12">name: HQ-FGT</text><text x="120" y="94" text-anchor="middle" class="svg-ink" font-size="12">sn: FGVMEV1RGF38I000</text><text x="120" y="114" text-anchor="middle" class="svg-ink" font-size="12">adom: Corporate</text><text x="120" y="134" text-anchor="middle" class="svg-ink" font-size="12">ip: 192.0.2.11</text>
<rect x="330" y="20" width="140" height="56" rx="8" fill="#ddd6fe"/><text x="400" y="52" text-anchor="middle" class="svg-ink" font-size="12">ADOM Corporate</text>
<rect x="330" y="104" width="140" height="56" rx="8" fill="#bbf7d0"/><text x="400" y="136" text-anchor="middle" class="svg-ink" font-size="12">Asli HQ-FGT</text>
<rect x="520" y="62" width="100" height="56" rx="8" fill="#fde68a"/><text x="570" y="86" text-anchor="middle" class="svg-ink" font-size="12">Last known</text><text x="570" y="102" text-anchor="middle" class="svg-ink" font-size="12">config copy</text>
<line x1="220" y1="48" x2="330" y2="48" stroke="#64748b" stroke-width="2"/><line x1="220" y1="132" x2="330" y2="132" stroke="#64748b" stroke-width="2"/><line x1="470" y1="132" x2="520" y2="100" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Row ADOM aur asli device ko point karti hai; FortiManager configuration ki apni last copy rakhta hai.</p></div>

<h3>Device list, column by column</h3>
<p>Sabse zyada use hone wala tool <code>diagnose dvm device list</code> hai. Healthy device ka real output:</p>
<pre class="out">TYPE          OID  SN                IP          NAME    ADOM   FIRMWARE
fmgfaz-managed 678  FGVMEV1RGF38I000  192.0.2.11  HQ-FGT  Kaveri 7.6 MR0 (3401)
   |- STATUS: dev-db: not modified; conf: in sync; cond: OK; dm: retrieved; conn: up; source: FMG
   |- vdom:[3]root flags:0 adom:Kaveri <span class="hl">pkg:[unknown]null</span></pre>
<p>Ye real layout se chhota kiya gaya hai. Upar ki line register entry hai: type, internal object id (OID), serial number, IP, naam, ADOM aur firmware. Doosri line health status hai, jise chapter 5 detail mein samjhata hai. Teesri line batati hai kaun sa VDOM aur ADOM, aur device kaun sa policy package use karta hai. Yahan pkg unknown null dikhata hai kyunki abhi koi package import ya install nahi hua. Ek device ke liye bhi pooch sakte ho: <code>diagnose dvm device list MDU-FGT</code>.</p>

<div class="eg"><p><b>Worked example.</b> Kaveri HQ-FGT ko Corporate mein authorize karta hai. Device database mein sn FGVMEV1RGF38I000 aur adom Corporate ke saath ek row judti hai. FortiManager configuration ko revision 1 ki tarah retrieve karta hai. <code>execute fmpolicy print-device-database HQ-FGT</code> wo last copy dikhata hai jo manager ke paas hai; fresh lab device ke retrieve ke turant baad ye "# (no managed objects)" print karta hai, kyunki FortiGate mein koi DNS, address, policy ya IPsec setting nahi hai jo FortiManager manage karta ho. Simulator mein managed scope: system dns, firewall address, firewall policy, vpn ipsec.</p></div>

<h3>Device database versus device configuration</h3>
<p>Teen cheezon ko mix mat karo. <b>Device database row</b> register entry hai. <b>Device configuration</b> FortiGate par chalti live configuration hai. <b>Last copy</b> wo hai jo FortiManager maanta hai ki FortiGate ke paas hai, jo retrieve, install aur auto update se refresh hoti hai. Koi FortiGate ko seedha edit kare to live configuration aur last copy alag ho jati hain, aur FortiManager status line mein batata hai (chapter 5).</p>
<p>Real product mein authorize, add-device aur import GUI ya API actions hain; yahan wo <code>execute fmgui</code> commands hain, aur table ko kisi bhi doosri configuration table ki tarah edit kiya ja sakta hai.</p>

<div class="warn"><p><b>Common mistakes.</b> Do devices ek jaise lagein to serial number ki jagah naam dekhna. Tunnel down ho tab bhi IP column bhara rahega ye maanna: lab mein jis device ka FGFM tunnel down hai uske IP column mein dash dikhta hai. Device ko move karne ke liye adom value haath se badalna; authorize flow use karo.</p></div>

<div class="exam"><p><b>Exam traps.</b> Device ko serial number pehchanta hai, IP ya naam nahi. Device ek hi ADOM ka hota hai. Device database device row rakhta hai, jabki policy packages ADOM ke policy database mein rehte hain.</p></div>

<div class="scn"><h4>Naam wahi, box alag</h4><p>Kaveri ke engineer ne kharab Madurai FortiGate ko naye unit se badla aur naam MDU-FGT rakha. FortiManager abhi bhi purana serial number dikha raha tha, aur naya box row se match nahi hua. Device database ne wajah saaf kar di: sn column mein retire ho chuka unit dikh raha tha. Engineer ne purani row hata kar naya unit authorize kiya.</p><p><b>Lesson:</b> pehle serial number par bharosa karo, phir naam theek karo.</p></div>

<div class="iv"><p class="q">"Device database mein kya store hota hai aur wo policy package se kaise alag hai?"</p><p>Device database device rows rakhta hai: naam, serial number, ADOM, IP, firmware aur assigned templates. Policy package rules rakhta hai aur ADOM ka alag object hai jo devices par install hota hai. Pehla batata hai kya exist karta hai, doosra batata hai kya configure karna hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har managed FortiGate <code>dvmdb device</code> ki ek row hai: name, sn, adom aur ip ke saath.</li>
<li>Serial number device ki identity hai.</li>
<li><code>diagnose dvm device list</code> register entry, status line aur pkg field print karta hai.</li>
<li>Row, live configuration aur last copy teen alag cheezein hain.</li>
<li>Package import ya install hone tak pkg unknown null dikhata hai.</li>
</ul></div>
`}};export{e as default};