var e={id:`device-not-listed`,h:{en:`When a device is not listed: reading the clues`,hi:`Jab device list mein nahi aata: clues padhna`},body:{en:`
<p>When a parcel does not arrive, a good courier clerk does not shout; the clerk asks in order: was it posted, was the address right, was it delivered to the wrong building, was it delivered but nobody signed? Troubleshooting a FortiGate that does not appear on FortiManager follows the same chain. The chain has only a handful of links, and each one leaves a different clue.</p>

<h3>The chain, link by link</h3>
<ol>
<li><b>The type.</b> central-management must say <code>type fortimanager</code>. The default is fortiguard, and then the fmg address is never used.</li>
<li><b>The address.</b> The <code>fmg</code> value must be the real FortiManager address. A typo calls a different host or nobody.</li>
<li><b>The path.</b> There must be a route and a working network between both addresses, with TCP 541 allowed.</li>
<li><b>The serial.</b> If <code>serial-number</code> is set on the FortiGate, it must be the serial of this FortiManager.</li>
<li><b>Authorization.</b> The device must be authorized into an ADOM. Until then it is only in the unauthorized list.</li>
<li><b>The version.</b> The device firmware must equal the ADOM version, otherwise authorize is refused.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="Six links of the chain">
<rect x="8" y="40" width="94" height="56" rx="8" fill="#bae6fd"/><text x="55" y="72" text-anchor="middle" class="svg-ink" font-size="13">type</text>
<rect x="112" y="40" width="94" height="56" rx="8" fill="#bae6fd"/><text x="159" y="72" text-anchor="middle" class="svg-ink" font-size="13">address</text>
<rect x="216" y="40" width="94" height="56" rx="8" fill="#bae6fd"/><text x="263" y="72" text-anchor="middle" class="svg-ink" font-size="13">path</text>
<rect x="320" y="40" width="94" height="56" rx="8" fill="#fde68a"/><text x="367" y="72" text-anchor="middle" class="svg-ink" font-size="13">serial</text>
<rect x="424" y="40" width="94" height="56" rx="8" fill="#bbf7d0"/><text x="471" y="72" text-anchor="middle" class="svg-ink" font-size="13">authorize</text>
<rect x="528" y="40" width="104" height="56" rx="8" fill="#bbf7d0"/><text x="580" y="72" text-anchor="middle" class="svg-ink" font-size="13">version</text>
<text x="160" y="24" text-anchor="middle" class="svg-muted" font-size="12">FortiGate side</text><text x="500" y="24" text-anchor="middle" class="svg-muted" font-size="12">FortiManager side</text>
</svg><p class="cap">Work from left to right. The first broken link explains the symptom.</p></div>

<h3>Link 1: the type</h3>
<p>Compare the FortiGate that works with the one that does not. A <code>show</code> command prints only values that differ from the default, so a missing type line means the default fortiguard.</p>
<pre class="out">TRY-FGT # show system central-management
config system central-management
    <span class="hl">set type fortimanager</span>
    set fmg "192.0.2.5"
end

MDU-FGT # show system central-management
config system central-management
    set fmg "192.0.2.5"
end</pre>
<p>MDU-FGT has the right address but no type line. It will never connect. The fix is one line: <code>set type fortimanager</code>.</p>

<h3>Link 2: the address, and the FGFM debug</h3>
<p>The FortiGate can tell you what it is doing. <code>diagnose debug application fgfmsd -1</code> chooses the FGFM daemon as the source, <code>diagnose debug enable</code> starts printing, and <code>diagnose debug disable</code> stops it again. Wait a few seconds between enable and disable, because the attempt repeats every few seconds.</p>
<pre class="out">HQ-FGT # diagnose debug application fgfmsd -1
HQ-FGT # diagnose debug enable
<span class="hl">[fgfm_connect] connecting to 192.0.2.15:541</span>
[fgfm_connect] failed: connection to 192.0.2.15:541 timed out (no response from the FortiManager)
HQ-FGT # diagnose debug disable</pre>
<p>The debug names the address that is actually called. If it is not 192.0.2.5, the fmg value is wrong. When a healthy tunnel comes up you see <code>[fgfm_ready] FGFM management tunnel established</code> instead. A device whose type is still fortiguard prints no connect lines at all; silence is itself a clue that points to link 1.</p>

<h3>Links 3 and 4: path and serial</h3>
<p>Timed out with the right address means the packets do not arrive: check the route and the switch, and confirm no policy blocks TCP 541. If the debug says that a serial number does not match the connected unit, somebody set <code>serial-number</code> on the FortiGate to the serial of a different FortiManager; correct it or unset it.</p>

<h3>Links 5 and 6: authorization and version</h3>
<p>If the FortiGate debug shows a healthy tunnel but the device is not in the device list, look in the unauthorized list. Then authorize into an ADOM whose version equals the firmware.</p>
<pre class="out">FMG-1 # execute fmgui authorize HQ-FGT Kaveri
<span class="hl">Authorization failed: Device firmware version 7.6 does not match the version of ADOM Kaveri (7.4).</span></pre>
<p>The message names both versions. The fix is to use an ADOM with version 7.6; the next module on ADOMs treats that in depth.</p>

<div class="eg"><p><b>Worked example.</b> Three branches were pointed at FMG-1. TRY-FGT is in the unauthorized list (link 5). HQ-FGT is silent in the list, and its debug shows a call to 192.0.2.15 (link 2). MDU-FGT is also silent and its debug prints nothing (link 1). Three different clues, three different fixes, all from the same symptom: "not listed".</p></div>

<div class="warn"><p><b>Common mistakes.</b> Changing the FortiManager when the fault is on the FortiGate; forgetting to turn debug off; reading old debug lines as if they were current; changing several settings at once so you cannot tell which fixed it; and creating an ADOM with a different version than the devices. Also, a missing line in a show output is a default, not an error.</p></div>

<div class="exam"><p><b>Exam traps.</b> Default type is fortiguard. Debug application name is fgfmsd. Unauthorized means connected but not accepted. Authorization is checked against firmware version. In the real product the FortiManager also records connection logs and event messages that this simulator does not show.</p></div>

<div class="scn"><h4>Three branches, one symptom, three causes</h4><p>Kaveri Retail pointed all three FortiGates at FMG-1 and only one showed up. The engineer worked the chain: the connected branch was only waiting for authorize, the second branch called 192.0.2.15 by a typing error, and the third had the address but no type. After three small fixes all branches showed conn up.</p><p><b>Lesson:</b> one symptom can hide several independent causes; fix and test them one at a time.</p></div>

<div class="iv"><p class="q">"A FortiGate is pointed at FortiManager but is not listed. What do you check?"</p><p>Type, address, path to TCP 541, serial setting, then the unauthorized list and the ADOM version. Use the fgfmsd debug on the FortiGate to see which address it calls. Say that you change one thing at a time and verify after each.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Work the chain: type, address, path, serial, authorize, version.</li>
<li>show prints only non-default values; a missing type line means fortiguard.</li>
<li>fgfmsd debug names the address that is really called.</li>
<li>Silence in the debug points at the type; timed out points at address or path.</li>
<li>A version mismatch is shown by the authorize message itself.</li>
</ul></div>
`,hi:`
<p>Parcel na pahunche to achha courier clerk chillata nahi; wo order mein poochta hai: post hua tha, address sahi tha, galat building mein to nahi gaya, deliver hua par kisi ne sign nahi kiya? Jo FortiGate FortiManager par nahi dikhta uska troubleshooting bhi isi chain par chalta hai. Chain mein sirf kuch links hain, aur har link alag clue chhodta hai.</p>

<h3>Chain, link by link</h3>
<ol>
<li><b>Type.</b> central-management mein <code>type fortimanager</code> hona chahiye. Default fortiguard hai, aur tab fmg address kabhi use nahi hota.</li>
<li><b>Address.</b> <code>fmg</code> value FortiManager ka asli address honi chahiye. Typo kisi aur host ko ya kisi ko nahi call karta.</li>
<li><b>Path.</b> Dono addresses ke beech route aur working network chahiye, TCP 541 allowed ke saath.</li>
<li><b>Serial.</b> FortiGate par <code>serial-number</code> set ho to wo isi FortiManager ka serial hona chahiye.</li>
<li><b>Authorization.</b> Device ko kisi ADOM mein authorize karna hota hai. Tab tak wo sirf unauthorized list mein hai.</li>
<li><b>Version.</b> Device firmware ADOM version ke barabar ho, warna authorize refuse hota hai.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="Chain ke chhe links">
<rect x="8" y="40" width="94" height="56" rx="8" fill="#bae6fd"/><text x="55" y="72" text-anchor="middle" class="svg-ink" font-size="13">type</text>
<rect x="112" y="40" width="94" height="56" rx="8" fill="#bae6fd"/><text x="159" y="72" text-anchor="middle" class="svg-ink" font-size="13">address</text>
<rect x="216" y="40" width="94" height="56" rx="8" fill="#bae6fd"/><text x="263" y="72" text-anchor="middle" class="svg-ink" font-size="13">path</text>
<rect x="320" y="40" width="94" height="56" rx="8" fill="#fde68a"/><text x="367" y="72" text-anchor="middle" class="svg-ink" font-size="13">serial</text>
<rect x="424" y="40" width="94" height="56" rx="8" fill="#bbf7d0"/><text x="471" y="72" text-anchor="middle" class="svg-ink" font-size="13">authorize</text>
<rect x="528" y="40" width="104" height="56" rx="8" fill="#bbf7d0"/><text x="580" y="72" text-anchor="middle" class="svg-ink" font-size="13">version</text>
<text x="160" y="24" text-anchor="middle" class="svg-muted" font-size="12">FortiGate side</text><text x="500" y="24" text-anchor="middle" class="svg-muted" font-size="12">FortiManager side</text>
</svg><p class="cap">Left se right chalo. Pehla toota link symptom explain karta hai.</p></div>

<h3>Link 1: type</h3>
<p>Jo FortiGate chal raha hai usse jo nahi chal raha uski tulna karo. <code>show</code> command sirf wahi values print karta hai jo default se alag hain, isliye type line na ho to matlab default fortiguard.</p>
<pre class="out">TRY-FGT # show system central-management
config system central-management
    <span class="hl">set type fortimanager</span>
    set fmg "192.0.2.5"
end

MDU-FGT # show system central-management
config system central-management
    set fmg "192.0.2.5"
end</pre>
<p>MDU-FGT ka address sahi hai par type line nahi hai. Wo kabhi connect nahi hoga. Fix ek line hai: <code>set type fortimanager</code>.</p>

<h3>Link 2: address, aur FGFM debug</h3>
<p>FortiGate khud bata sakta hai wo kya kar raha hai. <code>diagnose debug application fgfmsd -1</code> FGFM daemon ko source chunta hai, <code>diagnose debug enable</code> printing shuru karta hai, aur <code>diagnose debug disable</code> use rok deta hai. Enable aur disable ke beech kuch seconds ruko, kyunki attempt har kuch seconds mein repeat hota hai.</p>
<pre class="out">HQ-FGT # diagnose debug application fgfmsd -1
HQ-FGT # diagnose debug enable
<span class="hl">[fgfm_connect] connecting to 192.0.2.15:541</span>
[fgfm_connect] failed: connection to 192.0.2.15:541 timed out (no response from the FortiManager)
HQ-FGT # diagnose debug disable</pre>
<p>Debug wo address batata hai jo sach mein call ho raha hai. Wo 192.0.2.5 na ho to fmg value galat hai. Healthy tunnel up hota hai to uski jagah <code>[fgfm_ready] FGFM management tunnel established</code> dikhta hai. Jis device ka type abhi fortiguard hai wo koi connect line print nahi karta; khamoshi khud ek clue hai jo link 1 ki taraf ishara karti hai.</p>

<h3>Links 3 aur 4: path aur serial</h3>
<p>Sahi address ke saath timed out ka matlab packets pahunch nahi rahe: route aur switch check karo, aur dekho koi policy TCP 541 block na kar rahi ho. Debug kahe ki serial number connected unit se match nahi karta, to kisi ne FortiGate par <code>serial-number</code> kisi aur FortiManager ka serial set kar diya hai; use sahi karo ya unset karo.</p>

<h3>Links 5 aur 6: authorization aur version</h3>
<p>FortiGate debug mein healthy tunnel dikhe par device device list mein na ho, to unauthorized list dekho. Phir use aise ADOM mein authorize karo jiska version firmware ke barabar ho.</p>
<pre class="out">FMG-1 # execute fmgui authorize HQ-FGT Kaveri
<span class="hl">Authorization failed: Device firmware version 7.6 does not match the version of ADOM Kaveri (7.4).</span></pre>
<p>Message dono versions ka naam leta hai. Fix hai version 7.6 wala ADOM use karna; ADOMs wala agla module isse gehrai mein cover karta hai.</p>

<div class="eg"><p><b>Worked example.</b> Teen branches FMG-1 par point kiye gaye. TRY-FGT unauthorized list mein hai (link 5). HQ-FGT list mein chup hai, aur uska debug 192.0.2.15 ko call dikhata hai (link 2). MDU-FGT bhi chup hai aur uska debug kuch print nahi karta (link 1). Teen alag clues, teen alag fixes, ek hi symptom se: "not listed".</p></div>

<div class="warn"><p><b>Common mistakes.</b> Fault FortiGate par ho aur FortiManager badalna; debug off karna bhool jana; purani debug lines ko current samajhna; ek saath kai settings badalna taaki pata na chale kisne fix kiya; aur devices se alag version ka ADOM banana. Ye bhi: show output mein line ka na hona default hai, error nahi.</p></div>

<div class="exam"><p><b>Exam traps.</b> Default type fortiguard hai. Debug application ka naam fgfmsd hai. Unauthorized matlab connected par accepted nahi. Authorization firmware version se check hoti hai. Real product mein FortiManager connection logs aur event messages bhi record karta hai jo ye simulator nahi dikhata.</p></div>

<div class="scn"><h4>Teen branches, ek symptom, teen causes</h4><p>Kaveri Retail ne teeno FortiGates ko FMG-1 par point kiya aur sirf ek dikha. Engineer ne chain chalayi: connected branch sirf authorize ka wait kar raha tha, doosre branch ne typing error se 192.0.2.15 ko call kiya, aur teesre ke paas address tha par type nahi. Teen chhote fixes ke baad sab branches conn up dikhane lage.</p><p><b>Lesson:</b> ek symptom kai independent causes chhupa sakta hai; unhe ek-ek karke fix aur test karo.</p></div>

<div class="iv"><p class="q">"FortiGate FortiManager par point hai par list mein nahi hai. Aap kya check karoge?"</p><p>Type, address, TCP 541 tak path, serial setting, phir unauthorized list aur ADOM version. FortiGate par fgfmsd debug se dekho wo kaun sa address call kar raha hai. Batao ki aap ek time par ek cheez badalte ho aur har baar verify karte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Chain chalao: type, address, path, serial, authorize, version.</li>
<li>show sirf non-default values print karta hai; type line na ho to fortiguard.</li>
<li>fgfmsd debug wo address batata hai jo sach mein call ho raha hai.</li>
<li>Debug mein khamoshi type ki taraf ishara karti hai; timed out address ya path ki taraf.</li>
<li>Version mismatch authorize ka message khud dikhata hai.</li>
</ul></div>
`}};export{e as default};