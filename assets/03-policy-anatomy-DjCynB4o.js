var e={id:`policy-anatomy`,h:{en:`Anatomy of a security policy`,hi:`Security policy ki anatomy`},body:{en:`<p><b>Analogy.</b> A policy is a sentence: "<i>From the office, to the server room, these people may use these services: yes (and keep a tally)</i>". Every policy has a direction, a description of the traffic, and an action.</p>
<h3>The parts</h3>
<ol><li><b>Direction:</b> <code>from-zone</code> and <code>to-zone</code>. A policy from trust to dmz says nothing about dmz to trust.</li><li><b>Name:</b> any word you choose; it is the handle you will see in logs and hit counts.</li><li><b>Match:</b> <code>source-address</code>, <code>destination-address</code> and <code>application</code>. All three must match for the policy to apply.</li><li><b>Action (then):</b> <code>permit</code>, <code>deny</code> or <code>reject</code>.</li><li><b>Options:</b> <code>count</code> (statistics), <code>log session-init</code> and <code>log session-close</code> (logging), and <code>permit tunnel</code> (VPN, later module).</li></ol>
<pre class="code">set security policies from-zone trust to-zone dmz policy WEB-ONLY match source-address any
set security policies from-zone trust to-zone dmz policy WEB-ONLY match destination-address WEB-SRV
set security policies from-zone trust to-zone dmz policy WEB-ONLY match application junos-h&#116;tp
set security policies from-zone trust to-zone dmz policy WEB-ONLY match application junos-h&#116;tps
set security policies from-zone trust to-zone dmz policy WEB-ONLY then permit
set security policies from-zone trust to-zone dmz policy WEB-ONLY then count
set security policies from-zone trust to-zone dmz policy WEB-ONLY then log session-init</pre>
<pre class="out">user@BRANCH-SRX&gt; show security policies
Default policy: deny-all
From zone: trust, To zone: dmz
  Policy: WEB-ONLY, State: enabled, Index: 5, Scope Policy: 0, Sequence number: 1
    Source addresses: any
    Destination addresses: WEB-SRV
    Applications: junos-h&#116;tp, junos-h&#116;tps
    <span class="hl">Action: permit, count, log</span></pre>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="The three match fields and the action"><rect x="10" y="40" width="130" height="50" rx="8" fill="#bae6fd"/><text x="75" y="70" text-anchor="middle" class="svg-ink" font-size="13">source-address</text><rect x="160" y="40" width="150" height="50" rx="8" fill="#bae6fd"/><text x="235" y="70" text-anchor="middle" class="svg-ink" font-size="13">destination-address</text><rect x="330" y="40" width="130" height="50" rx="8" fill="#bae6fd"/><text x="395" y="70" text-anchor="middle" class="svg-ink" font-size="13">application</text><rect x="500" y="40" width="130" height="50" rx="8" fill="#bbf7d0"/><text x="565" y="70" text-anchor="middle" class="svg-ink" font-size="13">permit / deny</text><path d="M140 65H160M310 65H330M460 65H500" stroke="#64748b" stroke-width="2"/></svg><p class="cap">All three match fields must agree before the action runs.</p></div>
<div class="eg"><p><b>Worked example.</b> A flow from 192.168.10.10 to 172.16.20.20 on TCP 443 matches WEB-ONLY (source any, destination WEB-SRV, https): permit. A flow to the same server on TCP 22 does not match the application, falls through every policy and meets the default deny.</p></div>
<div class="warn"><p><b>Common mistake.</b> Writing a policy without a <code>then</code> action, or with two actions. The commit is rejected. Also: forgetting <code>count</code>, then having no hit count when you need to prove the rule works.</p></div>
<div class="exam"><p><b>Exam trap.</b> A policy applies to one direction only. A <code>deny</code> drops silently, a <code>reject</code> answers the sender (see the chapter on deny versus reject). The policy does <i>not</i> match on the interface, only on the zones.</p></div>
<div class="scn"><h4>The policy that mentioned the wrong direction</h4><p>An engineer wrote the web policy from dmz to trust. Users still could not browse. The flow starts in trust, so the policy must be from trust to dmz. Swapping the two zone names fixed it.</p><p><b>Lesson:</b> name the zone where the first packet comes <i>from</i>.</p></div>
<div class="iv"><p class="q">"What does a security policy match on?"</p><p>The from-zone and to-zone, then source address, destination address and application. If all match, the action runs: permit, deny or reject, with optional count and logging. The first matching policy wins.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Direction = from-zone and to-zone.</li><li>Match = source, destination and application.</li><li>Action = permit, deny or reject; add count and log.</li><li>One direction per policy.</li></ul></div>`,hi:`<p><b>Analogy.</b> Policy ek vaakya hai: "<i>Office se server room tak, yeh log yeh services use kar sakte hain: haan (aur ginti rakho)</i>". Har policy mein ek direction, traffic ka description aur ek action hota hai.</p>
<h3>Hisse</h3>
<ol><li><b>Direction:</b> <code>from-zone</code> aur <code>to-zone</code>. trust se dmz ki policy dmz se trust ke baare mein kuch nahi kehti.</li><li><b>Name:</b> koi bhi shabd jo aap chuno; logs aur hit counts mein yahi handle dikhta hai.</li><li><b>Match:</b> <code>source-address</code>, <code>destination-address</code> aur <code>application</code>. Policy lagne ke liye teeno match hone chahiye.</li><li><b>Action (then):</b> <code>permit</code>, <code>deny</code> ya <code>reject</code>.</li><li><b>Options:</b> <code>count</code> (statistics), <code>log session-init</code> aur <code>log session-close</code> (logging), aur <code>permit tunnel</code> (VPN, baad ka module).</li></ol>
<pre class="code">set security policies from-zone trust to-zone dmz policy WEB-ONLY match source-address any
set security policies from-zone trust to-zone dmz policy WEB-ONLY match destination-address WEB-SRV
set security policies from-zone trust to-zone dmz policy WEB-ONLY match application junos-h&#116;tp
set security policies from-zone trust to-zone dmz policy WEB-ONLY match application junos-h&#116;tps
set security policies from-zone trust to-zone dmz policy WEB-ONLY then permit
set security policies from-zone trust to-zone dmz policy WEB-ONLY then count
set security policies from-zone trust to-zone dmz policy WEB-ONLY then log session-init</pre>
<pre class="out">user@BRANCH-SRX&gt; show security policies
Default policy: deny-all
From zone: trust, To zone: dmz
  Policy: WEB-ONLY, State: enabled, Index: 5, Scope Policy: 0, Sequence number: 1
    Source addresses: any
    Destination addresses: WEB-SRV
    Applications: junos-h&#116;tp, junos-h&#116;tps
    <span class="hl">Action: permit, count, log</span></pre>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Teen match fields aur action"><rect x="10" y="40" width="130" height="50" rx="8" fill="#bae6fd"/><text x="75" y="70" text-anchor="middle" class="svg-ink" font-size="13">source-address</text><rect x="160" y="40" width="150" height="50" rx="8" fill="#bae6fd"/><text x="235" y="70" text-anchor="middle" class="svg-ink" font-size="13">destination-address</text><rect x="330" y="40" width="130" height="50" rx="8" fill="#bae6fd"/><text x="395" y="70" text-anchor="middle" class="svg-ink" font-size="13">application</text><rect x="500" y="40" width="130" height="50" rx="8" fill="#bbf7d0"/><text x="565" y="70" text-anchor="middle" class="svg-ink" font-size="13">permit / deny</text><path d="M140 65H160M310 65H330M460 65H500" stroke="#64748b" stroke-width="2"/></svg><p class="cap">Action chalne se pehle teeno match fields ka agree hona zaroori hai.</p></div>
<div class="eg"><p><b>Worked example.</b> 192.168.10.10 se 172.16.20.20 ka TCP 443 flow WEB-ONLY se match karta hai (source any, destination WEB-SRV, https): permit. Usi server ka TCP 22 flow application se match nahi karta, har policy se guzarta hai aur default deny se milta hai.</p></div>
<div class="warn"><p><b>Common mistake.</b> Bina <code>then</code> action ya do actions ke policy likhna. Commit reject hota hai. Aur: <code>count</code> bhool jana, phir jab saabit karna ho ki rule kaam karta hai to hit count nahi milta.</p></div>
<div class="exam"><p><b>Exam trap.</b> Policy sirf ek direction par lagti hai. <code>deny</code> chupchap drop karta hai, <code>reject</code> sender ko jawab deta hai (deny versus reject wala chapter dekho). Policy interface par match <i>nahi</i> karti, sirf zones par.</p></div>
<div class="scn"><h4>Galat direction wali policy</h4><p>Ek engineer ne web policy dmz se trust ki likhi. Users phir bhi browse nahi kar paye. Flow trust se shuru hota hai, isliye policy trust se dmz ki honi chahiye. Do zone naam badalne se theek ho gaya.</p><p><b>Lesson:</b> us zone ka naam likho jahan se pehla packet <i>aata</i> hai.</p></div>
<div class="iv"><p class="q">"Security policy kis par match karti hai?"</p><p>from-zone aur to-zone par, phir source address, destination address aur application par. Sab match ho to action chalta hai: permit, deny ya reject, optional count aur logging ke saath. Pehli matching policy jeet-ti hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Direction = from-zone aur to-zone.</li><li>Match = source, destination aur application.</li><li>Action = permit, deny ya reject; count aur log jodo.</li><li>Ek policy, ek direction.</li></ul></div>`}};export{e as default};