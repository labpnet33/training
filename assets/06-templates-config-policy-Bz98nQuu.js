var e={id:`templates-config-policy`,h:{en:`Layers 5 and 6: template push failures, out-of-sync devices and policies that do not apply`,hi:`Layers 5 aur 6: template push failures, out-of-sync devices aur policies jo lagti nahi`},body:{en:`
<p>When you order a custom suit, the tailor writes your measurements on a card, and then cuts the cloth from the card. If the suit does not fit, there are two places to look: was the card wrong, or was the cutting wrong? Templates and policies work the same way. The Manager holds the "card" (the template and the policy definition) and the devices carry out the "cutting". A fault can be in what was asked (the intent), in how it was delivered (the push), or in what the device ended up doing (the result). This chapter shows you how to tell them apart.</p>

<h3>Layer 5: configuration pushed by templates</h3>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Template push stages">
<rect x="10" y="50" width="120" height="70" rx="8" fill="#bae6fd"/><text x="70" y="80" text-anchor="middle" class="svg-ink" font-size="13">Template</text><text x="70" y="98" text-anchor="middle" class="svg-muted" font-size="11">plus variables</text>
<rect x="170" y="50" width="120" height="70" rx="8" fill="#ddd6fe"/><text x="230" y="80" text-anchor="middle" class="svg-ink" font-size="13">Validate</text><text x="230" y="98" text-anchor="middle" class="svg-muted" font-size="11">Manager checks</text>
<rect x="330" y="50" width="120" height="70" rx="8" fill="#fde68a"/><text x="390" y="80" text-anchor="middle" class="svg-ink" font-size="13">Push</text><text x="390" y="98" text-anchor="middle" class="svg-muted" font-size="11">over control conn.</text>
<rect x="490" y="50" width="140" height="70" rx="8" fill="#bbf7d0"/><text x="560" y="80" text-anchor="middle" class="svg-ink" font-size="13">Device applies</text><text x="560" y="98" text-anchor="middle" class="svg-muted" font-size="11">and reports back</text>
<line x1="130" y1="85" x2="170" y2="85" stroke="#64748b" stroke-width="2"/><line x1="290" y1="85" x2="330" y2="85" stroke="#64748b" stroke-width="2"/><line x1="450" y1="85" x2="490" y2="85" stroke="#64748b" stroke-width="2"/>
<text x="150" y="150" text-anchor="middle" class="svg-accent" font-size="12">fails: missing</text><text x="150" y="165" text-anchor="middle" class="svg-accent" font-size="12">or wrong value</text>
<text x="390" y="150" text-anchor="middle" class="svg-accent" font-size="12">fails: device not</text><text x="390" y="165" text-anchor="middle" class="svg-accent" font-size="12">reachable</text>
<text x="560" y="150" text-anchor="middle" class="svg-accent" font-size="12">fails: device rejects</text><text x="560" y="165" text-anchor="middle" class="svg-accent" font-size="12">or rolls back</text>
</svg><p class="cap">Three places a push can fail: before it leaves, on the way, on the device.</p></div>
<table class="cmp"><tr><th>Where it failed</th><th>What you see</th><th>Typical causes</th></tr>
<tr><td>Validation, before the push</td><td>Error in the Manager; nothing sent</td><td>Variable missing or invalid (for example an IP address written in the wrong form), a feature that depends on another, a value used twice</td></tr>
<tr><td>Delivery</td><td>Task stops at a step; device shown as unreachable</td><td>Control connection down (chapters 2 and 3); the device is not in the managed mode; the Manager is overloaded</td></tr>
<tr><td>On the device</td><td>The task shows the device's own error message, or the device reverts</td><td>Unsupported command for that software release or platform; interface name that does not exist; a conflicting local setting</td></tr></table>
<p>Where to look: the <b>task view</b> that opens after you push shows each step and the failure message; read it from the top to the first red line. Before pushing, use the preview of the generated configuration and the difference against the current configuration (the Manager shows a <b>Config Diff</b>); a change you did not expect in that diff is cheaper to stop before pushing than to find afterwards.</p>

<h4>Template-managed devices roll back</h4>
<p>If a push changes something that cuts the device off from the Manager (for example the transport interface or its default route), the device is designed to roll back to the previous configuration after a timer instead of staying lost. The length of the timer depends on the release. During the wait the device may show as unreachable; do not push again immediately. After the rollback, the task is marked failed and the device returns, so the fix is to correct the template, not the device.</p>

<h4>Out of sync</h4>
<p>A device is <b>out of sync</b> when what it runs differs from what the Manager holds for it. Typical reasons: an emergency change made directly on the device, a push that was only partly applied, or a device that was offline during a change. Compare the two views:</p>
<pre class="code">E-BLR-1# show sdwan running-config | include name-server
E-BLR-1# show sdwan running-config | section interface GigabitEthernet1
</pre>
<p>Then look at the same item in the template preview in the Manager. Decide which one is right: if the device change was an emergency fix that should stay, put it in the template; if not, push the template again to overwrite. Leaving an out-of-sync device is a trap: the next unrelated push brings the difference back at the worst moment.</p>

<h3>Layer 6: policy that does not match or is not applied</h3>
<p>A policy has two parts: the <b>definition</b> (sequences with match and action) and the <b>application</b> (which site list, which VPN list, which direction). Most "my policy does not work" tickets are errors in the application, not in the definition. The centralized policy is <b>activated</b> on the Controller and sent to the edges of the listed sites; the localized policy is part of the device template.</p>
<table class="cmp"><tr><th>Question</th><th>Check</th></tr>
<tr><td>Is the policy activated?</td><td>Manager: Configuration &gt; Policies, the policy shows as active; on the Controller <code>show running-config policy</code> and <code>show running-config apply-policy</code></td></tr>
<tr><td>Is it applied to this site?</td><td>The site list in <code>apply-policy</code> contains the branch's site ID (site 300 for E-BLR-1)</td></tr>
<tr><td>Direction?</td><td>Data policy: from-service (traffic from the LAN), from-tunnel (from the overlay) or all. Control policy: in or out</td></tr>
<tr><td>Does the edge have it?</td><td><code>show sdwan policy from-vsmart</code> on the edge lists the policy it received</td></tr>
<tr><td>Is it matching?</td><td><code>show sdwan policy data-policy-filter</code> and the counters; localized ACLs: <code>show sdwan policy access-list-counters</code></td></tr>
<tr><td>Are the lists right?</td><td>VPN list contains VPN 10; prefix, application and data-prefix lists have the expected members</td></tr>
<tr><td>Does the order matter?</td><td>Sequence numbers are evaluated from the lowest; the first match wins; a default action applies when nothing matches</td></tr></table>
<pre class="out">E-BLR-1# show sdwan policy from-vsmart
(no output: the edge has received no centralized policy)

E-MUM-1# show sdwan policy data-policy-filter
data-policy-filter  DP-DIA  (trimmed)
 data-policy-vpnlist  VPN10
  counter  DIA-MATCH
   <span class="hl">packets  18422</span>
   bytes    21200113</pre>
<p>The comparison tells the story: Mumbai receives the policy and the counter grows with traffic; Bengaluru receives nothing. The next place to look is the site list on the Controller. If a policy is received but the counter stays at 0, the policy applies but the match does not: check the VPN list, the direction and the match fields. Remember that application matching depends on classification by the edge, so test with traffic that is really that application, and that a data policy sees the packet <b>before</b> the routing decision on the service side but <b>after</b> arrival on the tunnel side.</p>

<h4>Policy side effects</h4>
<ul>
<li>A control policy with a default of reject drops everything you did not mention, which looks like "routes disappear" (chapter 4).</li>
<li>A data policy that sends traffic into a tunnel colour that does not exist at the site gives a black hole unless a fallback is set.</li>
<li>An application-aware routing policy needs an SLA class and a working BFD measurement; without sessions it cannot choose (sdw-aar).</li>
<li>A localized ACL applied outbound instead of inbound, or on the wrong interface, matches nothing (the sdw-qos module's counters example).</li>
</ul>

<div class="eg"><p><b>Worked example.</b> A new data policy sends YouTube to the internet transport at all branches. Mumbai works; Bengaluru does not. On E-BLR-1 <code>show sdwan policy from-vsmart</code> is empty, so the policy never arrived. On the Controller, <code>show running-config apply-policy</code> lists the site list BRANCHES-WEST with sites 100 and 200 only. The engineer adds site 300, activates, and <code>show sdwan policy from-vsmart</code> on E-BLR-1 now shows the policy; a test video increments the counter. Four checks, one list entry.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Editing the policy definition when the application is wrong. (2) Pushing twice while a device is rolling back. (3) Making a local fix on a template-managed device and not updating the template. (4) Testing a policy with the wrong traffic or from the wrong VPN. (5) Forgetting to activate after saving.</p></div>

<div class="exam"><p><b>Exam trap.</b> Centralized policy is built on the Manager, activated to the Controller and applied to site lists with a direction; localized policy lives in the device template. A saved but not activated policy changes nothing. Data policy direction: from-service, from-tunnel, all.</p></div>

<div class="scn"><h4>The template that locked out a branch</h4><p>A template change set a new default route on the transport interface of E-HYD-1 with a typing error in the gateway. The device lost the Manager, waited for the rollback timer and returned to the earlier configuration; the Manager showed the push as failed. The engineer, who had seen the device unreachable for a few minutes, nearly pushed again. The task log and the Config Diff showed the wrong gateway. After correcting it in the template the second push worked.</p><p><b>Lesson:</b> read the task log and the diff; do not push twice blindly.</p></div>

<div class="iv"><p class="q">"A policy is activated but does not seem to work. Where do you look?"</p><p>I separate definition from application. I confirm it is activated and applied to the right site list with the right direction and VPN list, check that the edge received it with show sdwan policy from-vsmart, and then read the counters to see whether the match works. I test with real traffic from the right VPN and look at sequence order and the default action.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A push can fail at validation, delivery or on the device; the task log shows which.</li>
<li>Use the preview and Config Diff before pushing; devices roll back if the Manager is lost.</li>
<li>Out of sync means device and Manager differ; decide which is right and fix the template.</li>
<li>Most policy faults are in application: site list, direction, VPN list, activation.</li>
<li>Edge checks: from-vsmart for receipt, counters for matching.</li>
</ul></div>
`,hi:`
<p>Custom suit order karte ho to tailor aapke naap card par likhta hai, aur phir card se kapda kaatta hai. Suit fit na ho to do jagah dekhni hain: card galat tha ya katai galat thi? Templates aur policies bhi aise hi kaam karte hain. Manager "card" rakhta hai (template aur policy definition) aur devices "katai" karte hain. Fault ho sakta hai jo maanga gaya (intent) usmein, jaise pahunchaya gaya (push) usmein, ya device ne jo kiya (result) usmein. Yeh chapter inhe alag karna sikhata hai.</p>

<h3>Layer 5: templates se push hui configuration</h3>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Template push stages">
<rect x="10" y="50" width="120" height="70" rx="8" fill="#bae6fd"/><text x="70" y="80" text-anchor="middle" class="svg-ink" font-size="13">Template</text><text x="70" y="98" text-anchor="middle" class="svg-muted" font-size="11">aur variables</text>
<rect x="170" y="50" width="120" height="70" rx="8" fill="#ddd6fe"/><text x="230" y="80" text-anchor="middle" class="svg-ink" font-size="13">Validate</text><text x="230" y="98" text-anchor="middle" class="svg-muted" font-size="11">Manager checks</text>
<rect x="330" y="50" width="120" height="70" rx="8" fill="#fde68a"/><text x="390" y="80" text-anchor="middle" class="svg-ink" font-size="13">Push</text><text x="390" y="98" text-anchor="middle" class="svg-muted" font-size="11">control conn. par</text>
<rect x="490" y="50" width="140" height="70" rx="8" fill="#bbf7d0"/><text x="560" y="80" text-anchor="middle" class="svg-ink" font-size="13">Device apply karta hai</text><text x="560" y="98" text-anchor="middle" class="svg-muted" font-size="11">aur report karta hai</text>
<line x1="130" y1="85" x2="170" y2="85" stroke="#64748b" stroke-width="2"/><line x1="290" y1="85" x2="330" y2="85" stroke="#64748b" stroke-width="2"/><line x1="450" y1="85" x2="490" y2="85" stroke="#64748b" stroke-width="2"/>
<text x="150" y="150" text-anchor="middle" class="svg-accent" font-size="12">fail: value missing</text><text x="150" y="165" text-anchor="middle" class="svg-accent" font-size="12">ya galat</text>
<text x="390" y="150" text-anchor="middle" class="svg-accent" font-size="12">fail: device</text><text x="390" y="165" text-anchor="middle" class="svg-accent" font-size="12">reachable nahi</text>
<text x="560" y="150" text-anchor="middle" class="svg-accent" font-size="12">fail: device reject</text><text x="560" y="165" text-anchor="middle" class="svg-accent" font-size="12">ya rollback karta hai</text>
</svg><p class="cap">Push teen jagah fail ho sakta hai: nikalne se pehle, raaste mein, device par.</p></div>
<table class="cmp"><tr><th>Kahan fail hua</th><th>Kya dikhta hai</th><th>Aam wajahein</th></tr>
<tr><td>Validation, push se pehle</td><td>Manager mein error; kuch bheja nahi</td><td>Variable missing ya invalid (jaise IP address galat form mein), ek feature jo doosre par nirbhar hai, ek value do baar</td></tr>
<tr><td>Delivery</td><td>Task ek step par rukta hai; device unreachable dikhta hai</td><td>Control connection down (chapters 2 aur 3); device managed mode mein nahi; Manager overloaded</td></tr>
<tr><td>Device par</td><td>Task device ka apna error message dikhata hai, ya device wapas ho jaata hai</td><td>Us software release ya platform ke liye unsupported command; aisa interface naam jo hai hi nahi; conflicting local setting</td></tr></table>
<p>Kahan dekhein: push ke baad khulne wala <b>task view</b> har step aur failure message dikhata hai; upar se pehli laal line tak padho. Push se pehle generated configuration ka preview aur current configuration se difference use karo (Manager <b>Config Diff</b> dikhata hai); us diff mein jo change aapne nahi socha woh push se pehle rokna baad mein dhoondhne se sasta hai.</p>

<h4>Template-managed devices rollback karte hain</h4>
<p>Agar push aisi cheez badle jo device ko Manager se kaat de (jaise transport interface ya uska default route), to device ko is tarah design kiya gaya hai ki woh lost rehne ke bajaye timer ke baad pichhli configuration par wapas aa jaye. Timer ki length release par nirbhar hai. Intezaar ke dauran device unreachable dikh sakta hai; turant dobara push mat karo. Rollback ke baad task failed mark hota hai aur device wapas aata hai, isliye fix device nahi, template theek karna hai.</p>

<h4>Out of sync</h4>
<p>Device <b>out of sync</b> hai jab woh jo chala raha hai woh Manager ke paas uske liye rakhi cheez se alag ho. Aam wajahein: device par seedha emergency change, push jo adhura lagu hua, ya change ke dauran offline device. Dono views compare karo:</p>
<pre class="code">E-BLR-1# show sdwan running-config | include name-server
E-BLR-1# show sdwan running-config | section interface GigabitEthernet1
</pre>
<p>Phir Manager mein template preview mein wahi item dekho. Tay karo kaunsa sahi hai: agar device change emergency fix tha jo rehna chahiye to use template mein daalo; nahi to template dobara push karke overwrite karo. Out-of-sync device chhodna jaal hai: agla unrelated push difference ko sabse bure waqt wapas le aata hai.</p>

<h3>Layer 6: policy jo match nahi karti ya lagi nahi</h3>
<p>Policy ke do hisse hain: <b>definition</b> (match aur action wali sequences) aur <b>application</b> (kaunsi site list, kaunsi VPN list, kaunsi direction). "Meri policy kaam nahi karti" ke zyadatar tickets application ki galtiyan hote hain, definition ki nahi. Centralized policy Controller par <b>activate</b> hoti hai aur listed sites ke edges ko bheji jaati hai; localized policy device template ka hissa hai.</p>
<table class="cmp"><tr><th>Sawal</th><th>Check</th></tr>
<tr><td>Policy activated hai?</td><td>Manager: Configuration &gt; Policies, policy active dikhti hai; Controller par <code>show running-config policy</code> aur <code>show running-config apply-policy</code></td></tr>
<tr><td>Is site par lagi hai?</td><td><code>apply-policy</code> ki site list mein branch ka site ID hai (E-BLR-1 ke liye site 300)</td></tr>
<tr><td>Direction?</td><td>Data policy: from-service (LAN se traffic), from-tunnel (overlay se) ya all. Control policy: in ya out</td></tr>
<tr><td>Edge ke paas hai?</td><td>Edge par <code>show sdwan policy from-vsmart</code> mili hui policy list karta hai</td></tr>
<tr><td>Match ho rahi hai?</td><td><code>show sdwan policy data-policy-filter</code> aur counters; localized ACLs: <code>show sdwan policy access-list-counters</code></td></tr>
<tr><td>Lists sahi hain?</td><td>VPN list mein VPN 10 hai; prefix, application aur data-prefix lists mein expected members hain</td></tr>
<tr><td>Order matter karta hai?</td><td>Sequence numbers sabse chhote se evaluate hote hain; pehla match jeetta hai; kuch match na ho to default action lagta hai</td></tr></table>
<pre class="out">E-BLR-1# show sdwan policy from-vsmart
(koi output nahi: edge ko koi centralized policy nahi mili)

E-MUM-1# show sdwan policy data-policy-filter
data-policy-filter  DP-DIA  (trimmed)
 data-policy-vpnlist  VPN10
  counter  DIA-MATCH
   <span class="hl">packets  18422</span>
   bytes    21200113</pre>
<p>Compare karne se kahani samajh aati hai: Mumbai ko policy milti hai aur traffic ke saath counter badhta hai; Bengaluru ko kuch nahi milta. Agla dekhne ki jagah Controller par site list hai. Agar policy mili lekin counter 0 par rahe, to policy lagi hai lekin match nahi: VPN list, direction aur match fields dekho. Yaad rakho ki application matching edge ki classification par nirbhar hai, isliye asli us application ke traffic se test karo, aur data policy service side par routing decision se <b>pehle</b> lekin tunnel side par arrival ke <b>baad</b> packet dekhti hai.</p>

<h4>Policy ke side effects</h4>
<ul>
<li>Default reject wali control policy woh sab gira deti hai jo aapne nahi bataya, jo "routes gayab" jaisa dikhta hai (chapter 4).</li>
<li>Data policy jo traffic ko aisi tunnel colour mein bheje jo us site par hai hi nahi, black hole banati hai jab tak fallback set na ho.</li>
<li>Application-aware routing policy ko SLA class aur kaam karta BFD measurement chahiye; sessions ke bina woh chun nahi sakti (sdw-aar).</li>
<li>Localized ACL jo inbound ki jagah outbound, ya galat interface par lagi ho, kuch match nahi karti (sdw-qos module ka counters example).</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Nayi data policy sabhi branches mein YouTube ko internet transport par bhejti hai. Mumbai chalta hai; Bengaluru nahi. E-BLR-1 par <code>show sdwan policy from-vsmart</code> khaali hai, yaani policy kabhi pahunchi hi nahi. Controller par <code>show running-config apply-policy</code> site list BRANCHES-WEST mein sirf sites 100 aur 200 dikhata hai. Engineer site 300 jodta hai, activate karta hai, aur E-BLR-1 par <code>show sdwan policy from-vsmart</code> ab policy dikhata hai; test video counter badhata hai. Chaar checks, ek list entry.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Application galat ho tab policy definition edit karna. (2) Device rollback kar raha ho tab do baar push karna. (3) Template-managed device par local fix karke template update na karna. (4) Galat traffic ya galat VPN se policy test karna. (5) Save ke baad activate karna bhool jaana.</p></div>

<div class="exam"><p><b>Exam trap.</b> Centralized policy Manager par banti hai, Controller par activate hoti hai aur direction ke saath site lists par lagti hai; localized policy device template mein rehti hai. Saved lekin activate na hui policy kuch nahi badalti. Data policy direction: from-service, from-tunnel, all.</p></div>

<div class="scn"><h4>Template jisne branch ko lock kar diya</h4><p>Template change ne E-HYD-1 ke transport interface par naya default route set kiya jismein gateway mein typing error tha. Device ne Manager kho diya, rollback timer ka intezaar kiya aur pichhli configuration par wapas aaya; Manager ne push ko failed dikhaya. Engineer ne device ko kuch minute unreachable dekha tha aur lagbhag dobara push kar deta. Task log aur Config Diff ne galat gateway dikhaya. Template mein theek karne ke baad doosra push chala.</p><p><b>Lesson:</b> task log aur diff padho; andhadhundh do baar push mat karo.</p></div>

<div class="iv"><p class="q">"Policy activated hai lekin kaam karti nahi dikhti. Kahan dekhoge?"</p><p>Main definition ko application se alag karta hoon. Confirm karta hoon ki activated hai aur sahi site list, sahi direction aur VPN list par lagi hai, show sdwan policy from-vsmart se check karta hoon ki edge ko mili ya nahi, phir counters padhta hoon ki match kaam karta hai ya nahi. Sahi VPN se asli traffic se test karta hoon aur sequence order aur default action dekhta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Push validation, delivery ya device par fail ho sakta hai; task log batata hai kahan.</li>
<li>Push se pehle preview aur Config Diff use karo; Manager kho jaye to devices rollback karte hain.</li>
<li>Out of sync matlab device aur Manager alag; tay karo kaunsa sahi hai aur template theek karo.</li>
<li>Zyadatar policy faults application mein hote hain: site list, direction, VPN list, activation.</li>
<li>Edge checks: mili ya nahi ke liye from-vsmart, match ke liye counters.</li>
</ul></div>
`}};export{e as default};