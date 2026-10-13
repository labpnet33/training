var e={id:`panorama-to-scm-migration`,h:{en:`Migrating Prisma Access from Panorama to Strata Cloud Manager`,hi:`Prisma Access ko Panorama se Strata Cloud Manager mein migrate karna`},body:{en:`
<p>Moving house is a good picture. You pack everything, check what the new house cannot hold, sign a contract, and move. After the keys change hands you cannot move back into the old house, because someone else lives there. Migrating Prisma Access from Panorama management to Strata Cloud Manager (SCM) is the same: a planned, <b>one-way</b> move. The documentation covers migration for releases 4.0 to 6.2, and states clearly that there is no way back to Panorama.</p>

<h3>Why migrate, and why not</h3>
<table class="cmp">
<tr><th>Panorama (Cloud Services plugin)</th><th>Strata Cloud Manager</th></tr>
<tr><td>Fits teams already running Panorama with common policy</td><td>Fits fast onboarding with built-in best-practice policy and task-driven workflows</td></tr>
<tr><td>Needs Panorama and active internet connectivity to the service</td><td>Cloud-based, with a Command Center dashboard</td></tr>
<tr><td>Some features exist only here</td><td>Some features exist only here</td></tr>
</table>
<p>The documentation says features differ between the two and refers to a compatibility matrix. Always check it before deciding: a feature you depend on may not be supported on the target side.</p>

<h3>Prerequisites</h3>
<ul>
<li>Panorama running <b>10.0 or later</b>.</li>
<li><b>Superuser</b> access on both Panorama and SCM.</li>
<li>A <b>valid licence</b>.</li>
<li><b>Cloud Identity Engine Directory Sync</b> integrated first, so users and groups are available for user-based rules.</li>
</ul>

<h3>The steps</h3>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Migration flow">
<rect x="10" y="30" width="105" height="60" rx="8" fill="#bae6fd"/><text x="62" y="55" text-anchor="middle" class="svg-ink" font-size="12">1 Export</text><text x="62" y="73" text-anchor="middle" class="svg-muted" font-size="11">running XML</text>
<rect x="130" y="30" width="105" height="60" rx="8" fill="#bae6fd"/><text x="182" y="55" text-anchor="middle" class="svg-ink" font-size="12">2 Start</text><text x="182" y="73" text-anchor="middle" class="svg-muted" font-size="11">in SCM</text>
<rect x="250" y="30" width="105" height="60" rx="8" fill="#ddd6fe"/><text x="302" y="55" text-anchor="middle" class="svg-ink" font-size="12">3 Upload</text><text x="302" y="73" text-anchor="middle" class="svg-muted" font-size="11">+ master key</text>
<rect x="370" y="30" width="105" height="60" rx="8" fill="#ddd6fe"/><text x="422" y="55" text-anchor="middle" class="svg-ink" font-size="12">4 Review</text><text x="422" y="73" text-anchor="middle" class="svg-muted" font-size="11">the diff</text>
<rect x="490" y="30" width="140" height="60" rx="8" fill="#fed7aa"/><text x="560" y="55" text-anchor="middle" class="svg-ink" font-size="12">5 Complete</text><text x="560" y="73" text-anchor="middle" class="svg-muted" font-size="11">irreversible</text>
<line x1="115" y1="60" x2="130" y2="60" stroke="#64748b" stroke-width="2"/><line x1="235" y1="60" x2="250" y2="60" stroke="#64748b" stroke-width="2"/><line x1="355" y1="60" x2="370" y2="60" stroke="#64748b" stroke-width="2"/><line x1="475" y1="60" x2="490" y2="60" stroke="#64748b" stroke-width="2"/>
<text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">Then 6: push the configuration from SCM</text>
</svg><p class="cap">Five decision steps, then a push. Step 5 cannot be undone.</p></div>
<ol>
<li><b>Export</b> the Panorama running configuration as XML.</li>
<li><b>Start the migration</b> in SCM at Configuration, NGFW and Prisma Access.</li>
<li><b>Upload</b> the file and supply the Panorama master key.</li>
<li><b>Review the diff</b> that SCM produces. This is where you read what will change.</li>
<li><b>Complete</b> the migration. This step is irreversible.</li>
<li><b>Push</b> the configuration from SCM and verify.</li>
</ol>

<h3>What is not supported</h3>
<ul>
<li><b>Data Filtering</b></li>
<li><b>FedRAMP</b></li>
<li><b>IoT Security</b></li>
<li><b>Multitenant</b> deployments</li>
<li><b>SSH Proxy</b></li>
<li><b>Separate authentication for portal and gateways</b></li>
</ul>
<p>If your tenant uses any of these, stop and plan before migrating. Expect differences in the diff for items such as <code>clientless-vpn</code> crypto-settings, the <code>hip-profiles</code> rename, <code>mobile-user-redundancy</code> and <code>exclude-video-traffic</code>. Read each one; they are known and explainable, not surprises.</p>

<div class="eg"><p><b>Worked example (lab pa-ops-3).</b> A decision table for the lab tenant (infrastructure 10.255.0.0/24, AS 65534, pool 10.200.0.0/23, Panorama 10.10.0.10). Panorama version: 10.2, so the 10.0+ prerequisite is met. Superuser on both: yes. Licence: valid. Cloud Identity Engine Directory Sync: not yet integrated, so first task is to integrate it. Unsupported items: the tenant uses Data Filtering in a log forwarding match list and SSH Proxy in a rule. Decision: do not migrate yet. Remove or replace those two items first, integrate Directory Sync, run again. The learner states migration is one-way and names Data Filtering, SSH Proxy and FedRAMP as examples of unsupported items.</p></div>

<h3>Risk management</h3>
<ol>
<li>Take a backup of the Panorama configuration and keep it (you cannot return, but you can compare).</li>
<li>Run the migration review during a quiet window, not during an incident.</li>
<li>Have the diff signed off by the security and network owners.</li>
<li>After the push, test the three reachability paths: branch to internet, laptop to app, branch to HQ.</li>
<li>Update runbooks, because menus and push steps change (Push Config instead of Commit and Push).</li>
</ol>

<div class="warn"><p><b>Common mistakes.</b> Treating migration as reversible; skipping the Directory Sync prerequisite so user-based rules break; ignoring unsupported items until after completion; migrating during an outage; forgetting to retrain operators on Push Config.</p></div>
<div class="exam"><p><b>Exam trap.</b> Migration is Panorama to SCM only, one-way. Prerequisites: Panorama 10.0+, Superuser in both, valid licence, Cloud Identity Engine Directory Sync. Unsupported: Data Filtering, FedRAMP, IoT Security, multitenant, SSH Proxy, separate authentication for portal and gateways. Complete is irreversible.</p></div>

<div class="scn"><h4>The migration that stopped at the diff</h4><p>A team scheduled a Friday migration. On Thursday they ran the review and found a rule using SSH Proxy and a multitenant setup that had been forgotten. They postponed, redesigned the rule and agreed a plan with the other tenant owner. The migration then completed on a quiet Tuesday without a rollback request, because rollback was never possible and never needed.</p><p><b>Lesson:</b> the review step is your last chance to change your mind.</p></div>

<div class="iv"><p class="q">"What should you check before migrating Prisma Access from Panorama to SCM?"</p><p>Panorama 10.0 or later, Superuser on both, valid licence, Cloud Identity Engine Directory Sync integrated, a check against unsupported items (Data Filtering, FedRAMP, IoT Security, multitenant, SSH Proxy, separate portal and gateway authentication), a reviewed diff, and acceptance that the move is irreversible.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Migration is Panorama to SCM only and cannot be undone.</li>
<li>Prerequisites: Panorama 10.0+, Superuser on both, valid licence, Directory Sync first.</li>
<li>Steps: export XML, start, upload with master key, review the diff, complete, push.</li>
<li>Unsupported items must be resolved before you start.</li>
<li>Test reachability after the push and update runbooks.</li>
</ul></div>
`,hi:`
<p>Ghar badalna achha example hai. Aap sab pack karte ho, check karte ho ki naye ghar mein kya nahi aa sakta, contract sign karte ho, aur shift ho jaate ho. Chaabiyan dene ke baad aap purane ghar mein wapas nahi ja sakte kyunki wahan ab koi aur rehta hai. Prisma Access ko Panorama management se Strata Cloud Manager (SCM) mein migrate karna aisa hi hai: ek planned, <b>one-way</b> move. Documentation releases 4.0 se 6.2 ke liye migration cover karti hai, aur saaf kehti hai ki Panorama wapas jaane ka koi raasta nahi.</p>

<h3>Migrate kyun, aur kyun nahi</h3>
<table class="cmp">
<tr><th>Panorama (Cloud Services plugin)</th><th>Strata Cloud Manager</th></tr>
<tr><td>Un teams ke liye jo pehle se Panorama aur common policy chalate hain</td><td>Fast onboarding, built-in best-practice policy aur task-driven workflows ke liye</td></tr>
<tr><td>Panorama aur service tak active internet connectivity chahiye</td><td>Cloud-based, Command Center dashboard ke saath</td></tr>
<tr><td>Kuch features sirf yahan hain</td><td>Kuch features sirf yahan hain</td></tr>
</table>
<p>Documentation kehti hai dono ke features alag hain aur compatibility matrix ka reference deti hai. Decide karne se pehle use hamesha check karo: jis feature par aap depend ho wo target side par supported na ho sakta hai.</p>

<h3>Prerequisites</h3>
<ul>
<li>Panorama <b>10.0 ya naya</b>.</li>
<li>Panorama aur SCM dono par <b>Superuser</b> access.</li>
<li><b>Valid licence</b>.</li>
<li><b>Cloud Identity Engine Directory Sync</b> pehle integrate ho, taaki user-based rules ke liye users aur groups available hon.</li>
</ul>

<h3>Steps</h3>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Migration flow">
<rect x="10" y="30" width="105" height="60" rx="8" fill="#bae6fd"/><text x="62" y="55" text-anchor="middle" class="svg-ink" font-size="12">1 Export</text><text x="62" y="73" text-anchor="middle" class="svg-muted" font-size="11">running XML</text>
<rect x="130" y="30" width="105" height="60" rx="8" fill="#bae6fd"/><text x="182" y="55" text-anchor="middle" class="svg-ink" font-size="12">2 Start</text><text x="182" y="73" text-anchor="middle" class="svg-muted" font-size="11">SCM mein</text>
<rect x="250" y="30" width="105" height="60" rx="8" fill="#ddd6fe"/><text x="302" y="55" text-anchor="middle" class="svg-ink" font-size="12">3 Upload</text><text x="302" y="73" text-anchor="middle" class="svg-muted" font-size="11">+ master key</text>
<rect x="370" y="30" width="105" height="60" rx="8" fill="#ddd6fe"/><text x="422" y="55" text-anchor="middle" class="svg-ink" font-size="12">4 Review</text><text x="422" y="73" text-anchor="middle" class="svg-muted" font-size="11">diff ka</text>
<rect x="490" y="30" width="140" height="60" rx="8" fill="#fed7aa"/><text x="560" y="55" text-anchor="middle" class="svg-ink" font-size="12">5 Complete</text><text x="560" y="73" text-anchor="middle" class="svg-muted" font-size="11">irreversible</text>
<line x1="115" y1="60" x2="130" y2="60" stroke="#64748b" stroke-width="2"/><line x1="235" y1="60" x2="250" y2="60" stroke="#64748b" stroke-width="2"/><line x1="355" y1="60" x2="370" y2="60" stroke="#64748b" stroke-width="2"/><line x1="475" y1="60" x2="490" y2="60" stroke="#64748b" stroke-width="2"/>
<text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">Phir 6: SCM se configuration push karo</text>
</svg><p class="cap">Paanch decision steps, phir push. Step 5 undo nahi hota.</p></div>
<ol>
<li>Panorama running configuration ko XML ke roop mein <b>export</b> karo.</li>
<li>SCM mein Configuration, NGFW and Prisma Access par <b>migration start</b> karo.</li>
<li>File <b>upload</b> karo aur Panorama master key do.</li>
<li>SCM jo diff banata hai use <b>review</b> karo. Yahan aap padhte ho ki kya badlega.</li>
<li>Migration <b>complete</b> karo. Ye step irreversible hai.</li>
<li>SCM se configuration <b>push</b> karo aur verify karo.</li>
</ol>

<h3>Kya supported nahi hai</h3>
<ul>
<li><b>Data Filtering</b></li>
<li><b>FedRAMP</b></li>
<li><b>IoT Security</b></li>
<li><b>Multitenant</b> deployments</li>
<li><b>SSH Proxy</b></li>
<li><b>Portal aur gateways ke liye alag authentication</b></li>
</ul>
<p>Aapka tenant inme se kuch bhi use karta ho to ruko aur migrate karne se pehle plan karo. Diff mein <code>clientless-vpn</code> crypto-settings, <code>hip-profiles</code> rename, <code>mobile-user-redundancy</code> aur <code>exclude-video-traffic</code> jaise items ke differences expect karo. Har ek padho; ye known aur explainable hain, surprises nahi.</p>

<div class="eg"><p><b>Worked example (lab pa-ops-3).</b> Lab tenant ki decision table (infrastructure 10.255.0.0/24, AS 65534, pool 10.200.0.0/23, Panorama 10.10.0.10). Panorama version: 10.2, isliye 10.0+ prerequisite poora hai. Dono par Superuser: haan. Licence: valid. Cloud Identity Engine Directory Sync: abhi integrate nahi, isliye pehla task usse integrate karna hai. Unsupported items: tenant log forwarding match list mein Data Filtering aur ek rule mein SSH Proxy use karta hai. Decision: abhi migrate mat karo. Pehle un do items ko hatao ya replace karo, Directory Sync integrate karo, phir dobara chalao. Learner kehta hai migration one-way hai aur unsupported items ke examples ke roop mein Data Filtering, SSH Proxy aur FedRAMP batata hai.</p></div>

<h3>Risk management</h3>
<ol>
<li>Panorama configuration ka backup lo aur rakho (wapas nahi ja sakte, lekin compare kar sakte ho).</li>
<li>Migration review quiet window mein chalao, incident ke dauran nahi.</li>
<li>Diff ko security aur network owners se sign off karao.</li>
<li>Push ke baad teen reachability paths test karo: branch to internet, laptop to app, branch to HQ.</li>
<li>Runbooks update karo, kyunki menus aur push steps badal jaate hain (Commit and Push ki jagah Push Config).</li>
</ol>

<div class="warn"><p><b>Common mistakes.</b> Migration ko reversible maanna; Directory Sync prerequisite skip karna jisse user-based rules toot jaayein; complete hone tak unsupported items ignore karna; outage ke dauran migrate karna; operators ko Push Config par retrain karna bhool jana.</p></div>
<div class="exam"><p><b>Exam trap.</b> Migration sirf Panorama se SCM tak, one-way hai. Prerequisites: Panorama 10.0+, dono mein Superuser, valid licence, Cloud Identity Engine Directory Sync. Unsupported: Data Filtering, FedRAMP, IoT Security, multitenant, SSH Proxy, portal aur gateways ke liye alag authentication. Complete irreversible hai.</p></div>

<div class="scn"><h4>Migration jo diff par ruk gayi</h4><p>Ek team ne Friday ko migration schedule kiya. Thursday ko review chalaya to ek rule SSH Proxy use karta mila aur ek bhoola hua multitenant setup mila. Unhone postpone kiya, rule redesign kiya aur doosre tenant owner ke saath plan banaya. Migration phir ek quiet Tuesday ko bina rollback request ke complete hui, kyunki rollback kabhi possible tha hi nahi aur zaroori bhi nahi pada.</p><p><b>Lesson:</b> review step aapka aakhri mauka hai ki aap apna mann badal sako.</p></div>

<div class="iv"><p class="q">"Prisma Access ko Panorama se SCM mein migrate karne se pehle kya check karoge?"</p><p>Panorama 10.0 ya naya, dono par Superuser, valid licence, Cloud Identity Engine Directory Sync integrated, unsupported items ka check (Data Filtering, FedRAMP, IoT Security, multitenant, SSH Proxy, portal aur gateway ka alag authentication), reviewed diff, aur ye acceptance ki move irreversible hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Migration sirf Panorama se SCM tak hai aur undo nahi hota.</li>
<li>Prerequisites: Panorama 10.0+, dono par Superuser, valid licence, Directory Sync pehle.</li>
<li>Steps: XML export, start, master key ke saath upload, diff review, complete, push.</li>
<li>Unsupported items shuru karne se pehle resolve karo.</li>
<li>Push ke baad reachability test karo aur runbooks update karo.</li>
</ul></div>
`}};export{e as default};