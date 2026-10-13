var e=(e,t,n,r,i,a)=>`<text x="`+e+`" y="`+t+`" text-anchor="`+(a||`start`)+`" class="`+(r||`svg-ink`)+`" font-size="`+(i||12)+`">`+n+`</text>`,t=(t,n,r)=>`<rect x="10" y="`+t+`" width="400" height="30" rx="6" fill="`+n+`"/>`+e(18,t+19,r,`svg-ink`,11),n=(n,r)=>`<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="changes.log holds one JSON object per line">`+e(10,16,`changes.log`,`svg-muted`,12)+t(26,`#bbf7d0`,`{"host": "R1", "status": "ok", "lines": 5}`)+t(62,`#fde68a`,`{"host": "R2", "status": "rolled_back", "lines": 4}`)+t(98,`#bbf7d0`,`{"host": "R2", "status": "ok", "lines": 4}`)+t(134,`#fecaca`,`{"host": "R3", "status": "ROLLBACK_INCOMPLETE", ...}`)+e(425,46,n[0],`svg-muted`,12)+e(425,82,n[1],`svg-muted`,12)+e(425,118,n[2],`svg-muted`,12)+e(425,154,n[3],`svg-muted`,12)+`</svg><p class="cap">`+r+`</p></div>`,r=`<pre class="code">def audit(host, status, added):
    entry = {"time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"), "host": host, "status": status, "lines": added}
    with open("changes.log", "a") as f:
        f.write(json.dumps(entry) + "\\n")</pre>`,i=`<pre class="out"><span class="hl">AUTO01$ cat changes.log</span>
{"time": "2026-09-29 09:00:12", "host": "R1", "status": "ok", "lines": 5}
<span class="hl">{"time": "2026-09-29 09:00:15", "host": "R2", "status": "rolled_back", "lines": 4}</span>
{"time": "2026-09-29 09:00:21", "host": "R2", "status": "ok", "lines": 4}</pre>`,a=`<pre class="code">import json
from collections import Counter

counts = Counter()
with open("changes.log") as f:
    for line in f:
        entry = json.loads(line)
        counts[entry["status"]] += 1
        if entry["status"] != "ok":
            print("ATTENTION", entry["time"], entry["host"], entry["status"])
print(dict(counts))</pre>`,o=`<pre class="out"><span class="hl">AUTO01$ python3 auditsum.py</span>
<span class="hl">ATTENTION 2026-09-29 09:00:15 R2 rolled_back</span>
{'ok': 2, 'rolled_back': 1}
<span class="hl">AUTO01$ grep -c ROLLBACK_INCOMPLETE changes.log</span>
0</pre>`,s=`<pre class="out"><span class="hl">AUTO01$ python3 safepush.py R3 --apply 2&gt;&amp;1 | tail -3</span>
Device settings: nk_ios 10.99.0.3:22
(connection timed out)
</pre>`,c=`<pre class="code">    try:
        conn = ConnectHandler(device_type="nk_ios", host=lookup(args.host), username="netops", password="NK@2026")
    except Exception as exc:
        audit(args.host, "unreachable", 0)
        raise SystemExit(f"{args.host}: cannot connect ({type(exc).__name__})")</pre>`,l=`<pre class="out"><span class="hl">AUTO01$ python3 safepush2.py R3 --apply; echo "rc=$?"</span>
R3: cannot connect (NetmikoTimeoutException)
rc=1
<span class="hl">AUTO01$ cat changes.log</span>
{"time": "2026-09-29 09:00:03", "host": "R3", "status": "unreachable", "lines": 0}</pre>`,u={id:`audit-log`,h:{en:`The audit log: one JSON line for every attempt`,hi:`Audit log: har attempt ki ek JSON line`},body:{en:`
<p><b>The idea of this chapter:</b> after the change window somebody will ask, "what did the tool do, to which router, and did it work?". The audit log answers from evidence instead of memory. The rule is simple: write one line for every attempt, and that includes the attempts that failed.</p>

<h3>Analogy: the flight recorder</h3>
<p>An aircraft's recorder keeps running during a perfect flight and during a crash. Nobody builds a recorder that only switches on when things go well, because the data you need most is from the bad flights. An audit log that only records successes is a recorder that stops before the problem.</p>

<h3>JSON lines: one object per line</h3>
<p>You met JSON in <b>auto-formats</b>. The tool writes it in the <b>JSON lines</b> style: each entry is a complete JSON object on its own line, and the file grows by appending. The function is short:</p>
`+r+`
<ul>
<li><code>datetime.now().strftime(...)</code> turns the current time into text such as <code>2026-09-29 09:00:12</code>.</li>
<li>The dictionary holds four facts: when, which router, the outcome (<code>status</code>) and how many lines were part of the change.</li>
<li><code>open("changes.log", "a")</code> opens in <b>append</b> mode. Earlier entries are never rewritten.</li>
<li><code>json.dumps(entry)</code> turns the dictionary into one line of text; <code>+ "\\n"</code> ends the line.</li>
</ul>
<p>Why not one big JSON list in a file? To add an entry you would read the whole file, change the list and write it all back. If the script crashes in the middle, the file is broken and you lose the history. With one object per line, each entry is independent. A crash can damage at most the last line, <code>grep</code> works on the file, and every line can be read back with <code>json.loads</code>.</p>

<h3>Lab 1, task 6: read the log</h3>
<p>Every run that tried to change a router appended a line. After the R1 push, the R2 rollback and the repeat on R2 you have three lines:</p>
`+i+`
<p>The status of the failed push on R2 is <code>rolled_back</code>. The log tells the story in order: R1 fine, R2 failed and was restored, R2 retried and fine. It never records the text of the configuration, only counts. That is deliberate: a log that copies configuration can copy secrets too (the module <b>py-secrets</b> returns to this).</p>
`+n([`normal change`,`failed, restored: fix the cause`,`the retry succeeded`,`page a human at once`],`One line per attempt. The status words are what dashboards and people filter on.`)+`

<h3>Reading the log back</h3>
<p>Because every line is a JSON object, a few lines of Python summarise it. Write <code>auditsum.py</code>:</p>
`+a+`
`+o+`
<p>The script prints an <code>ATTENTION</code> line for every status that is not <code>ok</code>, then a count per status. A scheduled version of this script, or a plain <code>grep -c ROLLBACK_INCOMPLETE changes.log</code> that returns something other than 0, can be the alarm for the most serious state. Fixed status words matter here: <code>ok</code>, <code>rolled_back</code> and <code>ROLLBACK_INCOMPLETE</code> are values a machine can match, not sentences for humans.</p>

<h3>What the lab tool does not log</h3>
<p>Be honest about gaps. The tool writes the audit line only after a push attempt. It writes nothing for a dry run, nothing for <code>nothing to do</code>, and nothing when it cannot reach the router. If a router in <code>devices.csv</code> is switched off, the tool crashes with a traceback before the audit step, no backup is made and no log line exists:</p>
`+s+`
<p>The traceback ends with <code>NetmikoTimeoutException</code> (TCP connection to device failed). Nobody reading <code>changes.log</code> would know that this router was missed. A fuller tool catches the exception and records it. This is reference code for your own version, tested in the lab interpreter against a switched-off router:</p>
`+c+`
`+l+`
<p>Now the router that was missed leaves a trace, <code>unreachable</code>, and a summary can list the routers that still need the change. Other useful fields to add later are the user who ran the tool and the baseline file name.</p>

<div class="warn"><p><b>Common mistakes.</b> Logging only successes. Opening the file with <code>"w"</code> instead of <code>"a"</code>, which erases history on every run. Writing the log inside the repository without thinking, or writing passwords or full configurations into it. Free-text statuses such as "it kind of worked".</p></div>
<div class="exam"><p><b>Exam trap.</b> Append mode <code>"a"</code> adds to the end of the file; write mode <code>"w"</code> truncates it. JSON lines means one JSON object per line, not one JSON array for the whole file.</p></div>

<div class="scn"><h4>"We never touched that router"</h4><p>After an outage, a manager asked whether the automation had changed the branch router in Pune the night before. The log had one line for that router: <code>rolled_back</code> at 02:14 with 4 lines. The team could show that the change was undone within the same minute, and that the outage began two hours later from a different cause.</p><p><b>Lesson:</b> a log that includes failures lets you prove what you did not break.</p></div>

<div class="iv"><p class="q">"What goes into an audit log for automated changes, and why JSON lines?"</p><p>Time, device, outcome and the size of the change, plus ideally who ran it. I log failed and rolled-back attempts too, because those are what a post-mortem needs. I use JSON lines: append-only, one independent object per line, easy to <code>grep</code> and to parse with <code>json.loads</code>, and a crash cannot corrupt earlier entries. I keep secrets and full configs out of the log.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>One JSON object per line, appended with mode <code>"a"</code>: JSON lines.</li>
<li>Log every attempt, including <code>rolled_back</code> and <code>ROLLBACK_INCOMPLETE</code>; fixed status words are machine-readable.</li>
<li>Read the log with <code>json.loads</code> per line, or <code>grep</code> for the alarm status.</li>
<li>Gaps in the lab tool: no entry for dry runs or unreachable routers; add them in your own version.</li>
<li>Never write passwords or full configurations into the log.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> change window ke baad koi puchega, "tool ne kya kiya, kis router par, aur kaam hua ya nahi?". Audit log yaaddasht ki jagah saboot se jawab deta hai. Niyam saral hai: har attempt ki ek line likho, aur usme woh attempts bhi shamil hain jo fail hue.</p>

<h3>Analogy: flight recorder</h3>
<p>Jahaaz ka recorder perfect flight mein bhi chalta hai aur crash mein bhi. Koi aisa recorder nahi banata jo sirf achhe waqt on ho, kyunki sabse zyada zaroorat kharab flights ke data ki hoti hai. Jo audit log sirf successes record karta hai woh aisa recorder hai jo problem se pehle band ho jaata hai.</p>

<h3>JSON lines: ek line, ek object</h3>
<p>JSON aap <b>auto-formats</b> mein mil chuke ho. Tool use <b>JSON lines</b> style mein likhta hai: har entry apni line par poora JSON object hai, aur file append karke badhti hai. Function chhota hai:</p>
`+r+`
<ul>
<li><code>datetime.now().strftime(...)</code> abhi ke time ko <code>2026-09-29 09:00:12</code> jaise text mein badalta hai.</li>
<li>Dictionary mein chaar facts hain: kab, kaun sa router, nateeja (<code>status</code>) aur change mein kitni lines thi.</li>
<li><code>open("changes.log", "a")</code> <b>append</b> mode mein kholta hai. Purani entries kabhi dobara nahi likhi jaati.</li>
<li><code>json.dumps(entry)</code> dictionary ko text ki ek line banata hai; <code>+ "\\n"</code> line khatam karta hai.</li>
</ul>
<p>Ek badi JSON list file mein kyon nahi? Entry jodne ke liye aapko poori file padhni, list badalni aur sab wapas likhna padta. Script beech mein crash ho to file toot jaati hai aur history chali jaati hai. Ek line, ek object mein har entry swatantra hai. Crash zyada se zyada aakhri line bigaad sakta hai, file par <code>grep</code> chalta hai, aur har line <code>json.loads</code> se wapas padhi ja sakti hai.</p>

<h3>Lab 1, task 6: log padho</h3>
<p>Jis bhi run ne router badalne ki koshish ki usne ek line append ki. R1 push, R2 rollback aur R2 repeat ke baad teen lines hain:</p>
`+i+`
<p>R2 ke failed push ka status <code>rolled_back</code> hai. Log kahani order mein sunata hai: R1 theek, R2 fail hua aur restore hua, R2 retry hua aur theek. Yeh kabhi configuration ka text record nahi karta, sirf ginti. Yeh jaanbujhkar hai: jo log configuration copy karta hai woh secrets bhi copy kar sakta hai (<b>py-secrets</b> iske baare mein aage baat karta hai).</p>
`+n([`normal change`,`fail, restore: wajah theek karo`,`retry safal raha`,`turant insaan ko page karo`],`Har attempt ki ek line. Status ke shabd wahi hain jin par dashboards aur log filter karte hain.`)+`

<h3>Log wapas padhna</h3>
<p>Kyunki har line JSON object hai, Python ki kuch lines use summarise kar deti hain. <code>auditsum.py</code> likho:</p>
`+a+`
`+o+`
<p>Script har us status ke liye <code>ATTENTION</code> line print karti hai jo <code>ok</code> nahi hai, phir har status ki ginti. Is script ka scheduled version, ya seedha <code>grep -c ROLLBACK_INCOMPLETE changes.log</code> jo 0 ke alawa kuch de, sabse gambhir haalat ka alarm ban sakta hai. Yahan fixed status shabd matter karte hain: <code>ok</code>, <code>rolled_back</code> aur <code>ROLLBACK_INCOMPLETE</code> aise values hain jinhe machine match kar sakti hai, insaan ke liye vakya nahi.</p>

<h3>Lab tool kya log nahi karta</h3>
<p>Kamiyon ke baare mein imaandar raho. Tool audit line sirf push attempt ke baad likhta hai. Dry run ke liye kuch nahi, <code>nothing to do</code> ke liye kuch nahi, aur router tak pahunch na paaye tab bhi kuch nahi. <code>devices.csv</code> ka koi router band ho to tool audit step se pehle traceback ke saath crash hota hai, backup nahi banta aur log line nahi hoti:</p>
`+s+`
<p>Traceback <code>NetmikoTimeoutException</code> (TCP connection to device failed) par khatam hota hai. <code>changes.log</code> padhne wale ko pata hi nahi chalega ki yeh router chhoot gaya. Poora tool exception pakadkar record karta hai. Yeh aapke apne version ke liye reference code hai, band router ke saamne lab interpreter mein test kiya hua:</p>
`+c+`
`+l+`
<p>Ab jo router chhoota usne nishaan chhoda, <code>unreachable</code>, aur summary un routers ki list de sakta hai jinhe abhi change chahiye. Baad mein jodne layak fields hain: tool chalane wala user aur baseline file ka naam.</p>

<div class="warn"><p><b>Common mistakes.</b> Sirf successes log karna. File ko <code>"a"</code> ki jagah <code>"w"</code> se kholna, jo har run par history mita deta hai. Log ko repository ke andar bina soche likhna, ya passwords ya poori configurations log mein likhna. "kuch-kuch chala" jaise free-text status.</p></div>
<div class="exam"><p><b>Exam trap.</b> Append mode <code>"a"</code> file ke ant mein jodta hai; write mode <code>"w"</code> use khaali kar deta hai. JSON lines matlab ek line par ek JSON object, poori file ke liye ek JSON array nahi.</p></div>

<div class="scn"><h4>"Humne us router ko chhua hi nahi"</h4><p>Outage ke baad manager ne puchha ki kya automation ne kal raat Pune ke branch router ko badla tha. Us router ke liye log mein ek line thi: 02:14 par <code>rolled_back</code>, 4 lines. Team dikha sakti thi ki change usi minute mein undo ho gaya, aur outage do ghante baad kisi aur wajah se shuru hua.</p><p><b>Lesson:</b> failures wala log saabit karne deta hai ki aapne kya nahi bigaada.</p></div>

<div class="iv"><p class="q">"Automated changes ke audit log mein kya jaata hai, aur JSON lines kyon?"</p><p>Time, device, outcome aur change ka size, aur behtar ho to kisne chalaya. Main failed aur rolled-back attempts bhi log karta hoon, kyunki post-mortem ko wahi chahiye. Main JSON lines use karta hoon: append-only, ek line ek swatantra object, <code>grep</code> aur <code>json.loads</code> se padhna aasaan, aur crash purani entries ko kharab nahi kar sakta. Secrets aur poori configs log se bahar rakhta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ek line par ek JSON object, mode <code>"a"</code> se append: JSON lines.</li>
<li>Har attempt log karo, <code>rolled_back</code> aur <code>ROLLBACK_INCOMPLETE</code> samet; fixed status shabd machine-readable hain.</li>
<li>Log ko har line par <code>json.loads</code> se padho, ya alarm status ke liye <code>grep</code> karo.</li>
<li>Lab tool ki kamiyan: dry run ya unreachable routers ke liye entry nahi; apne version mein jodo.</li>
<li>Passwords ya poori configurations kabhi log mein mat likho.</li>
</ul></div>
`}};export{u as default};