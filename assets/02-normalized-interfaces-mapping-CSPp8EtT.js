var e={id:`normalized-interfaces-mapping`,h:{en:`Normalized interfaces and dynamic mapping`,hi:`Normalized interfaces aur dynamic mapping`},body:{en:`
<p>Imagine a head office that writes one instruction for all branches: "send visitors to the reception desk". In Chennai the reception is on the ground floor, in Madurai it is behind the lift, in Trichy it is next to the gate. The words "reception desk" are the same everywhere, but the physical place differs. A policy has the same problem: "traffic from the LAN to the WAN" is one idea, but the FortiGate port that carries the LAN may be port2 on one device and port5 on another. <b>Normalized interfaces</b> solve this.</p>

<h3>The problem: policies name interfaces</h3>
<p>A firewall policy always says from which interface to which interface (<code>srcintf</code> and <code>dstintf</code>). On a FortiGate these are real names such as port1 or port2. If a policy package names port2 directly, it only fits devices where the LAN really is port2. A device built differently needs a second package, and the idea "one package for many FortiGates" is lost.</p>

<h3>The solution: a normalized interface</h3>
<p>A <b>normalized interface</b> is a name that exists in the ADOM only, for example <code>LAN</code> and <code>WAN</code>. Policies in the package use these names. For every device you then record a <b>dynamic mapping</b>: a small table that says "for this device, LAN means this real interface". The word dynamic means that the answer depends on the device that is being installed to.</p>
<table class="cmp"><tr><th>Normalized name</th><th>HQ-FGT</th><th>MDU-FGT</th><th>TRY-FGT</th></tr>
<tr><td>LAN</td><td>port2</td><td>port2</td><td>port2</td></tr>
<tr><td>WAN</td><td>port1</td><td>port1</td><td>port1</td></tr></table>
<p>In the Kaveri lab all three devices happen to use the same real ports, but FortiManager does not guess: each device needs its own mapping row. At install time FortiManager reads the policy, finds LAN, looks up the row for the target device and writes the real interface name into the policy it sends.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Normalized interface LAN mapped per device">
<rect x="30" y="70" width="170" height="60" rx="8" fill="#ddd6fe"/><text x="115" y="96" text-anchor="middle" class="svg-ink" font-size="13">Policy uses LAN</text><text x="115" y="114" text-anchor="middle" class="svg-muted" font-size="12">normalized name</text>
<rect x="300" y="14" width="140" height="44" rx="8" fill="#fde68a"/><text x="370" y="41" text-anchor="middle" class="svg-ink" font-size="13">MDU-FGT: port2</text>
<rect x="300" y="78" width="140" height="44" rx="8" fill="#fde68a"/><text x="370" y="105" text-anchor="middle" class="svg-ink" font-size="13">TRY-FGT: port2</text>
<rect x="300" y="142" width="140" height="44" rx="8" fill="#fed7aa"/><text x="370" y="169" text-anchor="middle" class="svg-ink" font-size="13">NEW-FGT: ?</text>
<line x1="200" y1="100" x2="300" y2="36" stroke="#64748b" stroke-width="2"/><line x1="200" y1="100" x2="300" y2="100" stroke="#64748b" stroke-width="2"/><line x1="200" y1="100" x2="300" y2="164" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="470" y="169" class="svg-accent" font-size="12">no row: install fails</text>
</svg><p class="cap">One row per device. A device without a row cannot receive a policy that uses LAN.</p></div>

<h3>Why it matters</h3>
<p>Without normalization, a company with sites of different hardware needs one package per hardware type. With it, one package serves all, and the differences are kept in the small mapping tables. When a new branch is added you add one mapping row, not a new package.</p>

<div class="eg"><p><b>Worked example.</b> A policy has srcintf LAN and dstintf WAN. Madurai maps LAN to port2 and WAN to port1. The preview for MDU-FGT therefore contains <code>set srcintf "port2"</code> and <code>set dstintf "port1"</code>. If Madurai were rebuilt with a different port for the LAN, you would change one mapping row, and the package would stay the same.</p></div>

<h3>Configuration on FMG-1</h3>
<p>The simulator shows the table as <code>config pm interface</code> with a <code>dynamic-mapping</code> sub-table whose rows are device names.</p>
<pre class="code"><span class="c">! on FMG-1</span>
config pm interface
    edit "LAN"
        set adom "Kaveri"
        config dynamic-mapping
            edit "MDU-FGT"
                set intf "port2"
            next
        end
    next
end</pre>
<pre class="out">FMG-1 # show pm interface
config pm interface
    edit "LAN"
        set adom "Kaveri"
        config dynamic-mapping
            edit "MDU-FGT"
                <span class="hl">set intf "port2"</span>
            next
        end
    next
end</pre>
<p>The real product also has an option called default mapping: if an interface with the same name as the normalized interface exists on the device, FortiManager uses it without a row. The simulator models this too (attribute <code>default-mapping enable</code>), but explicit rows are the clearer habit.</p>

<h3>The missing-mapping symptom</h3>
<p>If a device has no row and no default mapping applies, the install stops. This is the real wording of the simulator:</p>
<pre class="out">FMG-1 # execute fmgui install-package Kaveri Branch-PP TRY-FGT
Install failed: <span class="hl">normalized interface 'LAN' has no mapping for device TRY-FGT</span>.</pre>
<p>Read it as: the name in quotes is the normalized interface, the device name tells you where to add the row. In the lab fm-map-ts (chapter 8) you will fix exactly this.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Mapping LAN but forgetting WAN: the policy uses both, so the install still fails, with the other name in the message. (2) Mapping the interface to a name the device does not have. (3) Creating a mapping row with a wrong device name; rows are matched by the device name. (4) Using a real port name (port2) in the package and then wondering why another device fails.</p></div>

<div class="exam"><p><b>Exam traps.</b> A normalized interface is an ADOM object; the mapping is per device. The message "has no mapping for device" is a mapping problem, not a connectivity problem. Do not confuse it with the "not an installation target" message (chapter 4).</p></div>

<div class="scn"><h4>The branch built with different hardware</h4><p>A retailer opened a new store with a smaller FortiGate whose LAN port was port3. The engineer copied the package and edited every policy to say port3, creating a second package to maintain. A colleague later replaced it with the normalized name LAN and one mapping row (LAN to port3). The old package was deleted and every policy change afterwards was made once.</p><p><b>Lesson:</b> put hardware differences into mapping rows, not into copies of packages.</p></div>

<div class="iv"><p class="q">"What is a normalized interface and what goes wrong without a mapping?"</p><p>It is an ADOM-level interface name used in policies; a dynamic mapping table gives the real interface per device. Without a row for the target device, the install is refused with a no-mapping message naming the interface and the device. The fix is to add the row (or enable default mapping when names match), then install again.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Policies need interfaces, but port names differ between devices.</li>
<li>A normalized interface (LAN, WAN) is defined once in the ADOM; a dynamic mapping row per device gives the real port.</li>
<li>In the simulator: <code>config pm interface</code> with <code>config dynamic-mapping</code> and <code>set intf</code>.</li>
<li>A missing row stops the install: normalized interface 'LAN' has no mapping for device TRY-FGT.</li>
<li>Hardware differences belong in mapping rows, not in extra packages.</li>
</ul></div>
`,hi:`
<p>Socho head office ek instruction sab branches ko likhta hai: "visitors ko reception desk par bhejo". Chennai mein reception ground floor par hai, Madurai mein lift ke peeche, Trichy mein gate ke paas. "Reception desk" shabd har jagah wahi hai, par physical jagah alag hai. Policy ki bhi yahi problem hai: "LAN se WAN ka traffic" ek hi idea hai, par LAN carry karne wala FortiGate port ek device par port2 aur doosre par port5 ho sakta hai. <b>Normalized interfaces</b> isse solve karte hain.</p>

<h3>Problem: policies interface ka naam leti hain</h3>
<p>Firewall policy hamesha batati hai kis interface se kis interface tak (<code>srcintf</code> aur <code>dstintf</code>). FortiGate par ye real names hote hain jaise port1 ya port2. Package seedha port2 likhe to wo sirf un devices par fit hota hai jahan LAN sach mein port2 hai. Alag tarah se bana device doosra package maangta hai, aur "kai FortiGates ke liye ek package" wala idea kho jata hai.</p>

<h3>Solution: normalized interface</h3>
<p><b>Normalized interface</b> ek aisa naam hai jo sirf ADOM mein hota hai, jaise <code>LAN</code> aur <code>WAN</code>. Package ki policies yahi names use karti hain. Phir har device ke liye ek <b>dynamic mapping</b> record karte ho: chhoti table jo kehti hai "is device ke liye LAN ka matlab ye real interface". Dynamic ka matlab: jawab us device par depend karta hai jis par install ho raha hai.</p>
<table class="cmp"><tr><th>Normalized naam</th><th>HQ-FGT</th><th>MDU-FGT</th><th>TRY-FGT</th></tr>
<tr><td>LAN</td><td>port2</td><td>port2</td><td>port2</td></tr>
<tr><td>WAN</td><td>port1</td><td>port1</td><td>port1</td></tr></table>
<p>Kaveri lab mein teeno devices ke real ports same hain, par FortiManager guess nahi karta: har device ko apni mapping row chahiye. Install ke time FortiManager policy padhta hai, LAN dhoondhta hai, target device ki row dekhta hai aur jo policy bhejta hai usme real interface ka naam likhta hai.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Normalized interface LAN har device ke liye mapped">
<rect x="30" y="70" width="170" height="60" rx="8" fill="#ddd6fe"/><text x="115" y="96" text-anchor="middle" class="svg-ink" font-size="13">Policy LAN use karti hai</text><text x="115" y="114" text-anchor="middle" class="svg-muted" font-size="12">normalized naam</text>
<rect x="300" y="14" width="140" height="44" rx="8" fill="#fde68a"/><text x="370" y="41" text-anchor="middle" class="svg-ink" font-size="13">MDU-FGT: port2</text>
<rect x="300" y="78" width="140" height="44" rx="8" fill="#fde68a"/><text x="370" y="105" text-anchor="middle" class="svg-ink" font-size="13">TRY-FGT: port2</text>
<rect x="300" y="142" width="140" height="44" rx="8" fill="#fed7aa"/><text x="370" y="169" text-anchor="middle" class="svg-ink" font-size="13">NEW-FGT: ?</text>
<line x1="200" y1="100" x2="300" y2="36" stroke="#64748b" stroke-width="2"/><line x1="200" y1="100" x2="300" y2="100" stroke="#64748b" stroke-width="2"/><line x1="200" y1="100" x2="300" y2="164" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="470" y="169" class="svg-accent" font-size="12">row nahi: install fail</text>
</svg><p class="cap">Har device ki ek row. Row ke bina device LAN use karne wali policy receive nahi kar sakta.</p></div>

<h3>Ye kyun zaroori hai</h3>
<p>Normalization ke bina alag hardware wali sites ke liye har hardware type ka ek package chahiye. Normalization ke saath ek package sab ko serve karta hai, aur differences chhoti mapping tables mein rehte hain. Naya branch add karte ho to ek mapping row jodte ho, naya package nahi.</p>

<div class="eg"><p><b>Worked example.</b> Policy mein srcintf LAN aur dstintf WAN hai. Madurai LAN ko port2 aur WAN ko port1 se map karta hai. Isliye MDU-FGT ke preview mein <code>set srcintf "port2"</code> aur <code>set dstintf "port1"</code> aata hai. Madurai ko dusre LAN port ke saath rebuild karo to aap ek mapping row badalte ho, package wahi rehta hai.</p></div>

<h3>FMG-1 par configuration</h3>
<p>Simulator table ko <code>config pm interface</code> ki tarah dikhata hai, jisme <code>dynamic-mapping</code> sub-table ki rows device names hain.</p>
<pre class="code"><span class="c">! on FMG-1</span>
config pm interface
    edit "LAN"
        set adom "Kaveri"
        config dynamic-mapping
            edit "MDU-FGT"
                set intf "port2"
            next
        end
    next
end</pre>
<pre class="out">FMG-1 # show pm interface
config pm interface
    edit "LAN"
        set adom "Kaveri"
        config dynamic-mapping
            edit "MDU-FGT"
                <span class="hl">set intf "port2"</span>
            next
        end
    next
end</pre>
<p>Real product mein default mapping naam ka option bhi hai: device par normalized interface ke naam wala interface ho to FortiManager bina row ke use use karta hai. Simulator ise bhi model karta hai (attribute <code>default-mapping enable</code>), par explicit rows saaf aadat hai.</p>

<h3>Missing-mapping ka symptom</h3>
<p>Device ki row na ho aur default mapping lagu na ho to install ruk jata hai. Ye simulator ka real wording hai:</p>
<pre class="out">FMG-1 # execute fmgui install-package Kaveri Branch-PP TRY-FGT
Install failed: <span class="hl">normalized interface 'LAN' has no mapping for device TRY-FGT</span>.</pre>
<p>Aise padho: quotes mein naam normalized interface hai, device ka naam batata hai ki row kahan jodni hai. Lab fm-map-ts (chapter 8) mein aap yahi fix karoge.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) LAN map kiya par WAN bhool gaye: policy dono use karti hai, isliye install phir bhi fail hota hai, message mein doosra naam aata hai. (2) Interface ko aise naam se map karna jo device par hai hi nahi. (3) Mapping row mein galat device name; rows device ke naam se match hoti hain. (4) Package mein real port name (port2) likhna aur phir sochna ki doosra device kyun fail hua.</p></div>

<div class="exam"><p><b>Exam traps.</b> Normalized interface ADOM object hai; mapping per device hoti hai. "has no mapping for device" message mapping problem hai, connectivity problem nahi. Ise "not an installation target" message se confuse mat karo (chapter 4).</p></div>

<div class="scn"><h4>Alag hardware wala branch</h4><p>Ek retailer ne naya store chhote FortiGate ke saath kholi jiska LAN port port3 tha. Engineer ne package copy karke har policy mein port3 likh diya, aur maintain karne ke liye doosra package ban gaya. Ek colleague ne baad mein use normalized naam LAN aur ek mapping row (LAN se port3) se replace kiya. Purana package delete hua aur uske baad har policy change ek baar hi kiya gaya.</p><p><b>Lesson:</b> hardware differences ko mapping rows mein rakho, packages ki copies mein nahi.</p></div>

<div class="iv"><p class="q">"Normalized interface kya hai aur mapping ke bina kya galat hota hai?"</p><p>Ye ADOM-level interface naam hai jo policies mein use hota hai; dynamic mapping table har device ke liye real interface deti hai. Target device ki row ke bina install no-mapping message ke saath refuse hota hai jo interface aur device ka naam batata hai. Fix: row jodo (ya naam match hon to default mapping enable karo), phir dobara install.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Policies ko interfaces chahiye, par port names devices ke beech alag hote hain.</li>
<li>Normalized interface (LAN, WAN) ADOM mein ek baar define hota hai; har device ki dynamic mapping row real port deti hai.</li>
<li>Simulator mein: <code>config pm interface</code>, <code>config dynamic-mapping</code> aur <code>set intf</code>.</li>
<li>Row na ho to install ruk jata hai: normalized interface 'LAN' has no mapping for device TRY-FGT.</li>
<li>Hardware differences mapping rows mein jate hain, extra packages mein nahi.</li>
</ul></div>
`}};export{e as default};