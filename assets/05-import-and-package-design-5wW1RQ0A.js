var e={id:`import-and-package-design`,h:{en:`Import-policy and package design: per site or shared, naming`,hi:`Import-policy aur package design: per site ya shared, naming`},body:{en:`
<p>When a new manager takes over a shop, the first job is not to throw out the old shelves. The manager walks through, writes down what is on every shelf, and only then reorganises. <b>Import-policy</b> is that walk-through for a FortiGate that already has rules: FortiManager reads the firewall policies and address objects of the device and builds a policy package from them. After that, the package is the master copy and the first install no longer wipes anything out.</p>

<h3>Why import comes before install</h3>
<p>From chapter 4 you know that an install replaces the policy table of the device. A newly authorized FortiGate has working rules, but FortiManager has an empty package for it. Installing an empty package would delete every rule. Importing first turns the existing rules into the package. The order is therefore always: <b>authorize, retrieve, import, review, then install</b>.</p>

<h3>What import-policy does in the simulator</h3>
<p>Import is a GUI wizard in the real product; the simulator offers <code>execute fmgui import-policy &lt;adom&gt; &lt;device&gt; &lt;package&gt;</code>, and we say so every time. It does three things.</p>
<ol>
<li>It creates ADOM address objects from the device's address objects (built-in ones are skipped).</li>
<li>It creates a new policy package in the ADOM, with the device as its installation target.</li>
<li>It copies the device policies into the package. The device list then shows <code>pkg:[imported]</code> followed by the package name.</li>
</ol>
<pre class="out">FMG-1 # show pm pkg
config pm pkg
    edit "HQ-Imported"
        set adom "Kaveri"
        <span class="hl">set install-target "HQ-FGT"</span>
        config policy
            edit 1
                set name "LAN-TO-WAN"
                <span class="hl">set srcintf "port2"</span>
                <span class="hl">set dstintf "port1"</span>
                set action accept
                set nat enable
            next
        end
    next
end</pre>
<p><b>Honest limit.</b> Look at srcintf and dstintf: the imported policy keeps the plain names port2 and port1. The real FortiManager normally offers to create normalized interfaces during import; the simulator does not (it also keeps only the first value of multi-value fields). Only the device where the policy came from can use this package until you replace the interface names with normalized ones and add mappings.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Import turns device policies into a package">
<rect x="20" y="40" width="170" height="100" rx="8" fill="#bae6fd"/><text x="105" y="68" text-anchor="middle" class="svg-ink" font-size="13">HQ-FGT</text><text x="105" y="90" text-anchor="middle" class="svg-muted" font-size="12">policy 1 LAN-TO-WAN</text><text x="105" y="108" text-anchor="middle" class="svg-muted" font-size="12">live rules</text>
<rect x="450" y="40" width="170" height="100" rx="8" fill="#ddd6fe"/><text x="535" y="68" text-anchor="middle" class="svg-ink" font-size="13">ADOM Kaveri</text><text x="535" y="90" text-anchor="middle" class="svg-muted" font-size="12">package HQ-Imported</text><text x="535" y="108" text-anchor="middle" class="svg-muted" font-size="12">+ address objects</text>
<line x1="190" y1="90" x2="450" y2="90" stroke="#64748b" stroke-width="2"/><polygon points="450,90 438,84 438,96" fill="#64748b"/>
<text x="250" y="80" class="svg-accent" font-size="13">import-policy</text>
</svg><p class="cap">Import copies the live rules into the ADOM. Install then sends the same rules back.</p></div>

<h3>Package design: per site or shared?</h3>
<p>Once you can build packages, you must decide how many. There are two simple designs.</p>
<table class="cmp"><tr><th>Design</th><th>Good when</th><th>Cost</th></tr>
<tr><td>One shared package for many sites</td><td>Sites are alike (branches with the same needs)</td><td>A change reaches all targets; a site-specific rule does not fit</td></tr>
<tr><td>One package per site</td><td>Sites differ a lot (head office with servers, a DMZ, VPN)</td><td>More packages to keep consistent</td></tr></table>
<p>Many companies mix: a shared package for all branches (such as Branch-PP) and a separate package for head office (such as HQ-Imported). Common rules that every site needs live in the shared package, and a site that needs extra rules gets its own package instead of a hidden local policy. A device has one policy package, because an install replaces the whole table.</p>

<h3>Naming</h3>
<p>Names appear in install commands, device lists and audits, so keep them predictable. Use a pattern such as <code>&lt;scope&gt;-PP</code> for packages (Branch-PP, All-Sites, HQ-PP), upper-case short object names (SRV-WEB, LAN, WAN) and policy names that say what they do (LAN-TO-SRV). Avoid spaces and names such as "new" or "test2". In the simulator names are global, so the same name cannot be reused in another ADOM.</p>

<div class="eg"><p><b>Worked example.</b> Kaveri has one head office and two branches. Head office is imported as HQ-Imported (it has servers and rules that the branches do not need). Madurai and Trichy get Branch-PP, a shared package with normalized interfaces LAN and WAN. When Salem opens, you add its mapping rows and its name to install-target of Branch-PP, then preview and install.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Installing before importing a device that already has rules. (2) Importing and believing the package is portable: the imported interface names are plain port names in the simulator. (3) Making one giant package with exceptions for every site. (4) Leaving a necessary local rule on the FortiGate "just for now"; the next install removes it (module fmg-revisions).</p></div>

<div class="exam"><p><b>Exam traps.</b> Import-policy reads from the device into FortiManager; install writes from FortiManager to the device. The package created by import gets the device as installation target. After import the device list shows <code>pkg:[imported]</code>, not installed. A device uses one policy package.</p></div>

<div class="scn"><h4>The head office that kept its history</h4><p>When Kaveri's Chennai FortiGate was authorized, it held 40 policies built over years. An engineer imported them into HQ-Imported, reviewed the package, removed duplicates in FortiManager and previewed an install. The preview showed the same policies back with only the cleaned rules changed. Only then did the engineer install. Nothing was lost, and the cleanup was recorded in the revision history.</p><p><b>Lesson:</b> import, review, preview, install. Never install first.</p></div>

<div class="iv"><p class="q">"You have just added an existing FortiGate to FortiManager. How do you start managing its policy?"</p><p>Authorize it so the configuration is retrieved, then import its policies and objects into a package, review the package, preview an install and check that no unexpected delete or change lines appear, then install. Mention that installing an empty package would replace the live rules.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Import-policy turns the live rules and addresses of a device into an ADOM package.</li>
<li>Always import before the first install; otherwise an empty package replaces live rules.</li>
<li>In the simulator the imported package keeps plain interface names; normalized interfaces are added by you.</li>
<li>Design: shared packages for similar sites, separate packages for different ones; one package per device.</li>
<li>Use predictable names (Branch-PP, SRV-WEB, LAN-TO-SRV).</li>
</ul></div>
`,hi:`
<p>Naya manager shop sambhalta hai to pehla kaam purani shelves phenkna nahi hota. Wo ghoomkar likhta hai har shelf par kya hai, aur tab reorganise karta hai. <b>Import-policy</b> unn FortiGates ke liye wahi walk-through hai jinke paas pehle se rules hain: FortiManager device ki firewall policies aur address objects padhta hai aur unse policy package banata hai. Uske baad package master copy hota hai aur pehla install kuch mita nahi deta.</p>

<h3>Install se pehle import kyun</h3>
<p>Chapter 4 se aap jaante ho ki install device ki policy table replace karta hai. Naye authorized FortiGate ke paas chalte hue rules hain, par FortiManager mein uska package khaali hai. Khaali package install karna har rule delete kar deta. Pehle import karne se maujooda rules package ban jate hain. Isliye order hamesha: <b>authorize, retrieve, import, review, phir install</b>.</p>

<h3>Simulator mein import-policy kya karta hai</h3>
<p>Real product mein import GUI wizard hai; simulator <code>execute fmgui import-policy &lt;adom&gt; &lt;device&gt; &lt;package&gt;</code> deta hai, aur hum har baar ye batate hain. Ye teen kaam karta hai.</p>
<ol>
<li>Device ke address objects se ADOM address objects banata hai (built-in skip hote hain).</li>
<li>ADOM mein naya policy package banata hai, device uska installation target hota hai.</li>
<li>Device policies ko package mein copy karta hai. Device list tab <code>pkg:[imported]</code> aur package ka naam dikhati hai.</li>
</ol>
<pre class="out">FMG-1 # show pm pkg
config pm pkg
    edit "HQ-Imported"
        set adom "Kaveri"
        <span class="hl">set install-target "HQ-FGT"</span>
        config policy
            edit 1
                set name "LAN-TO-WAN"
                <span class="hl">set srcintf "port2"</span>
                <span class="hl">set dstintf "port1"</span>
                set action accept
                set nat enable
            next
        end
    next
end</pre>
<p><b>Honest limit.</b> srcintf aur dstintf dekho: imported policy plain names port2 aur port1 rakhti hai. Real FortiManager import ke dauran aam taur par normalized interfaces banane ka option deta hai; simulator nahi deta (wo multi-value fields ki sirf pehli value bhi rakhta hai). Jab tak aap interface names ko normalized names se replace karke mappings nahi jodte, ye package sirf usi device par chal sakta hai jahan se policy aayi.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Import device policies ko package banata hai">
<rect x="20" y="40" width="170" height="100" rx="8" fill="#bae6fd"/><text x="105" y="68" text-anchor="middle" class="svg-ink" font-size="13">HQ-FGT</text><text x="105" y="90" text-anchor="middle" class="svg-muted" font-size="12">policy 1 LAN-TO-WAN</text><text x="105" y="108" text-anchor="middle" class="svg-muted" font-size="12">live rules</text>
<rect x="450" y="40" width="170" height="100" rx="8" fill="#ddd6fe"/><text x="535" y="68" text-anchor="middle" class="svg-ink" font-size="13">ADOM Kaveri</text><text x="535" y="90" text-anchor="middle" class="svg-muted" font-size="12">package HQ-Imported</text><text x="535" y="108" text-anchor="middle" class="svg-muted" font-size="12">+ address objects</text>
<line x1="190" y1="90" x2="450" y2="90" stroke="#64748b" stroke-width="2"/><polygon points="450,90 438,84 438,96" fill="#64748b"/>
<text x="250" y="80" class="svg-accent" font-size="13">import-policy</text>
</svg><p class="cap">Import live rules ko ADOM mein copy karta hai. Install wahi rules wapas bhejta hai.</p></div>

<h3>Package design: per site ya shared?</h3>
<p>Package banana aa jaye to decide karna padta hai kitne banane hain. Do simple designs hain.</p>
<table class="cmp"><tr><th>Design</th><th>Kab accha</th><th>Cost</th></tr>
<tr><td>Kai sites ke liye ek shared package</td><td>Sites ek jaisi hain (same needs wali branches)</td><td>Change sab targets tak jata hai; site-specific rule fit nahi hota</td></tr>
<tr><td>Har site ka apna package</td><td>Sites bahut alag hain (servers, DMZ, VPN wala head office)</td><td>Zyada packages consistent rakhne padte hain</td></tr></table>
<p>Kai companies mix karti hain: saari branches ke liye shared package (jaise Branch-PP) aur head office ke liye alag (jaise HQ-Imported). Jo common rules har site ko chahiye wo shared package mein rehte hain, aur extra rules chahiye to site ko chhupi hui local policy ke bajay apna package milta hai. Ek device ka ek hi policy package hota hai, kyunki install poori table replace karta hai.</p>

<h3>Naming</h3>
<p>Names install commands, device lists aur audits mein dikhte hain, isliye predictable rakho. Packages ke liye <code>&lt;scope&gt;-PP</code> jaisa pattern (Branch-PP, All-Sites, HQ-PP), upper-case chhote object names (SRV-WEB, LAN, WAN) aur policy names jo batayein kya karti hain (LAN-TO-SRV). Spaces aur "new" ya "test2" jaise naam avoid karo. Simulator mein names global hain, isliye ek naam doosre ADOM mein dobara use nahi ho sakta.</p>

<div class="eg"><p><b>Worked example.</b> Kaveri ka ek head office aur do branches hain. Head office HQ-Imported ke naam se import hota hai (usme servers aur aise rules hain jo branches ko nahi chahiye). Madurai aur Trichy ko Branch-PP milta hai, shared package normalized interfaces LAN aur WAN ke saath. Salem khulta hai to aap uski mapping rows aur Branch-PP ke install-target mein uska naam jodte ho, phir preview aur install.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Jis device par rules hain use import kiye bina install karna. (2) Import karke maan lena ki package portable hai: simulator mein imported interface names plain port names hain. (3) Har site ke exceptions wala ek bada package banana. (4) Zaroori local rule "bas abhi ke liye" FortiGate par chhod dena; agla install use hata deta hai (module fmg-revisions).</p></div>

<div class="exam"><p><b>Exam traps.</b> Import-policy device se FortiManager mein padhta hai; install FortiManager se device par likhta hai. Import se bane package ka installation target wahi device hota hai. Import ke baad device list <code>pkg:[imported]</code> dikhati hai, installed nahi. Device ka ek hi policy package hota hai.</p></div>

<div class="scn"><h4>Head office ne apni history bachayi</h4><p>Kaveri ka Chennai FortiGate authorize hua to usme saalon mein bani 40 policies thi. Engineer ne unhe HQ-Imported mein import kiya, package review kiya, FortiManager mein duplicates hataye aur install ka preview liya. Preview ne wahi policies wapas dikhayi, sirf cleaned rules badle hue. Tabhi engineer ne install kiya. Kuch khoya nahi, aur cleanup revision history mein record hua.</p><p><b>Lesson:</b> import, review, preview, install. Kabhi pehle install nahi.</p></div>

<div class="iv"><p class="q">"Aapne abhi ek existing FortiGate FortiManager mein add kiya hai. Uski policy manage karna kaise shuru karoge?"</p><p>Pehle authorize karo taaki configuration retrieve ho, phir uski policies aur objects ek package mein import karo, package review karo, install ka preview lo aur dekho ki koi unexpected delete ya change lines to nahi, phir install. Ye bhi bolo ki khaali package install karne se live rules replace ho jate.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Import-policy device ke live rules aur addresses ko ADOM package mein badalta hai.</li>
<li>Pehle install se pehle hamesha import karo; warna khaali package live rules replace kar deta hai.</li>
<li>Simulator mein imported package plain interface names rakhta hai; normalized interfaces aap jodte ho.</li>
<li>Design: similar sites ke liye shared packages, alag sites ke liye alag; ek device, ek package.</li>
<li>Predictable names use karo (Branch-PP, SRV-WEB, LAN-TO-SRV).</li>
</ul></div>
`}};export{e as default};