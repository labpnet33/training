var e={id:`ipsec-recommended`,h:{en:`IPsec templates and the Fortinet-recommended templates`,hi:`IPsec templates aur Fortinet-recommended templates`},body:{en:`
<p>When a bank gives you a cheque book, the cheques are printed with the bank's layout and you cannot change the printing. You only fill in the blanks: the date, the name, the amount. Fortinet-recommended templates work like that cheque book. FortiManager ships ready-made templates built to Fortinet's recommended practice. They are <b>read-only</b>. You do not edit them; you <b>activate</b> a copy under your own name, and then fill in the blanks of that copy.</p>

<h3>The recommended list</h3>
<p>Every ADOM lists the Fortinet-managed <b>default</b> system template and five recommended templates: HUB_IPSec_Recommended, Branch_IPSec_Recommended, IPSec_Fortinet_Recommended, HUB_BGP_Recommended and BRANCH_BGP_Recommended. The real product can activate them all. The simulator lets you activate only <b>Branch_IPSec_Recommended</b>. The others, and the BGP kinds in particular, are theory here: a hub-side IPsec template builds the hub end of a tunnel for many branches, and BGP templates configure routing over the tunnels. If you try to activate one of them the simulator says that only Branch_IPSec_Recommended is modelled.</p>
<pre class="out">FMG-1 # execute fmgui template list Kaveri
Provisioning templates in ADOM Kaveri:
NAME                            TYPE            SOURCE
default                         system          Fortinet-managed (read-only)
HUB_IPSec_Recommended           ipsec           Fortinet-recommended (read-only, activate to use)
<span class="hl">Branch_IPSec_Recommended</span>        ipsec           Fortinet-recommended (read-only, activate to use)
IPSec_Fortinet_Recommended      ipsec           Fortinet-recommended (read-only, activate to use)
HUB_BGP_Recommended             bgp             Fortinet-recommended (read-only, activate to use)
BRANCH_BGP_Recommended          bgp             Fortinet-recommended (read-only, activate to use)</pre>

<h3>Step by step: a branch tunnel</h3>
<ol>
<li><b>Activate</b> a copy: <code>execute fmgui template activate Kaveri Branch_IPSec_Recommended KR-Branch-IPsec</code>. The new name must not exist yet. The copy has kind ipsec and a source attribute that remembers where it came from.</li>
<li><b>Fill the blanks</b> in <code>config pm template</code>: <code>tunnel-name</code> (the phase 1 interface name, up to 15 characters), <code>remote-gw</code> (the hub's public address) and <code>psksecret</code> (the pre-shared key).</li>
<li><b>Assign</b> it with <code>set ipsec-template</code> in the device entry.</li>
<li><b>Preview, install, verify</b> as with every template.</li>
</ol>
<p>The copy starts with factory values: remote gateway 203.0.113.1 and the key "change-me-now". The key is the dangerous one. A template that still carries it will install a tunnel that cannot come up, and nothing warns you. Always check the template before the install.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Activate a copy of a read-only template">
<rect x="20" y="20" width="200" height="56" rx="8" fill="#e2e8f0"/><text x="120" y="44" text-anchor="middle" class="svg-ink" font-size="13">Branch_IPSec_Recommended</text><text x="120" y="63" text-anchor="middle" class="svg-muted" font-size="12">read-only</text>
<rect x="270" y="20" width="170" height="56" rx="8" fill="#fde68a"/><text x="355" y="44" text-anchor="middle" class="svg-ink" font-size="13">KR-Branch-IPsec</text><text x="355" y="63" text-anchor="middle" class="svg-muted" font-size="12">editable copy</text>
<rect x="490" y="20" width="130" height="56" rx="8" fill="#bae6fd"/><text x="555" y="44" text-anchor="middle" class="svg-ink" font-size="13">TRY-FGT</text><text x="555" y="63" text-anchor="middle" class="svg-muted" font-size="12">tunnel TO-HQ</text>
<line x1="220" y1="48" x2="270" y2="48" stroke="#64748b" stroke-width="2"/><line x1="440" y1="48" x2="490" y2="48" stroke="#64748b" stroke-width="2"/>
<text x="225" y="40" class="svg-accent" font-size="12">activate</text><text x="445" y="40" class="svg-accent" font-size="12">assign</text>
<text x="20" y="120" class="svg-ink" font-size="12">Blanks to fill: tunnel-name, remote-gw, psksecret</text>
<text x="20" y="145" class="svg-muted" font-size="12">Installed result: phase 1 TO-HQ and phase 2 TO-HQ-P2 on port1</text>
</svg><p class="cap">Never edit the read-only original; work on your own copy.</p></div>

<div class="eg"><p><b>Worked example.</b> Kaveri's Trichy branch must reach the hub at 203.0.113.1. Activate KR-Branch-IPsec, set tunnel-name TO-HQ, remote-gw 203.0.113.1 and the real key, and assign it to TRY-FGT. After install, TRY-FGT has the phase 1 interface TO-HQ on port1 and the phase 2 interface TO-HQ-P2. The simulator builds a tunnel with IKE version 2, proposal aes256-sha256 and DH group 14, the same on every branch.</p></div>

<h3>Configuration</h3>
<pre class="code"><span class="c">! on FMG-1 (activate is the simulator form of a GUI action)</span>
execute fmgui template activate Kaveri Branch_IPSec_Recommended KR-Branch-IPsec
config pm template
    edit "KR-Branch-IPsec"
        set tunnel-name "TO-HQ"
        set remote-gw 203.0.113.1
        set psksecret "Kaveri-IPsec-2026"
    next
end
config dvmdb device
    edit "TRY-FGT"
        set ipsec-template "KR-Branch-IPsec"
    next
end</pre>

<h3>What the output looks like</h3>
<pre class="out">TRY-FGT # show vpn ipsec phase1-interface
config vpn ipsec phase1-interface
    edit "TO-HQ"
        set interface "port1"
        set ike-version 2
        set net-device enable
        set proposal aes256-sha256
        set dhgrp 14
        <span class="hl">set remote-gw 203.0.113.1</span>
        set psksecret ENC 113b2c3f283377130a293f3977686a686c
    next
end</pre>
<p>The device stores the key encrypted. Be careful, though: the install preview on FortiManager prints the key in clear text, so do not paste a preview into a ticket without hiding that line.</p>

<h3>Why it matters</h3>
<p>A tunnel has many parameters, and both ends must agree on them. If every branch engineer builds the tunnel by hand, one of them will choose a different proposal and the tunnel will not come up. A recommended template gives all branches the same proven parameters and leaves only three blanks. In the real product, metadata variables let one IPsec template take a different value per device, for example a different tunnel name, but that needs template groups and variables that are theory only here.</p>

<div class="warn"><p><b>Common mistakes.</b> Trying to edit the recommended original; assigning the copy without changing the factory remote gateway or key; reusing a template name that exists; using a tunnel name longer than 15 characters; expecting the simulator to activate a BGP or hub template; assuming the tunnel is up because the install succeeded, when the hub still has to be configured to match.</p></div>

<div class="exam"><p><b>Exam traps.</b> Recommended templates and the default template are read-only: activate a copy. The simulator activates only Branch_IPSec_Recommended and shows it as kind ipsec with a source attribute. The IPsec template is assigned with ipsec-template. It installs after the system template and before the CLI template. Hub, BGP, SD-WAN and certificate templates are exam and real-product theory.</p></div>

<div class="scn"><h4>Tunnel installed, tunnel dead</h4><p>A new branch received its IPsec template and the install reported success. Hours later the branch could not reach the hub. The engineer reread the template and found the factory pre-shared key change-me-now and the sample gateway 203.0.113.1, which was not the hub of that region. A colleague had assigned the copy and left. Correcting the two values, previewing, and installing again replaced the tunnel with the right one.</p><p><b>Lesson:</b> a successful install proves that the device accepted the lines, not that the values were correct. Read the template before you install.</p></div>

<div class="iv"><p class="q">"You cannot edit a Fortinet-recommended template. How do you use it?"</p><p>You activate a copy under your own name, edit the copy, and assign that copy to devices. The copy keeps a source attribute pointing to the original. Add that the blanks to fill are the tunnel name, the remote gateway and the pre-shared key, and that BGP and hub templates exist in the real product but are not modelled in this simulator.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The default and recommended templates are read-only; activate a copy to use one.</li>
<li>The simulator activates Branch_IPSec_Recommended only; hub and BGP kinds are theory.</li>
<li>Fill tunnel-name, remote-gw and psksecret, then assign with ipsec-template.</li>
<li>Factory values (gateway 203.0.113.1, key change-me-now) must be replaced before install.</li>
<li>Install success means accepted lines, not correct values; preview shows the key in clear text.</li>
</ul></div>
`,hi:`
<p>Bank jab cheque book deta hai to cheques bank ke layout mein print hote hain aur aap printing nahi badal sakte. Aap sirf blanks bharte ho: date, naam, amount. Fortinet-recommended templates is cheque book jaise kaam karte hain. FortiManager ready-made templates ke saath aata hai jo Fortinet ki recommended practice par bane hain. Ye <b>read-only</b> hain. Aap unhe edit nahi karte; apne naam se ek copy <b>activate</b> karte ho, aur us copy ke blanks bharte ho.</p>

<h3>Recommended list</h3>
<p>Har ADOM Fortinet-managed <b>default</b> system template aur paanch recommended templates list karta hai: HUB_IPSec_Recommended, Branch_IPSec_Recommended, IPSec_Fortinet_Recommended, HUB_BGP_Recommended aur BRANCH_BGP_Recommended. Real product sabko activate kar sakta hai. Simulator sirf <b>Branch_IPSec_Recommended</b> activate karne deta hai. Baaki, khaaskar BGP kinds, yahan theory hain: hub-side IPsec template kai branches ke liye tunnel ka hub end banata hai, aur BGP templates tunnels ke upar routing configure karte hain. Inmein se kisi ko activate karne ki koshish karo to simulator kehta hai ki sirf Branch_IPSec_Recommended model hai.</p>
<pre class="out">FMG-1 # execute fmgui template list Kaveri
Provisioning templates in ADOM Kaveri:
NAME                            TYPE            SOURCE
default                         system          Fortinet-managed (read-only)
HUB_IPSec_Recommended           ipsec           Fortinet-recommended (read-only, activate to use)
<span class="hl">Branch_IPSec_Recommended</span>        ipsec           Fortinet-recommended (read-only, activate to use)
IPSec_Fortinet_Recommended      ipsec           Fortinet-recommended (read-only, activate to use)
HUB_BGP_Recommended             bgp             Fortinet-recommended (read-only, activate to use)
BRANCH_BGP_Recommended          bgp             Fortinet-recommended (read-only, activate to use)</pre>

<h3>Step by step: branch tunnel</h3>
<ol>
<li>Copy <b>activate</b> karo: <code>execute fmgui template activate Kaveri Branch_IPSec_Recommended KR-Branch-IPsec</code>. Naya naam pehle se exist nahi karna chahiye. Copy ka kind ipsec hota hai aur source attribute yaad rakhta hai ki wo kahan se aayi.</li>
<li><code>config pm template</code> mein <b>blanks bharo</b>: <code>tunnel-name</code> (phase 1 interface ka naam, 15 characters tak), <code>remote-gw</code> (hub ka public address) aur <code>psksecret</code> (pre-shared key).</li>
<li>Device entry mein <code>set ipsec-template</code> se <b>assign</b> karo.</li>
<li>Har template ki tarah <b>preview, install, verify</b> karo.</li>
</ol>
<p>Copy factory values ke saath shuru hoti hai: remote gateway 203.0.113.1 aur key "change-me-now". Khatarnak key hai. Jis template mein ye abhi bhi hai wo aisa tunnel install karega jo up nahi ho sakta, aur koi warning nahi aati. Install se pehle hamesha template check karo.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Read-only template ki copy activate karo">
<rect x="20" y="20" width="200" height="56" rx="8" fill="#e2e8f0"/><text x="120" y="44" text-anchor="middle" class="svg-ink" font-size="13">Branch_IPSec_Recommended</text><text x="120" y="63" text-anchor="middle" class="svg-muted" font-size="12">read-only</text>
<rect x="270" y="20" width="170" height="56" rx="8" fill="#fde68a"/><text x="355" y="44" text-anchor="middle" class="svg-ink" font-size="13">KR-Branch-IPsec</text><text x="355" y="63" text-anchor="middle" class="svg-muted" font-size="12">editable copy</text>
<rect x="490" y="20" width="130" height="56" rx="8" fill="#bae6fd"/><text x="555" y="44" text-anchor="middle" class="svg-ink" font-size="13">TRY-FGT</text><text x="555" y="63" text-anchor="middle" class="svg-muted" font-size="12">tunnel TO-HQ</text>
<line x1="220" y1="48" x2="270" y2="48" stroke="#64748b" stroke-width="2"/><line x1="440" y1="48" x2="490" y2="48" stroke="#64748b" stroke-width="2"/>
<text x="225" y="40" class="svg-accent" font-size="12">activate</text><text x="445" y="40" class="svg-accent" font-size="12">assign</text>
<text x="20" y="120" class="svg-ink" font-size="12">Bharne wale blanks: tunnel-name, remote-gw, psksecret</text>
<text x="20" y="145" class="svg-muted" font-size="12">Installed result: port1 par phase 1 TO-HQ aur phase 2 TO-HQ-P2</text>
</svg><p class="cap">Read-only original kabhi edit mat karo; apni copy par kaam karo.</p></div>

<div class="eg"><p><b>Worked example.</b> Kaveri ki Trichy branch ko hub 203.0.113.1 tak pahunchna hai. KR-Branch-IPsec activate karo, tunnel-name TO-HQ, remote-gw 203.0.113.1 aur asli key set karo, aur TRY-FGT ko assign karo. Install ke baad TRY-FGT par port1 par phase 1 interface TO-HQ aur phase 2 interface TO-HQ-P2 hote hain. Simulator IKE version 2, proposal aes256-sha256 aur DH group 14 wala tunnel banata hai, har branch par same.</p></div>

<h3>Configuration</h3>
<pre class="code"><span class="c">! on FMG-1 (activate is the simulator form of a GUI action)</span>
execute fmgui template activate Kaveri Branch_IPSec_Recommended KR-Branch-IPsec
config pm template
    edit "KR-Branch-IPsec"
        set tunnel-name "TO-HQ"
        set remote-gw 203.0.113.1
        set psksecret "Kaveri-IPsec-2026"
    next
end
config dvmdb device
    edit "TRY-FGT"
        set ipsec-template "KR-Branch-IPsec"
    next
end</pre>

<h3>Output kaisa dikhta hai</h3>
<pre class="out">TRY-FGT # show vpn ipsec phase1-interface
config vpn ipsec phase1-interface
    edit "TO-HQ"
        set interface "port1"
        set ike-version 2
        set net-device enable
        set proposal aes256-sha256
        set dhgrp 14
        <span class="hl">set remote-gw 203.0.113.1</span>
        set psksecret ENC 113b2c3f283377130a293f3977686a686c
    next
end</pre>
<p>Device key ko encrypted store karta hai. Lekin dhyan rakho: FortiManager ka install preview key clear text mein print karta hai, isliye preview ko ticket mein paste mat karo jab tak wo line chhupa na do.</p>

<h3>Ye kyun matter karta hai</h3>
<p>Tunnel ke kai parameters hote hain aur dono ends ko unpar agree karna padta hai. Har branch engineer haath se tunnel banaye to koi ek alag proposal chunega aur tunnel up nahi aayega. Recommended template sab branches ko wahi proven parameters deta hai aur sirf teen blanks chhodta hai. Real product mein metadata variables ek IPsec template ko per-device alag value lene dete hain, jaise alag tunnel name, lekin uske liye template groups aur variables chahiye jo yahan sirf theory hain.</p>

<div class="warn"><p><b>Common mistakes.</b> Recommended original ko edit karne ki koshish; copy ko factory remote gateway ya key badle bina assign karna; pehle se exist karne wala template name reuse karna; 15 characters se lamba tunnel name; simulator se BGP ya hub template activate karwane ki ummeed; install succeed hone par tunnel up maan lena, jabki hub ko bhi match karne ke liye configure karna hai.</p></div>

<div class="exam"><p><b>Exam traps.</b> Recommended templates aur default template read-only hain: copy activate karo. Simulator sirf Branch_IPSec_Recommended activate karta hai aur use kind ipsec aur source attribute ke saath dikhata hai. IPsec template ipsec-template se assign hota hai. Ye system template ke baad aur CLI template se pehle install hota hai. Hub, BGP, SD-WAN aur certificate templates exam aur real-product theory hain.</p></div>

<div class="scn"><h4>Tunnel install hua, tunnel dead</h4><p>Nayi branch ko uska IPsec template mila aur install ne success report kiya. Kuch ghante baad branch hub tak nahi pahunch paayi. Engineer ne template dubara padha to factory pre-shared key change-me-now aur sample gateway 203.0.113.1 mila, jo us region ka hub nahi tha. Ek colleague copy assign karke ghar chala gaya tha. Do values sahi karke, preview karke aur dubara install karke tunnel sahi tunnel se replace ho gaya.</p><p><b>Lesson:</b> successful install sirf ye sabit karta hai ki device ne lines accept ki, ye nahi ki values sahi thi. Install se pehle template padho.</p></div>

<div class="iv"><p class="q">"Fortinet-recommended template edit nahi kar sakte. Use kaise karoge?"</p><p>Apne naam se copy activate karte ho, copy edit karte ho, aur wahi copy devices ko assign karte ho. Copy ka source attribute original ko point karta hai. Ye jodo ki bharne wale blanks tunnel name, remote gateway aur pre-shared key hain, aur BGP aur hub templates real product mein hain par is simulator mein model nahi hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Default aur recommended templates read-only hain; use karne ke liye copy activate karo.</li>
<li>Simulator sirf Branch_IPSec_Recommended activate karta hai; hub aur BGP kinds theory hain.</li>
<li>tunnel-name, remote-gw aur psksecret bharo, phir ipsec-template se assign karo.</li>
<li>Factory values (gateway 203.0.113.1, key change-me-now) install se pehle badlo.</li>
<li>Install success matlab lines accept hui, values sahi nahi; preview key clear text mein dikhata hai.</li>
</ul></div>
`}};export{e as default};