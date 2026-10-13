var e={id:`splunk-spl`,h:{en:`Splunk as a SIEM: architecture and SPL basics (search, stats, timechart, lookups)`,hi:`SIEM ki tarah Splunk: architecture aur SPL basics (search, stats, timechart, lookups)`},body:{en:`
<p>Imagine a huge library where every page ever written in your company, every firewall log line, DNS query and login, is filed by date the moment it arrives. On its own that is a warehouse. What makes it useful is the librarian: you ask "show me every DNS query from PC-DEV yesterday, grouped by domain" and seconds later you have a table. <b>Splunk</b> is that library and that librarian. The question language is <b>SPL</b>, the Search Processing Language.</p>

<h3>How data gets into Splunk</h3>
<dl class="terms">
<dt>Universal Forwarder</dt><dd>A light agent on servers and endpoints that reads log files and event logs and sends them on. It does little processing.</dd>
<dt>Heavy Forwarder</dt><dd>A full Splunk instance used to parse, filter or route data before it is indexed, for example in front of a noisy syslog source.</dd>
<dt>HTTP Event Collector (HEC)</dt><dd>A token-authenticated API (default port 8088) that applications and cloud services post events to. Many security products use it.</dd>
<dt>Indexer</dt><dd>Stores events in <b>indexes</b> (such as <code>dns</code>, <code>netfw</code>, <code>endpoint</code>), organised by time into buckets that age from hot to warm to cold and finally frozen (deleted or archived).</dd>
<dt>Search head</dt><dd>Where users run searches and dashboards; it sends the search to the indexers and merges the results.</dd>
</dl>
<p>Every event has default fields: <code>_time</code>, <code>index</code>, <code>host</code>, <code>source</code> and <code>sourcetype</code>. Other fields such as <code>query</code> or <code>src_ip</code> are extracted when you search (schema on read). The <b>Common Information Model</b> (CIM) gives fields standard names across vendors, so <code>src</code>, <code>dest</code>, <code>user</code> and <code>action</code> mean the same thing whether the event came from a Cisco or another vendor's firewall.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Splunk architecture">
<rect x="10" y="20" width="150" height="44" rx="8" fill="#bbf7d0"/><text x="85" y="47" text-anchor="middle" class="svg-ink" font-size="12">Universal Forwarders</text>
<rect x="10" y="85" width="150" height="44" rx="8" fill="#bae6fd"/><text x="85" y="112" text-anchor="middle" class="svg-ink" font-size="12">Syslog / Heavy Fwd</text>
<rect x="10" y="150" width="150" height="44" rx="8" fill="#fde68a"/><text x="85" y="177" text-anchor="middle" class="svg-ink" font-size="12">HEC (cloud, apps)</text>
<rect x="240" y="70" width="150" height="74" rx="8" fill="#fed7aa"/><text x="315" y="98" text-anchor="middle" class="svg-ink" font-size="13">Indexers</text><text x="315" y="118" text-anchor="middle" class="svg-muted" font-size="11">indexes by time</text><text x="315" y="134" text-anchor="middle" class="svg-muted" font-size="11">hot, warm, cold</text>
<rect x="470" y="70" width="160" height="74" rx="8" fill="#ddd6fe"/><text x="550" y="98" text-anchor="middle" class="svg-ink" font-size="13">Search head</text><text x="550" y="118" text-anchor="middle" class="svg-muted" font-size="11">SPL, dashboards,</text><text x="550" y="134" text-anchor="middle" class="svg-muted" font-size="11">detections</text>
<line x1="160" y1="42" x2="240" y2="95" stroke="#64748b" stroke-width="2"/><line x1="160" y1="107" x2="240" y2="107" stroke="#64748b" stroke-width="2"/><line x1="160" y1="172" x2="240" y2="122" stroke="#64748b" stroke-width="2"/><line x1="390" y1="107" x2="470" y2="107" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Data flows from forwarders, syslog and HEC into indexers; the search head runs SPL across them.</p></div>

<h3>The shape of an SPL search</h3>
<p>A search starts with <b>search terms</b> that select events, then passes them left to right through commands joined by the pipe <code>|</code>. Always narrow by <code>index</code> and time first; the time range comes from the time picker or from <code>earliest=-24h latest=now</code> in the search.</p>
<table class="cmp"><tr><th>Command</th><th>What it does</th><th>Example</th></tr>
<tr><td>search terms</td><td>Filter events: <code>field=value</code>, wildcards <code>*</code>, <code>!=</code>, AND / OR / NOT</td><td><code>index=dns qtype=TXT host=PC-*</code></td></tr>
<tr><td>table</td><td>Choose columns to show</td><td><code>| table _time host query</code></td></tr>
<tr><td>stats</td><td>Aggregate: count, dc (distinct count), sum, avg, values, grouped with BY</td><td><code>| stats count dc(query) AS unique BY host</code></td></tr>
<tr><td>timechart</td><td>stats over time buckets, ready to chart</td><td><code>| timechart span=10m count BY host</code></td></tr>
<tr><td>eval</td><td>Create or change a field</td><td><code>| eval qlen=len(query)</code></td></tr>
<tr><td>where</td><td>Filter on a comparison or computed field</td><td><code>| where count &gt; 20</code></td></tr>
<tr><td>sort, head, dedup</td><td>Order (<code>-</code> descending), keep the first N, remove duplicates</td><td><code>| sort -count | head 10</code></td></tr>
<tr><td>top, rare</td><td>Most and least common values of a field</td><td><code>| top limit=5 query</code></td></tr>
<tr><td>lookup, inputlookup</td><td>Enrich events from a table (CSV or KV store), or read the table itself</td><td><code>| lookup bad_domains domain AS parent OUTPUT category</code></td></tr></table>

<h3>Trying it on the lab data</h3>
<p>The Splunk lab has an hour of DNS events in <code>index=dns</code> from PC-DEV, PC-HR and PC-FIN. A first overview by host and record type:</p>
<pre class="code">index=dns | stats count by host qtype</pre>
<pre class="out">host     qtype   count
<span class="hl">PC-DEV   TXT     40</span>
PC-HR    A        3
PC-FIN   A        3</pre>
<p>The same data over time shows that PC-DEV queries steadily, ten per ten-minute bucket, while the others made a few lookups at the start of the hour:</p>
<pre class="code">index=dns | timechart span=10m count by host</pre>
<pre class="out">_time                 PC-DEV  PC-FIN  PC-HR
2026-09-29 11:00:00   0       3       3
2026-09-29 11:10:00   <span class="hl">10</span>      0       0
2026-09-29 11:20:00   <span class="hl">10</span>      0       0
2026-09-29 11:30:00   <span class="hl">10</span>      0       0
2026-09-29 11:40:00   <span class="hl">10</span>      0       0</pre>
<p>And a lookup against a threat list. The <code>rex</code> command extracts the last two labels of the name as <code>parent</code>; the lookup adds a <code>category</code> field only for parents that appear in the list:</p>
<pre class="code">index=dns
| rex field=query "(?&lt;parent&gt;[^.]+\\.[^.]+)$"
| lookup bad_domains domain AS parent OUTPUT category
| where isnotnull(category)
| stats count by host parent category</pre>
<p>The lab console implements a real subset of SPL: search terms with <code>*</code> and comparisons, <code>stats count by</code>, <code>table</code>, <code>where</code> with one comparison, <code>sort</code>, <code>head</code> and <code>dedup</code>. <code>timechart</code>, <code>eval</code>, <code>rex</code> and <code>lookup</code> are shown here for the exam and real work but are not available in the lab console.</p>

<div class="eg"><p><b>Worked example: why your search returns nothing.</b> An analyst runs <code>index=dns qtype=TXT | stats count by host</code> and gets 0 results. Checks in order: the time picker says "Last 15 minutes" but the activity was two hours ago (widen it); the index is really called <code>dns_logs</code> (run <code>| eventcount summarize=false index=*</code> or check with the admin); the field is called <code>record_type</code> in this sourcetype (open one raw event and read the field names). Most "Splunk is broken" tickets are one of these three.</p></div>

<div class="warn"><p><b>Common mistake.</b> Starting every search with <code>index=*</code> over "All time". It scans everything, is slow for you and expensive for everyone sharing the indexers, and returns noise. Name the index, set a time range, and filter as early (as far left) in the search as possible.</p></div>

<div class="exam"><p><b>Exam trap.</b> Forwarders send, indexers store, search heads search. <code>stats</code> aggregates without time buckets; <code>timechart</code> aggregates over <code>_time</code> buckets for charts. <code>where</code> filters after calculations; search terms filter at the start. A lookup enriches events from an external table.</p></div>

<div class="scn"><h4>The firewall logs that arrived from the future</h4><p>A SOC could not find firewall events during an incident window, although the firewall was clearly logging. The events were there but stamped five and a half hours off, because the syslog source sent local time without a zone and Splunk parsed it as UTC. Searches for 14:00 to 15:00 IST looked at the wrong bucket. The fix was to set the time zone for that sourcetype in the input configuration and to enable NTP on the firewall.</p><p><b>Lesson:</b> correct <code>_time</code> is the foundation of every SIEM search; check timestamps first when data seems to be missing.</p></div>

<div class="iv"><p class="q">"Write an SPL search to find the top ten hosts by number of blocked firewall connections in the last 24 hours."</p><p>Strong answer: <code>index=netfw action=blocked earliest=-24h | stats count by src_ip | sort -count | head 10</code>. Explain each part: index and time first for performance, <code>stats count by</code> to aggregate, <code>sort -count</code> descending, <code>head 10</code> to keep the top ten. Add that <code>timechart</code> would show the trend and a lookup could add the asset owner.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Splunk components: Universal and Heavy Forwarders, HEC, indexers with time-based buckets, search heads.</li>
<li>Default fields: _time, index, host, source, sourcetype; CIM normalises field names across vendors.</li>
<li>SPL: search terms, then piped commands; filter by index and time first.</li>
<li>Core commands: table, stats (count, dc, sum), timechart, eval, where, sort, head, dedup, top, lookup.</li>
<li>Zero results usually means the wrong time range, index name or field name.</li>
</ul></div>
`,hi:`
<p>Ek bahut badi library socho jahan company ka har likha page, har firewall log line, DNS query aur login, aate hi date ke hisaab se file ho jaata hai. Akele mein woh ek godaam hai. Use useful banata hai librarian: aap poochte ho "kal PC-DEV ki har DNS query dikhao, domain ke hisaab se group karke" aur kuch seconds mein table mil jaati hai. <b>Splunk</b> woh library aur woh librarian hai. Sawaal ki bhasha <b>SPL</b> hai, Search Processing Language.</p>

<h3>Data Splunk mein kaise aata hai</h3>
<dl class="terms">
<dt>Universal Forwarder</dt><dd>Servers aur endpoints par halka agent jo log files aur event logs padhkar aage bhejta hai. Yeh kam processing karta hai.</dd>
<dt>Heavy Forwarder</dt><dd>Poora Splunk instance jo data index hone se pehle parse, filter ya route karne ke liye use hota hai, jaise noisy syslog source ke aage.</dd>
<dt>HTTP Event Collector (HEC)</dt><dd>Token-authenticated API (default port 8088) jis par applications aur cloud services events post karti hain. Kai security products ise use karte hain.</dd>
<dt>Indexer</dt><dd>Events ko <b>indexes</b> (jaise <code>dns</code>, <code>netfw</code>, <code>endpoint</code>) mein store karta hai, samay ke hisaab se buckets mein jo hot se warm se cold aur aakhir mein frozen (delete ya archive) hote hain.</dd>
<dt>Search head</dt><dd>Jahan users searches aur dashboards chalate hain; yeh search indexers ko bhejta hai aur results merge karta hai.</dd>
</dl>
<p>Har event ke default fields hote hain: <code>_time</code>, <code>index</code>, <code>host</code>, <code>source</code> aur <code>sourcetype</code>. <code>query</code> ya <code>src_ip</code> jaise doosre fields search karte waqt extract hote hain (schema on read). <b>Common Information Model</b> (CIM) vendors ke across fields ko standard naam deta hai, isliye <code>src</code>, <code>dest</code>, <code>user</code> aur <code>action</code> ka matlab same rehta hai chahe event Cisco ke firewall se aaya ho ya kisi aur vendor ke.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Splunk architecture">
<rect x="10" y="20" width="150" height="44" rx="8" fill="#bbf7d0"/><text x="85" y="47" text-anchor="middle" class="svg-ink" font-size="12">Universal Forwarders</text>
<rect x="10" y="85" width="150" height="44" rx="8" fill="#bae6fd"/><text x="85" y="112" text-anchor="middle" class="svg-ink" font-size="12">Syslog / Heavy Fwd</text>
<rect x="10" y="150" width="150" height="44" rx="8" fill="#fde68a"/><text x="85" y="177" text-anchor="middle" class="svg-ink" font-size="12">HEC (cloud, apps)</text>
<rect x="240" y="70" width="150" height="74" rx="8" fill="#fed7aa"/><text x="315" y="98" text-anchor="middle" class="svg-ink" font-size="13">Indexers</text><text x="315" y="118" text-anchor="middle" class="svg-muted" font-size="11">samay se indexes</text><text x="315" y="134" text-anchor="middle" class="svg-muted" font-size="11">hot, warm, cold</text>
<rect x="470" y="70" width="160" height="74" rx="8" fill="#ddd6fe"/><text x="550" y="98" text-anchor="middle" class="svg-ink" font-size="13">Search head</text><text x="550" y="118" text-anchor="middle" class="svg-muted" font-size="11">SPL, dashboards,</text><text x="550" y="134" text-anchor="middle" class="svg-muted" font-size="11">detections</text>
<line x1="160" y1="42" x2="240" y2="95" stroke="#64748b" stroke-width="2"/><line x1="160" y1="107" x2="240" y2="107" stroke="#64748b" stroke-width="2"/><line x1="160" y1="172" x2="240" y2="122" stroke="#64748b" stroke-width="2"/><line x1="390" y1="107" x2="470" y2="107" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Data forwarders, syslog aur HEC se indexers mein jaata hai; search head unke across SPL chalata hai.</p></div>

<h3>SPL search ka shape</h3>
<p>Search <b>search terms</b> se shuru hoti hai jo events select karte hain, phir unhe pipe <code>|</code> se jude commands mein left se right bhejti hai. Hamesha pehle <code>index</code> aur samay se narrow karo; time range time picker se ya search mein <code>earliest=-24h latest=now</code> se aati hai.</p>
<table class="cmp"><tr><th>Command</th><th>Kya karta hai</th><th>Example</th></tr>
<tr><td>search terms</td><td>Events filter: <code>field=value</code>, wildcards <code>*</code>, <code>!=</code>, AND / OR / NOT</td><td><code>index=dns qtype=TXT host=PC-*</code></td></tr>
<tr><td>table</td><td>Dikhane ke columns chuno</td><td><code>| table _time host query</code></td></tr>
<tr><td>stats</td><td>Aggregate: count, dc (distinct count), sum, avg, values, BY ke saath group</td><td><code>| stats count dc(query) AS unique BY host</code></td></tr>
<tr><td>timechart</td><td>Time buckets par stats, chart ke liye ready</td><td><code>| timechart span=10m count BY host</code></td></tr>
<tr><td>eval</td><td>Field banao ya badlo</td><td><code>| eval qlen=len(query)</code></td></tr>
<tr><td>where</td><td>Comparison ya computed field par filter</td><td><code>| where count &gt; 20</code></td></tr>
<tr><td>sort, head, dedup</td><td>Order (<code>-</code> descending), pehle N rakho, duplicates hatao</td><td><code>| sort -count | head 10</code></td></tr>
<tr><td>top, rare</td><td>Field ki sabse common aur sabse kam values</td><td><code>| top limit=5 query</code></td></tr>
<tr><td>lookup, inputlookup</td><td>Table (CSV ya KV store) se events enrich karo, ya table khud padho</td><td><code>| lookup bad_domains domain AS parent OUTPUT category</code></td></tr></table>

<h3>Lab data par try karna</h3>
<p>Splunk lab mein <code>index=dns</code> mein PC-DEV, PC-HR aur PC-FIN ke ek ghante ke DNS events hain. Host aur record type ke hisaab se pehla overview:</p>
<pre class="code">index=dns | stats count by host qtype</pre>
<pre class="out">host     qtype   count
<span class="hl">PC-DEV   TXT     40</span>
PC-HR    A        3
PC-FIN   A        3</pre>
<p>Wahi data samay ke saath dikhata hai ki PC-DEV steadily query karta hai, har das-minute bucket mein das, jabki baaki ne ghante ki shuruaat mein kuch lookups kiye:</p>
<pre class="code">index=dns | timechart span=10m count by host</pre>
<pre class="out">_time                 PC-DEV  PC-FIN  PC-HR
2026-09-29 11:00:00   0       3       3
2026-09-29 11:10:00   <span class="hl">10</span>      0       0
2026-09-29 11:20:00   <span class="hl">10</span>      0       0
2026-09-29 11:30:00   <span class="hl">10</span>      0       0
2026-09-29 11:40:00   <span class="hl">10</span>      0       0</pre>
<p>Aur threat list ke against lookup. <code>rex</code> command naam ke aakhri do labels ko <code>parent</code> ki tarah nikalta hai; lookup <code>category</code> field sirf un parents ke liye jodta hai jo list mein hain:</p>
<pre class="code">index=dns
| rex field=query "(?&lt;parent&gt;[^.]+\\.[^.]+)$"
| lookup bad_domains domain AS parent OUTPUT category
| where isnotnull(category)
| stats count by host parent category</pre>
<p>Lab console SPL ka ek real subset implement karta hai: <code>*</code> aur comparisons ke saath search terms, <code>stats count by</code>, <code>table</code>, ek comparison wala <code>where</code>, <code>sort</code>, <code>head</code> aur <code>dedup</code>. <code>timechart</code>, <code>eval</code>, <code>rex</code> aur <code>lookup</code> yahan exam aur real kaam ke liye dikhaye hain par lab console mein available nahi hain.</p>

<div class="eg"><p><b>Worked example: aapki search kuch kyun nahi lautati.</b> Analyst <code>index=dns qtype=TXT | stats count by host</code> chalata hai aur 0 results milte hain. Order mein checks: time picker "Last 15 minutes" kehta hai par activity do ghante pehle thi (badhao); index ka asli naam <code>dns_logs</code> hai (<code>| eventcount summarize=false index=*</code> chalao ya admin se check karo); is sourcetype mein field ka naam <code>record_type</code> hai (ek raw event kholkar field names padho). Zyada tar "Splunk kharab hai" tickets inhi teen mein se ek hote hain.</p></div>

<div class="warn"><p><b>Common galti.</b> Har search ko "All time" par <code>index=*</code> se shuru karna. Yeh sab kuch scan karta hai, aapke liye slow aur indexers share karne wale sabke liye mehenga hai, aur noise lautata hai. Index ka naam do, time range set karo, aur search mein jitna jaldi (jitna left) ho sake filter karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Forwarders bhejte hain, indexers store karte hain, search heads search karte hain. <code>stats</code> bina time buckets ke aggregate karta hai; <code>timechart</code> charts ke liye <code>_time</code> buckets par aggregate karta hai. <code>where</code> calculations ke baad filter karta hai; search terms shuru mein filter karte hain. Lookup external table se events enrich karta hai.</p></div>

<div class="scn"><h4>Firewall logs jo bhavishya se aaye</h4><p>Ek SOC ko incident window ke dauraan firewall events nahi mil rahe the, jabki firewall saaf taur par log kar raha tha. Events wahin the par saadhe paanch ghante ke fark ke saath stamped, kyunki syslog source bina zone ke local time bhejta tha aur Splunk use UTC maan kar parse karta tha. 14:00 se 15:00 IST ki searches galat bucket dekh rahi thin. Fix tha input configuration mein us sourcetype ka time zone set karna aur firewall par NTP enable karna.</p><p><b>Seekh:</b> sahi <code>_time</code> har SIEM search ki neenv hai; data missing lage to pehle timestamps check karo.</p></div>

<div class="iv"><p class="q">"Pichhle 24 ghante mein blocked firewall connections ki sankhya ke hisaab se top das hosts dhoondhne ki SPL search likho."</p><p>Strong answer: <code>index=netfw action=blocked earliest=-24h | stats count by src_ip | sort -count | head 10</code>. Har hissa samjhao: performance ke liye pehle index aur time, aggregate karne ke liye <code>stats count by</code>, descending ke liye <code>sort -count</code>, top das rakhne ke liye <code>head 10</code>. Jodo ki <code>timechart</code> trend dikhayega aur lookup asset owner jod sakta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Splunk components: Universal aur Heavy Forwarders, HEC, time-based buckets wale indexers, search heads.</li>
<li>Default fields: _time, index, host, source, sourcetype; CIM vendors ke across field names normalise karta hai.</li>
<li>SPL: search terms, phir piped commands; pehle index aur time se filter karo.</li>
<li>Core commands: table, stats (count, dc, sum), timechart, eval, where, sort, head, dedup, top, lookup.</li>
<li>Zero results ka matlab aam taur par galat time range, index name ya field name.</li>
</ul></div>
`}};export{e as default};