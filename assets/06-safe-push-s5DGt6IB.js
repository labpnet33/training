var e={id:`safe-push`,h:{en:`Pushing safely: dry run, verify and roll back`,hi:`Safely push karna: dry run, verify aur roll back`},body:{en:`
<p><b>The idea of this chapter:</b> backup and drift only <i>read</i>. Push is the one action that <i>changes</i> the network, so it is the one that can cause an outage. You learned the safe-change pattern in <code>py-safepush</code>. In the toolkit it becomes a small module, <code>push.py</code>, with the same four promises: show the plan first, change only what is missing, check the result, and undo on failure.</p>

<h3>Analogy: the tailor's pins</h3>
<p>A good tailor does not cut cloth first. She pins the garment (a <b>dry run</b>), sews only where the cloth does not yet fit (a <b>plan</b>), tries it on (a <b>verify</b>), and unpicks the stitches if it is wrong (a <b>roll back</b>). Pins are cheap; a cut is not.</p>

<h3>push.py</h3>
<pre class="code">"""push.py - preview or push a baseline to one router, verify it and roll back on failure."""
from toolkit.collect import clean, connect


def inverse(line):
    return line[3:] if line.startswith("no ") else "no " + line


def plan(running, wanted):
    return [ln for ln in wanted if ln not in running]


def push(ip, wanted, apply=False):
    """Returns (todo, status): 'nothing to do', 'dry-run', 'ok' or 'rolled_back'."""
    conn = connect(ip)
    try:
        before = clean(conn.send_command("show running-config"))
        todo = plan(before, wanted)
        if not todo:
            return todo, "nothing to do"
        if not apply:
            return todo, "dry-run"
        out = conn.send_config_set(todo)
        after = clean(conn.send_command("show running-config"))
        if "%" in out or any(ln not in after for ln in todo):
            conn.send_config_set([inverse(ln) for ln in reversed(todo)])
            return todo, "rolled_back"
        return todo, "ok"
    finally:
        conn.disconnect()</pre>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Read config, plan the missing lines; nothing to do, or dry run, or apply then verify; ok or roll back">
<rect x="10" y="50" width="100" height="50" rx="8" fill="#bae6fd"/><text x="60" y="72" text-anchor="middle" class="svg-ink" font-size="12">1 read</text><text x="60" y="89" text-anchor="middle" class="svg-muted" font-size="10">running config</text>
<rect x="140" y="50" width="100" height="50" rx="8" fill="#fde68a"/><text x="190" y="72" text-anchor="middle" class="svg-ink" font-size="12">2 plan</text><text x="190" y="89" text-anchor="middle" class="svg-muted" font-size="10">missing lines</text>
<rect x="270" y="10" width="140" height="44" rx="8" fill="#e2e8f0"/><text x="340" y="30" text-anchor="middle" class="svg-ink" font-size="11">nothing to do / dry-run</text><text x="340" y="45" text-anchor="middle" class="svg-muted" font-size="10">stop here</text>
<rect x="270" y="96" width="100" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="116" text-anchor="middle" class="svg-ink" font-size="12">3 apply</text><text x="320" y="131" text-anchor="middle" class="svg-muted" font-size="10">--apply only</text>
<rect x="400" y="96" width="100" height="44" rx="8" fill="#fed7aa"/><text x="450" y="116" text-anchor="middle" class="svg-ink" font-size="12">4 verify</text><text x="450" y="131" text-anchor="middle" class="svg-muted" font-size="10">read again</text>
<rect x="530" y="60" width="100" height="32" rx="8" fill="#bbf7d0"/><text x="580" y="81" text-anchor="middle" class="svg-ink" font-size="12">ok</text>
<rect x="530" y="108" width="100" height="32" rx="8" fill="#fecaca"/><text x="580" y="129" text-anchor="middle" class="svg-ink" font-size="12">rolled_back</text>
<line x1="110" y1="75" x2="140" y2="75" stroke="#64748b" stroke-width="2"/><line x1="240" y1="65" x2="270" y2="40" stroke="#64748b" stroke-width="2"/><line x1="240" y1="85" x2="270" y2="115" stroke="#64748b" stroke-width="2"/><line x1="370" y1="118" x2="400" y2="118" stroke="#64748b" stroke-width="2"/><line x1="500" y1="108" x2="530" y2="80" stroke="#64748b" stroke-width="2"/><line x1="500" y1="124" x2="530" y2="124" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Only the right-hand path touches the router.</p></div>

<h3>Reading the code</h3>
<ul>
<li><b>push.py imports from collect.py</b> (<code>clean</code>, <code>connect</code>). Dependencies point one way: push knows collect, collect never knows push.</li>
<li><code>plan()</code> keeps only wanted lines that are <i>not already</i> in the running config. A second push finds nothing missing, so the push is <b>idempotent</b>.</li>
<li><code>inverse()</code> turns <code>ntp server X</code> into <code>no ntp server X</code> and the other way round. The roll back sends the inverses in <i>reverse</i> order.</li>
<li>Failure has two signs: a <code>%</code> in the router's reply (IOS error messages start with it), or a wanted line that is missing when the config is read again.</li>
<li>Return values: <code>nothing to do</code>, <code>dry-run</code>, <code>ok</code>, <code>rolled_back</code>. The front desk prints them.</li>
</ul>
<pre class="code">def cmd_push(args):
    name, path = args.args
    ip = dict(devices())[name]
    wanted = [ln.strip() for ln in open(path) if ln.strip()]
    todo, state = push.push(ip, wanted, apply=args.apply)
    print(f"{name}: {len(todo)} lines to add, {state}")
    for ln in todo:
        print("  +", ln)</pre>
<p><code>dict(devices())</code> turns the list of <code>(name, ip)</code> pairs into a lookup table. The baseline file has one command per line. Without <code>--apply</code> the tool can only preview.</p>

<h3>Runs on R2</h3>
<pre class="out">AUTO01$ cat extra.cfg
ntp server 10.99.0.50
logging host 10.99.0.51
AUTO01$ python3 nettool.py push R2 extra.cfg
<span class="hl">R2: 2 lines to add, dry-run</span>
  + ntp server 10.99.0.50
  + logging host 10.99.0.51
AUTO01$ python3 nettool.py push R2 extra.cfg --apply
<span class="hl">R2: 2 lines to add, ok</span>
  + ntp server 10.99.0.50
  + logging host 10.99.0.51
AUTO01$ python3 nettool.py push R2 extra.cfg --apply
<span class="hl">R2: 0 lines to add, nothing to do</span></pre>
<p>Run 1 previews, run 2 changes the router and verifies it, run 3 proves the push is safe to repeat. Now a baseline that contains a line the router rejects (tested on a fresh R2, before the ntp lines were pushed):</p>
<pre class="out">AUTO01$ printf 'ntp server 10.99.0.50\\nbogus command here\\n' &gt; mixed.cfg
AUTO01$ python3 nettool.py push R2 mixed.cfg --apply
<span class="hl">R2: 2 lines to add, rolled_back</span>
  + ntp server 10.99.0.50
  + bogus command here</pre>
<p>The router answered the bad line with a <code>%</code> error, so the tool sent the inverse commands in reverse order. The good <code>ntp</code> line was removed again as well: a baseline is <b>all or nothing</b>. A fresh backup of R2 is then identical to golden, which means the roll back left no trace.</p>
<pre class="out">AUTO01$ python3 nettool.py push R9 extra.cfg
Traceback (most recent call last):
  File "nettool.py", line 125, in &lt;module&gt;
    main()
  File "nettool.py", line 122, in main
    ACTIONS[args.action](args)
  File "nettool.py", line 92, in cmd_push
    ip = dict(devices())[name]
<span class="hl">KeyError: 'R9'</span></pre>
<p>An unknown router name is a <code>KeyError</code> from the lookup. It stops before any router is touched, which is safe, but a friendlier tool would print "R9 is not in the inventory".</p>

<div class="eg"><p><b>Worked example.</b> After the successful push on R2, tonight's backup contains two new lines, so <code>drift</code> reports <code>R2: DRIFT (2 lines)</code>. That is correct and useful: the change was approved, so the engineer runs <code>backup</code> and <code>golden</code>, and the drift disappears. Push and drift work together: push makes the change, drift proves it, golden records it.</p></div>

<div class="note"><p><b>Reference code.</b> <code>inverse()</code> works for simple lines such as <code>ntp server</code> or <code>logging host</code>. A line that <i>replaces</i> a value, such as an <code>ip address</code>, cannot be undone by adding <code>no</code>; for those a real tool restores the saved backup (py-safepush). Pushing to many routers should go one router at a time, or in small batches, never everywhere at once.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Making <code>--apply</code> the default. Skipping the verify step. Pushing to the whole estate in one go. Assuming the roll back cannot fail: always read the final state. Putting passwords in a baseline file.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Idempotent" means running the same push twice leaves the same result as running it once. The proof is the third run above: <code>nothing to do</code>.</p></div>

<div class="scn"><h4>The Friday typo</h4><p>An engineer pushed a logging baseline to a branch router with <code>loging host</code> spelled wrongly. The router replied with a <code>%</code> invalid-input message, the tool undid the lines it had already sent, and the branch never noticed. On Monday the engineer fixed the file and the dry run showed a clean plan.</p><p><b>Lesson:</b> preview first, verify after, and let the tool undo what it cannot confirm.</p></div>

<div class="iv"><p class="q">"How do you make an automated configuration push safe?"</p><p>I make the tool a dry run by default, compute only the missing lines, apply to one device, read the config back to verify, and roll back automatically if the device printed an error or a line is missing. I also take a backup first and keep the push idempotent.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Push is the only action that changes the network, so it needs a safety net.</li>
<li><code>plan()</code> sends only missing lines, which makes the push idempotent.</li>
<li>Verify by reading the config back; a <code>%</code> in the reply or a missing line means failure.</li>
<li><code>inverse()</code> in reverse order undoes simple additions.</li>
<li>After an approved push, drift shows the change until you run backup and golden.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> backup aur drift sirf <i>padhte</i> hain. Push akela action hai jo network ko <i>badalta</i> hai, isliye outage wahi kar sakta hai. Safe-change pattern aapne <code>py-safepush</code> mein seekha. Toolkit mein yeh ek chhota module, <code>push.py</code>, ban jata hai, wahi chaar waade ke saath: pehle plan dikhao, sirf jo missing hai woh badlo, result check karo, aur fail ho to undo karo.</p>

<h3>Analogy: darzi ki pins</h3>
<p>Achha darzi pehle kapda nahi kaatta. Woh kapde par pins lagata hai (<b>dry run</b>), sirf wahin siti hai jahan kapda abhi fit nahi (<b>plan</b>), pehen kar dekhta hai (<b>verify</b>), aur galat ho to taanke kholta hai (<b>roll back</b>). Pins sasti hain; kaat sasta nahi hota.</p>

<h3>push.py</h3>
<pre class="code">"""push.py - preview or push a baseline to one router, verify it and roll back on failure."""
from toolkit.collect import clean, connect


def inverse(line):
    return line[3:] if line.startswith("no ") else "no " + line


def plan(running, wanted):
    return [ln for ln in wanted if ln not in running]


def push(ip, wanted, apply=False):
    """Returns (todo, status): 'nothing to do', 'dry-run', 'ok' or 'rolled_back'."""
    conn = connect(ip)
    try:
        before = clean(conn.send_command("show running-config"))
        todo = plan(before, wanted)
        if not todo:
            return todo, "nothing to do"
        if not apply:
            return todo, "dry-run"
        out = conn.send_config_set(todo)
        after = clean(conn.send_command("show running-config"))
        if "%" in out or any(ln not in after for ln in todo):
            conn.send_config_set([inverse(ln) for ln in reversed(todo)])
            return todo, "rolled_back"
        return todo, "ok"
    finally:
        conn.disconnect()</pre>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Config padho, missing lines ka plan banao; nothing to do, ya dry run, ya apply phir verify; ok ya roll back">
<rect x="10" y="50" width="100" height="50" rx="8" fill="#bae6fd"/><text x="60" y="72" text-anchor="middle" class="svg-ink" font-size="12">1 read</text><text x="60" y="89" text-anchor="middle" class="svg-muted" font-size="10">running config</text>
<rect x="140" y="50" width="100" height="50" rx="8" fill="#fde68a"/><text x="190" y="72" text-anchor="middle" class="svg-ink" font-size="12">2 plan</text><text x="190" y="89" text-anchor="middle" class="svg-muted" font-size="10">missing lines</text>
<rect x="270" y="10" width="140" height="44" rx="8" fill="#e2e8f0"/><text x="340" y="30" text-anchor="middle" class="svg-ink" font-size="11">nothing to do / dry-run</text><text x="340" y="45" text-anchor="middle" class="svg-muted" font-size="10">yahin ruko</text>
<rect x="270" y="96" width="100" height="44" rx="8" fill="#ddd6fe"/><text x="320" y="116" text-anchor="middle" class="svg-ink" font-size="12">3 apply</text><text x="320" y="131" text-anchor="middle" class="svg-muted" font-size="10">sirf --apply</text>
<rect x="400" y="96" width="100" height="44" rx="8" fill="#fed7aa"/><text x="450" y="116" text-anchor="middle" class="svg-ink" font-size="12">4 verify</text><text x="450" y="131" text-anchor="middle" class="svg-muted" font-size="10">dobara padho</text>
<rect x="530" y="60" width="100" height="32" rx="8" fill="#bbf7d0"/><text x="580" y="81" text-anchor="middle" class="svg-ink" font-size="12">ok</text>
<rect x="530" y="108" width="100" height="32" rx="8" fill="#fecaca"/><text x="580" y="129" text-anchor="middle" class="svg-ink" font-size="12">rolled_back</text>
<line x1="110" y1="75" x2="140" y2="75" stroke="#64748b" stroke-width="2"/><line x1="240" y1="65" x2="270" y2="40" stroke="#64748b" stroke-width="2"/><line x1="240" y1="85" x2="270" y2="115" stroke="#64748b" stroke-width="2"/><line x1="370" y1="118" x2="400" y2="118" stroke="#64748b" stroke-width="2"/><line x1="500" y1="108" x2="530" y2="80" stroke="#64748b" stroke-width="2"/><line x1="500" y1="124" x2="530" y2="124" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Router ko sirf daayein taraf ka raasta chhuta hai.</p></div>

<h3>Code padhna</h3>
<ul>
<li><b>push.py, collect.py se import karta hai</b> (<code>clean</code>, <code>connect</code>). Dependencies ek hi taraf jaati hain: push collect ko jaanta hai, collect push ko kabhi nahi.</li>
<li><code>plan()</code> sirf woh wanted lines rakhta hai jo running config mein <i>pehle se nahi</i> hain. Doosra push kuch missing nahi paata, isliye push <b>idempotent</b> hai.</li>
<li><code>inverse()</code> <code>ntp server X</code> ko <code>no ntp server X</code> banata hai aur ulta bhi. Roll back inverses ko <i>ulte</i> order mein bhejta hai.</li>
<li>Failure ke do nishaan hain: router ke jawab mein <code>%</code> (IOS error messages isi se shuru hote hain), ya config dobara padhne par wanted line missing.</li>
<li>Return values: <code>nothing to do</code>, <code>dry-run</code>, <code>ok</code>, <code>rolled_back</code>. Front desk inhe print karta hai.</li>
</ul>
<pre class="code">def cmd_push(args):
    name, path = args.args
    ip = dict(devices())[name]
    wanted = [ln.strip() for ln in open(path) if ln.strip()]
    todo, state = push.push(ip, wanted, apply=args.apply)
    print(f"{name}: {len(todo)} lines to add, {state}")
    for ln in todo:
        print("  +", ln)</pre>
<p><code>dict(devices())</code> <code>(name, ip)</code> jodiyon ki list ko lookup table bana deta hai. Baseline file mein har line ek command hai. <code>--apply</code> ke bina tool sirf preview kar sakta hai.</p>

<h3>R2 par runs</h3>
<pre class="out">AUTO01$ cat extra.cfg
ntp server 10.99.0.50
logging host 10.99.0.51
AUTO01$ python3 nettool.py push R2 extra.cfg
<span class="hl">R2: 2 lines to add, dry-run</span>
  + ntp server 10.99.0.50
  + logging host 10.99.0.51
AUTO01$ python3 nettool.py push R2 extra.cfg --apply
<span class="hl">R2: 2 lines to add, ok</span>
  + ntp server 10.99.0.50
  + logging host 10.99.0.51
AUTO01$ python3 nettool.py push R2 extra.cfg --apply
<span class="hl">R2: 0 lines to add, nothing to do</span></pre>
<p>Run 1 preview karta hai, run 2 router badalta hai aur verify karta hai, run 3 saabit karta hai ki push dobara chalana safe hai. Ab aisi baseline jisme router ki reject ki hui line hai (taaza R2 par test, ntp lines push hone se pehle):</p>
<pre class="out">AUTO01$ printf 'ntp server 10.99.0.50\\nbogus command here\\n' &gt; mixed.cfg
AUTO01$ python3 nettool.py push R2 mixed.cfg --apply
<span class="hl">R2: 2 lines to add, rolled_back</span>
  + ntp server 10.99.0.50
  + bogus command here</pre>
<p>Router ne kharab line ka jawab <code>%</code> error se diya, isliye tool ne inverse commands ulte order mein bheje. Achhi <code>ntp</code> line bhi wapas hata di gayi: baseline <b>all or nothing</b> hai. Uske baad R2 ka naya backup golden ke bilkul barabar hai, yaani roll back ne koi nishaan nahi chhoda.</p>
<pre class="out">AUTO01$ python3 nettool.py push R9 extra.cfg
Traceback (most recent call last):
  File "nettool.py", line 125, in &lt;module&gt;
    main()
  File "nettool.py", line 122, in main
    ACTIONS[args.action](args)
  File "nettool.py", line 92, in cmd_push
    ip = dict(devices())[name]
<span class="hl">KeyError: 'R9'</span></pre>
<p>Anjaan router naam lookup se <code>KeyError</code> deta hai. Yeh kisi router ko chhune se pehle ruk jata hai, jo safe hai, par dost tool "R9 inventory mein nahi hai" print karta.</p>

<div class="eg"><p><b>Worked example.</b> R2 par successful push ke baad aaj raat ke backup mein do nayi lines hain, isliye <code>drift</code> <code>R2: DRIFT (2 lines)</code> report karta hai. Yeh sahi aur kaam ka hai: change approved tha, to engineer <code>backup</code> aur <code>golden</code> chalata hai, aur drift gayab ho jata hai. Push aur drift saath kaam karte hain: push change karta hai, drift saabit karta hai, golden record karta hai.</p></div>

<div class="note"><p><b>Reference code.</b> <code>inverse()</code> <code>ntp server</code> ya <code>logging host</code> jaisi simple lines ke liye chalta hai. Jo line koi value <i>replace</i> karti hai, jaise <code>ip address</code>, use <code>no</code> jodkar undo nahi kar sakte; unke liye asli tool saved backup restore karta hai (py-safepush). Kai routers par push ek-ek karke, ya chhote batches mein, hona chahiye, kabhi sab jagah ek saath nahi.</p></div>

<div class="warn"><p><b>Common mistakes.</b> <code>--apply</code> ko default bana dena. Verify step skip karna. Poore estate par ek saath push karna. Maan lena ki roll back fail nahi ho sakta: aakhri state hamesha padho. Baseline file mein password rakhna.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Idempotent" matlab wahi push do baar chalane ka result ek baar chalane jaisa hi rehta hai. Saboot upar ka teesra run hai: <code>nothing to do</code>.</p></div>

<div class="scn"><h4>Shukravar ka typo</h4><p>Ek engineer ne branch router par logging baseline push kiya jisme <code>loging host</code> galat likha tha. Router ne <code>%</code> invalid-input message se jawab diya, tool ne jo lines bhej di thi unhe undo kar diya, aur branch ko pata bhi nahi chala. Somvaar ko engineer ne file theek ki aur dry run ne saaf plan dikhaya.</p><p><b>Lesson:</b> pehle preview, baad mein verify, aur jo confirm nahi hota use tool ko undo karne do.</p></div>

<div class="iv"><p class="q">"Automated configuration push ko safe kaise banate ho?"</p><p>Tool ko default dry run rakhta hoon, sirf missing lines compute karta hoon, ek device par apply karta hoon, verify ke liye config wapas padhta hoon, aur agar device ne error print kiya ya koi line missing hai to automatically roll back karta hoon. Pehle backup bhi leta hoon aur push ko idempotent rakhta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Push akela action hai jo network badalta hai, isliye use safety net chahiye.</li>
<li><code>plan()</code> sirf missing lines bhejta hai, jisse push idempotent hota hai.</li>
<li>Config wapas padhkar verify karo; jawab mein <code>%</code> ya missing line matlab failure.</li>
<li>Ulte order mein <code>inverse()</code> simple additions ko undo karta hai.</li>
<li>Approved push ke baad backup aur golden chalane tak drift change dikhata hai.</li>
</ul></div>
`}};export{e as default};