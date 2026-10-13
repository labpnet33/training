var e={id:`branch-design`,h:{en:`Designing a branch: decisions, checklist and rollout`,hi:`Branch design karna: decisions, checklist aur rollout`},body:{en:`
<p>An architect does not start with bricks; she starts with questions: how many people, what must keep working in a storm, what must never leave the building. A FlexConnect branch design is a short list of such decisions. Make them in order and the configuration almost writes itself, because every decision matches one object you already know.</p>

<h3>Decision 1: Is FlexConnect the right mode?</h3>
<table class="cmp">
<tr><th>Situation</th><th>Choice</th></tr>
<tr><td>Branch across a WAN, local servers, must survive WAN loss</td><td>FlexConnect, local switching</td></tr>
<tr><td>Campus with fast links to the controller, one VLAN plan</td><td>Local mode</td></tr>
<tr><td>Home worker with a mixed corporate and personal need</td><td>OEAP (FlexConnect based)</td></tr>
<tr><td>Guests that must exit at headquarters</td><td>Central switching WLAN on the flex AP</td></tr>
</table>
<p>Check the link too. FlexConnect tolerates roughly 300 ms of round-trip time to the controller, and local mode needs much less (about 100 ms); confirm the figures for your release, and measure the real RTT of the circuit before you promise anything.</p>

<h3>Decision 2: Per WLAN, switching and authentication</h3>
<p>Write the table first, then configure. For Pune:</p>
<table class="cmp">
<tr><th>WLAN</th><th>Policy profile</th><th>Switching</th><th>Auth</th><th>VLAN</th><th>Survives WAN loss</th></tr>
<tr><td>NK-STAFF</td><td>PP-STAFF-PUN</td><td>local</td><td>PSK</td><td>220</td><td>yes</td></tr>
<tr><td>NK-CORP</td><td>PP-CORP-PUN</td><td>local</td><td>802.1X, local auth to RAD-PUN</td><td>220</td><td>yes (with RAD-PUN set up)</td></tr>
<tr><td>NK-GUEST</td><td>PP-GUEST</td><td>central</td><td>web or open</td><td>50 at HQ</td><td>no, by design</td></tr>
</table>

<h3>Decision 3: Numbers</h3>
<p>Keep a plan that never changes between branches: the AP management VLAN (210 in Pune), the client VLAN (220), the address plan (10.30.10.0/24 and 10.30.20.0/24), the branch server room (10.30.60.0/24). Use the same convention at every site so that a second branch needs a copy and a change of the third octet. Write down the native VLAN once, because three places must agree: flex profile, switch trunk, DHCP pool of the AP VLAN.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Branch design decisions mapped to objects">
<rect x="20" y="20" width="270" height="40" rx="8" fill="#bae6fd"/><text x="155" y="45" text-anchor="middle" class="svg-ink" font-size="13">Where does traffic live?</text>
<rect x="350" y="20" width="270" height="40" rx="8" fill="#bbf7d0"/><text x="485" y="45" text-anchor="middle" class="svg-ink" font-size="13">policy profile: central switching</text>
<rect x="20" y="75" width="270" height="40" rx="8" fill="#bae6fd"/><text x="155" y="100" text-anchor="middle" class="svg-ink" font-size="13">What are the VLAN numbers here?</text>
<rect x="350" y="75" width="270" height="40" rx="8" fill="#bbf7d0"/><text x="485" y="100" text-anchor="middle" class="svg-ink" font-size="13">flex profile: native, vlan-name, id</text>
<rect x="20" y="130" width="270" height="40" rx="8" fill="#bae6fd"/><text x="155" y="155" text-anchor="middle" class="svg-ink" font-size="13">What must survive the WAN?</text>
<rect x="350" y="130" width="270" height="40" rx="8" fill="#bbf7d0"/><text x="485" y="155" text-anchor="middle" class="svg-ink" font-size="13">local auth, RADIUS group, DHCP</text>
<rect x="20" y="185" width="270" height="30" rx="8" fill="#bae6fd"/><text x="155" y="205" text-anchor="middle" class="svg-ink" font-size="13">Which APs belong together?</text>
<rect x="350" y="185" width="270" height="30" rx="8" fill="#bbf7d0"/><text x="485" y="205" text-anchor="middle" class="svg-ink" font-size="13">site tag with no local-site</text>
<line x1="290" y1="40" x2="350" y2="40" stroke="#64748b" stroke-width="2"/><line x1="290" y1="95" x2="350" y2="95" stroke="#64748b" stroke-width="2"/><line x1="290" y1="150" x2="350" y2="150" stroke="#64748b" stroke-width="2"/><line x1="290" y1="200" x2="350" y2="200" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Each design question maps to one 9800 object.</p></div>

<h3>Decision 4: How do the APs find the controller?</h3>
<p>Three ways, in the order the AP tries: a previously known controller, DHCP option 43 (the branch pool names 10.10.99.10, <code>option 43 hex f104.0a0a.630a</code>), and DNS (the name CISCO-CAPWAP-CONTROLLER in the branch domain). Pick one method per site and test it with a spare AP before the rollout. The primary and secondary controller names in the AP join settings give you the failover story.</p>

<h3>Decision 5: Where do the servers live?</h3>
<p>Anything the AP needs while the WAN is down must be in the branch: DHCP (R2), DNS and RADIUS (RAD-PUN, reachable at 10.30.60.20), and a time source if you need correct certificates. Everything else can stay central.</p>

<h3>Rollout order that avoids outages</h3>
<ol>
<li>Switch first: VLANs 210 and 220, trunk with native 210 and allowed 210,220, DHCP pools with option 43.</li>
<li>Controller objects: RADIUS group, flex profile, site tag (<code>no local-site</code>), policy profiles (shut, edit, enable), policy tag.</li>
<li>RADIUS client entries for every AP, with the key, before enabling local authentication.</li>
<li>Tag APs one at a time; each tag change causes a rejoin. Verify the AP shows FlexConnect and Connected.</li>
<li>Test with a client: address, VLAN, switching mode; then simulate the WAN cut in a window.</li>
</ol>
<pre class="out">WLC1# show ap tag summary
AP-PUN1   0050.7966.6811  SITE-PUNE   PT-PUNE   default-rf-tag   No   Static
AP-PUN2   0050.7966.6812  SITE-PUNE   PT-PUNE   default-rf-tag   No   Static

WLC1# show ap name AP-PUN2 config general
<span class="hl">AP Mode         : FlexConnect</span>
<span class="hl">FlexConnect State : Connected</span></pre>

<h3>Operations: a branch that can hide</h3>
<p>Because the controller hides standalone APs, you need monitoring that does not depend on it: a ping or SNMP check to the AP addresses (10.30.10.11 and .12) from the NOC, syslog from the branch router, and an alert on the controller log for AP_LOST. Review the RADIUS client list whenever an AP is replaced.</p>

<div class="eg"><p><b>Worked example.</b> Copy Pune to Chennai: new flex profile FLEX-CHE with native 410 and STAFF-CHE mapped to 420, site tag SITE-CHE with <code>no local-site</code>, policy profiles that use <code>vlan 420</code>, policy tag PT-CHE, RADIUS group RG-CHE. Same names with a new suffix, a new subnet plan, the same configuration lines.</p></div>

<div class="warn"><p><b>Common mistake.</b> Using one site tag for several branches "to keep it simple". Fast roaming keys, upgrade masters and the per-site AP limit all work per site tag, and one change then touches every branch at once.</p></div>

<div class="exam"><p><b>Exam trap.</b> The exam may describe a branch with a slow, high-latency link and ask for the mode: FlexConnect with local switching. The same question with a guest requirement hides the second answer: guests are centrally switched.</p></div>

<div class="scn"><h4>The twin branches</h4><p>Two shops in the same building complex shared one site tag and one flex profile. One shop used VLAN 220, the other 230. The mapping table had both names, and a policy referenced the wrong one at the second shop, so staff there landed in the AP management subnet. The fix was one site tag and one flex profile per shop, with their own numbers.</p><p><b>Lesson:</b> one branch, one site tag, one flex profile; reuse the policy, not the site.</p></div>

<div class="iv"><p class="q">"Walk me through designing a FlexConnect branch."</p><p>Start from requirements: what must survive a WAN loss, where guests exit. Choose switching and authentication per WLAN, define VLAN numbers and the native VLAN, build the flex profile, site tag and policy tag, put DHCP, DNS and RADIUS in the branch, register APs as RADIUS clients, tag APs, test, then rehearse the WAN failure. Mention monitoring for hidden standalone APs.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Decide per WLAN: switching, authentication, survival of WAN loss.</li>
<li>One branch means one site tag, one flex profile, one numbering plan.</li>
<li>Put DHCP, DNS and RADIUS in the branch for what must survive.</li>
<li>Roll out switch first, controller objects second, RADIUS clients third, AP tags last.</li>
<li>Monitor APs independently of the controller, because standalone APs vanish from it.</li>
</ul></div>
`,hi:`
<p>Architect eentein se shuru nahi karti; woh sawalon se shuru karti hai: kitne log, toofan mein kya chalna chahiye, kya building se bahar nahi jaana chahiye. FlexConnect branch design aise decisions ki chhoti list hai. Unhe order mein lo to configuration lagbhag apne aap likh jati hai, kyunki har decision ek object se match karta hai jo aap jaante ho.</p>

<h3>Decision 1: Kya FlexConnect sahi mode hai?</h3>
<table class="cmp">
<tr><th>Situation</th><th>Choice</th></tr>
<tr><td>WAN ke paar branch, local servers, WAN loss survive karna hai</td><td>FlexConnect, local switching</td></tr>
<tr><td>Controller se fast links wala campus, ek VLAN plan</td><td>Local mode</td></tr>
<tr><td>Ghar se kaam karne wala, corporate aur personal dono need</td><td>OEAP (FlexConnect based)</td></tr>
<tr><td>Guests jo headquarters se hi niklne chahiye</td><td>Flex AP par central switching WLAN</td></tr>
</table>
<p>Link bhi check karo. FlexConnect controller tak lagbhag 300 ms round-trip time tolerate karta hai, aur local mode ko bahut kam chahiye (lagbhag 100 ms); apne release ke liye figures confirm karo, aur kuch promise karne se pehle circuit ka asli RTT measure karo.</p>

<h3>Decision 2: Per WLAN, switching aur authentication</h3>
<p>Pehle table likho, phir configure karo. Pune ke liye:</p>
<table class="cmp">
<tr><th>WLAN</th><th>Policy profile</th><th>Switching</th><th>Auth</th><th>VLAN</th><th>WAN loss survive</th></tr>
<tr><td>NK-STAFF</td><td>PP-STAFF-PUN</td><td>local</td><td>PSK</td><td>220</td><td>haan</td></tr>
<tr><td>NK-CORP</td><td>PP-CORP-PUN</td><td>local</td><td>802.1X, RAD-PUN se local auth</td><td>220</td><td>haan (RAD-PUN set up ho to)</td></tr>
<tr><td>NK-GUEST</td><td>PP-GUEST</td><td>central</td><td>web ya open</td><td>HQ par 50</td><td>nahi, design se</td></tr>
</table>

<h3>Decision 3: Numbers</h3>
<p>Aisa plan rakho jo branches ke beech kabhi na badle: AP management VLAN (Pune mein 210), client VLAN (220), address plan (10.30.10.0/24 aur 10.30.20.0/24), branch server room (10.30.60.0/24). Har site par wahi convention use karo taaki doosre branch ko copy aur teesre octet ka badlav hi chahiye. Native VLAN ek baar likh lo, kyunki teen jagah agree karna zaroori hai: flex profile, switch trunk, AP VLAN ka DHCP pool.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Branch design decisions aur objects ka mapping">
<rect x="20" y="20" width="270" height="40" rx="8" fill="#bae6fd"/><text x="155" y="45" text-anchor="middle" class="svg-ink" font-size="13">Traffic kahan rehta hai?</text>
<rect x="350" y="20" width="270" height="40" rx="8" fill="#bbf7d0"/><text x="485" y="45" text-anchor="middle" class="svg-ink" font-size="13">policy profile: central switching</text>
<rect x="20" y="75" width="270" height="40" rx="8" fill="#bae6fd"/><text x="155" y="100" text-anchor="middle" class="svg-ink" font-size="13">Yahan VLAN numbers kya hain?</text>
<rect x="350" y="75" width="270" height="40" rx="8" fill="#bbf7d0"/><text x="485" y="100" text-anchor="middle" class="svg-ink" font-size="13">flex profile: native, vlan-name, id</text>
<rect x="20" y="130" width="270" height="40" rx="8" fill="#bae6fd"/><text x="155" y="155" text-anchor="middle" class="svg-ink" font-size="13">WAN mein kya survive kare?</text>
<rect x="350" y="130" width="270" height="40" rx="8" fill="#bbf7d0"/><text x="485" y="155" text-anchor="middle" class="svg-ink" font-size="13">local auth, RADIUS group, DHCP</text>
<rect x="20" y="185" width="270" height="30" rx="8" fill="#bae6fd"/><text x="155" y="205" text-anchor="middle" class="svg-ink" font-size="13">Kaunse APs saath hain?</text>
<rect x="350" y="185" width="270" height="30" rx="8" fill="#bbf7d0"/><text x="485" y="205" text-anchor="middle" class="svg-ink" font-size="13">no local-site wala site tag</text>
<line x1="290" y1="40" x2="350" y2="40" stroke="#64748b" stroke-width="2"/><line x1="290" y1="95" x2="350" y2="95" stroke="#64748b" stroke-width="2"/><line x1="290" y1="150" x2="350" y2="150" stroke="#64748b" stroke-width="2"/><line x1="290" y1="200" x2="350" y2="200" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Har design sawal ek 9800 object se map hota hai.</p></div>

<h3>Decision 4: APs controller ko kaise dhoondhte hain?</h3>
<p>Teen tareeqe, us order mein jisme AP try karta hai: pehle se jaana hua controller, DHCP option 43 (branch pool 10.10.99.10 batata hai, <code>option 43 hex f104.0a0a.630a</code>), aur DNS (branch domain mein CISCO-CAPWAP-CONTROLLER naam). Har site par ek method chuno aur rollout se pehle spare AP se test karo. AP join settings mein primary aur secondary controller names failover ki kahani dete hain.</p>

<h3>Decision 5: Servers kahan rahenge?</h3>
<p>WAN down hone par AP ko jo kuch chahiye woh branch mein hona chahiye: DHCP (R2), DNS aur RADIUS (RAD-PUN, 10.30.60.20 par reachable), aur time source agar sahi certificates chahiye. Baaki sab central reh sakta hai.</p>

<h3>Rollout order jo outages se bachata hai</h3>
<ol>
<li>Pehle switch: VLANs 210 aur 220, native 210 aur allowed 210,220 wala trunk, option 43 wale DHCP pools.</li>
<li>Controller objects: RADIUS group, flex profile, site tag (<code>no local-site</code>), policy profiles (shut, edit, enable), policy tag.</li>
<li>Local authentication enable karne se pehle har AP ke liye key ke saath RADIUS client entries.</li>
<li>APs ko ek-ek karke tag karo; har tag change rejoin karwata hai. Verify karo AP FlexConnect aur Connected dikha raha hai.</li>
<li>Client se test karo: address, VLAN, switching mode; phir window mein WAN cut simulate karo.</li>
</ol>
<pre class="out">WLC1# show ap tag summary
AP-PUN1   0050.7966.6811  SITE-PUNE   PT-PUNE   default-rf-tag   No   Static
AP-PUN2   0050.7966.6812  SITE-PUNE   PT-PUNE   default-rf-tag   No   Static

WLC1# show ap name AP-PUN2 config general
<span class="hl">AP Mode         : FlexConnect</span>
<span class="hl">FlexConnect State : Connected</span></pre>

<h3>Operations: branch jo chhup sakta hai</h3>
<p>Kyunki controller standalone APs chhupata hai, aapko aisi monitoring chahiye jo us par depend na kare: NOC se AP addresses (10.30.10.11 aur .12) par ping ya SNMP check, branch router se syslog, aur controller log mein AP_LOST par alert. AP replace hone par RADIUS client list review karo.</p>

<div class="eg"><p><b>Worked example.</b> Pune ko Chennai mein copy karo: naya flex profile FLEX-CHE jisme native 410 aur STAFF-CHE 420 se mapped, <code>no local-site</code> wala site tag SITE-CHE, <code>vlan 420</code> use karne wale policy profiles, policy tag PT-CHE, RADIUS group RG-CHE. Wahi names naye suffix ke saath, naya subnet plan, wahi configuration lines.</p></div>

<div class="warn"><p><b>Common mistake.</b> "Simple rakhne ke liye" kai branches ke liye ek site tag use karna. Fast roaming keys, upgrade masters aur per-site AP limit sab site tag ke hisaab se kaam karte hain, aur ek change phir har branch ko ek saath chhuta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Exam slow, high-latency link wala branch describe karke mode pooch sakta hai: local switching ke saath FlexConnect. Wahi question guest requirement ke saath doosra answer chhupata hai: guests centrally switched hote hain.</p></div>

<div class="scn"><h4>Judwa branches</h4><p>Ek hi building complex ki do shops ne ek site tag aur ek flex profile share kiya. Ek shop VLAN 220 use karti thi, doosri 230. Mapping table mein dono names the, aur doosri shop par policy ne galat wala reference kiya, isliye wahan staff AP management subnet mein pahunch gaya. Fix tha har shop ke liye ek site tag aur ek flex profile, apne numbers ke saath.</p><p><b>Lesson:</b> ek branch, ek site tag, ek flex profile; policy reuse karo, site nahi.</p></div>

<div class="iv"><p class="q">"FlexConnect branch design karna samjhao."</p><p>Requirements se shuru karo: WAN loss mein kya survive kare, guests kahan se niklein. Per WLAN switching aur authentication choose karo, VLAN numbers aur native VLAN define karo, flex profile, site tag aur policy tag banao, DHCP, DNS aur RADIUS branch mein rakho, APs ko RADIUS clients register karo, APs tag karo, test karo, phir WAN failure rehearse karo. Chhupe hue standalone APs ki monitoring ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Per WLAN decide karo: switching, authentication, WAN loss mein survival.</li>
<li>Ek branch matlab ek site tag, ek flex profile, ek numbering plan.</li>
<li>Jo survive karna hai uske liye DHCP, DNS aur RADIUS branch mein rakho.</li>
<li>Rollout: pehle switch, phir controller objects, phir RADIUS clients, aakhir mein AP tags.</li>
<li>APs ko controller se alag monitor karo, kyunki standalone APs usse gayab ho jaate hain.</li>
</ul></div>
`}};export{e as default};