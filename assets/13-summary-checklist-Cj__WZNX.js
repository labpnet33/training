var e={id:`summary-checklist`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You started with a simple idea: the control room needs a twin. You now know how the pair is built, how it elects, what it copies, how firewalls follow it, how to hand over and how to fix a pair that will not form. Use this page as your last review before the labs and any interview.</p>

<h3>Checklist: can you do these?</h3>
<ul>
<li>Explain what is lost (change, push, central visibility) and what keeps working (traffic enforcement) when Panorama is down.</li>
<li>Configure each side of a pair: enabled, peer is the other's management IP, one primary and one secondary, preemption on the primary.</li>
<li>Name the six states and say what each means.</li>
<li>State the lab rule: everything except deviceconfig is synchronized, active to passive, at formation and on every commit.</li>
<li>Add panorama-server-2 through the template, commit, and push the stack.</li>
<li>Suspend and resume a peer, and say why commit and push happen only on the active one.</li>
<li>Verify after failover: states, synchronization, firewall status, devices connected, an accepted push, logs.</li>
<li>Troubleshoot a pair that will not form by reading both peers' outputs.</li>
<li>Explain why HA is not a backup and what you would back up.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Active / passive</dt><dd>The current working state of a peer.</dd>
<dt>Primary / secondary</dt><dd>The configured priority label.</dd>
<dt>Preemption</dt><dd>The primary taking the active role back when it becomes functional.</dd>
<dt>Suspended</dt><dd>Administratively removed from the pair.</dd>
<dt>Non-functional</dt><dd>The election cannot work, for example both have the same priority.</dd>
<dt>Split-brain</dt><dd>Both peers believe they are active.</dd>
<dt>Device-local</dt><dd>Settings under deviceconfig that are not synchronized.</dd>
<dt>panorama-server-2</dt><dd>The firewall setting for the second Panorama.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="tbl">
<tr><th>Topic</th><th>Remember</th></tr>
<tr><td>Panorama down</td><td>Traffic still enforced; change, push, visibility lost</td></tr>
<tr><td>Peer address</td><td>Each side points at the OTHER management IP</td></tr>
<tr><td>Priorities</td><td>Must differ; same priority gives non-functional</td></tr>
<tr><td>Synchronization</td><td>Everything but deviceconfig, from active</td></tr>
<tr><td>Commit-all</td><td>Only on the active peer</td></tr>
<tr><td>Firewall with one server</td><td>Loses management when the primary is not active</td></tr>
<tr><td>Preemption</td><td>On the primary returns the active role</td></tr>
<tr><td>Details by version</td><td>Check the documentation for your PAN-OS version</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Review flow">
<rect x="10" y="30" width="110" height="60" rx="8" fill="#bae6fd"/><text x="65" y="65" text-anchor="middle" class="svg-ink" font-size="12">Plan</text>
<rect x="135" y="30" width="110" height="60" rx="8" fill="#ddd6fe"/><text x="190" y="65" text-anchor="middle" class="svg-ink" font-size="12">Build</text>
<rect x="260" y="30" width="110" height="60" rx="8" fill="#bbf7d0"/><text x="315" y="65" text-anchor="middle" class="svg-ink" font-size="12">Teach firewalls</text>
<rect x="385" y="30" width="110" height="60" rx="8" fill="#fde68a"/><text x="440" y="65" text-anchor="middle" class="svg-ink" font-size="12">Test failover</text>
<rect x="510" y="30" width="120" height="60" rx="8" fill="#e2e8f0"/><text x="570" y="65" text-anchor="middle" class="svg-ink" font-size="12">Back up</text>
</svg><p class="cap">The lifecycle of a Panorama pair in five steps.</p></div>

<div class="exam"><p>Typical trap questions: "Both Panoramas are primary, which is active?" (neither can be elected properly); "Where do you commit shared policy?" (the active peer); "What does the firewall need for failover?" (the second server entry).</p></div>

<div class="scn"><h4>The interview whiteboard</h4><p>A candidate was asked to draw a two-Panorama design. She drew the pair, the management network, the second server on every firewall and a separate box labelled "export, off-site". The interviewer said that last box was what many candidates forget.</p><p><b>Lesson:</b> complete designs include availability and recovery.</p></div>

<div class="iv"><p class="q">"Summarise Panorama HA in one minute."</p><p>Two Panoramas, one active and one passive, paired by each pointing at the other with different priorities. The active one synchronizes everything except device-local settings. Firewalls know both servers and follow the active one. Maintenance uses suspend and functional, changes happen on the active peer, and I verify state, sync and push afterwards. HA does not replace backups.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>HA keeps change and visibility alive; firewalls enforce either way.</li>
<li>Priority is configured, state is elected.</li>
<li>Firewalls need both servers; push only from the active peer.</li>
<li>Verify with outputs, back up separately, and check version details in the documentation.</li>
</ul></div>
`,hi:`
<p>Aapne ek simple idea se shuru kiya tha: control room ko ek twin chahiye. Ab aap jaante ho pair kaise banta hai, election kaise hota hai, kya copy hota hai, firewalls use kaise follow karte hain, handover kaise karte hain aur na banne wale pair ko kaise fix karte hain. Labs aur kisi bhi interview se pehle is page ko last review ki tarah use karo.</p>

<h3>Checklist: kya aap yeh kar sakte ho?</h3>
<ul>
<li>Samjhao Panorama down hone par kya jaata hai (change, push, central visibility) aur kya chalta rehta hai (traffic enforcement).</li>
<li>Pair ki har side configure karo: enabled, peer doosre ka management IP, ek primary aur ek secondary, primary par preemption.</li>
<li>Chhe states ke naam aur matlab batao.</li>
<li>Lab rule batao: deviceconfig ke alawa sab synchronize, active se passive, formation par aur har commit par.</li>
<li>Template se panorama-server-2 jodo, commit karo aur stack push karo.</li>
<li>Peer ko suspend aur resume karo, aur batao commit aur push sirf active par kyun.</li>
<li>Failover ke baad verify karo: states, synchronization, firewall status, devices connected, accepted push, logs.</li>
<li>Na banne wale pair ko dono peers ke outputs padhkar troubleshoot karo.</li>
<li>Samjhao HA backup kyun nahi hai aur aap kya backup loge.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Active / passive</dt><dd>Peer ki current working state.</dd>
<dt>Primary / secondary</dt><dd>Configured priority label.</dd>
<dt>Preemption</dt><dd>Primary ka functional hone par active role wapas lena.</dd>
<dt>Suspended</dt><dd>Administratively pair se hataya hua.</dd>
<dt>Non-functional</dt><dd>Election kaam nahi kar sakta, jaise dono ki same priority.</dd>
<dt>Split-brain</dt><dd>Dono peers maante hain ki woh active hain.</dd>
<dt>Device-local</dt><dd>deviceconfig ke neeche ki settings jo synchronize nahi hoti.</dd>
<dt>panorama-server-2</dt><dd>Doosre Panorama ke liye firewall setting.</dd>
</dl>

<h3>Sabse zyada pooche jaane wale facts</h3>
<table class="tbl">
<tr><th>Topic</th><th>Yaad rakho</th></tr>
<tr><td>Panorama down</td><td>Traffic enforce hota rehta hai; change, push, visibility lost</td></tr>
<tr><td>Peer address</td><td>Har side DOOSRE management IP ko point karti hai</td></tr>
<tr><td>Priorities</td><td>Alag honi chahiye; same priority se non-functional</td></tr>
<tr><td>Synchronization</td><td>deviceconfig ke alawa sab, active se</td></tr>
<tr><td>Commit-all</td><td>Sirf active peer par</td></tr>
<tr><td>Ek server wala firewall</td><td>Primary active na ho to management kho deta hai</td></tr>
<tr><td>Preemption</td><td>Primary par active role wapas deta hai</td></tr>
<tr><td>Version details</td><td>Apne PAN-OS version ki documentation check karo</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Review flow">
<rect x="10" y="30" width="110" height="60" rx="8" fill="#bae6fd"/><text x="65" y="65" text-anchor="middle" class="svg-ink" font-size="12">Plan</text>
<rect x="135" y="30" width="110" height="60" rx="8" fill="#ddd6fe"/><text x="190" y="65" text-anchor="middle" class="svg-ink" font-size="12">Build</text>
<rect x="260" y="30" width="110" height="60" rx="8" fill="#bbf7d0"/><text x="315" y="65" text-anchor="middle" class="svg-ink" font-size="12">Firewalls sikhao</text>
<rect x="385" y="30" width="110" height="60" rx="8" fill="#fde68a"/><text x="440" y="65" text-anchor="middle" class="svg-ink" font-size="12">Failover test</text>
<rect x="510" y="30" width="120" height="60" rx="8" fill="#e2e8f0"/><text x="570" y="65" text-anchor="middle" class="svg-ink" font-size="12">Backup</text>
</svg><p class="cap">Panorama pair ka lifecycle paanch steps mein.</p></div>

<div class="exam"><p>Typical trap questions: "Dono Panorama primary hain, kaun active?" (kisi ka bhi sahi election nahi hota); "Shared policy kahan commit karte ho?" (active peer par); "Failover ke liye firewall ko kya chahiye?" (doosre server ki entry).</p></div>

<div class="scn"><h4>Interview whiteboard</h4><p>Ek candidate se do-Panorama design draw karne ko kaha gaya. Usne pair, management network, har firewall par doosra server aur ek alag box "export, off-site" draw kiya. Interviewer ne kaha ki woh last box woh hai jo kai candidates bhool jaate hain.</p><p><b>Lesson:</b> complete designs mein availability aur recovery dono hote hain.</p></div>

<div class="iv"><p class="q">"Panorama HA ko ek minute mein summarise karo."</p><p>Do Panorama, ek active ek passive, har ek doosre ko point karta hai alag priorities ke saath. Active device-local settings ke alawa sab synchronize karta hai. Firewalls dono servers ko jaante hain aur active ko follow karte hain. Maintenance suspend aur functional se, changes active peer par, aur baad mein state, sync aur push verify karta hoon. HA backups ka replacement nahi hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>HA change aur visibility zinda rakhta hai; firewalls dono taraf enforce karte hain.</li>
<li>Priority configured hai, state elected hai.</li>
<li>Firewalls ko dono servers chahiye; push sirf active peer se.</li>
<li>Outputs se verify karo, alag se backup lo, aur version details documentation mein check karo.</li>
</ul></div>
`}};export{e as default};