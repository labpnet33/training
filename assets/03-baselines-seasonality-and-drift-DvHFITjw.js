var e={id:`baselines-drift`,h:{en:`Baselines, seasonality and drift`,hi:`Baselines, seasonality aur drift`},body:{en:`
<h3>What does "normal" mean?</h3>
<p>A fixed threshold says "above 100 ms is bad". It is simple, but different links have different normals. A 100 ms latency is shocking between Hyderabad and a server in the same building and quite normal on a long overseas path. A <b>baseline</b> records what normal looks like for one metric on one target, and then flags readings that are unusual <i>for that metric</i>, even when they stay under any fixed number.</p>

<h3>Mean, standard deviation and the z-score</h3>
<dl class="terms">
<dt>Mean</dt><dd>The average of the readings in the learning period.</dd>
<dt>Standard deviation (sd)</dt><dd>How much readings normally wander around the mean. A small sd means a steady metric.</dd>
<dt>z-score</dt><dd>How many sds a reading is from the mean: z = (reading - mean) / sd. A z of 3 or more is unusual. The setting <b>sigma (k)</b> in the console is that cut-off.</dd>
</dl>
<div class="eg"><p><b>Worked example.</b> Kochi latency in a healthy period: mean 40 ms, sd 4 ms. A reading of 46 ms has z = 1.5, ordinary. A reading of 55 ms has z = 3.75, unusual, even though 55 ms is far below any 100 ms threshold. The baseline caught a problem that a fixed threshold would not.</p></div>

<h3>Fixed versus rolling baseline</h3>
<table class="cmp"><tr><th></th><th>Fixed</th><th>Rolling</th></tr>
<tr><td>Learned from</td><td>A known-good reference range chosen once (the console reference is points 0 to 576, the first two healthy days)</td><td>The last N points before now (window, in points)</td></tr>
<tr><td>Changes over time?</td><td>No</td><td>Yes, it re-learns constantly</td></tr>
<tr><td>Good at</td><td>Catching a lasting degradation</td><td>Following slow, healthy growth</td></tr>
<tr><td>Bad at</td><td>Healthy growth makes it stale</td><td>A long problem becomes the new normal</td></tr></table>
<p>The weakness of the rolling baseline has a name: <b>drift</b>. Because it learns from the recent past, if the metric stays bad for longer than the window, the bad state fills the window, the mean moves to the bad level and the z-score returns to zero. The dashboard says "normal now" while users still suffer. The console even labels it: "drifted: bad state learned as normal".</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Fixed versus rolling baseline">
<line x1="30" y1="190" x2="610" y2="190" stroke="#64748b" stroke-width="2"/>
<polyline points="30,150 120,148 210,150 300,149 330,70 420,72 510,70 600,71" fill="none" stroke="#0b1b2b" stroke-width="2"/>
<line x1="30" y1="150" x2="610" y2="150" stroke="#bbf7d0" stroke-width="3"/><text x="40" y="170" class="svg-muted" font-size="12">fixed baseline: stays at healthy level</text>
<polyline points="30,150 300,150 330,140 420,110 510,80 600,71" fill="none" stroke="#fed7aa" stroke-width="3" stroke-dasharray="6 4"/><text x="330" y="40" class="svg-accent" font-size="12">rolling baseline climbs to the bad level</text>
<text x="330" y="210" text-anchor="middle" class="svg-muted" font-size="12">after one full window the rolling baseline says normal</text>
</svg><p class="cap">The metric shifts at the middle. The fixed line stays; the rolling line catches up.</p></div>

<h3>The Kochi drift in numbers</h3>
<p>With the tweak <code>drift</code>, Kochi latency has been 70 ms higher for 900 points, about three days. The rolling baseline <code>bl-lat-kch-roll</code> has a window of 576 points, two days. Healthy mean 40 ms, sd 4 ms, so latency now is about 110 ms.</p>
<pre class="out">Baselines
bl-lat-kch       fixed    now 110 ms   expects 40 (sd 4)    z = 17.5   <span class="hl">abnormal now</span>
bl-lat-kch-roll  rolling  now 110 ms   expects 110 (sd 4)   z = 0.0    normal now
   Healthy reference: 40 (sd 4), z against it = 17.5   drifted</pre>
<p>Same data, opposite answers. The rolling baseline learned the problem. This is exactly what a rolling baseline does to an outage: it normalises it. After 576 points of bad data nothing is abnormal any more. A fixed baseline, or a fixed threshold, would have kept the alarm on.</p>

<h3>Seasonality</h3>
<p>Many metrics repeat. Utilisation at 13:00 is higher than at 03:00 every day, and weekends are quieter. A plain baseline over all hours has a large sd, so it forgives a lot. A <b>daily seasonal</b> baseline compares a reading with the same time of day on earlier days, which makes a 02:00 backup peak normal at 02:00 and unusual at 14:00. The console setting is Seasonality: none or daily. Weekly seasonality (weekend versus weekday) exists in real tools; the console models the daily pattern and a weekend factor in its data.</p>

<h3>Lab obs-dash-2: fixed versus rolling</h3>
<p>The console has <code>bl-lat-kch</code> (Kochi latency, fixed) and <code>bl-util-hyd</code> (HQ utilisation, rolling). In OBSERVER open <b>Baselines</b>.</p>
<ol>
<li>Read each card: "now X; this baseline expects M (sd S), z = Z. Healthy reference: R (sd Q), z against it = Y."</li>
<li>Compare z against the baseline with z against the healthy reference. If they disagree strongly, the baseline is learning something it should not.</li>
<li>Press Add baseline to create one, then set Metric, Target, Mode, Rolling window (points, 288 = one day), Sigma (k) and Seasonality.</li>
<li>Try Mode fixed and rolling on the same metric and watch the "abnormal now" badge change.</li>
<li>Press <b>Apply changes</b>.</li>
</ol>
<p><b>What does this change on the wire/policy?</b> A baseline only judges data. Changing mode, window or sigma changes what the console calls abnormal, and any alert rule that uses a baseline will fire or stay silent differently. Nothing is sent to a device. Without an alert rule that uses it, a baseline pages nobody.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Using a rolling baseline for an outage alert. (2) A window shorter than the typical problem. (3) Sigma of 1, so ordinary noise is "abnormal". (4) Learning a fixed baseline from a bad week. (5) Ignoring seasonality and being paged for the backup every night.</p></div>
<div class="exam"><p><b>Exam trap.</b> A rolling baseline adapts. That is a feature for growth and a bug for failure. Questions about "why did the alert stop firing during a long outage?" usually have the answer drift.</p></div>

<div class="scn"><h4>Three days of a slow Kochi circuit</h4><p>After a provider change Kochi latency rose by 70 ms and stayed. The team had only a rolling anomaly alert. For two days it fired, then went quiet. On day four the sales team complained. Priya Nair compared against the healthy reference and found latency 17 sd above normal. They added a fixed baseline and a plain threshold on latency.</p><p><b>Lesson:</b> use a fixed reference or threshold for things that must never be accepted as normal.</p></div>

<div class="iv"><p class="q">"Fixed or rolling baseline: which do you choose?"</p><p>Strong answer: fixed for service levels and outage detection because it never forgets what healthy looks like; rolling for metrics that grow with the business, ideally with daily seasonality, and always paired with a fixed safety threshold so a long problem cannot become normal.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A baseline is mean and sd of a metric; the z-score says how unusual a reading is.</li>
<li>Fixed is learned once; rolling re-learns from the last window.</li>
<li>Drift: a problem longer than the window becomes the new normal.</li>
<li>Daily seasonality makes a nightly peak normal at night only.</li>
<li>Baselines judge; only alert rules with a route notify.</li>
</ul></div>
`,hi:`
<h3>"Normal" ka kya matlab hai?</h3>
<p>Fixed threshold kehta hai "100 ms se upar bura hai". Yeh simple hai, lekin alag links ke normal alag hote hain. Hyderabad aur usi building ke server ke beech 100 ms latency chaukane wali hai aur lambe overseas path par kaafi normal. <b>Baseline</b> ek target par ek metric ke liye record karta hai ki normal kaisa dikhta hai, aur phir un readings ko flag karta hai jo <i>us metric ke liye</i> unusual hain, chahe woh kisi fixed number se neeche hi ho.</p>

<h3>Mean, standard deviation aur z-score</h3>
<dl class="terms">
<dt>Mean</dt><dd>Learning period ki readings ka average.</dd>
<dt>Standard deviation (sd)</dt><dd>Readings normally mean ke aaspaas kitni ghoomti hain. Chhota sd matlab steady metric.</dd>
<dt>z-score</dt><dd>Ek reading mean se kitne sd door hai: z = (reading - mean) / sd. 3 ya usse zyada z unusual hai. Console ki setting <b>sigma (k)</b> wahi cut-off hai.</dd>
</dl>
<div class="eg"><p><b>Worked example.</b> Healthy period mein Kochi latency: mean 40 ms, sd 4 ms. 46 ms ki reading ka z = 1.5, aam. 55 ms ki reading ka z = 3.75, unusual, bhale hi 55 ms kisi bhi 100 ms threshold se bahut neeche hai. Baseline ne woh problem pakdi jo fixed threshold nahi pakadta.</p></div>

<h3>Fixed versus rolling baseline</h3>
<table class="cmp"><tr><th></th><th>Fixed</th><th>Rolling</th></tr>
<tr><td>Kahan se seekha</td><td>Ek baar chuni hui known-good reference range (console reference points 0 se 576, pehle do healthy din)</td><td>Ab se pehle ke last N points (window, points mein)</td></tr>
<tr><td>Time ke saath badalta hai?</td><td>Nahi</td><td>Haan, lagatar re-learn karta hai</td></tr>
<tr><td>Kis mein achha</td><td>Lambi degradation pakadna</td><td>Dheemi, healthy growth ko follow karna</td></tr>
<tr><td>Kis mein bura</td><td>Healthy growth se stale ho jaata hai</td><td>Lambi problem naya normal ban jaati hai</td></tr></table>
<p>Rolling baseline ki kamzori ka ek naam hai: <b>drift</b>. Kyunki woh recent past se seekhta hai, agar metric window se zyada der kharab rahe, to kharab state window bhar deti hai, mean kharab level par chala jaata hai aur z-score wapas zero ho jaata hai. Dashboard kehta hai "normal now" jabki users abhi bhi pareshan hain. Console ise label bhi karta hai: "drifted: bad state learned as normal".</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Fixed versus rolling baseline">
<line x1="30" y1="190" x2="610" y2="190" stroke="#64748b" stroke-width="2"/>
<polyline points="30,150 120,148 210,150 300,149 330,70 420,72 510,70 600,71" fill="none" stroke="#0b1b2b" stroke-width="2"/>
<line x1="30" y1="150" x2="610" y2="150" stroke="#bbf7d0" stroke-width="3"/><text x="40" y="170" class="svg-muted" font-size="12">fixed baseline: healthy level par rehta hai</text>
<polyline points="30,150 300,150 330,140 420,110 510,80 600,71" fill="none" stroke="#fed7aa" stroke-width="3" stroke-dasharray="6 4"/><text x="330" y="40" class="svg-accent" font-size="12">rolling baseline kharab level tak chadh jaata hai</text>
<text x="330" y="210" text-anchor="middle" class="svg-muted" font-size="12">ek poori window ke baad rolling baseline normal kehta hai</text>
</svg><p class="cap">Metric beech mein shift hota hai. Fixed line wahin rehti hai; rolling line pakad leti hai.</p></div>

<h3>Kochi drift numbers mein</h3>
<p>Tweak <code>drift</code> ke saath Kochi latency 900 points, yani lagbhag teen din se 70 ms zyada hai. Rolling baseline <code>bl-lat-kch-roll</code> ki window 576 points, yani do din hai. Healthy mean 40 ms, sd 4 ms, to latency ab lagbhag 110 ms hai.</p>
<pre class="out">Baselines
bl-lat-kch       fixed    now 110 ms   expects 40 (sd 4)    z = 17.5   <span class="hl">abnormal now</span>
bl-lat-kch-roll  rolling  now 110 ms   expects 110 (sd 4)   z = 0.0    normal now
   Healthy reference: 40 (sd 4), z against it = 17.5   drifted</pre>
<p>Wahi data, ulte jawab. Rolling baseline ne problem seekh li. Rolling baseline outage ke saath yahi karta hai: use normalise kar deta hai. 576 points kharab data ke baad kuch bhi abnormal nahi rehta. Fixed baseline ya fixed threshold alarm on rakhta.</p>

<h3>Seasonality</h3>
<p>Kai metrics repeat hote hain. 13:00 par utilisation har din 03:00 se zyada hoti hai, aur weekends shaant hote hain. Saare ghanton par plain baseline ka sd bada hota hai, isliye woh bahut maaf kar deta hai. <b>Daily seasonal</b> baseline reading ko pichhle dinon ke usi time of day se compare karta hai, jisse 02:00 ka backup peak 02:00 par normal aur 14:00 par unusual hota hai. Console setting Seasonality hai: none ya daily. Weekly seasonality (weekend versus weekday) real tools mein hoti hai; console daily pattern aur apne data mein weekend factor model karta hai.</p>

<h3>Lab obs-dash-2: fixed versus rolling</h3>
<p>Console mein <code>bl-lat-kch</code> (Kochi latency, fixed) aur <code>bl-util-hyd</code> (HQ utilisation, rolling) hain. OBSERVER mein <b>Baselines</b> kholo.</p>
<ol>
<li>Har card padho: "now X; this baseline expects M (sd S), z = Z. Healthy reference: R (sd Q), z against it = Y."</li>
<li>Baseline ke against z ko healthy reference ke against z se compare karo. Agar bahut alag hain, to baseline kuch aisa seekh raha hai jo use nahi seekhna chahiye.</li>
<li>Naya banane ke liye Add baseline dabao, phir Metric, Target, Mode, Rolling window (points, 288 = ek din), Sigma (k) aur Seasonality set karo.</li>
<li>Ek hi metric par Mode fixed aur rolling try karo aur "abnormal now" badge badalta dekho.</li>
<li><b>Apply changes</b> dabao.</li>
</ol>
<p><b>Wire/policy par kya badalta hai?</b> Baseline sirf data ko judge karta hai. Mode, window ya sigma badalne se console jise abnormal kehta hai woh badalta hai, aur baseline use karne wala koi bhi alert rule alag tarah fire ya chup rahega. Device ko kuch nahi bheja jaata. Use karne wale alert rule ke bina baseline kisi ko page nahi karta.</p>

<div class="warn"><p><b>Common galtiyan.</b> (1) Outage alert ke liye rolling baseline use karna. (2) Typical problem se chhoti window. (3) Sigma 1, to aam noise "abnormal" hai. (4) Kharab hafte se fixed baseline seekhna. (5) Seasonality ignore karke har raat backup ke liye page hona.</p></div>
<div class="exam"><p><b>Exam trap.</b> Rolling baseline adapt karta hai. Growth ke liye feature hai aur failure ke liye bug. "Lambi outage ke dauraan alert fire hona kyun band ho gaya?" jaise sawaalon ka jawab aksar drift hota hai.</p></div>

<div class="scn"><h4>Kochi ke slow circuit ke teen din</h4><p>Provider change ke baad Kochi latency 70 ms badhi aur wahin rahi. Team ke paas sirf rolling anomaly alert tha. Do din fire hua, phir chup. Chauthe din sales team ne shikayat ki. Priya Nair ne healthy reference se compare kiya aur latency normal se 17 sd upar mili. Unhone fixed baseline aur latency par plain threshold jod diya.</p><p><b>Seekh:</b> jo cheezein kabhi normal nahi maani jaani chahiye unke liye fixed reference ya threshold use karo.</p></div>

<div class="iv"><p class="q">"Fixed ya rolling baseline: kaun sa chunoge?"</p><p>Strong answer: service levels aur outage detection ke liye fixed kyunki woh kabhi nahi bhoolta ki healthy kaisa dikhta hai; business ke saath badhne wale metrics ke liye rolling, achhe se daily seasonality ke saath, aur hamesha ek fixed safety threshold ke saath taaki lambi problem normal na ban sake.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Baseline metric ka mean aur sd hai; z-score batata hai reading kitni unusual hai.</li>
<li>Fixed ek baar seekha jaata hai; rolling last window se re-learn karta hai.</li>
<li>Drift: window se lambi problem naya normal ban jaati hai.</li>
<li>Daily seasonality raat ke peak ko sirf raat mein normal banati hai.</li>
<li>Baselines judge karte hain; sirf route wale alert rules notify karte hain.</li>
</ul></div>
`}};export{e as default};