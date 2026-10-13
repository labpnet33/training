var e={id:`logging`,h:{en:`logging: a diary your script writes for you`,hi:`logging: diary jo aapki script khud likhti hai`},body:{en:`
<p><b>The idea of this chapter:</b> when a script runs at 1:30 in the morning, nobody is watching the screen. A <b>log file</b> is the diary it leaves behind: what happened, when, and how serious it was. The standard <code>logging</code> module writes that diary in a few lines.</p>

<h3>Analogy: a ship's logbook</h3>
<p>Each entry has a time, a severity ("routine", "caution", "emergency") and a sentence. The captain does not read every routine entry, but after a problem the book tells the whole story. Log <b>levels</b> are those severities.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Log levels from debug to error and a threshold">
<rect x="10" y="30" width="120" height="50" rx="8" fill="#e2e8f0"/><text x="70" y="51" text-anchor="middle" class="svg-ink" font-size="12">DEBUG</text><text x="70" y="68" text-anchor="middle" class="svg-muted" font-size="10">details</text>
<rect x="150" y="30" width="120" height="50" rx="8" fill="#bae6fd"/><text x="210" y="51" text-anchor="middle" class="svg-ink" font-size="12">INFO</text><text x="210" y="68" text-anchor="middle" class="svg-muted" font-size="10">normal events</text>
<rect x="290" y="30" width="120" height="50" rx="8" fill="#fde68a"/><text x="350" y="51" text-anchor="middle" class="svg-ink" font-size="12">WARNING</text><text x="350" y="68" text-anchor="middle" class="svg-muted" font-size="10">be careful</text>
<rect x="430" y="30" width="120" height="50" rx="8" fill="#fecaca"/><text x="490" y="51" text-anchor="middle" class="svg-ink" font-size="12">ERROR</text><text x="490" y="68" text-anchor="middle" class="svg-muted" font-size="10">something failed</text>
<line x1="280" y1="95" x2="280" y2="115" stroke="#ef4444" stroke-width="2"/>
<text x="320" y="130" text-anchor="middle" class="svg-accent" font-size="12">level=WARNING keeps this level and everything to its right</text>
</svg><p class="cap">Lower levels are hidden when you set a higher threshold.</p></div>

<h3>The smallest example: dbg2.py</h3>
<pre class="code">import logging
logging.basicConfig(level=logging.DEBUG, format="%(levelname)s %(message)s")
logging.debug("checking %s", "R1")
logging.info("ok")
logging.warning("careful")</pre>
<ul>
<li><code>basicConfig</code> sets up logging once. <code>level=logging.DEBUG</code> means "show everything from DEBUG upward". <code>format</code> is the layout of each line: the level name, then the message.</li>
<li><code>logging.debug(...)</code>, <code>logging.info(...)</code> and <code>logging.warning(...)</code> write one entry each at that severity.</li>
<li><code>"checking %s", "R1"</code>: the <code>%s</code> is a hole filled by the next argument. Passing the value separately, instead of joining text yourself, is the standard way.</li>
</ul>
<pre class="out">AUTO01$ python3 dbg2.py
<span class="hl">DEBUG checking R1</span>
<span class="hl">INFO ok</span>
<span class="hl">WARNING careful</span></pre>
<p>Change <code>DEBUG</code> to <code>WARNING</code> in the file and only the last line would appear. That one setting is the volume knob.</p>

<h3>Logging to a file in the backup tool</h3>
<p>In <code>netbackup.py</code> the setup writes to a file with a time stamp:</p>
<pre class="code">logging.basicConfig(filename="netbackup.log", level=logging.WARNING,
                    format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger("netbackup")</pre>
<p><code>filename=</code> sends the entries to a file instead of the screen, and <code>%(asctime)s</code> adds the date and time. <code>getLogger("netbackup")</code> gives the script a named logger. With the level at <code>WARNING</code>, a failed device is recorded (the script logs it as an error) but successes are quiet. After two runs with R3 down, the diary reads:</p>
<pre class="out">AUTO01$ cat netbackup.log
2026-09-29 09:00:30,000 ERROR HYD-EDGE-R3 (10.99.0.3): NetmikoTimeoutException
2026-09-29 09:00:30,000 ERROR HYD-EDGE-R3 (10.99.0.3): NetmikoTimeoutException</pre>
<p>One line per failed run: date, time, level, device, address and the reason. In the lab every entry shows the same clock time, which is a feature of the simulator; on a real server each line has its own second.</p>

<h3>A verbose switch</h3>
<p>Quiet is right for a nightly job, but when testing you want to see the successes too. The lab fixes this in one edit: the level becomes <code>INFO</code> when <code>-v</code> is typed, otherwise <code>WARNING</code>.</p>
<pre class="out">AUTO01$ grep -n basicConfig -A1 netbackup.py
22:logging.basicConfig(filename="netbackup.log", level=logging.WARNING,
AUTO01$ sed -i 's/level=logging.WARNING,/level=logging.INFO if args.verbose else logging.WARNING,/' netbackup.py
AUTO01$ python3 netbackup.py -v
2 saved, 1 failed
AUTO01$ grep INFO netbackup.log
<span class="hl">2026-09-29 09:00:30,000 INFO PUN-CORE-R1 (10.99.0.1): saved 53 lines to backups/2026-09-29/PUN-CORE-R1.cfg</span>
<span class="hl">2026-09-29 09:00:30,000 INFO BLR-EDGE-R2 (10.99.0.2): saved 53 lines to backups/2026-09-29/BLR-EDGE-R2.cfg</span></pre>
<p><code>level=logging.INFO if args.verbose else logging.WARNING</code> reads like English: use INFO if verbose, else WARNING. <code>grep INFO</code> filters the diary to the success entries. Each says how many lines were saved and where, which is the proof the file is not empty.</p>

<div class="eg"><p><b>Worked example.</b> Your nightly job failed on one switch last Tuesday. Run <code>grep ERROR netbackup.log</code> and you see the device, time and reason without re-running anything.</p></div>

<div class="note"><p><b>Reference code (not run in the simulator).</b> For long-lived tools use a rotating file so the log does not grow forever: <code>logging.handlers.RotatingFileHandler</code>, or let the operating system rotate it. Never log passwords, tokens or full configs that contain secrets.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Using <code>print</code> for everything, so cron output is lost. Logging at the wrong level (everything at ERROR). Calling <code>basicConfig</code> after a first log call, which then has no effect. Writing secrets into the log.</p></div>
<div class="exam"><p><b>Exam trap.</b> Level order is DEBUG, INFO, WARNING, ERROR, CRITICAL. A threshold of WARNING hides DEBUG and INFO. The default level, if you set none, is WARNING.</p></div>

<div class="scn"><h4>The silent nightly job</h4><p>A backup job printed its results to the screen, so under cron they went nowhere. When a router stopped answering, nobody knew for nine days. After the tool logged to a file and the team checked it each morning, the same fault was seen on day one.</p><p><b>Lesson:</b> unattended scripts must leave a trail.</p></div>

<div class="iv"><p class="q">"print or logging?"</p><p>print is for the program's normal output to the user. logging is for the diary of events: it has levels, time stamps, can go to a file and can be turned up or down without editing code.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Levels, low to high: DEBUG, INFO, WARNING, ERROR, CRITICAL.</li>
<li><code>basicConfig(filename=..., level=..., format=...)</code> sets the diary up.</li>
<li>A <code>-v</code> switch can lower the level from WARNING to INFO.</li>
<li>Search the log with <code>grep</code>; never log secrets.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> jab script raat ke 1:30 baje chalti hai tab screen koi nahi dekhta. <b>Log file</b> woh diary hai jo woh peeche chhodti hai: kya hua, kab hua, aur kitna gambhir tha. Standard <code>logging</code> module woh diary kuch lines mein likh deta hai.</p>

<h3>Analogy: jahaz ki logbook</h3>
<p>Har entry mein samay, gambhirta ("routine", "savdhan", "emergency") aur ek vakya hota hai. Captain har routine entry nahi padhta, par problem ke baad kitab poori kahani batati hai. Log <b>levels</b> wahi gambhirta hain.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Debug se error tak log levels aur threshold">
<rect x="10" y="30" width="120" height="50" rx="8" fill="#e2e8f0"/><text x="70" y="51" text-anchor="middle" class="svg-ink" font-size="12">DEBUG</text><text x="70" y="68" text-anchor="middle" class="svg-muted" font-size="10">details</text>
<rect x="150" y="30" width="120" height="50" rx="8" fill="#bae6fd"/><text x="210" y="51" text-anchor="middle" class="svg-ink" font-size="12">INFO</text><text x="210" y="68" text-anchor="middle" class="svg-muted" font-size="10">normal events</text>
<rect x="290" y="30" width="120" height="50" rx="8" fill="#fde68a"/><text x="350" y="51" text-anchor="middle" class="svg-ink" font-size="12">WARNING</text><text x="350" y="68" text-anchor="middle" class="svg-muted" font-size="10">savdhan</text>
<rect x="430" y="30" width="120" height="50" rx="8" fill="#fecaca"/><text x="490" y="51" text-anchor="middle" class="svg-ink" font-size="12">ERROR</text><text x="490" y="68" text-anchor="middle" class="svg-muted" font-size="10">kuch fail hua</text>
<line x1="280" y1="95" x2="280" y2="115" stroke="#ef4444" stroke-width="2"/>
<text x="320" y="130" text-anchor="middle" class="svg-accent" font-size="12">level=WARNING yeh level aur uske daayein sab rakhta hai</text>
</svg><p class="cap">Ooncha threshold set karne par neeche ke levels chhup jaate hain.</p></div>

<h3>Sabse chhota example: dbg2.py</h3>
<pre class="code">import logging
logging.basicConfig(level=logging.DEBUG, format="%(levelname)s %(message)s")
logging.debug("checking %s", "R1")
logging.info("ok")
logging.warning("careful")</pre>
<ul>
<li><code>basicConfig</code> logging ek baar set up karta hai. <code>level=logging.DEBUG</code> ka matlab "DEBUG se upar sab dikhao". <code>format</code> har line ka layout hai: level ka naam, phir message.</li>
<li><code>logging.debug(...)</code>, <code>logging.info(...)</code> aur <code>logging.warning(...)</code> us gambhirta par ek-ek entry likhte hain.</li>
<li><code>"checking %s", "R1"</code>: <code>%s</code> ek khaali jagah hai jo agla argument bharta hai. Text khud jodne ki jagah value alag dena standard tareeka hai.</li>
</ul>
<pre class="out">AUTO01$ python3 dbg2.py
<span class="hl">DEBUG checking R1</span>
<span class="hl">INFO ok</span>
<span class="hl">WARNING careful</span></pre>
<p>File mein <code>DEBUG</code> ko <code>WARNING</code> kar do to sirf aakhri line dikhegi. Wahi ek setting volume ka knob hai.</p>

<h3>Backup tool mein file par logging</h3>
<p><code>netbackup.py</code> mein setup time stamp ke saath file mein likhta hai:</p>
<pre class="code">logging.basicConfig(filename="netbackup.log", level=logging.WARNING,
                    format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger("netbackup")</pre>
<p><code>filename=</code> entries ko screen ki jagah file mein bhejta hai, aur <code>%(asctime)s</code> date aur samay jodta hai. <code>getLogger("netbackup")</code> script ko naam wala logger deta hai. Level <code>WARNING</code> hone par fail hua device record hota hai (script ise error ki tarah log karti hai) par safalta chup rehti hai. R3 down hone par do runs ke baad diary aisi dikhti hai:</p>
<pre class="out">AUTO01$ cat netbackup.log
2026-09-29 09:00:30,000 ERROR HYD-EDGE-R3 (10.99.0.3): NetmikoTimeoutException
2026-09-29 09:00:30,000 ERROR HYD-EDGE-R3 (10.99.0.3): NetmikoTimeoutException</pre>
<p>Har fail hue run ki ek line: date, samay, level, device, address aur wajah. Lab mein har entry ka clock time same dikhta hai, yeh simulator ki khasiyat hai; asli server par har line ka apna second hota hai.</p>

<h3>Verbose switch</h3>
<p>Nightly job ke liye chup rehna sahi hai, par test karte waqt safalta bhi dekhni hoti hai. Lab ise ek edit se theek karta hai: <code>-v</code> type karne par level <code>INFO</code> ho jaata hai, warna <code>WARNING</code>.</p>
<pre class="out">AUTO01$ grep -n basicConfig -A1 netbackup.py
22:logging.basicConfig(filename="netbackup.log", level=logging.WARNING,
AUTO01$ sed -i 's/level=logging.WARNING,/level=logging.INFO if args.verbose else logging.WARNING,/' netbackup.py
AUTO01$ python3 netbackup.py -v
2 saved, 1 failed
AUTO01$ grep INFO netbackup.log
<span class="hl">2026-09-29 09:00:30,000 INFO PUN-CORE-R1 (10.99.0.1): saved 53 lines to backups/2026-09-29/PUN-CORE-R1.cfg</span>
<span class="hl">2026-09-29 09:00:30,000 INFO BLR-EDGE-R2 (10.99.0.2): saved 53 lines to backups/2026-09-29/BLR-EDGE-R2.cfg</span></pre>
<p><code>level=logging.INFO if args.verbose else logging.WARNING</code> angrezi jaisa padhta hai: verbose ho to INFO, warna WARNING. <code>grep INFO</code> diary ko safalta wali entries tak chhaant deta hai. Har ek batati hai kitni lines save hui aur kahan, jo saboot hai ki file khaali nahi.</p>

<div class="eg"><p><b>Worked example.</b> Pichhle Tuesday aapki nightly job ek switch par fail hui. <code>grep ERROR netbackup.log</code> chalao aur device, samay aur wajah dikh jaate hain, kuch dobara chalaye bina.</p></div>

<div class="note"><p><b>Reference code (not run in the simulator).</b> Lambe chalne wale tools ke liye rotating file use karo taaki log hamesha bada na hota rahe: <code>logging.handlers.RotatingFileHandler</code>, ya operating system se rotate karwao. Passwords, tokens ya secrets wali poori configs kabhi log mat karo.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Sab kuch <code>print</code> se karna, jisse cron ka output kho jaata hai. Galat level par log karna (sab ERROR par). Pehle log call ke baad <code>basicConfig</code> chalana, jiska phir koi asar nahi hota. Secrets ko log mein likhna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Level order DEBUG, INFO, WARNING, ERROR, CRITICAL hai. WARNING threshold DEBUG aur INFO ko chhupa deta hai. Koi level set na karo to default WARNING hai.</p></div>

<div class="scn"><h4>Chup nightly job</h4><p>Ek backup job apne results screen par print karti thi, isliye cron mein woh kahin nahi gaye. Router jawab dena band hua to nau din tak kisi ko pata nahi chala. Tool ke file mein log karne aur team ke har subah check karne ke baad wahi fault pehle din dikh gaya.</p><p><b>Lesson:</b> bina nigrani wali scripts ko nishaan chhodna chahiye.</p></div>

<div class="iv"><p class="q">"print ya logging?"</p><p>print program ke normal output ke liye hai jo user ko dikhta hai. logging events ki diary ke liye hai: usme levels, time stamps hote hain, woh file mein ja sakti hai aur code edit kiye bina upar-neeche ki ja sakti hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Levels, neeche se upar: DEBUG, INFO, WARNING, ERROR, CRITICAL.</li>
<li><code>basicConfig(filename=..., level=..., format=...)</code> diary set karta hai.</li>
<li><code>-v</code> switch level ko WARNING se INFO tak neeche la sakta hai.</li>
<li>Log ko <code>grep</code> se search karo; secrets kabhi log mat karo.</li>
</ul></div>
`}};export{e as default};