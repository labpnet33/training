var e={id:`templates`,h:{en:`Templates: one design for many branches`,hi:`Templates: bahut branches ke liye ek design`},body:{en:`
<p>A restaurant chain keeps one <b>recipe book</b>. Every outlet cooks the same dishes in the same way; only the address on the menu differs. In Versa, the recipe book is the <b>device template</b>. It is a reusable description of how a branch should be configured, kept in the <b>Director</b>, the management and orchestration node you met earlier.</p>

<h3>What a template contains</h3>
<p>In the real Director a template (often called a device template in the workflow) can hold interface and network settings, routing, the SD-WAN organization (tenant) settings, SLA and forwarding profiles, policy, and services such as log export. Which parts you include depends on your design; many teams split the work into a base template and add-on service templates. In the course model a template contains exactly these items:</p>
<ul>
<li><b>tenant</b>: the organization, here <code>Acme</code>.</li>
<li><b>wan-interface</b> lines: which VNI port carries which transport (vni-0/0 is Internet, vni-0/1 is MPLS).</li>
<li><b>lan-interface</b>: the LAN port (vni-0/3).</li>
<li>optional policy parts: <b>sla-profile</b>, <b>forwarding-profile</b>, <b>policy rule</b> and <b>log-exporter</b> destination.</li>
</ul>
<p>Notice what is <i>not</i> in the template: no IP address, no gateway, no site-id. Those differ for every branch, so they live in bind data (chapter 4). The template says "WAN1 is an Internet interface with an address"; it does not say which address.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Template and expansion">
<rect x="20" y="20" width="250" height="150" rx="10" fill="#bae6fd"/><text x="145" y="45" text-anchor="middle" class="svg-ink" font-size="14">Template BR-DUAL</text>
<text x="40" y="72" class="svg-ink" font-size="12">tenant Acme</text><text x="40" y="92" class="svg-ink" font-size="12">vni-0/0 = Internet</text><text x="40" y="112" class="svg-ink" font-size="12">vni-0/1 = MPLS</text><text x="40" y="132" class="svg-ink" font-size="12">LAN vni-0/3</text><text x="40" y="152" class="svg-muted" font-size="12">SLA, forwarding, policy</text>
<text x="320" y="95" text-anchor="middle" class="svg-accent" font-size="13">+ bind data</text><line x1="270" y1="100" x2="370" y2="100" stroke="#64748b" stroke-width="2"/><polygon points="370,94 382,100 370,106" fill="#64748b"/>
<rect x="385" y="20" width="235" height="150" rx="10" fill="#bbf7d0"/><text x="502" y="45" text-anchor="middle" class="svg-ink" font-size="14">Branch3 configuration</text>
<text x="400" y="72" class="svg-ink" font-size="12">site-id 103</text><text x="400" y="92" class="svg-ink" font-size="12">vni-0/0 203.0.113.14/30</text><text x="400" y="112" class="svg-ink" font-size="12">vni-0/1 172.31.3.2/30</text><text x="400" y="132" class="svg-ink" font-size="12">vni-0/3 10.1.3.1/24</text><text x="400" y="152" class="svg-muted" font-size="12">+ default routes, policy</text>
</svg><p class="cap">Template (shape) plus bind data (values) expands into the real branch configuration.</p></div>

<h3>Template inheritance and reuse</h3>
<p>Because the template is separate from the sites, one change is made once and reaches every branch that uses it. In the real product, templates can be layered: a common baseline, a role-specific template (dual-circuit branch, single-circuit branch, hub) and optional service add-ons. Layering keeps each piece small and easy to review. The course model has a single template per device group so you can focus on the push logic, but remember that real designs often combine several.</p>

<h3>Variables</h3>
<p>A <b>variable</b> is a named blank in the template that is filled per device. Real Versa templates use variables for values such as the LAN address, the WAN address or the site identifier; the filled-in values are the device's <b>bind data</b>. The rule: if a value is the same everywhere, hard-code it in the template; if it differs per site, make it a variable.</p>

<h3>Creating the BR-DUAL template (lab vs-director-objects)</h3>
<pre class="code"><span class="c">! on Director-1, configuration mode</span>
admin@Director-1-cli% set director templates BR-DUAL tenant Acme
admin@Director-1-cli% set director templates BR-DUAL wan-interface vni-0/0 transport Internet
admin@Director-1-cli% set director templates BR-DUAL wan-interface vni-0/1 transport MPLS
admin@Director-1-cli% set director templates BR-DUAL lan-interface vni-0/3
admin@Director-1-cli% commit</pre>
<pre class="out">admin@Director-1-cli&gt; show templates
Template        Org       WAN interfaces                    LAN       SLA/FP/Policy
<span class="hl">BR-DUAL         Acme      vni-0/0=Internet vni-0/1=MPLS     vni-0/3   0/0/0</span></pre>
<p>The last column counts SLA profiles, forwarding profiles and policies. The lab does not need policy yet, so 0/0/0 is correct. In the later policy module you add them to the same template and every branch inherits them on the next deploy.</p>

<div class="eg"><p><b>Worked example.</b> Delhi, Bengaluru and Kolkata use BR-DUAL. The business wants SLA profile VOICE at latency 150 ms. You edit the template once; three redeploys later all three sites carry the same SLA. Without a template you would make 3 manual edits, and with 300 sites, 300.</p></div>

<div class="warn"><p><b>Common mistakes:</b> forgetting the <code>tenant</code> line, so the template has no organization and the push fails; putting a site-specific address into the template; mapping a transport to the wrong VNI port.</p></div>
<div class="exam"><p><b>Exam trap:</b> a template is a shape, not a device. Saving or editing a template does not change any branch until a workflow is deployed.</p></div>

<div class="scn"><h4>One template typo, 60 sites</h4><p>An engineer changed the LAN interface in a shared template from vni-0/3 to vni-0/2 while testing and left it. Next morning's scheduled redeploy moved the LAN on dozens of sites. A rollback to the previous template revision restored service in minutes.</p><p><b>Lesson:</b> templates are powerful because the blast radius is large; review changes and keep revisions.</p></div>

<div class="iv"><p class="q">"What is a device template in Versa and why use one?"</p><p>A reusable, centrally managed definition of branch configuration in the Director: interfaces, tenant, services and policy, with variables for per-site values. It gives consistency, fast rollout and one place to change.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A template is the standard design, stored in the Director.</li>
<li>In the course: tenant, WAN interfaces with transports, LAN interface, optional SLA, forwarding and policy parts.</li>
<li>Site-specific values never belong in the template; they are variables filled by bind data.</li>
<li>Editing a template changes nothing on a branch until a deploy.</li>
<li>Real templates can be layered; the course uses one per group.</li>
</ul></div>
`,hi:`
<p>Ek restaurant chain ek hi <b>recipe book</b> rakhti hai. Har outlet wahi dishes same tareeke se banata hai; sirf menu par address alag hota hai. Versa mein recipe book hai <b>device template</b>. Ye branch kaise configure hona chahiye uska reusable description hai, jo <b>Director</b> mein rakha jata hai, wahi management aur orchestration node jo aap pehle dekh chuke ho.</p>

<h3>Template mein kya hota hai</h3>
<p>Real Director mein template (workflow mein aksar device template kehte hain) mein interface aur network settings, routing, SD-WAN organization (tenant) settings, SLA aur forwarding profiles, policy, aur log export jaisi services aa sakti hain. Kya include karna hai wo design par depend karta hai; kai teams base template aur add-on service templates mein kaam baant deti hain. Course model mein template mein exactly ye items hote hain:</p>
<ul>
<li><b>tenant</b>: organization, yahan <code>Acme</code>.</li>
<li><b>wan-interface</b> lines: kaunsa VNI port kaunsa transport carry karta hai (vni-0/0 Internet, vni-0/1 MPLS).</li>
<li><b>lan-interface</b>: LAN port (vni-0/3).</li>
<li>optional policy parts: <b>sla-profile</b>, <b>forwarding-profile</b>, <b>policy rule</b> aur <b>log-exporter</b> destination.</li>
</ul>
<p>Dhyan do ki template mein kya <i>nahi</i> hai: koi IP address nahi, koi gateway nahi, koi site-id nahi. Ye har branch ke liye alag hain, isliye bind data mein rehte hain (chapter 4). Template kehta hai "WAN1 ek Internet interface hai jiska address hoga"; ye nahi kehta ki kaunsa address.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Template and expansion">
<rect x="20" y="20" width="250" height="150" rx="10" fill="#bae6fd"/><text x="145" y="45" text-anchor="middle" class="svg-ink" font-size="14">Template BR-DUAL</text>
<text x="40" y="72" class="svg-ink" font-size="12">tenant Acme</text><text x="40" y="92" class="svg-ink" font-size="12">vni-0/0 = Internet</text><text x="40" y="112" class="svg-ink" font-size="12">vni-0/1 = MPLS</text><text x="40" y="132" class="svg-ink" font-size="12">LAN vni-0/3</text><text x="40" y="152" class="svg-muted" font-size="12">SLA, forwarding, policy</text>
<text x="320" y="95" text-anchor="middle" class="svg-accent" font-size="13">+ bind data</text><line x1="270" y1="100" x2="370" y2="100" stroke="#64748b" stroke-width="2"/><polygon points="370,94 382,100 370,106" fill="#64748b"/>
<rect x="385" y="20" width="235" height="150" rx="10" fill="#bbf7d0"/><text x="502" y="45" text-anchor="middle" class="svg-ink" font-size="14">Branch3 configuration</text>
<text x="400" y="72" class="svg-ink" font-size="12">site-id 103</text><text x="400" y="92" class="svg-ink" font-size="12">vni-0/0 203.0.113.14/30</text><text x="400" y="112" class="svg-ink" font-size="12">vni-0/1 172.31.3.2/30</text><text x="400" y="132" class="svg-ink" font-size="12">vni-0/3 10.1.3.1/24</text><text x="400" y="152" class="svg-muted" font-size="12">+ default routes, policy</text>
</svg><p class="cap">Template (shape) aur bind data (values) milkar real branch configuration banate hain.</p></div>

<h3>Template inheritance aur reuse</h3>
<p>Template sites se alag hai, isliye ek change ek baar karte ho aur wo har us branch tak pahunchta hai jo is template ko use karta hai. Real product mein templates layer ho sakte hain: common baseline, role-specific template (dual-circuit branch, single-circuit branch, hub) aur optional service add-ons. Layering se har piece chhota aur review karne mein aasan rehta hai. Course model mein push logic par focus karne ke liye har device group ka ek hi template hota hai, lekin yaad rakho ki real designs mein aksar kai templates combine hote hain.</p>

<h3>Variables</h3>
<p><b>Variable</b> template ka ek named blank hai jo har device ke liye bhara jata hai. Real Versa templates LAN address, WAN address ya site identifier jaisi values ke liye variables use karte hain; bhari hui values device ka <b>bind data</b> hain. Rule: agar value har jagah same hai to template mein hard-code karo; agar site ke hisaab se alag hai to variable banao.</p>

<h3>BR-DUAL template banana (lab vs-director-objects)</h3>
<pre class="code"><span class="c">! on Director-1, configuration mode</span>
admin@Director-1-cli% set director templates BR-DUAL tenant Acme
admin@Director-1-cli% set director templates BR-DUAL wan-interface vni-0/0 transport Internet
admin@Director-1-cli% set director templates BR-DUAL wan-interface vni-0/1 transport MPLS
admin@Director-1-cli% set director templates BR-DUAL lan-interface vni-0/3
admin@Director-1-cli% commit</pre>
<pre class="out">admin@Director-1-cli&gt; show templates
Template        Org       WAN interfaces                    LAN       SLA/FP/Policy
<span class="hl">BR-DUAL         Acme      vni-0/0=Internet vni-0/1=MPLS     vni-0/3   0/0/0</span></pre>
<p>Aakhri column SLA profiles, forwarding profiles aur policies ki ginti hai. Lab ko abhi policy nahi chahiye, isliye 0/0/0 sahi hai. Aage policy module mein aap inhe isi template mein add karoge aur har branch agle deploy par inherit karega.</p>

<div class="eg"><p><b>Worked example.</b> Delhi, Bengaluru aur Kolkata BR-DUAL use karte hain. Business ko SLA profile VOICE latency 150 ms chahiye. Aap template ek baar edit karte ho; teen redeploys ke baad teeno sites par same SLA hai. Template ke bina 3 manual edits karne padte, aur 300 sites hote to 300.</p></div>

<div class="warn"><p><b>Common mistakes:</b> <code>tenant</code> line bhool jana, to template mein organization nahi hota aur push fail hota hai; template mein site-specific address daal dena; transport ko galat VNI port par map karna.</p></div>
<div class="exam"><p><b>Exam trap:</b> template ek shape hai, device nahi. Template save ya edit karne se koi branch change nahi hota jab tak workflow deploy na ho.</p></div>

<div class="scn"><h4>Ek template typo, 60 sites</h4><p>Ek engineer ne testing mein shared template ka LAN interface vni-0/3 se vni-0/2 kar diya aur chhod diya. Agli subah scheduled redeploy ne dozens of sites par LAN move kar diya. Previous template revision par rollback se kuch minutes mein service wapas aayi.</p><p><b>Lesson:</b> templates isliye powerful hain ki blast radius bada hai; changes review karo aur revisions rakho.</p></div>

<div class="iv"><p class="q">"Versa mein device template kya hai aur use kyun karte hain?"</p><p>Director mein branch configuration ki reusable, centrally managed definition: interfaces, tenant, services aur policy, aur per-site values ke liye variables. Isse consistency, fast rollout aur change ke liye ek hi jagah milti hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Template standard design hai, Director mein stored.</li>
<li>Course mein: tenant, transports ke saath WAN interfaces, LAN interface, optional SLA, forwarding aur policy parts.</li>
<li>Site-specific values template mein kabhi nahi; wo variables hain jo bind data bharta hai.</li>
<li>Template edit karne se branch tab tak nahi badalta jab tak deploy na ho.</li>
<li>Real templates layer ho sakte hain; course mein ek per group hai.</li>
</ul></div>
`}};export{e as default};