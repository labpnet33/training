var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow and the Kolkata ticket`,hi:`Troubleshooting workflow aur Kolkata ticket`},body:{en:`
<p>When a lift stops between floors, a good technician does not start kicking the door. They follow a routine: read the display, check power, check the door sensor, check the controller. Onboarding troubleshooting is the same: a short, fixed routine that moves from the outside in, and one fix at a time.</p>

<h3>The five-step workflow</h3>
<ol>
<li><b>Read the branch status.</b> <code>show system staging status</code>: state and detail.</li>
<li><b>Read the Director's view.</b> <code>show devices brief</code> (fleet) and <code>show devices device &lt;name&gt;</code> (one device).</li>
<li><b>Name the layer</b> from the state (chapter 8) and decide the owner: branch, Controller or Director.</li>
<li><b>Fix one thing</b> in the owning component, commit.</li>
<li><b>Re-read the status</b> and repeat until Online, then verify the overlay.</li>
</ol>
<p>Two principles: <b>evidence from both ends</b> (the branch and the Director may disagree), and <b>there may be more than one fault</b>. After you fix one, the state moves to the next layer, and the next fault appears.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Troubleshooting loop">
<rect x="10" y="40" width="110" height="60" rx="8" fill="#bae6fd"/><text x="65" y="66" text-anchor="middle" class="svg-ink" font-size="13">1 Read</text><text x="65" y="84" text-anchor="middle" class="svg-muted" font-size="12">branch status</text>
<rect x="140" y="40" width="110" height="60" rx="8" fill="#bae6fd"/><text x="195" y="66" text-anchor="middle" class="svg-ink" font-size="13">2 Read</text><text x="195" y="84" text-anchor="middle" class="svg-muted" font-size="12">Director view</text>
<rect x="270" y="40" width="110" height="60" rx="8" fill="#ddd6fe"/><text x="325" y="66" text-anchor="middle" class="svg-ink" font-size="13">3 Name</text><text x="325" y="84" text-anchor="middle" class="svg-muted" font-size="12">layer + owner</text>
<rect x="400" y="40" width="110" height="60" rx="8" fill="#fde68a"/><text x="455" y="66" text-anchor="middle" class="svg-ink" font-size="13">4 Fix one</text><text x="455" y="84" text-anchor="middle" class="svg-muted" font-size="12">thing, commit</text>
<rect x="530" y="40" width="100" height="60" rx="8" fill="#bbf7d0"/><text x="580" y="66" text-anchor="middle" class="svg-ink" font-size="13">5 Re-read</text><text x="580" y="84" text-anchor="middle" class="svg-muted" font-size="12">status</text>
<path d="M580 100 L580 140 L65 140 L65 100" fill="none" stroke="#64748b" stroke-width="2"/><polygon points="59,108 65,98 71,108" fill="#64748b"/>
<text x="320" y="160" text-anchor="middle" class="svg-muted" font-size="12">repeat until Online</text>
</svg><p class="cap">Read, name, fix one thing, re-read.</p></div>

<h3>Lab walkthrough: vs-onboard-ticket</h3>
<p><b>Ticket:</b> the Kolkata engineer started staging and the Director workflow was deployed, but Branch3 never goes Online. The lab says there are two separate faults on two layers. Follow the workflow.</p>

<h4>Step 1 and 2: evidence from both ends</h4>
<pre class="out">admin@Branch3-cli&gt; show system staging status
Serial: VOS-BR3-0001
Controller: 198.51.100.20
<span class="hl">State: Rejected</span>
Detail: Serial VOS-BR3-0001 is not in the Director device list (bind data / serial number mismatch)

admin@Director-1-cli&gt; show devices brief
Device      Serial        Group         Deployed  Onboarding                    Overlay
Branch1     VOS-BR1-0001  BRANCHES      yes (r1)  Online                        Established
Branch2     VOS-BR2-0001  BRANCHES      yes (r1)  Online                        Established
<span class="hl">Branch3     VOS-BR3-0O01  BRANCHES      yes (r1)  Not staged                    -</span></pre>
<p>Read it carefully. The branch says Rejected: the Controller and Director links passed (otherwise it would say Staging failed). The Director lists Branch3 with serial <code>VOS-BR3-0O01</code>: look at the last block, it has a <b>letter O</b>, not a zero. Because no staged branch has that serial, the Director shows Not staged for the row. Branch1 and Branch2 are Online and healthy, so the headend is fine.</p>

<h4>Step 3 and 4: layer is identity; owner is the Director</h4>
<pre class="code">admin@Director-1-cli&gt; configure
admin@Director-1-cli% set director devices Branch3 serial VOS-BR3-0001
admin@Director-1-cli% commit
admin@Director-1-cli% exit</pre>
<p>Do not change anything on the branch: its serial is correct.</p>

<h4>Step 5: re-read; the second fault appears</h4>
<pre class="out">admin@Branch3-cli&gt; show system staging status
Serial: VOS-BR3-0001
Controller: 198.51.100.20
<span class="hl">State: Post-staging failed</span>
Detail: Bind data incomplete for Branch3: wan2-gateway</pre>
<p>The state moved from Rejected to Post-staging failed. Progress, not a new accident: the first layer is fixed and the Director can now find the device, but the template cannot be built. The detail names the missing key. The addressing plan (chapter 1) gives the correct value: the MPLS PE at 172.31.3.1.</p>
<pre class="code">admin@Director-1-cli&gt; configure
admin@Director-1-cli% set director devices Branch3 bind wan2-gateway 172.31.3.1
admin@Director-1-cli% commit
admin@Director-1-cli% exit</pre>

<h4>Step 5 again: prove Online and a working overlay</h4>
<pre class="out">admin@Branch3-cli&gt; show system staging status
<span class="hl">State: Online</span>
Detail: Template BR-DUAL pushed (revision 1)

admin@Branch3-cli&gt; show orgs org Acme sd-wan brief
Org: Acme   Site-ID: 103   Hostname: Branch3
Controller: 198.51.100.20   Overlay (MP-BGP): <span class="hl">Established</span></pre>
<p>Both conditions of the lab are met: Online and Established. If you need further proof, PC3 pings PC1 at 10.1.1.10.</p>

<div class="eg"><p><b>Worked example.</b> Time budget on the ticket: 2 reads (2 minutes), 2 one-line fixes with commits (2 minutes), 1 re-read (1 minute): about five minutes. A random approach (re-staging the branch, re-deploying repeatedly, editing the template) would have changed things that were never broken and could have wasted hours.</p></div>

<div class="warn"><p><b>Common mistakes:</b> re-running staging when the Detail already names the Director as the problem; redeploying without fixing the data; deleting and recreating the device, which loses its history.</p></div>
<div class="exam"><p><b>Exam trap:</b> after fixing one fault the state may change but still be unhealthy. That is expected with a two-fault ticket. Re-read after every fix.</p></div>

<div class="scn"><h4>Friday-night onboarding</h4><p>A telecom partner called at 6 pm: the new Chennai office was not coming online. The partner had already re-staged the router twice. The engineer asked for the status text first: Post-staging failed, bind data incomplete, wan1-gateway. A cell had been left blank in the CSV import. One line in the Director and the device was Online within minutes.</p><p><b>Lesson:</b> read the status before touching anything. The system usually tells you the cause.</p></div>

<div class="iv"><p class="q">"A branch will not onboard. How do you troubleshoot?"</p><p>I read the branch staging status and the Director device view, name the layer from the state, fix one thing at the owning component, and re-read. I expect multiple faults on different layers and verify the overlay at the end.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Workflow: read branch, read Director, name layer and owner, fix one thing, re-read.</li>
<li>Take evidence from both ends; they may disagree.</li>
<li>Kolkata ticket: Rejected (serial with letter O), then Post-staging failed (missing wan2-gateway 172.31.3.1).</li>
<li>Fix in the Director what the Director owns; leave the branch alone.</li>
<li>Success = Online plus Established overlay.</li>
</ul></div>
`,hi:`
<p>Jab lift do floors ke beech ruk jati hai, achha technician darwaze par laat nahi marta. Wo routine follow karta hai: display padho, power check karo, door sensor check karo, controller check karo. Onboarding troubleshooting bhi aisa hi hai: chhoti, fixed routine jo bahar se andar ki taraf jaati hai, aur ek baar mein ek fix.</p>

<h3>Paanch-step workflow</h3>
<ol>
<li><b>Branch status padho.</b> <code>show system staging status</code>: state aur detail.</li>
<li><b>Director ka view padho.</b> <code>show devices brief</code> (fleet) aur <code>show devices device &lt;name&gt;</code> (ek device).</li>
<li>State se <b>layer ka naam lo</b> (chapter 8) aur owner decide karo: branch, Controller ya Director.</li>
<li>Owning component mein <b>ek cheez fix karo</b>, commit karo.</li>
<li><b>Status dobara padho</b> aur Online hone tak repeat karo, phir overlay verify karo.</li>
</ol>
<p>Do principles: <b>dono ends se evidence</b> (branch aur Director alag-alag keh sakte hain), aur <b>ek se zyada faults ho sakte hain</b>. Ek fix karne ke baad state agli layer par chali jati hai aur agla fault dikhta hai.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Troubleshooting loop">
<rect x="10" y="40" width="110" height="60" rx="8" fill="#bae6fd"/><text x="65" y="66" text-anchor="middle" class="svg-ink" font-size="13">1 Padho</text><text x="65" y="84" text-anchor="middle" class="svg-muted" font-size="12">branch status</text>
<rect x="140" y="40" width="110" height="60" rx="8" fill="#bae6fd"/><text x="195" y="66" text-anchor="middle" class="svg-ink" font-size="13">2 Padho</text><text x="195" y="84" text-anchor="middle" class="svg-muted" font-size="12">Director view</text>
<rect x="270" y="40" width="110" height="60" rx="8" fill="#ddd6fe"/><text x="325" y="66" text-anchor="middle" class="svg-ink" font-size="13">3 Naam do</text><text x="325" y="84" text-anchor="middle" class="svg-muted" font-size="12">layer + owner</text>
<rect x="400" y="40" width="110" height="60" rx="8" fill="#fde68a"/><text x="455" y="66" text-anchor="middle" class="svg-ink" font-size="13">4 Ek cheez</text><text x="455" y="84" text-anchor="middle" class="svg-muted" font-size="12">fix, commit</text>
<rect x="530" y="40" width="100" height="60" rx="8" fill="#bbf7d0"/><text x="580" y="66" text-anchor="middle" class="svg-ink" font-size="13">5 Dobara</text><text x="580" y="84" text-anchor="middle" class="svg-muted" font-size="12">status padho</text>
<path d="M580 100 L580 140 L65 140 L65 100" fill="none" stroke="#64748b" stroke-width="2"/><polygon points="59,108 65,98 71,108" fill="#64748b"/>
<text x="320" y="160" text-anchor="middle" class="svg-muted" font-size="12">Online hone tak repeat</text>
</svg><p class="cap">Padho, naam do, ek cheez fix karo, dobara padho.</p></div>

<h3>Lab walkthrough: vs-onboard-ticket</h3>
<p><b>Ticket:</b> Kolkata engineer ne staging start ki aur Director workflow deploy hua, lekin Branch3 kabhi Online nahi hota. Lab kehta hai ki do alag layers par do alag faults hain. Workflow follow karo.</p>

<h4>Step 1 aur 2: dono ends se evidence</h4>
<pre class="out">admin@Branch3-cli&gt; show system staging status
Serial: VOS-BR3-0001
Controller: 198.51.100.20
<span class="hl">State: Rejected</span>
Detail: Serial VOS-BR3-0001 is not in the Director device list (bind data / serial number mismatch)

admin@Director-1-cli&gt; show devices brief
Device      Serial        Group         Deployed  Onboarding                    Overlay
Branch1     VOS-BR1-0001  BRANCHES      yes (r1)  Online                        Established
Branch2     VOS-BR2-0001  BRANCHES      yes (r1)  Online                        Established
<span class="hl">Branch3     VOS-BR3-0O01  BRANCHES      yes (r1)  Not staged                    -</span></pre>
<p>Dhyan se padho. Branch kehta hai Rejected: Controller aur Director links pass ho gaye (warna Staging failed hota). Director Branch3 ko serial <code>VOS-BR3-0O01</code> ke saath list karta hai: aakhri block dekho, usme <b>letter O</b> hai, zero nahi. Kyunki kisi staged branch ka ye serial nahi hai, Director us row ke liye Not staged dikhata hai. Branch1 aur Branch2 Online aur healthy hain, to headend theek hai.</p>

<h4>Step 3 aur 4: layer identity hai; owner Director hai</h4>
<pre class="code">admin@Director-1-cli&gt; configure
admin@Director-1-cli% set director devices Branch3 serial VOS-BR3-0001
admin@Director-1-cli% commit
admin@Director-1-cli% exit</pre>
<p>Branch par kuch change mat karo: uska serial sahi hai.</p>

<h4>Step 5: dobara padho; doosra fault dikhta hai</h4>
<pre class="out">admin@Branch3-cli&gt; show system staging status
Serial: VOS-BR3-0001
Controller: 198.51.100.20
<span class="hl">State: Post-staging failed</span>
Detail: Bind data incomplete for Branch3: wan2-gateway</pre>
<p>State Rejected se Post-staging failed ho gayi. Ye progress hai, naya accident nahi: pehli layer fix ho gayi aur Director ab device dhundh leta hai, lekin template ban nahi sakta. Detail missing key ka naam batata hai. Addressing plan (chapter 1) sahi value deta hai: MPLS PE 172.31.3.1.</p>
<pre class="code">admin@Director-1-cli&gt; configure
admin@Director-1-cli% set director devices Branch3 bind wan2-gateway 172.31.3.1
admin@Director-1-cli% commit
admin@Director-1-cli% exit</pre>

<h4>Step 5 phir se: Online aur working overlay prove karo</h4>
<pre class="out">admin@Branch3-cli&gt; show system staging status
<span class="hl">State: Online</span>
Detail: Template BR-DUAL pushed (revision 1)

admin@Branch3-cli&gt; show orgs org Acme sd-wan brief
Org: Acme   Site-ID: 103   Hostname: Branch3
Controller: 198.51.100.20   Overlay (MP-BGP): <span class="hl">Established</span></pre>
<p>Lab ki dono conditions poori: Online aur Established. Aur proof chahiye to PC3 se PC1 (10.1.1.10) ko ping karo.</p>

<div class="eg"><p><b>Worked example.</b> Ticket ka time budget: 2 reads (2 minute), commit ke saath 2 one-line fixes (2 minute), 1 re-read (1 minute): lagbhag paanch minute. Random approach (branch dobara stage karna, baar-baar redeploy, template edit) aisi cheezein badal deta jo kabhi broken thi hi nahi aur ghante waste ho sakte the.</p></div>

<div class="warn"><p><b>Common mistakes:</b> jab Detail Director ko problem bata raha ho tab staging dobara chalana; data fix kiye bina redeploy karna; device delete karke dobara banana, jisse uski history chali jati hai.</p></div>
<div class="exam"><p><b>Exam trap:</b> ek fault fix karne ke baad state badal sakti hai lekin phir bhi unhealthy ho. Do-fault ticket mein ye expected hai. Har fix ke baad dobara padho.</p></div>

<div class="scn"><h4>Friday-night onboarding</h4><p>Ek telecom partner ne shaam 6 baje call kiya: naya Chennai office online nahi aa raha. Partner router ko do baar re-stage kar chuka tha. Engineer ne pehle status text maanga: Post-staging failed, bind data incomplete, wan1-gateway. CSV import mein ek cell blank reh gaya tha. Director mein ek line aur device kuch minutes mein Online.</p><p><b>Lesson:</b> kuch chhoone se pehle status padho. System aksar cause khud batata hai.</p></div>

<div class="iv"><p class="q">"Branch onboard nahi ho raha. Troubleshoot kaise karoge?"</p><p>Main branch staging status aur Director device view padhta hoon, state se layer ka naam leta hoon, owning component mein ek cheez fix karta hoon, aur dobara padhta hoon. Alag layers par multiple faults expect karta hoon aur aakhir mein overlay verify karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Workflow: branch padho, Director padho, layer aur owner naam do, ek cheez fix karo, dobara padho.</li>
<li>Dono ends se evidence lo; wo disagree kar sakte hain.</li>
<li>Kolkata ticket: Rejected (letter O wala serial), phir Post-staging failed (missing wan2-gateway 172.31.3.1).</li>
<li>Jo Director own karta hai wo Director mein fix karo; branch ko chhodo.</li>
<li>Success = Online plus Established overlay.</li>
</ul></div>
`}};export{e as default};