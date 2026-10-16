var e={id:`what-is-panorama`,h:{en:`What Panorama is: modes and roles`,hi:`Panorama kya hai: modes aur roles`},body:{en:`
<p>Think of a company's head office building. It can play different roles. One floor holds the managers who decide the rules. Another floor is the records room where every branch sends copies of its daily reports. In a small company both live in the same building. In a large company the records room may move to its own building because it needs far more storage. Panorama follows the same idea: one product, with management duties and log-storage duties that can sit together or be separated.</p>

<h3>The two jobs</h3>
<p>Panorama does two broad jobs. The first is <b>configuration management</b>: it holds device groups, templates, administrators and the list of managed firewalls, and pushes configuration to them. The second is <b>log collection and reporting</b>: firewalls can forward their logs to Panorama so you can look at traffic from the whole estate in one place. A component that only receives and stores logs is called a <b>Log Collector</b>.</p>

<h3>Deployment modes and roles</h3>
<p>You will meet these terms in the documentation. Keep the idea simple and always verify details for your PAN-OS version.</p>
<table class="tbl"><tr><th>Mode or role</th><th>Plain meaning</th></tr>
<tr><td>Panorama mode</td><td>Does both jobs: management plus its own local log collection. The default picture used in the labs.</td></tr>
<tr><td>Management only</td><td>Manages configuration but does not store logs locally; logs go to separate Log Collectors.</td></tr>
<tr><td>Log Collector</td><td>Receives and stores logs from firewalls. Its configuration is still controlled from a Panorama management instance.</td></tr>
</table>
<p>Do not memorise exact capacity numbers or feature lists for each mode here; they change between releases and hardware. Check the documentation for your PAN-OS version.</p>

<h3>Virtual or appliance</h3>
<p>Panorama can run as a virtual machine or on a dedicated hardware appliance. The functions you study in this module are the same in both. What changes is sizing, storage and how you buy and deploy it. In our labs, <b>NK-PANORAMA</b> (device PANO) has management IP 192.0.2.50 and manages three branch firewalls. A second Panorama, NK-PANORAMA-2 at 192.0.2.51, appears only in later modules about high availability.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Panorama roles">
<rect x="20" y="20" width="170" height="70" rx="8" fill="#ddd6fe"/><text x="105" y="48" text-anchor="middle" class="svg-ink" font-size="13">Management</text><text x="105" y="68" text-anchor="middle" class="svg-muted" font-size="12">device groups, templates</text>
<rect x="235" y="20" width="170" height="70" rx="8" fill="#fde68a"/><text x="320" y="48" text-anchor="middle" class="svg-ink" font-size="13">Log collection</text><text x="320" y="68" text-anchor="middle" class="svg-muted" font-size="12">store and search logs</text>
<rect x="450" y="20" width="170" height="70" rx="8" fill="#bae6fd"/><text x="535" y="48" text-anchor="middle" class="svg-ink" font-size="13">Managed firewalls</text><text x="535" y="68" text-anchor="middle" class="svg-muted" font-size="12">enforce policy</text>
<line x1="190" y1="55" x2="235" y2="55" stroke="#64748b" stroke-width="2"/><line x1="405" y1="55" x2="450" y2="55" stroke="#64748b" stroke-width="2"/>
<text x="320" y="140" text-anchor="middle" class="svg-ink" font-size="13">Panorama mode = both boxes in one system</text>
<text x="320" y="165" text-anchor="middle" class="svg-muted" font-size="12">Management only + Log Collectors = the two boxes split</text>
</svg><p class="cap">The two jobs of Panorama. Whether they share one system is a design choice.</p></div>

<h3>What Panorama is not</h3>
<p>Panorama is not a firewall: it does not inspect user traffic. It is also not magic: a firewall still needs a working management network path to it, and the firewall's own settings (such as its management IP) must be correct before Panorama can manage it. That is exactly what the first labs practise.</p>

<div class="eg"><p><b>Worked example.</b> MyPnetLab has 3 firewalls today and plans 40 branch sites in two years. At 3 sites a single Panorama in Panorama mode is fine. At 40 sites with long log retention, the team may decide on a management-only design with separate collectors. The decision comes from log volume, retention and resilience, not from the number of rules.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Panorama manages firewalls" does not mean "Panorama forwards their traffic". If a question asks what happens to user traffic when Panorama is down, the answer is that firewalls continue enforcing the last configuration they received.</p></div>

<div class="scn"><h4>Choosing the first deployment</h4><p>A training company with three branch firewalls asked whether it needed dedicated log collectors. The engineer checked expected log volume and the retention the auditors wanted. Both were modest, so they started with one Panorama doing both jobs and wrote down the trigger for splitting later: when log volume or retention outgrew the system.</p><p><b>Lesson:</b> start simple, record the condition that would make you change the design.</p></div>

<div class="iv"><p class="q">"What is the difference between Panorama mode and management only?"</p><p>Panorama mode manages configuration and also collects and stores logs locally. Management only does the configuration side and relies on separate Log Collectors for log storage. Mention that capacities depend on the platform and the PAN-OS version.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Panorama does configuration management and log collection and reporting.</li>
<li>Panorama mode does both; management only plus Log Collectors splits them.</li>
<li>Virtual and appliance forms offer the same functions; sizing differs.</li>
<li>Panorama is never in the user traffic path.</li>
<li>Check the documentation for your PAN-OS version for capacities and exact mode behaviour.</li>
</ul></div>
`,hi:`
<p>Socho ek company ki head office building. Usme alag-alag roles ho sakte hain. Ek floor par managers hain jo rules decide karte hain. Doosre floor par records room hai jahan har branch apni daily reports ki copies bhejti hai. Chhoti company mein dono ek hi building mein hote hain. Badi company mein records room apni alag building mein chala jata hai kyunki use bahut zyada storage chahiye. Panorama bhi yahi idea follow karta hai: ek product, jisme management duties aur log-storage duties saath ya alag ho sakti hain.</p>

<h3>Do jobs</h3>
<p>Panorama do broad jobs karta hai. Pehli hai <b>configuration management</b>: wo device groups, templates, administrators aur managed firewalls ki list rakhta hai, aur configuration push karta hai. Doosri hai <b>log collection aur reporting</b>: firewalls apne logs Panorama ko forward kar sakte hain taaki poore estate ka traffic ek jagah dekh sako. Jo component sirf logs receive aur store karta hai use <b>Log Collector</b> kehte hain.</p>

<h3>Deployment modes aur roles</h3>
<p>Ye terms documentation mein milenge. Idea simple rakho aur details apne PAN-OS version ke liye verify karo.</p>
<table class="tbl"><tr><th>Mode ya role</th><th>Simple matlab</th></tr>
<tr><td>Panorama mode</td><td>Dono jobs karta hai: management plus apna local log collection. Labs mein yahi default picture hai.</td></tr>
<tr><td>Management only</td><td>Configuration manage karta hai par logs local store nahi karta; logs alag Log Collectors mein jate hain.</td></tr>
<tr><td>Log Collector</td><td>Firewalls ke logs receive aur store karta hai. Iski configuration phir bhi Panorama management instance se control hoti hai.</td></tr>
</table>
<p>Har mode ke exact capacity numbers ya feature lists yahan yaad mat karo; wo releases aur hardware ke saath badalte hain. Apne PAN-OS version ki documentation check karo.</p>

<h3>Virtual ya appliance</h3>
<p>Panorama virtual machine ki tarah ya dedicated hardware appliance par chal sakta hai. Is module ke functions dono mein same hain. Jo badalta hai wo sizing, storage aur kharidne aur deploy karne ka tarika hai. Labs mein <b>NK-PANORAMA</b> (device PANO) ka management IP 192.0.2.50 hai aur wo teen branch firewalls manage karta hai. Doosra Panorama, NK-PANORAMA-2 192.0.2.51 par, sirf aage ke high availability modules mein aata hai.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Panorama roles">
<rect x="20" y="20" width="170" height="70" rx="8" fill="#ddd6fe"/><text x="105" y="48" text-anchor="middle" class="svg-ink" font-size="13">Management</text><text x="105" y="68" text-anchor="middle" class="svg-muted" font-size="12">device groups, templates</text>
<rect x="235" y="20" width="170" height="70" rx="8" fill="#fde68a"/><text x="320" y="48" text-anchor="middle" class="svg-ink" font-size="13">Log collection</text><text x="320" y="68" text-anchor="middle" class="svg-muted" font-size="12">logs store aur search</text>
<rect x="450" y="20" width="170" height="70" rx="8" fill="#bae6fd"/><text x="535" y="48" text-anchor="middle" class="svg-ink" font-size="13">Managed firewalls</text><text x="535" y="68" text-anchor="middle" class="svg-muted" font-size="12">policy enforce karte hain</text>
<line x1="190" y1="55" x2="235" y2="55" stroke="#64748b" stroke-width="2"/><line x1="405" y1="55" x2="450" y2="55" stroke="#64748b" stroke-width="2"/>
<text x="320" y="140" text-anchor="middle" class="svg-ink" font-size="13">Panorama mode = dono boxes ek system mein</text>
<text x="320" y="165" text-anchor="middle" class="svg-muted" font-size="12">Management only + Log Collectors = dono boxes alag</text>
</svg><p class="cap">Panorama ki do jobs. Dono ek system mein hon ya nahi, ye design choice hai.</p></div>

<h3>Panorama kya nahi hai</h3>
<p>Panorama firewall nahi hai: wo user traffic inspect nahi karta. Ye magic bhi nahi hai: firewall ko uske tak working management network path chahiye, aur firewall ki apni settings (jaise management IP) sahi honi chahiye tabhi Panorama use manage kar sakta hai. Pehle labs yahi practise karate hain.</p>

<div class="eg"><p><b>Worked example.</b> MyPnetLab ke aaj 3 firewalls hain aur do saal mein 40 branch sites ka plan hai. 3 sites par Panorama mode mein ek Panorama theek hai. 40 sites aur lambi log retention par team management-only design aur alag collectors choose kar sakti hai. Decision log volume, retention aur resilience se aata hai, rules ki sankhya se nahi.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Panorama firewalls manage karta hai" ka matlab "Panorama unka traffic forward karta hai" nahi hai. Agar sawal puche ki Panorama down hone par user traffic ka kya hota hai, to answer hai ki firewalls last mili configuration enforce karte rehte hain.</p></div>

<div class="scn"><h4>Pehla deployment choose karna</h4><p>Teen branch firewalls wali training company ne pucha ki dedicated log collectors chahiye ya nahi. Engineer ne expected log volume aur auditors ki chahi hui retention check ki. Dono modest nikli, isliye ek Panorama se dono jobs se shuru kiya aur split ka trigger likh liya: jab log volume ya retention system se bahar ho jaye.</p><p><b>Lesson:</b> simple se shuru karo, wo condition likh lo jo design badalne par majboor karegi.</p></div>

<div class="iv"><p class="q">"Panorama mode aur management only mein kya difference hai?"</p><p>Panorama mode configuration manage karta hai aur logs bhi local collect aur store karta hai. Management only sirf configuration side karta hai aur log storage ke liye alag Log Collectors par depend karta hai. Ye jodo ki capacities platform aur PAN-OS version par depend karti hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Panorama configuration management aur log collection aur reporting karta hai.</li>
<li>Panorama mode dono karta hai; management only plus Log Collectors dono ko alag karta hai.</li>
<li>Virtual aur appliance mein functions same hain; sizing alag hoti hai.</li>
<li>Panorama kabhi user traffic path mein nahi hota.</li>
<li>Capacities aur exact mode behaviour ke liye apne PAN-OS version ki documentation check karo.</li>
</ul></div>
`}};export{e as default};