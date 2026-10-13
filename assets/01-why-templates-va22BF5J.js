var e={id:`why-templates`,h:{en:`Why templates: policy versus provisioning`,hi:`Templates kyun: policy versus provisioning`},body:{en:`
<div class="note"><p><b>What you will learn.</b> The difference between policy (what traffic is allowed) and provisioning (how a FortiGate itself is set up), why FortiManager has a separate tool for the second job, which kinds of provisioning template exist, and which of them the simulator really runs. <b>Prerequisites:</b> the modules fmg-start, fmg-adom and fmg-policy. You know what an ADOM is, you can read <code>diagnose dvm device list</code>, and you know that a policy package is installed to a device with an <code>execute fmgui</code> command in the simulator.</p></div>

<p>Think of a company that opens a new shop every month. The head office has two kinds of instructions. One is the rule book: who may enter which room, which goods may leave. The other is the shop fit-out checklist: which telephone number to call for support, which name to paint on the board, which standard tunnel to the warehouse to build. The rule book is almost the same everywhere. The fit-out checklist has a few blanks that change per shop. FortiManager keeps these two apart. The rule book is the <b>policy package</b>. The fit-out checklist is made of <b>provisioning templates</b>.</p>

<h3>Policy versus provisioning</h3>
<p><b>Policy</b> answers the question "what is allowed between which networks". It lives in policy packages and address objects, and one package can serve many FortiGates. <b>Provisioning</b> answers "how is this firewall itself configured": its DNS servers, its VPN tunnel to the hub, its administrative settings, its helper objects. These settings are needed on every device, but values such as a tunnel name, a gateway or a pre-shared key often differ by site. A <b>template</b> is a named, reusable block of such settings that you build once in the ADOM and assign to devices.</p>

<table class="cmp"><tr><th>Question</th><th>Policy package</th><th>Provisioning template</th></tr>
<tr><td>What does it describe?</td><td>Firewall policies and the objects they use</td><td>Device settings: DNS, IPsec tunnel, scripted CLI lines</td></tr>
<tr><td>How is it attached?</td><td>Installation targets of the package</td><td>Assigned per device in the device database</td></tr>
<tr><td>How does it reach the device?</td><td>Install package</td><td>Install device settings (and also with a package install)</td></tr>
<tr><td>Config status before install</td><td>pkg shows modified</td><td>dev-db shows modified</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Templates and package reach the same FortiGate">
<rect x="20" y="20" width="170" height="52" rx="8" fill="#ddd6fe"/><text x="105" y="42" text-anchor="middle" class="svg-ink" font-size="13">Policy package</text><text x="105" y="60" text-anchor="middle" class="svg-muted" font-size="12">what is allowed</text>
<rect x="20" y="88" width="170" height="52" rx="8" fill="#bbf7d0"/><text x="105" y="110" text-anchor="middle" class="svg-ink" font-size="13">System template</text><text x="105" y="128" text-anchor="middle" class="svg-muted" font-size="12">DNS</text>
<rect x="20" y="156" width="170" height="52" rx="8" fill="#fde68a"/><text x="105" y="178" text-anchor="middle" class="svg-ink" font-size="13">CLI + IPsec template</text><text x="105" y="196" text-anchor="middle" class="svg-muted" font-size="12">script, tunnel</text>
<rect x="250" y="80" width="130" height="70" rx="8" fill="#e2e8f0"/><text x="315" y="110" text-anchor="middle" class="svg-ink" font-size="13">FMG-1</text><text x="315" y="130" text-anchor="middle" class="svg-muted" font-size="12">device database</text>
<rect x="450" y="80" width="170" height="70" rx="8" fill="#bae6fd"/><text x="535" y="110" text-anchor="middle" class="svg-ink" font-size="13">TRY-FGT</text><text x="535" y="130" text-anchor="middle" class="svg-muted" font-size="12">192.0.2.13</text>
<line x1="190" y1="46" x2="250" y2="105" stroke="#64748b" stroke-width="2"/><line x1="190" y1="114" x2="250" y2="115" stroke="#64748b" stroke-width="2"/><line x1="190" y1="182" x2="250" y2="130" stroke="#64748b" stroke-width="2"/>
<line x1="380" y1="115" x2="450" y2="115" stroke="#64748b" stroke-width="2"/><text x="385" y="105" class="svg-accent" font-size="12">install</text>
</svg><p class="cap">Package and templates are different objects that travel to the same FortiGate in one install.</p></div>

<h3>The kinds of template</h3>
<p>The real product has several kinds: system templates, CLI templates, IPsec tunnel templates, and others for BGP, SD-WAN, static routes and certificates, plus template groups and metadata variables that fill per-device blanks. The simulator models three kinds only. A <b>system template</b> sets DNS servers and the search domain. A <b>CLI template</b> is one script of FortiGate CLI lines. An <b>IPsec template</b> builds a tunnel; you create it by activating a copy of the Fortinet-recommended template Branch_IPSec_Recommended. BGP, SD-WAN, certificate templates, template groups and metadata variables are theory only here, and we label them so each time.</p>

<div class="eg"><p><b>Worked example.</b> Kaveri Retail has three FortiGates. All need DNS 192.0.2.53 and 192.0.2.54 with the domain kaveri.example, an address object called NK-MGMT for the management network 192.0.2.0/24, and a tunnel to the hub. Typing this on each FortiGate means three logins and three chances for a typo. With templates you define three objects in the ADOM Kaveri, assign them to TRY-FGT, and install. The device database of FMG-1 then shows one pending change (dev-db: modified) until the install finishes.</p></div>

<h3>Why it matters</h3>
<p>Without templates, provisioning drifts exactly like policy used to: one branch has the old DNS server, another has a tunnel with a different proposal. Templates give one definition and a visible status: <code>dev-db: modified</code> means "FortiManager holds settings that the device has not received yet". That one line replaces a round of logins to check.</p>

<div class="warn"><p><b>Common mistakes.</b> Putting device settings into the policy package because "it is all configuration"; assuming that assigning a template configures the device (it does not, an install does); believing templates replace the policy package (they do not, both are needed).</p></div>

<div class="exam"><p><b>Exam traps.</b> A question may ask where DNS or a tunnel is defined: the answer is a provisioning template, not the policy package. Another asks what <code>dev-db: modified</code> means: pending device-database changes such as templates, not a policy change. In this simulator, authorize, install and template activation are <code>execute fmgui</code> commands; in the real product they are GUI or API actions.</p></div>

<div class="scn"><h4>The branch with the old DNS server</h4><p>A retailer rolled out a new internal DNS server in March. Two branches were updated by hand; the third kept the old address and its users could not open the intranet for a day. The engineer fixed one FortiGate, then discovered that the VPN settings also differed. After the retailer moved DNS and tunnel settings into templates, a DNS change became one edit and one install per device, and the device list showed which branches were still waiting.</p><p><b>Lesson:</b> repeated per-device settings belong in templates, so that one edit reaches every branch the same way.</p></div>

<div class="iv"><p class="q">"What is the difference between a policy package and a template in FortiManager?"</p><p>A package carries firewall policies and the objects they use and is installed to its installation targets. A template carries device provisioning settings, such as DNS, an IPsec tunnel or a CLI script, and is assigned to each device. Both are sent at install time, and the status fields (pkg and dev-db) show what is pending. Mention that template kinds such as BGP and SD-WAN exist in the real product.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Policy says what is allowed; provisioning says how the FortiGate itself is configured.</li>
<li>A template is a reusable, named block of device settings assigned per device.</li>
<li>The simulator runs system (DNS), CLI (script) and IPsec (from Branch_IPSec_Recommended) templates.</li>
<li>dev-db: modified means template changes are waiting in FortiManager.</li>
<li>Assigning is not installing; the device changes only at install.</li>
</ul></div>
`,hi:`
<div class="note"><p><b>Is chapter mein aap seekhoge.</b> Policy (kaunsa traffic allowed hai) aur provisioning (FortiGate khud kaise set up hai) mein kya difference hai, FortiManager mein doosre kaam ke liye alag tool kyun hai, kaun se provisioning template kinds hote hain, aur simulator unmein se kaun se sach mein chalata hai. <b>Prerequisites:</b> modules fmg-start, fmg-adom aur fmg-policy. Aap jaante ho ADOM kya hai, <code>diagnose dvm device list</code> padh sakte ho, aur ye bhi ki simulator mein policy package <code>execute fmgui</code> command se device par install hota hai.</p></div>

<p>Socho ek company har mahine nayi shop kholti hai. Head office ke paas do tarah ki instructions hain. Ek rule book hai: kaun kaunse room mein ja sakta hai, kaunsa saaman bahar ja sakta hai. Doosri shop fit-out checklist hai: support ke liye kaunsa telephone number, board par kaunsa naam, warehouse tak kaunsa standard tunnel banana hai. Rule book lagbhag har jagah same hoti hai. Fit-out checklist mein kuch blanks hote hain jo shop ke hisaab se badalte hain. FortiManager in dono ko alag rakhta hai. Rule book hai <b>policy package</b>. Fit-out checklist <b>provisioning templates</b> se banti hai.</p>

<h3>Policy versus provisioning</h3>
<p><b>Policy</b> jawab deti hai "kaunse networks ke beech kya allowed hai". Wo policy packages aur address objects mein rehti hai, aur ek package kai FortiGates ko serve kar sakta hai. <b>Provisioning</b> jawab deti hai "ye firewall khud kaise configured hai": uske DNS servers, hub tak VPN tunnel, administrative settings, helper objects. Ye settings har device par chahiye, lekin tunnel name, gateway ya pre-shared key jaisi values aksar site ke hisaab se alag hoti hain. <b>Template</b> aisi settings ka named, reusable block hai jo aap ADOM mein ek baar banate ho aur devices ko assign karte ho.</p>

<table class="cmp"><tr><th>Sawal</th><th>Policy package</th><th>Provisioning template</th></tr>
<tr><td>Ye kya describe karta hai?</td><td>Firewall policies aur unke objects</td><td>Device settings: DNS, IPsec tunnel, scripted CLI lines</td></tr>
<tr><td>Kaise attach hota hai?</td><td>Package ke installation targets</td><td>Device database mein har device ko assign</td></tr>
<tr><td>Device tak kaise pahunchta hai?</td><td>Install package</td><td>Install device settings (aur package install ke saath bhi)</td></tr>
<tr><td>Install se pehle config status</td><td>pkg modified dikhata hai</td><td>dev-db modified dikhata hai</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Templates aur package ek hi FortiGate tak pahunchte hain">
<rect x="20" y="20" width="170" height="52" rx="8" fill="#ddd6fe"/><text x="105" y="42" text-anchor="middle" class="svg-ink" font-size="13">Policy package</text><text x="105" y="60" text-anchor="middle" class="svg-muted" font-size="12">kya allowed hai</text>
<rect x="20" y="88" width="170" height="52" rx="8" fill="#bbf7d0"/><text x="105" y="110" text-anchor="middle" class="svg-ink" font-size="13">System template</text><text x="105" y="128" text-anchor="middle" class="svg-muted" font-size="12">DNS</text>
<rect x="20" y="156" width="170" height="52" rx="8" fill="#fde68a"/><text x="105" y="178" text-anchor="middle" class="svg-ink" font-size="13">CLI + IPsec template</text><text x="105" y="196" text-anchor="middle" class="svg-muted" font-size="12">script, tunnel</text>
<rect x="250" y="80" width="130" height="70" rx="8" fill="#e2e8f0"/><text x="315" y="110" text-anchor="middle" class="svg-ink" font-size="13">FMG-1</text><text x="315" y="130" text-anchor="middle" class="svg-muted" font-size="12">device database</text>
<rect x="450" y="80" width="170" height="70" rx="8" fill="#bae6fd"/><text x="535" y="110" text-anchor="middle" class="svg-ink" font-size="13">TRY-FGT</text><text x="535" y="130" text-anchor="middle" class="svg-muted" font-size="12">192.0.2.13</text>
<line x1="190" y1="46" x2="250" y2="105" stroke="#64748b" stroke-width="2"/><line x1="190" y1="114" x2="250" y2="115" stroke="#64748b" stroke-width="2"/><line x1="190" y1="182" x2="250" y2="130" stroke="#64748b" stroke-width="2"/>
<line x1="380" y1="115" x2="450" y2="115" stroke="#64748b" stroke-width="2"/><text x="385" y="105" class="svg-accent" font-size="12">install</text>
</svg><p class="cap">Package aur templates alag objects hain jo ek hi install mein ek hi FortiGate tak jaate hain.</p></div>

<h3>Template ke kinds</h3>
<p>Real product mein kai kinds hain: system templates, CLI templates, IPsec tunnel templates, aur BGP, SD-WAN, static routes aur certificates ke liye aur bhi, saath mein template groups aur metadata variables jo per-device blanks bharte hain. Simulator sirf teen kinds model karta hai. <b>System template</b> DNS servers aur search domain set karta hai. <b>CLI template</b> FortiGate CLI lines ki ek script hai. <b>IPsec template</b> tunnel banata hai; aap ise Fortinet-recommended template Branch_IPSec_Recommended ki copy activate karke banate ho. BGP, SD-WAN, certificate templates, template groups aur metadata variables yahan sirf theory hain, aur har baar hum unhe label karte hain.</p>

<div class="eg"><p><b>Worked example.</b> Kaveri Retail ke teen FortiGates hain. Sabko DNS 192.0.2.53 aur 192.0.2.54 domain kaveri.example ke saath chahiye, management network 192.0.2.0/24 ke liye NK-MGMT naam ka address object, aur hub tak tunnel. Har FortiGate par type karne ka matlab teen logins aur typo ke teen mauke. Templates ke saath aap ADOM Kaveri mein teen objects define karte ho, TRY-FGT ko assign karte ho, aur install karte ho. Install khatam hone tak FMG-1 ka device database ek pending change (dev-db: modified) dikhata hai.</p></div>

<h3>Ye kyun matter karta hai</h3>
<p>Templates ke bina provisioning wahi drift karti hai jo policy pehle karti thi: ek branch par purana DNS server, doosre par alag proposal wala tunnel. Templates ek definition aur visible status dete hain: <code>dev-db: modified</code> ka matlab "FortiManager ke paas wo settings hain jo device ko abhi nahi mili". Ye ek line check karne ke liye logins ka poora round replace kar deti hai.</p>

<div class="warn"><p><b>Common mistakes.</b> Device settings ko policy package mein daalna kyunki "sab configuration hi to hai"; ye maan lena ki template assign karne se device configure ho jata hai (nahi hota, install se hota hai); ye sochna ki templates policy package ko replace karte hain (nahi, dono chahiye).</p></div>

<div class="exam"><p><b>Exam traps.</b> Sawal pooch sakta hai DNS ya tunnel kahan define hota hai: jawab provisioning template hai, policy package nahi. Doosra pooch sakta hai <code>dev-db: modified</code> ka matlab: device database ke pending changes jaise templates, policy change nahi. Is simulator mein authorize, install aur template activation <code>execute fmgui</code> commands hain; real product mein ye GUI ya API actions hain.</p></div>

<div class="scn"><h4>Purane DNS server wali branch</h4><p>Ek retailer ne March mein naya internal DNS server lagaya. Do branches haath se update hui; teesri ne purana address rakha aur uske users ek din intranet nahi khol paye. Engineer ne ek FortiGate fix kiya, phir pata chala ki VPN settings bhi alag thi. DNS aur tunnel settings templates mein jaane ke baad DNS change ek edit aur har device par ek install ban gaya, aur device list dikhati thi kaun si branches abhi wait kar rahi hain.</p><p><b>Lesson:</b> baar-baar dohrai jaane wali per-device settings templates mein rakho, taaki ek edit har branch tak ek jaise pahunche.</p></div>

<div class="iv"><p class="q">"FortiManager mein policy package aur template mein kya difference hai?"</p><p>Package firewall policies aur unke objects carry karta hai aur apne installation targets par install hota hai. Template device provisioning settings carry karta hai, jaise DNS, IPsec tunnel ya CLI script, aur har device ko assign hota hai. Dono install ke time bheje jaate hain, aur status fields (pkg aur dev-db) dikhate hain kya pending hai. Ye bhi bolo ki BGP aur SD-WAN jaise template kinds real product mein hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Policy batati hai kya allowed hai; provisioning batati hai FortiGate khud kaise configured hai.</li>
<li>Template device settings ka reusable, named block hai jo har device ko assign hota hai.</li>
<li>Simulator system (DNS), CLI (script) aur IPsec (Branch_IPSec_Recommended se) templates chalata hai.</li>
<li>dev-db: modified ka matlab template changes FortiManager mein wait kar rahe hain.</li>
<li>Assign karna install karna nahi hai; device sirf install par badalta hai.</li>
</ul></div>
`}};export{e as default};