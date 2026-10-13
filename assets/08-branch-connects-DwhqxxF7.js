var e={id:`branch-connects`,h:{en:`How a branch actually connects: IKE, BGP and config push`,hi:`Branch asal mein kaise connect hota hai: IKE, BGP aur config push`},body:{en:`
<p>Picture a new employee's first day. She shows an ID at the gate (<b>staging</b>), the security desk checks it against a list (<b>trust</b>), HR hands over her duties and desk number (<b>configuration push</b>), and the switchboard publishes her extension to everybody (<b>routes</b>). Each step is done by a different office; if any step is missing, she cannot work. A Versa branch follows the same story.</p>

<h3>The sequence</h3>
<ol>
<li><b>Staging (day 0).</b> The branch boots with a minimal config: an uplink address (DHCP or manual), its <b>serial number</b>, and the Controller address to contact. In the course, <code>request staging start serial VOS-BR3-0001 controller 198.51.100.20</code> models this step.</li>
<li><b>Reach the headend.</b> The branch finds a route to the Controller through its underlay.</li>
<li><b>IKE to the Controller.</b> The branch and the Controller negotiate IKE and build an IPsec tunnel. The Controller checks the identity (certificate or secret) and, in the full product, checks the device with the Director.</li>
<li><b>Director registration.</b> The Controller informs the Director that the serial is online; if the serial exists in the Director it is accepted, otherwise it is <b>rejected</b>.</li>
<li><b>Config push.</b> The Director deploys the template and bind data (the workflow) and the branch receives its full configuration: organization, WANs, LAN, policy.</li>
<li><b>MP-BGP.</b> With the final config the branch starts MP-BGP to the Controller inside the tunnel, advertises its LAN prefix and WAN locators, and learns other sites.</li>
<li><b>Data tunnels.</b> Branches build site-to-site tunnels where policy allows, and traffic flows.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 360" role="img" aria-label="Branch onboarding sequence">
<text x="70" y="22" text-anchor="middle" class="svg-ink" font-size="13">Branch</text><text x="270" y="22" text-anchor="middle" class="svg-ink" font-size="13">Controller</text><text x="460" y="22" text-anchor="middle" class="svg-ink" font-size="13">Director</text><text x="590" y="22" text-anchor="middle" class="svg-ink" font-size="13">Analytics</text>
<line x1="70" y1="30" x2="70" y2="345" stroke="#64748b" stroke-dasharray="4 4"/><line x1="270" y1="30" x2="270" y2="345" stroke="#64748b" stroke-dasharray="4 4"/><line x1="460" y1="30" x2="460" y2="345" stroke="#64748b" stroke-dasharray="4 4"/><line x1="590" y1="30" x2="590" y2="345" stroke="#64748b" stroke-dasharray="4 4"/>
<line x1="70" y1="55" x2="270" y2="55" stroke="#0369a1" stroke-width="2"/><text x="170" y="49" text-anchor="middle" class="svg-muted" font-size="12">1 IKE + serial</text>
<line x1="270" y1="90" x2="460" y2="90" stroke="#0369a1" stroke-width="2"/><text x="365" y="84" text-anchor="middle" class="svg-muted" font-size="12">2 serial known?</text>
<line x1="460" y1="125" x2="270" y2="125" stroke="#15803d" stroke-width="2"/><text x="365" y="119" text-anchor="middle" class="svg-muted" font-size="12">3 yes / rejected</text>
<line x1="270" y1="160" x2="70" y2="160" stroke="#15803d" stroke-width="2"/><text x="170" y="154" text-anchor="middle" class="svg-muted" font-size="12">4 tunnel up (staged)</text>
<line x1="460" y1="200" x2="70" y2="200" stroke="#7c3aed" stroke-width="2"/><text x="265" y="194" text-anchor="middle" class="svg-muted" font-size="12">5 workflow deploy: template + bind data</text>
<line x1="70" y1="240" x2="270" y2="240" stroke="#0369a1" stroke-width="2"/><text x="170" y="234" text-anchor="middle" class="svg-muted" font-size="12">6 MP-BGP: LAN, locators</text>
<line x1="270" y1="275" x2="70" y2="275" stroke="#15803d" stroke-width="2"/><text x="170" y="269" text-anchor="middle" class="svg-muted" font-size="12">7 other sites and policy</text>
<line x1="70" y1="315" x2="590" y2="315" stroke="#b45309" stroke-width="2"/><text x="330" y="309" text-anchor="middle" class="svg-muted" font-size="12">8 log export to the collector</text>
</svg><p class="cap">Staging to online. Steps 1 to 4 need the Controller; step 5 needs the Director; step 8 needs Analytics.</p></div>

<h3>Onboarding states in the lab</h3>
<pre class="out">Not staged
  -&gt; Staging failed        (Controller unreachable / no Director link / Controller not registered)
  -&gt; Rejected              (serial is not defined in the Director)
  -&gt; Staged - waiting for Director   (workflow not deployed yet)
  -&gt; Post-staging failed   (no group, template, tenant or incomplete bind data)
  -&gt; <span class="hl">Online</span>                (template pushed; pushed lines read-only on the branch)</pre>
<p>Notice how each failure state points to a <b>component</b>. "Staging failed" because "no Director link" tells you the headend link of chapter 9 is not finished. This is why the first lab links Controller and Director.</p>

<h3>What the Controller learns from the branch</h3>
<pre class="out">admin@Controller-1-cli&gt; show bgp neighbor brief
Neighbor (site)    Site-ID  State
Branch1            101      <span class="hl">Established</span>
Branch2            102      Established
Branch3            103      Idle</pre>

<div class="eg"><p><b>Worked example.</b> Branch3 is new. Step 1 works (staging), but step 3 returns "rejected": the serial <code>VOS-BR3-0001</code> was typed as <code>VOS-BR3-001</code> in the Director. Fix the serial in the Director, not on the branch; no config can be pushed until the Director recognises the device.</p></div>

<div class="note"><p><b>Course model.</b> Real onboarding uses ZTP with a staging template or a CLI-based staging with certificates, and the sequence of messages is richer (certificate exchange, NETCONF sessions, versions checks). The course's state list is a faithful summary of which component blocks which step.</p></div>

<div class="warn"><p><b>Common mistake.</b> Pushing a final config before the underlay can reach the Controller. The branch then loses its own management path. Always keep a tested path to the headend.</p></div>

<div class="exam"><p><b>Exam trap.</b> BGP is not between the branches and the Director. The Director only manages; MP-BGP is between branch and Controller.</p></div>

<div class="scn"><h4>Branch stays staged for hours</h4><p>A new site showed "Staged - waiting for Director". The Controller had accepted the IKE tunnel, so the underlay and trust were fine. The Director device existed, but nobody had run the deploy workflow. After the workflow, the state moved to Online within minutes and MP-BGP became Established.</p><p><b>Lesson:</b> read the onboarding state word by word; it tells you which component is waiting.</p></div>

<div class="iv"><p class="q">"Describe what happens when a new Versa branch is powered on."</p><p>It stages with serial and Controller address, builds IKE/IPsec to the Controller, the Controller validates and informs the Director, the Director pushes the template and bind data, the branch starts MP-BGP, advertises LAN and locators, learns other sites, then builds data tunnels and exports logs.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Sequence: staging, IKE to Controller, Director check, config push, MP-BGP, data tunnels.</li>
<li>Controller = trust and routes; Director = configuration; each failure state names the blocker.</li>
<li>Rejected means the serial is unknown to the Director.</li>
<li>MP-BGP Established needs at least one tunnel and consistent organization, site-id and controller.</li>
</ul></div>
`,hi:`
<p>Naye employee ka pehla din socho. Woh gate par ID dikhati hai (<b>staging</b>), security desk list se check karta hai (<b>trust</b>), HR use uske duties aur desk number deta hai (<b>configuration push</b>), aur switchboard uska extension sabko publish karta hai (<b>routes</b>). Har step alag office karta hai; koi bhi step missing ho to woh kaam nahi kar sakti. Versa branch bhi yahi kahani follow karta hai.</p>

<h3>Sequence</h3>
<ol>
<li><b>Staging (day 0).</b> Branch minimal config ke saath boot hota hai: uplink address (DHCP ya manual), uska <b>serial number</b>, aur contact karne ke liye Controller address. Course mein <code>request staging start serial VOS-BR3-0001 controller 198.51.100.20</code> is step ko model karta hai.</li>
<li><b>Headend tak pahunchna.</b> Branch apne underlay se Controller tak route dhundta hai.</li>
<li><b>Controller se IKE.</b> Branch aur Controller IKE negotiate karke IPsec tunnel banate hain. Controller identity (certificate ya secret) check karta hai aur full product mein device ko Director ke saath check karta hai.</li>
<li><b>Director registration.</b> Controller Director ko batata hai ki serial online hai; agar serial Director mein hai to accept hota hai, warna <b>rejected</b>.</li>
<li><b>Config push.</b> Director template aur bind data deploy karta hai (workflow) aur branch ko poori configuration milti hai: organization, WANs, LAN, policy.</li>
<li><b>MP-BGP.</b> Final config ke saath branch tunnel ke andar Controller ke saath MP-BGP shuru karta hai, apna LAN prefix aur WAN locators advertise karta hai, aur doosre sites seekhta hai.</li>
<li><b>Data tunnels.</b> Branches jahan policy allow kare wahan site-to-site tunnels banate hain, aur traffic chalta hai.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 360" role="img" aria-label="Branch onboarding sequence">
<text x="70" y="22" text-anchor="middle" class="svg-ink" font-size="13">Branch</text><text x="270" y="22" text-anchor="middle" class="svg-ink" font-size="13">Controller</text><text x="460" y="22" text-anchor="middle" class="svg-ink" font-size="13">Director</text><text x="590" y="22" text-anchor="middle" class="svg-ink" font-size="13">Analytics</text>
<line x1="70" y1="30" x2="70" y2="345" stroke="#64748b" stroke-dasharray="4 4"/><line x1="270" y1="30" x2="270" y2="345" stroke="#64748b" stroke-dasharray="4 4"/><line x1="460" y1="30" x2="460" y2="345" stroke="#64748b" stroke-dasharray="4 4"/><line x1="590" y1="30" x2="590" y2="345" stroke="#64748b" stroke-dasharray="4 4"/>
<line x1="70" y1="55" x2="270" y2="55" stroke="#0369a1" stroke-width="2"/><text x="170" y="49" text-anchor="middle" class="svg-muted" font-size="12">1 IKE + serial</text>
<line x1="270" y1="90" x2="460" y2="90" stroke="#0369a1" stroke-width="2"/><text x="365" y="84" text-anchor="middle" class="svg-muted" font-size="12">2 serial known?</text>
<line x1="460" y1="125" x2="270" y2="125" stroke="#15803d" stroke-width="2"/><text x="365" y="119" text-anchor="middle" class="svg-muted" font-size="12">3 yes / rejected</text>
<line x1="270" y1="160" x2="70" y2="160" stroke="#15803d" stroke-width="2"/><text x="170" y="154" text-anchor="middle" class="svg-muted" font-size="12">4 tunnel up (staged)</text>
<line x1="460" y1="200" x2="70" y2="200" stroke="#7c3aed" stroke-width="2"/><text x="265" y="194" text-anchor="middle" class="svg-muted" font-size="12">5 workflow deploy: template + bind data</text>
<line x1="70" y1="240" x2="270" y2="240" stroke="#0369a1" stroke-width="2"/><text x="170" y="234" text-anchor="middle" class="svg-muted" font-size="12">6 MP-BGP: LAN, locators</text>
<line x1="270" y1="275" x2="70" y2="275" stroke="#15803d" stroke-width="2"/><text x="170" y="269" text-anchor="middle" class="svg-muted" font-size="12">7 baaki sites aur policy</text>
<line x1="70" y1="315" x2="590" y2="315" stroke="#b45309" stroke-width="2"/><text x="330" y="309" text-anchor="middle" class="svg-muted" font-size="12">8 collector ko log export</text>
</svg><p class="cap">Staging se online tak. Steps 1 se 4 ko Controller chahiye; step 5 ko Director; step 8 ko Analytics.</p></div>

<h3>Lab mein onboarding states</h3>
<pre class="out">Not staged
  -&gt; Staging failed        (Controller unreachable / no Director link / Controller not registered)
  -&gt; Rejected              (serial is not defined in the Director)
  -&gt; Staged - waiting for Director   (workflow not deployed yet)
  -&gt; Post-staging failed   (no group, template, tenant or incomplete bind data)
  -&gt; <span class="hl">Online</span>                (template pushed; pushed lines read-only on the branch)</pre>
<p>Dekho ki har failure state ek <b>component</b> ki taraf ishara karta hai. "Staging failed" kyunki "no Director link" ka matlab hai chapter 9 ka headend link adhoora hai. Isliye pehla lab Controller aur Director ko jodta hai.</p>

<h3>Controller branch se kya seekhta hai</h3>
<pre class="out">admin@Controller-1-cli&gt; show bgp neighbor brief
Neighbor (site)    Site-ID  State
Branch1            101      <span class="hl">Established</span>
Branch2            102      Established
Branch3            103      Idle</pre>

<div class="eg"><p><b>Worked example.</b> Branch3 naya hai. Step 1 chalta hai (staging), lekin step 3 "rejected" deta hai: serial <code>VOS-BR3-0001</code> Director mein <code>VOS-BR3-001</code> type ho gaya. Serial Director mein theek karo, branch par nahi; jab tak Director device ko pehchaane, koi config push nahi ho sakti.</p></div>

<div class="note"><p><b>Course model.</b> Real onboarding ZTP staging template ya certificates ke saath CLI-based staging use karta hai, aur messages ka sequence zyada rich hai (certificate exchange, NETCONF sessions, version checks). Course ki state list yeh sahi dikhati hai ki kaunsa component kaunsa step rokta hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> Final config push karna jab underlay Controller tak nahi pahunch sakta. Tab branch apna management path kho deta hai. Headend tak tested path hamesha rakho.</p></div>

<div class="exam"><p><b>Exam trap.</b> BGP branches aur Director ke beech nahi hota. Director sirf manage karta hai; MP-BGP branch aur Controller ke beech hota hai.</p></div>

<div class="scn"><h4>Branch ghanton staged rehti hai</h4><p>Ek naye site ne "Staged - waiting for Director" dikhaya. Controller ne IKE tunnel accept kar liya tha, isliye underlay aur trust theek the. Director device maujood tha, lekin kisi ne deploy workflow nahi chalayi thi. Workflow ke baad state kuch minute mein Online ho gayi aur MP-BGP Established ho gaya.</p><p><b>Lesson:</b> onboarding state ko shabd-ba-shabd padho; woh batata hai kaunsa component wait kar raha hai.</p></div>

<div class="iv"><p class="q">"Naya Versa branch power on hone par kya hota hai, batao."</p><p>Woh serial aur Controller address ke saath stage hota hai, Controller tak IKE/IPsec banata hai, Controller validate karke Director ko batata hai, Director template aur bind data push karta hai, branch MP-BGP shuru karta hai, LAN aur locators advertise karta hai, doosre sites seekhta hai, phir data tunnels banata hai aur logs export karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Sequence: staging, Controller se IKE, Director check, config push, MP-BGP, data tunnels.</li>
<li>Controller = trust aur routes; Director = configuration; har failure state blocker ka naam batata hai.</li>
<li>Rejected ka matlab serial Director ko pata nahi.</li>
<li>MP-BGP Established ke liye kam se kam ek tunnel aur consistent organization, site-id aur controller chahiye.</li>
</ul></div>
`}};export{e as default};