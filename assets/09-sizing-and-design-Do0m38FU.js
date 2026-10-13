var e={id:`sizing-and-design`,h:{en:`Sizing and design choices`,hi:`Sizing aur design choices`},body:{en:`
<p>When a family plans a kitchen, they do not start by buying the biggest fridge. They ask how many people eat, how often they cook and what happens if the fridge fails. Designing a Panorama deployment is similar: start from the questions, not from the product catalogue. How many firewalls? How many logs per day, and for how long must they be kept? What must keep working if Panorama is down? Who will administer it?</p>

<h3>The design questions</h3>
<table class="tbl"><tr><th>Question</th><th>Why it matters</th></tr>
<tr><td>How many firewalls, and how fast will it grow?</td><td>Drives the size of the management system. Limits depend on platform and PAN-OS version; check the documentation.</td></tr>
<tr><td>How many logs and how long to retain?</td><td>Drives log storage and whether to use separate Log Collectors.</td></tr>
<tr><td>What if Panorama is unavailable?</td><td>Drives high availability (a second Panorama, covered in a later module).</td></tr>
<tr><td>How does the management network look?</td><td>Drives addressing, gateways and who may reach management IPs.</td></tr>
<tr><td>Who administers, from where?</td><td>Drives roles, access domains and authentication.</td></tr>
</table>

<h3>Single Panorama, or split roles</h3>
<p>The simplest design is one Panorama in Panorama mode managing everything and keeping logs locally. It is easy to operate and a good start for small estates like three branch firewalls. As log volume or retention grows, a common step is to separate the jobs: a management-only Panorama plus Log Collectors, possibly in more than one location so logs stay close to the firewalls that produce them. Do not memorise thresholds; when to split depends on your version and hardware.</p>

<h3>High availability preview</h3>
<p>Panorama can run as an active/passive pair so that management survives the loss of one peer. In a later module you will configure it. For now, remember the design consequence: a firewall that knows only one Panorama address loses central management when that one is unavailable, while a firewall that knows a second address has somewhere else to call. The firewall setting <code>panorama-server-2</code> exists for that reason.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Design options">
<rect x="20" y="20" width="270" height="70" rx="8" fill="#ddd6fe"/><text x="155" y="48" text-anchor="middle" class="svg-ink" font-size="13">Option A: one Panorama</text><text x="155" y="68" text-anchor="middle" class="svg-muted" font-size="12">management + logs together</text>
<rect x="350" y="20" width="270" height="70" rx="8" fill="#fde68a"/><text x="485" y="48" text-anchor="middle" class="svg-ink" font-size="13">Option B: split roles</text><text x="485" y="68" text-anchor="middle" class="svg-muted" font-size="12">management only + collectors</text>
<rect x="20" y="120" width="270" height="70" rx="8" fill="#bbf7d0"/><text x="155" y="148" text-anchor="middle" class="svg-ink" font-size="13">Option C: Panorama HA pair</text><text x="155" y="168" text-anchor="middle" class="svg-muted" font-size="12">active + passive peer</text>
<rect x="350" y="120" width="270" height="70" rx="8" fill="#bae6fd"/><text x="485" y="148" text-anchor="middle" class="svg-ink" font-size="13">Management network</text><text x="485" y="168" text-anchor="middle" class="svg-muted" font-size="12">design this for every option</text>
</svg><p class="cap">Choices combine: for example B plus C. The management network matters in all of them.</p></div>

<h3>Management network design</h3>
<p>In the labs, all management interfaces sit in 192.0.2.0/24 with gateway 192.0.2.1. Good habits: reserve a documented address range, keep management on its own network, give every device a default gateway when managed devices might be on different subnets, and restrict who can reach these addresses. When Panorama and a firewall are in different subnets, both need a route to each other; a missing gateway on one side is a classic cause of a connection that never forms.</p>

<div class="eg"><p><b>Worked example.</b> Network Kings today: 3 firewalls, modest logs. Decision: one Panorama in Panorama mode. Written triggers for change: (1) more than a defined number of sites, (2) log retention requirement longer than local storage allows, (3) business decision that management must survive a Panorama failure, which triggers an HA pair. The document is short, and a future engineer knows why the design is what it is.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Buying for the largest imaginable future; ignoring log retention until storage is full; putting Panorama and firewalls on the same network as users; designing HA without giving firewalls the second Panorama address. Capacity and limits depend on version and platform; check the documentation for your PAN-OS version.</p></div>

<div class="scn"><h4>Logs fill the disk</h4><p>A company ran one Panorama and was asked by auditors to keep a year of logs. Six months in, storage ran short and older logs started to age out earlier than the audit allowed. The fix was to plan collectors and retention from the audit requirement rather than from the number of firewalls.</p><p><b>Lesson:</b> size from retention and volume, not from device count alone.</p></div>

<div class="iv"><p class="q">"How would you design Panorama for a company growing from 3 to 40 firewalls?"</p><p>Start with requirements: log volume, retention, availability and administration model. Begin with one Panorama; plan separate Log Collectors when volume or retention demand it; add an HA pair if management must survive a failure; design a dedicated management network with gateways; give firewalls both Panorama addresses. Verify limits for the PAN-OS version in use.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Design from requirements: firewall count, log volume and retention, availability, administration.</li>
<li>Start with one Panorama; split roles or add HA when requirements demand.</li>
<li>Firewalls need the second Panorama address to benefit from HA.</li>
<li>Management network needs its own range, gateways and access control.</li>
<li>Limits and capacities depend on platform and PAN-OS version.</li>
</ul></div>
`,hi:`
<p>Jab family kitchen plan karti hai to sabse bada fridge kharidne se shuru nahi karti. Wo poochhti hai kitne log khana khate hain, kitni baar pakate hain aur fridge kharab ho jaye to kya hoga. Panorama deployment design bhi aisa hi hai: product catalogue se nahi, sawalon se shuru karo. Kitne firewalls? Roz kitne logs, aur kitne time tak rakhne hain? Panorama down ho to kya chalte rehna chahiye? Administer kaun karega?</p>

<h3>Design ke sawal</h3>
<table class="tbl"><tr><th>Sawal</th><th>Kyun matter karta hai</th></tr>
<tr><td>Kitne firewalls, aur kitni tezi se badhenge?</td><td>Management system ka size decide karta hai. Limits platform aur PAN-OS version par depend karti hain; documentation check karo.</td></tr>
<tr><td>Kitne logs aur kitne time tak retain?</td><td>Log storage aur alag Log Collectors ka decision.</td></tr>
<tr><td>Panorama unavailable ho to?</td><td>High availability ka decision (doosra Panorama, aage ke module mein).</td></tr>
<tr><td>Management network kaisa hai?</td><td>Addressing, gateways aur management IPs tak kaun pahunche, ye decide karta hai.</td></tr>
<tr><td>Administer kaun karega, kahan se?</td><td>Roles, access domains aur authentication decide karta hai.</td></tr>
</table>

<h3>Single Panorama ya split roles</h3>
<p>Sabse simple design hai Panorama mode mein ek Panorama jo sab manage kare aur logs local rakhe. Chalana aasan hai aur teen branch firewalls jaise chhote estates ke liye achha start hai. Log volume ya retention badhe to common step hai jobs alag karna: management-only Panorama plus Log Collectors, shayad ek se zyada location par taaki logs un firewalls ke paas rahein jo unhe banate hain. Thresholds yaad mat karo; split kab karna hai ye aapke version aur hardware par depend karta hai.</p>

<h3>High availability preview</h3>
<p>Panorama active/passive pair ki tarah chal sakta hai taaki ek peer jaane par bhi management bachi rahe. Aage ke module mein configure karoge. Abhi design consequence yaad rakho: jo firewall sirf ek Panorama address jaanta hai wo us ke unavailable hone par central management kho deta hai, jabki jo firewall doosra address jaanta hai uske paas call karne ki doosri jagah hai. Firewall setting <code>panorama-server-2</code> isi liye hai.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Design options">
<rect x="20" y="20" width="270" height="70" rx="8" fill="#ddd6fe"/><text x="155" y="48" text-anchor="middle" class="svg-ink" font-size="13">Option A: ek Panorama</text><text x="155" y="68" text-anchor="middle" class="svg-muted" font-size="12">management + logs saath</text>
<rect x="350" y="20" width="270" height="70" rx="8" fill="#fde68a"/><text x="485" y="48" text-anchor="middle" class="svg-ink" font-size="13">Option B: split roles</text><text x="485" y="68" text-anchor="middle" class="svg-muted" font-size="12">management only + collectors</text>
<rect x="20" y="120" width="270" height="70" rx="8" fill="#bbf7d0"/><text x="155" y="148" text-anchor="middle" class="svg-ink" font-size="13">Option C: Panorama HA pair</text><text x="155" y="168" text-anchor="middle" class="svg-muted" font-size="12">active + passive peer</text>
<rect x="350" y="120" width="270" height="70" rx="8" fill="#bae6fd"/><text x="485" y="148" text-anchor="middle" class="svg-ink" font-size="13">Management network</text><text x="485" y="168" text-anchor="middle" class="svg-muted" font-size="12">har option ke liye design karo</text>
</svg><p class="cap">Choices combine hote hain: jaise B plus C. Management network sab mein matter karta hai.</p></div>

<h3>Management network design</h3>
<p>Labs mein saare management interfaces 192.0.2.0/24 mein hain, gateway 192.0.2.1. Achhi aadatein: documented address range reserve karo, management ko apne network par rakho, jahan managed devices alag subnets par ho sakte hain wahan har device ko default gateway do, aur in addresses tak kaun pahunche ye restrict karo. Panorama aur firewall alag subnets mein hon to dono ko ek doosre tak route chahiye; ek taraf gateway missing hona wo connection ki classic wajah hai jo kabhi banta hi nahi.</p>

<div class="eg"><p><b>Worked example.</b> Network Kings aaj: 3 firewalls, modest logs. Decision: Panorama mode mein ek Panorama. Change ke written triggers: (1) sites ek tay sankhya se zyada, (2) log retention requirement local storage se lambi, (3) business decision ki Panorama failure par bhi management bachi rahe, jo HA pair trigger karta hai. Document chhota hai, aur future engineer jaanta hai design aisa kyun hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Sabse bade imaginable future ke liye khareedna; storage bharne tak log retention ignore karna; Panorama aur firewalls ko users wale network par rakhna; firewalls ko doosra Panorama address diye bina HA design karna. Capacity aur limits version aur platform par depend karti hain; apne PAN-OS version ki documentation check karo.</p></div>

<div class="scn"><h4>Logs se disk bhar gayi</h4><p>Ek company ek Panorama chalati thi aur auditors ne saal bhar ke logs rakhne ko kaha. Chhe mahine baad storage kam pad gayi aur purane logs audit ke allow karne se pehle age out hone lage. Fix ye tha ki collectors aur retention audit requirement se plan hon, firewalls ki sankhya se nahi.</p><p><b>Lesson:</b> size retention aur volume se karo, sirf device count se nahi.</p></div>

<div class="iv"><p class="q">"3 se 40 firewalls tak badhne wali company ke liye Panorama kaise design karoge?"</p><p>Requirements se shuru: log volume, retention, availability aur administration model. Ek Panorama se shuru; volume ya retention maange to alag Log Collectors; management failure survive kare to HA pair; gateways ke saath dedicated management network; firewalls ko dono Panorama addresses. Use ho rahe PAN-OS version ke limits verify karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Requirements se design: firewall count, log volume aur retention, availability, administration.</li>
<li>Ek Panorama se shuru; requirements maange to roles split karo ya HA jodo.</li>
<li>HA ka fayda lene ke liye firewalls ko doosra Panorama address chahiye.</li>
<li>Management network ko apni range, gateways aur access control chahiye.</li>
<li>Limits aur capacities platform aur PAN-OS version par depend karti hain.</li>
</ul></div>
`}};export{e as default};