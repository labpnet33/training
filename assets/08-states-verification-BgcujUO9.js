var e={id:`states-verification`,h:{en:`Onboarding states and how to verify them`,hi:`Onboarding states aur unhe verify kaise karein`},body:{en:`
<p>A parcel tracking page tells you where your parcel is: "picked up", "in transit", "held at customs", "delivered". You do not guess; you read the status and act on it. Device onboarding has the same kind of status, and the skill is to <b>read the state, then read the reason</b>.</p>

<h3>The states in the course model</h3>
<p>Real Versa shows device and workflow status in the Director and in the VOS CLI with its own wording. The course model uses a clear set of six states so that each one points at one layer.</p>
<table class="cmp"><tr><th>State</th><th>Meaning</th><th>Where to look next</th></tr>
<tr><td><b>Not staged</b></td><td>No staging request on the branch yet</td><td>Run the staging step on the branch</td></tr>
<tr><td><b>Staging failed</b></td><td>The staging tunnel cannot complete: Controller unreachable, Controller has no Director link, or Controller not registered in the Director</td><td>Underlay, Controller, Director link, registration</td></tr>
<tr><td><b>Rejected</b></td><td>Controller and Director are fine, but the serial is not in the Director device list</td><td>Serial in the Director versus the box</td></tr>
<tr><td><b>Staged - waiting for Director</b></td><td>Device found, but the workflow has not been deployed</td><td>Deploy the workflow</td></tr>
<tr><td><b>Post-staging failed</b></td><td>Deployed, but group, template, tenant or bind data is missing or invalid</td><td>Device detail: group, template, Missing bind data</td></tr>
<tr><td><b>Online</b></td><td>Template pushed; configuration active</td><td>Overlay: tunnels, MP-BGP, LAN reachability</td></tr></table>
<p>Note that <b>Online</b> also has a detail line. It may say a revision was pushed, or that the Director could not push a newer revision because the overlay session is down while the old revision stays active. Always read the Detail.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Onboarding state progression">
<rect x="10" y="20" width="95" height="44" rx="8" fill="#e2e8f0"/><text x="57" y="46" text-anchor="middle" class="svg-ink" font-size="12">Not staged</text>
<rect x="125" y="20" width="105" height="44" rx="8" fill="#fed7aa"/><text x="177" y="46" text-anchor="middle" class="svg-ink" font-size="12">Staging failed</text>
<rect x="250" y="20" width="85" height="44" rx="8" fill="#fed7aa"/><text x="292" y="46" text-anchor="middle" class="svg-ink" font-size="12">Rejected</text>
<rect x="355" y="20" width="125" height="44" rx="8" fill="#fde68a"/><text x="417" y="40" text-anchor="middle" class="svg-ink" font-size="12">Staged - waiting</text><text x="417" y="55" text-anchor="middle" class="svg-ink" font-size="12">for Director</text>
<rect x="500" y="20" width="130" height="44" rx="8" fill="#fed7aa"/><text x="565" y="46" text-anchor="middle" class="svg-ink" font-size="12">Post-staging failed</text>
<rect x="240" y="150" width="160" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="180" text-anchor="middle" class="svg-ink" font-size="14">Online</text>
<line x1="57" y1="64" x2="320" y2="150" stroke="#64748b" stroke-dasharray="4 4"/><line x1="177" y1="64" x2="320" y2="150" stroke="#64748b" stroke-dasharray="4 4"/><line x1="292" y1="64" x2="320" y2="150" stroke="#64748b" stroke-dasharray="4 4"/><line x1="417" y1="64" x2="340" y2="150" stroke="#64748b" stroke-dasharray="4 4"/><line x1="565" y1="64" x2="380" y2="150" stroke="#64748b" stroke-dasharray="4 4"/>
<text x="320" y="108" text-anchor="middle" class="svg-muted" font-size="12">each fixed layer moves the device one step closer</text>
</svg><p class="cap">Orange states are failures, yellow is waiting; each fix moves the device toward Online.</p></div>

<h3>Verification command 1: on the branch</h3>
<pre class="out">admin@Branch3-cli&gt; show system staging status
Serial: VOS-BR3-0001
Controller: 198.51.100.20
<span class="hl">State: Online</span>
Detail: Template BR-DUAL pushed (revision 1)</pre>
<p>Four lines: serial, controller, <b>state</b>, <b>detail</b>. The Detail is the reason text; it is your first clue when the state is a failure.</p>

<h3>Verification command 2: on the Director</h3>
<pre class="out">admin@Director-1-cli&gt; show devices brief
Device      Serial        Group         Deployed  Onboarding                    Overlay
Branch1     VOS-BR1-0001  BRANCHES      yes (r1)  Online                        Established
Branch2     VOS-BR2-0001  BRANCHES      yes (r1)  Online                        Established
<span class="hl">Branch3     VOS-BR3-0001  BRANCHES      yes (r1)  Online                        Established</span></pre>
<p>This is the fleet view: every device with serial, group, whether a workflow is deployed (and which revision), the onboarding state and the overlay status. Use it to compare the branch's own opinion with the Director's.</p>

<h3>Verification command 3: the overlay</h3>
<pre class="out">admin@Branch3-cli&gt; show orgs org Acme sd-wan brief
Org: Acme   Site-ID: 103   Hostname: Branch3
Controller: 198.51.100.20   Overlay (MP-BGP): <span class="hl">Established</span>
Transport  Interface  Tunnel  Reason
Internet   vni-0/0    up      -
MPLS       vni-0/1    up      -</pre>
<p>Online only says the template arrived. <b>Established</b> with tunnels up says the branch is really part of the SD-WAN. The two checks answer different questions. Later you can also test LAN reachability from a PC (for example PC3 pinging 10.1.1.10 in Delhi).</p>

<div class="eg"><p><b>Worked example.</b> After deploy the Director says Online but the branch overlay shows Idle and no tunnels. The state machine passed (the template was pushed), so look beyond onboarding: probably the push brought an address or gateway that does not match the circuit, so the tunnel cannot form. That is a data-quality problem, not an onboarding problem; the fix is a bind-data correction and a redeploy.</p></div>

<div class="warn"><p><b>Common mistakes:</b> looking only at the state name and ignoring the Detail line; declaring success at Online without checking tunnels; comparing branch status with a stale Director view after a change.</p></div>
<div class="exam"><p><b>Exam trap:</b> do not memorise the states as one linear list. Think layers: staging layer, identity, workflow, post-staging data, then service. Each failure lives in exactly one layer.</p></div>

<div class="scn"><h4>Green in the Director, red in the field</h4><p>A support engineer saw a branch Online in the Director dashboard and closed the ticket. The store manager said the cash terminals could not reach HQ. The engineer ran the overlay brief on the branch: one tunnel up, MP-BGP Idle because of a wrong controller line in a local change. Fixing the config restored the session.</p><p><b>Lesson:</b> onboarding state and overlay health are separate checks. Do both.</p></div>

<div class="iv"><p class="q">"A device shows Online. Is the job done?"</p><p>No. Online means the Director pushed the template. I confirm that the transport tunnels are up, the MP-BGP session is Established, the LAN prefix is learned by other sites, and an end-to-end ping works.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>States map to layers: staging, serial, workflow, post-staging data, service.</li>
<li><code>show system staging status</code> gives serial, controller, state and detail on the branch.</li>
<li><code>show devices brief</code> is the Director fleet view.</li>
<li><code>show orgs org Acme sd-wan brief</code> proves the overlay after Online.</li>
<li>Always read the Detail line.</li>
</ul></div>
`,hi:`
<p>Parcel tracking page batata hai ki parcel kahan hai: "picked up", "in transit", "held at customs", "delivered". Aap andaza nahi lagate; status padhte ho aur uske hisaab se action lete ho. Device onboarding ka bhi aisa hi status hota hai, aur skill ye hai ki <b>state padho, phir reason padho</b>.</p>

<h3>Course model ke states</h3>
<p>Real Versa device aur workflow status Director aur VOS CLI mein apni wording se dikhata hai. Course model saaf set of chhe states use karta hai taaki har state ek layer ko point kare.</p>
<table class="cmp"><tr><th>State</th><th>Matlab</th><th>Aage kahan dekhein</th></tr>
<tr><td><b>Not staged</b></td><td>Branch par abhi koi staging request nahi</td><td>Branch par staging step chalao</td></tr>
<tr><td><b>Staging failed</b></td><td>Staging tunnel complete nahi ho sakta: Controller unreachable, Controller ka Director link nahi, ya Controller Director mein registered nahi</td><td>Underlay, Controller, Director link, registration</td></tr>
<tr><td><b>Rejected</b></td><td>Controller aur Director theek hain, lekin serial Director device list mein nahi</td><td>Director mein serial vs box ka serial</td></tr>
<tr><td><b>Staged - waiting for Director</b></td><td>Device mil gaya, lekin workflow deploy nahi hua</td><td>Workflow deploy karo</td></tr>
<tr><td><b>Post-staging failed</b></td><td>Deploy ho gaya, lekin group, template, tenant ya bind data missing ya invalid</td><td>Device detail: group, template, Missing bind data</td></tr>
<tr><td><b>Online</b></td><td>Template push ho gaya; configuration active</td><td>Overlay: tunnels, MP-BGP, LAN reachability</td></tr></table>
<p>Dhyan do ki <b>Online</b> ki bhi ek detail line hoti hai. Usme revision push hua ya Director naya revision push nahi kar paya kyunki overlay session down hai aur purana revision active hai, aisa likha ho sakta hai. Detail hamesha padho.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Onboarding state progression">
<rect x="10" y="20" width="95" height="44" rx="8" fill="#e2e8f0"/><text x="57" y="46" text-anchor="middle" class="svg-ink" font-size="12">Not staged</text>
<rect x="125" y="20" width="105" height="44" rx="8" fill="#fed7aa"/><text x="177" y="46" text-anchor="middle" class="svg-ink" font-size="12">Staging failed</text>
<rect x="250" y="20" width="85" height="44" rx="8" fill="#fed7aa"/><text x="292" y="46" text-anchor="middle" class="svg-ink" font-size="12">Rejected</text>
<rect x="355" y="20" width="125" height="44" rx="8" fill="#fde68a"/><text x="417" y="40" text-anchor="middle" class="svg-ink" font-size="12">Staged - waiting</text><text x="417" y="55" text-anchor="middle" class="svg-ink" font-size="12">for Director</text>
<rect x="500" y="20" width="130" height="44" rx="8" fill="#fed7aa"/><text x="565" y="46" text-anchor="middle" class="svg-ink" font-size="12">Post-staging failed</text>
<rect x="240" y="150" width="160" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="180" text-anchor="middle" class="svg-ink" font-size="14">Online</text>
<line x1="57" y1="64" x2="320" y2="150" stroke="#64748b" stroke-dasharray="4 4"/><line x1="177" y1="64" x2="320" y2="150" stroke="#64748b" stroke-dasharray="4 4"/><line x1="292" y1="64" x2="320" y2="150" stroke="#64748b" stroke-dasharray="4 4"/><line x1="417" y1="64" x2="340" y2="150" stroke="#64748b" stroke-dasharray="4 4"/><line x1="565" y1="64" x2="380" y2="150" stroke="#64748b" stroke-dasharray="4 4"/>
<text x="320" y="108" text-anchor="middle" class="svg-muted" font-size="12">har fix ki hui layer device ko Online ke ek step paas laati hai</text>
</svg><p class="cap">Orange states failures hain, yellow waiting; har fix device ko Online ki taraf le jata hai.</p></div>

<h3>Verification command 1: branch par</h3>
<pre class="out">admin@Branch3-cli&gt; show system staging status
Serial: VOS-BR3-0001
Controller: 198.51.100.20
<span class="hl">State: Online</span>
Detail: Template BR-DUAL pushed (revision 1)</pre>
<p>Chaar lines: serial, controller, <b>state</b>, <b>detail</b>. Detail reason text hai; state failure ho to ye aapka pehla clue hai.</p>

<h3>Verification command 2: Director par</h3>
<pre class="out">admin@Director-1-cli&gt; show devices brief
Device      Serial        Group         Deployed  Onboarding                    Overlay
Branch1     VOS-BR1-0001  BRANCHES      yes (r1)  Online                        Established
Branch2     VOS-BR2-0001  BRANCHES      yes (r1)  Online                        Established
<span class="hl">Branch3     VOS-BR3-0001  BRANCHES      yes (r1)  Online                        Established</span></pre>
<p>Ye fleet view hai: har device serial, group, workflow deployed hai ya nahi (aur kaunsa revision), onboarding state aur overlay status ke saath. Branch ki apni raay ko Director ki raay se compare karne ke liye ise use karo.</p>

<h3>Verification command 3: overlay</h3>
<pre class="out">admin@Branch3-cli&gt; show orgs org Acme sd-wan brief
Org: Acme   Site-ID: 103   Hostname: Branch3
Controller: 198.51.100.20   Overlay (MP-BGP): <span class="hl">Established</span>
Transport  Interface  Tunnel  Reason
Internet   vni-0/0    up      -
MPLS       vni-0/1    up      -</pre>
<p>Online sirf itna kehta hai ki template aa gaya. <b>Established</b> aur tunnels up kehte hain ki branch sach mein SD-WAN ka hissa hai. Dono checks alag sawaal ka jawab dete hain. Baad mein PC se LAN reachability bhi test kar sakte ho (jaise PC3 se Delhi ka 10.1.1.10 ping).</p>

<div class="eg"><p><b>Worked example.</b> Deploy ke baad Director Online kehta hai lekin branch overlay Idle hai aur koi tunnel nahi. State machine pass ho gayi (template push hua), isliye onboarding se aage dekho: shayad push ke saath aisa address ya gateway aaya jo circuit se match nahi karta, isliye tunnel nahi ban sakta. Ye data-quality problem hai, onboarding problem nahi; fix bind-data correction aur redeploy hai.</p></div>

<div class="warn"><p><b>Common mistakes:</b> sirf state name dekhna aur Detail line ignore karna; Online par success declare kar dena bina tunnels check kiye; change ke baad branch status ko Director ke stale view se compare karna.</p></div>
<div class="exam"><p><b>Exam trap:</b> states ko ek linear list ki tarah ratto mat. Layers socho: staging layer, identity, workflow, post-staging data, phir service. Har failure exactly ek layer mein rehta hai.</p></div>

<div class="scn"><h4>Director mein green, field mein red</h4><p>Support engineer ne Director dashboard mein branch ko Online dekha aur ticket close kar diya. Store manager ne kaha ki cash terminals HQ tak nahi pahunch rahe. Engineer ne branch par overlay brief chalaya: ek tunnel up, MP-BGP Idle kyunki ek local change mein galat controller line thi. Config theek karne se session wapas aaya.</p><p><b>Lesson:</b> onboarding state aur overlay health alag checks hain. Dono karo.</p></div>

<div class="iv"><p class="q">"Device Online dikha raha hai. Kya kaam khatam?"</p><p>Nahi. Online ka matlab Director ne template push kiya. Main confirm karta hoon ki transport tunnels up hain, MP-BGP session Established hai, LAN prefix doosri sites ne seekha hai, aur end-to-end ping chalta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>States layers se map hote hain: staging, serial, workflow, post-staging data, service.</li>
<li><code>show system staging status</code> branch par serial, controller, state aur detail deta hai.</li>
<li><code>show devices brief</code> Director ka fleet view hai.</li>
<li><code>show orgs org Acme sd-wan brief</code> Online ke baad overlay prove karta hai.</li>
<li>Detail line hamesha padho.</li>
</ul></div>
`}};export{e as default};