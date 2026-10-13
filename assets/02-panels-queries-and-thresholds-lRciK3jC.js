var e={id:`panels-queries-thresholds`,h:{en:`Panels, queries and thresholds`,hi:`Panels, queries aur thresholds`},body:{en:`
<h3>A panel is a question with a picture</h3>
<p>Every panel on a dashboard asks the stored data one question and draws the answer. "What was the CPU of R-HYD over the last twelve hours, and what is the highest value?" The question has four parts: <b>which metric</b>, <b>which target</b>, <b>how to combine many points into one number</b> (the aggregation) and <b>which time range</b> (the window). A fifth part, the <b>threshold</b>, decides the colour of the answer.</p>

<h3>Panel types you will meet</h3>
<table class="cmp"><tr><th>Panel type</th><th>Best for</th><th>Weakness</th></tr>
<tr><td>Stat (one big number)</td><td>Current state: is it ok right now?</td><td>No history</td></tr>
<tr><td>Time series (line)</td><td>Trends, spikes, before and after a change</td><td>Hard to compare many lines</td></tr>
<tr><td>Bar chart</td><td>Comparing sites or interfaces side by side</td><td>Hides time</td></tr>
<tr><td>Gauge</td><td>One value against a scale</td><td>Wastes space</td></tr>
<tr><td>Table</td><td>Exact values, top ten lists</td><td>Slow to scan</td></tr>
<tr><td>Log panel</td><td>Recent messages for context</td><td>Noisy</td></tr></table>
<p>The console panel is a stat plus a small trend, which is the most useful combination for a health screen: the number says "now", the trend says "how did we get here". The Flows and Logs pages hold the table and log views.</p>

<h3>Queries and aggregation</h3>
<p>The monitoring system stores one point every five minutes. A panel covering twelve hours must turn 144 points into one number. Which number depends on the aggregation:</p>
<dl class="terms">
<dt>last</dt><dd>The newest point. Good for "right now". Sensitive to one odd reading.</dd>
<dt>avg</dt><dd>The mean of the window. Smooth, but hides short spikes, like the burst in obs-telemetry chapter 1.</dd>
<dt>max</dt><dd>The highest point. Shows the worst moment, but one glitch dominates it.</dd>
<dt>p95</dt><dd>The 95th percentile: the value that 95 percent of points are below. It ignores the top 5 percent glitches and still shows sustained high load. The console panel offers last, avg and max; p95 is the standard "tail" measure in most dashboard tools, so you must know it.</dd>
</dl>
<div class="eg"><p><b>Worked example.</b> Latency from Hyderabad to Lucknow, twenty readings in ms: eighteen readings between 34 and 40 and two readings of 190 and 210 during a link flap. avg = about 53 ms, which looks fine. max = 210 ms, which looks alarming and describes two readings. p95 lands near 190 ms because the top one reading in twenty is 5 percent: it tells you "at least one in twenty requests was slow". For user-facing latency, report avg and p95 together; for capacity, report max and avg.</p></div>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Aggregations on one series">
<line x1="30" y1="180" x2="610" y2="180" stroke="#64748b" stroke-width="2"/>
<polyline points="30,150 80,148 130,152 180,149 230,60 280,151 330,147 380,150 430,148 480,152 530,149 580,150" fill="none" stroke="#0b1b2b" stroke-width="2"/>
<line x1="30" y1="150" x2="610" y2="150" stroke="#bbf7d0" stroke-width="3"/><text x="615" y="154" class="svg-muted" font-size="12">avg</text>
<line x1="30" y1="60" x2="610" y2="60" stroke="#fed7aa" stroke-width="3" stroke-dasharray="6 4"/><text x="615" y="64" class="svg-muted" font-size="12">max</text>
<line x1="30" y1="140" x2="610" y2="140" stroke="#ddd6fe" stroke-width="3" stroke-dasharray="2 4"/><text x="615" y="132" class="svg-muted" font-size="12">p95</text>
<text x="230" y="48" text-anchor="middle" class="svg-accent" font-size="12">one spike</text>
<text x="320" y="210" text-anchor="middle" class="svg-muted" font-size="12">one spike moves max a lot, p95 a little, avg barely</text>
</svg><p class="cap">The same series, three different answers.</p></div>

<h3>Time ranges</h3>
<p>The console window is in points: 12 = one hour, 144 = twelve hours, 288 = one day, 2016 = one week. Choose the window to match the decision. An on-call engineer at 03:00 needs the last hour or two. A capacity planner needs weeks. Keep the same range on every panel of a dashboard, otherwise one panel shows "now" and the next shows "yesterday" and the eye compares them wrongly.</p>

<h3>Thresholds: lines, not alarms</h3>
<p>Each panel has a <b>warn</b> line and a <b>crit</b> line. When the shown value crosses warn the badge turns warn, and past crit it turns crit. Choose them from data: warn a little above the normal daily peak, crit where users feel pain. If CPU normally peaks near 55 percent at 13:00, a warn at 70 and crit at 90 leaves room. If the warn line sits inside the normal range the panel is amber all day and people stop looking. Remember the direction too: for "free memory" bad is low, for CPU bad is high.</p>
<p><b>What does this change on the wire/policy?</b> Nothing leaves the console. Thresholds on a panel are colours. They do not page anyone; only an alert rule with a route does that (module obs-alert). That is why a dashboard can be red while nobody is woken up, and why you must not rely on a panel to notify.</p>

<h3>Lab obs-dash-1: build a health dashboard</h3>
<p>Goal: a health dashboard with panels for the four signals and sensible thresholds. In OBSERVER:</p>
<ol>
<li>Open <b>Dashboards</b>. Choose the dashboard <code>d-health</code>. Its panels are <code>p-cpu-hyd</code>, <code>p-util-kch</code>, <code>p-lat-lko</code> and <code>p-loss-kch</code>.</li>
<li>Press <b>Add panel</b> if the lab asks for one more. A new card appears: "New panel", cpu on R-HYD, last, warn 70, crit 90, window 144.</li>
<li>Press <b>Edit</b> on a panel. Set Title, Target, Metric, Value shown (last, avg or max), Warning line, Critical line and Window.</li>
<li>Read each panel result badge. Check that none is amber when the network is healthy.</li>
<li>Press <b>Apply changes</b> in the CommitBar. The applied dashboard is what the lab checks.</li>
</ol>
<pre class="out">d-health (applied)
p-cpu-hyd    R-HYD   cpu      avg    44 %   warn 70  crit 90   ok
p-util-kch   R-KCH   util     max    61 %   warn 75  crit 90   ok
p-lat-lko    R-LKO   latency  avg    39 ms  warn 100 crit 150  ok
p-loss-kch   R-KCH   loss     max    0 %    warn 1   crit 2    ok</pre>
<p>These numbers show the idea: warn above the normal peak, crit where users complain, and a sensible aggregation for each metric. Your lab brief gives the exact values.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Using max on a noisy metric so the panel is always amber. (2) Using avg on a burst metric and missing the problem. (3) Different windows on neighbouring panels. (4) Forgetting Apply, so the checker sees the old dashboard. (5) Thinking a red panel pages the on-call.</p></div>
<div class="exam"><p><b>Exam trap.</b> p95 is not "the average of the top 5 percent". It is the value below which 95 percent of the readings fall. Also: avg of percentages across different sites is not the same as the overall percentage.</p></div>

<div class="scn"><h4>The panel that was always amber</h4><p>Ravi Menon set the CPU warning of the Hyderabad router at 40 percent. The daily peak at 13:00 was 55 percent, so the panel was amber every afternoon. By the second week the team ignored it. When CPU really climbed to 88 percent after a routing problem nobody reacted quickly. Moving warn to 70 and crit to 90 made amber rare and meaningful.</p><p><b>Lesson:</b> a threshold that is always crossed teaches people to ignore it.</p></div>

<div class="iv"><p class="q">"Average, max or p95: which do you show for latency?"</p><p>Strong answer: avg and p95 together for user experience, because avg shows the typical request and p95 shows the slow tail. Use max sparingly, for capacity peaks, since a single glitch dominates it. Mention that the window must match the decision.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A panel is metric, target, aggregation, window and thresholds.</li>
<li>last is "now", avg hides spikes, max shows the worst, p95 shows the tail.</li>
<li>12 points are an hour, 288 a day; keep one range per dashboard.</li>
<li>Warn and crit are colours chosen from the data. They page nobody.</li>
<li>Apply is what makes the dashboard the one that the lab and your colleagues see.</li>
</ul></div>
`,hi:`
<h3>Panel ek tasveer wala sawaal hai</h3>
<p>Dashboard ka har panel stored data se ek sawaal poochta hai aur jawab draw karta hai. "Pichhle barah ghante mein R-HYD ka CPU kya tha, aur sabse upar ki value kya hai?" Sawaal ke chaar hisse hote hain: <b>kaun sa metric</b>, <b>kaun sa target</b>, <b>bahut saare points ko ek number mein kaise milana hai</b> (aggregation) aur <b>kaun sa time range</b> (window). Paanchva hissa, <b>threshold</b>, jawab ka colour decide karta hai.</p>

<h3>Panel types jo aap milenge</h3>
<table class="cmp"><tr><th>Panel type</th><th>Kis kaam ke liye best</th><th>Kamzori</th></tr>
<tr><td>Stat (ek bada number)</td><td>Current state: abhi ok hai?</td><td>History nahi</td></tr>
<tr><td>Time series (line)</td><td>Trends, spikes, change ke pehle aur baad</td><td>Bahut saari lines compare karna mushkil</td></tr>
<tr><td>Bar chart</td><td>Sites ya interfaces ko side by side compare karna</td><td>Time chhup jaata hai</td></tr>
<tr><td>Gauge</td><td>Ek value ek scale ke against</td><td>Jagah barbaad</td></tr>
<tr><td>Table</td><td>Exact values, top ten lists</td><td>Scan karna slow</td></tr>
<tr><td>Log panel</td><td>Context ke liye recent messages</td><td>Noisy</td></tr></table>
<p>Console panel stat plus ek chhota trend hai, jo health screen ke liye sabse upyogi combination hai: number "abhi" batata hai, trend batata hai "yahan tak kaise pahunche". Table aur log views Flows aur Logs pages mein hain.</p>

<h3>Queries aur aggregation</h3>
<p>Monitoring system har paanch minute mein ek point store karta hai. Barah ghante cover karne wale panel ko 144 points ko ek number mein badalna hota hai. Kaun sa number, yeh aggregation par depend karta hai:</p>
<dl class="terms">
<dt>last</dt><dd>Sabse naya point. "Abhi" ke liye achha. Ek ajeeb reading se sensitive.</dd>
<dt>avg</dt><dd>Window ka mean. Smooth hai, lekin chhote spikes chhupa deta hai, jaise obs-telemetry chapter 1 ka burst.</dd>
<dt>max</dt><dd>Sabse upar ka point. Sabse bura pal dikhata hai, lekin ek glitch use dominate kar deta hai.</dd>
<dt>p95</dt><dd>95th percentile: woh value jiske neeche 95 percent points hain. Yeh top 5 percent glitches ko ignore karta hai aur phir bhi sustained high load dikhata hai. Console panel last, avg aur max deta hai; p95 zyadatar dashboard tools mein standard "tail" measure hai, isliye aapko jaanna zaroori hai.</dd>
</dl>
<div class="eg"><p><b>Worked example.</b> Hyderabad se Lucknow latency, ms mein bees readings: atharah readings 34 se 40 ke beech aur do readings 190 aur 210 ki link flap ke dauraan. avg = lagbhag 53 ms, jo theek dikhta hai. max = 210 ms, jo darawna dikhta hai aur do readings ko describe karta hai. p95 lagbhag 190 ms ke paas girta hai kyunki bees mein se top ek reading 5 percent hai: yeh batata hai "bees mein se kam se kam ek request slow thi". User-facing latency ke liye avg aur p95 saath dikhao; capacity ke liye max aur avg.</p></div>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Aggregations on one series">
<line x1="30" y1="180" x2="610" y2="180" stroke="#64748b" stroke-width="2"/>
<polyline points="30,150 80,148 130,152 180,149 230,60 280,151 330,147 380,150 430,148 480,152 530,149 580,150" fill="none" stroke="#0b1b2b" stroke-width="2"/>
<line x1="30" y1="150" x2="610" y2="150" stroke="#bbf7d0" stroke-width="3"/><text x="615" y="154" class="svg-muted" font-size="12">avg</text>
<line x1="30" y1="60" x2="610" y2="60" stroke="#fed7aa" stroke-width="3" stroke-dasharray="6 4"/><text x="615" y="64" class="svg-muted" font-size="12">max</text>
<line x1="30" y1="140" x2="610" y2="140" stroke="#ddd6fe" stroke-width="3" stroke-dasharray="2 4"/><text x="615" y="132" class="svg-muted" font-size="12">p95</text>
<text x="230" y="48" text-anchor="middle" class="svg-accent" font-size="12">ek spike</text>
<text x="320" y="210" text-anchor="middle" class="svg-muted" font-size="12">ek spike max ko bahut, p95 ko thoda, avg ko mushkil se hilata hai</text>
</svg><p class="cap">Ek hi series, teen alag jawab.</p></div>

<h3>Time ranges</h3>
<p>Console window points mein hai: 12 = ek ghanta, 144 = barah ghante, 288 = ek din, 2016 = ek hafta. Window ko decision se match karo. 03:00 par on-call engineer ko pichhla ek ya do ghante chahiye. Capacity planner ko hafte chahiye. Dashboard ke har panel par ek hi range rakho, warna ek panel "abhi" dikhata hai aur agla "kal" dikhata hai aur aankh unhe galat compare karti hai.</p>

<h3>Thresholds: lines, alarm nahi</h3>
<p>Har panel mein ek <b>warn</b> line aur ek <b>crit</b> line hoti hai. Jab dikhayi gayi value warn cross karti hai to badge warn ho jaata hai, aur crit ke paar crit. Inhe data se chuno: warn normal daily peak se thoda upar, crit wahan jahan users ko dard ho. Agar CPU normally 13:00 par 55 percent ke paas peak karta hai, to warn 70 aur crit 90 jagah chhodte hain. Agar warn line normal range ke andar hai to panel din bhar amber rehta hai aur log dekhna band kar dete hain. Direction bhi yaad rakho: "free memory" ke liye bura low hai, CPU ke liye bura high.</p>
<p><b>Wire/policy par kya badalta hai?</b> Console se kuch bahar nahi jaata. Panel par thresholds colours hain. Woh kisi ko page nahi karte; sirf route wala alert rule karta hai (module obs-alert). Isliye dashboard laal ho sakta hai jabki koi jagaya na jaye, aur isliye notify karne ke liye panel par bharosa mat karo.</p>

<h3>Lab obs-dash-1: health dashboard banao</h3>
<p>Goal: chaar signals ke panels aur sensible thresholds wala health dashboard. OBSERVER mein:</p>
<ol>
<li><b>Dashboards</b> kholo. Dashboard <code>d-health</code> chuno. Iske panels hain <code>p-cpu-hyd</code>, <code>p-util-kch</code>, <code>p-lat-lko</code> aur <code>p-loss-kch</code>.</li>
<li>Agar lab ek aur panel maange to <b>Add panel</b> dabao. Ek naya card aata hai: "New panel", R-HYD par cpu, last, warn 70, crit 90, window 144.</li>
<li>Panel par <b>Edit</b> dabao. Title, Target, Metric, Value shown (last, avg ya max), Warning line, Critical line aur Window set karo.</li>
<li>Har panel ka result badge padho. Check karo ki network healthy hone par koi amber nahi hai.</li>
<li>CommitBar mein <b>Apply changes</b> dabao. Lab applied dashboard ko check karta hai.</li>
</ol>
<pre class="out">d-health (applied)
p-cpu-hyd    R-HYD   cpu      avg    44 %   warn 70  crit 90   ok
p-util-kch   R-KCH   util     max    61 %   warn 75  crit 90   ok
p-lat-lko    R-LKO   latency  avg    39 ms  warn 100 crit 150  ok
p-loss-kch   R-KCH   loss     max    0 %    warn 1   crit 2    ok</pre>
<p>Yeh numbers idea dikhate hain: warn normal peak ke upar, crit wahan jahan users shikayat karein, aur har metric ke liye sensible aggregation. Aapka lab brief exact values deta hai.</p>

<div class="warn"><p><b>Common galtiyan.</b> (1) Noisy metric par max use karna, to panel hamesha amber. (2) Burst metric par avg use karke problem miss karna. (3) Paas ke panels par alag windows. (4) Apply bhool jaana, to checker purana dashboard dekhta hai. (5) Yeh sochna ki laal panel on-call ko page karta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> p95 "top 5 percent ka average" nahi hai. Yeh woh value hai jiske neeche 95 percent readings girti hain. Aur: alag sites ke percentages ka avg overall percentage ke barabar nahi hota.</p></div>

<div class="scn"><h4>Woh panel jo hamesha amber tha</h4><p>Ravi Menon ne Hyderabad router ka CPU warning 40 percent par set kiya. 13:00 ka daily peak 55 percent tha, isliye panel har dopahar amber rehta tha. Doosre hafte tak team ne use ignore karna shuru kar diya. Jab routing problem ke baad CPU sach mein 88 percent tak chadha, kisi ne jaldi react nahi kiya. Warn ko 70 aur crit ko 90 par le jaane se amber kam aur arthpurn ho gaya.</p><p><b>Seekh:</b> jo threshold hamesha cross hota hai woh logon ko ignore karna sikhata hai.</p></div>

<div class="iv"><p class="q">"Latency ke liye average, max ya p95: kaun sa dikhate ho?"</p><p>Strong answer: user experience ke liye avg aur p95 saath, kyunki avg typical request dikhata hai aur p95 slow tail. Max kam use karo, capacity peaks ke liye, kyunki ek glitch use dominate karta hai. Yeh bhi mention karo ki window decision se match honi chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Panel matlab metric, target, aggregation, window aur thresholds.</li>
<li>last "abhi" hai, avg spikes chhupata hai, max sabse bura dikhata hai, p95 tail dikhata hai.</li>
<li>12 points ek ghanta, 288 ek din; ek dashboard par ek range.</li>
<li>Warn aur crit data se chune hue colours hain. Woh kisi ko page nahi karte.</li>
<li>Apply hi dashboard ko woh banata hai jo lab aur aapke colleagues dekhte hain.</li>
</ul></div>
`}};export{e as default};