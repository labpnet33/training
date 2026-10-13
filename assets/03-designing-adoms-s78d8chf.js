var e={id:`designing-adoms`,h:{en:`Designing ADOMs: by business unit or region, naming and what not to do`,hi:`ADOMs ka design: business unit ya region ke hisaab se, naming aur kya nahi karna`},body:{en:`
<p>Before a society builds flats, the architect decides how many blocks and which families go where. Moving a family later is possible but noisy. ADOMs are the same: creating them is a two-minute job, choosing them well is the real work, because each ADOM carries its own logs, quota, retention and reports. Moving a device later opens a gap of discarded logs (chapter 2) and leaves its history behind.</p>

<h3>Ask four questions first</h3>
<ol>
<li><b>Who must not see whose logs?</b> Head office versus stores, one customer versus another, security team versus network team. A different audience is the strongest reason for a new ADOM.</li>
<li><b>Who needs different storage or retention?</b> A finance system may need a long history, a guest Wi-Fi gateway only a short one. Quota and retention are per ADOM, so different needs mean different ADOMs.</li>
<li><b>Which firmware generations are in use?</b> One ADOM has one version. Devices on different firmware generations cannot share an ADOM (chapter 2).</li>
<li><b>Who writes the reports?</b> Reports run per ADOM. If the Retail manager wants one report that covers Madurai and Trichy together, those two devices should live in one ADOM.</li>
</ol>

<h3>Common design patterns</h3>
<table class="cmp"><tr><th>Pattern</th><th>Good for</th><th>Watch out</th></tr>
<tr><td>One ADOM for everything (root)</td><td>A small company with one logging team</td><td>No separation, one quota, one retention for all</td></tr>
<tr><td>By business unit (Corporate, Retail)</td><td>Different teams, different audit rules</td><td>Devices of one unit must run the same firmware generation</td></tr>
<tr><td>By region or country</td><td>Regional teams, data-location rules</td><td>A global report needs several runs, one per ADOM</td></tr>
<tr><td>By customer (service provider)</td><td>Strict separation between customers</td><td>Many ADOMs to maintain; the unit has a limit</td></tr>
<tr><td>One ADOM per device</td><td>Almost never</td><td>Dozens of tiny containers and no combined view</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Decision flow for ADOM design">
<rect x="230" y="10" width="180" height="40" rx="8" fill="#fde68a"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">New device to log?</text>
<rect x="20" y="90" width="170" height="52" rx="8" fill="#bae6fd"/><text x="105" y="112" text-anchor="middle" class="svg-ink" font-size="12">Same audience and</text><text x="105" y="130" text-anchor="middle" class="svg-ink" font-size="12">rules as an ADOM?</text>
<rect x="235" y="90" width="170" height="52" rx="8" fill="#bae6fd"/><text x="320" y="112" text-anchor="middle" class="svg-ink" font-size="12">Same firmware</text><text x="320" y="130" text-anchor="middle" class="svg-ink" font-size="12">version as it?</text>
<rect x="450" y="90" width="170" height="52" rx="8" fill="#bae6fd"/><text x="535" y="112" text-anchor="middle" class="svg-ink" font-size="12">Same storage and</text><text x="535" y="130" text-anchor="middle" class="svg-ink" font-size="12">retention needs?</text>
<rect x="150" y="165" width="160" height="34" rx="8" fill="#bbf7d0"/><text x="230" y="187" text-anchor="middle" class="svg-ink" font-size="12">All yes: join it</text>
<rect x="340" y="165" width="160" height="34" rx="8" fill="#fed7aa"/><text x="420" y="187" text-anchor="middle" class="svg-ink" font-size="12">Any no: new ADOM</text>
<line x1="290" y1="50" x2="105" y2="90" stroke="#64748b" stroke-width="2"/><line x1="320" y1="50" x2="320" y2="90" stroke="#64748b" stroke-width="2"/><line x1="350" y1="50" x2="535" y2="90" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Three questions decide whether a device joins an existing ADOM or needs a new one.</p></div>

<h3>Naming</h3>
<p>Use short names that say who owns the logs, not which box produced them: Corporate, Retail, Kaveri. Avoid names with a version or a date, because the version is a property and dates go stale. Avoid spaces and mixed case, because you will type the name into commands and scripts and a single wrong letter creates a second ADOM. Keep the list of ADOMs and their owners in one document that the support team can find.</p>

<div class="eg"><p><b>Worked example.</b> Kaveri Retail has two audiences. Head office staff in Chennai study the HQ firewall. Store managers in Madurai and Trichy read their own branch logs. Both firewall generations are 7.6. Design: Corporate holds HQ-FGT; Retail holds MDU-FGT and TRY-FGT. A third idea, one ADOM per city, was rejected because the store audit rule is the same for Madurai and Trichy and the manager wants one combined Retail report.</p></div>

<h3>What the finished design looks like</h3>
<pre class="out">FAZ-1 # show dvmdb adom
config dvmdb adom
    edit "Corporate"
    next
    edit "Retail"
    next
end
FAZ-1 # show dvmdb device
config dvmdb device
    edit "HQ-FGT"
        set sn "FGVMEV1RGF38I000"
        set adom "<span class="hl">Corporate</span>"
        set ip 192.0.2.11
    next
    edit "MDU-FGT"
        set sn "FGVMEV1JOS6TJ000"
        set adom "<span class="hl">Retail</span>"
        set ip 192.0.2.12
    next
    edit "TRY-FGT"
        set sn "FGVMEV3X688U0000"
        set adom "<span class="hl">Retail</span>"
        set ip 192.0.2.13
    next
end</pre>
<p><code>show</code> prints only values that differ from the default, so the ADOM version 7.6 is not printed here. Use <code>diagnose dvm adom list</code> when you need to read versions.</p>

<h3>Limits of the unit</h3>
<p>The status output of the simulator reads "Max Number of Admin Domains : 5". Treat the exact number as a stand-in; the lesson is that a real unit has a limit that depends on the model and licence, so a design with one ADOM per device can run out of ADOMs before it runs out of devices.</p>

<h3>Security Fabric ADOM (theory)</h3>
<p>In the real product there is a special ADOM type for a Security Fabric, which groups the FortiGates of one fabric so that their logs are analysed together as one network. It is theory in this course: the simulator has no Fabric ADOM, and the operations module only describes it as theory.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Building ADOMs that copy the office floor plan instead of the audiences. (2) Making a new ADOM for every project and never cleaning up. (3) Putting a lab firewall in the same ADOM as production, so test traffic fills the production quota. (4) Choosing names that differ only by case.</p></div>

<div class="exam"><p><b>Exam traps.</b> "Where are retention and quota set?" Per ADOM. "Can two firmware generations share an ADOM?" No. "Does an ADOM change how the FortiGate forwards traffic?" No, never.</p></div>

<div class="scn"><h4>One ADOM per branch</h4><p>A bank created 40 ADOMs, one per branch, because "each manager should see only his branch". Then the head of operations asked for one report of all denied sessions across branches. It meant 40 report runs and a spreadsheet. The redesign used ADOMs by region (five) and gave each branch manager a filter in Log View by device name.</p><p><b>Lesson:</b> separate by audience and rules, not by every individual box; use filters for the rest.</p></div>

<div class="iv"><p class="q">"How would you design ADOMs for a retailer with a head office and 200 stores?"</p><p>Two or three ADOMs: head office, stores (grouped by region only if the audit or team differs) and perhaps a lab ADOM. Explain the questions you ask: audience, retention, firmware, report scope. Mention that you avoid one ADOM per store because of the combined view and the unit limit.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Design ADOMs around audience, retention needs, firmware generation and report scope.</li>
<li>Different needs mean a different ADOM; the same needs mean the same ADOM.</li>
<li>Use short owner-based names without spaces, versions or dates.</li>
<li>One ADOM per device is almost always a mistake; the unit also has an ADOM limit.</li>
<li>The Security Fabric ADOM is theory here.</li>
</ul></div>
`,hi:`
<p>Society mein flats banane se pehle architect tay karta hai ki kitne blocks honge aur kaun se families kahan jayengi. Baad mein family ko move karna possible hai par shor hota hai. ADOMs ke saath bhi yehi hai: banana do minute ka kaam hai, sahi chunna asli kaam hai, kyunki har ADOM ke apne logs, quota, retention aur reports hote hain. Device ko baad mein move karne se discarded logs ka gap banta hai (chapter 2) aur uski history peeche reh jati hai.</p>

<h3>Pehle chaar sawaal poochho</h3>
<ol>
<li><b>Kiske logs kisko nahi dikhne chahiye?</b> Head office aur stores, ek customer aur doosra customer, security team aur network team. Alag audience naye ADOM ki sabse mazboot wajah hai.</li>
<li><b>Kisko alag storage ya retention chahiye?</b> Finance system ko lambi history chahiye ho sakti hai, guest Wi-Fi gateway ko sirf chhoti. Quota aur retention per ADOM hain, isliye alag zaroorat matlab alag ADOM.</li>
<li><b>Kaun se firmware generations use mein hain?</b> Ek ADOM ka ek version. Alag firmware generation ke devices ek ADOM share nahi kar sakte (chapter 2).</li>
<li><b>Reports kaun likhta hai?</b> Reports per ADOM chalte hain. Retail manager ko Madurai aur Trichy ka ek combined report chahiye to wo dono devices ek ADOM mein hone chahiye.</li>
</ol>

<h3>Aam design patterns</h3>
<table class="cmp"><tr><th>Pattern</th><th>Kiske liye theek</th><th>Dhyan rakho</th></tr>
<tr><td>Sab kuch ek ADOM mein (root)</td><td>Chhoti company, ek logging team</td><td>Koi separation nahi, sabke liye ek quota aur ek retention</td></tr>
<tr><td>Business unit ke hisaab se (Corporate, Retail)</td><td>Alag teams, alag audit rules</td><td>Ek unit ke devices ka firmware generation same ho</td></tr>
<tr><td>Region ya country ke hisaab se</td><td>Regional teams, data-location rules</td><td>Global report ke liye kai runs, har ADOM ka ek</td></tr>
<tr><td>Customer ke hisaab se (service provider)</td><td>Customers ke beech strict separation</td><td>Bahut ADOMs maintain karne padte hain; unit ki limit hai</td></tr>
<tr><td>Har device ka ek ADOM</td><td>Lagbhag kabhi nahi</td><td>Darjano chhote containers aur combined view nahi</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="ADOM design ka decision flow">
<rect x="230" y="10" width="180" height="40" rx="8" fill="#fde68a"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">Naya device log karna hai?</text>
<rect x="20" y="90" width="170" height="52" rx="8" fill="#bae6fd"/><text x="105" y="112" text-anchor="middle" class="svg-ink" font-size="12">ADOM jaisi audience</text><text x="105" y="130" text-anchor="middle" class="svg-ink" font-size="12">aur rules?</text>
<rect x="235" y="90" width="170" height="52" rx="8" fill="#bae6fd"/><text x="320" y="112" text-anchor="middle" class="svg-ink" font-size="12">Uska same firmware</text><text x="320" y="130" text-anchor="middle" class="svg-ink" font-size="12">version?</text>
<rect x="450" y="90" width="170" height="52" rx="8" fill="#bae6fd"/><text x="535" y="112" text-anchor="middle" class="svg-ink" font-size="12">Same storage aur</text><text x="535" y="130" text-anchor="middle" class="svg-ink" font-size="12">retention zaroorat?</text>
<rect x="150" y="165" width="160" height="34" rx="8" fill="#bbf7d0"/><text x="230" y="187" text-anchor="middle" class="svg-ink" font-size="12">Sab haan: usme jodo</text>
<rect x="340" y="165" width="160" height="34" rx="8" fill="#fed7aa"/><text x="420" y="187" text-anchor="middle" class="svg-ink" font-size="12">Koi nahi: naya ADOM</text>
<line x1="290" y1="50" x2="105" y2="90" stroke="#64748b" stroke-width="2"/><line x1="320" y1="50" x2="320" y2="90" stroke="#64748b" stroke-width="2"/><line x1="350" y1="50" x2="535" y2="90" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Teen sawaal tay karte hain ki device existing ADOM mein jayega ya naya ADOM chahiye.</p></div>

<h3>Naming</h3>
<p>Chhote naam use karo jo batayein ki logs kiske hain, ye nahi ki kaun sa box bana raha hai: Corporate, Retail, Kaveri. Naam mein version ya date mat rakho, kyunki version ek property hai aur dates purani ho jati hain. Spaces aur mixed case se bacho, kyunki naam aap commands aur scripts mein type karoge aur ek galat letter doosra ADOM bana deta hai. ADOMs aur unke owners ki list ek document mein rakho jo support team ko mil sake.</p>

<div class="eg"><p><b>Worked example.</b> Kaveri Retail ki do audiences hain. Chennai ke head office staff HQ firewall padhte hain. Madurai aur Trichy ke store managers apni branch ke logs padhte hain. Dono firewalls ka generation 7.6 hai. Design: Corporate mein HQ-FGT; Retail mein MDU-FGT aur TRY-FGT. Teesra idea, har shehar ka ek ADOM, reject hua kyunki Madurai aur Trichy ka store audit rule same hai aur manager ko ek combined Retail report chahiye.</p></div>

<h3>Tayyar design kaisa dikhta hai</h3>
<pre class="out">FAZ-1 # show dvmdb adom
config dvmdb adom
    edit "Corporate"
    next
    edit "Retail"
    next
end
FAZ-1 # show dvmdb device
config dvmdb device
    edit "HQ-FGT"
        set sn "FGVMEV1RGF38I000"
        set adom "<span class="hl">Corporate</span>"
        set ip 192.0.2.11
    next
    edit "MDU-FGT"
        set sn "FGVMEV1JOS6TJ000"
        set adom "<span class="hl">Retail</span>"
        set ip 192.0.2.12
    next
    edit "TRY-FGT"
        set sn "FGVMEV3X688U0000"
        set adom "<span class="hl">Retail</span>"
        set ip 192.0.2.13
    next
end</pre>
<p><code>show</code> sirf wo values print karta hai jo default se alag hain, isliye ADOM version 7.6 yahan print nahi hota. Version padhna ho to <code>diagnose dvm adom list</code> use karo.</p>

<h3>Unit ki limits</h3>
<p>Simulator ka status output "Max Number of Admin Domains : 5" padhta hai. Exact number ko stand-in samjho; seekh ye hai ki real unit ki ek limit hoti hai jo model aur licence par depend karti hai, isliye har device ka ek ADOM wala design devices khatam hone se pehle ADOMs khatam kar sakta hai.</p>

<h3>Security Fabric ADOM (theory)</h3>
<p>Real product mein Security Fabric ke liye ek special ADOM type hai, jo ek fabric ke FortiGates ko group karta hai taaki unke logs ek network ki tarah analyse hon. Ye is course mein theory hai: simulator mein Fabric ADOM nahi hai, aur operations module sirf theory ke roop mein iska zikr karta hai.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Audiences ke bajaye office floor plan ki copy jaise ADOMs banana. (2) Har project ka naya ADOM banana aur cleanup kabhi nahi karna. (3) Lab firewall ko production wale ADOM mein rakhna, jisse test traffic production quota bhar deta hai. (4) Aise naam chunna jo sirf case mein alag hon.</p></div>

<div class="exam"><p><b>Exam traps.</b> "Retention aur quota kahan set hote hain?" Per ADOM. "Kya do firmware generations ek ADOM share kar sakti hain?" Nahi. "Kya ADOM FortiGate ke traffic forward karne ka tareeka badalta hai?" Nahi, kabhi nahi.</p></div>

<div class="scn"><h4>Har branch ka ek ADOM</h4><p>Ek bank ne 40 ADOMs banaye, har branch ka ek, kyunki "har manager ko sirf apni branch dikhni chahiye". Phir operations head ne saari branches ke denied sessions ka ek report manga. Matlab 40 report runs aur ek spreadsheet. Redesign mein region ke hisaab se ADOMs (paanch) bane aur har branch manager ko device name ka filter Log View mein diya gaya.</p><p><b>Lesson:</b> audience aur rules ke hisaab se alag karo, har individual box ke hisaab se nahi; baaki ke liye filters use karo.</p></div>

<div class="iv"><p class="q">"Ek head office aur 200 stores wale retailer ke liye ADOMs kaise design karoge?"</p><p>Do ya teen ADOMs: head office, stores (region ke hisaab se tabhi group karo jab audit ya team alag ho) aur shayad lab ADOM. Batao ki aap kaun se sawaal poochte ho: audience, retention, firmware, report scope. Ye bhi kaho ki combined view aur unit limit ki wajah se aap har store ka ek ADOM nahi banate.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ADOMs ko audience, retention zaroorat, firmware generation aur report scope ke around design karo.</li>
<li>Alag zaroorat matlab alag ADOM; same zaroorat matlab same ADOM.</li>
<li>Owner-based chhote naam use karo, bina spaces, versions ya dates ke.</li>
<li>Har device ka ek ADOM lagbhag hamesha galti hai; unit ki ADOM limit bhi hoti hai.</li>
<li>Security Fabric ADOM yahan theory hai.</li>
</ul></div>
`}};export{e as default};