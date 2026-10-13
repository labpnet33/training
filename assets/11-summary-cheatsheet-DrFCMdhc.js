var e=`<pre class="code"><span class="c"># clean: drop what changes by itself, keep indentation</span>
NOISE = ("Building configuration", "Current configuration")
def clean(text):
    return [ln.rstrip() for ln in text.splitlines()
            if ln.strip() and not ln.startswith("!") and not ln.startswith(NOISE)]

<span class="c"># plan: whole lines in a LIST, never a substring of a joined string</span>
todo = [ln for ln in wanted if ln not in before]

<span class="c"># dry run is the default</span>
ap.add_argument("--apply", action="store_true")
if not args.apply:
    print("dry run - nothing was changed (add --apply to push)"); return

<span class="c"># push, then listen to the router and read the config back</span>
out = conn.send_config_set(todo)               <span class="c"># a line that starts with % is a refusal</span>
after = clean(conn.send_command("show running-config"))
missing = [ln for ln in todo if ln not in after]

<span class="c"># undo: inverse lines, reverse order, then prove it</span>
def inverse(line):
    return line[3:] if line.startswith("no ") else "no " + line
conn.send_config_set([inverse(ln) for ln in reversed(todo)])
status = "rolled_back" if clean(conn.send_command("show running-config")) == before else "ROLLBACK_INCOMPLETE"

<span class="c"># evidence and audit</span>
diff = list(difflib.unified_diff(before, after, "before", "after", lineterm=""))
f.write(json.dumps(entry) + "\\n")             <span class="c"># file opened with "a"</span></pre>`,t=`<pre class="out"><span class="hl">python3 safepush.py R1</span>                                 dry run: plan only
<span class="hl">python3 safepush.py R1 --apply</span>                         backup, push, verify, undo if needed
<span class="hl">python3 safepush.py R2 --baseline baseline-r2.cfg --apply</span>   another baseline file
<span class="hl">python3 pushtool.py plan|push|diff R3</span>                   Lab 2 actions
<span class="hl">grep -n "have" pushtool.py</span>                            find a suspect line, with its number
<span class="hl">sed -i 's/old/new/' pushtool.py</span>                       one-line fix
<span class="hl">tail -1 changes.log</span>                                  the latest audit entry
<span class="hl">cat changes/R1.diff</span>                                   the saved evidence</pre>`,n=(e,t)=>`<table class="cmp"><tr>`+e.map(e=>`<th>`+e+`</th>`).join(``)+`</tr>`+t.map(e=>`<tr>`+e.map(e=>`<td>`+e+`</td>`).join(``)+`</tr>`).join(``)+`</table>`,r={id:`summary-cheatsheet`,h:{en:`Summary, can-do checklist and cheat-sheet`,hi:`Summary, can-do checklist aur cheat-sheet`},body:{en:`
<p><b>The idea of this chapter:</b> pull the module together: what you can now do, the words to know, the facts that interviews and checks keep asking, and one page of code and commands to keep next to your keyboard.</p>

<h3>The module in one paragraph</h3>
<p>A safe push is a pipeline: <b>backup</b> the running config, <b>plan</b> only the lines that are missing, <b>preview</b> as a dry run, <b>push</b> with <code>send_config_set</code>, <b>verify</b> by reading the config back, <b>undo</b> with inverse commands in reverse order if anything is wrong, and write an <b>audit</b> line for every attempt. Each step answers one question, and each has a quiet way to fail, which is why you tested them with planted typos in two labs.</p>

<h3>Can-do checklist</h3>
<ul>
<li>I can explain why a script needs a dry run, a backup, a verification and a rollback.</li>
<li>I can clean a running config of noise and compare lists of whole lines instead of substrings.</li>
<li>I can write <code>difflib.unified_diff</code> code and read <code>---</code>, <code>+++</code>, <code>@@</code>, <code>+</code>, <code>-</code>.</li>
<li>I can make the dry run the default with an <code>--apply</code> switch (<code>store_true</code>).</li>
<li>I can find a rejected command in <code>send_config_set</code> output by its leading <code>%</code>.</li>
<li>I can verify by reading back, and I know why a line can be accepted yet missing (normalisation).</li>
<li>I can build the inverse of a line (including <code>no</code> lines), undo in reverse order and prove the result against the backup.</li>
<li>I can write and read a JSON lines audit log, and I know what the lab tool fails to log.</li>
<li>I can debug a quiet bug from its symptom with <code>grep -n</code>, <code>sed</code> and a planted failing input.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Dry run</dt><dd>A run that reads and plans but changes nothing.</dd>
<dt>Idempotent</dt><dd>Running again leaves the same result; the second run has nothing to do.</dd>
<dt>Baseline</dt><dd>The set of lines every router should have.</dd>
<dt>Plan / todo</dt><dd>The baseline lines missing from the router.</dd>
<dt>Unified diff</dt><dd>Text that shows removed (<code>-</code>) and added (<code>+</code>) lines with context; <code>@@</code> marks a hunk.</dd>
<dt>Noise line</dt><dd>Output that is not configuration and changes by itself, such as the byte count.</dd>
<dt>Normalisation</dt><dd>The router stores or prints a line in its own form (<code>ro</code> becomes <code>RO</code>).</dd>
<dt>Read-back</dt><dd>Reading the config again after a push to check the result.</dd>
<dt>Inverse</dt><dd>The command that undoes another: <code>x</code> and <code>no x</code>.</dd>
<dt><code>rolled_back</code> / <code>ROLLBACK_INCOMPLETE</code></dt><dd>The undo restored the backup / the undo did not; a human must act.</dd>
<dt>JSON lines</dt><dd>One JSON object per line, appended to a file.</dd>
</dl>

<h3>Most-tested facts</h3>
<ul>
<li>Order: backup, plan, preview, push, verify, undo, audit.</li>
<li>The router answers a bad line with a line that starts with <code>%</code>, and keeps going with the next line.</li>
<li><code>x in list</code> compares whole items; <code>x in string</code> compares substrings.</li>
<li><code>unified_diff</code> returns a generator: use <code>list(...)</code> before testing emptiness; pass <code>lineterm=""</code> for lines without newlines.</li>
<li><code>store_true</code> switches default to <code>False</code>; <code>--apply</code> becomes <code>args.apply</code>.</li>
<li>The inverse of <code>no x</code> is <code>x</code>; <code>no no x</code> is invalid.</li>
<li>Undo in reverse order and compare the whole config with the backup.</li>
<li>Append mode <code>"a"</code> keeps history; <code>"w"</code> erases it.</li>
</ul>

<h3>Lab recap</h3>
`+n([`Lab`,`What you found`],[[`Lab 1 (safepush.py)`,`The sample diff has 3 added lines; R1 needed 5 of 6; the real push removed <code>no service password-encryption</code> from the config view; R2 rejected <code>snmp-server communty NKRO RO</code>; the log status was <code>rolled_back</code>.`],[`Lab 2 (pushtool.py)`,`Plan listed 2 of 3 (substring); diff said "no differences" (same list twice); a push was "verified" with 2 real lines (wrong list); the rollback ended <code>ROLLBACK_INCOMPLETE</code> (the <code>no no</code> trap).`]])+`

<h3>Cheat-sheet: the code</h3>
`+e+`
<h3>Cheat-sheet: the commands</h3>
`+t+`

<h3>What comes next</h3>
<p>The module <b>py-templates</b> builds the configuration text from Jinja2 templates, one template for every device; the lines it produces travel through exactly the pipeline you built here. <b>py-tools</b> turns a script into a tool with <code>argparse</code>, <code>logging</code>, error handling and cron, and <b>auto-testing</b> checks behaviour (not only configuration) before and after a change.</p>

<div class="warn"><p><b>Common mistakes to avoid.</b> A real push as the default. A backup written after the change or overwritten on every run. A verification that tests the wrong list. A rollback that was never exercised with a failing input.</p></div>
<div class="exam"><p><b>Exam trap.</b> The plan can be perfect and the change can still fail; only the router's answer and the read-back tell you. Preview, verify and rollback answer three different questions.</p></div>

<div class="scn"><h4>The rehearsal that paid for itself</h4><p>Before a quarterly baseline update, a team ran the tool on a lab router with a planted typo. The first rehearsal showed <code>ROLLBACK_INCOMPLETE</code>: their inverse function had the <code>no no</code> bug. They fixed it, repeated the rehearsal, and the production window was a quiet 25 minutes.</p><p><b>Lesson:</b> practise the failure path, because that is the path you cannot afford to find at 2 a.m.</p></div>

<div class="iv"><p class="q">"Walk me through how you would automate a baseline change on 50 routers safely."</p><p>Dry run on one router first, with the plan reviewed by a colleague. Then apply to that router: backup, push only the missing lines, check the router's answers, read the config back, save the diff, and roll back and compare with the backup if anything fails. Every attempt, success or not, goes to a JSON lines audit log. Only after one clean run do I loop over the rest, and I stop the loop at the first failure.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Seven parts: backup, plan, preview, push, verify, undo and audit.</li>
<li>Compare whole lines of cleaned output; trust a router only after a read-back.</li>
<li>Make the safe choice the default and test the failure paths on purpose.</li>
<li>The lab tool has real gaps (overwritten backup, unlogged unreachable routers); a good engineer lists them.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> module ko samet lo: ab aap kya kar sakte ho, jaanne wale shabd, woh facts jo interviews aur checks baar-baar puchte hain, aur code aur commands ka ek page jo keyboard ke paas rakhna hai.</p>

<h3>Ek paragraph mein module</h3>
<p>Safe push ek pipeline hai: running config ka <b>backup</b>, sirf missing lines ka <b>plan</b>, dry run ke roop mein <b>preview</b>, <code>send_config_set</code> se <b>push</b>, config wapas padhkar <b>verify</b>, kuch galat ho to ulte order mein inverse commands se <b>undo</b>, aur har attempt ke liye <b>audit</b> line. Har step ek sawaal ka jawab deta hai, aur har ek ke fail hone ka ek chhupa tareeka hai, isliye aapne do labs mein unhe planted typos se test kiya.</p>

<h3>Can-do checklist</h3>
<ul>
<li>Main samjha sakta hoon ki script ko dry run, backup, verification aur rollback kyon chahiye.</li>
<li>Main running config ka noise saaf kar sakta hoon aur substrings ki jagah poori lines ki lists compare kar sakta hoon.</li>
<li>Main <code>difflib.unified_diff</code> code likh sakta hoon aur <code>---</code>, <code>+++</code>, <code>@@</code>, <code>+</code>, <code>-</code> padh sakta hoon.</li>
<li>Main <code>--apply</code> switch (<code>store_true</code>) se dry run ko default bana sakta hoon.</li>
<li>Main <code>send_config_set</code> output mein rejected command ko shuru ke <code>%</code> se dhoondh sakta hoon.</li>
<li>Main read-back se verify kar sakta hoon, aur jaanta hoon ki line accept hokar bhi missing kyon ho sakti hai (normalisation).</li>
<li>Main line ka inverse bana sakta hoon (<code>no</code> lines samet), ulte order mein undo kar sakta hoon aur result ko backup se saabit kar sakta hoon.</li>
<li>Main JSON lines audit log likh aur padh sakta hoon, aur jaanta hoon ki lab tool kya log nahi karta.</li>
<li>Main chhupe bug ko symptom se <code>grep -n</code>, <code>sed</code> aur planted failing input se debug kar sakta hoon.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Dry run</dt><dd>Aisa run jo padhta aur plan karta hai par kuch nahi badalta.</dd>
<dt>Idempotent</dt><dd>Dobara chalane par wahi result rehta hai; doosre run ko kuch karna nahi hota.</dd>
<dt>Baseline</dt><dd>Woh lines jo har router par honi chahiye.</dd>
<dt>Plan / todo</dt><dd>Router se missing baseline lines.</dd>
<dt>Unified diff</dt><dd>Aisa text jo context ke saath hataayi (<code>-</code>) aur jodi (<code>+</code>) lines dikhata hai; <code>@@</code> hunk ka nishaan hai.</dd>
<dt>Noise line</dt><dd>Woh output jo configuration nahi hai aur apne aap badalta hai, jaise byte count.</dd>
<dt>Normalisation</dt><dd>Router line ko apne form mein store ya print karta hai (<code>ro</code> <code>RO</code> ban jaata hai).</dd>
<dt>Read-back</dt><dd>Push ke baad result check karne ke liye config dobara padhna.</dd>
<dt>Inverse</dt><dd>Doosre command ko undo karne wala command: <code>x</code> aur <code>no x</code>.</dd>
<dt><code>rolled_back</code> / <code>ROLLBACK_INCOMPLETE</code></dt><dd>Undo ne backup restore kiya / nahi kiya; insaan ko action lena hai.</dd>
<dt>JSON lines</dt><dd>Ek line par ek JSON object, file mein append hua.</dd>
</dl>

<h3>Sabse zyada puche jaane wale facts</h3>
<ul>
<li>Order: backup, plan, preview, push, verify, undo, audit.</li>
<li>Router bad line ka jawab <code>%</code> se shuru hone wali line se deta hai, aur agli line par chalta rehta hai.</li>
<li><code>x in list</code> poore items compare karta hai; <code>x in string</code> substrings compare karta hai.</li>
<li><code>unified_diff</code> generator return karta hai: khaali test karne se pehle <code>list(...)</code> karo; newline ke bina lines ke liye <code>lineterm=""</code> do.</li>
<li><code>store_true</code> switches ka default <code>False</code> hai; <code>--apply</code> <code>args.apply</code> ban jaata hai.</li>
<li><code>no x</code> ka inverse <code>x</code> hai; <code>no no x</code> invalid hai.</li>
<li>Ulte order mein undo karo aur poori config ko backup se compare karo.</li>
<li>Append mode <code>"a"</code> history rakhta hai; <code>"w"</code> use mita deta hai.</li>
</ul>

<h3>Lab recap</h3>
`+n([`Lab`,`Aapne kya dhoondha`],[[`Lab 1 (safepush.py)`,`Sample diff mein 3 added lines; R1 ko 6 mein se 5 chahiye thi; asli push ne config view se <code>no service password-encryption</code> hata di; R2 ne <code>snmp-server communty NKRO RO</code> reject ki; log status <code>rolled_back</code> tha.`],[`Lab 2 (pushtool.py)`,`Plan ne 3 mein se 2 list kiye (substring); diff ne "no differences" kaha (same list do baar); push 2 asli lines ke saath "verified" hua (galat list); rollback <code>ROLLBACK_INCOMPLETE</code> par khatam hua (<code>no no</code> jaal).`]])+`

<h3>Cheat-sheet: code</h3>
`+e+`
<h3>Cheat-sheet: commands</h3>
`+t+`

<h3>Aage kya aata hai</h3>
<p>Module <b>py-templates</b> Jinja2 templates se configuration text banata hai, har device ke liye ek template; jo lines woh banata hai woh bilkul isi pipeline se guzarti hain jo aapne yahan banayi. <b>py-tools</b> script ko <code>argparse</code>, <code>logging</code>, error handling aur cron wale tool mein badalta hai, aur <b>auto-testing</b> change se pehle aur baad behaviour (sirf configuration nahi) check karta hai.</p>

<div class="warn"><p><b>Bachne wali common mistakes.</b> Asli push ko default rakhna. Backup change ke baad likhna ya har run par overwrite karna. Galat list test karne wali verification. Aisa rollback jise kabhi failing input se chalaya hi nahi.</p></div>
<div class="exam"><p><b>Exam trap.</b> Plan perfect ho sakta hai aur change phir bhi fail ho sakta hai; sirf router ka jawab aur read-back batate hain. Preview, verify aur rollback teen alag sawaalon ke jawab hain.</p></div>

<div class="scn"><h4>Rehearsal jo apni keemat nikaal gayi</h4><p>Quarterly baseline update se pehle ek team ne lab router par planted typo ke saath tool chalaya. Pehli rehearsal ne <code>ROLLBACK_INCOMPLETE</code> dikhaya: unke inverse function mein <code>no no</code> bug tha. Unhone theek kiya, rehearsal dohrayi, aur production window shaant 25 minute ki rahi.</p><p><b>Lesson:</b> failure path ki practice karo, kyunki wahi raasta hai jo raat 2 baje dhoondhna affordable nahi.</p></div>

<div class="iv"><p class="q">"50 routers par baseline change ko safely automate kaise karoge, samjhao."</p><p>Pehle ek router par dry run, plan colleague se review karwakar. Phir usi router par apply: backup, sirf missing lines push, router ke jawab check, config wapas padhna, diff save karna, aur kuch fail ho to roll back karke backup se compare karna. Har attempt, safal ho ya nahi, JSON lines audit log mein jaata hai. Ek saaf run ke baad hi baaki par loop chalata hoon, aur loop ko pehle failure par rok deta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Saat hisse: backup, plan, preview, push, verify, undo aur audit.</li>
<li>Cleaned output ki poori lines compare karo; router par bharosa read-back ke baad hi.</li>
<li>Safe choice ko default banao aur failure paths ko jaanbujhkar test karo.</li>
<li>Lab tool mein asli kamiyan hain (overwrite hota backup, unlogged unreachable routers); achha engineer unhe list karta hai.</li>
</ul></div>
`}};export{r as default};