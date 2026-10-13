var e={id:`sizing-retention-security`,h:{en:`Sizing, retention, security and compliance notes`,hi:`Sizing, retention, security aur compliance notes`},body:{en:`
<p>Logs are like the paperwork in a company's store room. Keep too little and you cannot answer an audit. Keep everything forever and you need a warehouse, a guard and a lock. Sizing is deciding how big the warehouse is. Retention is how long each box stays. Security is who holds the key. This chapter gives you the questions to ask. The exact numbers depend on the product version and hardware, so check the documentation for your PAN-OS version.</p>

<h3>Sizing: from sessions to storage</h3>
<p>A rough method any engineer can use:</p>
<ol>
<li><b>Sessions per second.</b> Estimate or measure at peak for each site.</li>
<li><b>Logs per session.</b> Usually one end log for allowed traffic, plus other log types if profiles are in use.</li>
<li><b>Average log size.</b> Take it from the documentation or a measured sample; it varies by type and version.</li>
<li><b>Retention days.</b> Multiply: sessions per day times log size times days kept.</li>
<li><b>Headroom.</b> Add a margin for growth and for incidents, when traffic and logs spike.</li>
</ol>
<div class="eg"><p><b>Worked example (illustrative numbers).</b> A branch averages 20 new sessions per second over a 10-hour working day. That is 20 x 36,000 = 720,000 sessions. At one log each and an assumed 500 bytes per log, that is about 360 MB per day for the branch. Fifty branches for 90 days is roughly 1.6 TB, before headroom. Replace the assumptions with measured values.</p></div>
<p>The point is the method, not the numbers. The same method also tells you how much a syslog filter will save: if denies are two percent of sessions, a DENY-only feed is about two percent of the volume.</p>

<h3>Retention</h3>
<ul>
<li>Retention is a <b>requirement</b> before it is a setting. Ask the compliance and security owners how long each class of log must be kept.</li>
<li>Different needs, different places: a short, searchable window on Panorama and a longer, cheaper archive elsewhere is a common pattern.</li>
<li>Dedicated collectors are the usual way to scale storage and retention in larger estates.</li>
<li>Write the retention decision down with its reason and an owner.</li>
</ul>
<p>The simulator has no retention settings. It teaches the forwarding logic that retention depends on.</p>

<h3>Security of the log path</h3>
<table class="tbl"><tr><th>Concern</th><th>Good practice</th></tr>
<tr><td>Transport</td><td>Prefer an authenticated and encrypted transport for logs that leave your network or cross untrusted segments; accept UDP only on a trusted management network and with eyes open about loss. Check the documentation for your PAN-OS version for options.</td></tr>
<tr><td>Management network</td><td>Keep the firewall to Panorama and syslog traffic on the out-of-band management network, as in the lab topology.</td></tr>
<tr><td>Access</td><td>Give log access by role. Reading traffic logs reveals who talks to whom and sometimes personal data; use least privilege and review who has access.</td></tr>
<tr><td>Integrity</td><td>Export evidence from the central store, record who exported it, and keep copies in a protected place.</td></tr>
<tr><td>Privacy</td><td>URL and user data may be regulated. Involve the privacy owner before widening what is logged or forwarded.</td></tr>
</table>

<h3>Compliance habits</h3>
<ol>
<li>Map each requirement to a log type, a retention period and a location.</li>
<li>Alert if forwarding stops: the waiting counter, a silent firewall, an empty collector group.</li>
<li>Test the path on a schedule with a real session and a search.</li>
<li>Keep the change records for logging settings, because a configuration change is evidence too.</li>
</ol>

<div class="warn"><p><b>Common mistakes.</b> Sizing from average instead of peak; one retention number for every log type; sending logs in clear text over untrusted links; giving everybody full log access.</p></div>

<div class="scn"><h4>The audit that asked for 13 months</h4><p>A regulated customer was asked to produce a year of access logs. Panorama held only the recent months and the SIEM only a filtered subset. The team had never written a retention requirement. After the audit they agreed a table: type, period, location, owner, and added a monthly test that retrieved a log from the oldest period.</p><p><b>Lesson:</b> retention begins with the requirement, and untested retention is only a hope.</p></div>

<div class="iv"><p class="q">"How would you size log storage for a new Panorama deployment?"</p><p>I gather peak sessions per second per site, assume one end log per session, take log size from the documentation or a sample, multiply by retention days required by compliance and add headroom. Then I decide what stays on Panorama, what goes to an archive, and use filters to cut what the SIEM receives.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Size from peak sessions, log size and retention days, plus headroom.</li>
<li>Retention is a requirement owned by compliance, then a setting.</li>
<li>Protect the log path: transport, management network, access, integrity, privacy.</li>
<li>Test the path regularly and alert on silence.</li>
</ul></div>
`,hi:`
<p>Logs company ke store room ke paperwork jaise hain. Kam rakho to audit ka jawab nahi de sakte. Sab kuch hamesha rakho to godown, guard aur taala chahiye. Sizing decide karna hai godown kitna bada ho. Retention har dabba kitne time rahega. Security chaabi kiske paas hai. Ye chapter aapko poochne ke sawal deta hai. Exact numbers product version aur hardware par depend karte hain, isliye apne PAN-OS version ki documentation check karo.</p>

<h3>Sizing: sessions se storage tak</h3>
<p>Ek rough method jo koi bhi engineer use kar sakta hai:</p>
<ol>
<li><b>Sessions per second.</b> Har site ke liye peak par estimate ya measure karo.</li>
<li><b>Logs per session.</b> Aam taur par allowed traffic ke liye ek end log, plus doosre log types agar profiles use mein hon.</li>
<li><b>Average log size.</b> Documentation ya measured sample se lo; type aur version se badalta hai.</li>
<li><b>Retention days.</b> Multiply karo: sessions per day guna log size guna kitne din rakhna hai.</li>
<li><b>Headroom.</b> Growth aur incidents ke liye margin jodo, jab traffic aur logs spike karte hain.</li>
</ol>
<div class="eg"><p><b>Worked example (illustrative numbers).</b> Ek branch 10 ghante ke working day mein average 20 naye sessions per second karti hai. Matlab 20 x 36,000 = 720,000 sessions. Har ek ka ek log aur assumed 500 bytes per log ke hisaab se branch ke liye lagbhag 360 MB per day. Pachaas branches ke 90 din lagbhag 1.6 TB, headroom se pehle. Assumptions ko measured values se badlo.</p></div>
<p>Point method hai, numbers nahi. Wahi method ye bhi batata hai ki syslog filter kitna bachayega: denies agar sessions ka do percent hain to DENY-only feed lagbhag do percent volume hai.</p>

<h3>Retention</h3>
<ul>
<li>Retention setting se pehle ek <b>requirement</b> hai. Compliance aur security owners se poochho ki har class ke logs kitne din rakhne hain.</li>
<li>Alag zaroorat, alag jagah: Panorama par chhoti, searchable window aur kahin aur lambi, sasti archive ek common pattern hai.</li>
<li>Bade estates mein storage aur retention scale karne ka usual tareeqa dedicated collectors hain.</li>
<li>Retention decision ko reason aur owner ke saath likh kar rakho.</li>
</ul>
<p>Simulator mein retention settings nahi hain. Wo forwarding logic sikhata hai jis par retention depend karti hai.</p>

<h3>Log path ki security</h3>
<table class="tbl"><tr><th>Concern</th><th>Achhi practice</th></tr>
<tr><td>Transport</td><td>Jo logs aapke network se bahar jate hain ya untrusted segments cross karte hain unke liye authenticated aur encrypted transport prefer karo; UDP sirf trusted management network par aur loss ko jaante hue maano. Options ke liye apne PAN-OS version ki documentation check karo.</td></tr>
<tr><td>Management network</td><td>Firewall se Panorama aur syslog traffic out-of-band management network par rakho, jaise lab topology mein.</td></tr>
<tr><td>Access</td><td>Log access role ke hisaab se do. Traffic logs padhne se pata chalta hai kaun kis se baat karta hai aur kabhi personal data bhi; least privilege rakho aur review karo kiske paas access hai.</td></tr>
<tr><td>Integrity</td><td>Evidence central store se export karo, record karo kisne export kiya, aur copies protected jagah rakho.</td></tr>
<tr><td>Privacy</td><td>URL aur user data regulated ho sakta hai. Kya log ya forward hota hai use badhane se pehle privacy owner ko involve karo.</td></tr>
</table>

<h3>Compliance aadatein</h3>
<ol>
<li>Har requirement ko log type, retention period aur location se map karo.</li>
<li>Forwarding ruke to alert do: waiting counter, chup firewall, khaali collector group.</li>
<li>Path ko schedule par real session aur search se test karo.</li>
<li>Logging settings ke change records rakho, kyunki configuration change bhi evidence hai.</li>
</ol>

<div class="warn"><p><b>Common mistakes.</b> Average se sizing, peak se nahi; har log type ke liye ek retention number; untrusted links par clear text mein logs bhejna; sabko full log access dena.</p></div>

<div class="scn"><h4>Audit jo 13 mahine maangta tha</h4><p>Ek regulated customer se ek saal ke access logs maange gaye. Panorama ke paas sirf haal ke mahine the aur SIEM ke paas sirf filtered subset. Team ne retention requirement kabhi likhi hi nahi thi. Audit ke baad unhone table banayi: type, period, location, owner, aur ek monthly test jo sabse purane period ka log retrieve karta hai.</p><p><b>Lesson:</b> retention requirement se shuru hoti hai, aur untested retention sirf ek umeed hai.</p></div>

<div class="iv"><p class="q">"Naye Panorama deployment ke liye log storage ka size kaise nikaloge?"</p><p>Har site ke peak sessions per second jama karta hoon, har session ka ek end log maanta hoon, log size documentation ya sample se leta hoon, compliance ke maange retention days se guna karta hoon aur headroom jodta hoon. Phir decide karta hoon ki Panorama par kya rahega, archive mein kya jayega, aur filters se SIEM ko jo milta hai use kam karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Peak sessions, log size aur retention days se size karo, plus headroom.</li>
<li>Retention compliance ki requirement hai, phir setting.</li>
<li>Log path protect karo: transport, management network, access, integrity, privacy.</li>
<li>Path ko regularly test karo aur khamoshi par alert do.</li>
</ul></div>
`}};export{e as default};