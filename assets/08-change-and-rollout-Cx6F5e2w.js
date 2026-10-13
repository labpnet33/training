var e={id:`change-and-rollout`,h:{en:`Safe changes: pre-change checklist, rollout and saving config`,hi:`Safe changes: pre-change checklist, rollout aur config save karna`},body:{en:`
<p>A pilot does a checklist before every take-off, even after 10,000 flights. Not because she forgets how to fly, but because a missed item at 10,000 feet is expensive. Changes to network access control are the same: a wrong rule in the policy does not break one user, it can lock out a whole floor. Good engineers are not those who never make mistakes; they make changes that are <b>small, checked, reversible and proven</b>.</p>

<h3>Why access control changes are risky</h3>
<ul>
<li>Authentication is in the path of everyone: one wrong service rule hits every wired user at the next login.</li>
<li>Many effects are delayed. Enforcement runs at login, so a mistake may appear hours later when a laptop wakes up, or at Monday morning when everyone logs in together.</li>
<li>ClearPass and the switch must agree (role names, VLANs, secret, NAD address). A change on one side is a change in a contract.</li>
</ul>

<h3>The pre-change checklist</h3>
<ol>
<li><b>Describe the change</b> in one sentence and write the expected result (for example "CAM1 lands in VLAN 30, role IOT").</li>
<li><b>Name the owner and the window.</b> Who approves, when it happens, who is on call. Avoid starting a policy change at 17:45 on Friday.</li>
<li><b>Capture the current state.</b> Save the running switch configuration and read the ClearPass objects you will touch (<code>configuration service show</code>, <code>configuration enforcement policy show</code>). In production also take a ClearPass configuration backup (concept, see chapter 10).</li>
<li><b>List the dependencies.</b> NAD entries, roles on the switch, VLANs and trunk allowed lists, DHCP scope, firewall or ACL (R1 ACLs QUAR-IN and GUEST-IN in the lab).</li>
<li><b>Pick a small test target.</b> One device or one port first.</li>
<li><b>Write the proof.</b> The exact commands that will show success (status, role, VLAN, address, ping).</li>
<li><b>Write the rollback.</b> The exact commands that undo the change, in order.</li>
<li><b>Communicate.</b> Tell the helpdesk what changes and what a failure will look like.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Change lifecycle">
<rect x="10" y="30" width="110" height="60" rx="8" fill="#bae6fd"/><text x="65" y="56" text-anchor="middle" class="svg-ink" font-size="13">Plan</text><text x="65" y="74" text-anchor="middle" class="svg-muted" font-size="11">goal, proof, undo</text>
<rect x="135" y="30" width="110" height="60" rx="8" fill="#ddd6fe"/><text x="190" y="56" text-anchor="middle" class="svg-ink" font-size="13">Snapshot</text><text x="190" y="74" text-anchor="middle" class="svg-muted" font-size="11">read and save</text>
<rect x="260" y="30" width="110" height="60" rx="8" fill="#fde68a"/><text x="315" y="56" text-anchor="middle" class="svg-ink" font-size="13">Pilot</text><text x="315" y="74" text-anchor="middle" class="svg-muted" font-size="11">one device</text>
<rect x="385" y="30" width="110" height="60" rx="8" fill="#bbf7d0"/><text x="440" y="56" text-anchor="middle" class="svg-ink" font-size="13">Prove</text><text x="440" y="74" text-anchor="middle" class="svg-muted" font-size="11">role, VLAN, ping</text>
<rect x="510" y="30" width="120" height="60" rx="8" fill="#e2e8f0"/><text x="570" y="56" text-anchor="middle" class="svg-ink" font-size="13">Save + record</text><text x="570" y="74" text-anchor="middle" class="svg-muted" font-size="11">write memory</text>
<line x1="120" y1="60" x2="135" y2="60" stroke="#64748b" stroke-width="2"/><line x1="245" y1="60" x2="260" y2="60" stroke="#64748b" stroke-width="2"/><line x1="370" y1="60" x2="385" y2="60" stroke="#64748b" stroke-width="2"/><line x1="495" y1="60" x2="510" y2="60" stroke="#64748b" stroke-width="2"/>
<text x="320" y="140" text-anchor="middle" class="svg-accent" font-size="13">Failure at Prove: run the rollback, not another experiment.</text>
</svg><p class="cap">Five stages of a safe change.</p></div>

<h3>Rolling out a new device class</h3>
<p>Adding a new kind of device (the camera in the capstone) always touches the same four places, in this order of safety:</p>
<ol>
<li><b>ClearPass identity:</b> the endpoint, known, with an attribute that describes it (Category=Camera).</li>
<li><b>ClearPass policy:</b> a role mapping rule (Endpoint:Category EQUALS Camera then CAMERA) and an enforcement rule (Tips:Role EQUALS CAMERA then EP-IOT). These are additions: they do not change existing users.</li>
<li><b>Switch port:</b> enable the method on the new port only (for a camera, MAC authentication on 1/1/6).</li>
<li><b>Verify and save:</b> prove the result, then save the switch configuration.</li>
</ol>
<p>The order is deliberate: policy and identity first because they are harmless until a request arrives; the switch port last because that is when traffic starts. If you enable the port first, the device is rejected and the port sits in a failed state.</p>

<h3>After a policy change: reauthenticate</h3>
<p>Enforcement runs at login. A changed policy does not touch sessions already authorized. To apply it, bounce the port, use the Access Tracker disconnect or reauthorize, or wait for the session to end. On a production switch prefer a CoA from the Access Tracker (needs the NAD CoA port 3799 on ClearPass and <code>radius dyn-authorization</code> on the switch) over shutting ports, since a bounce drops the user.</p>

<h3>Saving: two different meanings</h3>
<ul>
<li><b>ClearPass:</b> in the real GUI you save the object (Add or Save) and the change is stored in the database and applies to new requests. There is no separate "write memory". In a cluster, configuration is made on the publisher and replicated to subscribers (concept, not simulated).</li>
<li><b>AOS-CX switch:</b> <code>show running-config</code> is the active configuration; it is lost at reload unless saved. <code>write memory</code> saves it to the startup configuration.</li>
</ul>
<pre class="code">ACCESS# write memory
ACCESS# show running-config</pre>

<div class="eg"><p><b>Worked example.</b> Change plan for the camera: Goal: CAM1 (00:50:08:41:9f:01) on 1/1/6 in VLAN 30 as IOT. Snapshot: show policy, <code>show running-config</code>. Pilot: CAM1 only. Proof: <code>show port-access clients</code> shows mac-auth Authorized IOT 30, and <code>ip dhcp</code> gives an address in 10.20.30.0/24. Rollback: <code>no aaa authentication port-access mac-auth</code> on 1/1/6 and remove the two rules. Save: <code>write memory</code>.</p></div>

<div class="warn"><p><b>Common mistake.</b> Testing in production with a catch-all rule "just for a minute". Another common one: proving the change and forgetting to save. After a power cut or reload, the switch returns to its old configuration and the camera silently disappears.</p></div>

<div class="exam"><p><b>Exam trap.</b> Running config is not startup config. A change that works but is not saved is lost at reload. And on ClearPass a policy change applies to <i>new</i> authentications only.</p></div>

<div class="scn"><h4>The unsaved fix</h4><p>An engineer fixed the trunk allowed list at night, proved it and went home. Two days later a planned power test reloaded the switch and contractors lost access again. The fix existed only in the running configuration.</p><p><b>Lesson:</b> a change is finished only when it is proven <b>and</b> saved <b>and</b> recorded.</p></div>

<div class="iv"><p class="q">"What is on your checklist before you change a production access policy?"</p><p>Goal and expected result, owner and window, a snapshot of the current state, dependencies on both sides, a small pilot target, the proof commands and the rollback. After the change, I reauthenticate the pilot device, verify role, VLAN, address and reachability, then save and document.</p></div>

<div class="kt"><p><b>Key takeaways</b></p>
<ul>
<li>Small, checked, reversible, proven: the four qualities of a safe change.</li>
<li>Snapshot before, prove after, write the rollback first.</li>
<li>Roll out new devices as identity, policy, then switch port.</li>
<li>Policy changes apply at the next login; reauthenticate or use CoA.</li>
<li><code>write memory</code> saves the switch; unsaved changes vanish at reload.</li>
</ul></div>
`,hi:`
<p>Pilot har take-off se pehle checklist karta hai, 10,000 flights ke baad bhi. Isliye nahi ki use udna bhool gaya, balki isliye ki 10,000 feet par chhooti hui ek item mehengi padti hai. Network access control ke changes bhi aise hi hain: policy mein ek galat rule ek user ko nahi todta, poori floor ko lock out kar sakta hai. Achhe engineers woh nahi jo kabhi galti nahi karte; woh aise changes karte hain jo <b>chhote, checked, reversible aur proven</b> hon.</p>

<h3>Access control changes risky kyon hain</h3>
<ul>
<li>Authentication sabke path mein hai: ek galat service rule agle login par har wired user ko hit karta hai.</li>
<li>Bahut se effects delayed hote hain. Enforcement login par chalta hai, isliye galti ghanton baad dikhti hai jab laptop wake hota hai, ya Monday subah jab sab ek saath login karte hain.</li>
<li>ClearPass aur switch ko agree karna hota hai (role names, VLANs, secret, NAD address). Ek side ka change ek contract ka change hai.</li>
</ul>

<h3>Pre-change checklist</h3>
<ol>
<li><b>Change ko ek sentence mein describe karo</b> aur expected result likho (jaise "CAM1 VLAN 30 mein jaaye, role IOT").</li>
<li><b>Owner aur window ka naam likho.</b> Kaun approve karta hai, kab hoga, on call kaun hai. Friday 17:45 par policy change shuru mat karo.</li>
<li><b>Current state capture karo.</b> Running switch configuration save karo aur jin ClearPass objects ko chhuoge unhe padho (<code>configuration service show</code>, <code>configuration enforcement policy show</code>). Production mein ClearPass configuration backup bhi lo (concept, chapter 10 dekho).</li>
<li><b>Dependencies list karo.</b> NAD entries, switch par roles, VLANs aur trunk allowed lists, DHCP scope, firewall ya ACL (lab mein R1 ke ACLs QUAR-IN aur GUEST-IN).</li>
<li><b>Chhota test target chuno.</b> Pehle ek device ya ek port.</li>
<li><b>Proof likho.</b> Woh exact commands jo success dikhayenge (status, role, VLAN, address, ping).</li>
<li><b>Rollback likho.</b> Woh exact commands jo change undo karte hain, order mein.</li>
<li><b>Communicate karo.</b> Helpdesk ko batao kya badal raha hai aur failure kaisa dikhega.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Change lifecycle">
<rect x="10" y="30" width="110" height="60" rx="8" fill="#bae6fd"/><text x="65" y="56" text-anchor="middle" class="svg-ink" font-size="13">Plan</text><text x="65" y="74" text-anchor="middle" class="svg-muted" font-size="11">goal, proof, undo</text>
<rect x="135" y="30" width="110" height="60" rx="8" fill="#ddd6fe"/><text x="190" y="56" text-anchor="middle" class="svg-ink" font-size="13">Snapshot</text><text x="190" y="74" text-anchor="middle" class="svg-muted" font-size="11">padho aur save</text>
<rect x="260" y="30" width="110" height="60" rx="8" fill="#fde68a"/><text x="315" y="56" text-anchor="middle" class="svg-ink" font-size="13">Pilot</text><text x="315" y="74" text-anchor="middle" class="svg-muted" font-size="11">ek device</text>
<rect x="385" y="30" width="110" height="60" rx="8" fill="#bbf7d0"/><text x="440" y="56" text-anchor="middle" class="svg-ink" font-size="13">Prove</text><text x="440" y="74" text-anchor="middle" class="svg-muted" font-size="11">role, VLAN, ping</text>
<rect x="510" y="30" width="120" height="60" rx="8" fill="#e2e8f0"/><text x="570" y="56" text-anchor="middle" class="svg-ink" font-size="13">Save + record</text><text x="570" y="74" text-anchor="middle" class="svg-muted" font-size="11">write memory</text>
<line x1="120" y1="60" x2="135" y2="60" stroke="#64748b" stroke-width="2"/><line x1="245" y1="60" x2="260" y2="60" stroke="#64748b" stroke-width="2"/><line x1="370" y1="60" x2="385" y2="60" stroke="#64748b" stroke-width="2"/><line x1="495" y1="60" x2="510" y2="60" stroke="#64748b" stroke-width="2"/>
<text x="320" y="140" text-anchor="middle" class="svg-accent" font-size="13">Prove par failure: rollback chalao, naya experiment nahi.</text>
</svg><p class="cap">Safe change ke paanch stages.</p></div>

<h3>Naye device class ka rollout</h3>
<p>Naya kind ka device add karna (capstone mein camera) hamesha wahi chaar jagah chhoota hai, safety ke order mein:</p>
<ol>
<li><b>ClearPass identity:</b> endpoint, known, ek attribute ke saath jo use describe kare (Category=Camera).</li>
<li><b>ClearPass policy:</b> ek role mapping rule (Endpoint:Category EQUALS Camera then CAMERA) aur ek enforcement rule (Tips:Role EQUALS CAMERA then EP-IOT). Yeh additions hain: existing users ko nahi badalte.</li>
<li><b>Switch port:</b> method sirf naye port par enable karo (camera ke liye 1/1/6 par MAC authentication).</li>
<li><b>Verify aur save:</b> result prove karo, phir switch configuration save karo.</li>
</ol>
<p>Order jaan-boojhkar hai: policy aur identity pehle kyunki jab tak request na aaye woh harmless hain; switch port aakhir mein kyunki tab traffic shuru hota hai. Agar port pehle enable karo, to device reject hota hai aur port failed state mein baith jaata hai.</p>

<h3>Policy change ke baad: reauthenticate</h3>
<p>Enforcement login par chalta hai. Badli hui policy un sessions ko nahi chhoti jo pehle se authorized hain. Ise apply karne ke liye port bounce karo, Access Tracker disconnect ya reauthorize use karo, ya session khatam hone ka intezaar karo. Production switch par ports shutdown karne se behtar Access Tracker se CoA hai (ClearPass par NAD CoA port 3799 aur switch par <code>radius dyn-authorization</code> chahiye), kyunki bounce user ko gira deta hai.</p>

<h3>Save karna: do alag matlab</h3>
<ul>
<li><b>ClearPass:</b> real GUI mein aap object save karte ho (Add ya Save) aur change database mein store hota hai aur naye requests par apply hota hai. Alag "write memory" nahi hai. Cluster mein configuration publisher par hoti hai aur subscribers par replicate hoti hai (concept, simulated nahi).</li>
<li><b>AOS-CX switch:</b> <code>show running-config</code> active configuration hai; reload par woh kho jaati hai jab tak save na ho. <code>write memory</code> use startup configuration mein save karta hai.</li>
</ul>
<pre class="code">ACCESS# write memory
ACCESS# show running-config</pre>

<div class="eg"><p><b>Worked example.</b> Camera ka change plan: Goal: CAM1 (00:50:08:41:9f:01) 1/1/6 par VLAN 30 mein IOT ke roop mein. Snapshot: policy show, <code>show running-config</code>. Pilot: sirf CAM1. Proof: <code>show port-access clients</code> mein mac-auth Authorized IOT 30, aur <code>ip dhcp</code> 10.20.30.0/24 mein address deta hai. Rollback: 1/1/6 par <code>no aaa authentication port-access mac-auth</code> aur dono rules hatao. Save: <code>write memory</code>.</p></div>

<div class="warn"><p><b>Common mistake.</b> Production mein "bas ek minute ke liye" catch-all rule se test karna. Ek aur common galti: change prove karke save karna bhool jaana. Power cut ya reload ke baad switch purani configuration par laut jaata hai aur camera chupchaap gayab ho jaata hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Running config startup config nahi hai. Jo change kaam karta hai par save nahi hua woh reload par kho jaata hai. Aur ClearPass par policy change sirf <i>naye</i> authentications par apply hota hai.</p></div>

<div class="scn"><h4>Unsaved fix</h4><p>Ek engineer ne raat ko trunk allowed list fix ki, prove ki aur ghar chala gaya. Do din baad ek planned power test ne switch reload kiya aur contractors ka access phir chala gaya. Fix sirf running configuration mein tha.</p><p><b>Lesson:</b> change tabhi poora hai jab woh proven <b>aur</b> saved <b>aur</b> recorded ho.</p></div>

<div class="iv"><p class="q">"Production access policy badalne se pehle aapki checklist mein kya hai?"</p><p>Goal aur expected result, owner aur window, current state ka snapshot, dono sides ki dependencies, chhota pilot target, proof commands aur rollback. Change ke baad pilot device reauthenticate karta hoon, role, VLAN, address aur reachability verify karta hoon, phir save aur document karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p>
<ul>
<li>Chhota, checked, reversible, proven: safe change ki chaar qualities.</li>
<li>Pehle snapshot, baad mein proof, aur rollback pehle likho.</li>
<li>Naye devices ka rollout: identity, policy, phir switch port.</li>
<li>Policy changes agle login par apply hote hain; reauthenticate ya CoA use karo.</li>
<li><code>write memory</code> switch save karta hai; unsaved changes reload par gayab.</li>
</ul></div>
`}};export{e as default};