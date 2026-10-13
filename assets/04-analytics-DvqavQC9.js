var e={id:`analytics`,h:{en:`Versa Analytics: logs, dashboards and reports`,hi:`Versa Analytics: logs, dashboards aur reports`},body:{en:`
<p>If the Director is the manager and the Controller is the control tower, <b>Analytics is the CCTV room and the accounts office</b>. Every branch records what happened (flows, applications, security events, SLA measurements, alarms) and mails the records to the headend, where they are stored, searched and drawn as charts.</p>

<h3>The log pipeline</h3>
<ol>
<li><b>VOS generates logs.</b> Each branch produces traffic (flow) logs, application and URL logs, firewall and IDP events, SLA-monitor and path metrics, and alarms.</li>
<li><b>Log export.</b> The branch's <b>log exporter</b> (in real Versa, the Log Export Function, LEF) sends records to a <b>destination</b>: the Analytics log collector. Without a destination the logs never leave the branch.</li>
<li><b>Log collector.</b> A service on the Analytics node that listens on a TCP port (the lab default is <code>1234</code>) and accepts records from branches.</li>
<li><b>Storage and indexing.</b> Analytics keeps logs in a clustered database, sized by retention (how many days) and log volume.</li>
<li><b>Dashboards and reports.</b> Operators see traffic by application, top talkers, SLA violations, path changes, security events, per site and per organization. Reports can be scheduled and mailed.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Log pipeline">
<rect x="15" y="80" width="130" height="60" rx="8" fill="#bae6fd"/><text x="80" y="106" text-anchor="middle" class="svg-ink" font-size="13">Branch1 VOS</text><text x="80" y="124" text-anchor="middle" class="svg-muted" font-size="12">log-exporter</text>
<rect x="190" y="80" width="130" height="60" rx="8" fill="#fde68a"/><text x="255" y="106" text-anchor="middle" class="svg-ink" font-size="13">Log collector</text><text x="255" y="124" text-anchor="middle" class="svg-muted" font-size="12">port 1234</text>
<rect x="365" y="80" width="120" height="60" rx="8" fill="#bbf7d0"/><text x="425" y="106" text-anchor="middle" class="svg-ink" font-size="13">Database</text><text x="425" y="124" text-anchor="middle" class="svg-muted" font-size="12">retention</text>
<rect x="520" y="80" width="105" height="60" rx="8" fill="#ddd6fe"/><text x="572" y="106" text-anchor="middle" class="svg-ink" font-size="13">Dashboards</text><text x="572" y="124" text-anchor="middle" class="svg-muted" font-size="12">reports</text>
<line x1="145" y1="110" x2="190" y2="110" stroke="#64748b" stroke-width="2.5"/><line x1="320" y1="110" x2="365" y2="110" stroke="#64748b" stroke-width="2.5"/><line x1="485" y1="110" x2="520" y2="110" stroke="#64748b" stroke-width="2.5"/>
<text x="255" y="60" text-anchor="middle" class="svg-accent" font-size="12">Analytics-1  198.51.100.30</text>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">Director only needs to know where Analytics is (for GUI dashboards)</text>
</svg><p class="cap">From a branch log record to a dashboard. Three things must be true: exporter destination, collector enabled, Analytics reachable.</p></div>

<h3>Three links in the chain</h3>
<p>The lab <code>vs-analytics-logs</code> breaks exactly three things, and each has a different owner:</p>
<dl class="terms">
<dt>Collector on Analytics</dt><dd><code>analytics log-collector enable true</code>. If it is disabled, the node refuses records. Branch status: <code>Log collector is disabled on Analytics-1</code>.</dd>
<dt>Analytics registered in Director</dt><dd><code>director analytics address 198.51.100.30</code>. The Director shows dashboards by querying Analytics and pushes the log settings of templates. If it is missing, <code>show analytics</code> prints <code>not configured</code>.</dd>
<dt>Log exporter on the branch</dt><dd><code>orgs org-services Acme log-exporter destination 198.51.100.30</code>. If it is missing, status: <code>No log-exporter destination configured</code>.</dd>
</dl>
<pre class="code"><span class="c">! Analytics-1</span>
configure
set analytics log-collector enable true
set analytics log-collector port 1234
commit
<span class="c">! Director-1</span>
configure
set director analytics address 198.51.100.30
commit
<span class="c">! Branch1</span>
configure
set orgs org-services Acme log-exporter destination 198.51.100.30
commit</pre>
<pre class="out">admin@Analytics-1-cli&gt; show analytics log-collector status
Log collector: enabled   Port: 1234
Sources: <span class="hl">1</span>

admin@Analytics-1-cli&gt; show analytics sources
Branch         Status
Branch1        Exporting to Analytics-1

admin@Branch1-cli&gt; show orgs org-services Acme log-exporter
Destination: 198.51.100.30
Status: Exporting to Analytics-1</pre>

<h3>Retention and scale (high level)</h3>
<ul>
<li><b>Retention</b> is the number of days of logs kept. Longer retention means more storage. Flow logs are the largest part.</li>
<li><b>Scale</b> comes from clusters: separate log-collector nodes and database or search nodes, sized by events per second from all branches. Large providers use several Analytics clusters.</li>
<li>Logging more (all flows, URL logs) gives better visibility but needs more bandwidth to headend and more storage. Log only what you will use.</li>
<li>Logs travel over the WAN. In a real design they can use the management or a dedicated path, with firewall rules allowing the collector port.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> A branch produces 200 flow logs per second at about 300 bytes each: 60 KB/s, roughly 5 GB per day per branch. For 100 branches and 30 days of retention that is about 15 TB before compression and replication. This is why retention and log profiles are planned, not left at default.</p></div>

<div class="note"><p><b>Course model.</b> The real Analytics has many more components and dashboards, and its collector settings are often managed in the Director GUI. The lab keeps the three links and their status lines, which match the real troubleshooting questions: is the exporter set, is the collector accepting, is the node reachable.</p></div>

<div class="warn"><p><b>Common mistake.</b> Configuring the destination and declaring success. Always verify on the Analytics side with <code>show analytics sources</code>; the branch status line also shows why export is failing.</p></div>

<div class="exam"><p><b>Exam trap.</b> Analytics is not in the data path and is not the Controller. Losing it loses visibility and reports, not connectivity.</p></div>

<div class="scn"><h4>Operations cannot see Delhi traffic</h4><p>The NOC reports empty dashboards for Delhi. On Branch1, <code>show orgs org-services Acme log-exporter</code> says "No log-exporter destination configured". After setting the destination the status changed to "Log collector is disabled on Analytics-1". The collector was enabled and the Director registration repaired; within minutes Branch1 appeared as a source.</p><p><b>Lesson:</b> follow the chain from the producer (branch) to the consumer (Analytics), fixing one link at a time and re-checking the status line.</p></div>

<div class="iv"><p class="q">"Delhi shows no data in Analytics. How do you troubleshoot?"</p><p>Check the exporter destination on the branch, the collector state and port on Analytics, reachability and firewall rules between them, then the Director registration for dashboards. Mention retention and clock sync as secondary causes.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Analytics collects, stores and visualises logs; it is not in the data path.</li>
<li>Chain: branch exporter, collector enabled, Analytics reachable, Director registration.</li>
<li>Default lab collector port is 1234.</li>
<li>Verify with <code>show analytics sources</code> and the branch log-exporter status.</li>
<li>Retention and log volume decide storage.</li>
</ul></div>
`,hi:`
<p>Agar Director manager hai aur Controller control tower, to <b>Analytics CCTV room aur accounts office</b> hai. Har branch record karta hai ki kya hua (flows, applications, security events, SLA measurements, alarms) aur woh records headend ko bhejta hai, jahan unhe store kiya jaata hai, search kiya jaata hai aur charts mein dikhaya jaata hai.</p>

<h3>Log pipeline</h3>
<ol>
<li><b>VOS logs banata hai.</b> Har branch traffic (flow) logs, application aur URL logs, firewall aur IDP events, SLA-monitor aur path metrics, aur alarms banata hai.</li>
<li><b>Log export.</b> Branch ka <b>log exporter</b> (real Versa mein Log Export Function, LEF) records ek <b>destination</b> ko bhejta hai: Analytics log collector. Destination ke bina logs branch se bahar nahi jaate.</li>
<li><b>Log collector.</b> Analytics node par ek service jo TCP port par sunti hai (lab default <code>1234</code>) aur branches ke records accept karti hai.</li>
<li><b>Storage aur indexing.</b> Analytics logs ko clustered database mein rakhta hai, retention (kitne din) aur log volume ke hisaab se size hoke.</li>
<li><b>Dashboards aur reports.</b> Operators application ke hisaab se traffic, top talkers, SLA violations, path changes, security events, per site aur per organization dekhte hain. Reports schedule hokar mail bhi ho sakti hain.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Log pipeline">
<rect x="15" y="80" width="130" height="60" rx="8" fill="#bae6fd"/><text x="80" y="106" text-anchor="middle" class="svg-ink" font-size="13">Branch1 VOS</text><text x="80" y="124" text-anchor="middle" class="svg-muted" font-size="12">log-exporter</text>
<rect x="190" y="80" width="130" height="60" rx="8" fill="#fde68a"/><text x="255" y="106" text-anchor="middle" class="svg-ink" font-size="13">Log collector</text><text x="255" y="124" text-anchor="middle" class="svg-muted" font-size="12">port 1234</text>
<rect x="365" y="80" width="120" height="60" rx="8" fill="#bbf7d0"/><text x="425" y="106" text-anchor="middle" class="svg-ink" font-size="13">Database</text><text x="425" y="124" text-anchor="middle" class="svg-muted" font-size="12">retention</text>
<rect x="520" y="80" width="105" height="60" rx="8" fill="#ddd6fe"/><text x="572" y="106" text-anchor="middle" class="svg-ink" font-size="13">Dashboards</text><text x="572" y="124" text-anchor="middle" class="svg-muted" font-size="12">reports</text>
<line x1="145" y1="110" x2="190" y2="110" stroke="#64748b" stroke-width="2.5"/><line x1="320" y1="110" x2="365" y2="110" stroke="#64748b" stroke-width="2.5"/><line x1="485" y1="110" x2="520" y2="110" stroke="#64748b" stroke-width="2.5"/>
<text x="255" y="60" text-anchor="middle" class="svg-accent" font-size="12">Analytics-1  198.51.100.30</text>
<text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">Director ko sirf pata hona chahiye ki Analytics kahan hai (GUI dashboards ke liye)</text>
</svg><p class="cap">Branch log record se dashboard tak. Teen cheezein sach honi chahiye: exporter destination, collector enabled, Analytics reachable.</p></div>

<h3>Chain ke teen links</h3>
<p>Lab <code>vs-analytics-logs</code> theek teen cheezein todta hai, aur har ek ka owner alag hai:</p>
<dl class="terms">
<dt>Analytics par collector</dt><dd><code>analytics log-collector enable true</code>. Disabled ho to node records refuse karta hai. Branch status: <code>Log collector is disabled on Analytics-1</code>.</dd>
<dt>Director mein Analytics registered</dt><dd><code>director analytics address 198.51.100.30</code>. Director Analytics se query karke dashboards dikhata hai aur templates ki log settings push karta hai. Missing ho to <code>show analytics</code> mein <code>not configured</code> aata hai.</dd>
<dt>Branch par log exporter</dt><dd><code>orgs org-services Acme log-exporter destination 198.51.100.30</code>. Missing ho to status: <code>No log-exporter destination configured</code>.</dd>
</dl>
<pre class="code"><span class="c">! Analytics-1</span>
configure
set analytics log-collector enable true
set analytics log-collector port 1234
commit
<span class="c">! Director-1</span>
configure
set director analytics address 198.51.100.30
commit
<span class="c">! Branch1</span>
configure
set orgs org-services Acme log-exporter destination 198.51.100.30
commit</pre>
<pre class="out">admin@Analytics-1-cli&gt; show analytics log-collector status
Log collector: enabled   Port: 1234
Sources: <span class="hl">1</span>

admin@Analytics-1-cli&gt; show analytics sources
Branch         Status
Branch1        Exporting to Analytics-1

admin@Branch1-cli&gt; show orgs org-services Acme log-exporter
Destination: 198.51.100.30
Status: Exporting to Analytics-1</pre>

<h3>Retention aur scale (high level)</h3>
<ul>
<li><b>Retention</b> woh din hain jitne logs rakhe jaate hain. Zyada retention matlab zyada storage. Flow logs sabse bada hissa hote hain.</li>
<li><b>Scale</b> clusters se aata hai: alag log-collector nodes aur database ya search nodes, saare branches ke events per second ke hisaab se size hote hain. Bade providers kai Analytics clusters use karte hain.</li>
<li>Zyada logging (saare flows, URL logs) se visibility behtar hoti hai lekin headend tak zyada bandwidth aur zyada storage chahiye. Sirf wahi log karo jo use karoge.</li>
<li>Logs WAN par travel karte hain. Real design mein woh management ya dedicated path use kar sakte hain, firewall rules collector port allow karte hue.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Ek branch 200 flow logs per second banata hai, har ek lagbhag 300 bytes: 60 KB/s, yaani roughly 5 GB per din per branch. 100 branches aur 30 din retention ke liye compression aur replication se pehle lagbhag 15 TB. Isiliye retention aur log profiles plan kiye jaate hain, default par nahi chhode jaate.</p></div>

<div class="note"><p><b>Course model.</b> Real Analytics mein kai aur components aur dashboards hain, aur uski collector settings aksar Director GUI mein manage hoti hain. Lab teen links aur unki status lines rakhta hai, jo real troubleshooting sawaalon se match karti hain: exporter set hai, collector accept kar raha hai, node reachable hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> Destination configure karke success maan lena. Hamesha Analytics side par <code>show analytics sources</code> se verify karo; branch status line bhi batati hai ki export kyun fail ho raha hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Analytics data path mein nahi hota aur Controller nahi hai. Ise khone se visibility aur reports jaate hain, connectivity nahi.</p></div>

<div class="scn"><h4>Operations ko Delhi traffic nahi dikhta</h4><p>NOC Delhi ke liye empty dashboards report karta hai. Branch1 par <code>show orgs org-services Acme log-exporter</code> kehta hai "No log-exporter destination configured". Destination set karne ke baad status badal kar "Log collector is disabled on Analytics-1" ho gaya. Collector enable kiya aur Director registration theek ki; kuch minute mein Branch1 source ke roop mein dikhne laga.</p><p><b>Lesson:</b> producer (branch) se consumer (Analytics) tak chain follow karo, ek link ek baar mein fix karo aur status line dobara check karo.</p></div>

<div class="iv"><p class="q">"Delhi ka data Analytics mein nahi dikh raha. Kaise troubleshoot karoge?"</p><p>Branch par exporter destination, Analytics par collector state aur port, dono ke beech reachability aur firewall rules, phir dashboards ke liye Director registration check karo. Secondary causes mein retention aur clock sync ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Analytics logs collect, store aur visualise karta hai; data path mein nahi hai.</li>
<li>Chain: branch exporter, collector enabled, Analytics reachable, Director registration.</li>
<li>Lab collector default port 1234 hai.</li>
<li><code>show analytics sources</code> aur branch log-exporter status se verify karo.</li>
<li>Retention aur log volume storage tay karte hain.</li>
</ul></div>
`}};export{e as default};