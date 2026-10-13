var e={id:`policy-packages`,h:{en:`Policy packages: policies, installation targets, one package for many FortiGates`,hi:`Policy packages: policies, installation targets, kai FortiGates ke liye ek package`},body:{en:`
<p>A restaurant chain keeps one recipe book. Each kitchen gets a copy of the book, but only for the dishes that kitchen serves. A <b>policy package</b> is that recipe book for firewall rules: a named collection of firewall policies, kept in the ADOM, that you can send to one or many FortiGates.</p>

<h3>What a policy package contains</h3>
<p>A policy package holds three things that matter for this course.</p>
<ol>
<li><b>Policies</b>: the firewall rules, each with an id, a name, source and destination interface, source and destination address, service, action and NAT setting.</li>
<li><b>Installation targets</b>: the list of devices that the package may be installed on. It is an attribute of the package called <code>install-target</code>.</li>
<li>The package name, which you use in install commands and see in the device list.</li>
</ol>
<p>A package does not contain device-specific things such as the management IP or DNS server. Those belong to provisioning templates (module fmg-templates). The split is simple: <b>the package says what is allowed, the device settings say how this box is set up</b>.</p>

<h3>Policies refer to objects</h3>
<p>The policies inside the package use the objects from chapters 1 and 2: addresses such as SRV-WEB, and normalized interfaces such as LAN and WAN. This is why a single package can serve three sites. The policy says "LAN to WAN, destination SRV-WEB, accept, NAT". The mapping decides per device what LAN and WAN really are.</p>

<h3>Installation targets</h3>
<p>The <b>installation target</b> list is a safety fence. FortiManager installs a package only to devices named in it. If you try another device, the install is refused. This protects a branch from receiving a package that was written for head office by accident.</p>
<p>Note the difference between two kinds of "target". The ADOM contains all managed devices. The package lists only those that may receive this package. A device can be in the ADOM and in no package at all, and then the device list shows <code>pkg:[unknown]null</code> or <code>never-installed</code> for it.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Policy package with policy and installation targets">
<rect x="20" y="20" width="300" height="170" rx="10" fill="#ddd6fe"/><text x="170" y="46" text-anchor="middle" class="svg-ink" font-size="14">Package Branch-PP</text>
<rect x="40" y="62" width="260" height="46" rx="6" fill="#fff"/><text x="170" y="82" text-anchor="middle" class="svg-ink" font-size="12">policy 1 LAN-TO-SRV</text><text x="170" y="98" text-anchor="middle" class="svg-muted" font-size="12">LAN to WAN, dst SRV-WEB, accept, NAT</text>
<rect x="40" y="120" width="260" height="56" rx="6" fill="#fde68a"/><text x="170" y="142" text-anchor="middle" class="svg-ink" font-size="12">install-target</text><text x="170" y="162" text-anchor="middle" class="svg-muted" font-size="12">MDU-FGT, TRY-FGT</text>
<rect x="450" y="40" width="160" height="50" rx="8" fill="#bae6fd"/><text x="530" y="70" text-anchor="middle" class="svg-ink" font-size="13">MDU-FGT</text>
<rect x="450" y="120" width="160" height="50" rx="8" fill="#bae6fd"/><text x="530" y="150" text-anchor="middle" class="svg-ink" font-size="13">TRY-FGT</text>
<line x1="320" y1="148" x2="450" y2="65" stroke="#64748b" stroke-width="2"/><line x1="320" y1="148" x2="450" y2="145" stroke="#64748b" stroke-width="2"/>
<text x="352" y="118" class="svg-accent" font-size="12">may install</text>
</svg><p class="cap">One package, two installation targets. A device not in the list cannot receive it.</p></div>

<h3>Why it matters</h3>
<p>With one package, a change to a rule is made once, previewed once and installed to every target. Without it, the same rule is edited on each FortiGate and sites drift apart. The package is also the unit you review in a change request: "add policy 2 to Branch-PP" is a clear sentence.</p>

<div class="eg"><p><b>Worked example.</b> Kaveri creates the package Branch-PP in the ADOM Kaveri with the installation targets MDU-FGT and TRY-FGT and one policy: id 1, name LAN-TO-SRV, from LAN to WAN, destination SRV-WEB, service ALL, action accept, NAT enabled. Branch staff then reach the intranet server SRV-WEB through their own FortiGate, which translates their 10.20.0.x or 10.30.0.x address to the FortiGate's address.</p></div>

<h3>The package on FMG-1</h3>
<pre class="code"><span class="c">! on FMG-1</span>
config pm pkg
    edit "Branch-PP"
        set adom "Kaveri"
        set install-target "MDU-FGT" "TRY-FGT"
        config policy
            edit 1
                set name "LAN-TO-SRV"
                set srcintf "LAN"
                set dstintf "WAN"
                set srcaddr "all"
                set dstaddr "SRV-WEB"
                set action accept
                set service "ALL"
                set nat enable
            next
        end
    next
end</pre>
<pre class="out">FMG-1 # show pm pkg
config pm pkg
    edit "Branch-PP"
        set adom "Kaveri"
        <span class="hl">set install-target "MDU-FGT" "TRY-FGT"</span>
        config policy
            edit 1
                set name "LAN-TO-SRV"
                set srcintf "LAN"
                set dstintf "WAN"
                set dstaddr "SRV-WEB"
                set action accept
                set nat enable
            next
        end
    next
end</pre>
<p>The show output prints only values that differ from the default, so srcaddr all and service ALL do not appear. This is the same habit as on a FortiGate.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Creating the package but forgetting an installation target for a new site. The install says the device is not an installation target. (2) Writing <code>set install-target</code> with only the new device: it replaces the list, so repeat all names. (3) Putting a package name in the install command that does not exist in that ADOM. (4) Believing that the package carries device settings such as DNS.</p></div>

<div class="exam"><p><b>Exam traps.</b> The installation targets belong to the package, not to the ADOM. An empty or incomplete target list is a classic cause of a refused install. A package belongs to exactly one ADOM. The device list field <code>pkg:[installed]Branch-PP</code> shows the package that was last installed on that device.</p></div>

<div class="scn"><h4>Package for headquarters sent to a branch</h4><p>A new administrator tried to install the head-office package on a branch to "test it". Because the branch was not in the package's installation targets, FortiManager refused with a clear message and the branch kept running. The administrator then created a separate branch package instead. Had the fence not existed, the branch would have lost its own rules.</p><p><b>Lesson:</b> the installation target list is a protection, so keep it accurate and treat a refusal as a question, not an obstacle.</p></div>

<div class="iv"><p class="q">"What is an installation target in a policy package?"</p><p>It is the list of devices on which the package may be installed, stored as the package attribute install-target. Installing to a device outside the list is refused. When a new site should use the package, add it to the list, making sure the existing names stay in the list too.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A policy package is a named set of firewall policies stored in one ADOM.</li>
<li>It lists its installation targets; other devices are refused.</li>
<li>Policies use ADOM objects (addresses) and normalized interfaces, so one package fits many devices.</li>
<li>The package says what is allowed; device settings and templates say how a box is configured.</li>
<li>In the simulator: <code>config pm pkg</code> with <code>install-target</code> and <code>config policy</code>.</li>
</ul></div>
`,hi:`
<p>Ek restaurant chain ek recipe book rakhti hai. Har kitchen ko book ki copy milti hai, par sirf wahi dishes jo wo kitchen serve karti hai. <b>Policy package</b> firewall rules ki wahi recipe book hai: firewall policies ka named collection, ADOM mein stored, jo aap ek ya kai FortiGates ko bhej sakte ho.</p>

<h3>Policy package mein kya hota hai</h3>
<p>Is course ke liye package mein teen cheezein matter karti hain.</p>
<ol>
<li><b>Policies</b>: firewall rules, har ek ka id, name, source aur destination interface, source aur destination address, service, action aur NAT setting.</li>
<li><b>Installation targets</b>: un devices ki list jin par package install ho sakta hai. Ye package ka attribute hai, <code>install-target</code>.</li>
<li>Package ka naam, jo install commands mein use hota hai aur device list mein dikhta hai.</li>
</ol>
<p>Package mein device-specific cheezein jaise management IP ya DNS server nahi hoti. Wo provisioning templates ka kaam hai (module fmg-templates). Split saaf hai: <b>package batata hai kya allowed hai, device settings batati hain ye box kaise set up hai</b>.</p>

<h3>Policies objects ko refer karti hain</h3>
<p>Package ki policies chapters 1 aur 2 ke objects use karti hain: SRV-WEB jaise addresses, aur LAN aur WAN jaise normalized interfaces. Isiliye ek package teen sites serve kar sakta hai. Policy kehti hai "LAN se WAN, destination SRV-WEB, accept, NAT". Mapping per device decide karti hai ki LAN aur WAN asal mein kya hain.</p>

<h3>Installation targets</h3>
<p><b>Installation target</b> list ek safety fence hai. FortiManager package sirf unhi devices par install karta hai jinke naam usme hain. Kisi aur device par try karo to install refuse hota hai. Isse branch galti se head office ke liye likhe package ko receive karne se bachti hai.</p>
<p>Do tarah ke "target" mein fark samjho. ADOM mein saare managed devices hote hain. Package sirf unhe list karta hai jo ye package receive kar sakte hain. Device ADOM mein ho aur kisi package mein na ho sakta hai, tab device list uske liye <code>pkg:[unknown]null</code> ya <code>never-installed</code> dikhati hai.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Policy package, policy aur installation targets ke saath">
<rect x="20" y="20" width="300" height="170" rx="10" fill="#ddd6fe"/><text x="170" y="46" text-anchor="middle" class="svg-ink" font-size="14">Package Branch-PP</text>
<rect x="40" y="62" width="260" height="46" rx="6" fill="#fff"/><text x="170" y="82" text-anchor="middle" class="svg-ink" font-size="12">policy 1 LAN-TO-SRV</text><text x="170" y="98" text-anchor="middle" class="svg-muted" font-size="12">LAN se WAN, dst SRV-WEB, accept, NAT</text>
<rect x="40" y="120" width="260" height="56" rx="6" fill="#fde68a"/><text x="170" y="142" text-anchor="middle" class="svg-ink" font-size="12">install-target</text><text x="170" y="162" text-anchor="middle" class="svg-muted" font-size="12">MDU-FGT, TRY-FGT</text>
<rect x="450" y="40" width="160" height="50" rx="8" fill="#bae6fd"/><text x="530" y="70" text-anchor="middle" class="svg-ink" font-size="13">MDU-FGT</text>
<rect x="450" y="120" width="160" height="50" rx="8" fill="#bae6fd"/><text x="530" y="150" text-anchor="middle" class="svg-ink" font-size="13">TRY-FGT</text>
<line x1="320" y1="148" x2="450" y2="65" stroke="#64748b" stroke-width="2"/><line x1="320" y1="148" x2="450" y2="145" stroke="#64748b" stroke-width="2"/>
<text x="352" y="118" class="svg-accent" font-size="12">install ho sakta hai</text>
</svg><p class="cap">Ek package, do installation targets. List mein na ho to device use receive nahi kar sakta.</p></div>

<h3>Ye kyun zaroori hai</h3>
<p>Ek package ke saath rule ka change ek baar hota hai, ek baar preview hota hai aur har target par install hota hai. Iske bina wahi rule har FortiGate par edit hota hai aur sites alag ho jati hain. Package change request ki unit bhi hai: "Branch-PP mein policy 2 jodo" ek saaf sentence hai.</p>

<div class="eg"><p><b>Worked example.</b> Kaveri ADOM Kaveri mein package Branch-PP banata hai, installation targets MDU-FGT aur TRY-FGT, aur ek policy: id 1, name LAN-TO-SRV, LAN se WAN, destination SRV-WEB, service ALL, action accept, NAT enabled. Branch staff apne FortiGate ke through intranet server SRV-WEB tak pahunchte hain, jo unka 10.20.0.x ya 10.30.0.x address FortiGate ke address mein translate karta hai.</p></div>

<h3>FMG-1 par package</h3>
<pre class="code"><span class="c">! on FMG-1</span>
config pm pkg
    edit "Branch-PP"
        set adom "Kaveri"
        set install-target "MDU-FGT" "TRY-FGT"
        config policy
            edit 1
                set name "LAN-TO-SRV"
                set srcintf "LAN"
                set dstintf "WAN"
                set srcaddr "all"
                set dstaddr "SRV-WEB"
                set action accept
                set service "ALL"
                set nat enable
            next
        end
    next
end</pre>
<pre class="out">FMG-1 # show pm pkg
config pm pkg
    edit "Branch-PP"
        set adom "Kaveri"
        <span class="hl">set install-target "MDU-FGT" "TRY-FGT"</span>
        config policy
            edit 1
                set name "LAN-TO-SRV"
                set srcintf "LAN"
                set dstintf "WAN"
                set dstaddr "SRV-WEB"
                set action accept
                set nat enable
            next
        end
    next
end</pre>
<p>Show output sirf wo values print karta hai jo default se alag hain, isliye srcaddr all aur service ALL nahi dikhte. FortiGate par bhi yahi aadat hai.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Package banana par naye site ka installation target bhool jana. Install kehta hai device installation target nahi hai. (2) <code>set install-target</code> mein sirf naya device likhna: ye list ko replace karta hai, isliye saare naam dobara likho. (3) Install command mein aisa package naam dena jo us ADOM mein hai hi nahi. (4) Sochna ki package DNS jaisi device settings carry karta hai.</p></div>

<div class="exam"><p><b>Exam traps.</b> Installation targets package ke hote hain, ADOM ke nahi. Khaali ya adhuri target list refused install ka classic cause hai. Package ek hi ADOM ka hota hai. Device list ka field <code>pkg:[installed]Branch-PP</code> us device par last install hua package dikhata hai.</p></div>

<div class="scn"><h4>Head office ka package branch ko bheja gaya</h4><p>Ek naye administrator ne "test" ke liye head-office package branch par install karna chaha. Branch package ke installation targets mein nahi thi, isliye FortiManager ne saaf message ke saath refuse kiya aur branch chalti rahi. Administrator ne phir alag branch package banaya. Fence na hoti to branch apne rules kho deti.</p><p><b>Lesson:</b> installation target list ek protection hai, use accurate rakho aur refusal ko rukawat nahi, sawal samjho.</p></div>

<div class="iv"><p class="q">"Policy package mein installation target kya hota hai?"</p><p>Ye un devices ki list hai jin par package install ho sakta hai, package attribute install-target mein stored. List ke bahar ke device par install refuse hota hai. Naya site package use kare to use list mein jodo, aur dhyan rakho ki purane naam bhi list mein rahein.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Policy package ek ADOM mein stored firewall policies ka named set hai.</li>
<li>Wo apne installation targets list karta hai; baaki devices refuse hote hain.</li>
<li>Policies ADOM objects (addresses) aur normalized interfaces use karti hain, isliye ek package kai devices par fit hota hai.</li>
<li>Package batata hai kya allowed hai; device settings aur templates batate hain box kaise configured hai.</li>
<li>Simulator mein: <code>config pm pkg</code>, <code>install-target</code> aur <code>config policy</code>.</li>
</ul></div>
`}};export{e as default};