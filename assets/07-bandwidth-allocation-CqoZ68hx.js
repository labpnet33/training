var e={id:`bandwidth-allocation`,h:{en:`Bandwidth allocation models`,hi:`Bandwidth allocation models`},body:{en:`
<p>Imagine a courier company that sells you a monthly "lane capacity" at each sorting centre. You can say, "this much for the whole region" or "this much for each branch". Prisma Access remote networks work the same way. You license a total amount of bandwidth and you decide how it is spread. This chapter explains the models, the limits and how to check usage.</p>

<h3>What is being allocated?</h3>
<p>Prisma Access remote network bandwidth is a licensed amount, in Mbps. You split it over locations or sites. A single termination node supports up to 1,000 Mbps, so a very large site or a busy compute location uses more than one node behind the scenes.</p>

<h3>The aggregate bandwidth model (release 4.0 and later)</h3>
<ul>
<li>You allocate bandwidth to a <b>compute location</b>, not to each branch.</li>
<li>Prisma Access divides that bandwidth among the sites in the compute location.</li>
<li>The minimum is <b>50 Mbps per compute location</b>. The maximum is whatever licensed bandwidth is still unallocated.</li>
<li>In Panorama, the gear icon on the Remote Networks page opens Bandwidth Allocation. In SCM, use Remote Networks &gt; Bandwidth Management.</li>
</ul>

<h3>Per-site allocation (release 6.0 and later)</h3>
<p>From release 6.0 you can allocate either per site or by compute location. New 6.0 deployments allocate <b>per site</b>. Per-site allocation gives a branch its own guaranteed share, which is helpful for important or noisy sites.</p>

<h3>Moving between models</h3>
<p>Moving from the older per-location allocation to the aggregate model is <b>permanent in Panorama</b>. Plan the move and do not treat it as a test switch.</p>

<table class="cmp"><tr><th>Item</th><th>Aggregate (by compute location)</th><th>Per site (6.0 new deployments)</th></tr>
<tr><td>You assign bandwidth to</td><td>Compute location</td><td>Each site</td></tr>
<tr><td>Sharing between sites</td><td>Prisma Access divides it</td><td>You decide the share</td></tr>
<tr><td>Minimum</td><td>50 Mbps per compute location</td><td>Per the console limits</td></tr>
<tr><td>Best for</td><td>Many small, similar branches</td><td>Mixed sizes, key sites</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Bandwidth pool example">
<rect x="20" y="20" width="600" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="46" text-anchor="middle" class="svg-ink" font-size="14">Licensed remote network bandwidth (example: 500 Mbps)</text>
<rect x="20" y="90" width="290" height="100" rx="10" fill="#bae6fd"/><text x="165" y="116" text-anchor="middle" class="svg-ink" font-size="13">Compute location A: 300 Mbps</text><text x="165" y="140" text-anchor="middle" class="svg-muted" font-size="12">shared by sites 1, 2, 3</text><text x="165" y="162" text-anchor="middle" class="svg-muted" font-size="12">Prisma Access divides it</text>
<rect x="330" y="90" width="290" height="100" rx="10" fill="#bbf7d0"/><text x="475" y="116" text-anchor="middle" class="svg-ink" font-size="13">Compute location B: 200 Mbps</text><text x="475" y="140" text-anchor="middle" class="svg-muted" font-size="12">shared by sites 4, 5</text><text x="475" y="162" text-anchor="middle" class="svg-muted" font-size="12">minimum allowed is 50 Mbps</text>
</svg><p class="cap">An illustrative split of a licence. Your numbers come from your own subscription.</p></div>

<div class="eg"><p><b>Worked example (illustrative numbers).</b> A company licenses 500 Mbps. It allocates 300 Mbps to the compute location that holds Mumbai and Chennai branches, and 200 Mbps to the one for Delhi. If the Delhi group needs more, the admin can only raise it by the amount still unallocated (here 0), so he must lower another location first. Trying to give a compute location 40 Mbps fails, because the minimum is 50.</p></div>

<h3>Watching usage</h3>
<ul>
<li><b>Panorama:</b> Status &gt; Monitor &gt; Remote Networks shows bandwidth; the figure turns red above 80 percent.</li>
<li><b>SCM:</b> Activity Insights: Branch Sites shows tunnel health and bandwidth per site.</li>
</ul>
<p>When a branch is often red, either raise its allocation, move bandwidth from a quiet location, or add another remote network at a different node.</p>

<h3>Mobile and service connection licensing, for contrast</h3>
<p>Do not mix the numbers up. Mobile users are licensed by user count. Service connections have their own limits: base licences allow up to 5, and the Private Application add-on allows up to 200 per tenant. Remote network bandwidth is a separate pool.</p>

<div class="warn"><p><b>Common mistakes.</b> Allocating below 50 Mbps for a compute location; forgetting that the change is permanent when moving to aggregate in Panorama; assuming one branch gets the whole compute-location figure; ignoring red bandwidth warnings.</p></div>
<div class="exam"><p><b>Exam trap.</b> Aggregate model: since 4.0, per compute location, minimum 50 Mbps. Since 6.0: per site or by compute location, with new deployments per site. One node = 1,000 Mbps. Red above 80 percent.</p></div>

<div class="scn"><h4>Slow branch at month end</h4><p>A branch complained about slow uploads every month end. The status page showed its bandwidth in red above 80 percent. Under the aggregate model the compute location had only the minimum. The admin moved licensed bandwidth from an idle location, and the red warning cleared the next month.</p><p><b>Lesson:</b> bandwidth is a plan. Read the usage page before you blame the tunnel.</p></div>

<div class="iv"><p class="q">"How is remote network bandwidth allocated in Prisma Access?"</p><p>In the aggregate model you assign bandwidth to a compute location, with a 50 Mbps minimum, and Prisma Access divides it among the sites. From release 6.0 you can allocate per site, and new 6.0 deployments do. A termination node supports up to 1,000 Mbps. Moving from per-location to aggregate is permanent in Panorama.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Bandwidth is licensed in Mbps and allocated by you.</li>
<li>Aggregate (4.0+): per compute location, minimum 50 Mbps, shared by its sites.</li>
<li>6.0+: per site or per compute location; new deployments use per site.</li>
<li>The switch to aggregate in Panorama cannot be reversed.</li>
<li>Monitor shows red above 80 percent usage.</li>
</ul></div>
`,hi:`
<p>Ek courier company socho jo har sorting centre par aapko monthly "lane capacity" bechti hai. Aap keh sakte ho, "poore region ke liye itni" ya "har branch ke liye itni". Prisma Access remote networks bhi aise hi kaam karte hain. Aap total bandwidth license karte ho aur decide karte ho ki woh kaise spread ho. Yeh chapter models, limits aur usage check karna samjhata hai.</p>

<h3>Kya allocate hota hai?</h3>
<p>Prisma Access remote network bandwidth Mbps mein ek licensed amount hai. Aap ise locations ya sites mein baantte ho. Ek termination node up to 1,000 Mbps support karta hai, isliye bahut bade site ya busy compute location ke peeche ek se zyada node use hote hain.</p>

<h3>Aggregate bandwidth model (release 4.0 aur baad)</h3>
<ul>
<li>Aap bandwidth <b>compute location</b> ko allocate karte ho, har branch ko nahi.</li>
<li>Prisma Access us bandwidth ko compute location ke sites mein divide karta hai.</li>
<li>Minimum <b>50 Mbps per compute location</b> hai. Maximum woh licensed bandwidth hai jo abhi unallocated hai.</li>
<li>Panorama mein Remote Networks page ke gear icon se Bandwidth Allocation khulta hai. SCM mein Remote Networks &gt; Bandwidth Management use karo.</li>
</ul>

<h3>Per-site allocation (release 6.0 aur baad)</h3>
<p>Release 6.0 se aap per site ya compute location ke hisaab se allocate kar sakte ho. Naye 6.0 deployments <b>per site</b> allocate karte hain. Per-site allocation branch ko apna guaranteed share deta hai, jo important ya noisy sites ke liye helpful hai.</p>

<h3>Models ke beech move karna</h3>
<p>Purane per-location allocation se aggregate model mein jaana <b>Panorama mein permanent</b> hai. Move ko plan karo aur ise test switch mat samjho.</p>

<table class="cmp"><tr><th>Item</th><th>Aggregate (compute location se)</th><th>Per site (6.0 naye deployments)</th></tr>
<tr><td>Bandwidth kise assign hoti hai</td><td>Compute location</td><td>Har site</td></tr>
<tr><td>Sites ke beech sharing</td><td>Prisma Access divide karta hai</td><td>Aap share decide karte ho</td></tr>
<tr><td>Minimum</td><td>50 Mbps per compute location</td><td>Console limits ke hisaab se</td></tr>
<tr><td>Best for</td><td>Bahut chhote, similar branches</td><td>Mixed sizes, key sites</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Bandwidth pool example">
<rect x="20" y="20" width="600" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="46" text-anchor="middle" class="svg-ink" font-size="14">Licensed remote network bandwidth (example: 500 Mbps)</text>
<rect x="20" y="90" width="290" height="100" rx="10" fill="#bae6fd"/><text x="165" y="116" text-anchor="middle" class="svg-ink" font-size="13">Compute location A: 300 Mbps</text><text x="165" y="140" text-anchor="middle" class="svg-muted" font-size="12">sites 1, 2, 3 mein shared</text><text x="165" y="162" text-anchor="middle" class="svg-muted" font-size="12">Prisma Access divide karta hai</text>
<rect x="330" y="90" width="290" height="100" rx="10" fill="#bbf7d0"/><text x="475" y="116" text-anchor="middle" class="svg-ink" font-size="13">Compute location B: 200 Mbps</text><text x="475" y="140" text-anchor="middle" class="svg-muted" font-size="12">sites 4, 5 mein shared</text><text x="475" y="162" text-anchor="middle" class="svg-muted" font-size="12">minimum 50 Mbps</text>
</svg><p class="cap">License ka illustrative split. Aapke numbers aapki subscription se aate hain.</p></div>

<div class="eg"><p><b>Worked example (illustrative numbers).</b> Company 500 Mbps license karti hai. Mumbai aur Chennai branches wali compute location ko 300 Mbps, aur Delhi wali ko 200 Mbps allocate karti hai. Delhi group ko aur chahiye to admin sirf utna badha sakta hai jitna unallocated hai (yahan 0), isliye pehle kisi aur location ko kam karna padega. Kisi compute location ko 40 Mbps dene ki koshish fail hogi kyunki minimum 50 hai.</p></div>

<h3>Usage dekhna</h3>
<ul>
<li><b>Panorama:</b> Status &gt; Monitor &gt; Remote Networks bandwidth dikhata hai; 80 percent se upar figure red ho jaata hai.</li>
<li><b>SCM:</b> Activity Insights: Branch Sites har site ka tunnel health aur bandwidth dikhata hai.</li>
</ul>
<p>Branch baar baar red ho to ya uski allocation badhao, quiet location se bandwidth lo, ya alag node par aur ek remote network add karo.</p>

<h3>Mobile aur service connection licensing, contrast ke liye</h3>
<p>Numbers ko mix mat karo. Mobile users user count se licensed hote hain. Service connections ki apni limits hain: base licences 5 tak, aur Private Application add-on per tenant 200 tak. Remote network bandwidth alag pool hai.</p>

<div class="warn"><p><b>Common mistakes.</b> Compute location ko 50 Mbps se kam dena; Panorama mein aggregate par move permanent hai yeh bhoolna; yeh sochna ki ek branch ko poora compute-location figure milta hai; red bandwidth warnings ignore karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Aggregate model: 4.0 se, per compute location, minimum 50 Mbps. 6.0 se: per site ya compute location, naye deployments per site. Ek node = 1,000 Mbps. 80 percent se upar red.</p></div>

<div class="scn"><h4>Month end par slow branch</h4><p>Ek branch har month end par slow uploads ki shikayat karta tha. Status page par uski bandwidth 80 percent se upar red thi. Aggregate model mein compute location ke paas sirf minimum tha. Admin ne idle location se licensed bandwidth move ki, aur agle mahine red warning clear ho gayi.</p><p><b>Lesson:</b> bandwidth ek plan hai. Tunnel ko blame karne se pehle usage page padho.</p></div>

<div class="iv"><p class="q">"Prisma Access mein remote network bandwidth kaise allocate hoti hai?"</p><p>Aggregate model mein compute location ko bandwidth assign karte ho, 50 Mbps minimum ke saath, aur Prisma Access use sites mein divide karta hai. Release 6.0 se per site allocate kar sakte ho, aur naye 6.0 deployments aisa hi karte hain. Ek termination node up to 1,000 Mbps support karta hai. Panorama mein per-location se aggregate mein move permanent hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Bandwidth Mbps mein licensed hoti hai aur aap allocate karte ho.</li>
<li>Aggregate (4.0+): per compute location, minimum 50 Mbps, uske sites mein shared.</li>
<li>6.0+: per site ya per compute location; naye deployments per site.</li>
<li>Panorama mein aggregate par switch wapas nahi hota.</li>
<li>Monitor 80 percent usage se upar red dikhata hai.</li>
</ul></div>
`}};export{e as default};