var e={id:`onboarding-workflow`,h:{en:`The onboarding troubleshooting workflow, step by step`,hi:`Onboarding troubleshooting workflow, step by step`},body:{en:`
<div class="note"><p><b>What you will learn.</b> A fixed order of checks that finds why a FortiGate does not become a managed device: route, tunnel, address, type, serial number, version, authorize. You will learn what each check looks like in the simulator and which message belongs to which fault. <b>Prerequisites:</b> the module on architecture and onboarding (the FGFM tunnel on TCP 541, the unauthorized list, authorize) and basic FortiGate CLI.</p></div>

<p>When a lift in a building does not arrive, a good technician does not start by replacing the motor. He checks power, then the door, then the call button, in a fixed order, and stops at the first thing that is broken. Troubleshooting a device that FortiManager cannot see works the same way. The faults are independent, so you must check them in order and fix one at a time.</p>

<h3>The two halves of the problem</h3>
<p>Onboarding has two halves. First the <b>tunnel</b> (the FGFM management connection, TCP 541) must come up between the FortiGate and FMG-1. Only then does the device appear in the <b>unauthorized list</b>. Second, an administrator must <b>authorize</b> it into an ADOM, which creates a row in the device database and retrieves the configuration as revision 1. A fault in the first half shows as an empty unauthorized list. A fault in the second half shows as an error from authorize.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Seven checks in order">
<rect x="10" y="20" width="76" height="46" rx="6" fill="#bae6fd"/><text x="48" y="48" text-anchor="middle" class="svg-ink" font-size="12">1 Route</text>
<rect x="100" y="20" width="76" height="46" rx="6" fill="#bae6fd"/><text x="138" y="48" text-anchor="middle" class="svg-ink" font-size="12">2 Tunnel</text>
<rect x="190" y="20" width="76" height="46" rx="6" fill="#bae6fd"/><text x="228" y="48" text-anchor="middle" class="svg-ink" font-size="12">3 Address</text>
<rect x="280" y="20" width="76" height="46" rx="6" fill="#bae6fd"/><text x="318" y="48" text-anchor="middle" class="svg-ink" font-size="12">4 Type</text>
<rect x="370" y="20" width="76" height="46" rx="6" fill="#bae6fd"/><text x="408" y="48" text-anchor="middle" class="svg-ink" font-size="12">5 Serial</text>
<rect x="460" y="20" width="76" height="46" rx="6" fill="#fde68a"/><text x="498" y="48" text-anchor="middle" class="svg-ink" font-size="12">6 Version</text>
<rect x="550" y="20" width="80" height="46" rx="6" fill="#bbf7d0"/><text x="590" y="48" text-anchor="middle" class="svg-ink" font-size="12">7 Authorize</text>
<line x1="86" y1="43" x2="100" y2="43" stroke="#64748b" stroke-width="2"/><line x1="176" y1="43" x2="190" y2="43" stroke="#64748b" stroke-width="2"/><line x1="266" y1="43" x2="280" y2="43" stroke="#64748b" stroke-width="2"/><line x1="356" y1="43" x2="370" y2="43" stroke="#64748b" stroke-width="2"/><line x1="446" y1="43" x2="460" y2="43" stroke="#64748b" stroke-width="2"/><line x1="536" y1="43" x2="550" y2="43" stroke="#64748b" stroke-width="2"/>
<text x="10" y="100" class="svg-muted" font-size="12">Checks 1 to 5: the tunnel comes up and the device is listed as unauthorized.</text>
<text x="10" y="124" class="svg-muted" font-size="12">Checks 6 and 7: authorize is accepted into an ADOM of the same version.</text>
</svg><p class="cap">Fixed order: stop at the first fault, fix it, then go on.</p></div>

<h3>Reading the debug first</h3>
<p>The most useful tool is the FGFM debug on the FortiGate: <code>diagnose debug application fgfmsd -1</code> followed by <code>diagnose debug enable</code>. The FortiGate then prints each connection attempt and the reason for a failure. The wording below is what the simulator prints; a real FortiGate prints different lines but the idea is identical.</p>
<pre class="out">[fgfm_connect] connecting to <span class="hl">192.0.2.50</span>:541
[fgfm_connect] failed: connection to 192.0.2.50:541 timed out (no response from the FortiManager)</pre>
<p>Remember to switch the debug off again with <code>diagnose debug disable</code> when you are done.</p>

<h3>What each check means</h3>
<table class="cmp"><tr><th>Check</th><th>Question</th><th>Message you may see</th></tr>
<tr><td>1 Route</td><td>Can the FortiGate reach 192.0.2.5 and get an answer back?</td><td>no route to the FortiManager; ... (TCP/541 does not reach the FortiManager); ... (no return path)</td></tr>
<tr><td>2 Tunnel</td><td>Does the debug show a successful connect?</td><td>the lines above, or the closed message after a working tunnel fails</td></tr>
<tr><td>3 Address</td><td>Is <code>fmg</code> exactly the FortiManager address?</td><td>connection to the wrong address timed out</td></tr>
<tr><td>4 Type</td><td>Is <code>type</code> set to fortimanager?</td><td>central-management type is fortiguard; no address configured</td></tr>
<tr><td>5 Serial</td><td>If <code>serial-number</code> is set, is it the FortiManager serial?</td><td>FortiManager serial number ... does not match the connected unit</td></tr>
<tr><td>6 Version</td><td>Does the ADOM version equal the device firmware?</td><td>Device firmware version 7.6 does not match the version of ADOM Kaveri (7.4).</td></tr>
<tr><td>7 Authorize</td><td>Was the device authorized into an existing ADOM?</td><td>ADOM 'Corporate' does not exist.</td></tr></table>

<div class="eg"><p><b>Worked example.</b> MDU-FGT does not appear. The unauthorized list on FMG-1 says <code>There are no unauthorized devices.</code> That is the first half, so skip checks 6 and 7. The debug shows attempts to 192.0.2.50. Check 3 fails: the typed address is wrong. After the fix to 192.0.2.5 the list shows MDU-FGT with serial FGVMEV1JOS6TJ000 and version 7.6 MR0. Now authorize runs into check 6.</p></div>

<h3>Why order matters</h3>
<p>Fixing the version while the address is wrong changes nothing you can see, because the device never reaches the point where the version is compared. Fixing in order gives you a visible result after every step, which also proves each fix. Keep a short note of what you changed, because the ticket will ask.</p>

<div class="warn"><p><b>Common mistakes.</b> Changing three things at once and not knowing which one helped. Blaming the firewall policy: FGFM is management traffic to the FortiManager and is not decided by user policies. Forgetting that a refused connection and a timeout are different answers: a timeout means nobody answered, a refusal means the device answered but did not allow it.</p></div>

<div class="exam"><p><b>Exam traps.</b> The tunnel uses TCP 541 in both directions of onboarding. An empty unauthorized list points to the tunnel, an error from authorize points to the ADOM. Type fortiguard is the default and ignores the fmg address.</p></div>

<div class="scn"><h4>Three tickets, one afternoon</h4><p>A support desk received three tickets: a branch not listed, a branch listed but refused, and a branch listed and authorized but failing later. The new engineer opened FMG-1 first and looked at the unauthorized list. The first branch was absent, so he went to its FortiGate and read the debug. Wrong address. The second was listed, so he went straight to authorize and read the version message. The third was neither: it was an install problem, covered in the next chapter. He closed all three before evening because each ticket was sent to the right half of the problem.</p><p><b>Lesson:</b> the unauthorized list tells you in ten seconds which half you are in.</p></div>

<div class="iv"><p class="q">"A new FortiGate does not show up in FortiManager. What do you check?"</p><p>Start with what FortiManager shows: unauthorized list empty or not. If empty, work from the FortiGate: route and reachability to the FortiManager on TCP 541, FGFM debug, the fmg address, type fortimanager, and the serial-number if set. If listed, authorize and read the error, usually the ADOM version. Say that you change one thing at a time.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Seven checks in order: route, tunnel, address, type, serial, version, authorize.</li>
<li>Empty unauthorized list means the tunnel is not up; look on the FortiGate.</li>
<li>The FGFM debug on the FortiGate names the address it tries and why it fails.</li>
<li>Version mismatch appears only at authorize, so it is the last thing you meet.</li>
<li>Fix one fault, verify, then move on.</li>
</ul></div>
`,hi:`
<div class="note"><p><b>Is chapter mein aap kya seekhoge.</b> Ek fixed order of checks jo batata hai ki FortiGate managed device kyun nahi ban raha: route, tunnel, address, type, serial number, version, authorize. Aap seekhoge ki har check simulator mein kaisa dikhta hai aur kaun sa message kis fault ka hai. <b>Prerequisites:</b> architecture aur onboarding wala module (TCP 541 par FGFM tunnel, unauthorized list, authorize) aur basic FortiGate CLI.</p></div>

<p>Jab building ki lift nahi aati, to achha technician seedha motor nahi badalta. Wo pehle power, phir door, phir call button check karta hai, fixed order mein, aur pehli toot-ti cheez par ruk jata hai. Jis device ko FortiManager dekh nahi pa raha, uska troubleshooting bhi aise hi hota hai. Faults independent hote hain, isliye order mein check karo aur ek-ek karke fix karo.</p>

<h3>Problem ke do hisse</h3>
<p>Onboarding ke do hisse hain. Pehle <b>tunnel</b> (FGFM management connection, TCP 541) FortiGate aur FMG-1 ke beech up hona chahiye. Tabhi device <b>unauthorized list</b> mein aata hai. Doosre, administrator ko use ADOM mein <b>authorize</b> karna hota hai, jisse device database mein row banti hai aur configuration revision 1 ki tarah retrieve hoti hai. Pehle hisse ka fault khaali unauthorized list ki tarah dikhta hai. Doosre hisse ka fault authorize ke error ki tarah dikhta hai.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Seven checks in order">
<rect x="10" y="20" width="76" height="46" rx="6" fill="#bae6fd"/><text x="48" y="48" text-anchor="middle" class="svg-ink" font-size="12">1 Route</text>
<rect x="100" y="20" width="76" height="46" rx="6" fill="#bae6fd"/><text x="138" y="48" text-anchor="middle" class="svg-ink" font-size="12">2 Tunnel</text>
<rect x="190" y="20" width="76" height="46" rx="6" fill="#bae6fd"/><text x="228" y="48" text-anchor="middle" class="svg-ink" font-size="12">3 Address</text>
<rect x="280" y="20" width="76" height="46" rx="6" fill="#bae6fd"/><text x="318" y="48" text-anchor="middle" class="svg-ink" font-size="12">4 Type</text>
<rect x="370" y="20" width="76" height="46" rx="6" fill="#bae6fd"/><text x="408" y="48" text-anchor="middle" class="svg-ink" font-size="12">5 Serial</text>
<rect x="460" y="20" width="76" height="46" rx="6" fill="#fde68a"/><text x="498" y="48" text-anchor="middle" class="svg-ink" font-size="12">6 Version</text>
<rect x="550" y="20" width="80" height="46" rx="6" fill="#bbf7d0"/><text x="590" y="48" text-anchor="middle" class="svg-ink" font-size="12">7 Authorize</text>
<line x1="86" y1="43" x2="100" y2="43" stroke="#64748b" stroke-width="2"/><line x1="176" y1="43" x2="190" y2="43" stroke="#64748b" stroke-width="2"/><line x1="266" y1="43" x2="280" y2="43" stroke="#64748b" stroke-width="2"/><line x1="356" y1="43" x2="370" y2="43" stroke="#64748b" stroke-width="2"/><line x1="446" y1="43" x2="460" y2="43" stroke="#64748b" stroke-width="2"/><line x1="536" y1="43" x2="550" y2="43" stroke="#64748b" stroke-width="2"/>
<text x="10" y="100" class="svg-muted" font-size="12">Checks 1 se 5: tunnel up hota hai aur device unauthorized mein aata hai.</text>
<text x="10" y="124" class="svg-muted" font-size="12">Checks 6 aur 7: authorize same version ke ADOM mein accept hota hai.</text>
</svg><p class="cap">Fixed order: pehle fault par ruko, fix karo, phir aage badho.</p></div>

<h3>Pehle debug padho</h3>
<p>Sabse kaam ka tool FortiGate par FGFM debug hai: <code>diagnose debug application fgfmsd -1</code> aur uske baad <code>diagnose debug enable</code>. Phir FortiGate har connection attempt aur failure ki wajah print karta hai. Neeche wahi wording hai jo simulator print karta hai; real FortiGate alag lines print karta hai par idea wahi hai.</p>
<pre class="out">[fgfm_connect] connecting to <span class="hl">192.0.2.50</span>:541
[fgfm_connect] failed: connection to 192.0.2.50:541 timed out (no response from the FortiManager)</pre>
<p>Kaam khatam hone par debug ko <code>diagnose debug disable</code> se band karna mat bhoolo.</p>

<h3>Har check ka matlab</h3>
<table class="cmp"><tr><th>Check</th><th>Sawal</th><th>Message jo dikh sakta hai</th></tr>
<tr><td>1 Route</td><td>Kya FortiGate 192.0.2.5 tak pahunch kar jawab wapas pa sakta hai?</td><td>no route to the FortiManager; ... (TCP/541 does not reach the FortiManager); ... (no return path)</td></tr>
<tr><td>2 Tunnel</td><td>Kya debug mein successful connect dikhta hai?</td><td>upar wali lines, ya working tunnel fail hone ke baad closed message</td></tr>
<tr><td>3 Address</td><td>Kya <code>fmg</code> bilkul FortiManager ka address hai?</td><td>galat address par connection timed out</td></tr>
<tr><td>4 Type</td><td>Kya <code>type</code> fortimanager set hai?</td><td>central-management type is fortiguard; no address configured</td></tr>
<tr><td>5 Serial</td><td>Agar <code>serial-number</code> set hai, to kya wo FortiManager ka serial hai?</td><td>FortiManager serial number ... does not match the connected unit</td></tr>
<tr><td>6 Version</td><td>Kya ADOM version device firmware ke barabar hai?</td><td>Device firmware version 7.6 does not match the version of ADOM Kaveri (7.4).</td></tr>
<tr><td>7 Authorize</td><td>Kya device existing ADOM mein authorize hua?</td><td>ADOM 'Corporate' does not exist.</td></tr></table>

<div class="eg"><p><b>Worked example.</b> MDU-FGT nahi dikh raha. FMG-1 par unauthorized list kehti hai <code>There are no unauthorized devices.</code> Ye pehla hissa hai, isliye checks 6 aur 7 skip karo. Debug 192.0.2.50 par attempts dikhata hai. Check 3 fail hota hai: type kiya gaya address galat hai. 192.0.2.5 karne ke baad list mein MDU-FGT serial FGVMEV1JOS6TJ000 aur version 7.6 MR0 ke saath dikhta hai. Ab authorize check 6 se takrata hai.</p></div>

<h3>Order kyun matter karta hai</h3>
<p>Address galat ho aur aap version fix karo to koi visible fark nahi padta, kyunki device us point tak pahunchta hi nahi jahan version compare hota hai. Order mein fix karne se har step ke baad visible result milta hai, jo har fix ka proof bhi hai. Kya badla uska chhota note rakho, kyunki ticket wahi poochega.</p>

<div class="warn"><p><b>Common mistakes.</b> Teen cheezein ek saath badalna aur pata na hona ki kisne madad ki. Firewall policy ko blame karna: FGFM FortiManager ki taraf management traffic hai aur user policies se decide nahi hota. Ye bhoolna ki refused connection aur timeout alag jawab hain: timeout matlab kisi ne jawab nahi diya, refusal matlab device ne jawab diya par allow nahi kiya.</p></div>

<div class="exam"><p><b>Exam traps.</b> Tunnel onboarding ke dono tareekon mein TCP 541 use karta hai. Khaali unauthorized list tunnel ki taraf ishara karti hai, authorize ka error ADOM ki taraf. Type fortiguard default hai aur fmg address ko ignore karta hai.</p></div>

<div class="scn"><h4>Teen tickets, ek dopahar</h4><p>Support desk ko teen tickets mile: ek branch listed nahi, ek listed par refused, aur ek listed aur authorized par baad mein fail. Naye engineer ne pehle FMG-1 kholkar unauthorized list dekhi. Pehla branch absent tha, to wo uske FortiGate par gaya aur debug padha. Galat address. Doosra listed tha, to seedha authorize kiya aur version message padha. Teesra na ye tha na wo: ye install problem tha, jo agle chapter mein hai. Shaam tak teeno close ho gaye kyunki har ticket problem ke sahi hisse mein bheji gayi.</p><p><b>Lesson:</b> unauthorized list das second mein bata deti hai ki aap kaun se hisse mein ho.</p></div>

<div class="iv"><p class="q">"Naya FortiGate FortiManager mein nahi dikh raha. Aap kya check karoge?"</p><p>Pehle dekho FortiManager kya dikha raha hai: unauthorized list khaali hai ya nahi. Khaali ho to FortiGate se kaam karo: FortiManager tak route aur TCP 541 reachability, FGFM debug, fmg address, type fortimanager, aur serial-number agar set hai. Listed ho to authorize karo aur error padho, aam taur par ADOM version. Kehna ki aap ek time par ek hi cheez badalte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Seven checks order mein: route, tunnel, address, type, serial, version, authorize.</li>
<li>Khaali unauthorized list matlab tunnel up nahi hai; FortiGate par dekho.</li>
<li>FortiGate ka FGFM debug batata hai ki wo kaun sa address try karta hai aur kyun fail hota hai.</li>
<li>Version mismatch sirf authorize par dikhta hai, isliye wo sabse last mein milta hai.</li>
<li>Ek fault fix karo, verify karo, phir aage badho.</li>
</ul></div>
`}};export{e as default};